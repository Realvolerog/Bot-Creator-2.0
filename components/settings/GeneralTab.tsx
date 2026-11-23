
import React from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

interface GeneralTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleApiServerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, handleChange, handleApiServerChange }) => {
  return (
    <div className="space-y-4">
      <Field label="Название бота (внутреннее)">
         <input type="text" name="bot_name" value={formData.bot_name || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
       <Field label="Компания">
         <input type="text" name="company" value={formData.company || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
       <Field label="Должность бота">
         <input type="text" name="bot_position" value={formData.bot_position || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"/>
      </Field>
       <Field label="Пол">
         <select name="bot_gender" value={formData.bot_gender || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]">
           <option value="">Не указан</option>
           <option value="Мужчина">Мужчина</option>
           <option value="Женщина">Женщина</option>
         </select>
      </Field>
      <Field label="Язык">
         <select name="bot_language" value={formData.bot_language || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]">
           <option value="">Не указан</option>
           <option value="Русский">Русский</option>
           <option value="English">English</option>
         </select>
      </Field>
      <Field label="Сервер API (API Node)">
         <select 
            name="api_server" 
            value={formData.api_server?.[0] || 'recVoxPn7QzCZEnJZ'} 
            onChange={handleApiServerChange} 
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-md text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"
         >
           <option value="reczWMaD9akpFAiny">Россия</option>
           <option value="rec72jrpu8RLBfXki">Европа</option>
           <option value="recVoxPn7QzCZEnJZ">США</option>
         </select>
      </Field>
    </div>
  );
};

export default GeneralTab;