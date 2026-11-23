import { proTalkKnowledgeBase } from './knowledge';

export interface ModelModalities {
  image: boolean;
  video: boolean;
  audio: boolean;
  doc: boolean;
}

let modalitiesCache: Record<string, ModelModalities> | null = null;

function buildModalitiesMap(): Record<string, ModelModalities> {
  const map: Record<string, ModelModalities> = {};

  // Парсим строки вида: 'Gemini Flash 3.8' — окно=1М, коэф=6, multimodal: ["image", "video", "audio", "doc"]
  const regex = /^[ \t]*'([^']+)'[^\n]*?multimodal:\s*(\[[^\]]*\])/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(proTalkKnowledgeBase)) !== null) {
    const rawName = match[1];
    try {
      const arr = JSON.parse(match[2]) as string[];
      const mods: ModelModalities = {
        image: arr.includes('image'),
        video: arr.includes('video'),
        audio: arr.includes('audio'),
        doc: arr.includes('doc'),
      };
      map[rawName] = mods;
      map[rawName.toLowerCase()] = mods;
    } catch {
      // ignore
    }
  }

  return map;
}

const cleanString = (s: string) => s.toLowerCase().replace(/[\s\-_()]/g, '');

/**
 * Возвращает поддерживаемые конкретной моделью форматы входящих файлов
 */
export function getModelSupportedModalities(modelName?: string | null): ModelModalities {
  if (!modelName) {
    return { image: false, video: false, audio: false, doc: false };
  }

  if (!modalitiesCache) {
    modalitiesCache = buildModalitiesMap();
  }

  const trimmed = modelName.trim();
  const lower = trimmed.toLowerCase();

  // 1. Точное совпадение
  if (modalitiesCache[trimmed]) return modalitiesCache[trimmed];
  if (modalitiesCache[lower]) return modalitiesCache[lower];

  // 2. Нормализованный поиск
  const targetClean = cleanString(trimmed);

  for (const [key, mods] of Object.entries(modalitiesCache)) {
    if (cleanString(key) === targetClean) {
      return mods;
    }
  }

  // 3. Частичное включение
  for (const [key, mods] of Object.entries(modalitiesCache)) {
    const kClean = cleanString(key);
    if (kClean.length > 3 && (targetClean.includes(kClean) || kClean.includes(targetClean))) {
      return mods;
    }
  }

  return { image: false, video: false, audio: false, doc: false };
}

/**
 * Определяет, какие типы входящих файлов требуются боту на основе текстового описания задачи
 */
export function detectRequiredModalities(text: string): { image: boolean; video: boolean; audio: boolean; doc: boolean } {
  if (!text) return { image: false, video: false, audio: false, doc: false };
  const lower = text.toLowerCase();

  const image = /(фото|изображен|картинк|сним|скан|чек|чертеж|планировк|рисунк|скриншот|image|photo|jpg|jpeg|png)/i.test(lower);
  const video = /(видео|ролик|клип|видеозапис|видеофайл|mp4|mov|video)/i.test(lower);
  const audio = /(аудио|голосовы|голосовое|голос|звук|диктофон|запис|распознай речь|слушать|mp3|wav|ogg|audio|voice)/i.test(lower);
  const doc = /(документ|файл|pdf|docx|doc|txt|таблиц|смет|договор|отчет|excel|xlsx|word|document)/i.test(lower);

  return { image, video, audio, doc };
}

/**
 * Подбирает наилучшую мультимодальную модель, удовлетворяющую требуемым форматам файлов
 */
export function getRecommendedMultimodalModel(requirements: { image?: boolean; video?: boolean; audio?: boolean; doc?: boolean }): string {
  const reqAudio = Boolean(requirements.audio);
  const reqVideo = Boolean(requirements.video);
  const reqDoc = Boolean(requirements.doc);
  const reqImage = Boolean(requirements.image);

  // Если требуется видео или аудио
  if (reqAudio || reqVideo) {
    // Gemini Flash 3.8 или 2.5 поддерживает все 4 формата: image, video, audio, doc
    return 'Gemini Flash 3.8';
  }

  // Если требуются только изображения и/или документы
  if (reqImage || reqDoc) {
    // chatGPT 4 omni mini - оптимальная базовая мультимодальная модель (коэф=1, окно=128К, image + doc)
    return 'chatGPT 4 omni mini';
  }

  return 'ProTalk Free';
}

/**
 * Вычисляет значения ключей ai_modal_* для указанной модели и желаемых требований
 */
export function getModalitiesToApply(
  modelName: string,
  desired: { image?: boolean; video?: boolean; audio?: boolean; doc?: boolean }
): { ai_modal_image: boolean; ai_modal_video: boolean; ai_modal_audio: boolean; ai_modal_doc: boolean } {
  const supported = getModelSupportedModalities(modelName);
  return {
    ai_modal_image: Boolean(desired.image && supported.image),
    ai_modal_video: Boolean(desired.video && supported.video),
    ai_modal_audio: Boolean(desired.audio && supported.audio),
    ai_modal_doc: Boolean(desired.doc && supported.doc),
  };
}
