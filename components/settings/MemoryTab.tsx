import React from 'react';
import type { BotSettings } from '../../types';
import { Field, InfoPopover } from './FormControls';

interface MemoryTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CheckboxField: React.FC<{
    name: string;
    label: string;
    caption: string;
    popover?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, label, caption, popover, checked, onChange }) => (
    <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-4 flex justify-end items-center gap-1 pt-2">
             <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 text-right">{label}</label>
             {popover && <InfoPopover content={popover} />}
        </div>
        <div className="col-span-8">
            <div className="flex items-center">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="h-5 w-5 rounded text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-400 ml-3">{caption}</p>
            </div>
        </div>
    </div>
);


const MemoryTab: React.FC<MemoryTabProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Настройки памяти и контекста</h3>
      
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Базовые настройки:</h4>
        
        <Field
            label="Длина контекста сообщений (шт.)"
            description="Чем их меньше, тем больше остаётся места для инструкций и базы знаний, ниже расход токенов, но зато меньше сообщений остаётся в памяти бота при большом диалоге."
            popover="Это параметр, который определяет, сколько информации бот будет помнить из предыдущих сообщений. Ограничение длины контекста может помочь сэкономить количество токенов, что особенно полезно, если вы хотите оставить больше места для инструкций или базы знаний. Если ограничение не требуется, просто оставьте это поле пустым."
        >
            <input 
                type="number" 
                name="message_limit" 
                value={formData.message_limit || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Неограниченно"
            />
        </Field>

        <CheckboxField
            name="messages_log"
            label="Сохранять диалоги"
            caption="Если установлена галочка, то ваши логи можно выгружать через меню бота/экспорт диалогов. Доступно только на тарифе Профи."
            checked={!!formData.messages_log}
            onChange={handleChange}
        />
         
        <CheckboxField
            name="keep_thread"
            label="Всегда оставаться в контексте диалога"
            caption="После перезагрузки бот не забудет прошлые диалоги."
            popover="По умолчанию бот знает только время начала диалога, но иногда этого недостаточно. Включение временных меток в каждом сообщении позволяет боту более точно отслеживать ход диалога, особенно если он длится более 24 часов. Это также позволяет продолжать диалог через несколько дней, сохраняя контекст. Однако стоит учитывать, что сохранение контекста увеличивает расход токенов, что может повлиять на стоимость диалогов. Если экономия важнее, вы можете ограничить количество сохраняемых сообщений или отключить эту функцию."
            checked={!!formData.keep_thread}
            onChange={handleChange}
        />
        
        <CheckboxField
            name="graph_memory"
            label="Графовая память"
            caption="При включении этой памяти каждый запрос пользователя разбивается на несколько запросов к графовой базе данных, а в роли бота всегда отражены категории, в которых содержатся блоки памяти."
            popover="Она позволяет боту не только запоминать информацию, но и устанавливать связи между различными информационными блоками. Например, бот может запомнить, кто из ваших контактов является родственником, другом или коллегой, и использовать эти связи для выполнения более сложных задач. Графовая память может быть полезна в различных сценариях, таких как организация мероприятий или управление контактами. Она позволяет боту анализировать связи между данными и предлагать решения, основанные на этих связях."
            checked={!!formData.graph_memory}
            onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default MemoryTab;