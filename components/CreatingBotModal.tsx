import React from 'react';

interface CreatingBotModalProps {
  isOpen: boolean;
  statusMessage?: string;
}

const CreatingBotModal: React.FC<CreatingBotModalProps> = ({ isOpen, statusMessage }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none cursor-wait"
      role="dialog"
      aria-modal="true"
      aria-label="Создание нового бота"
    >
      <div 
        className="bg-white dark:bg-[#313a41] text-gray-900 dark:text-white rounded-2xl p-7 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-[#424e5a] flex flex-col items-center text-center animate-fade-in-scale"
      >
        {/* Animated Icon with Pulsing Rings */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Subtle Glow */}
          <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-xl animate-pulse"></div>
          
          {/* Outer Spinner */}
          <div className="w-20 h-20 rounded-full border-3 border-transparent border-t-[#2a62ff] border-r-[#2a62ff]/50 animate-spin"></div>
          
          {/* Inner Circle with Robot / Sparkles */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#2a62ff] to-blue-400 flex items-center justify-center text-white shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-7 h-7 animate-pulse" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Создаём нового бота...
        </h3>

        {/* Dynamic status message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px] flex items-center justify-center">
          {statusMessage || 'Инициализируем бота в ProTalk и регистрируем токен...'}
        </p>

        {/* Indeterminate Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-[#23262b] rounded-full h-2.5 overflow-hidden mb-3 border border-gray-200/50 dark:border-[#424e5a]/50">
          <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 via-[#2a62ff] to-indigo-500 rounded-full animate-indeterminate"></div>
        </div>

        {/* Locking warning badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Действия заблокированы до окончания создания</span>
        </div>
      </div>
    </div>
  );
};

export default CreatingBotModal;
