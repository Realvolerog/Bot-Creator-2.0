import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: any;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, errorData }) => {
  if (!isOpen) return null;

  const jsonString = typeof errorData === 'object' 
    ? JSON.stringify(errorData, null, 2) 
    : String(errorData);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900 w-full max-w-4xl h-[80vh] text-gray-900 dark:text-white flex flex-col animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div>
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Ошибка провайдера</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Сырой ответ сервера (Raw Response)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 p-0 overflow-hidden bg-gray-50 dark:bg-gray-950 relative group">
            <textarea
                readOnly
                className="w-full h-full p-6 font-mono text-xs text-gray-700 dark:text-red-100 bg-transparent resize-none focus:outline-none custom-scrollbar"
                value={jsonString}
            />
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(jsonString);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                Копировать JSON
            </button>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;