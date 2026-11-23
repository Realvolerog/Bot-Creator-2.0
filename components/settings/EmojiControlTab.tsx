import React from 'react';
import type { BotSettings } from '../../types';
import { Field, InfoPopover } from './FormControls';

interface EmojiControlTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmojiControlTab: React.FC<EmojiControlTabProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold">Управление по эмодзи/фразам</h3>
        <InfoPopover content="Отправлять стоп-эмодзи можно только из чата сервиса, к которому привязан ваш номер телефона" />
      </div>

      <div className="space-y-4">
        <Field
          label="Цель выполнена"
          description="Если бот пишет первым и его нужно остановить, когда цель достигнута. Цели задаются в промпте."
          popover="Бот может автоматически завершить диалог, отправив заранее заданный эмодзи, когда цель взаимодействия достигнута. Например, если бот должен предоставить информацию и завершить общение, он отправит соответствующий набор эмодзи, сигнализируя о завершении."
        >
          <input
            type="text"
            name="emoji_dialog_success"
            value={formData.emoji_dialog_success || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="🌟🌟🌟"
          />
        </Field>

        <Field
          label="Завершить диалог"
          description="Если бот пишет первым и его нужно остановить, когда цель не была достигнута. Цели задаются в промпте."
          popover="Вы можете задать условия, при которых диалог будет завершен. Это может быть полезно, если клиент благодарит бота или если цель взаимодействия не достигнута, но клиент попрощался. Условия могут быть настроены в промпте так, чтобы бот завершал диалог в зависимости от различных событий."
        >
          <input
            type="text"
            name="emoji_dialog_finish"
            value={formData.emoji_dialog_finish || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="☑️☑️☑️"
          />
        </Field>
      </div>

      <div className="flex items-center justify-center my-4">
        <img src="https://i.1.creatium.io/disk2/2f/fa/e8/bb2b373772c1e7650e282fce17a15f276d/0x0/zero.svg" alt="Separator" className="opacity-30 dark:opacity-50" />
      </div>

      <div className="space-y-4">
        <Field
          label="Остановить работу бота на 24 часа"
          description="Пригодится, когда мы хотим остановить бота, чтобы человек мог сам продолжить писать клиенту."
          popover="Остановить или активировать бота можно внутри диалога незаметно для собеседника, для этого используйте эмодзи или кодовое слово в зависимости от ситуации. Активация режима действует 24 часа. Вы можете остановить бота, отправив определенный набор эмодзи из чата, где происходит взаимодействие с ботом. Это особенно полезно, если вы хотите вмешаться в диалог или изменить его направление. Оператор может вмешаться в диалог, отправив уникальный эмодзи или набор символов, чтобы остановить бота и взять управление на себя. Это может быть полезно, если диалог идет не в том направлении или требуется личное общение."
        >
          <input
            type="text"
            name="emoji_dialog_pause"
            value={formData.emoji_dialog_pause || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="✅✅✅"
          />
        </Field>
        
        <Field
          label="Возобновить работу бота"
          description="Пригодится, когда мы хотим остановить бота, если человек решил вернуть текущий диалог себе."
        >
          <input
            type="text"
            name="emoji_dialog_resume"
            value={formData.emoji_dialog_resume || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="👋👋👋"
          />
        </Field>

        <Field
          label="Остановить диалог с пользователем навсегда"
        >
          <input
            type="text"
            name="emoji_dialog_end"
            value={formData.emoji_dialog_end || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="⛔⛔⛔"
          />
        </Field>

        <Field
          label="Возобновить остановленный навсегда диалог"
        >
          <input
            type="text"
            name="emoji_dialog_start"
            value={formData.emoji_dialog_start || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="🏁🏁🏁"
          />
        </Field>
      </div>
    </div>
  );
};

export default EmojiControlTab;