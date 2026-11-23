
import React from 'react';

interface VariablesTabProps {
    variables: Record<string, any>;
}

const VariablesTab: React.FC<VariablesTabProps> = ({ variables }) => {
    const hasVariables = Object.keys(variables).length > 0;

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4 p-4 border-b border-gray-200 dark:border-gray-700">Переменные пользователя</h3>
            <div className="flex-1 overflow-y-auto p-4">
                {hasVariables ? (
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ключ</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Значение</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.entries(variables).map(([key, value]) => (
                                    <tr key={key}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-mono">{key}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 dark:text-gray-400 break-all font-mono">
                                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <p>Переменные не найдены.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VariablesTab;
