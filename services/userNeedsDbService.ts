/**
 * Сервис интеграции с базой данных PostgreSQL "user_needs" через HTTP Proxy API / MCP.
 * Предназначен для сохранения исходного ТЗ (технического задания) при создании нового бота
 * вместе с автоматической классификацией по справочнику public.request_categories.
 */

import { sendMetrikaGoal } from './metrikaService';
import { routerService } from './ProTalkRouterService';
import {
  classifyRequestText,
  isValidCategoryCode,
  type ClassificationResult,
  type ClassifyRequestOptions,
  type RequestCategoryCode,
} from './requestClassifierService';

export interface FirstRequestRecord {
  user_login: string;
  user_email?: string;
  query: string;
  bot_id?: number | null;
  bot_name?: string | null;
  bot_token?: string | null;
  metadata?: Record<string, any>;
}

export interface RecordFirstRequestOptions {
  classifier?: (queryText: string, options?: ClassifyRequestOptions) => Promise<ClassificationResult>;
  authToken?: string | null;
  classifierModel?: string;
  skipLocalCache?: boolean;
  disableAutoRetryTimer?: boolean;
  fetchImpl?: typeof fetch;
}

export interface RecordFirstRequestResult {
  inserted: boolean;
  duplicate: boolean;
  id: number | null;
  categoryId: number | null;
  categoryCode: RequestCategoryCode | null;
  queuedForReclassification: boolean;
  error?: string;
}

export interface PendingClassificationItem {
  id: number;
  query: string;
  bot_id: number | null;
  attempts: number;
  nextRetryAt: number;
  createdAt: number;
}

export const USER_NEEDS_DB_CONFIG = {
  proxyUrl: 'https://db.pro-talk.ru/api/proxy/query',
  userId: 'eyJydWlkIjoicmVjWnlQTWY2QW9iVmg2dWgiLCJlbWFpbCI6InN1cHBvcnRAcHJvLXRhbGsucnUifQ',
  database: 'user_needs',
};

const PENDING_QUEUE_STORAGE_KEY = 'user_needs_pending_classification_queue';
const RETRY_DELAYS_MS = [30_000, 60_000, 180_000, 600_000];

// Набор для мгновенной блокировки повторных параллельных вызовов в памяти
const inFlightBotRequests = new Set<string | number>();

// Кэш справочника public.request_categories: code -> numeric id
const categoryIdCache = new Map<RequestCategoryCode, number>();

// Очередь повторной классификации в памяти (дублируется в localStorage в браузере)
let pendingClassificationQueue: PendingClassificationItem[] = [];
let pendingQueueLoadedFromStorage = false;
let retryTimerHandle: ReturnType<typeof setTimeout> | null = null;
let isProcessingQueue = false;

interface DbQueryResponse<T = any> {
  rows?: T[];
  rowCount?: number;
  error?: string;
}

/**
 * Выполняет параметризованный SQL-запрос к базе данных user_needs через существующий HTTP Proxy.
 */
export async function executeUserNeedsQuery<T = any>(
  query: string,
  params: any[] = [],
  fetchImpl?: typeof fetch
): Promise<{ ok: boolean; rows: T[]; rowCount: number; error?: string; status?: number }> {
  const fetchFn = fetchImpl || fetch;
  try {
    const response = await fetchFn(USER_NEEDS_DB_CONFIG.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': USER_NEEDS_DB_CONFIG.userId,
      },
      body: JSON.stringify({
        database: USER_NEEDS_DB_CONFIG.database,
        query,
        params,
        safeMode: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        ok: false,
        rows: [],
        rowCount: 0,
        status: response.status,
        error: errText || `HTTP ${response.status}`,
      };
    }

    const resData: DbQueryResponse<T> = await response.json();
    const rows = Array.isArray(resData?.rows) ? resData.rows : [];
    return {
      ok: true,
      rows,
      rowCount: typeof resData?.rowCount === 'number' ? resData.rowCount : rows.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      rows: [],
      rowCount: 0,
      error: error?.message || String(error),
    };
  }
}

function safeGetLocalStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('[UserNeeds DB] Не удалось сохранить данные в localStorage:', e);
  }
}

function loadPendingQueue(): PendingClassificationItem[] {
  if (pendingQueueLoadedFromStorage) {
    return pendingClassificationQueue;
  }
  pendingQueueLoadedFromStorage = true;

  const raw = safeGetLocalStorage(PENDING_QUEUE_STORAGE_KEY);
  if (!raw) {
    return pendingClassificationQueue;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      pendingClassificationQueue = parsed.filter(
        (item: any) =>
          item &&
          typeof item.id === 'number' &&
          typeof item.query === 'string' &&
          item.query.trim().length > 0
      );
    }
  } catch {
    pendingClassificationQueue = [];
  }
  return pendingClassificationQueue;
}

function persistPendingQueue(): void {
  safeSetLocalStorage(PENDING_QUEUE_STORAGE_KEY, JSON.stringify(pendingClassificationQueue));
}

/**
 * Возвращает копию текущей очереди запросов, ожидающих повторной классификации.
 */
export function getPendingClassificationQueue(): PendingClassificationItem[] {
  return [...loadPendingQueue()];
}

/**
 * Сбрасывает кэш справочника категорий (полезно для тестов).
 */
export function clearCategoryCache(): void {
  categoryIdCache.clear();
}

/**
 * Очищает локальную очередь повторной классификации и таймер (полезно для тестов).
 */
export function clearPendingClassificationQueue(): void {
  pendingClassificationQueue = [];
  pendingQueueLoadedFromStorage = true;
  if (retryTimerHandle) {
    clearTimeout(retryTimerHandle);
    retryTimerHandle = null;
  }
  persistPendingQueue();
}

/**
 * Проверяет, было ли уже зафиксировано ТЗ для данного бота
 */
export function hasRecordedFirstRequest(botId: number | string): boolean {
  if (!botId) return false;
  return inFlightBotRequests.has(botId) || safeGetLocalStorage(`first_request_logged_${botId}`) === 'true';
}

/**
 * Помечает факт фиксации ТЗ для данного бота
 */
export function markFirstRequestRecorded(botId: number | string): void {
  if (!botId) return;
  safeSetLocalStorage(`first_request_logged_${botId}`, 'true');
}

/**
 * Определяет логин и email текущего пользователя
 */
export function resolveUserLoginAndEmail(user?: { email?: string; ruid?: string } | null): {
  user_login: string;
  user_email?: string;
} {
  let email = user?.email;
  if (!email || email === 'external_auth_user') {
    try {
      const varsJson = safeGetLocalStorage('userVariables');
      if (varsJson) {
        const parsed = JSON.parse(varsJson);
        if (parsed.user_email) {
          email = parsed.user_email;
        }
      }
    } catch (e) {
      console.warn('[UserNeeds DB] Ошибка чтения userVariables из localStorage:', e);
    }
  }

  const login =
    email && email !== 'external_auth_user'
      ? email
      : user?.ruid || user?.email || 'unknown_user';

  return {
    user_login: login,
    user_email: email && email !== 'external_auth_user' ? email : undefined,
  };
}

/**
 * Получает числовой id категории из существующего справочника public.request_categories по её code.
 * Возвращает null, если код не входит в разрешённый список или отсутствует в справочнике.
 */
export async function resolveCategoryIdByCode(
  code: unknown,
  options?: { bypassCache?: boolean; fetchImpl?: typeof fetch }
): Promise<number | null> {
  if (!isValidCategoryCode(code)) {
    return null;
  }

  if (!options?.bypassCache && categoryIdCache.has(code)) {
    return categoryIdCache.get(code)!;
  }

  const result = await executeUserNeedsQuery<{ id: number }>(
    `SELECT id
     FROM public.request_categories
     WHERE code = $1
     LIMIT 1;`,
    [code],
    options?.fetchImpl
  );

  if (!result.ok || result.rows.length === 0) {
    return null;
  }

  const numericId = Number(result.rows[0].id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  categoryIdCache.set(code, numericId);
  return numericId;
}

function resolveClassifierAuthToken(record?: Pick<FirstRequestRecord, 'bot_id' | 'bot_token'>, explicitAuthToken?: string | null): string | null {
  if (explicitAuthToken && explicitAuthToken.trim()) {
    return explicitAuthToken.trim();
  }
  if (record?.bot_id && record?.bot_token) {
    return `${record.bot_id}_${record.bot_token}`;
  }
  return routerService.getAuthToken();
}

/**
 * Ставит сохранённый с пустым category_id запрос в очередь на повторную классификацию.
 */
export function enqueuePendingClassification(
  id: number,
  query: string,
  botId: number | null = null,
  disableAutoRetryTimer: boolean = false
): void {
  const queue = loadPendingQueue();
  if (queue.some((item) => item.id === id)) {
    return;
  }

  const now = Date.now();
  queue.push({
    id,
    query,
    bot_id: botId,
    attempts: 0,
    nextRetryAt: now + RETRY_DELAYS_MS[0],
    createdAt: now,
  });
  persistPendingQueue();

  console.warn(
    `[UserNeeds DB] ⏳ Запрос #${id} сохранён с category_id = NULL («Ожидает классификации») и поставлен на повторную классификацию.`
  );

  if (!disableAutoRetryTimer) {
    scheduleNextPendingRetry();
  }
}

function scheduleNextPendingRetry(): void {
  if (retryTimerHandle) {
    clearTimeout(retryTimerHandle);
    retryTimerHandle = null;
  }

  const queue = loadPendingQueue();
  if (queue.length === 0) {
    return;
  }

  const earliest = Math.min(...queue.map((item) => item.nextRetryAt));
  const delayMs = Math.max(1_000, earliest - Date.now());

  retryTimerHandle = setTimeout(() => {
    retryTimerHandle = null;
    void processPendingClassifications();
  }, delayMs);
}

/**
 * Обрабатывает очередь запросов с пустым category_id («Ожидает классификации»).
 * Обновляет ТОЛЬКО записи, у которых category_id IS NULL — ранее размеченные запросы никогда не пересчитываются.
 */
export async function processPendingClassifications(
  options: {
    force?: boolean;
    syncFromDb?: boolean;
    maxDbBatch?: number;
    classifier?: (queryText: string, opts?: ClassifyRequestOptions) => Promise<ClassificationResult>;
    authToken?: string | null;
    classifierModel?: string;
    disableAutoRetryTimer?: boolean;
    fetchImpl?: typeof fetch;
  } = {}
): Promise<{ processed: number; updated: number; remaining: number }> {
  if (isProcessingQueue) {
    return { processed: 0, updated: 0, remaining: loadPendingQueue().length };
  }

  isProcessingQueue = true;
  let processed = 0;
  let updated = 0;

  try {
    const queue = loadPendingQueue();

    // При необходимости догружаем из БД только неразмеченные записи (category_id IS NULL)
    if (options.syncFromDb) {
      const limit = options.maxDbBatch ?? 10;
      const dbPending = await executeUserNeedsQuery<{ id: number; query: string; bot_id: number | null }>(
        `SELECT id, query, bot_id
         FROM public.first_requests
         WHERE category_id IS NULL
         ORDER BY id ASC
         LIMIT $1;`,
        [limit],
        options.fetchImpl
      );
      if (dbPending.ok) {
        const now = Date.now();
        for (const row of dbPending.rows) {
          const rowId = Number(row.id);
          if (Number.isInteger(rowId) && row.query?.trim() && !queue.some((q) => q.id === rowId)) {
            queue.push({
              id: rowId,
              query: row.query.trim(),
              bot_id: row.bot_id ?? null,
              attempts: 0,
              nextRetryAt: now,
              createdAt: now,
            });
          }
        }
        persistPendingQueue();
      }
    }

    const classifierFn = options.classifier || classifyRequestText;
    const authToken = resolveClassifierAuthToken(undefined, options.authToken);
    const now = Date.now();
    const nextQueue: PendingClassificationItem[] = [];

    for (const item of queue) {
      if (!options.force && item.nextRetryAt > now) {
        nextQueue.push(item);
        continue;
      }

      processed++;

      // Если нет authToken и не передан кастомный классификатор — откладываем до появления токена
      if (!options.classifier && !authToken) {
        const delay = RETRY_DELAYS_MS[Math.min(item.attempts, RETRY_DELAYS_MS.length - 1)];
        nextQueue.push({
          ...item,
          nextRetryAt: Date.now() + delay,
        });
        continue;
      }

      const classification = await classifierFn(item.query, {
        authToken,
        model: options.classifierModel,
        fetchImpl: options.fetchImpl,
      });

      let categoryId: number | null = null;
      if (classification.ok && classification.categoryCode && isValidCategoryCode(classification.categoryCode)) {
        categoryId = await resolveCategoryIdByCode(classification.categoryCode, {
          fetchImpl: options.fetchImpl,
        });
      }

      if (categoryId !== null) {
        // Обновляем строго при условии category_id IS NULL — ранее размеченные запросы не трогаем
        const updateRes = await executeUserNeedsQuery<{
          id: number;
          category_id: number;
        }>(
          `UPDATE public.first_requests
           SET category_id = $1
           WHERE id = $2 AND category_id IS NULL
           RETURNING id, category_id;`,
          [categoryId, item.id],
          options.fetchImpl
        );

        if (updateRes.ok) {
          if (updateRes.rows.length > 0) {
            updated++;
            // Синхронизируем связанные события в analytics_events напрямую через JOIN в PostgreSQL
            // (сохраняет микросекундную точность created_at, без потери при сериализации в JS)
            await executeUserNeedsQuery(
              `UPDATE public.analytics_events ae
               SET event_value = fr.category_id::text
               FROM public.first_requests fr
               WHERE fr.id = $1
                 AND ae.created_at = fr.created_at
                 AND ae.event_type = 'user_needs'
                 AND ae.event_value IS NULL
                 AND fr.category_id IS NOT NULL;`,
              [item.id],
              options.fetchImpl
            );
            await executeUserNeedsQuery(
              `UPDATE public.analytics_events ae
               SET event_value = 'Bot: ' || COALESCE(fr.bot_name, '') || ' | Category: ' || COALESCE(rc.name, 'unknown')
               FROM public.first_requests fr
               JOIN public.request_categories rc ON rc.id = fr.category_id
               WHERE fr.id = $1
                 AND ae.created_at = fr.created_at
                 AND ae.event_type = 'new_bot_request'
                 AND ae.event_value LIKE '%Category: unknown';`,
              [item.id],
              options.fetchImpl
            );
            console.log(
              `[UserNeeds DB] ✅ Повторная классификация: запросу #${item.id} присвоена категория "${classification.categoryCode}" (category_id=${categoryId}).`
            );
          }
          // Удаляем из очереди (либо обновили, либо уже было размечено ранее)
          continue;
        }
      }

      // Если классификатор всё ещё недоступен или обновление не удалось — оставляем в очереди с бэкоффом
      const nextAttempts = item.attempts + 1;
      const delay = RETRY_DELAYS_MS[Math.min(nextAttempts, RETRY_DELAYS_MS.length - 1)];
      nextQueue.push({
        ...item,
        attempts: nextAttempts,
        nextRetryAt: Date.now() + delay,
      });
    }

    pendingClassificationQueue = nextQueue;
    persistPendingQueue();

    if (!options.disableAutoRetryTimer && pendingClassificationQueue.length > 0) {
      scheduleNextPendingRetry();
    }

    return {
      processed,
      updated,
      remaining: pendingClassificationQueue.length,
    };
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * Сохраняет сформулированное техническое задание (ТЗ) создания нового бота в таблицу public.first_requests
 * базы данных user_needs вместе с category_id (полученным из public.request_categories по code) одной операцией.
 * Возвращает подробный результат операции.
 */
export async function recordFirstRequestDetailed(
  record: FirstRequestRecord,
  options: RecordFirstRequestOptions = {}
): Promise<RecordFirstRequestResult> {
  const queryText = record.query?.trim();
  if (!queryText) {
    return {
      inserted: false,
      duplicate: false,
      id: null,
      categoryId: null,
      categoryCode: null,
      queuedForReclassification: false,
      error: 'empty_query',
    };
  }

  const botId = record.bot_id ?? null;

  // Быстрая локальная проверка дублей и блокировка параллельных вызовов для одного bot_id
  if (botId !== null) {
    if (inFlightBotRequests.has(botId)) {
      return {
        inserted: false,
        duplicate: true,
        id: null,
        categoryId: null,
        categoryCode: null,
        queuedForReclassification: false,
      };
    }
    if (!options.skipLocalCache && safeGetLocalStorage(`first_request_logged_${botId}`) === 'true') {
      return {
        inserted: false,
        duplicate: true,
        id: null,
        categoryId: null,
        categoryCode: null,
        queuedForReclassification: false,
      };
    }
    inFlightBotRequests.add(botId);
  }

  const userLogin = record.user_login || record.user_email || 'unknown_user';
  const userEmail = record.user_email || (record.user_login?.includes('@') ? record.user_login : null);
  const metadataJson = JSON.stringify(record.metadata || {});

  try {
    // 1. Проверка дубля в БД по bot_id ДО запуска классификатора:
    // повторная доставка события не должна создавать вторую запись или менять уже присвоенную категорию.
    if (botId !== null) {
      const existing = await executeUserNeedsQuery<{ id: number; category_id: number | null }>(
        `SELECT id, category_id
         FROM public.first_requests
         WHERE bot_id = $1
         LIMIT 1;`,
        [botId],
        options.fetchImpl
      );

      if (existing.ok && existing.rows.length > 0) {
        markFirstRequestRecorded(botId);
        return {
          inserted: false,
          duplicate: true,
          id: Number(existing.rows[0].id),
          categoryId: existing.rows[0].category_id !== null ? Number(existing.rows[0].category_id) : null,
          categoryCode: null,
          queuedForReclassification: false,
        };
      }
    }

    // 2. Определение категории по смыслу запроса (передаём ТОЛЬКО текст запроса — без логина и email)
    const classifierFn = options.classifier || classifyRequestText;
    const authToken = resolveClassifierAuthToken(record, options.authToken);

    let categoryCode: RequestCategoryCode | null = null;
    let categoryId: number | null = null;
    let needsReclassification = false;

    try {
      const classification = await classifierFn(queryText, {
        authToken,
        model: options.classifierModel,
        fetchImpl: options.fetchImpl,
      });

      if (classification.ok && classification.categoryCode && isValidCategoryCode(classification.categoryCode)) {
        const resolvedId = await resolveCategoryIdByCode(classification.categoryCode, {
          fetchImpl: options.fetchImpl,
        });

        if (resolvedId !== null) {
          categoryCode = classification.categoryCode;
          categoryId = resolvedId;
        } else {
          // Код не найден в справочнике public.request_categories -> пустой category_id + повторная классификация
          needsReclassification = true;
          console.warn(
            `[UserNeeds DB] Код категории "${classification.categoryCode}" не найден в public.request_categories. Сохраняем с category_id = NULL.`
          );
        }
      } else {
        // Классификатор недоступен или вернул некорректный ответ -> пустой category_id + повторная классификация
        needsReclassification = true;
        console.warn(
          `[UserNeeds DB] Классификатор не вернул валидный код (${classification.reason || 'unknown'}). Сохраняем с category_id = NULL.`
        );
      }
    } catch (classifyError) {
      needsReclassification = true;
      console.warn('[UserNeeds DB] Исключение при классификации запроса. Сохраняем с category_id = NULL:', classifyError);
    }

    // 3. Сохраняем запрос и category_id одной операцией.
    // Поле id формирует PostgreSQL (GENERATED ALWAYS AS IDENTITY), не передаём его при вставке.
    // Защита от гонок/дублей по bot_id через частичный уникальный индекс (bot_id) WHERE bot_id IS NOT NULL.
    const insertResult = await executeUserNeedsQuery<{ id: number; category_id: number | null }>(
      `INSERT INTO public.first_requests (user_login, user_email, query, bot_id, bot_name, metadata, category_id)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       ON CONFLICT (bot_id) WHERE bot_id IS NOT NULL DO NOTHING
       RETURNING id, category_id;`,
      [
        userLogin,
        userEmail,
        queryText,
        botId,
        record.bot_name ?? null,
        metadataJson,
        categoryId,
      ],
      options.fetchImpl
    );

    if (!insertResult.ok) {
      console.warn(
        `[UserNeeds DB] Ошибка HTTP ${insertResult.status || ''} при сохранении ТЗ бота:`,
        insertResult.error
      );
      return {
        inserted: false,
        duplicate: false,
        id: null,
        categoryId: null,
        categoryCode: null,
        queuedForReclassification: false,
        error: insertResult.error,
      };
    }

    if (insertResult.rows.length > 0) {
      const insertedId = Number(insertResult.rows[0].id);
      const savedCategoryId =
        insertResult.rows[0].category_id !== null ? Number(insertResult.rows[0].category_id) : null;

      if (botId !== null) {
        markFirstRequestRecorded(botId);
      }

      sendMetrikaGoal('app_action_completed');
      console.log(
        `[UserNeeds DB] ✅ ТЗ #${insertedId} успешно сохранено в БД user_needs для пользователя "${userLogin}" (Бот: ${botId || 'new'}, category_id: ${savedCategoryId ?? 'NULL'})`
      );

      let queuedForReclassification = false;
      if (needsReclassification && savedCategoryId === null) {
        enqueuePendingClassification(insertedId, queryText, botId, options.disableAutoRetryTimer);
        queuedForReclassification = true;
      }

      return {
        inserted: true,
        duplicate: false,
        id: insertedId,
        categoryId: savedCategoryId,
        categoryCode: savedCategoryId !== null ? categoryCode : null,
        queuedForReclassification,
      };
    }

    // ON CONFLICT DO NOTHING сработал при параллельной доставке того же bot_id
    if (botId !== null) {
      markFirstRequestRecorded(botId);
    }
    return {
      inserted: false,
      duplicate: true,
      id: null,
      categoryId: null,
      categoryCode: null,
      queuedForReclassification: false,
    };
  } catch (error: any) {
    console.warn('[UserNeeds DB] Ошибка при сохранении ТЗ бота:', error);
    return {
      inserted: false,
      duplicate: false,
      id: null,
      categoryId: null,
      categoryCode: null,
      queuedForReclassification: false,
      error: error?.message || String(error),
    };
  } finally {
    if (botId !== null) {
      inFlightBotRequests.delete(botId);
    }
  }
}

/**
 * Сохраняет сформулированное техническое задание (ТЗ) создания нового бота в таблицу first_requests базы данных user_needs.
 * Сохраняется ровно один раз для каждого нового бота.
 */
export async function recordFirstRequest(
  record: FirstRequestRecord,
  options?: RecordFirstRequestOptions
): Promise<boolean> {
  const result = await recordFirstRequestDetailed(record, options);
  return result.inserted;
}

// Алиас для обратной совместимости
export const recordUserRequest = recordFirstRequest;
