import React from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

interface WorkModeTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const WorkModeTab: React.FC<WorkModeTabProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">График и активация</h3>

      {/* Тип работы */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Тип работы:</h4>
        <Field
            label="Тип коммуникации"
            description="этот режим работает только при интеграции бота в таких каналах коммуникаций, как персональный Телеграмм или Whatsapp."
            popover="Бот по умолчанию находится в режиме ожидания обращений от пользователей. Если необходимо, чтобы бот инициировал общение первым, вы можете изменить эту настройку. Но сперва подключите бота к оному из омниканальных агрегаторов, например Umnico или Wazzup."
        >
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="communication_type"
                        value="Начинает диалог"
                        checked={formData.communication_type === 'Начинает диалог'}
                        onChange={handleChange}
                        className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Пишу первый</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="communication_type"
                        value="Жду обращения"
                        checked={formData.communication_type === 'Жду обращения' || !formData.communication_type}
                        onChange={handleChange}
                        className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Жду обращения</span>
                </label>
            </div>
        </Field>
      </div>

      {/* Рабочее время */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Рабочее время:</h4>
        <div className="grid grid-cols-12 gap-4 -mb-2">
            <div className="col-span-8 col-start-5">
                 <p className="text-xs text-gray-500 dark:text-gray-400">Вы можете задать время начала и окончания работы бота. Это позволяет, например, отключать бота в ночное время или в периоды, когда его работа не требуется.</p>
            </div>
        </div>
        
        <Field label="Начало работы">
            <input 
                type="time" 
                name="working_hours_start" 
                value={formData.working_hours_start || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        
        <Field label="Конец работы">
            <input 
                type="time" 
                name="working_hours_end" 
                value={formData.working_hours_end || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        
        <Field
            label="Предупреждение"
            description="Напишите сюда фразу, которую должен увидеть пользователь при отключенном боте."
        >
            <textarea
                name="working_time_warning"
                value={formData.working_time_warning || ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
      </div>
    </div>
  );
};

export default WorkModeTab;