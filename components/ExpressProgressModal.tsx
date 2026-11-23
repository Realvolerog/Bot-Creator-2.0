
import React from 'react';
import { MODEL_OPTIONS } from '../constants/models';

interface ExpressProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: { message: string; percent: number };
  isSuccess: boolean;
  usage?: { tokens: number; model: string; } | null;
  theme: 'light' | 'dark';
  isFromUrl: boolean;
}

const ExpressProgressModal: React.FC<ExpressProgressModalProps> = ({ isOpen, onClose, progress, isSuccess, usage, theme, isFromUrl }) => {
  if (!isOpen) return null;

  const calculateCost = (tokens: number, modelValue: string | undefined): string => {
    if (!tokens || !modelValue) return '0.00';
    
    const model = MODEL_OPTIONS.find(m => m.value === modelValue);
    const coef = model ? model.coef : 1; // Default to 1 for safety
    
    const costRUB = (tokens / 1_000_000) * 30 * coef;
    
    if (costRUB > 0 && costRUB < 0.01) {
        return costRUB.toPrecision(2); 
    }
    return costRUB.toFixed(2);
  };


  const handleFinish = () => {
    // The isFromUrl case now has a manual instruction, so we only handle the normal close.
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-[#23262b] flex flex-col items-center justify-center z-[70] animate-fade-in text-gray-900 dark:text-white">
      <div className="w-full max-w-lg p-8">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Создание вашего ИИ-агента...</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">{progress.message}</p>
            <div className="w-full bg-gray-200 dark:bg-[#424e5a] rounded-full h-2.5 mb-4">
              <div 
                className="bg-[#2a62ff] h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4 border border-green-300 dark:border-green-700">
                <svg className="h-10 w-10 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Ваш бот готов!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Новый ИИ-агент успешно создан и добавлен в ваш список.</p>
            
            {usage && (
                <div className="bg-white dark:bg-[#313a41] rounded-lg p-4 mb-6 border border-gray-200 dark:border-[#424e5a] text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Статистика создания</h4>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Затрачено токенов:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">{usage.tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Стоимость (RUB):</span>
                        <span className="font-mono font-semibold text-green-500 dark:text-green-400">{calculateCost(usage.tokens, usage.model)} ₽</span>
                    </div>
                </div>
            )}

            {isFromUrl ? (
              <p className="mt-6 p-4 bg-blue-50 dark:bg-[#313a41] rounded-lg text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-[#424e5a] font-medium">
                Закройте это окно и обновите страницу с помощью клавиш Shift+F5
              </p>
            ) : (
              <button
                onClick={handleFinish}
                className="w-full py-3 text-base font-bold text-white bg-[#2a62ff] rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 active:scale-95 transform"
              >
                Ок
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpressProgressModal;