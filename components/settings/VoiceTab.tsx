import React, { useState, useEffect } from 'react';
import type { BotSettings } from '../../types';
import { Field } from './FormControls';

const voiceOptions = [
    { label: 'Yandex', voices: ['Alena', 'Filipp'] },
    { label: 'ElevenLabs', voices: ['Rachel', 'Thomas', 'Matilda', 'Nicole', 'Dave'] },
    { label: 'OpenAI', voices: ['Alloy', 'Ash', 'Ballad', 'Coral', 'Echo', 'Fable', 'Onyx', 'Nova', 'Sage', 'Shimmer', 'Verse', 'Marin', 'Cedar'] },
];

interface VoiceTabProps {
  formData: BotSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const VoiceTab: React.FC<VoiceTabProps> = ({ formData, handleChange }) => {
    const [isElevenLabsOpen, setIsElevenLabsOpen] = useState(false);

    useEffect(() => {
        if (formData.elevenlabs_voice_id) {
            setIsElevenLabsOpen(true);
        }
    }, [formData.elevenlabs_voice_id]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Настройки озвучки</h3>
            
            {/* Voice Selection */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Выбор голоса:</h4>
                <Field
                    label="Голос"
                    description="Озвучка голосовых сообщений."
                    popover="Вы можете выбрать голос для озвучки сообщений, которые бот отправляет в Telegram или WhatsApp. Если включена функция голосового ответа, бот будет отвечать как текстом, так и аудио сообщениями, при условии, что в ответе нет ссылок. Это сделано для того, чтобы избежать неуклюжего озвучивания URL-адресов."
                >
                    <select
                        name="voice_name"
                        value={formData.voice_name || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-</option>
                        {voiceOptions.map(group => (
                            <optgroup key={group.label} label={group.label}>
                                {group.voices.map(voice => (
                                    <option key={voice} value={`${group.label}: ${voice}`}>{voice}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </Field>
            </div>

            {/* ElevenLabs Section */}
            <div className="space-y-4">
                 <button onClick={() => setIsElevenLabsOpen(!isElevenLabsOpen)} className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-1">
                    ElevenLabs
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isElevenLabsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isElevenLabsOpen && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                        <Field
                            label="ID голоса из ElevenLabs или из MiniMax"
                            description="Необходимо зарегистрировать и оплатить свой аккаунт в ElevenLabs или MiniMax и ввести ключ в разделе Интеграций."
                            popover="Если вы хотите использовать собственный голос, вы можете зарегистрироваться в сервисе Eleven Labs и указать уникальный ID голоса. Не забудьте также прописать ключ интеграции в разделе интеграций."
                        >
                            <input
                                type="text"
                                name="elevenlabs_voice_id"
                                value={formData.elevenlabs_voice_id || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                        </Field>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceTab;