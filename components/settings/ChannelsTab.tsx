import React, { useState } from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

interface ChannelsTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

type SubTab = 'Umnico' | 'Wazzup' | 'WHAPI' | 'GreenAPI' | 'Другие' | 'Маркетплейсы' | 'Coze';

const ChannelsTab: React.FC<ChannelsTabProps> = ({ formData, handleChange }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('Umnico');

    const subTabs: SubTab[] = ['Umnico', 'Wazzup', 'WHAPI', 'GreenAPI', 'Маркетплейсы', 'Coze', 'Другие'];

    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case 'Umnico':
                return (
                    <div className="space-y-4">
                        <Field label="API ключ"><input type="text" name="umnico_api" value={formData.umnico_api || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="ID каналов ожидания"><input type="text" name="umnico_id" value={formData.umnico_id || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="ID каналов первого сообщения"><input type="text" name="umnico_id_first" value={formData.umnico_id_first || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            case 'Wazzup':
                 return (
                    <div className="space-y-4">
                        <Field label="API ключ входящий"><input type="text" name="wazzup_api_key_in" value={formData.wazzup_api_key_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="API ключ исходящий"><input type="text" name="wazzup_api_key_out" value={formData.wazzup_api_key_out || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Каналы входящие"><input type="text" name="wazzup_channels_in" value={formData.wazzup_channels_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Каналы исходящие"><input type="text" name="wazzup_channels_out" value={formData.wazzup_channels_out || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            case 'WHAPI':
                 return (
                    <div className="space-y-4">
                        <Field label="Токен входящий"><input type="text" name="whapi_token_in" value={formData.whapi_token_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Токен исходящий"><input type="text" name="whapi_token_out" value={formData.whapi_token_out || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="ID канала входящий"><input type="text" name="whapi_channel_id_in" value={formData.whapi_channel_id_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="ID канала исходящий"><input type="text" name="whapi_channel_id_out" value={formData.whapi_channel_id_out || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            case 'GreenAPI':
                 return (
                    <div className="space-y-4">
                        <Field label="Токен входящий"><input type="text" name="greenapi_token_in" value={formData.greenapi_token_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Токен исходящий"><input type="text" name="greenapi_token_out" value={formData.greenapi_token_out || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="ID входящий"><input type="text" name="greenapi_id_in" value={formData.greenapi_id_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="ID исходящий"><input type="text" name="greenapi_id_out" value={formData.greenapi_id_out || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            case 'Маркетплейсы':
                 return (
                    <div className="space-y-4">
                        <Field label="WildBerries токен"><input type="text" name="wb_token" value={formData.wb_token || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="WildBerries товары"><textarea name="wb_items" value={formData.wb_items || ''} onChange={handleChange} rows={4} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            case 'Coze':
                 return (
                    <div className="space-y-4">
                        <Field label="Bot API Key"><input type="text" name="coze_bot_api_key" value={formData.coze_bot_api_key || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Bot ID"><input type="text" name="coze_bot_id" value={formData.coze_bot_id || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            case 'Другие':
                 return (
                    <div className="space-y-4">
                        <Field label="Chatra API"><input type="text" name="chatra_api" value={formData.chatra_api || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Jivo Token"><input type="text" name="jivo_token" value={formData.jivo_token || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Jivo Provider ID"><input type="text" name="jivo_provider_id" value={formData.jivo_provider_id || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Wapico Instance ID"><input type="text" name="wapico_instance_id" value={formData.wapico_instance_id || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Wapico Access Token"><input type="text" name="wapico_access_token" value={formData.wapico_access_token || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Chat2Desk API входящий"><input type="text" name="chat2desk_api_key_in" value={formData.chat2desk_api_key_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Chat2Desk операторы"><input type="text" name="chat2desk_operators_in" value={formData.chat2desk_operators_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                        <Field label="Talkme токены"><input type="text" name="talkme_tokens_in" value={formData.talkme_tokens_in || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/></Field>
                    </div>
                );
            default:
                return null;
        }
    }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Подключение мессенджеров и платформ</h3>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`${
                activeSubTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default ChannelsTab;