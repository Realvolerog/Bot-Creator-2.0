import React, { useState } from 'react';
import { MODEL_OPTIONS } from '../constants/models';

interface ExpressCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, model: string) => void;
  isCreating: boolean;
}

const ExpressCreateModal: React.FC<ExpressCreateModalProps> = ({ isOpen, onClose, onSubmit, isCreating }) => {
  const [description, setDescription] = useState('');
  
  const defaultExpressModelValue = MODEL_OPTIONS.find(m => m.isExpressDefault)?.value || MODEL_OPTIONS[0]?.value || 'protalk:free';
  const [selectedModel, setSelectedModel] = useState(defaultExpressModelValue);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmit(description, selectedModel);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl text-gray-900 dark:text-white flex flex-col animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Создание бота по краткому описанию</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Быстрая генерация менее качественная, т.к. нету возможности для дополнительных уточнений, поэтому старайтесь писать подробное тз.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ml-4 flex-shrink-0" aria-label="Закрыть">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center gap-4">
                 <p className="text-gray-600 dark:text-gray-400">Напишите какой ИИ агент вам нужен?</p>
                 <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    disabled={isCreating}
                >
                    {[...MODEL_OPTIONS].sort((a, b) => a.coef - b.coef).map(opt => (
                        <option key={opt.value} value={opt.value}>
                             {opt.label} {opt.isExpressDefault ? '(По умолчанию)' : ''}
                        </option>
                    ))}
                </select>
            </div>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: Мне нужен бот-консультант для сайта по продаже недвижимости. Он должен отвечать на вопросы о квартирах, ценах и ипотеке, а также собирать контакты клиентов..."
                className="w-full h-40 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar"
                disabled={isCreating}
            />
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={isCreating || !description.trim()} 
            className="px-8 py-3 text-base font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed active:scale-95 transform"
          >
            {isCreating ? 'Создание...' : 'Создать бота'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpressCreateModal;