
import React, { useState, useEffect, useCallback } from 'react';
import type { Bot, BotSettings, User, ProTalkFunction, KnowledgeBase, Trigger } from '../types';
// FIX: Corrected import path to use the new unambiguous filename 'proTalkApiService'.
import { createTrigger, deleteTrigger } from '../services/proTalkApiService';

// Import tab components
import GeneralTab from './settings/GeneralTab';
import IntellectTab from './settings/IntellectTab';
import FunctionsTab from './settings/FunctionsTab';
import KnowledgeBaseTab from './settings/KnowledgeBaseTab';
import AutomationTab from './settings/AutomationTab';
import MemoryTab from './settings/MemoryTab';
import DialogTab from './settings/DialogTab';
import WorkModeTab from './settings/WorkModeTab';
import ChannelsTab from './settings/ChannelsTab';
import TelegramTab from './settings/TelegramTab';
import VoiceTab from './settings/VoiceTab';
import MonetizationTab from './settings/MonetizationTab';
import LeadGenerationTab from './settings/LeadGenerationTab';
import SecurityTab from './settings/SecurityTab';
import EmojiControlTab from './settings/EmojiControlTab';
import PlaceholderTab from './settings/PlaceholderTab';

interface BotSettingsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  bot: Bot | null;
  botDetails: any | null;
  onClose: () => void;
  onSave: (updatedSettings: BotSettings) => Promise<void>;
  allProTalkFunctions: ProTalkFunction[];
  isLoadingAllFunctions: boolean;
  allKnowledgeBases: KnowledgeBase[];
  isLoadingAllKnowledgeBases: boolean;
  user: User | null;
  userTriggers: Trigger[];
  isLoadingTriggers: boolean;
  onRefreshTriggers: () => void;
  inline?: boolean;
  mobileView?: boolean;
}

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const BotSettingsModal: React.FC<BotSettingsModalProps> = ({
  isOpen, isLoading, isSaving, bot, botDetails, onClose, onSave,
  allProTalkFunctions, isLoadingAllFunctions, allKnowledgeBases, isLoadingAllKnowledgeBases,
  user, userTriggers, isLoadingTriggers, onRefreshTriggers, inline = false, mobileView = false
}) => {
  
  const [activeTab, setActiveTab] = useState('Общие');
  const [formData, setFormData] = useState<BotSettings>({});
  const [kbSearchTerm, setKbSearchTerm] = useState('');
  
  // Mobile Navigation State
  const [mobileStep, setMobileStep] = useState<'groups' | 'content'>('groups');

  const initialTriggerFormState = {
    Name: '',
    Messages: '',
    RegularType: 'Ежедневно' as 'Ежедневно' | 'Еженедельно',
    RegularWeekDay: [] as string[],
    StartDate: getTodayDateString(),
    StartTime: '09:00',
    StopDate: '',
  };
  const [triggerForm, setTriggerForm] = useState(initialTriggerFormState);

  useEffect(() => {
    if (isOpen && botDetails) {
      setFormData(botDetails);
      if (!mobileView) setActiveTab('Общие');
    } else if (!isOpen) {
      setFormData({});
    }
  }, [isOpen, botDetails, mobileView]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'ai_model') {
      // При смене модели все 4 галочки модальностей автоматически сбрасываются
      setFormData(prev => ({
        ...prev,
        ai_model: value,
        ai_modal_image: false,
        ai_modal_video: false,
        ai_modal_audio: false,
        ai_modal_doc: false,
      }));
      return;
    }

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleModalityToggle = useCallback((key: 'ai_modal_image' | 'ai_modal_video' | 'ai_modal_audio' | 'ai_modal_doc') => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  }, []);
  
  const handleToggleFunction = useCallback((id: string) => {
    setFormData(prev => {
        const currentFunctions = prev.functions || [];
        const isAttached = currentFunctions.includes(id);
        const newFunctions = isAttached 
            ? currentFunctions.filter(funcId => funcId !== id)
            : [...currentFunctions, id];
        return { ...prev, functions: newFunctions };
    });
  }, []);

  const handleToggleKnowledgeBase = useCallback((id: string) => {
    setFormData(prev => {
        const currentBases = prev.knowledge_bases || [];
        const isAttached = currentBases.includes(id);
        const newBases = isAttached
            ? currentBases.filter(baseId => baseId !== id)
            : [...currentBases, id];
        return { ...prev, knowledge_bases: newBases };
    });
  }, []);

  const handleApiServerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, api_server: [value] }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(formData);
  }, [onSave, formData]);

  const handleExportToXML = useCallback(() => {
    if (!bot) {
        alert("Бот не выбран для экспорта настроек.");
        return;
    }

    const escapeXml = (unsafe: string): string => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<bot_settings>\n';

    for (const key in formData) {
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
            const value = formData[key];
            
            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                continue;
            }

            const tagName = key.replace(/[^a-zA-Z0-9_.-]/g, '_');
            
            xmlString += `  <${tagName}>`;
            if (Array.isArray(value)) {
                value.forEach(item => {
                    xmlString += `<item>${escapeXml(String(item))}</item>`;
                });
            } else if (typeof value === 'object') {
                xmlString += `<![CDATA[${JSON.stringify(value, null, 2)}]]>`;
            } else {
                xmlString += escapeXml(String(value));
            }
            xmlString += `</${tagName}>\n`;
        }
    }

    xmlString += '</bot_settings>';

    const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot_${bot.bot_id}_settings.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData, bot]);

  const handleTriggerFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTriggerForm(prev => ({...prev, [e.target.name]: e.target.value}));
  }, []);

  const handleWeekdayChange = useCallback((day: string) => {
    setTriggerForm(prev => {
        const weekdays = prev.RegularWeekDay.includes(day)
            ? prev.RegularWeekDay.filter(d => d !== day)
            : [...prev.RegularWeekDay, day];
        return { ...prev, RegularWeekDay: weekdays };
    });
  }, []);

  const handleCreateTrigger = useCallback(async () => {
    if (!bot || !user || !triggerForm.Name || !triggerForm.Messages) {
        alert('Пожалуйста, заполните название и сообщение триггера.');
        return;
    }
    const [hours, minutes] = triggerForm.StartTime.split(':').map(Number);
    const startTimeInSeconds = hours * 3600 + minutes * 60;

    const record = {
        fields: {
            ...triggerForm,
            StartTime: startTimeInSeconds,
            Mode: 'Регулярный',
            Type: 'Диалог с ботом',
            Bots: [bot.bot_record_id],
            Email: user.email,
        }
    };
    try {
        await createTrigger(record);
        alert('Триггер успешно создан!');
        setTriggerForm(initialTriggerFormState);
        onRefreshTriggers();
    } catch (error) {
        console.error("Failed to create trigger:", error);
        alert(`Ошибка при создании триггера: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [bot, user, triggerForm, onRefreshTriggers, initialTriggerFormState]);

  const handleDeleteTrigger = useCallback(async (triggerId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот триггер?')) {
        try {
            await deleteTrigger(triggerId);
            alert('Триггер удален.');
            onRefreshTriggers();
        } catch (error) {
            console.error("Failed to delete trigger:", error);
            alert(`Ошибка при удалении триггера: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
  }, [onRefreshTriggers]);
  
  const TABS_GROUPS = [
    {
      groupName: 'Основные настройки',
      tabs: [
        { name: 'Общие', component: GeneralTab, props: { formData, handleChange, handleApiServerChange } },
        { name: 'Интеллект', component: IntellectTab, props: { formData, handleChange, handleSliderChange, handleModalityToggle } },
        { name: 'Диалог', component: DialogTab, props: { formData, handleChange } },
        { name: 'Режим работы', component: WorkModeTab, props: { formData, handleChange } },
      ],
    },
    {
      groupName: 'Плагины и навыки',
      tabs: [
        { name: 'Функции', component: FunctionsTab, props: { formData, handleChange, allProTalkFunctions, isLoadingAllFunctions, onToggleFunction: handleToggleFunction } },
        { name: 'База знаний', component: KnowledgeBaseTab, props: { allKnowledgeBases, isLoadingAllKnowledgeBases, attachedKnowledgeBaseIds: formData.knowledge_bases || [], onToggleKnowledgeBase: handleToggleKnowledgeBase, searchTerm: kbSearchTerm, onSearchTermChange: setKbSearchTerm, formData, handleChange } },
        { name: 'Память', component: MemoryTab, props: { formData, handleChange } },
        { name: 'Автоматизация', component: AutomationTab, props: { bot, userTriggers, isLoadingTriggers, triggerForm, onTriggerFormChange: handleTriggerFormChange, onWeekdayChange: handleWeekdayChange, onCreateTrigger: handleCreateTrigger, onDeleteTrigger: handleDeleteTrigger } },
      ],
    },
    {
      groupName: 'Каналы коммуникаций',
      tabs: [
        { name: 'Telegram', component: TelegramTab, props: { formData, handleChange } },
        { name: 'Каналы', component: ChannelsTab, props: { formData, handleChange } },
        { name: 'Озвучка', component: VoiceTab, props: { formData, handleChange } },
      ],
    },
    {
      groupName: 'Коммерческое использование',
      tabs: [
        { name: 'Лидогенерация', component: LeadGenerationTab, props: { formData, handleChange } },
        { name: 'Монетизация', component: MonetizationTab, props: { formData, handleChange } },
      ],
    },
    {
      groupName: 'Управление и безопасность',
      tabs: [
        { name: 'Безопасность', component: SecurityTab, props: { formData, handleChange } },
        { name: 'Управление эмодзи', component: EmojiControlTab, props: { formData, handleChange } },
      ],
    },
  ];

  const renderActiveTab = () => {
    const allTabs = TABS_GROUPS.reduce((acc, group) => acc.concat(group.tabs), [] as any[]);
    const activeTabData = allTabs.find((t: any) => t.name === activeTab);
    if (!activeTabData) return null;

    const { component: TabComponent, props } = activeTabData;

    // Special condition for AutomationTab
    if (activeTabData.name === 'Автоматизация' && !bot) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <h3 className="font-semibold text-lg">Необходимо выбрать бота</h3>
              <p className="text-sm">Автоматизация доступна только для существующего бота.</p>
          </div>
      );
    }

    // The type assertion is safe because we are matching component to its props.
    return <TabComponent {...props as any} />;
  };

  const containerClasses = inline 
    ? "w-full h-full flex flex-col bg-white dark:bg-[#313a41] text-gray-900 dark:text-white" 
    : "bg-white dark:bg-[#313a41] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#424e5a] w-full max-w-7xl h-[90vh] text-gray-900 dark:text-white flex flex-col animate-fade-in-scale";

  const overlayClasses = inline
    ? ""
    : "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in";

  if (!isOpen) {
    return null;
  }

  // --- Mobile Navigation Logic ---
  if (mobileView) {
      return (
          <div className={containerClasses}>
              {/* Mobile Content */}
              {mobileStep === 'groups' && (
                  <div className="flex-1 overflow-y-auto p-4 pb-20">
                      {TABS_GROUPS.map((group) => (
                          <div key={group.groupName} className="mb-6">
                              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{group.groupName}</h3>
                              <div className="bg-gray-50 dark:bg-[#36404a] rounded-xl overflow-hidden">
                                  {group.tabs.map((tab, idx) => (
                                      <button
                                          key={tab.name}
                                          onClick={() => {
                                              setActiveTab(tab.name);
                                              setMobileStep('content');
                                          }}
                                          className={`w-full text-left px-4 py-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-[#424e5a] active:bg-gray-200 dark:active:bg-[#424e5a] transition-colors ${idx !== group.tabs.length - 1 ? 'border-b border-gray-200 dark:border-[#424e5a]' : ''}`}
                                      >
                                          <span className="font-medium">{tab.name}</span>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {mobileStep === 'content' && (
                  <div className="flex flex-col h-full">
                      {/* Mobile Tab Header */}
                      <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#313a41] border-b border-gray-200 dark:border-[#424e5a] sticky top-0 z-10">
                          <button 
                            onClick={() => setMobileStep('groups')} 
                            className="p-1 -ml-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                          </button>
                          <h2 className="font-bold text-lg">{activeTab}</h2>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 pb-24">
                          {renderActiveTab()}
                      </div>
                  </div>
              )}

              {/* Mobile Save Button (Fixed at bottom) */}
              <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/80 dark:bg-[#313a41]/80 backdrop-blur-sm border-t border-gray-200 dark:border-[#424e5a] z-40 safe-area-pb">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving || isLoading} 
                    className="w-full py-3 text-base font-bold text-white bg-[#2a62ff] rounded-xl shadow-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed active:scale-95 transform"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
                  </button>
              </div>
          </div>
      );
  }

  // --- Desktop Layout ---
  const content = (
      <div className={containerClasses} onClick={!inline ? e => e.stopPropagation() : undefined}>
        {!inline && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#424e5a] flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold">Настройки: {bot?.name || '...'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {bot?.bot_id || '...'}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" aria-label="Закрыть">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <svg className="animate-spin h-8 w-8 text-[#2a62ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <nav className="w-64 border-r border-gray-200 dark:border-[#424e5a] p-4 overflow-y-auto hidden md:block bg-gray-50 dark:bg-[#313a41]/50">
              {TABS_GROUPS.map((group, groupIndex) => (
                <div key={group.groupName} className={groupIndex > 0 ? 'mt-4' : ''}>
                  <h3 className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group.groupName}</h3>
                  <div className="space-y-1">
                    {group.tabs.map(tab => (
                      <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.name ? 'bg-[#2a62ff] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#36404a]'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#23262b]">
              {renderActiveTab()}
            </main>
          </div>
        )}

        {!inline && (
            <div className="p-4 border-t border-gray-200 dark:border-[#424e5a] flex justify-end gap-3 flex-shrink-0">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-[#424e5a] rounded-lg hover:bg-gray-300 dark:hover:bg-[#36404a] transition-colors">Отмена</button>
            <button onClick={handleExportToXML} disabled={isLoading} className="px-5 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#36404a] rounded-lg hover:bg-gray-200 dark:hover:bg-[#424e5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Экспорт настроек в XML
            </button>
            <button onClick={handleSave} disabled={isSaving || isLoading} className="px-5 py-2 text-sm font-medium text-white bg-[#2a62ff] rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-500 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
            </div>
        )}
      </div>
  );

  if (inline) {
      return content;
  }

  return (
    <div className={overlayClasses} onClick={onClose}>
        {content}
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default BotSettingsModal;