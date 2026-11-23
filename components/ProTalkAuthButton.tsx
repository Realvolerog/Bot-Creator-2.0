import React, { useState, useEffect, useCallback } from 'react';
import { validateUserByToken, login } from '../services/proTalkApiService';
import type { User } from '../types';

interface ProTalkAuthButtonProps {
  onLoginSuccess: (user: User) => void;
  className?: string;
  buttonText?: string;
}

declare global {
  interface Window {
    ProTalkAuth?: {
      open: () => void;
      close: () => void;
      onAuth: ((data: any) => void) | null;
    };
    onProTalkAuth?: (data: any) => void;
  }
}

const AUTH_URL = 'https://account.pro-talk.ru/login?iframe=1&embed=1';

const ALLOWED_ORIGINS = [
  'https://account.pro-talk.ru',
  'https://eu1.account.dialog.ai.atiks.org',
  'https://ru1.account.dialog.ai.atiks.org',
  'https://account.dialog.ai.atiks.org',
];

export const ProTalkAuthButton: React.FC<ProTalkAuthButtonProps> = ({
  onLoginSuccess,
  className = '',
  buttonText = 'Войти через ProTalk',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const processAuthSuccess = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('✅ ProTalk Auth Success Data:', data);
      
      const botIdRaw = data.user_bot_id ?? data.bot_id;
      const botToken = data.user_bot_token ?? data.bot_token;

      let authenticatedUser: User | null = null;

      if (botIdRaw && botToken) {
        const botId = typeof botIdRaw === 'number' ? botIdRaw : parseInt(String(botIdRaw), 10);
        console.log(`🔐 Validating user by bot token... Bot ID: ${botId}`);
        
        // 1. Validate user by token to get user credentials
        const creds = await validateUserByToken(botId, botToken);
        console.log(`✅ Credentials obtained for email: ${creds.user_email}`);
        
        // 2. Perform login using credentials
        authenticatedUser = await login(creds.user_email, creds.user_password);
      } else if (data.ruid && data.email) {
        // Fallback if bot_id/token wasn't present, but ruid and email were
        authenticatedUser = { ruid: String(data.ruid), email: data.email };
      } else {
        throw new Error('Не получены данные авторизации (bot_id / bot_token или ruid).');
      }

      setIsOpen(false);

      if (window.onProTalkAuth) {
        window.onProTalkAuth(data);
      }
      window.dispatchEvent(new CustomEvent('protalk:auth', { detail: data }));

      onLoginSuccess(authenticatedUser);
    } catch (err: any) {
      console.error('❌ ProTalk Auth Validation Error:', err);
      setError(err.message || 'Ошибка валидации токена ProTalk.');
    } finally {
      setIsLoading(false);
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.origin || !ALLOWED_ORIGINS.some(origin => e.origin.startsWith(origin))) {
        return;
      }

      let d = e.data;
      if (typeof d === 'string') {
        try {
          d = JSON.parse(d);
        } catch {
          return;
        }
      }

      if (d && d.type === 'protalk_auth_success') {
        processAuthSuccess(d);
      }
    };

    window.addEventListener('message', handleMessage);

    // Global ProTalkAuth helper
    window.ProTalkAuth = {
      open: handleOpen,
      close: handleClose,
      onAuth: null,
    };

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleOpen, handleClose, processAuthSuccess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <button
        id="protalk-login-btn"
        type="button"
        onClick={handleOpen}
        disabled={isLoading}
        className={className || `w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        }}
      >
        <img
          src="https://i.1.creatium.io/disk2/e8/fd/ed/d01a2eb6e6b002c270070c3c74cfe51440/ptalk_ng.png"
          alt="ProTalk"
          className="w-6 h-6 rounded-md bg-white/20 p-0.5 shrink-0"
        />
        <span>{isLoading ? 'Авторизация...' : buttonText}</span>
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-500 text-center font-medium">
          {error}
        </p>
      )}

      {isOpen && (
        <div
          id="protalk-modal-overlay"
          className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-[420px] max-w-[95vw] h-[620px] max-h-[90vh] bg-white dark:bg-[#313a41] rounded-2xl overflow-hidden shadow-2xl animate-slideUp border border-gray-200 dark:border-[#424e5a]">
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-sm font-bold z-10 transition-colors"
            >
              ✕
            </button>

            {/* Loading indicator overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-[#313a41]/80 z-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-[#667eea] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Валидация авторизации...
                </p>
              </div>
            )}

            <iframe
              src={AUTH_URL}
              title="ProTalk Auth"
              className="w-full h-full border-none"
              allow="clipboard-write"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProTalkAuthButton;
