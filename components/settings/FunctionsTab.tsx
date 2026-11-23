import React, { useMemo, useState } from 'react';
import type { ProTalkFunction, BotSettings } from '../../types';
import { InfoPopover } from './FormControls';

// Component for the modal to add functions
const AddFunctionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    availableFunctions: ProTalkFunction[];
    onAddFunction: (id: string) => void;
}> = ({ isOpen, onClose, availableFunctions, onAddFunction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredAndSortedFunctions = useMemo(() => {
        return [...availableFunctions]
            .filter(f => {
                const search = searchTerm.toLowerCase();
                if (!search) return true;
                return (
                    f.fields.Название.toLowerCase().includes(search) ||
                    f.fields.ID.toString().includes(search)
                );
            })
            .sort((a, b) => sortOrder === 'asc' ? a.fields.ID - b.fields.ID : b.fields.ID - a.fields.ID);
    }, [availableFunctions, searchTerm, sortOrder]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl text-gray-900 dark:text-white transform flex flex-col h-[80vh] animate-fade-in-scale-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Каталог функций</h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" aria-label="Закрыть">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <input type="text" placeholder="Поиск по ID или названию..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                        <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md" aria-label="Сортировать по ID">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">{sortOrder === 'asc' ? <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM5.22 9.22a.75.75 0 011.06 0L10 12.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 10.28a.75.75 0 010-1.06z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.75a.75.75 0 011.5 0v10.5A.75.75 0 0110 17zM14.78 9.72a.75.75 0 01-1.06 0L10 6.06l-3.72 3.72a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06z" clipRule="evenodd" />}</svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredAndSortedFunctions.map(func => (
                        <div key={func.id} className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">№{func.fields.ID}</p>
                                <p className="font-semibold truncate leading-tight">{func.fields.Название}</p>
                            </div>
                            <button onClick={() => onAddFunction(func.id)} className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600/50">Добавить</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const CheckboxField: React.FC<{ label: string; name: string; popover: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, popover, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
            <label htmlFor={name} className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">{label}</label>
            <InfoPopover content={popover} />
        </div>
        <div className="relative flex items-center">
            <input id={name} name={name} type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 text-blue-600 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 cursor-pointer" />
        </div>
    </div>
);


interface FunctionsTabProps {
    formData: BotSettings;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    allProTalkFunctions: ProTalkFunction[];
    isLoadingAllFunctions: boolean;
    onToggleFunction: (id: string) => void;
}

const FunctionsTab: React.FC<FunctionsTabProps> = ({ formData, handleChange, allProTalkFunctions, isLoadingAllFunctions, onToggleFunction }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const attachedFunctionIds = useMemo(() => formData.functions || [], [formData.functions]);

    const attachedFunctions = useMemo(() => {
        return allProTalkFunctions
            .filter(f => attachedFunctionIds.includes(f.id))
            .sort((a, b) => a.fields.ID - b.fields.ID);
    }, [allProTalkFunctions, attachedFunctionIds]);

    const availableFunctions = useMemo(() => {
        return allProTalkFunctions.filter(f => !attachedFunctionIds.includes(f.id));
    }, [allProTalkFunctions, attachedFunctionIds]);

    if (isLoadingAllFunctions) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="text-gray-500 dark:text-gray-400">Загрузка каталога функций...</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <AddFunctionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} availableFunctions={availableFunctions} onAddFunction={onToggleFunction} />
            
            <div>
                <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Список подключенных функций</h3>
                    <InfoPopover content="Функции позволяют расширять возможности наших ботов, добавляя им новые способности. В этом разделе вы можете найти и подключить необходимые функции. Поиск функций здесь осуществляется по названию или номеру, но он менее интеллектуален, чем в левом меню во вкладке функций. Просто введите название или номер функции, и она будет найдена. Вы можете выбрать несколько функций для подключения к боту, что позволит ему использовать новые возможности. Изначально функции поддерживаются моделями OpenAI, но на нашей платформе вы можете экспериментировать с другими моделями, такими как Yandex GPT или Gigachat. Однако, стабильность работы функций с этими моделями не гарантируется. Рекомендуется сначала протестировать функции на моделях OpenAI, а затем переключиться на другие модели для экспериментов. Анализируйте логи и экспорт диалогов, чтобы убедиться в корректности работы функций."/>
                </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Выберите какую функцию добавить боту.</p>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-12 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <div className="col-span-1">Номер</div>
                        <div className="col-span-4">Название</div>
                        <div className="col-span-5">Описание</div>
                        <div className="col-span-2 text-right">Действия</div>
                    </div>
                     <div className="max-h-[25vh] overflow-y-auto">
                        {attachedFunctions.length > 0 ? (
                            attachedFunctions.map(func => (
                                <div key={func.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/20">
                                    <div className="col-span-1 font-mono text-blue-500 dark:text-blue-300">{func.fields.ID}</div>
                                    <div className="col-span-4 font-medium truncate pr-4">{func.fields.Название}</div>
                                    <div className="col-span-5 text-gray-500 dark:text-gray-400 text-xs truncate pr-4">{func.fields.Описание || '...'}</div>
                                    <div className="col-span-2 flex justify-end items-center gap-2">
                                        <button disabled className="text-xs text-gray-400 dark:text-gray-500 cursor-not-allowed">Настроить</button>
                                        <button onClick={() => onToggleFunction(func.id)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Удалить</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center text-gray-500 py-8">Нет подключенных функций</div>
                        )}
                    </div>
                </div>
                 <button onClick={() => setIsAddModalOpen(true)} className="mt-4 w-full py-2 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600/40 rounded-lg font-semibold transition-colors text-sm">
                    + Добавить функцию
                </button>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />

            <div>
                 <h3 className="text-lg font-semibold mb-3">Режимы работы функций</h3>
                 <div className="space-y-3">
                    <CheckboxField 
                        label="При каждом ответе запускать всегда одну из функций"
                        name="tool_choice"
                        checked={!!formData.tool_choice}
                        onChange={handleChange}
                        popover="Эта опция полезна, если каждый ответ бота должен сопровождаться вызовом функции. Однако, вы не можете контролировать, какую именно функцию он выберет. Если подключена только одна функция, она будет запускаться при каждом запросе. Это может быть полезно, например, для записи данных в таблицу или базу данных."
                    />
                     <CheckboxField 
                        label="Использовать каждую функцию только один раз в новом диалоге"
                        name="tool_once"
                        checked={!!formData.tool_once}
                        onChange={handleChange}
                        popover="Эта настройка позволяет запускать функции в определенной последовательности. Например, если у вас есть три шага: парсинг, генерация картинки и публикация, то каждая функция будет использоваться только один раз в заданной последовательности. Это исключает возможность повторного запуска одной и той же функции в рамках одного диалога."
                    />
                    <CheckboxField 
                        label="Запускать несколько функций одновременно"
                        name="tool_multi"
                        checked={!!formData.tool_multi}
                        onChange={handleChange}
                        popover="Позволяет запускать несколько функций одновременно, но без передачи результатов между ними. Например, можно одновременно отправить лид на e-mail и в Telegram. Однако, если вы хотите, чтобы одна функция использовала результат другой, эта опция не подойдет."
                    />
                 </div>
            </div>
        </div>
    );
};

export default FunctionsTab;