import React, { useMemo } from 'react';
import type { BotSettings, KnowledgeBase } from '../../types';
import { Field, InfoPopover } from './FormControls';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isReady = status === 'Готово к использованию';
    const colorClasses = isReady ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
    const dotClasses = isReady ? 'bg-green-500' : 'bg-yellow-500';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClasses}`}></span>
            {status}
        </span>
    );
};

const CheckboxField: React.FC<{ label: string; name: string; caption: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, caption, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <div>
            <label htmlFor={name} className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">{label}</label>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{caption}</p>
        </div>
        <div className="relative flex items-center">
            <input id={name} name={name} type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 text-blue-600 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 cursor-pointer" />
        </div>
    </div>
);


interface KnowledgeBaseTabProps {
    allKnowledgeBases: KnowledgeBase[];
    isLoadingAllKnowledgeBases: boolean;
    attachedKnowledgeBaseIds: string[];
    onToggleKnowledgeBase: (id: string) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    formData: BotSettings;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({
    allKnowledgeBases,
    isLoadingAllKnowledgeBases,
    attachedKnowledgeBaseIds,
    onToggleKnowledgeBase,
    searchTerm,
    onSearchTermChange,
    formData,
    handleChange,
}) => {
    const filteredKnowledgeBases = useMemo(() => {
        return [...allKnowledgeBases]
            .filter(kb => {
                const search = searchTerm.toLowerCase();
                if (!search) return true;
                return (
                    kb.name.toLowerCase().includes(search) ||
                    kb.id.toString().includes(search)
                );
            })
            .sort((a, b) => a.id - b.id);
    }, [allKnowledgeBases, searchTerm]);

    if (isLoadingAllKnowledgeBases) {
        return (
            <div className="flex justify-center items-center h-full">
                <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="ml-3 text-gray-500 dark:text-gray-400">Загрузка баз знаний...</span>
            </div>
        );
    }
    if (!allKnowledgeBases || allKnowledgeBases.length === 0) {
        return <div className="text-center text-gray-500 p-8">Не удалось загрузить базы знаний или они отсутствуют.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                 <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Управление векторными базами</h3>
                    <InfoPopover content={<>В этом разделе вы можете подключить базы знаний, которые ранее загружали на платформу. Для этого используйте кнопку "Добавить" и выберите нужную базу. После выбора база будет доступна вашему боту для работы. При формировании базы знаний списываются токены на весь её объем, поэтому будьте аккуратны, когда загружаете целые книги! <br/><br/> Базы знаний работают на технологии Embedding. Это метод преобразования текстовой информации в числовые векторы, где семантически близкие понятия располагаются рядом в многомерном пространстве. Текст разбивается на токены. Каждому токену присваивается векторное представление. Близкие по смыслу слова получают похожие векторные представления. При поиске система находит наиболее близкие по смыслу векторы. Этот способ хорошо работает с текстовыми описаниями, понимает семантические связи, может интерпретировать контекст. Но он менее эффективен для точных значений и артикулов. Сложно контролировать процесс поиска.</>} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Создаются на странице "Базы знаний" в левом меню личного кабинета.</p>
                
                <input
                    type="text"
                    placeholder="Поиск по названию..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 mb-3"
                />

                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-12 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <div className="col-span-6">Название базы</div>
                        <div className="col-span-3">Статус</div>
                        <div className="col-span-3 text-right">Действия</div>
                    </div>
                    <div className="max-h-[35vh] overflow-y-auto">
                        {filteredKnowledgeBases.length > 0 ? (
                            filteredKnowledgeBases.map(kb => {
                                const isAttached = attachedKnowledgeBaseIds.includes(kb.record_id);
                                return (
                                    <div key={kb.record_id} className="grid grid-cols-12 items-center px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/20">
                                        <div className="col-span-6 font-medium truncate pr-4">{kb.name}</div>
                                        <div className="col-span-3"><StatusBadge status={kb.quality} /></div>
                                        <div className="col-span-3 flex justify-end">
                                            <button
                                                onClick={() => onToggleKnowledgeBase(kb.record_id)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                                    isAttached
                                                        ? 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-600/40'
                                                        : 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-600/40'
                                                }`}
                                            >
                                                {isAttached ? 'Удалить' : 'Добавить'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                             <div className="text-center text-gray-500 py-8">Базы знаний не найдены.</div>
                        )}
                    </div>
                </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Настройки</h3>
                 <CheckboxField
                    label="Режим отладки"
                    name="embeddings_plain"
                    caption="Выдавать значения из базы знаний без обработки ИИ в голом виде."
                    checked={!!formData.embeddings_plain}
                    onChange={handleChange}
                 />
                 <Field
                    label="OpenAI Vector Store ID"
                    description="Воспользуйтесь ботом для создания хранилища: t.me/ProTalk_RAG_bot"
                 >
                    <input type="text" name="openai_vector_store_id" value={formData.openai_vector_store_id || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
                 </Field>
            </div>
        </div>
    );
};

export default KnowledgeBaseTab;