import React from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

// A local CheckboxField component for this tab
const CheckboxField: React.FC<{
    name: string;
    label: string;
    caption: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, label, caption, checked, onChange }) => (
    <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-4 flex justify-end items-center gap-1 pt-2">
             <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 text-right">{label}</label>
        </div>
        <div className="col-span-8">
            <div className="flex items-center">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="h-5 w-5 rounded text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-400 ml-3">{caption}</p>
            </div>
        </div>
    </div>
);


interface TelegramTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TelegramTab: React.FC<TelegramTabProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Специальные настройки для Telegram</h3>

      {/* Основное */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Основное:</h4>
        <Field
            label="Токен бота"
            description="Внимание! Одновременное использование ключа в других ботах или сервисах может привести к сбоям интеграции."
            popover="Перейдите в Telegram и найдите бота @BotFather. Следуйте инструкциям для создания нового бота: выберите имя и получите токен доступа. Вставьте токен бота и его никнейм в соответствующие поля."
        >
            <input
                type="text"
                name="telegram_bot_token"
                value={formData.telegram_bot_token || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Никнейм"
            description="Укажите в таком виде - @myname_bot"
        >
            <input
                type="text"
                name="telegram_bot_name"
                value={formData.telegram_bot_name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Команды меню"
            description="Разделяйте запятыми и каждая новая строка с командами будет новой строкой в меню бота."
            popover="Вы можете добавить различные кнопки в меню вашего бота. По умолчанию доступна кнопка «Новый диалог», которая перезапускает бота для начала нового разговора. Кнопки можно располагать как вертикально, так и горизонтально. Для горизонтального расположения используйте запятую для разделения кнопок, а для вертикального — новую строку. Пример: если вы добавите две кнопки в одну строку, они будут отображаться горизонтально. Вы можете добавить кнопку для проверки баланса токенов, если ваш бот работает по подписке или пакетам токенов. Для этого необходимо интегрировать бота с платежными сервисами."
        >
            <textarea
                name="telegram_bot_commands"
                value={formData.telegram_bot_commands || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Готовые ответы для кнопок из меню"
            description="Команда, затем с новой строки ответ бота и затем в новой строке разделитель ##."
            popover="Вы можете создать кнопки, которые будут выдавать заранее подготовленные ответы без генерации нового текста. Это экономит токены и время. Для этого сперва создайте в поле 'Кнопки меню' нужную вам кнопку, например 'Оферта'. Затем в поле 'Готовые ответы для кнопок из меню' Напишите точно такое же название кнопки 'Оферта', а лучше скопируйте и вставьте, затем с новой строки вставьте текст к этой кнопке (в примере с офертой сам текст оферты). Важно: если не будет совпадать хоть один символ названия кнопки и её дубля в этом поле настроек, то ничего не появится, когда нажмете на кнопку; если перед или после кнопки будет лишний пробел или символ, всё что будет отличаться от названия кнопки, то ничего не появится, когда нажмете на кнопку; если описание к этой кнопке будет вставлено не с новой строки, а как-то иначе, то ничего не появится, когда нажмете на кнопку."
        >
            <textarea
                name="telegram_bot_menu_help"
                value={formData.telegram_bot_menu_help || ''}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
      </div>

      {/* Функционал */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Функционал:</h4>
        <Field
            label="Количество подсказок"
            description="Эти автоматические подсказки будут под ответом бота в виде инлайн-кнопок."
            popover="Можно настроить количество подсказок, которые будут отображаться под ответом бота в виде inline-ссылок, еще их называют инлайн кнопки. Сперва необходимо включить режим Inline в настройках @Botfather. Затем установите количество подсказок в поле “Количество подсказок”."
        >
            <input
                type="number"
                name="telegram_bot_inline_tips"
                value={formData.telegram_bot_inline_tips || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Фраза во время ожидания ответа бота"
            description="Эта фраза исчезнет сразу после получения ответа от бота."
            popover="Вы можете задать фразу, которая будет отображаться во время ожидания ответа от бота. Например, «⏳ Думаю ....». Вот так можно чередовать фразы, которые показываются пользователю в телеграмм боте во время ожидания ответа: ⌛️##👀##✨##🕰Минуточку...##⌚️Ожидайте...##💫##👨‍💻##💻##⌨️##📝##💬##🤖"
        >
            <input
                type="text"
                name="ai_wait_message"
                value={formData.ai_wait_message || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <CheckboxField
            name="telegram_bot_localization"
            label="Локализация"
            caption="Автоматически переводит текст кнопок в меню бота и готовые ответы на язык пользователя."
            checked={!!formData.telegram_bot_localization}
            onChange={handleChange}
        />
      </div>

      {/* Обязательная подписка */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Обязательная подписка на канал:</h4>
        <Field
            label="Канал подписки"
            description="Проверка подписки на канал для использования Телеграмм бота."
            popover="Вы можете настроить бота так, чтобы он требовал подписку на ваш канал или чат перед началом общения. Для этого добавьте бота в качестве администратора канала или чата и укажите соответствующий ID. Укажите канал в таком виде - @mychannel или id чата в виде -100XXXXXXXXX)."
        >
            <input
                type="text"
                name="channel_subscription"
                value={formData.channel_subscription || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Текст предупреждения о необходимости подписки"
            description="Обязательно добавьте вашего бота в качестве администратора канала."
            popover="В это поле например: Для использования бота подпишитесь на @protalk_official."
        >
            <textarea
                name="subscription_message"
                value={formData.subscription_message || ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
      </div>

    </div>
  );
};

export default TelegramTab;