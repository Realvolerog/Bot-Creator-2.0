
import React, { useState } from 'react';
import type { User } from '../types';

// Import tab components
import MyPlanTab from './account_settings/MyPlanTab';
import BillingTab from './account_settings/BillingTab';
import ProfileTab from './account_settings/ProfileTab';
import AnalyticsTab from './account_settings/AnalyticsTab';
import IntegrationsTab from './account_settings/IntegrationsTab';
import VariablesTab from './account_settings/VariablesTab';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userVariables: Record<string, any>;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen, onClose, user, userVariables
}) => {
  
  // Set default tab to 'Переменные' as others are hidden
  const [activeTab, setActiveTab] = useState('Переменные');
  
  const TABS = [
    // { name: 'Мой тариф', component: MyPlanTab, props: {} },
    // { name: 'Тарифы и оплата', component: BillingTab, props: {} },
    // { name: 'Профиль', component: ProfileTab, props: {} },
    // { name: 'Аналитика и отчеты', component: AnalyticsTab, props: {} },
    // { name: 'Интеграции', component: IntegrationsTab, props: {} },
    { name: 'Переменные', component: VariablesTab, props: { variables: userVariables } },
  ];

  const renderActiveTab = () => {
    const activeTabData = TABS.find(t => t.name === activeTab);
    if (!activeTabData) return null;
    const { component: TabComponent, props } = activeTabData;
    // Cast props to any to avoid TypeScript union mismatch errors
    return <TabComponent {...(props as any)} />;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl h-[80vh] text-gray-900 dark:text-white flex flex-col animate-fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Настройки аккаунта</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || '...'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" aria-label="Закрыть">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <nav className="w-56 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </nav>
          <main className="flex-1 p-6 overflow-y-auto">
            {renderActiveTab()}
          </main>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Закрыть</button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AccountSettingsModal;
