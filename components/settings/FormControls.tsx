import React, { useState } from 'react';

export const InfoPopover: React.FC<{ content: string | React.ReactNode }> = ({ content }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <button 
                type="button" 
                onClick={openModal} 
                className="flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors focus:outline-none"
                aria-label="Показать подсказку"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </button>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] animate-fade-in"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 relative m-4 animate-fade-in-scale"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Подсказка</h4>
                        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {content}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export interface FieldProps {
  label: string;
  description?: string;
  popover?: string | React.ReactNode;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, description, popover, children }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {popover && <InfoPopover content={popover} />}
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-tight">{description}</p>
      )}
      {children}
    </div>
  );
};
