
import React, { useState, useEffect } from 'react';
// FIX: Corrected import path to use the new unambiguous filename 'proTalkApiService'.
import { login } from '../services/proTalkApiService';
import type { User } from '../types';
import ProTalkAuthButton from './ProTalkAuthButton';
import RegisterModal from './RegisterModal';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  email?: string;
  password?: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, email: emailProp, password: passwordProp }) => {
  const [email, setEmail] = useState(emailProp || '');
  const [password, setPassword] = useState(passwordProp || '');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (emailProp && passwordProp) {
      // Auto-login if creds are passed via props
      const autoLogin = async () => {
        setIsLoading(true);
        try {
          const user = await login(emailProp, passwordProp);
          onLoginSuccess(user);
        } catch (err: any) {
          setError(err.message || 'Auto-login failed.');
          setIsLoading(false);
        }
      };
      autoLogin();
    } else {
      // Otherwise, check for remembered user
      const rememberedUser = localStorage.getItem('rememberedUser');
      if (rememberedUser) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(rememberedUser);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, [emailProp, passwordProp, onLoginSuccess]);

  // Effect for the Ctrl shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === '-') {
        event.preventDefault(); // Prevent default browser action
        setEmail('stepan.tiunov@gmail.com');
        setPassword('73514');
      } else if (event.ctrlKey && event.key === '8') {
        event.preventDefault();
        setEmail('eff-reklama@mail.ru');
        setPassword('9763');
      } else if (event.ctrlKey && event.key === '9') {
        event.preventDefault();
        setEmail('521@pro-talk.ru');
        setPassword('63693');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('rememberedUser');
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-no-repeat bg-center p-0 sm:p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/login-bg.svg')`,
        backgroundSize: 'cover',
        backgroundColor: '#e6e8ee',
      }}
    >
      {/* Background overlay glow for readability */}
      <div className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md p-6 sm:p-8 space-y-6 bg-white/95 dark:bg-[#313a41]/95 backdrop-blur-xl rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-white/80 dark:border-[#424e5a]/80 relative z-10 flex flex-col justify-center">
        <div className="text-center">
           <img 
              src="https://i.1.creatium.io/disk2/e8/fd/ed/d01a2eb6e6b002c270070c3c74cfe51440/ptalk_ng.png" 
              alt="ProTalk Logo" 
              className="h-20 w-20 mx-auto mb-4 rounded-lg"
            />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ProTalk Ai Bot Creator</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Войдите, чтобы управлять вашими ИИ-агентами</p>
        </div>

        {/* ProTalk Auth Widget Button */}
        <div className="pt-2">
          <ProTalkAuthButton onLoginSuccess={onLoginSuccess} />
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-300 dark:border-[#424e5a] w-full" />
          <span className="bg-white dark:bg-[#313a41] px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider absolute">
            или по паролю
          </span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-lg text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-[#36404a] border border-gray-300 dark:border-[#424e5a] rounded-lg text-gray-900 dark:text-white focus:ring-[#2a62ff] focus:border-[#2a62ff]"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#2a62ff] focus:ring-[#2a62ff] border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Запомнить пароль
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2a62ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ещё нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="text-[#2a62ff] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Регистрация
              </button>
            </p>
          </div>
        </form>

        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onLoginSuccess={onLoginSuccess}
        />
      </div>
    </div>
  );
};

export default Login;