import React from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

interface MonetizationTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const MonetizationTab: React.FC<MonetizationTabProps> = ({ formData, handleChange }) => {
  const paymentMode = formData.payments_mode || 'Продажа пакетов токенов'; // Default to token packs

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Коммерческие настройки</h3>

      {/* Режим платежей */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Режим платежей:</h4>
        <Field
            label="Режим"
            description="Выберите нужный Вам вариант монетизации бота."
            popover="Вы можете продавать пакеты токенов для использования вашего бота. Например, вы можете предложить 5 миллионов токенов за 1000 рублей. Укажите количество токенов в пакете и стоимость. Также добавьте сообщение, которое будет отправляться пользователю вместе с ссылкой на оплату. Вы можете предоставить пользователям бесплатные токены для ознакомления с ботом, например, 500 токенов. Используйте реферальные ссылки для привлечения новых пользователей. За каждого привлеченного пользователя вы можете награждать реферала определенным количеством токенов. Для этого используйте в настройках бота команду /share для создания реферальной ссылки."
        >
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="payments_mode" value="Продажа пакетов токенов" checked={paymentMode === 'Продажа пакетов токенов'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                    <span className="text-sm">Пакеты токенов</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="payments_mode" value="Регулярные платежи по подписке" checked={paymentMode === 'Регулярные платежи по подписке'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                    <span className="text-sm">Подписка</span>
                </label>
            </div>
        </Field>
        <Field label="Валюта">
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="currency" value="Рубли" checked={formData.currency === 'Рубли' || !formData.currency} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                    <span className="text-sm">Рубли</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="currency" value="Звезды Телеграм" checked={formData.currency === 'Звезды Телеграм'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                    <span className="text-sm">Звезды Телеграм</span>
                </label>
            </div>
        </Field>
      </div>

      {/* Пакеты токенов */}
      {paymentMode === 'Продажа пакетов токенов' && (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Пакеты токенов:</h4>
            <Field label="Количество бесплатных токенов" description="После исчерпания количества токенов, высылается ссылка на оплату.">
                <input type="number" name="user_tokens_limit" value={formData.user_tokens_limit || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
             <Field label="Количество бесплатных токенов в день после использования платного пакета токенов">
                <input type="number" name="user_day_bonus_tokens_limit" value={formData.user_day_bonus_tokens_limit || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Стоимость пакета токенов">
                <input type="number" name="user_tokens_cost" value={formData.user_tokens_cost || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Количество токенов в пакете">
                <input type="number" name="user_tokens_buy" value={formData.user_tokens_buy || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Сообщение пользователю, когда исчерпался пакет токенов">
                <textarea name="user_tokens_warning" value={formData.user_tokens_warning || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
        </div>
      )}

      {/* Подписка */}
      {paymentMode === 'Регулярные платежи по подписке' && (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Подписка:</h4>
            <Field label="Стоимость подписки">
                <input type="number" name="regular_payment_sum" value={formData.regular_payment_sum || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Срок подписки, дней">
                <input type="number" name="regular_payment_period" value={formData.regular_payment_period || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
             <Field label="Тестовый период, дней" description="Если будете менять цифру, то для всех прежних покупателей будет действовать старое значение.">
                <input type="number" name="regular_payment_test_period" value={formData.regular_payment_test_period || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Сообщение пользователю, когда закончился оплаченный период">
                <textarea name="user_period_warning" value={formData.user_period_warning || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
        </div>
      )}
      
      {/* Реферальная программа */}
       <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Реферальная программа:</h4>
            <Field label="Количество токенов, которое вы подарите тому, кто привлечет нового пользователя" description="Используйте команду /share для создания реферальной ссылки.">
                <input type="number" name="user_tokens_share" value={formData.user_tokens_share || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
             <Field label="Количество дней, которое вы подарите тому, кто привлечет нового пользователя" description="Используйте команду /share для создания реферальной ссылки.">
                <input type="number" name="user_days_share" value={formData.user_days_share || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
             <Field label="Сообщение пользователю (токены)" description="Когда он привлек нового пользователя">
                <textarea name="tokens_bonus_message" value={formData.tokens_bonus_message || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Сообщение пользователю (дни)" description="Когда он привлек нового пользователя">
                <textarea name="referral_period_bonus_message" value={formData.referral_period_bonus_message || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
      </div>

       {/* Магазин */}
       <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Магазин:</h4>
            <Field label="Публикация" description="Кто может получить копию вашего бота (выберите 'все пользователи' если хотите продавать бота за токены).">
                 <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="in_store" value="Все пользователи" checked={formData.in_store === 'Все пользователи'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                        <span className="text-sm">Все</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="in_store" value="Только по приватной ссылке" checked={formData.in_store === 'Только по приватной ссылке'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                        <span className="text-sm">Приватная ссылка</span>
                    </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="in_store" value="Никто" checked={formData.in_store === 'Никто' || !formData.in_store} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500"/>
                        <span className="text-sm">Никто</span>
                    </label>
                </div>
            </Field>
             <Field label="Стоимость" description="Сколько будет стоить 1 копия бота в рублях.">
                <input type="number" name="fork_cost" value={formData.fork_cost || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
            <Field label="Описание">
                 <textarea name="fork_description" value={formData.fork_description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"/>
            </Field>
             <Field label="Видео">
                <input type="url" name="fork_video" value={formData.fork_video || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder="https://youtube.com/..."/>
            </Field>
      </div>

    </div>
  );
};

export default MonetizationTab;