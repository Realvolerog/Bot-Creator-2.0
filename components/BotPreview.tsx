
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Bot } from '../types';

interface BotPreviewProps {
  selectedBot: Bot | null;
  previewKey: number;
  tokenUsage: any; 
  currentModel: string; 
  isMobile?: boolean;
  theme: 'light' | 'dark';
}

const BotPreview: React.FC<BotPreviewProps> = ({ selectedBot, previewKey, isMobile, theme }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isServerReady, setIsServerReady] = useState<boolean>(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [isTimeoutError, setIsTimeoutError] = useState<boolean>(false);
  const [checkKey, setCheckKey] = useState<number>(0);

  const iframeSrc = selectedBot 
    ? `https://functions.pro-talk.ru/api/v1.0/chatgpt_widget_dialog_api?record_id=${selectedBot.bot_record_id}&promt_id=${selectedBot.bot_id}&lang=ru&dark=${theme === 'dark' ? 1 : 0}&fullscreen=0&voice=1&file=1&theme=${theme}`
    : '';

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'themeChange', theme: theme }, '*');
    }
  }, [theme, selectedBot, previewKey, isIframeLoaded]);

  // Health-check polling to verify the widget server is ready before displaying the iframe
  useEffect(() => {
    if (!selectedBot || !iframeSrc) {
      setIsServerReady(false);
      setIsIframeLoaded(false);
      setIsTimeoutError(false);
      return;
    }

    let isCancelled = false;
    let attempt = 0;
    const maxAttempts = 15; // ~30 seconds of checking
    let timer: any = null;

    setIsServerReady(false);
    setIsIframeLoaded(false);
    setIsTimeoutError(false);
    setAttemptCount(1);

    const checkHealth = async () => {
      if (isCancelled) return;
      attempt++;
      setAttemptCount(attempt);

      try {
        const response = await fetch(iframeSrc, {
          method: 'GET',
          cache: 'no-store'
        });

        if (isCancelled) return;

        const bodyText = await response.text();
        const has500Error = 
          response.status >= 500 ||
          bodyText.includes('500 Internal Server Error') ||
          bodyText.includes('The server encountered an internal error') ||
          bodyText.includes('Internal Server Error');

        if (response.ok && !has500Error) {
          // Server returned valid HTML widget without 500 error!
          if (!isCancelled) {
            setIsServerReady(true);
          }
          return;
        }

        // Server returned 500 or error - retry
        console.warn(`[BotPreview] Widget server returned 500/error on attempt ${attempt}/${maxAttempts}. Waiting for initialization...`);
        if (attempt < maxAttempts) {
          timer = setTimeout(checkHealth, 2000);
        } else {
          if (!isCancelled) {
            setIsTimeoutError(true);
          }
        }
      } catch (err) {
        if (isCancelled) return;
        console.warn(`[BotPreview] Widget health-check error on attempt ${attempt}:`, err);
        // If fetch fails repeatedly (e.g. CORS or network policy block), don't block forever
        if (attempt >= 4) {
          // Fallback: allow iframe to mount after 4 attempts (~8 seconds)
          if (!isCancelled) {
            setIsServerReady(true);
          }
        } else {
          timer = setTimeout(checkHealth, 2000);
        }
      }
    };

    checkHealth();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [selectedBot?.bot_id, selectedBot?.bot_record_id, previewKey, checkKey, theme]);

  const handleRetry = useCallback(() => {
    setCheckKey(k => k + 1);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#313a41] text-gray-900 dark:text-white">
      <div className="flex-1 bg-gray-50 dark:bg-[#23262b] rounded-b-2xl overflow-hidden relative">
        {!selectedBot ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-semibold text-sm">Выберите бота из списка, чтобы протестировать диалог.</p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Iframe: rendered only when verified ready by probe */}
            {isServerReady && (
              <iframe
                ref={iframeRef}
                key={`${selectedBot.bot_id}-${previewKey}`}
                allow="microphone; autoplay"
                onLoad={() => setIsIframeLoaded(true)}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  opacity: isIframeLoaded ? 1 : 0,
                  transition: 'opacity 0.25s ease-in-out'
                }}
                src={iframeSrc}
                title={`Chat with ${selectedBot.name}`}
              />
            )}

            {/* 2. Loader Overlay: shown while server is spinning up or iframe is downloading */}
            {(!isServerReady || !isIframeLoaded) && !isTimeoutError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/95 dark:bg-[#23262b]/95 backdrop-blur-sm p-6 text-center animate-fade-in">
                <div className="relative mb-5 flex items-center justify-center">
                  {/* Outer pulsating spinner */}
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  {/* Center bot icon */}
                  <div className="absolute w-9 h-9 rounded-full bg-blue-500/10 dark:bg-blue-400/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Загрузка чата бота...
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[260px] leading-relaxed">
                  {attemptCount > 1 
                    ? `Сервер инициализирует диалоговую среду бота (попытка ${attemptCount})...` 
                    : 'Подключаем виджет диалога, пожалуйста подождите...'}
                </p>

                {/* Progress bar line */}
                <div className="w-44 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}

            {/* 3. Timeout friendly screen if server takes abnormally long (>30s) */}
            {isTimeoutError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#23262b] p-6 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Сервер ещё подготавливает бота
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px] mb-4 leading-relaxed">
                  Окружение для нового бота ещё запускается на сервере ProTalk. Обычно это занимает от нескольких секунд до минуты.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Повторить загрузку
                  </button>
                  <a
                    href={iframeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg transition-colors text-center"
                  >
                    Открыть в новой вкладке
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BotPreview;