/**
 * Надежный парсер и восстановитель поврежденного JSON, возвращаемого большими языковыми моделями (LLM).
 * Обрабатывает:
 * - Неэкранированные двойные кавычки внутри строковых значений (например: "role": "не говори "привет"")
 * - Литеральные переводы строк (\n, \r, \t) внутри строковых значений
 * - Неэкранированные бэкслеши (\)
 * - Хвостовые запятые (trailing commas)
 * - Обрезанный JSON (незакрытые кавычки, скобки и фигурные скобки)
 * - Markdown-обертки (```json ... ```)
 */

export function safeParseJson<T = any>(input: any): T {
  if (input === null || input === undefined) {
    return {} as T;
  }

  // Если аргументы уже переданы как распарсенный объект
  if (typeof input === 'object') {
    return input as T;
  }

  if (typeof input !== 'string') {
    try {
      return JSON.parse(String(input));
    } catch {
      return {} as T;
    }
  }

  let text = input.trim();
  if (!text) {
    return {} as T;
  }

  // Очистка от markdown блоков кодов
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  }

  // 1. Быстрый стандартный парсинг
  try {
    return JSON.parse(text);
  } catch (err1) {
    // Продолжаем к процедурам восстановления
  }

  // 2. Исправление управляющих символов и неэкранированных переводов строк
  const pass1 = fixControlCharsAndNewlines(text);
  try {
    return JSON.parse(pass1);
  } catch (err2) {
    // Продолжаем
  }

  // 3. Умное экранирование внутренних кавычек
  const pass2 = repairQuotes(pass1);
  try {
    return JSON.parse(pass2);
  } catch (err3) {
    // Продолжаем
  }

  // 4. Попытка закрытия обрезанного JSON (truncated JSON)
  const pass3 = closeOpenStructures(pass2);
  try {
    return JSON.parse(pass3);
  } catch (err4) {
    // Продолжаем
  }

  // 5. Извлечение ключевых полей регулярными выражениями (для bot_settings, role и т.д.)
  const partial = extractKnownFields(text);
  if (partial && Object.keys(partial).length > 0) {
    console.warn('safeParseJson recovered partial object:', partial);
    return partial as T;
  }

  // 6. Крайний fallback — сохраняем сырую строку, чтобы не падать
  console.error('safeParseJson could not fully parse JSON:', text.substring(0, 300));
  return {
    _raw: text,
    bot_settings: {
      role: text,
    },
  } as T;
}

/**
 * Заменяет литеральные переводы строк и табуляции внутри строк на безопасные escape-последовательности
 */
function fixControlCharsAndNewlines(str: string): string {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (ch === '"' && !isEscaped) {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        isEscaped = !isEscaped;
        result += ch;
        continue;
      }

      if (isEscaped) {
        isEscaped = false;
        result += ch;
        continue;
      }

      // Литеральные переводы строк и табуляции внутри строковых значений
      if (ch === '\n') {
        result += '\\n';
        continue;
      }
      if (ch === '\r') {
        result += '\\r';
        continue;
      }
      if (ch === '\t') {
        result += '\\t';
        continue;
      }
      // Управляющие символы ASCII
      const code = ch.charCodeAt(0);
      if (code < 32) {
        result += '\\u' + ('0000' + code.toString(16)).slice(-4);
        continue;
      }
    }

    isEscaped = false;
    result += ch;
  }

  return result;
}

/**
 * Ремонтирует кавычки внутри строковых литералов:
 * Если двойная кавычка стоит внутри значения и после нее не следует разделитель JSON (, : } ]),
 * то она экранируется: \"
 */
function repairQuotes(str: string): string {
  // Убираем хвостовые запятые перед закрывающими скобками
  let cleaned = str.replace(/,\s*([}\]])/g, '$1');

  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (ch === '\\') {
      isEscaped = !isEscaped;
      result += ch;
      continue;
    }

    if (ch === '"' && !isEscaped) {
      if (!inString) {
        inString = true;
        result += ch;
      } else {
        // Мы внутри строки и встретили кавычку ".
        // Проверяем: это настоящая закрывающая кавычка свойства/значения JSON, или внутренняя цитата?
        // Смотрим следующие непробельные символы
        let j = i + 1;
        while (j < cleaned.length && /\s/.test(cleaned[j])) {
          j++;
        }
        const nextChar = cleaned[j];

        // Настоящая закрывающая кавычка обычно сопровождается одним из: : , } ] или концом строки
        const isTrueCloser =
          j >= cleaned.length ||
          nextChar === ':' ||
          nextChar === ',' ||
          nextChar === '}' ||
          nextChar === ']' ||
          nextChar === undefined;

        if (isTrueCloser) {
          inString = false;
          result += ch;
        } else {
          // Это внутренняя кавычка в тексте! Экранируем её
          result += '\\"';
        }
      }
      continue;
    }

    isEscaped = false;
    result += ch;
  }

  return result;
}

/**
 * Закрывает открытые строковые литералы, массивы и объекты, если JSON оборван
 */
function closeOpenStructures(str: string): string {
  let inString = false;
  let isEscaped = false;
  const stack: ('{' | '[')[] = [];

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\') {
      isEscaped = !isEscaped;
      continue;
    }
    if (ch === '"' && !isEscaped) {
      inString = !inString;
      continue;
    }
    isEscaped = false;

    if (!inString) {
      if (ch === '{') stack.push('{');
      else if (ch === '[') stack.push('[');
      else if (ch === '}' && stack[stack.length - 1] === '{') stack.pop();
      else if (ch === ']' && stack[stack.length - 1] === '[') stack.pop();
    }
  }

  let closed = str;
  if (inString) {
    closed += '"';
  }

  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') closed += '}';
    else if (last === '[') closed += ']';
  }

  return closed;
}

/**
 * Резервное извлечение известных полей bot_settings
 */
function extractKnownFields(text: string): Record<string, any> {
  const result: Record<string, any> = {};

  // Пытаемся извлечь bot_settings или прямые поля
  const botSettingsMatch = text.match(/"bot_settings"\s*:\s*\{/);
  const targetScope = botSettingsMatch ? text.slice(botSettingsMatch.index!) : text;

  const extractString = (key: string): string | null => {
    // Ищем "key": "значение" (захватывая до следующего поля или запятой)
    const regex = new RegExp(`"${key}"\\s*:\\s*"([^]*?)(?:"\\s*,\\s*"|"\\s*\\}|"\\s*$)`);
    const match = targetScope.match(regex);
    if (match && match[1]) {
      return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    return null;
  };

  const role = extractString('role');
  const botName = extractString('bot_name');
  const botGender = extractString('bot_gender');
  const company = extractString('company');
  const botPosition = extractString('bot_position');
  const greeting = extractString('greeting');
  const aiModel = extractString('ai_model');

  const bot_settings: Record<string, any> = {};
  if (role) bot_settings.role = role;
  if (botName) bot_settings.bot_name = botName;
  if (botGender) bot_settings.bot_gender = botGender;
  if (company) bot_settings.company = company;
  if (botPosition) bot_settings.bot_position = botPosition;
  if (greeting) bot_settings.greeting = greeting;
  if (aiModel) bot_settings.ai_model = aiModel;

  if (Object.keys(bot_settings).length > 0) {
    if (botSettingsMatch) {
      result.bot_settings = bot_settings;
    } else {
      Object.assign(result, bot_settings);
    }
  }

  return result;
}
