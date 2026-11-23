import React from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

interface LeadGenerationTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const LeadGenerationTab: React.FC<LeadGenerationTabProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Сбор и отправка лидов</h3>

      {/* Email */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Email:</h4>
        <Field
          label="Email для лидов"
          description="На этот адрес вам будет направлена информация о завершенном диалоге и контакты клиента."
        >
          <input
            type="email"
            name="leads_email"
            value={formData.leads_email || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
      </div>
      
      {/* Telegram */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Telegram:</h4>
        <Field
          label="Токен бота"
          description="Сюда будет направлена информация о завершенном диалоге и контакты клиента."
        >
          <input
            type="text"
            name="leads_telegram_token"
            value={formData.leads_telegram_token || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
        <Field
          label="Chat ID"
          description="Узнать свой номер ID в Телеграмм можно с помощью бота: @id_protalk_bot."
        >
          <input
            type="text"
            name="leads_telegram_chat_id"
            value={formData.leads_telegram_chat_id || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
      </div>
      
      {/* CRM системы */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">CRM системы:</h4>
        <Field
          label="Bitrix24 Webhook"
          description="В битриксе зайдите в раздел 'Разработчикам', затем 'Другое' и выберите создать 'Входящий веб-хук', скопируйте код из первой строки и вставьте сюда."
        >
          <input
            type="text"
            name="leads_bitrix_webhook"
            value={formData.leads_bitrix_webhook || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
        <Field
          label="AmoCRM токен"
          description="При создании токена в amoCRM укажите этот вебхук: https://functions.pro-talk.ru/api/v1.0/amocrm_webhook"
        >
          <input
            type="text"
            name="leads_amocrm"
            value={formData.leads_amocrm || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
        <Field
          label="AmoCRM URL"
          description="Ваш домен в amoCRM"
        >
          <input
            type="url"
            name="leads_amocrm_url"
            value={formData.leads_amocrm_url || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
      </div>
      
      {/* Другое */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Другое:</h4>
        <Field
          label="Google документ"
          description="Убедитесь, что для ссылки выдан доступ на редактирование всем."
        >
          <input
            type="url"
            name="leads_google_doc"
            value={formData.leads_google_doc || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
      </div>

    </div>
  );
};

export default LeadGenerationTab;