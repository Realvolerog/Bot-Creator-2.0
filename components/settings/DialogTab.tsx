import React from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

interface DialogTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const DialogTab: React.FC<DialogTabProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Параметры ведения диалога</h3>

      {/* Ограничения */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Ограничения:</h4>
        <Field
            label="Максимальная длина сообщения от пользователя (в символах)"
            description="Вы можете ограничить максимальную длину сообщения, которое пользователь может отправить боту."
            popover="Это помогает контролировать расход токенов и предотвращает отправку слишком длинных сообщений, которые могут перегрузить систему. Например, вы можете установить ограничение в 1000 символов. Если пользователь превысит это ограничение, бот отправит сообщение с просьбой сократить текст."
        >
            <input 
                type="number" 
                name="user_message_max_len" 
                value={formData.user_message_max_len || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
         <Field
            label="Сообщение при превышении максимальной длины"
            description="Здесь вы должны написать текст предупреждения о превышении максимальной длины сообщения."
        >
            <textarea
                name="user_message_max_len_error"
                value={formData.user_message_max_len_error || ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Лимит сообщений на 1 пользователя в течении 24 часов"
            description="Вы можете ограничить количество сообщений, которые пользователь может отправить боту в течение 24 часов. Например, не более 30 сообщений в сутки."
        >
            <input 
                type="number" 
                name="daily_messages_limit" 
                value={formData.daily_messages_limit || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Общий лимит сообщений на пользователя за все время"
            description="Вы можете задать общее количество сообщений, которые пользователь может отправить за все время использования бота."
            popover="Эти настройки позволяют вам контролировать расход ресурсов и строить экономическую модель для вашего бота, определяя стоимость его использования. Предположим, ваш бот предназначен для проведения одноразовой акции, например, оповещения новых клиентов. В этом случае имеет смысл установить жесткие лимиты, чтобы бот выполнил свою задачу и больше не взаимодействовал с пользователем. Это предотвратит попытки манипуляции ботом и использование его в других целях. Например, укажите 150 сообщений, после чего бот перестанет отвечать этому пользователю."
        >
            <input 
                type="number" 
                name="user_messages_limit" 
                value={formData.user_messages_limit || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
         <Field
            label="Предупреждение о превышении лимита сообщений"
            description="Обязательно напишите предупреждение, которое будет видеть пользователь, если вы установили значение в поле лимита."
        >
            <textarea
                name="user_messages_limit_warning"
                value={formData.user_messages_limit_warning || ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
      </div>

       {/* Задержки */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Задержки:</h4>
        <Field
            label="Задержка отправки сообщения (сек.)"
            description="Чем больше значение, тем дольше будет длиться ожидание ответа, но зато человек может успеть написать несколько отдельных фраз и они будут переданы боту в едином пакете. Минимум 10 сек."
            popover="По умолчанию бот отвечает сразу после обработки запроса. Однако, если вы хотите, чтобы бот имитировал человеческое поведение, вы можете установить задержку, например, в 20 секунд. Это позволит пользователю подумать и, возможно, дополнить свой запрос, прежде чем бот ответит. Такая задержка может быть полезна для создания более естественного взаимодействия."
        >
            <input 
                type="number" 
                name="accumulation_delay" 
                value={formData.accumulation_delay || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
         <Field
            label="Количество минут ожидания ответа от пользователя"
            description="Это поле используется совместно с сообщением от пользователя при долгом ожидании."
        >
            <input 
                type="number" 
                name="user_wait_timeout" 
                value={formData.user_wait_timeout || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
         <Field
            label="Сообщение боту от пользователя при долгом ожидании"
            description="Сюда напишите фразу, что как будто сам пользователь о чем-то попросил бота и она отправится спустя время."
            popover="Эта функция позволяет боту отправлять сообщение пользователю, если тот не отвечает в течение определенного времени. Например, если пользователь не отвечает в течение 5 минут, бот может задать вопрос, чтобы напомнить о диалоге. Это особенно полезно в продажах, где бот может использовать новые аргументы для убеждения клиента."
        >
            <textarea
                name="user_wait_message"
                value={formData.user_wait_message || ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
      </div>

       {/* Дополнительно */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Дополнительно:</h4>
        <Field
            label="Приоритетная инструкция"
            description="Записанная в этом поле команда будет иметь статус выше, чем все другие в промпте. Используйте, когда например, необходимо принудительно выдать результат функции в диалог с пользователем."
        >
            <textarea
                name="hidden_user_message"
                value={formData.hidden_user_message || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Активационная фраза"
            description="Диалог начнется только, если данная фраза будет присутствовать в первом сообщении боту."
            popover="Активационная фраза — это специальное слово или фраза, которая запускает диалог с ботом. Она действует как пароль, необходимый для начала общения. Если бот еще не начал диалог, он не будет реагировать на сообщения, пока не будет произнесена активационная фраза. Это предотвращает случайные активации и обеспечивает контроль над началом взаимодействия. Активационная фраза может использоваться не только в Telegram, но и в других платформах, таких как WhatsApp или CRM-системы, например, Битрикс24. Например, если клиент хочет получить скидку, он может использовать промокод в качестве активационной фразы. После этого бот начнет взаимодействие и предоставит необходимую информацию или услугу."
        >
            <input 
                type="text" 
                name="activation_phrase" 
                value={formData.activation_phrase || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
        <Field
            label="Имя на которое реагирует бот в группах"
            description="Внимание! В WhatsApp бот будет отвечать только если это имя упоминается в вопросе через /."
            popover="Введение бота в групповые чаты может значительно улучшить взаимодействие и автоматизировать многие процессы. Однако, чтобы бот не мешал общению между участниками, необходимо правильно настроить его поведение. В этом разделе мы подробно рассмотрим, как сделать так, чтобы ваш бот реагировал только на определенные команды и не отвлекал участников чата. Для начала, добавьте бота в чат в качестве администратора. Это позволит ему иметь доступ ко всем сообщениям и выполнять необходимые действия. Чтобы бот не отвечал на каждое сообщение, настройте его так, чтобы он реагировал только на упоминание своего имени. Это имя должно быть уникальным и чувствительным к регистру. Например, если вашего бота зовут 'Вася', он будет реагировать на сообщения, содержащие 'Вася', 'вася', 'ВАСЯ' и т.д. Убедитесь, что имя бота уникально и не используется в других контекстах в чате. Это предотвратит случайные активации бота. Сообщите участникам чата о том, как обращаться к боту. Это поможет избежать недоразумений и обеспечит корректное взаимодействие. В некоторых системах возможно переключение между ботами по имени. Это позволяет направлять диалоги к нужному боту, просто упоминая его имя."
        >
            <input 
                type="text" 
                name="tag_name" 
                value={formData.tag_name || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
        </Field>
      </div>

    </div>
  );
};

export default DialogTab;