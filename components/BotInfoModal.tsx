import React from 'react';
import type { Bot } from '../types';

interface BotInfoModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  botBasicInfo: Bot | null;
  botDetails: any | null;
  botSummary: string | null;
}

const BotInfoModal: React.FC<BotInfoModalProps> = ({ isOpen, isLoading, onClose, botBasicInfo, botDetails, botSummary }) => {
  if (!isOpen) {
    return null;
  }

  const getTag = (apiHost?: string) => {
    if (apiHost === 'eu1.api.pro-talk.ru') return { text: 'Европа', color: 'bg-purple-600' };
    if (apiHost === 'us1.api.pro-talk.ru') return { text: 'США', color: 'bg-purple-600' };
    if (apiHost === 'ru1.api.pro-talk.ru') return { text: 'Россия', color: 'bg-purple-600' };
    return null;
  };

  const renderContent = () => {
    if (isLoading || !botBasicInfo) {
      return (
        <div className="flex justify-center items-center h-96">
          <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }
    
    // The details from the API might contain a more up-to-date name or model
    const displayName = botDetails?.bot_name || botBasicInfo.name;
    const displayModel = botDetails?.ai_model || botBasicInfo.ai_model;
    const tag = getTag(botBasicInfo.api_host);
    const gender = botDetails?.bot_gender;
    const genderIcon = gender === 'Женщина' ? '👩' : (gender === 'Мужчина' ? '👨' : null);

    return (
      <>
        {/* Visual Header */}
        <div className="h-48 bg-gray-200 dark:bg-gray-700/50 rounded-t-2xl flex items-center justify-center p-4">
          <img 
            src={botBasicInfo.avatar} 
            alt={displayName} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
          />
        </div>

        {/* Main Info */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">ID: {botBasicInfo.bot_id}</p>
          {tag && <span className={`text-xs font-semibold px-3 py-1 ${tag.color} text-white rounded-full`}>{tag.text}</span>}
        </div>

        {/* AI Analysis */}
        <div className="px-6 pb-4 text-left">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Анализ от ИИ</h3>
            <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md min-h-[60px]">
                <p className="text-sm text-gray-700 dark:text-gray-300">{botSummary}</p>
            </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mx-6"></div>

        {/* Icons */}
        <div className="p-4 flex justify-center items-center gap-6 text-2xl">
          {displayModel && (
            <div className="relative group flex flex-col items-center">
              <span className="cursor-default">🧠</span>
              <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 text-sm font-normal text-white bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {displayModel}
              </div>
            </div>
          )}
          {genderIcon && (
            <span className="cursor-default">{genderIcon}</span>
          )}
        </div>
      </>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bot-info-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm text-gray-900 dark:text-white transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        {renderContent()}
      </div>
       <style>{`
          @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default BotInfoModal;
