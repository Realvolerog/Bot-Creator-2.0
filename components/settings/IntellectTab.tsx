
import React, { useState, useEffect } from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';
import { AI_MODELS } from '../../constants/models';
import { getModelSupportedModalities } from '../../services/modelModalities';

interface IntellectTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleModalityToggle?: (key: 'ai_modal_image' | 'ai_modal_video' | 'ai_modal_audio' | 'ai_modal_doc') => void;
}

const IntellectTab: React.FC<IntellectTabProps> = ({ formData, handleChange, handleSliderChange, handleModalityToggle }) => {
  const [isAssistantSectionOpen, setIsAssistantSectionOpen] = useState(false);
  
  useEffect(() => {
    if (formData.openai_assistant_id || formData.openai_assistant_api_key) {
      setIsAssistantSectionOpen(true);
    } else {
      setIsAssistantSectionOpen(false);
    }
  }, [formData.openai_assistant_id, formData.openai_assistant_api_key]);

  const supported = getModelSupportedModalities(formData.ai_model);

  const toggleModality = (key: 'ai_modal_image' | 'ai_modal_video' | 'ai_modal_audio' | 'ai_modal_doc') => {
    if (handleModalityToggle) {
      handleModalityToggle(key);
    } else {
      const syntheticEvent = {
        target: {
          name: key,
          type: 'checkbox',
          checked: !formData[key],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleChange(syntheticEvent);
    }
  };

  const modalityOptions = [
    {
      key: 'ai_modal_image' as const,
      label: 'Фото',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      isSupported: supported.image,
    },
    {
      key: 'ai_modal_video' as const,
      label: 'Видео',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      isSupported: supported.video,
    },
    {
      key: 'ai_modal_audio' as const,
      label: 'Аудио',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      isSupported: supported.audio,
    },
    {
      key: 'ai_modal_doc' as const,
      label: 'Файлы',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      isSupported: supported.doc,
    },
  ];
  
  return (
     <div className="space-y-4">
       <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 -mb-2">Модель и параметры</h3>
       <Field
         label="AI модель"
         description="LLM - текстовая нейросеть. У каждой модели свой расход токенов."
         popover={
           <>
             По умолчанию интеллект бота функционирует на базе chatGPT-4-o-mini. В меню вы можете выбрать другую модель, включая ассистентов от OpenAI. Если у вас есть ассистенты от OpenAI и вы хотите использовать их на нашей платформе, выберите соответствующую опцию. Вам потребуется ввести ключ OpenAI и уникальный ID ассистента. Наша платформа поддерживает различные модели, включая OpenAI, Claude, Llama, Grok, Яндекс-GPT, DeepSeek, Gemini и Giga-chat от Cбера. Вы можете выбрать любую из них в зависимости от ваших потребностей. Разные LLM модели имеют различные коэффициенты. Например, базовая модель chatGPT-4-o-mini имеет коэффициент 1, что означает, что токены тратятся один к одному (1 млн токенов стоят 30 руб.). Другие модели могут иметь разные коэффициенты, например, более дорогие модели могут умножаться на коэффициент 7, а некоторые, как могут иметь коэффициент меньше единицы. Мы предоставляем полную прозрачность в расчетах и статистике в этом документе: <a href="https://disk.yandex.ru/i/VxQ5QqQg4P5seA" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://disk.yandex.ru/i/VxQ5QqQg4P5seA</a>.
           </>
         }
       >
         <select name="ai_model" value={formData.ai_model || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]">
            {AI_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
         </select>
      </Field>

      <Field
        label="Поддержка файлов на входе"
        description="Какие форматы модель будет уметь обрабатывать без функций"
        popover="Позволяет использовать прямые мультимодальные возможности выбранной LLM для обработки изображений, видео, аудиофайлов и документов без подключения сторонних функций. Доступность форматов зависит от возможностей конкретной модели."
      >
        <div className="bg-gray-50 dark:bg-[#2e3740] p-3 rounded-lg border border-gray-200 dark:border-[#424e5a] space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            <span className="px-2.5 py-1 rounded bg-gray-200 dark:bg-[#3a4652] text-gray-800 dark:text-gray-200">
              Текст (всегда)
            </span>
            <span className="text-gray-400 font-bold">+</span>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {modalityOptions.map(opt => {
                const isChecked = Boolean(formData[opt.key]);
                const isEnabled = opt.isSupported;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => isEnabled && toggleModality(opt.key)}
                    title={
                      !isEnabled
                        ? 'Формат не поддерживается выбранной моделью'
                        : isChecked
                        ? `Отключить обработку: ${opt.label}`
                        : `Включить обработку: ${opt.label}`
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none border ${
                      !isEnabled
                        ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-[#252d35] text-gray-400 dark:text-gray-500 border-gray-200 dark:border-[#3a4652]'
                        : isChecked
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700'
                        : 'bg-white dark:bg-[#36404a] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#4a5764] hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={opt.key}
                      checked={isChecked}
                      disabled={!isEnabled}
                      onChange={() => {}} // Controlled by button click
                      className="w-3.5 h-3.5 rounded text-blue-600 pointer-events-none accent-blue-600"
                    />
                    <span className="opacity-90">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-gray-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded bg-gray-200 dark:bg-[#3a4652] text-gray-800 dark:text-gray-200">
              Текст (ответ)
            </span>
          </div>

          {!Object.values(supported).some(Boolean) && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Выбранная модель поддерживает только текст. Для работы с файлами используйте мультимодальные модели (например, Gemini, GPT-4o, Claude 3.5 Sonnet).
            </p>
          )}
        </div>
      </Field>
      <Field
        label="API Key"
        description="Свой API ключ для выбранной Ai модели. Если тут пусто - используются токены ProTalk."
        popover="Если вы хотите использовать свои собственные токены OpenAI, введите свой ключ в левом окошке. В этом случае конкретный бот будет использовать ваши личные токены OpenAI. Если поле остается пустым, будут использоваться токены нашей платформы, которые вы можете приобрести в разделе 'Мой тариф'."
      >
        <input type="password" name="openai_assistant_api_key" value={formData.openai_assistant_api_key || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
      <Field
        label="Креативность"
        description="Если собираетесь использовать функции, то мы рекомендуем использовать креативность на уровне нуля."
      >
        <div className="flex items-center gap-4">
           <input type="range" name="creativity" min="0" max="2" step="0.1" value={formData.creativity || 0} onChange={handleSliderChange} className="w-full h-2 bg-gray-200 dark:bg-[#424e5a] rounded-lg appearance-none cursor-pointer"/>
           <span className="text-sm font-mono text-[#2a62ff] dark:text-blue-300 w-10 text-center">{Number(formData.creativity || 0).toFixed(1)}</span>
        </div>
      </Field>
      
      <hr className="border-gray-200 dark:border-[#424e5a] my-6 !mt-6" />

      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 -mb-2">Промпт</h3>

      <Field 
        label="Первая фраза"
        description="Она нужна для Телеграмм бота. В остальных случаях только когда бот начинает диалог первым."
      >
        <textarea name="greeting" value={formData.greeting || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
      <Field 
        label="Системный промпт (Role)"
        description="Основной системный промпт (System Message). Это самая приоритетная часть настроек. Здесь описывается роль, инструкции, алгоритмы и ограничения бота."
      >
        <textarea name="role" value={formData.role || ''} onChange={handleChange} rows={10} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
      
      <Field
        label="Внешний промпт URL"
        description="Ссылка на Яндекс документ, Google Documents, Notion или YoNote (требуется api ключ в разделе Интеграций). Если тут будет ссылка, то поле Роль не будет активно."
        popover={
            <>
                Вы можете использовать внешний промпт, разместив его в Яндекс или Google Документе, Notion, Yonote (требуется api ключ в разделе Интеграций). Это удобно для совместного редактирования и управления длинными текстами, которые могут превышать 100 тысяч символов. Внешний промпт позволяет команде экспертов работать над настройками бота в одном документе, добавляя комментарии и правки.
                <br/><br/>
                Вы можете отделить промпт от комментариев к нему:
                <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs mt-2 whitespace-pre-wrap">
                    ##ROLE_START##<br/>
                    Тут промпт целиком<br/>
                    ##ROLE_END##<br/>
                    <br/>
                    Тут можно комментировать, это в промпт не попадет
                </code>
            </>
        }
      >
        <input type="url" name="external_promt_url" value={formData.external_promt_url || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
      
      <div className="col-span-12">
         <button onClick={() => setIsAssistantSectionOpen(!isAssistantSectionOpen)} className="text-sm text-[#2a62ff] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-1">
           OpenAI Assistant
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isAssistantSectionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
         </button>
         {isAssistantSectionOpen && (
           <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
             <Field
                label="Assistant ID"
                description="подключение к вашему ассистенту из OpenAi. работает только при использовании личного ключа."
             >
                <input type="text" name="openai_assistant_id" value={formData.openai_assistant_id || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
             </Field>
           </div>
         )}
      </div>
     </div>
  );
};

export default IntellectTab;