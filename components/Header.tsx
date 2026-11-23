import React, { useState, useEffect } from 'react';
import { MODEL_OPTIONS } from '../constants/models';
import type { Bot } from '../types';

interface HeaderProps {
    isAutoExecutionEnabled: boolean;
    onToggleAutoExecution: () => void;
    onClearChat: () => void;
    currentModel: string;
    tokenUsage: {
        lastRequest: number;
        dailyTotal: number;
        botTotals: Record<number, number>;
    };
    userBalance: number;
    selectedBotId?: number;
    selectedBotName?: string;
    selectedBot?: Bot | null;
    theme?: 'light' | 'dark';
    onOpenEditor?: () => void;
    onModelChange?: (newModel: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    isAutoExecutionEnabled, 
    onToggleAutoExecution,
    onClearChat,
    currentModel,
    tokenUsage,
    userBalance,
    selectedBotId,
    selectedBotName,
    selectedBot,
    theme = 'light',
    onOpenEditor,
    onModelChange,
}) => {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenPicker = () => setIsModelModalOpen(true);
    window.addEventListener('protalk:open_model_picker', handleOpenPicker);
    return () => window.removeEventListener('protalk:open_model_picker', handleOpenPicker);
  }, []);

  const findModel = (val?: string) => {
    if (!val) return undefined;
    return MODEL_OPTIONS.find(m => m.value === val || m.value === `anymodel/${val}` || val === `anymodel/${m.value}`);
  };

  const calculateCost = (tokens: number): string => {
    if (!tokens) return '0.00';
    
    const model = findModel(currentModel);
    const coef = model ? model.coef : 1; // Default to 1 if model not found for safety
    
    const costRUB = (tokens / 1_000_000) * 30 * coef;
    
    if (costRUB > 0 && costRUB < 0.01) {
        return costRUB.toPrecision(2); 
    }
    return costRUB.toFixed(2);
  };

  // New function for fixed balance cost calculation
  const calculateBalanceCost = (tokens: number): string => {
    if (!tokens) return '0.00';
    const costRUB = (tokens / 1_000_000) * 30;
    if (costRUB > 0 && costRUB < 0.01) {
        return costRUB.toPrecision(2);
    }
    return costRUB.toFixed(2);
  };

  const getModelPrice = (modelValue: string) => {
    const opt = findModel(modelValue);
    if (!opt) return '~30 руб. / 1 млн токенов';
    const price = 30 * opt.coef;
    return `~${price % 1 === 0 ? price : price.toFixed(1)} руб. / 1 млн токенов`;
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('ru-RU').format(num);
  
  // Find selected model to display in the header subtitle
  const selectedModel = findModel(currentModel);
  const modelDisplayName = selectedModel ? selectedModel.label : (currentModel ? (currentModel.includes('/') ? currentModel.split('/').pop() : currentModel) : '');
  
  // Use specific bot usage if selected, otherwise 0
  const currentUsage = selectedBotId ? (tokenUsage.botTotals[selectedBotId] || 0) : 0;

  const isInIframe = typeof window !== 'undefined' && (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  return (
    <>
      <div className="flex items-center justify-between p-2.5 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 w-full gap-2 sm:gap-4">
        
        {/* 1. Logo & Title */}
        <div className="flex items-center shrink-0">
          {!isInIframe && (
            <img 
              src="https://i.1.creatium.io/disk2/e8/fd/ed/d01a2eb6e6b002c270070c3c74cfe51440/ptalk_ng.png" 
              alt="ProTalk Logo" 
              className="h-8 w-8 md:h-10 md:w-10 rounded-md shrink-0"
            />
          )}
          <div className={`${isInIframe ? '' : 'ml-2'} flex flex-col justify-center`}>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
               AI Bot Creator
            </h1>
            {modelDisplayName && (
              <button
                onClick={() => setIsModelModalOpen(true)}
                type="button"
                className="group -ml-1 mt-0.5 px-1 py-0.5 rounded flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-[#2a62ff] dark:text-gray-400 dark:hover:text-blue-400 font-medium leading-tight text-left transition-colors cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-900/20"
                title="Нажмите, чтобы сменить модель ИИ"
              >
                <span>на <span className="underline decoration-dotted underline-offset-2">{modelDisplayName}</span></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 group-hover:text-[#2a62ff] dark:group-hover:text-blue-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* 2. Usage section */}
        <div className="text-center sm:text-right shrink-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Расход</p>
            <p className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                {formatNumber(currentUsage)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">~ {calculateCost(currentUsage)} руб.</p>
        </div>
        
        {/* 3. Balance section */}
        <div className="text-center sm:text-right shrink-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Баланс токенов</p>
            <p className="text-xs sm:text-sm font-semibold whitespace-nowrap text-green-600 dark:text-green-400">
                {formatNumber(userBalance)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">~ {calculateBalanceCost(userBalance)} руб.</p>
        </div>

        {/* 4. Actions */}
        <div className="flex flex-row items-center gap-1.5 md:gap-2 shrink-0">
            {/* Editor Button (desktop / iframe - hidden on mobile) */}
            {selectedBot && onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="hidden md:flex p-1.5 md:p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-blue-500 items-center justify-center shrink-0"
                title="Редактор бота"
                aria-label="Редактор бота"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                 </svg>
              </button>
            )}

            {/* Clear Chat Button */}
            <button
              onClick={onClearChat}
              disabled={!selectedBotId}
              className={`p-1.5 md:p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Очистить диалог и память"
              aria-label="Очистить диалог"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11h-1V3c0-1.1-.9-2-2-2h-2C9.9 1 9 1.9 9 3v8H8c-2.76 0-5 2.24-5 5v7h18v-7c0-2.76-2.24-5-5-5zM11 3h2v8h-2V3zm7 18H5v-5c0-1.65 1.35-3 3-3h8c1.65 0 3 1.35 3 3v5z"></path>
               </svg>
            </button>
        </div>
      </div>

      {/* Model Selection Modal */}
      {isModelModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#313a41] text-gray-900 dark:text-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-gray-200 dark:border-[#424e5a] flex flex-col max-h-[85vh] animate-fade-in-scale" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#424e5a]">
              <div>
                <h2 className="text-lg font-bold">Выбор модели ИИ</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Выберите нейросеть для работы ассистента</p>
              </div>
              <button 
                onClick={() => setIsModelModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                title="Закрыть"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {[...MODEL_OPTIONS].sort((a, b) => a.coef - b.coef).map(opt => {
                const isSelected = currentModel === opt.value || currentModel === opt.value.replace('anymodel/', '') || opt.value === `anymodel/${currentModel}`;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (onModelChange) {
                        onModelChange(opt.value);
                      }
                      setIsModelModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#2a62ff] bg-blue-50/50 dark:bg-blue-900/20 text-[#2a62ff] font-semibold'
                        : 'border-gray-200 dark:border-[#424e5a] hover:bg-gray-50 dark:hover:bg-[#36404a] text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{opt.label}</span>
                        {opt.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[#2a62ff] dark:text-blue-300 font-normal">
                            По умолч.
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                        {getModelPrice(opt.value)}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#2a62ff] bg-[#2a62ff]' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-[#424e5a]">
              <button
                onClick={() => setIsModelModalOpen(false)}
                className="w-full py-2.5 bg-[#2a62ff] text-white rounded-xl font-medium text-sm hover:bg-blue-500 transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
