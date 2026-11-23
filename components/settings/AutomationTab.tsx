import React from 'react';
import type { Trigger, Bot } from '../../types';

const weekDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

interface AutomationTabProps {
    bot: Bot;
    userTriggers: Trigger[];
    isLoadingTriggers: boolean;
    triggerForm: {
        Name: string;
        Messages: string;
        RegularType: 'Ежедневно' | 'Еженедельно';
        RegularWeekDay: string[];
        StartDate: string;
        StartTime: string;
        StopDate: string;
    };
    onTriggerFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onWeekdayChange: (day: string) => void;
    onCreateTrigger: () => Promise<void>;
    onDeleteTrigger: (triggerId: string) => Promise<void>;
}

const AutomationTab: React.FC<AutomationTabProps> = ({
    bot,
    userTriggers,
    isLoadingTriggers,
    triggerForm,
    onTriggerFormChange,
    onWeekdayChange,
    onCreateTrigger,
    onDeleteTrigger
}) => {
    const botTriggers = userTriggers.filter(trigger => trigger.fields.BotsRealIDs?.includes(bot.bot_id));

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Left side: Existing Triggers */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Текущие триггеры ({botTriggers.length})</h3>
                {isLoadingTriggers ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">Загрузка триггеров...</div>
                ) : botTriggers.length > 0 ? (
                    <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                        {botTriggers.map(trigger => (
                            <div key={trigger.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{trigger.fields.Name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: {trigger.fields.ID}</p>
                                    </div>
                                    <button 
                                        onClick={() => onDeleteTrigger(trigger.id)}
                                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-full transition-colors"
                                        aria-label={`Удалить триггер ${trigger.fields.Name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                                <p className="text-sm bg-gray-200 dark:bg-gray-900/50 p-2 my-2 rounded-md text-gray-700 dark:text-gray-300">"{trigger.fields.Messages}"</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span><strong>Режим:</strong> {trigger.fields.Mode}</span>
                                    <span><strong>Тип:</strong> {trigger.fields.RegularType}</span>
                                    <span><strong>Старт:</strong> {trigger.fields.StartDate}</span>
                                    <span><strong>Стоп:</strong> {trigger.fields.StopDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Для этого бота нет триггеров.</p>
                )}
            </div>
            {/* Right side: Create New Trigger */}
            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Создать новый триггер</h3>
                <div className="space-y-3">
                    <input type="text" name="Name" placeholder="Название триггера" value={triggerForm.Name} onChange={onTriggerFormChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"/>
                    <textarea name="Messages" placeholder="Сообщение для бота..." value={triggerForm.Messages} onChange={onTriggerFormChange} rows={3} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"></textarea>
                    <select name="RegularType" value={triggerForm.RegularType} onChange={onTriggerFormChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <option value="Ежедневно">Ежедневно</option>
                        <option value="Еженедельно">Еженедельно</option>
                    </select>
                     {triggerForm.RegularType === 'Еженедельно' && (
                        <div className="grid grid-cols-4 gap-2 text-xs">
                            {weekDays.map(day => (
                                <label key={day} className={`flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors ${triggerForm.RegularWeekDay.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                    <input type="checkbox" checked={triggerForm.RegularWeekDay.includes(day)} onChange={() => onWeekdayChange(day)} className="hidden"/>
                                    {day.substring(0, 2)}
                                </label>
                            ))}
                        </div>
                     )}
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Дата начала</label>
                            <input type="date" name="StartDate" value={triggerForm.StartDate} onChange={onTriggerFormChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"/>
                         </div>
                         <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Время</label>
                            <input type="time" name="StartTime" value={triggerForm.StartTime} onChange={onTriggerFormChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"/>
                         </div>
                     </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Дата окончания</label>
                        <input type="date" name="StopDate" value={triggerForm.StopDate} onChange={onTriggerFormChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"/>
                     </div>
                     <button onClick={onCreateTrigger} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors text-white">
                        Создать
                     </button>
                </div>
            </div>
        </div>
    );
};

export default AutomationTab;