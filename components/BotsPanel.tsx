import React, { useState } from 'react';
import type { Bot } from '../types';
import { MODEL_OPTIONS } from '../constants/models';

interface BotsPanelProps {
  bots: Bot[];
  selectedBot: Bot | null;
  onSelectBot: (bot: Bot | null) => void;
  isLoading: boolean;
  isCreating: boolean;
  onCreateNewBot: () => void;
  onExpressCreate: () => void; // New prop for express creation
  userEmail?: string;
  onViewDetails: (bot: Bot) => void;
  onEditDetails: (bot: Bot) => void;
  onOpenAccountSettings: () => void;
  isPublicMode: boolean;
  isMobile?: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
}

const BotsPanel: React.FC<BotsPanelProps> = ({ 
    bots, selectedBot, onSelectBot, isLoading, isCreating, onCreateNewBot, 
    onExpressCreate, // Destructure new prop
    userEmail, onViewDetails, onEditDetails, 
    onOpenAccountSettings, isPublicMode, isMobile, theme, toggleTheme,
    currentModel, onModelChange
}) => {
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  
    const buttonBaseClasses = "p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#36404a] transition-colors";

    const themeToggleButton = (
      <button 
          onClick={toggleTheme}
          className={buttonBaseClasses}
          title="Переключить тему"
      >
          {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
          ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
          )}
      </button>
    );

    const getModelPrice = (modelValue: string) => {
        const model = MODEL_OPTIONS.find(m => m.value === modelValue);
        if (!model) return '0р.';
        const price = parseFloat((model.coef * 30).toFixed(1));
        return `${price}р. за 1м ток.`;
    };

    const modelSelectionModal = isModelModalOpen ? (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsModelModalOpen(false)}>
            <div className="bg-white dark:bg-[#313a41] text-gray-900 dark:text-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-gray-200 dark:border-[#424e5a] flex flex-col max-h-[85vh] animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#424e5a]">
                    <div>
                        <h2 className="text-lg font-bold">Выбор модели ИИ</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Выберите нейросеть для работы агента</p>
                    </div>
                    <button 
                        onClick={() => setIsModelModalOpen(false)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-2">
                    {[...MODEL_OPTIONS].sort((a, b) => a.coef - b.coef).map(opt => {
                        const isSelected = currentModel === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onModelChange(opt.value);
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
    ) : null;

    const isInIframe = typeof window !== 'undefined' && (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

  // Mobile Header
  if (isMobile) {
      return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#23262b] text-gray-900 dark:text-white relative">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#424e5a] bg-white dark:bg-[#313a41] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {!isInIframe && (
                      <img 
                        src="https://i.1.creatium.io/disk2/e8/fd/ed/d01a2eb6e6b002c270070c3c74cfe51440/ptalk_ng.png" 
                        alt="ProTalk Logo" 
                        className="h-8 w-8 rounded-md"
                      />
                    )}
                    <h1 className="text-lg font-bold">Ai Bot Creator</h1>
                </div>
                <div className="flex items-center gap-2">
                    {themeToggleButton}
                    <button 
                        onClick={onExpressCreate}
                        disabled={isCreating}
                        className="w-8 h-8 rounded-full bg-[#2a62ff] hover:bg-blue-500 text-white flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-wait shrink-0"
                        title="Создать нового агента"
                        aria-label="Создать нового агента"
                    >
                        {isCreating ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                    </button>
                    <button 
                        onClick={() => setIsModelModalOpen(true)}
                        className={buttonBaseClasses}
                        title="Выбор модели ИИ"
                        aria-label="Выбор модели ИИ"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
                {isLoading && !isCreating ? (
                    <div className="flex justify-center py-8 text-gray-500 dark:text-gray-400">Загрузка...</div>
                ) : (
                    bots.map(bot => (
                        <div 
                            key={bot.bot_id} 
                            onClick={() => onSelectBot(bot)}
                            className="bg-white dark:bg-[#313a41] rounded-xl p-4 shadow-md border border-gray-200 dark:border-[#424e5a] flex items-center justify-between gap-3 cursor-pointer hover:border-[#2a62ff] transition-colors"
                        >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <img src={bot.avatar} alt={bot.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{bot.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{bot.ai_model}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">ID: {bot.bot_id}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectBot(bot);
                                }}
                                className="w-9 h-9 rounded-full bg-[#2a62ff] hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95"
                                title="Открыть бота"
                                aria-label="Открыть бота"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
                {bots.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 dark:text-gray-500 mt-10">
                        У вас пока нет агентов. Создайте первого!
                    </div>
                )}
            </div>

            {modelSelectionModal}
        </div>
      );
  }

  // Desktop Render
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#313a41] text-gray-900 dark:text-white transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-[#424e5a]">
        <h2 className="text-xl font-bold">Мои ИИ-агенты</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Выберите агента для редактирования или создайте нового</p>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        {!isPublicMode && (
          <div className="flex gap-2">
            <button
              onClick={onExpressCreate}
              disabled={isCreating || isLoading}
              className="flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#36404a] hover:bg-gray-200 dark:hover:bg-[#424e5a] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
              title="Быстрая генерация"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Быстрая генерация</span>
              {isCreating && <span className="text-xs ml-1">...</span>}
            </button>
            <button
              onClick={async () => {
                const created = await onCreateNewBot();
                if (created) {
                  onSelectBot(created);
                }
              }}
              disabled={isCreating || isLoading}
              className="flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#36404a] hover:bg-gray-200 dark:hover:bg-[#424e5a] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
              title="Создать с нуля"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Создать с нуля</span>
              {isCreating && <span className="text-xs ml-1">...</span>}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {isLoading && !isCreating ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Загрузка ботов...</div>
          </div>
        ) : (
          bots.map(bot => (
            <button
              key={bot.bot_id}
              onClick={() => onSelectBot(bot)}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-4 ${
                selectedBot?.bot_id === bot.bot_id ? 'bg-gray-200 dark:bg-[#424e5a]' : 'hover:bg-gray-100 dark:hover:bg-[#36404a]'
              }`}
            >
              <img src={bot.avatar} alt={bot.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                    <span>{bot.bot_id}</span>
                </div>
                <p className="font-semibold truncate text-gray-900 dark:text-white leading-tight">{bot.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{bot.ai_model}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-4 mt-auto border-t border-gray-200 dark:border-[#424e5a]">
        {userEmail ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {themeToggleButton}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-2">
            <p>Опишите задачу для ИИ-агента в чате и укажите ваш email, чтобы начать работу.</p>
          </div>
        )}
      </div>

      {modelSelectionModal}
    </div>
  );
};

export default BotsPanel;