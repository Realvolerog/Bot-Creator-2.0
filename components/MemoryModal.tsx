import React, { useEffect, useState, useCallback } from 'react';
import type { User } from '../types';
import { routerService } from '../services/ProTalkRouterService';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ADMIN_EMAILS = [
    'stepan.tiunov@gmail.com',
    'support@pro-talk.ru',
    'eff-reklama@mail.ru',
    'realvolerog@gmail.com',
    'volerog@mail.ru'
];

const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose, user }) => {
  const [rawHistory, setRawHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('json');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>('Copy JSON');
  const [charCount, setCharCount] = useState<number>(0);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
        // Fetch raw full context from the router service
        const fullContext = await routerService.getFullContext();
        
        // Check if user is admin
        const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

        if (isAdmin) {
            // Admin sees everything
            setRawHistory(fullContext || []);
        } else {
            // Normal users see history minus the system role
            const filteredContext = (fullContext || []).filter(msg => msg.role !== 'system');
            setRawHistory(filteredContext);
        }
    } catch (error) {
        console.error("Failed to fetch raw history:", error);
        setRawHistory([]);
    } finally {
        setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
        fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  // Update char count whenever rawHistory changes
  useEffect(() => {
      const jsonString = JSON.stringify(rawHistory, null, 2);
      setCharCount(jsonString.length);
  }, [rawHistory]);

  const handleCopyJson = () => {
      const jsonString = JSON.stringify(rawHistory, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
          setCopyStatus('Copied!');
          setTimeout(() => setCopyStatus('Copy JSON'), 2000);
      });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl h-[90vh] text-gray-900 dark:text-white flex flex-col animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                LLM Context Memory (ProTalk Proxy State)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Точное отображение контекста, отправляемого в API. {charCount.toLocaleString()} символов.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex text-sm">
                <button 
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'json' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    Pure JSON
                </button>
                <button 
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'visual' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    Visual Turns
                </button>
             </div>
             
             <button 
                onClick={fetchHistory} 
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Refresh Memory"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>

             <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-3 bg-gray-100 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 font-semibold text-green-600 dark:text-green-300 text-sm flex justify-between items-center">
                    <span>
                        {viewMode === 'json' ? `Raw Context Objects (${rawHistory.length})` : `Formatted Turns (${rawHistory.length})`}
                    </span>
                    <div className="flex items-center gap-3">
                        {isLoadingHistory && <span className="text-xs text-blue-400 animate-pulse">Refreshing...</span>}
                        {viewMode === 'json' && (
                             <button 
                                onClick={handleCopyJson}
                                className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                             >
                                 {copyStatus}
                             </button>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-gray-50 dark:bg-gray-900">
                    {viewMode === 'json' ? (
                        /* Pure JSON View (Full Array) */
                        <div className="p-4 h-full relative">
                             {isLoadingHistory ? (
                                 <div className="text-gray-500 italic p-4">Loading memory state...</div>
                             ) : (
                                <textarea
                                    readOnly
                                    className="w-full h-full bg-white dark:bg-gray-950 text-green-700 dark:text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none resize-none shadow-inner"
                                    value={JSON.stringify(rawHistory, null, 2)}
                                />
                             )}
                        </div>
                    ) : (
                        /* Visual View (Iterated turns) */
                        <div className="p-4 space-y-6">
                             {rawHistory.length > 0 ? (
                                rawHistory.map((turn, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                            <span className={`text-xs font-bold uppercase ${turn.role === 'user' ? 'text-blue-500 dark:text-blue-400' : (turn.role === 'system' ? 'text-red-500 dark:text-red-400' : 'text-purple-500 dark:text-purple-400')}`}>
                                                {turn.role}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">Index: {index}</span>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-900/50">
                                             <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
                                                {/* Some API responses might be string content, others objects (tool calls) */}
                                                {typeof turn.content === 'string' ? turn.content : JSON.stringify(turn, null, 2)}
                                             </pre>
                                        </div>
                                    </div>
                                ))
                             ) : (
                                <div className="text-center text-gray-500 italic mt-10">
                                    {isLoadingHistory ? "Fetching history from Router..." : "Memory is empty."}
                                </div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #111827; 
        }
        .light .custom-scrollbar::-webkit-scrollbar-track {
            background: #f3f4f6;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #374151; 
            border-radius: 4px;
        }
        .light .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4b5563; 
        }
        .light .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
        @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MemoryModal;