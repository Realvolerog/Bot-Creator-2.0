import React, { useState, useEffect } from 'react';
import { apiSendMail, apiRegister, getUserBots } from '../services/proTalkApiService';
import type { User } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type Step = 'reg-email' | 'reg-code' | 'reg-pending';

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<Step>('reg-email');
  const [email, setEmail] = useState('');
  const [agreedOffer, setAgreedOffer] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [sentCode, setSentCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pending timer state
  const [timer, setTimer] = useState(30);
  const [regData, setRegData] = useState<{
    deploy_token: string;
    ruid: string;
    bot_id?: number | string;
    bot_token?: string;
  } | null>(null);

  // Extract referral code on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      sessionStorage.setItem('lubanya.ref', ref);
      sessionStorage.setItem('protalk_ref', ref);
    }
  }, []);

  // 30-second timer countdown for reg-pending
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'reg-pending' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 'reg-pending' && timer === 0) {
      finishRegistration();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Пожалуйста, введите корректный email.');
      return;
    }
    if (!agreedOffer || !agreedPrivacy) {
      setError('Пожалуйста, подтвердите согласие с условиями оферты и политикой обработки персональных данных.');
      return;
    }
    setError(null);
    setIsLoading(true);

    // Generate random 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);

    try {
      await apiSendMail(email, code);
      setStep('reg-code');
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить письмо. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredCode.trim() !== sentCode) {
      setError('Неверный код.');
      return;
    }

    setIsLoading(true);
    try {
      const refCode = sessionStorage.getItem('lubanya.ref') || sessionStorage.getItem('protalk_ref') || '';
      const data = await apiRegister(email, refCode);

      if (!data.deploy_token) {
        throw new Error('Сервер не вернул deploy_token');
      }

      setRegData(data);
      setTimer(30);
      setStep('reg-pending');
    } catch (err: any) {
      setError(err.message || 'Ошибка создания аккаунта.');
    } finally {
      setIsLoading(false);
    }
  };

  const finishRegistration = async () => {
    if (!regData) return;
    setIsLoading(true);
    try {
      let finalBotId = regData.bot_id;
      let finalBotToken = regData.bot_token;

      // Fallback: if bot_id / bot_token missing, fetch user bots
      if (!finalBotId || !finalBotToken) {
        try {
          const bots = await getUserBots(regData.ruid);
          if (bots && bots.length > 0) {
            const firstBot = bots[0];
            finalBotId = firstBot.bot_id || firstBot.id;
            finalBotToken = firstBot.bot_token || firstBot.token;
          }
        } catch (fetchErr) {
          console.warn('Could not fetch user bots during registration fallback:', fetchErr);
        }
      }

      const authData = {
        email,
        deploy_token: regData.deploy_token,
        ruid: regData.ruid,
        bot_id: finalBotId,
        bot_token: finalBotToken,
      };

      // Save auth session
      localStorage.setItem('lubanya.auth', JSON.stringify(authData));
      localStorage.setItem('protalk_auth', JSON.stringify(authData));

      onClose();

      const user: User = {
        ruid: regData.ruid,
        email,
        deploy_token: regData.deploy_token,
        bot_id: finalBotId,
        bot_token: finalBotToken,
      };

      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Ошибка завершения регистрации.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-white dark:bg-[#313a41] rounded-none sm:rounded-2xl p-6 sm:p-8 shadow-2xl border-0 sm:border border-gray-200 dark:border-[#424e5a] overflow-y-auto flex flex-col justify-center">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <img
            src="https://i.1.creatium.io/disk2/e8/fd/ed/d01a2eb6e6b002c270070c3c74cfe51440/ptalk_ng.png"
            alt="ProTalk Logo"
            className="h-16 w-16 mx-auto mb-3 rounded-lg"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Регистрация в ProTalk</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Создайте аккаунт и разверните своего первого ИИ-ассистента
          </p>
        </div>

        {/* STEP 1: EMAIL */}
        {step === 'reg-email' && (
          <form onSubmit={handleSendMail} className="space-y-4">
            <div>
              <label htmlFor="reg-email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Введите ваш Email
              </label>
              <input
                id="reg-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-lg text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"
              />
            </div>

            {/* Terms & Privacy Policy Checkboxes */}
            <div className="space-y-3 pt-1 text-left">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 dark:text-gray-300 select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedOffer}
                  onChange={(e) => setAgreedOffer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-[#2a62ff] focus:ring-[#2a62ff]"
                />
                <span>
                  Согласен с{' '}
                  <a
                    href="https://pro-talk.ru/user-agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2a62ff] hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    условиями оферты
                  </a>
                  .
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 dark:text-gray-300 select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedPrivacy}
                  onChange={(e) => setAgreedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-[#2a62ff] focus:ring-[#2a62ff]"
                />
                <span>
                  Согласен на обработку персональных данных. Ознакомлен с{' '}
                  <a
                    href="https://pro-talk.ru/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2a62ff] hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Политикой обработки персональных данных
                  </a>
                  .
                </span>
              </label>
            </div>

            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !agreedOffer || !agreedPrivacy}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#2a62ff] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Отправка...' : 'Отправить код'}
            </button>
          </form>
        )}

        {/* STEP 2: CODE */}
        {step === 'reg-code' && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Мы отправили 6-значный код подтверждения на email: <strong className="font-semibold">{email}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="reg-code-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Код подтверждения
              </label>
              <input
                id="reg-code-input"
                type="text"
                required
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 text-center tracking-widest text-xl font-bold bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-lg text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#2a62ff] hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Проверка...' : 'Подтвердить код'}
              </button>

              <button
                type="button"
                onClick={() => setStep('reg-email')}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Изменить email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PENDING */}
        {step === 'reg-pending' && (
          <div className="text-center space-y-6 py-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-[#2a62ff] border-t-transparent animate-spin" />
              <span className="text-xl font-bold text-[#2a62ff]">{timer}s</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Создание аккаунта...</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                Инициализация сервера и подготовка вашего первого ИИ-бота. Пожалуйста, подождите.
              </p>
            </div>

            <button
              type="button"
              onClick={finishRegistration}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Пропустить ожидания →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterModal;
