
import React, { useState } from 'react';
import type { Message } from '../types';

interface ThinkingStepsProps {
    steps: Message[];
}

const ThinkingSteps: React.FC<ThinkingStepsProps> = ({ steps }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (steps.length === 0) {
        return null;
    }

    return (
        <div className="flex justify-start my-2 animate-fade-in-up">
            <div className="w-full max-w-xl lg:max-w-2xl bg-gray-100/50 dark:bg-[#36404a]/30 text-gray-500 dark:text-gray-400 text-sm rounded-lg border border-dashed border-gray-300 dark:border-[#424e5a]">
                <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-200/50 dark:hover:bg-[#36404a]/50 transition-colors rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2a62ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Процесс анализа...</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-200 dark:border-[#424e5a]">
                        <ul className="space-y-2.5 mt-3 list-none p-0">
                            {steps.map((step, index) => (
                                <li key={step.id} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}>
                                    <svg className="h-4 w-4 text-[#2a62ff] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">{step.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ThinkingSteps;