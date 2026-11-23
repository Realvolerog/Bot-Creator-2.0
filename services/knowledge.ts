export const proTalkKnowledgeBase = `
# База знаний о настройках ИИ-агентов ProTalk

## Поля настройки бота поддерживаемые API:

### 👤 **Личность и промпт**
- **company** - Название компании, которой принадлежит бот
- **bot_position** - Должность бота
- **bot_gender** - Пол, который бот использует в общении (Варианты значений: 'Мужчина' / 'Женщина')
- **bot_language** - Язык общения бота (Варианты значений: 'Русский' / 'English')
- **greeting** - Приветственное сообщение от бота
- **role** - Основной системный промпт бота (System Message). Самая приоритетная часть настроек.
- **official** - Флаг для обозначения официального бота (boolean)
- **purpose** - (Устаревшее) Не используется.
- **behavior** - (Устаревшее) Не используется.

### ⏰ **Режим работы**
- **communication_type** - Тип коммуникации (Варианты значений: 'Пишу первый' / 'Жду обращения')
- **working_hours_start** - Время начала работы бота
- **working_hours_end** - Время окончания работы бота
- **working_time_warning** - Предупреждение о нерабочем времени

### 🧠 **Интеллект**
- **ai_model** - Модель AI, используемая ботом
- **creativity** - Уровень креативности ответов бота
- **voice_name** - Выбранный голос для синтеза ответов
- **elevenlabs_voice_id** - ID голоса в сервисе ElevenLabs
- **external_promt_url** - URL для внешнего промта или внешней роли
- **debug_mode** - Режим отладки для бота
- **openai_assistant_id** - ID ассистента в OpenAI
- **openai_assistant_api_key** - API ключ для ассистента OpenAI
- **api_server** - Сервер API (API Node). Выбор сервера для обработки запросов. Варианты: Россия ('reczWMaD9akpFAiny'), Европа ('rec72jrpu8RLBfXki'), США ('recVoxPn7QzCZEnJZ').

### 🛠️ **Функции**
- **qa_pairs** - Данные в формате вопрос-ответ
- **website_section** - Специальный раздел сайта
- **goal_trigger** - Триггер при достижении цели диалога
- **finish_trigger_1** - Первый триггер окончания диалога
- **finish_trigger_2** - Второй триггер окончания диалога
- **transfer_trigger** - Триггер для активации перевода
- **boss** - Флаг роли Руководителя для других ботов
- **tool_choice** - Обязательный запуск функций при ответе
- **tool_once** - Удаление функции после однократного запуска
- **tool_multi** - Запуск нескольких функций одновременно
- **checklist** - Чек-лист для режима Руководитель

### 📚 **Базы знаний (Embeddings)**
- **embeddings_plain** - Режим отладки базы знаний
- **openai_vector_store_id** - ID векторного хранилища OpenAI

### 🧠 **Постоянная память**
- **external_log_url** - Запись логов в Google таблицу

### 📡 **Каналы коммуникаций**
- **channel** - Основной канал связи бота в режиме "Пишу первым" (Варианты значений: 'WhatsApp' / 'Telegram' / 'TelegramBot')
- **whatsapp_number** - Номер WhatsApp для первого сообщения
- **telegram_number** - Номер Telegram для первого сообщения
- **website** - Сайт для виджета бота
- **chatra_api** - API ключ для Chatra
- **umnico_api** - API ключ для Umnico
- **umnico_id** - ID каналов Umnico (режим ожидания)
- **umnico_id_first** - ID каналов Umnico (режим первого сообщения)
- **jivo_token** - Токен для Jivo
- **jivo_provider_id** - Provider ID для Jivo
- **coze_bot_api_key** - API ключ для Coze бота
- **coze_bot_id** - ID бота в Coze
- **wapico_instance_id** - ID экземпляра Wapico
- **wapico_access_token** - Access token для Wapico
- **whapi_token_in** - Входной токен WHAPI
- **whapi_token_out** - Выходной токен WHAPI
- **whapi_channel_id_in** - ID входного канала WHAPI
- **whapi_channel_id_out** - ID выходного канала WHAPI
- **wazzup_api_key_in** - Входной API ключ Wazzup
- **wazzup_api_key_out** - Выходной API ключ Wazzup
- **wazzup_channels_in** - Входные каналы Wazzup
- **wazzup_channels_out** - Выходные каналы Wazzup
- **greenapi_token_in** - Входной токен GreenAPI
- **greenapi_token_out** - Выходной токен GreenAPI
- **greenapi_id_in** - Входной ID GreenAPI
- **greenapi_id_out** - Выходной ID GreenAPI
- **chat2desk_api_key_in** - Входной API ключ Chat2Desk
- **chat2desk_operators_in** - Операторы Chat2Desk
- **wb_token** - Токен для WildBerries
- **wb_items** - Элементы для WildBerries
- **talkme_tokens_in** - Токен для Talkme

### 📱 **Телеграм бот**
- **telegram_bot_token** - Токен Telegram-бота
- **telegram_bot_name** - Никнейм Telegram-бота
- **telegram_bot_menu_help** - Ответы на команды Telegram
- **telegram_bot_localization** - Настройки локализации
- **telegram_bot_inline_tips** - Количество автоматических инлайн кнопок
- **tag_name** - Имя тега для групповых чатов
- **telegram_bot_commands** - Список команд для меню
- **ai_wait_message** - фраза ожиданя ответа бота

### 💰 **Монетизация**
- **user_tokens_limit** - Лимит бесплатных токенов
- **user_tokens_cost** - Стоимость пакета токенов
- **user_tokens_buy** - Количество токенов в пакете
- **user_tokens_warning** - Предупреждение об окончании токенов
- **user_period_warning** - Предупреждение об окончании периода
- **user_tokens_share** - Бонусные токены за реферала
- **user_days_share** - Дни в подарок за реферала
- **fork_cost** - Стоимость бота в магазине
- **fork_video** - Видео для магазина ботов
- **fork_description** - Описание бота для магазина
- **in_store** - Публикация в магазине ботов (Варианты значений: 'Все пользователи' / 'Только по приватной ссылке' / 'Никто')
- **regular_payment_sum** - Сумма регулярного платежа
- **regular_payment_period** - Период регулярного платежа
- **regular_payment_test_period** - Тестовый период
- **payments_mode** - Режим платежей (Варианты значений: 'Продажа пакетов токенов' / 'Регулярные платежи по подписке')
- **currency** - Валюта платежей боту (Варианты значений: 'Рубли' / 'Звезды Телеграм')
- **referral_period_bonus_message** - Бонус за реферала (период)
- **tokens_bonus_message** - Бонус за реферала (токены)
- **user_day_bonus_tokens_limit** - Лимит бонусных токенов в день

### 🔗 **Лидогенерация**
- **leads_email** - Email для сбора лидов
- **leads_telegram_token** - Токен Telegram-бота для лидов
- **leads_telegram_chat_id** - Chat ID для отправки лидов
- **leads_bitrix_webhook** - Webhook для Bitrix
- **leads_amocrm** - Токен доступа к AmoCRM
- **leads_amocrm_url** - URL для интеграции с AmoCRM
- **bitrix_webhook** - Webhook для интеграции с Bitrix
- **leads_google_doc** - Google документ для сбора лидов

### 🗨️ **Диалоговые настройки**
- **hidden_user_message** - Скрытое сообщение до начала диалога
- **message_limit** - Количество сообщений в памяти бота
- **accumulation_delay** - Задержка накопления сообщений
- **ai_wait_message** - Сообщение ожидания генерации
- **user_wait_message** - Иммитационное сообщение
- **user_wait_timeout** - Таймаут ожидания сообщения
- **user_message_max_len** - Максимальная длина сообщения
- **user_message_max_len_error** - Ошибка превышения длины
- **keep_thread** - Сохранение предыдущего диалога
- **tags** - Теги для поиска бота
- **user_messages_limit_warning** - Предупреждение о лимите сообщений
- **daily_messages_limit** - Ежедневный лимит сообщений
- **user_messages_limit** - Общий лимит сообщений пользователя

### 🔒 **Защита бота**
- **channel_subscription** - Telegram-канал для проверки подписки
- **subscription_message** - Сообщение о необходимости подписки
- **moderator_prompt** - Промпт для модератора ответов

### 🎮 **Управление по эмодзи/фразам**
- **emoji_dialog_success** - Эмодзи успешного завершения
- **emoji_dialog_finish** - Эмодзи завершения диалога
- **emoji_dialog_pause** - Эмодзи паузы в диалоге
- **emoji_dialog_resume** - Эмодзи продолжения диалога
- **emoji_dialog_end** - Эмодзи окончания диалога навсегда
- **emoji_dialog_start** - Эмодзи возобновления диалога
- **activation_phrase** - Фраза активации бота

### ⏰ **Активация по расписанию**
- **activation_period** - Период активации бота
- **start_auto_launches_date** - Дата начала автоматических запусков

## Доступные функции (чем выше номер, тем свежее функция):

№795 'rec6pp0nsLxHVCXgW' - Извлечение открытых данных из топ-10 мировых социальных сетей
№794 'rec1Caf6egskUVTXc' - Поиск в интернете, чтение содержимого страниц и глубокое исследование
№787 'recUaAbcec8qVxeEV' - Генерация фото от ProTalk
№785 'recRS9MfhwlVhBOFl' - calculate_vedic_kundli (Расчет ведической карты рождения)
№783 'reccDwwXYwUBxAaAk' - Генерация изображений моделями Qwen Image 2.1 Turbo/Pro
№782 'recSxsWtyek17cXgX' - Склеивание нескольких аудио- или видеофрагментов в один файл
№781 'recrqFeQf2hmqjfuW' - Синтез речи (Text-to-Speech) с использованием модели xAI Grok Voice TTS 1.0
№780 'recFBJDWDvyV7RUP3' - Поиск актуальной информации в интернете с помощью модели Google Gemini
№777 'recKiokIywxFqeenu' - Создаёт лид и передаёт задачу клиента специалисту через внешний runtime
№775 'recpEeBWmHC3Zl9sd' - Telegram: универсальная публикация текста, фото, видео и альбомов
№772 'rec0GNHXE7kptZ0kd' - Единая студия видеопродакшна Gemini Omni
№769 'recSD99LGYcSuwmzt' - Конвертация Excel-файла (.xlsx, .xlsm) в облачную БД PostgreSQL
№767 'reczMqmaa1glkVByZ' - Дать задачу агенту ProTalk Bot
№766 'rec2WJB90bms7Uqlj' - Управление облачными базами данных PostgreSQL Lubanya DB Cloud
№762 'recHAAhGwkNXPVdSN' - Определение страниц с чертежами и инженерными схемами в PDF-документе
№759 'recUMIWA5IKuNIzRE' - Генерация видео с помощью модели Gemini Omni Flash 1.1
№757 'rec0cBXIKsY5jqMq7' - Преобразует аудио в текст моделью Gemini 3.7 Flash
№754 'recgNo4UC3YlaynEQ' - Создает документ Excel (.xlsx)
№753 'recjKyoQpSxrmJi5l' - Генерация и редактирование изображений с помощью модели GPT Image 2.5 Flare/Sunburst
№744 'recY8MvWXJ7Lq5Qks' - Автономный исследовательский ИИ-агент для глубокого анализа документов (PDF, DOCX, XLSX, изображений, схем и чертежей)
№726 'recRUaL3nVN2OQmUw' - Получает данные о стартапах с верифицированной выручкой
№723 'recWNtuuc8TrtpK5M' - Выполняет запрос к API: поиск в Google, поиск в Яндексе или сбор статистики Яндекс.Wordstat
№719 'recRIidTrH8Raxev1' - Глубокие исследования (Deep Research) через Google Gemini
№718 'recbsrfKbS1lcEvkn' - Отправка лида в Telegram
№713 'rec5dryrNRDDuZ2zL' - Генерация видео Omnihuman 1.5 с липсингом выбранного человека в кадре
№712 'recylInbBk5BKgPkV' - Генерация и редактирование фото с помощью модели qwen-image-3-pro
№711 'recSIujsKX76UQ2nI' - Создание лида в DF CRM 2.0
№710 'recnVbnNDub02kvna' - Универсальная генерация видео через OpenRouter
№707 'recRMpywYCRo7I6BC' - APK Builder Service — сборка Android APK из исходников.
№706 'recdPD8haaDumEI3T' - Озвучивание текста через модель google/gemini-3-1-flash-tts
№701 'recNEqdC3KvFdYeQ8' - Создание фильма в AgentCore
№700 'reclhAyMBnyVUI5pk' - Генерация photo с помощью модели krea-2-medium-turbo
№699 'rec5Uodtz6mMtJ6Go' - Новые (свежезарегистрированных) домены по заданным критериям
№697 'recHuEeEhz6Fq3r19' - Генерирует отчет с визуализацией данных через GPT Image 2 и отправляет результат в Telegram или на почту
№696 'rec15yg3UOW4Wd8Da' - Supabase MCP
№692 'rec2ISNOb1CvW1une' - Распознавание изображений моделями Openrouter
№691 'recaiOCtIP6Zd0GuK' - Отправка события в сервис Pulse (https://github.com/atiksorg/pulse)
№690 'recuHFLow5tAMZrxo' - Распознование photo моделью Claude Sonnet 5
№689 'recSBZKMnI1UMpkZl' - Работа с мультимодальной моделью Gemini (gemini-3.1-flash-lite-image): генерация изображений или анализ photo
№688 'recmSD2V6dobRPJl0' - Генерация изображений по текстовому описанию через Yandex Alice AI ART API
№687 'recdTq1DD0scaGgWe' - Поиск изображения через Yandex Search API
№686 'recyEJn0XxlXDZmAq' - Создаёт или редактирует XLSX-файл (Excel). Вызывай, когда пользователь просит сделать таблицу, отчёт, смету, прайс-лист, дашборд с графиками или изменить существующий XLSX
№685 'recRaf9OmkZLs3wlj' - Создаёт или редактирует DOCX-файл. Вызывай, когда пользователь просит сделать документ Word, отчёт, договор, презентацию, резюме или изменить существующий DOCX
№684 'rec27VaYLsFP6PwyT' - Интеграция с каталогом скилов для ИИ агентов ProTalk AI Skills
№683 'recOR8T9RYOEfZhmg' - Генерация видео по тексту или изображению с использованием модели Grok Imagine Video 1.5 Preview.
№682 'recNvRMthLZrUp4Ia' - Анализ сделок в CRM 2.0
№680 'recUbBeRKxmJZxo70' - Набивка сметы в CRM
№679 'recdLzEdwogSXfOoH' - Загрузка файлов в лида в CRM
№678 'recBQLyU9wqa9Rsb0' - Калькулятор кровли
№677 'rec4d5xvM2I2wPpxt' - Поиск лида в CRM
№676 'recBgVU5LzyVeg1kq' - Постановка задачи в DF CRM
№675 'recckNN7ZAZhIciEt' - Создание лида в DF CRM
№674 'recVa6IZbuunMKoN7' - Добавление подписчиков в чат Телеграм и проверка их количества
№673 'recxyRTFfScL1VgP6' - Анализ файлов при помощи OpenAI (через openrouter) v2
№672 'rec1H3rxW6oCI8FJG' - Создаёт пользовательский голос Suno из аудиозаписи пользователя
№670 'reciwJUQZH2Jw8RDV' - Деплой приложений в облако Любани
№669 'recr5KEOoTBgz8mX8' - Видео-аватар на основе изображения и аудио с помощью Kling Ai Standart
№666 'recxwpJqPI4FI8v58' - Генерация/редактирование видео через HappyHorse
№664 'recpHGeW593X16nn6' - Генерация и редактирование изображений GPT Image 2
№662 'recSmZb0rCnE6RH98' - Генерация video через Bytedance Seedance 2.0 (Pro версия с поддержкой 1080p). Поддерживает Text-to-Video, Image-to-Video (первый/последний кадр), мультимодальные референсы
№661 'recqGu7nTOOtnDjhy' - Генерация видео через Bytedance Seedance 2.0 Fast
№660 'recyWBhOhAbiVMuCM' - Создание видео на основе изображения и текстового запроса через Kling 2.6 Pro (fal.ai)
№659 'recAElnHc4HYNqhf0' - Генерация 3D-модели из изображения моделью Tripo3D 2.5
№658 'recBdEWr15hOYyPXS' - Запускает парсинг веб-сайта, ожидает результат и возвращает ссылку на файл
№657 'recMj1jK99FFhqwhT' - Получить скриншот сайта по указанному URL
№656 'recQsiqQAvgJw9ZXI' - Получает информацию о клиенте и его активных сделках из ProTalk CRM по chat_id
№655 'recmzll60qIuWKn4o' - Перемещает существующую сделку (лид) на новый этап в ProTalk CRM
№654 'recNIefPYqWlnlnb9' - Получает информацию о воронке ProTalk CRM, включая список всех стадий и данные о текущей стадии для указанного бота
№653 'recYgHMqAolIpYE97' - Создает или получает существующую сделку в ProTalk CRM по ID стадии и chat_id
№651 'recVFh2FLxBD6D5OQ' - Генерирует музыку с помощью ElevenLabs
№650 'recSsC4xotstYcozY' - Генерации изображения через Grok Imagine
№648 'rec37ciIBNRww7GFy' - Изменение настроек профиля пользователя
№647 'recK6Iohw9vQ28ExK' - Генерация видео с помощью модели Veo 3.1 Lite
№646 'rec9MtLhNCqQa0brO' - Публикация поста в канал MAX
№645 'recC598rJTSJDb5qM' - Генерация photo в Yandex Art
№644 'recqT7x0gZUAhbkiq' - Генерация изображений Agnes-image-1.2
№643 'receRDUbmNLLljuRI' - Извлечение текста из PDF с помощью компьютерного зрения
№642 'rec2HuBuONeo5pCM3' - Генерирует песню через Gemini (Lyria)
№641 'recUq7u0CeI6IGwFC' - Загружает файлы в папку на Google диске через AppScript
№640 'recRNzmfBoL7lMNNz' - Омниканальный вопрос к ИИ: текст, аудио, видео, photo в одном запросе
№639 'rech96oRBg2O43JX8' - Скачивает все файлы из публичной папки Яндекс.Диска и возвращает их в виде ссылок
№638 'recnnIvtomw9diaYw' - Создает или изменяет изображение с помощью моделей Qwen2
№637 'rec20KjAtvqe5Jb5M' - Сохранение файла на Яндекс.Диск через WebDAV в указанную папку с заданным именем файла
№636 'recooxmzY2zSFLcJk' - Генерация видео Kling-3.0 (audio, motion control, multi-shot)
№633 'recjT5tX8Qs64Hc1Z' - Работа с картой памяти
№632 'recG4UkbAT2vcVQpa' - Транскрибация аудио в текст от ElevenLabs
№631 'recnsElT8ikNfTEEe' - Создает звуковой эффект на основе текстового описания с использованием Elevenlabs Sound Effect Model
№630 'recmIXFQblAvBOUyC' - Генерация видео на основе звука от Infititalk
№629 'recDi22Tz0cDFWTFj' - Преобразует текст в речь с помощью ElevenLabs Speech Multilingual V2
№628 'recNVNTMCx7VL1aMV' - Начать диалог с клиентом первым через Pact. Поддерживает каналы: WhatsApp, Telegram Personal, VKontakte Direct, MAX, WABA
№627 'recaOugRJKOCFxFDb' - Очистка аудио от шума
№626 'recOmY0VjntbJ6kX7' - Работа с браузером используя ProTalk Claw
№625 'rec74toSIJRs9Q95a' - Создание мини приложений для мессенджера MAX используя ProTalk Claw
№624 'rec8ItfGdZfyOIS2A' - Анализирует содержание видео или ролика YouTube с помощью ИИ Gemini 3.1 Flash
№623 'rec0mWuCwY1gxxmuW' - Поиск отелей через ПоисКОТ
№622 'rech4KgkdS8R5Rqx2' - Создание готовых Телеграм Ботов используя ProTalk Claw
№621 'recuUX14z6koKv5DA' - Генерация изображений с помощью модели Grok Imagine 
№620 'recXxOkvUuikfUlyn' - Генерация или редактирование photo через Flux (flux-2-pro)
№619 'rec1E8lXCb644RXwz' - Генерация, редактирование и получение статуса видео через grok-imagine-video
№618 'recf1yTNUggY0hH7y' - Генерация или редактирование изображения с помощью GPT Image 1.5
№617 'recqrlwERVRKn3eoC' - Создание расширений для Google Chrome используя ProTalk Claw
№616 'reccre7MXc1mQ61Ig' - Создание сайтов используя ProTalk Claw
№614 'recfFTd6GnBFfbb3I' - Генерация изображений через Flux.2-Klein-4b
№612 'rec6eEt6AeGsdsRN3' - Генерация изображений в высоком разрешении с помощью модели Nano Banana 2 (4K)
№611 'recNPt1mf8D4jKMHn' - Генерация изображений в высоком разрешении с помощью модели Nano Banana 2 (2K)
№610 'recgXZe0R31Fk7fkJ' - Генерация изображений в высоком разрешении с помощью модели Nano Banana 2 (1K)
№609 'recrf5rq2LDPvGTzJ' - Генерация изображений с помощью модели Z-Image (Tongyi-MAI)
№607 'recGzW4mdseVEjhuo' - Генерация видео через ByteDance V1 Pro модели (text-to-video и image-to-video)
№606 'recNps1kqGeDCM5fj' - Выполняет bash команду на Linux сервере с Ubuntu 22.04
№605 'recOkGJxHSkqMYVaZ' - Генерация и редактирование изображений с помощью модели Nano Banana Pro (2K)
№621 'recblE355FUQhrWjc' - Генерация и редактирование изображений Nano Banana (Gemini 2.5 Flash Image)
№603 'recWGzez8YDGSadlE' - Генерация и редактирование изображений Nano Banana Pro 4K (Gemini 3 Pro Image)
№600 'recVOWYBkcl2nBYog' - Публикация видео на YouTube
№598 'rec4JGlZP5YovLIhD' - Анализ файлов при помощи OpenAI (через openrouter)
№595 'rechqX18LLm7mvIcW' - Мгновенный запуск исходящего диалога через бота, подключенного к выбранному каналу коммуникации
№594 'receneuJZWifyBKGr' - Читает строки из таблицы/базы данных Yonote
№593 'recImX7mXeekC38Kq' - Добавляет новую строку (документ) в базу данных Yonote
№591 'rec3FcLE5wjoEXtED' - Получение опыта по UID из приложения Experience Extractor AI в формате MarkDown
№589 'recwOEcVHpwGDj1ga' - Генерация нового ИИ агента для сотрудника AI Tower
№588 'rec42C55O1bXDzkgP' - Функция позволяет обновлять текстовый блок между тегами ##ROLE.BOT.START## и ##ROLE.BOT.END## в указанном документе Google Docs. Это удобно для динамического изменения роли или инструкций бота, хранящихся в Google документах.
№538 'recbXuJ2X7VdN3vUa' - Отправляет электронные письма с фильтрацией email-адресов и пакетной отправкой
№536 'recXjhIwxfL3IOj2a' - Создает XLSX документ
№535 'recfgJUg1YHOquOiv' - Создание видео на основе изображения и текстового запроса через Kling
№534 'recPPh350dkrO2iP3' - Получить содержимое документа из Yandex Disk по публичной ссылке (поддерживаемые форматы: CSV, XLSX/XLS, DOCX)
№533 'recSL3wN1OVNotKYH' - Получить отфильтрованные данные из Яндекс таблицы
№531 'recWDEiTmLx08AmfV' - YClients: Онлайн запись на услугу (работает)
№530 'recrw4aWXcJuPqr9q' - Поиск записей в облачной базе данных PostgreSQL
№529 'recDCGVJ13kp7p2ZQ' - Поиск записей в базе данных SQLite
№528 'recdX4xziUTCSl0eb' - Поиск записей в базе данных 1C
№527 'recKmZZPEWVKqJ8dG' - Преобразует текст в речь с помощью OpenAI Text-to-Speech (gpt-4o-mini-tts)
№526 'rec8HGVERjMcgpmYh' - Yclients: Поиск клиента по строке
№525 'recA9WWRqtNd0YyH3' - Создает и запускает задачу на выполнение функции. Возвращает task_id для последующего получения результата.
№524 'rec2MlPUTENMlyzCe' - Выполняет комплексный поиск поставщиков по артикулам запчастей используя множественные источники (Google, DuckDuckGo, LLM-поисковики). Извлекает контактную информацию с найденных сайтов, отправляет коммерческие предложения потенциальным поставщикам и генерирует детальный отчет.
№523 'recGmKQnvjfsD9xmO' - Генерирует детальный отчет о найденных поставщиках на основе данных контактов с сайтов. Анализирует emails, телефоны, соцсети, создает статистику и загружает отчеты в трех форматах (JSON, TXT, HTML) на внешний хостинг. Возвращает ссылки на отчеты и список email для массовой рассылки.
№522 'recfmHHHG9dKLRUDy' - Поиск сайтов в сети Интернет с использованием ИИ моделей. Функция обращается к нескольким LLM, которые возвращают только ссылки (URL), соответствующие заданному поисковому запросу.
№521 'recbA9wqrULRdsgkg' - Ищет цены для одного или нескольких товаров в тексте страницы
№520 'receRuoPGFqdGsGIZ' - Получение результата генерации видео с помощью модели Sora2
№519 'recjIROwBz1vesg1H' - Создание видео по текстовому запросу через Sora 2
№518 'recGdgzpmzMpARMMJ' - Генерация изображений с помощью API GPT-4o Image
№517 'recpWnYwIuBZn83aJ' - Поиск по картинкам в Google
№516 'recK57puS3DMfLynC' - Создаёт задачу типа api_call на сервере задач с указанными параметрами API
№515 'rec3PZFviy6DyhHvu' - Генерация изображений с помощью Midjourney (провайдер KIE.AI)
№514 'recEYYtBSnKK7SC6K' - Генерация видео с помощью модели Runway
№513 'rec3j9qpOUClcEKcH' - Получение последнего поста из VK сообщества
№512 'recvjfd9Eg1fe3Ehu' - Публикация поста в ВКонтакте с поддержкой фото и видео
№511 'rec4mO2OKsSXsKu2E' - Получение статистики по боту (токены, пользователи, сообщения)
№510 'recW3t2ZfpThBM9HP' - Разделение аудиофайла по ссылке на части (чанки)
№509 'recDioYesGELe3Q5u' - Обновляет стадию лида в Bitrix24 с поддержкой воронок
№508 'recgzv6hgkIIjNseH' - Отправляет запрос к выбранной ИИ модели и возвращает ответ
№507 'recmWSNgwlys7ULU3' - Загружает документ по URL (PDF), извлекает текст и конвертирует страницы в изображения. Результат в виде текста + ссылки на загруженные изображения.
№506 'reccdPD4FJP32mFRk' - Генерирует звуковой эффект из текстового описания с помощью ElevenLabs API и выдает готовый MP3 файл
№505 'recy278E3tnlB98VV' - Получает созданный трек по номеру задачи от сервиса Suno
№504 'recAQWgI6NEHbLs4h' - Получение результата генерации видео с помощью модели Veo3 через сервис KIE.AI
№499 'recuoVaPBle8ApocL' - Отправить аудиофайл на распознавание речи (до 5 минут)
№498 'recuFMc3QwKOo8crN' - Чтение email ящика через IMAP. Поддерживает фильтрацию, поиск. Возвращает отформатированный текст с письмами
№497 'recz50JFBKZzzsURl' - Поиск ключевых слов в файле (PDF, DOCX, XLSX) по URL. Возвращает сниппеты текста с выделенными совпадениями
№496 'recgYMjrgSkYyiKPn' - Переводит текст на указанный язык с помощью Google Translate API
№492 'reciSJtULLxBKO8FE' - Добавляет строки в Google Таблицу
№491 'recXVdwwTNcgBZZJc' - Анализирует веб-сайт компании и определяет тип бизнеса (производитель/дилер/маркетплейс) на основе настроек фильтрации
№490 'recMbHBDqtYGEorLX' - Выполняет поиск с использованием поисковой системы DuckDuckGo
№489 'recqEDz7Q1jhi4FCc' - Поиск в Google с помощью SerpAPI и возврат результатов
№487 'recuAtBkFDLW0b8Tu' - Сканирование штрих-кодов из изображений по URL и генерация новых штрих-кодов
№486 'recUk8c7ZAuHjHGy9' - Извлечение контактов со страницы в Интернет
№484 'recV6PwaerqbWZBuu' - Поиск контактов в Интернет
№483 'recHcCNI2U3cr9Mgb' - Получает данные из таблицы Supabase с поддержкой фильтрации и лимита строк
№482 'recVrEcKWKsTNvRgx' - Модерация Telegram чата: удаление сообщений, блокировка пользователей, автоматическое удаление уведомлений
№481 'recnBM0o3erT8NKf3' - Вызывает Edge функцию в Supabase с помощью POST запроса
№480 'recOGWJnQFgS4zXog' - Создает музыкальный трек через Suno
№478 'recJAWOwyI68Ma211' - Генерация видео с помощью модели Veo3 Fast через сервис KIE.AI
№477 'rec3WyXMF2T0dY3Ad' - Генерация видео с помощью модели Veo3 через сервис KIE.AI
№476 'reclTa7nZSCHFB9JM' - Редактирование фото с помощью модели Google Nano Banana (через сервис KIE.AI)
№471 'recph2xQjDMtcsjyu' - Анализирует одно или несколько изображений с помощью выбранной AI-модели через VseGPT API
№470 'recNKhtiuYc6ksaH1' - Получить список лидов из inbox Umnico с фильтрацией по статусам, тегам, пользователям и другим параметрам
№468 'recjWzb6IrXQg30BR' - Транскрибирует аудио из удаленного файла по URL в текст с использованием SpeechFlow API
№463 'recFK3TWDc5xRpQxQ' - Задать вопрос к OpenAI GPT-5 передав одновременно текст и изображения
№461 'recEZB8velgsGK8jV' - Генерация видео из текста/изображений с использованием моделей Z.AI CogVideoX-3
№460 'recQIJqznXy0pgMKM' - Задать вопросы сотруднику (Async)
№458 'recUHbp2M15Jhyxn3' - Создает и публикует новую вакансию на HeadHunter (hh.ru)
№457 'rec6nM7g31VtGGZA2' - Получает список откликов на вакансии компании HeadHunter с возможностью экспорта в файл
№451 'recldLTnkLpWEuv5C' - Изменяет данные обращения в системе Umnico
№450 'rec7dqVCUNftfXxcm' - Получает информацию о лидах из Umnico API
№449 'recKuqHVtodgsyF0q' - Создает напоминание в системе Umnico через API
№448 'rec4WKkqOlpVQMCBi' - Получает письма с Яндекс.Почты через IMAP протокол
№446 'recwyRI69invSuqyK' - [ВРЕМЕННО ОТКЛЮЧЕНА] Генерирует или редактирует изображение по текстовому запросу с помощью модели GPT-image-1 от OpenAI
№437 'rec7SPWDrRsKh2uKu' - Транскрипция аудиофайла по URL с разделением на голоса с помощью Speechmatics API
№436 'recbuZYcr8mKf9Utp' - Отправляет асинхронное сообщение боту через API ProTalk
№435 'recXT1qQFiQqZxmrV' - Запустить функцию ProTalk по номеру и параметрам
№434 'recXd8EvDvUumPXLC' - Получает стоп-кадры из видео YouTube, VK или RuTube по таймкодам
№433 'recIUJNHkicdwSUeh' - Создание Zoom-встречи (мгновенной или запланированной)
№432 'recDmoHNVIa8d19aP' - ИИ модератор сообщества в Telegram
№431 'recAxmx7sK8MBKt6y' - Чтение данных из базы данных Notion
№430 'recZLDl3Fr94Z3wTn' - Чтение или генерация QR кодов
№429 'recRdkUWlZVptmsxh' - Управление памятью в таблице MySQL
№428 'recViRIfgP2faUdBK' - Получить знания из векторной базы ProTalk
№426 'recZYd8iNKoMyrH0a' - Получить анализ структуры XML файла
№425 'recHiTXMjYyxFCRYb' - XML файл как база данных
№424 'rec0ri9lvzUy0fviu' - Чтение или экспорт всех параметров бота
№423 'recQCtAJ9L1VhGdOv' - Редактирование настроек бота ProTalk
№422 'reczsQC1JJ1HfOR5O' - Создает нового пользователя и настраивает его бота ProTalk с заданными параметрами
№418 'rectSDNj5dy0uMOll' - Публикация историй в Telegram через бота
№412 'recuorm9OTDN1uBWM' - Получить текущую погоду по координатам
№410 'recnKtiyawDKGnFzE' - Поиск услуг в YClients по id категории или id сотрудника
№409 'recfSJCb748vvFVsT' - Получение доступных сотрудников на услугу из Yclients
№408 'recKiRHUReIVNOIjT' - Получить список доступных временных слотов для записи к конкретному сотруднику на выбранную дату в системе Yclients
№406 'recLd04Ghi5O96562' - Круглый стол и ИИ агентами (ProTalk)
№405 'recxaZMToudpBc6n5' - Круглый стол с ИИ агентами (vsegpt)
№404 'recy10WAwkZs0XP0f' - Исследовательский запрос с помощью ИИ
№403 'rec5EA2nzycQkvbQB' - Создание страницы в Yonote
№401 'rec1N3LZlNCHIWuuj' - Редактирование фото с помощью ИИ
№399 'recD8wRIQJadySR8i' - Генерация видео из фото и текста
№396 'recQr8tVi2s0WSXZH' - Получение содержимого страницы Yonote в формате Markdown
№392 'rec6IroVQotr2GI0k' - Задать вопрос к PDF
№391 'recAiph2JOin8WjH4' - Поиск в Интернете используя модели от OpenAI (vsegpt)
№385 'recG6aylorJqFC6ef' - Генерация изображения через сервис VseGPT (Nano Banana, Recraft V3, Ideogram V3, FLUX.1.1 [pro])
№382 'recBmsgEtrbT047Ov' - Получение последней созданной сделки в AmoCRM
№380 'recWTH4U7oqaM2S6k' - Генерация уникального промокода для скидки, который можно использовать в маркетинговых кампаниях
№379 'recuaOmMQ0D6cT1Q6' - Создание Jupyter Notebook (.ipynb) с блоками в различных форматах (code, markdown)
№375 'recnKaD19PO0IYLGQ' - Создает улучшенный дизайн интерьера на основе исходного изображения и описания стиля
№373 'rec7sXIxRtuehYXuA' - Генерация трека MP3 в стиле Intelligent dance music (умная танцевальная музыка)
№372 'recf9lSCclbXb85oN' - Обновление цен товаров на Wildberries по их nmID
№371 'recLpEYEUhmYmzeAv' - Добавить новый товар на Wildberries через API
№370 'recwGsC4V9cf85QAv' - Найти все новые файлы в папке Bitrix24 за нужный интервал времени
№369 'recHRl40GsYnayGJ0' - Чтение офисных файлов и документов Google в форматах: .PDF, .DOC, .DOCX, .XLS, .XLSX, .PPT, .PPTX
№367 'recbeY62aPkrWbVdL' - Модификация бота с помощью ИИ
№366 'reccUAcWu1bqFXRwu' - Редактирование фото с помощью Google Flash Edit
№364 'recohYiQJicVKMjFg' - Получение данных о самых дешёвых турах с Travelata
№363 'recMJBL5eBwgq1axn' - Поиск туров на сайте Paks.ru
№360 'recfwKlxHynD8dYxx' - Получить актуальные события из календаря Google
№358 'recBmq5TUgzSjDPrt' - Превратить несколько сайтов в векторное хранилище
№357 'recaDhfB0qfckA7eL' - Распознать весь текст в PDF файле с помощью зрения OpenAI
№356 'rect9RVRpT7HGpFXh' - Преобразует текст в речь с использованием модели TTS от OpenAI
№355 'recKcj57UMwsBX2lT' - Транскрибация аудио файла через OpenAI
№354 'rec5TX77rwZoCF1E8' - Скачать информацию с сайта v2
№353 'rec1b8faJ8V1l7J7V' - Запуск исходящего диалога через бота, подключенного к выбранному каналу коммуникации
№351 'recA2NEdvjIMTzT2l' - Получить задачи для бота из AmoCRM
№350 'reclNgAdldu4ZWKPi' - Получить задачи для бота из Битрикс24
№349 'rec4FbSChRcnPoXiv' - Выставить счет от магазина в Юкасса
№348 'recHJwffpzKzUbqg4' - Загрузить историю переписки из лога
№347 'recG1pyyS4CNVsita' - Загрузка файла на Google Drive
№346 'recTTMxoDIrtgtdVO' - Получение сведений из Росреестра по АПИ
№345 'rec00nDv8dUHggTnQ' - Редактирование информации в Google Sheet с возможностью фильтрации по одной или нескольким колонкам и множественными правилами модификации.
№341 'rec9Lzcgn1lyjWkZk' - Задать вопрос к базе в виде папки на Google Drive
№340 'recHKynGYYVMrK5jq' - Задать вопрос к базе в виде папки на Яндекс.Диск
№339 'recbgSY8Bnbs9gtrH' - Создание обученной модели через Replicate LoRa
№338 'recIp5Inv70rJz19w' - Загрузка файла из Яндекс.Диск
№337 'recu4qDIKS2Zf4QW8' - Создание фото через Replicate LoRa
№336 'recMQc9yxGm9bEug2' - Поиск по файлам через OpenAI ResponsesAPI
№334 'recQ3eUSAgc0ArY1I' - Поиск в Интернет через OpenAI ResponsesAPI
№333 'recqJReP7k1Ypzqbo' - Отправка письма через SMTP v2
№328 'rectjyU74vyfbk1Xr' - Генерация документа word
№326 'recCfhObehumnxYij' - Выполнить команду в формате CURL
№324 'recPddRYyml0D6ahS' - Распознавание MP3 (для телеграмм бота)
№323 'rec5vxR84OP5GpICX' - Анализатор ссылок v2
№318 'recfB8H8tZNwaKSz8' - Генерация песен от ProTalk
№317 'recSnwRc0GTbB8pVM' - Генерация видео от MiniMax
№316 'recm2IRaHXQFEBBiD' - Изменить состояние диалога
№314 'reczIvX40S51h88o9' - Создать копии документов из Google шаблонов
№313 'recP6t7o58zz5Gew3' - Загрузить изображение на хостинг ProTalk
№312 'recca7fXeHiJssqXI' - Запуск исходящего звонка через Voximplant
№311 'rec1E9eHhcgPSbYWa' - Получение скриншота сайта v2
№310 'recKkmzjGE8i4pDNL' - Запустить несколько функций последовательно
№309 'recTH28muYQ5lOkM2' - Провести опрос пользователя
№308 'recv0W3FCp1z4WQXa' - Отправить серию сообщений в диалог
№307 'recFtT4kOylWU44px' - Постоянная память 4.0
№305 'recih2K9SIuwWoXrb' - Выполнить Python код
№303 'rec1Xup2mzX2a7Iyg' - Заменить текст в шаблоне Google Sheet
№299 'rec919oopwhFG4HKk' - Поиск изображений по запросу на сервисе Pixels
№298 'recSiqAozakDjrfiq' - Запустить функцию в приложении Google AppScript
№297 'rece4A0MoxREv6Q7B' - Создание сделки в AmoCRM
№292 'recooC11GKuj2iAYd' - Постинг сообщения в группу ВКонтакте
№285 'recMX8HATqBecjICv' - Поиск в Google v2
№284 'recKeA02KFFNcpAC1' - Проверить баланс премиум бонуса пользователя по номеру телефона
№283 'recqAfzHVjuedNvJS' - Активация триггера для сценариев PremiumBonus
№282 'recBJQXKxSti9dKec' - Генерация видео из текста
№281 'rec8fvFoqEmgyL44Z' - Add new user to Premium Bonus
№280 'reciMdcXGKYy5dXQ0' - Compare verification SMS with the input of user Premium Bonus
№279 'recMTqQ6ZIzT3V8Ss' - Send verification SMS to Premium Bonus
№278 'rec8pkHdA9NY8HDUM' - Add client to Salebot CRM
№274 'recRttWvpo4crnodp' - Передача данных в комментарий к сделке Битрикс24
№269 'recfKR59HWjFjjwlw' - Создание HTML-кода с помощью ИИ
№268 'rec2Vxx7je04HBkHe' - Сохранить содержимое страницы WordPress по ID
№267 'recP8pXCpyUZJb97O' - Загрузить содержимое страницы WordPress по ID
№266 'rec96HXJsdJD4Zz9l' - Изменение файла на GitHub
№265 'recxn5vFOoW2CjHcj' - Загрузка файла с GitHub
№264 'recxHJbXDpv4UThbL' - Создание записи в системе yclients
№263 'recbp1cQ0c4FRxk9u' - Perplexity + ProTalk
№262 'rec0398BrbSTIi3MN' - Запуск исходящего диалога
№261 'recGcRyS2qnhgwsFs' - Создания 3D аватара от HedraAI
№259 'reclDc61pU924TfQB' - Генерация SVG
№258 'recda8ZX29xg2kysk' - Изменить стадию сделки в Битрикс24
№257 'reclJ7rqZHDeAsnGZ' - Получения ссылок на первые 10 сайтов в выдаче Baidu по вашему ключевому запросу
№255 'recNuGJ2M0HX3BgNe' - Поиск через Perplexity (VseGPT)
№252 'recMQQ703nfsIplhw' - Прикрепить файл к задаче в Bitrix24
№251 'recsTM83Pg3WPk0VB' - Распознавание текста (gemini-pro-vision + gemini-flash)
№250 'recPA1NBGwnSKY0Sr' - Распознавание текста на фото через Gemini-Pro-Vision
№249 'recgzonIBJz7u5GCi' - Распознавание текста на фото и документах используя EasyOSR, GigaChat, YandexOSR, Gemini
№248 'recuIiPruc5uVrc57' - Распознавание текста на фото и документах через API YandexOSR (JPG, PNG, PDF)
№247 'recKGXQXm9dWeqgBO' - Поиск литературы в Google Scholar
№246 'recePp2kS6IIXhFkn' - Распознавание фото от Сбербанк Giga-Chat
№245 'recEBVi4vIflQKeSU' - Распознавание текста на фото
№244 'recBOPAtplgEkMCV9' - Поиск строки в базе Notion и изменение значения нужного поля
№243 'recLphKkHkJsXBo33' - Поиск через Perplexity
№239 'rec6nKB5og92tKTTc' - Поиск резюме на сайте HH
№238 'rec9m2kArhsLCQeoH' - Получить данные из определенной сделки из AmoCRM
№237 'recmrkCofRlbPg0Jt' - Получить данные из определенной сделки из Битрикс
№234 'recTYHvPwmxCIWhQC' - Получить поля таблицы из базы Airtable по имени таблицы
№233 'recj5nzcajcrmmsXx' - Загрузка файла в облако Backblaze
№232 'rech36vd9V9md3eir' - Создание записи в Airtable
№231 'rec2mCBxmoyEzDGWp' - Yclients: Запись на услугу с указанием даты и времени
№228 'recYgzNxGhdaw1zew' - Yclients: Получить полный список данных о клиенте по номеру телефона
№226 'recl8UFT2VElxAgmP' - Замена текста в шаблоне Google Document
№225 'rec511azC9NG7gexN' - Поиск в каналах и чатах Телеграмм
№224 'recywUKn6Xr3x4RWh' - Получение постов из публичного Телеграм канала v2
№223 'recs91EltvIVOE8Ww' - Создание стикеров для Telegram
№218 'recwHYLANdZ8fw0vh' - Публикация постов в сообществе ВКонтакте
№216 'recaOhptClHd2g9kg' - Удаление записей клиента в сервисе YClients
№215 'rec5Z5E8RqdejYa1U' - Получение текущих записей по номеру телефона клиента в сервисе YClients
№214 'rec9PD73SFHUdeTto' - Чтение текста из Google документа v2
№212 'rec0kj2d7oqX0coDF' - Генерация изображений Midjourney (Rapid API)
№210 'recFLxeYwrcPZI8lr' - Создание HTML
№209 'rec2r8hmptGQZwhog' - Получение фото и площади земельного участка из Росреестра по кадастровому номеру
№208 'recU6IIoh0Z0MiBye' - Поиск товаров на сайте Joomla
№207 'receHWzSrAuHiCBRC' - Замена текста в шаблоне Google Slides
№206 'recLXO6ada9mF7WKq' - Добавить роль в диалог
№205 'recvKOHbxORC9mxIB' - Редактирование презентации в Google Slides (с использованием ИИ)
№204 'rec6MowXaDQtPxQqQ' - Отправить вебхук в Make
№203 'recllHOXqxuVGrl9i' - Отправить вебхук в Zapier
№201 'rec0HG7OsN5pJeXii' - База данных в виде Google таблицы
№200 'recPL3E09TeJ47Kk2' - Публикация поста в Инстаграм
№199 'recuB1IEr2qDVXv6E' - Поиск картинок в Яндекс (API)
№198 'recsxP5RStgact6f7' - Создание презентации PPTX + Яндекс.Картинки
№197 'recF6HRAmvwxPFDtA' - Редактирование презентации PPTX
№196 'recpP7ktLoOP9f0XB' - Создание презентации PPTX
№195 'rec7bpuxI07fGTVRw' - Графовая память
№194 'recYXammcG8pj72hj' - Получение скриншота сайта
№193 'recaolEawRgzEsJFJ' - Отправка сообщения пользователям Телеграм-бота v2
№192 'recqQXUXL5m1Dq1BC' - Детальный анализ PDF с помощью ChatGPT 4-omni
№191 'rec01SSwpEoYoyTXo' - Публикация поста в несколько Телеграм каналов из Google таблицы
№190 'recrOnec215zgAJSe' - Чтение текста из Google документа
№189 'recxyfUm8RLkyYX6q' - Заполнение Google таблицы данными
№186 'recdU8MB7q6fGqu4Q' - Диалог с ботом v2
№185 'recaKiwRv6AC67h7o' - Омниканальный запрос (текст+фото)
№183 'recpk0pLZqMEXzrPC' - Анализ PDF с помощью ChatGPT 4-omni
№182 'recEzoRK20oPc1RGR' - Добавить строку в таблицу Google
№181 'recfseuPThRgsPOcw' - Записать текст в документ Google
№180 'receY9UwOu8zvUkLL' - Задать вопрос к видео на YouTube
№177 'rec2cEV0RZW7n6hYY' - Задать вопрос боту
№176 'recLQ2mb2xnBa5hcD' - Получение товаров из категории на сайте Bitrix
№175 'recRDCRWOcMQY1OlG' - Получение товаров из категории на сайте Webasyst (Shop-Script)
№174 'recYaMomOGNluYpeB' - Получение товаров из категории на сайте WordPress
№173 'recsljDUVUd4rp8Cm' - Отложенный запуск функции
№172 'recIuaU9iYhWoMbaI' - Создание напоминаний от бота
№171 'recIcfxQcmFH1ZzuE' - Получение структуры полей базы данных в Notion
№170 'recepJawxBeT0eRZo' - Получение содержания страницы в Интернет
№168 'recr02NKarcaXMuYF' - Чтение страницы в Notion в формате .md
№165 'recTz2k144vyrPWlr' - Отправить сообщение в диалог канала коммуниувции
№164 'recmCpOupZ9pFOEfu' - Подключение функции к диалогу
№162 'recsE1RV2pNaZFBbk' - Активировать Телеграмм-бот для всех его пользователей
№160 'recEHIGfxib0aHQ9w' - Озвучивание текста (ElevenLabs)
№159 'recOJRYsXbSQ5Qr4G' - Озвучивание файлов (ElevenLabs)
№158 'recbraL2bZmbhXblx' - Создание лендинга на Bootstrap
№157 'recsy7hgbH0GghF45' - Создание графиков
№156 'recQRPEhS3XPIhKS7' - Чтение данных из таблицы Google
№155 'recLFyw27xqkDjseu' - Активация бота для отдельного пользователя,в отдельном канале
№154 'recZXFIMn8A4npVpp' - Генерация PDF
№153 'recxOSh9yzKScEaPi' - Отправить сообщение всем пользователям Телеграм-бота
№152 'rec5DdQxWLG3UU2gv' - Замена лиц на фото (Midjourney)
№151 'recg7cGaOXQvJ6AeS' - Генерация фото (Midjourney)
№150 'recpLr0eP2KZAWBv8' - Постоянная память 3.0
№149 'recDgx3CE5i1u3udY' - Постоянная память 2.0
№148 'recyfEOJmYYQUcJE5' - Генерация фото StabilityAI v3
№147 'recszMFmssZIymxpg' - Поиск картинки в Google
№146 'recjxZYQdGgD6mhd2' - Распознавание изображения OpenAI GPT-4-omni
№145 'recEqSYp2L63fBT08' - Чтение базы данных в Notion v.2
№144 'recScqv3gRuOBpQcw' - Распознавание рукописного текста
№143 'rectJwZea2jXpBl2b' - Поиск предложений на сайте aviasales.ru
№141 'reczCaN6MSc6XJBxi' - Поиск резюме на HH.ru
№139 'rec2iYf4aFT72rX4t' - Поиск товаров на Мойсклад
№138 'rec3MwMejc9sy6cwl' - Создание записи в таблице Notion
№135 'rec9fA6uB3JmcyIJQ' - Отправить лид в Битрикс24
№133 'recQvt9DipE0jFVn9' - Завершение задачи в Bitrix24
№132 'recVipo3q42GLtp1k' - Получение задачи из Bitrix24
№131 'rec3OAJfAgPS2qSCl' - Скачивание аудио с YouTube
№129 'recXKKrahUltNzqPv' - Определи свое предназначение в роду
№122 'recTspLYz4vArSEPB' - Обработка больших документов
№120 'recb0uMWc4PSJV5Xn' - Поиск контакта по базе Apollo.ai
№117 'rectlmqpUUpLMfWCq' - Ближайший склад
№111 'recW3okn0oXu41kRj' - Добавление данных в таблицу Airtable
№110 'recaQJCOBSZvlgXGv' - Изменение данных из таблицы Airtable
№109 'recffo1mR3oltX67a' - Получение данных из таблицы Airtable
№107 'recXNAXhUnv5ALQM6' - Поиск холодных клиентов
№106 'recFfGJ7CqbdBZTI5' - Поиск контактов на странице сайта
№105 'rec5uN1G9306utSA9' - Поиск ссылок на страницах сайта, используя Яндекс
№103 'recLJkHu4bF5bjJDC' - Получение статистики из Яндекс.Директ
№102 'recqPKBqgrdqUw0th' - Взаимодействие с Albato через веб-хук
№101 'reccZst20kO7aGd0A' - Запуск исходящего диалога (для автоматизации)
№100 'recIVEJVcUBKbJEph' - Получение лида из Битрикс24
№97 'reckxOBoA08w1T0Lu' - Случайный выбор варианта
№93 'recAH5uMeV4cs6s3L' - Проверка компании по данным ФНС
№90 'recaxUnMM1tqc7B33' - Распознавание MP3 (принимает только ссылки)
№89 'recPlFt5Gc8kkv5ou' - Статистика видео на YouTube
№86 'recrC3FTLNoggwUGb' - Отправка Email со своего SMTP сервера
№84 'rec0gAaRusmdIeclj' - Поверхностный анализ документов
№73 'recAOFeMiDiTe0Zft' - Прогнозы по ставкам на спорт
№72 'recjNmELxK9qUCJVW' - Поиск событий по сайту Афиша.ру
№71 'rechdJAzc4mzWwmLY' - Чтение офисных файлов
№68 'recZtNQoxHxZYZUKN' - Парсинг по URL
№66 'rec5NpYaTXCpVjB6g' - Генератор случайных чисел
№65 'rec0dwJbLaP6aXv99' - Внешний API
№59 'recT8pX9hcP75Yn8h' - Поиск в Яндекс.Картинки
№58 'recrKUGq82ld7Ixqw' - Диалог одного бота с другим
№57 'recQ7dM5wxzsQv9zk' - Отправить сообщение в Telegram от бота (токен и user_id должны быть вставлены в промпт)
№56 'recL32dhPKfRhCood' - Поиск вакансий на HH.ru
№55 'recE4hcG6Vul3AcHg' - Анализ аудиозаписей из Bitrix24 папки
№53 'recrdqP71u4EX9tdx' - Поиск в Google
№52 'recqA9GjkYZZErt2a' - Генератор ментальных карт
№49 'recOOX98rVM2lVZJk' - Генерация изображений Kandinsky
№48 'rect802CkkKQw9wyV' - Оплата в диалоге
№47 'recK1mh1wG3pP6Nqg' - Управление Google таблицей
№42 'reclyETPWdbBlHIIg' - Сохранение данных в промпт
№39 'reckzuhAwm65bNVO8' - Задать вопрос человеку по телефону
№38 'recmwVnNNKy68wSty' - Получение транскрипции видео с YouTube
№35 'recYAMpGohMcbgXo2' - Получение постов из публичного Телеграм канала
№31 'recAYPwZBnwxhOO7C' - Публикация поста в Телеграм канале
№29 'reczB2kKGDQrXTzSC' - Управление Google календарем
№26 'rectkdl406qLRJcHy' - Отправка лида (все каналы)
№23 'reck5oFu0HO8C2o5E' - Поиск в Яндекс
№20 'recHTy8szvQzkBaoo' - Очистка постоянной памяти
№18 'recqQPqqfPD592la4' - Анализатор ссылок
№17 'recqAgrSFACvM621k' - Постоянная память
№15 'rec6t2P1rhQeKUKAd' - Генерация изображений DALL-E v3
№7 'recbc7BZxQ2ftabl2' - Вычисления на Python
№6 'rec9GsqM6j9XkFaEX' - Формирование SVG
№5 'recQRjlUqLl8YROJn' - Список мест по ГЕО-координатам
№3 'recr7ncxR6zm1wN09' - Формирование PDF
№1 'reconnmuZ6fU5SLLy' - Поиск в Яндекс (по сайту)



# База знаний: Настройка ИИ-агентов ProTalk

## 1. Интеллект бота и промпт

### 1.1 Выбор LLM модели

Доступные модели:

'ProTalk Free' — окно=128К, коэф=0
'chatGPT 4 omni mini' — окно=128К, коэф=1, multimodal: ["image", "doc"]
'chatGPT 4.1' — окно=1М, коэф=6, multimodal: ["image", "doc"]
'chatGPT 4.1 mini' — окно=1М, коэф=3, multimodal: ["image", "doc"]
'chatGPT 4.1 nano' — окно=1М, коэф=0.7, multimodal: ["image", "doc"]
'chatGPT 4o' — окно=128К, коэф=17, multimodal: ["image", "doc"]
'ChatGPT 4o mini (vsegpt)' — окно=128К, коэф=1, multimodal: ["image", "doc"]
'chatGPT 5' — окно=400К, коэф=11, multimodal: ["image", "doc"]
'chatGPT 5 mini' — окно=1М, коэф=2.3, multimodal: ["image", "doc"]
'ChatGPT 5 Mini (vsegpt)' — окно=1М, коэф=2.3, multimodal: ["image", "doc"]
'chatGPT 5 nano' — окно=1М, коэф=0.5, multimodal: ["image", "doc"]
'chatGPT 5.1' — окно=400К, коэф=11, multimodal: ["image", "doc"]
'chatGPT 5.1 Chat' — окно=128К, коэф=11, multimodal: ["image", "doc"]
'chatGPT 5.1 Codex' — окно=400К, коэф=11, multimodal: ["image", "doc"]
'chatGPT 5.1 Codex mini' — окно=400К, коэф=10, multimodal: ["image", "doc"]
'chatGPT 5.1 Codex (vsegpt)' — окно=400К, коэф=10, multimodal: ["image", "doc"]
'chatGPT 5.2' — окно=400К, коэф=16, multimodal: ["image", "doc"]
'chatGPT 5.2 Chat' — окно=128К, коэф=16, multimodal: ["image", "doc"]
'chatGPT 5.3 Chat' — окно=128К, коэф=16, multimodal: ["image", "doc"]
'chatGPT 5.4' — окно=1М, коэф=20, multimodal: ["image", "doc"]
'chatGPT 5.4 mini' — окно=1М, коэф=6, multimodal: ["image", "doc"]
'chatGPT 5.4 nano' — окно=1М, коэф=1.6, multimodal: ["image", "doc"]
'chatGPT 5.6 Luna' — окно=1М, коэф=1, multimodal: ["image", "doc"]
'chatGPT 5.6 Terra' — окно=1М, коэф=8, multimodal: ["image", "doc"]
'chatGPT 5.6 Sol' — окно=1М, коэф=40, multimodal: ["image", "doc"]
'chatGPT 6 Luna' — окно=1М, коэф=1, multimodal: ["image", "doc"]
'chatGPT 6 Sol' — окно=1М, коэф=15, multimodal: ["image", "doc"]
'OpenAI: OSS 20b' — окно=131К, коэф=0.7, multimodal: []
'OpenAI: OSS 20b (free)' — окно=131К, коэф=0, multimodal: []
'OpenAI: OSS 120b' — окно=131К, коэф=1.1, multimodal: []
'ClawBot (Gemini Flash 3.0)' — окно=1М, коэф=4, multimodal: ["image", "video", "audio", "doc"]
'Claude Sonnet 5' — окно=1М, коэф=15, multimodal: ["image", "doc"]
'Claude Haiku 3.5' — окно=200К, коэф=2, multimodal: ["image", "doc"]
'Claude Haiku 5.5' — окно=1М, коэф=1, multimodal: ["image"]
'Claude Haiku 4.5' — окно=200К, коэф=11, multimodal: ["image", "doc"]
'Claude Haiku 4.5 (vsegpt)' — окно=200К, коэф=11, multimodal: ["image", "doc"]
'Claude Sonnet 4' — окно=200К, коэф=23, multimodal: ["image", "doc"]
'Claude Sonnet 4.5' — окно=200К, коэф=23, multimodal: ["image", "doc"]
'Claude Opus 5.5' — окно=1М, коэф=31, multimodal: ["image", "doc"]
'DeepSeek V4 flash' — окно=1М, коэф=1, multimodal: []
'DeepSeek V4 pro' — окно=1М, коэф=10, multimodal: []
'DeepSeek V4 flash (vsegpt)' — окно=1М, коэф=1, multimodal: ["image", "doc"]
'DeepSeek V4 pro (vsegpt)' — окно=1М, коэф=10, multimodal: ["image", "doc"]
'DeepSeek chat' — окно=128К, коэф=1.9, multimodal: []
'DeepSeek chat v3.1' — окно=128К, коэф=1.4, multimodal: []
'DeepSeek R1' — окно=128К, коэф=3, multimodal: []
'Gemini Flash 3.8' — окно=1М, коэф=6, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 3.7' — окно=1М, коэф=3, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 3.6' — окно=1М, коэф=11, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 3.5 Lite' — окно=1М, коэф=3, multimodal: ["image", "video", "audio", "doc"]
'Gemini Pro 3.0' — окно=1М, коэф=16, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 3.5' — окно=1М, коэф=12, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 3.0' — окно=1М, коэф=4, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 2.0' — окно=1М, коэф=0.7, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 2.5' — окно=1М, коэф=2.8, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 2.5 Lite' — окно=1М, коэф=0.7, multimodal: ["image", "video", "audio", "doc"]
'Gemini Pro 2.5' — окно=1М, коэф=11.5, multimodal: ["image", "video", "audio", "doc"]
'Gemini Flash 3.1 Lite' — окно=1М, коэф=1, multimodal: ["image", "video", "audio", "doc"]
'GigaChat' — окно=32К, коэф=10, multimodal: []
'GigaChat Pro' — окно=32К, коэф=77, multimodal: []
'Grok 4.6' — окно=2М, коэф=13, multimodal: ["image", "doc"]
'Grok 4.3' — окно=1М, коэф=15, multimodal: ["image", "doc"]
'Grok 4.2 fast non-reasoning' — окно=2М, коэф=26, multimodal: ["image", "doc"]
'Grok 4.2 fast' — окно=2М, коэф=26, multimodal: ["image", "doc"]
'Grok 4.7' — окно=2М, коэф=10, multimodal: ["image", "doc"]
'Grok 4 Fast (vsegpt)' — окно=2М, коэф=1, multimodal: ["image", "doc"]
'Llama 4 Maverick' — окно=1М, коэф=1, multimodal: ["image"]
'Llama 4 Scout' — окно=10М, коэф=0.5, multimodal: ["image"]
'Moonshotai Kimi K3' — окно=200К, коэф=19, multimodal: ["image"]
'Moonshotai Kimi K2' — окно=200К, коэф=4, multimodal: ["image"]
'Moonshotai Kimi K2 fast' — окно=200К, коэф=7, multimodal: ["image"]
'Moonshotai Kimi K2 (vsegpt)' — окно=200К, коэф=7, multimodal: ["image"]
'MiniMax M3' — окно=1М, коэф=2, multimodal: ["image"]
'MiniMax M2.5' — окно=200К, коэф=2, multimodal: ["image"]
'Qwen Plus' — окно=131К, коэф=3, multimodal: []
'Qwen3 30b thinking' — окно=128К, коэф=2, multimodal: []
'Qwen3 Max' — окно=264К, коэф=6, multimodal: ["image"]
'Xiaomi MiMo 2.5' — окно=1М, коэф=1, multimodal: ["image"]
'Xiaomi MiMo 2.5 Pro' — окно=1М, коэф=3, multimodal: ["image"]
'Xiaomi MiMo 2.6 Flash' — окно=1М, коэф=1, multimodal: ["image", "video", "audio"]
'Yandex Alice AI' — окно=32К, коэф=21, multimodal: []
'YandexGPT Lite' — окно=32К, коэф=8, multimodal: ["image", "doc"]
'YandexGPT Pro' — окно=32К, коэф=49, multimodal: ["image", "doc"]
'Yandex (gpt-oss-120b)' — окно=131К, коэф=11, multimodal: []
'Yandex (gpt-oss-20b)' — окно=131К, коэф=4, multimodal: []
'Yandex (deepseek-v32)' — окно=131К, коэф=20, multimodal: []
'Yandex (yandexgpt-5-lite)' — окно=32К, коэф=7, multimodal: ["image", "doc"]
'Yandex (yandexgpt-5-pro)' — окно=32К, коэф=44, multimodal: ["image", "doc"]
'Z.AI: GLM 5.3' — окно=1М, коэф=9, multimodal: ["image"]
'Z.AI: GLM 4.5' — окно=128К, коэф=3, multimodal: ["image"]
'Z.AI: GLM 4.5 Air' — окно=128К, коэф=1, multimodal: ["image"]
'Z.AI: GLM 4.5 Air (free)' — окно=128К, коэф=0, multimodal: ["image"]
'Z.AI: GLM 5' — окно=128К, коэф=5, multimodal: ["image"]

**Ассистенты:**
- Можно использовать готовых ассистентов от OpenAI
- Требуется: API ключ OpenAI и ID ассистента
- Поддержка интеграции ботов Cozy

**Токены:**
- Базовая модель GPT-4-o-mini: коэффициент 1
- Разные модели имеют разные коэффициенты (от 0.33 до 7)
- Можно использовать свои токены OpenAI или токены платформы

### 1.2 Структура промпта

**Основные блоки:**
1. **Роль** - определяет, кем является бот. **Это самое важное поле.** Сюда записываются все инструкции, алгоритмы и правила поведения.
2. **Подключенные функции** - перечень используемых функций

**Внешний промпт:**
- Размещение в Google Документе или Notion
- Поддержка текстов более 100 тысяч символов
- Совместное редактирование командой
- Возможность отделения промпта от комментариев

### 1.3 Озвучка голосовых сообщений

**Поля настройки:**
- 'voice_name' - Выбор голоса для Telegram и WhatsApp
Варианты значений 'voice_name':
-
'Yandex: Alena'
'Yandex: Filipp'
'ElevenLabs: Rachel'
'ElevenLabs: Thomas'
'ElevenLabs: Matilda'
'ElevenLabs: Nicole'
'ElevenLabs: Dave'
'OpenAI: Alloy'
'OpenAI: Ash'
'OpenAI: Ballad'
'OpenAI: Coral'
'OpenAI: Echo'
'OpenAI: Fable'
'OpenAI: Onyx'
'OpenAI: Nova'
'OpenAI: Sage'
'OpenAI: Shimmer'
'OpenAI: Verse'
'OpenAI: Marin'
'OpenAI: Cedar'

- 'elevenlabs_voice_id' - ID голоса в сервисе ElevenLabs для собственного голоса

**Особенности:**
- Голосовые ответы отправляются только при отсутствии ссылок в тексте
- Интеграция с Eleven Labs для использования собственного голоса
- Требуется указать ключ интеграции в разделе интеграций

## 2. Функции

### 2.1 Общие принципы
- Функции - внешние инструменты для решения задач
- LLM модель самостоятельно принимает решение о вызове
- Изначально поддерживаются моделями OpenAI
- Экспериментальная поддержка других моделей (DeepSeek, Gemini, YandexGPT, Gigachat)

### 2.2 Подключение функций
**Рекомендации:**
- Скопировать описание функции в промпт
- Комментировать параметры и ситуации использования
- Добавлять текстовые триггеры для вызова

**Пример триггеров для функции №26:**
\\\`\\\`\\\`
"Если клиент прислал номер телефона, то сразу же вызови функцию №26 
и отправь уведомление мне на email"

"Если клиент согласился на заключение договора, то сразу же вызови 
функцию №26 и отправь уведомление мне в Телеграмм с кратким резюме диалога"
\\\`\\\`\\\`

### 2.3 Специальные режимы
- **Каждая функция один раз** - запуск в заданной последовательности
- **Функция при каждом ответе** - автоматический вызов (например, для записи в таблицу)

## 3. Базы знаний

### 3.1 Подключение
- Добавление через кнопку "Добавить"
- Выбор из ранее загруженных баз
- Режим отладки для тестирования

### 3.2 Настройки

**Поля настройки:**
- 'embeddings_plain' - Режим отладки для тестирования (без работы с реальными клиентами)
- 'openai_vector_store_id' - ID векторного хранилища OpenAI

**Параметры:**
- **Количество блоков** - оптимизация расхода токенов и точности
- База автоматически разбивается на блоки по смыслу
- Настройка количества извлекаемых блоков из найденных по смыслу

## 4. Память

### 4.1 Типы памяти
- **Графовая память** - разбиение запросов к графовой БД
- **Метка времени** - автоматическое добавление времени к сообщениям
  **ВАЖНО:** Боту вместе с фразой клиента автоматически приходит системная информация о текущей дате и времени (когда установлена временная метка), поэтому бот с каждым новым сообщением получает свежие данные о дате и времени. Всё это попадает в контекстное окно и есть в запросе. Поэтому нейросеть сможет сразу знать о дате и времени и ей **НЕ НУЖНО** подключать специальную функцию для этого.
- **Сохранение диалогов** - экспорт логов (тариф Профи)
- **Постоянный контекст** - сохранение истории после перезагрузки (тариф Профи)

## 5. Каналы коммуникаций

### 5.1 Umnico
- Интеграция множества каналов + виджеты для сайта
- Требуется: API ключ из личного кабинета Umnico
- Настройка: вставить ключ → сохранить → скопировать ID канала → добавить в настройки бота

### 5.2 Wazzup
- Поддержка WhatsApp, Telegram и других платформ
- Требуется: ID канала и API-ключ
- Для Telegram: номер телефона
- Для Авито: уникальный ID

### 5.3 Другие платформы
- **Whapi** - название канала + токен
- **Wapico** - Access Token + webhook
- **Green-api** - название канала + токен
- **Chat2Desk** - API ключ → ID оператора:ID канала:transport
- **Jivosite** - платный тариф + токен через поддержку

### 5.4 Прямые интеграции

**Поля настройки:**
- 'channel' - Основной канал связи бота
- 'whatsapp_number' - Номер WhatsApp для первого сообщения
- 'telegram_number' - Номер Telegram для первого сообщения
- 'website' - Сайт для виджета бота
- 'wb_token' - Токен для WildBerries
- 'wb_items' - Элементы для WildBerries

**Каналы:**
- **ВКонтакте** - прямая интеграция
- **Авито** - получение item_id и системной информации (временная метка, время с начала диалога)
- **Ozon** - прямая интеграция
- **Wildberries** ('wb_token', 'wb_items') - прямая интеграция

**Особенности Авито:**
- Вместе с сообщением приходит системная информация с item_id
- Можно прописать в промпте соответствие номера объявления товару/услуге
- Для динамических товаров - использовать Google Sheets как внешний промпт

### 5.5 Telegram бот

**Базовая настройка:**
- 'telegram_bot_token' - Токен Telegram-бота (создание через @BotFather)
- 'telegram_bot_name' - Никнейм Telegram-бота
- 'telegram_bot_commands' - Список команд для меню
- 'telegram_bot_menu_help' - Ответы на команды Telegram

**Кнопки меню:**
- Вертикальное расположение: новая строка
- Горизонтальное: разделение запятой
- Готовые ответы без генерации (экономия токенов)

**Фраза ожидания:**
- 'ai_wait_message' - Настраиваемое сообщение при обработке запроса
- Пример: "⏳ Думаю ...."

**Inline-кнопки:**
- 'telegram_bot_inline_tips' - Количество инлайн кнопок (автогенерация подсказок)
- Включить режим Inline в @Botfather
- Генератор: https://pro-talk.ru/wizard-inline-button-for-telegram

**Групповые чаты:**
- 'tag_name' - Имя тега для групповых чатов (бот реагирует только при упоминании)

**Обязательная подписка:**
- 'channel_subscription' - Telegram-канал для проверки подписки
- 'subscription_message' - Сообщение о необходимости подписки
- Бот должен быть администратором канала/чата

**Автоперевод:**
- 'telegram_bot_localization' - Настройки локализации
- Перевод приветствий, кнопок, подсказок, служебных сообщений
- Google API для высокого качества
- Активация: эмодзи с флагом + минимум одно слово

## 6. Коммерческое использование

### 6.1 Монетизация Telegram-ботов

**Пакеты токенов:**
- Продажа пакетов (например, 5 млн токенов за 1000₽)
- Бесплатные токены для ознакомления
- Реферальная программа: команда /share

**Подписка:**
- Регулярные платежи (например, 30 дней за 700₽)
- Тестовый период (например, 5 дней)
- Ограничение сообщений в день

**Интеграция платежей:**
- Робокасса
- Юкасса

### 6.2 Продажа ботов напрямую

**Варианты:**
1. **Приватная ссылка** - создание через меню бота
2. **Магазин ProTalk** - публикация (тарифы "Бизнес"/"Профи")
   - Указание стоимости в токенах
   - Добавление описания
   - Возможность бесплатного размещения для привлечения клиентов

## 7. Уведомления и лиды

### 7.1 Email уведомления
- Ввод электронного адреса
- Подключение функции "Отправка лидов"

**Проблемы:**
- Проверить правильность email
- Наличие функции отправки лидов
- Проверить папку "Спам"
- Изучить логи
- Добавить условие в промпт

### 7.2 Telegram уведомления
- Токен бота + личный ID
- Получение ID через @id_protalk_bot

### 7.3 Битрикс24
**Настройка:**
1. Создать входящий веб-хук
2. Раздел "Разработчикам" → "Другое" → "Входящий вебхук"
3. Скопировать ключ интеграции
4. Дать права доступа к необходимым сущностям

**Проверка:**
- Изучить логи на наличие вызова функции
- Проверить условие в промпте
- Анализ ошибок в логах

### 7.4 AmoCRM
**Настройка:**
1. Перейти в Webhooks → внешние интеграции
2. Скопировать ссылку для перенаправления: 'https://functions.pro-talk.ru/api/v1.0/amocrm_webhook'
3. Установить галочку "Предоставить доступ"
4. Зайти в настройки интеграции → нажать "Установить"
5. Сгенерировать токен во вкладке "Ключи и доступы"
6. Вставить в настройки бота

## 8. Диалоговые настройки

### 8.1 Длина контекста

**Поле настройки:** 'message_limit'

**Описание:**
- Определяет количество сообщений в памяти бота
- Ограничение для экономии токенов
- Пустое поле = без ограничений
- Баланс между памятью и стоимостью

### 8.2 Задержка отправки

**Поля настройки:**
- 'accumulation_delay' - Задержка накопления сообщений
- 'user_wait_timeout' - Таймаут ожидания сообщения от пользователя
- 'user_wait_message' - Имитационное сообщение при задержке

**Описание:**
- Имитация человеческого поведения
- Возможность дополнить запрос
- Настраиваемое время (например, 20 секунд)

### 8.3 Сообщение при ожидании

**Поля настройки:**
- 'user_wait_message' - Сообщение при долгом молчании пользователя
- 'user_wait_timeout' - Время ожидания перед отправкой напоминания

**Описание:**
- Напоминание при долгом молчании пользователя
- Настраиваемое время ожидания
- Полезно для продаж (новые аргументы для убеждения)

### 8.4 Ограничения длины сообщения

**Поля настройки:**
- 'user_message_max_len' - Максимальная длина сообщения от пользователя
- 'user_message_max_len_error' - Ошибка/предупреждение при превышении длины

**Описание:**
- Максимальная длина от пользователя (например, 1000 символов)
- Контроль расхода токенов
- Настраиваемое предупреждение

### 8.5 Имя для реакции

**Поле настройки:** 'tag_name'

**Описание:**
- Активация по упоминанию имени в групповых чатах
- Чувствительность к регистру
- Бот должен быть администратором
- Предотвращение случайных активаций

### 8.6 Активационная фраза

**Поле настройки:** 'activation_phrase'

**Описание:**
- Пароль/кодовое слово для начала диалога
- Работает в Telegram, WhatsApp, CRM
- Применение: промокоды, ограничение доступа
- Контроль начала взаимодействия

### 8.7 Дополнительные настройки

**Поля настройки:**
- 'hidden_user_message' - Скрытое сообщение от пользователя до начала диалога
- 'keep_thread' - Сохранение предыдущего диалога после перезагрузки
- 'debug_mode' - Режим отладки для бота

## 9. Безопасность и защита

### 9.1 Роль корректора
**Функции:**
- Отдельная нейросеть для проверки ответов
- Блокировка нежелательного содержания
- Защита от выведывания конфиденциальной информации
- Цензура определенных тем
- Работает на той же модели, что и основной бот

### 9.2 Лимиты сообщений
- **24 часа** - ограничение в сутки (например, 30 сообщений)
- **Общий лимит** - за все время использования
- Контроль расхода ресурсов
- Построение экономической модели

**Важно:** При изменении лимита для существующих пользователей нужно перевыпустить токен бота

### 9.3 Управление эмодзи

**Стандартные команды:**
- 🌟🌟🌟 - Завершить диалог (цель выполнена)
- ☑️☑️☑️ - Завершить диалог (цель не достигнута)
- ✅✅✅ - Остановить бота оператором
- 👋👋👋 - Возобновить работу бота
- ⛔⛔⛔ - Остановить диалог навсегда
- 🏁🏁🏁 - Возобновить остановленный диалог

**Кастомизация:**
- Можно заменить на свои эмодзи или кодовые слова
- Рекомендуется использовать уникальные комбинации
- Пример: "Секундочку" для паузы, "Продолжим?" для возобновления

## 10. Режим работы

### 10.1 Настройки режима

**Поля настройки:**
- 'communication_type' - Тип коммуникации (выбор между "Пишу первый" и "Жду обращения")
- 'working_hours_start' - Время начала работы бота (например, 09:00)
- 'working_hours_end' - Время окончания работы бота (например, 18:00)
- 'working_time_warning' - Предупреждение для пользователей при обращении в нерабочее время

**Режимы:**
- **Режим ожидания** - бот ждет обращений от пользователей
- **Инициирование общения** - бот пишет первым
- Настройка времени работы (отключение в ночное время или нерабочие периоды)
- Автоматическое предупреждение пользователей о нерабочем времени

### 10.2 Скрытое сообщение

**Поле настройки:** 'hidden_user_message'

**Описание:**
- Отправка от имени пользователя (невидимое для пользователя)
- Активация: только если поле "Первая фраза" ('greeting') пуста
- Бот отвечает на скрытое сообщение
- Создание эффекта начала диалога ботом
- Позволяет начать диалог с определенной темы или настроить бота на нужную волну

### 10.3 Активация по расписанию

**Поля настройки:**
- 'activation_period' - Период активации бота (в минутах для периодических запусков)
- 'start_auto_launches_date' - Дата начала автоматических запусков

## 11. История диалогов

### 11.1 Google Таблицы для логов

**Настройка:**
1. Создать новый документ Google Таблиц
2. Образец шапки: https://docs.google.com/spreadsheets/d/1fGjyjxg0ahGHpZfmu881DArQEhXCKO0TVm3DnTGrYfs/edit?usp=sharing
3. Нажать "Поделиться" → "Настройки доступа"
4. Установить режим "Редактор" для всех с ссылкой
5. Скопировать и вставить ссылку в настройки бота

## 12. Системные команды

### 12.1 Базовые команды
- '/12345' или '🤖12345' - переключение на другого бота (где 12345 - номер)
- '/balance' или '💰' - просмотр остатка токенов
- '/pay' или '💳' - формирование ссылки на оплату
- '/share' или '🔗' или '🎁' - реферальная ссылка
- '/memory' или '📚' - просмотр данных в памяти

### 12.2 Условные команды (через промпт)

**Форматирование:**
- '##NL##' - перенос строки
- '##IMG:ссылка##' - отправка изображения
- '##VIDEO:ссылка##' - отправка видео
- '##AUDIO:ссылка##' - отправка аудио
- '##STICKER:ссылка##' - отправка стикера
- '##FILE:ссылка##' - отправка файла
- '##BG:ссылка##' - установка фона чата
- '##GEO:широта;долгота##' - отправка геолокации
- '##CONTACT:телефон;имя;фамилия##' - отправка контакта
- '##POLL:вопрос;вариант1,вариант2##' - создание опроса
- '##STORY:ссылка;тип;описание##' - отправка истории
- '##ALBUM:[ссылка1,ссылка2]##' - отправка альбома

**Специальные функции:**
- '##CHART:название1,значение1;название2,значение2##' - график
- '##TABLE:заголовки;строки##' - таблица
- '##💤:10 сейчас {date}##' - периодическая активация (каждые 10 минут)
- '🛑' (U+1F6D1) - блокировка отправки ответа
- '##⛑️:/12345 текст##' - аварийное переключение на бота-спасателя
- '##FUNCTIONS:66=1000,15=1500##' - монетизация функций
- '##OGG:ON##' - голосовые ответы в формате OGG
- '##TGB:Group_Only##' - работа только в группах
- '##REPLY:12345##' - ответ на конкретное сообщение
- '##MEMORY:ADD;;ключ;;значение##' - сохранение в память
- '##WAIT:60->текст||120->текст##' - задержка ответов
- '##BRAIN:gpt-4.1##' - переключение на запасную LLM

## 13. Inline-кнопки в Telegram


### 13.1 Синтаксис

**Одна строка:**
\\\`\\\`\\\`
текст##INLINE:[Кнопка1;Кнопка2;Кнопка3]##
\\\`\\\`\\\`

**Несколько строк:**
\\\`\\\`\\\`
##INLINE:[Кнопка1;Кнопка2][Кнопка3;Кнопка4]##
\\\`\\\`\\\`

### 13.3 Типы кнопок

**1. Текст с callback_data:**
\\\`\\\`\\\`
Кнопка 1
\\\`\\\`\\\`
Результат: callback_data = "Кнопка 1" (первые 31 символ)

**2. Кнопка с URL:**
\\\`\\\`\\\`
Открыть сайт(url:https://example.com)
\\\`\\\`\\\`

**3. Веб-приложение:**
\\\`\\\`\\\`
Открыть приложение(webapp:https://example.com)
\\\`\\\`\\\`

**4. Команда:**
\\\`\\\`\\\`
Показать погоду(cmd:weather)
Переключение на бота(cmd:/12345)
Рестарт(cmd:/restart)
Очистка контекста(cmd:/clear)
\\\`\\\`\\\`

**5. Запрос контакта:**
\\\`\\\`\\\`
Отправить контакт(contact)
\\\`\\\`\\\`

### 13.4 Примеры

**Выбор даты:**
\\\`\\\`\\\`
На какую дату записаться?##INLINE:[Сегодня;Завтра;Другая]##
\\\`\\\`\\\`

**Меню с переключением:**
\\\`\\\`\\\`
Выбирай пункт меню##INLINE:[Помощник(cmd:/12345)][Продавец(cmd:/54321)]##
\\\`\\\`\\\`

**С кнопкой сайта:**
\\\`\\\`\\\`
Добро пожаловать!##INLINE:[Открыть сайт(url:https://pro-talk.ru)]##
\\\`\\\`\\\`
`;