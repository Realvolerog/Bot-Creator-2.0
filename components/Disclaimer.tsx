import React from 'react';

interface DisclaimerProps {
  onAccept: () => void;
  onCancel?: () => void;
  modelName?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept, onCancel, modelName }) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-yellow-300 dark:border-yellow-700 w-full max-w-2xl text-gray-900 dark:text-white transform animate-fade-in-scale">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">Внимание!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {modelName ? `Переход на платную модель «${modelName}»` : 'Пожалуйста, прочтите перед началом работы с выбранной моделью'}
                </p>
              </div>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                title="Отмена"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Ассистент ProTalk Ai Bot Creator помогает создавать или редактировать ИИ-агентов ProTalk.
          </p>
          <p className="font-semibold text-yellow-700 dark:text-yellow-400">
            Внимание! Все ваши действия вы совершаете на свой страх и риск.
          </p>
          <p>
            Каждое действие в этом приложении выполняет нейросеть и тратит ваши токены. Если нейросеть ошибается, то никакие претензии не принимаются. Все списания токенов происходят только с вашего согласия.
          </p>
          <p className="font-bold text-red-600 dark:text-red-400">
            Будьте внимательны, некоторые LLM модели используемые в приложении могут списывать по 1 млн. токенов за одно действие.
          </p>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex items-center justify-end gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Отмена (остаться на ProTalk Free)
            </button>
          )}
          <button 
            onClick={onAccept} 
            className="px-8 py-3 text-base font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-500 transition-all duration-300 disabled:bg-gray-600 active:scale-95 transform"
          >
            Я понимаю и принимаю риски
          </button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
          .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default Disclaimer;
