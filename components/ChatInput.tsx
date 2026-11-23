import React, { useState, useRef, useEffect } from 'react';
import { transcribeVoiceMessage } from '../services/proTalkApiService';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const DRAFT_STORAGE_KEY = 'protalk_chat_draft';

const formatSeconds = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState<string>(() => {
    try {
      return localStorage.getItem(DRAFT_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  // Clean up recording and media stream on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, value);
    } catch {
      // Ignore localStorage write error
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading && !isTranscribing) {
      onSendMessage(input);
      setInput('');
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore localStorage error
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    setVoiceError(null);
    try {
      const text = await transcribeVoiceMessage(blob);
      if (text) {
        setInput((prev) => {
          const trimmedPrev = prev.trim();
          const updated = trimmedPrev ? `${trimmedPrev} ${text}` : text;
          try {
            localStorage.setItem(DRAFT_STORAGE_KEY, updated);
          } catch {
            // Ignore localStorage errors
          }
          return updated;
        });

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.value.length;
            textareaRef.current.selectionEnd = textareaRef.current.value.length;
          }
        }, 50);
      } else {
        setVoiceError('Речь не распознана. Попробуйте надиктовать еще раз четче.');
      }
    } catch (err: any) {
      console.error('Ошибка транскрибации речи:', err);
      setVoiceError(err.message || 'Ошибка при распознавании речи.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setVoiceError(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError('Ваш браузер не поддерживает запись с микрофона.');
      return;
    }

    try {
      // Запрос доступа к микрофону выполняется ТОЛЬКО после явного нажатия пользователем кнопки микрофона
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Останавливаем все аудио дорожки и очищаем таймер
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);

        const chunks = audioChunksRef.current;
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          await processAudio(audioBlob);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error('Ошибка доступа к микрофону:', error);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);

      const errorMessage = String(error?.message || '').toLowerCase();
      if (
        error.name === 'NotAllowedError' || 
        error.name === 'PermissionDeniedError' || 
        errorMessage.includes('permission denied') ||
        errorMessage.includes('not allowed')
      ) {
        setVoiceError('Доступ к микрофону заблокирован. Разрешите доступ к микрофону для этого сайта (значок настроек/замочка в адресной строке браузера) и нажмите на микрофон снова.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setVoiceError('Микрофон не обнаружен. Пожалуйста, подключите микрофон к устройству.');
      } else {
        setVoiceError(`Не удалось получить доступ к микрофону: ${error.message || 'Неизвестная ошибка'}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing && !isLoading) {
      startRecording();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-[#424e5a] bg-white dark:bg-[#313a41]">
      {/* Voice status banner / error */}
      {voiceError && (
        <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{voiceError}</span>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-200 ml-2 font-bold"
            title="Закрыть"
          >
            ✕
          </button>
        </div>
      )}

      {isRecording && (
        <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center justify-between text-xs text-red-600 dark:text-red-400 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="font-medium">Идет запись голоса... Говорите в микрофон</span>
          </div>
          <span className="font-mono font-semibold">{formatSeconds(recordingDuration)}</span>
        </div>
      )}

      {isTranscribing && (
        <div className="mb-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-lg flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Отправка аудио и распознавание речи через ProTalk STT...</span>
        </div>
      )}

      <div className="flex items-end bg-gray-100 dark:bg-[#36404a] rounded-xl p-2 gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={isRecording ? "Идет запись голоса..." : "Спросите что-нибудь или опишите бота..."}
          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none px-2 resize-none leading-tight"
          rows={4}
          style={{ maxHeight: '200px' }}
          disabled={isLoading || isTranscribing}
          aria-label="Поле для ввода сообщения"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          disabled={isLoading || isTranscribing}
          title={isRecording ? "Остановить запись и распознать" : isTranscribing ? "Идет распознавание речи..." : "Надиктовать голосом"}
          aria-label={isRecording ? "Остановить запись" : "Надиктовать голосом"}
          className={`p-3 rounded-full flex-shrink-0 transition-all focus:outline-none focus:ring-2 self-end ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-400 ring-offset-1 ring-offset-white dark:ring-offset-[#36404a] animate-pulse'
              : isTranscribing
              ? 'bg-blue-500 text-white cursor-wait opacity-80'
              : 'bg-gray-200 dark:bg-[#424e5a] text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#4d5b69] focus:ring-[#2a62ff]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTranscribing ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          ) : isRecording ? (
            /* Stop icon (square) */
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <rect x="5" y="5" width="10" height="10" rx="1.5" />
            </svg>
          ) : (
            /* Microphone icon */
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || isTranscribing || isRecording || !input.trim()}
          className="bg-[#2a62ff] text-white rounded-full p-3 hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a62ff] self-end flex-shrink-0"
          aria-label="Отправить сообщение"
          title="Отправить сообщение"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;