
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Login from './components/Login';
import Disclaimer from './components/Disclaimer';
import BotsPanel from './components/BotsPanel';
import ChatInterface from './components/ChatInterface';
import BotPreview from './components/BotPreview';
import BotInfoModal from './components/BotInfoModal';
import BotSettingsModal from './components/BotSettingsModal';
import ExpressCreateModal from './components/ExpressCreateModal';
import ExpressProgressModal from './components/ExpressProgressModal';
import CreatingBotModal from './components/CreatingBotModal';
import PayloadInspectorModal from './components/PayloadInspectorModal';
import { sendMetrikaGoal } from './services/metrikaService';
// FIX: Corrected import path to use the new unambiguous filename 'proTalkApiService'.
import { getBots, getBotDetails, createDefaultBot, editBotAPI, verifyBotSettings, getProTalkFunctions, getKnowledgeBases, getUserTriggers, getUserVariables, getUserBalance, executeProTalkFunction, validateUserByToken } from './services/proTalkApiService';
import { routerService } from './services/ProTalkRouterService'; // NEW IMPORT
import { processPendingClassifications } from './services/userNeedsDbService';
import type { Bot, User, BotSettings, ProTalkFunction, KnowledgeBase, Trigger } from './types';
import { MODEL_OPTIONS } from './constants/models';

// Create a type for the ChatInterface ref
interface ChatInterfaceHandle {
  startExpressCreate: (description: string, model: string) => void;
}

const App: React.FC = () => {
  const [autoLoginCreds, setAutoLoginCreds] = useState<{ email: string; password: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('generate')) {
      sessionStorage.setItem('disclaimerAccepted', 'true');
      return true;
    }
    return sessionStorage.getItem('disclaimerAccepted') === 'true';
  });
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isLoadingBots, setIsLoadingBots] = useState<boolean>(false);
  const [isCreatingBot, setIsCreatingBot] = useState<boolean>(false);
  const [creatingBotStatus, setCreatingBotStatus] = useState<string>('');
  const [previewKey, setPreviewKey] = useState(0);
  const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);

  // Express Create State
  const [isExpressCreateModalOpen, setIsExpressCreateModalOpen] = useState(false);
  const [isExpressCreating, setIsExpressCreating] = useState(false);
  const [expressProgressData, setExpressProgressData] = useState<{ message: string; percent: number } | null>(null);
  const [isExpressComplete, setIsExpressComplete] = useState(false);
  // NEW: Store token usage and model for the express creation result
  const [expressUsageData, setExpressUsageData] = useState<{ tokens: number; model: string; } | null>(null);
  const [isExpressFromUrl, setIsExpressFromUrl] = useState(false);


  // NEW: State to handle selecting a bot after creation/update.
  const [pendingSelectBotRecordId, setPendingSelectBotRecordId] = useState<string | null>(null);
  const [targetBotFromUrl, setTargetBotFromUrl] = useState<{ botId: number; botToken?: string } | null>(null);
  const [pendingGenerateDescription, setPendingGenerateDescription] = useState<string | null>(null);


  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. Check URL query parameters
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme') as 'light' | 'dark' | null;
    if (themeParam === 'light' || themeParam === 'dark') {
        return themeParam;
    }

    // 2. Check URL hash parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const themeHash = hashParams.get('theme') as 'light' | 'dark' | null;
    if (themeHash === 'light' || themeHash === 'dark') {
        return themeHash;
    }

    // 3. Check localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
        return savedTheme;
    }

    // 4. Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  // Effect to toggle the 'dark' class on the HTML element and listen for parent messages
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    const handleMessage = (event: MessageEvent) => {
        if (event.data && (event.data.type === 'theme-change' || event.data.type === 'SET_THEME')) {
            const newTheme = event.data.theme || event.data.payload;
            if (newTheme === 'light' || newTheme === 'dark') {
                setTheme(newTheme);
            }
        }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        return newTheme;
    });
  }, []);

  // ProTalk Functions state
  const [proTalkFunctions, setProTalkFunctions] = useState<ProTalkFunction[]>([]);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(false);

  // ProTalk Knowledge Bases state
  const [proTalkKnowledgeBases, setProTalkKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false);

  // ProTalk Triggers state
  const [userTriggers, setUserTriggers] = useState<Trigger[]>([]);
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(false);

  // User Variables state
  const [userVariables, setUserVariables] = useState<Record<string, any>>({});

  // Token Usage State
  const [tokenUsage, setTokenUsage] = useState<{ lastRequest: number; dailyTotal: number; botTotals: Record<number, number> }>({ lastRequest: 0, dailyTotal: 0, botTotals: {} });
  const [userBalance, setUserBalance] = useState<number>(0);

  const defaultModelValue = MODEL_OPTIONS.find(m => m.isDefault)?.value || 'protalk:free';

  // Model Selection State (Global)
  const [currentModel, setCurrentModel] = useState<string>(defaultModelValue);

  // Mobile specific state
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview' | 'settings'>('chat');
  const [isAutoExecutionEnabled, setIsAutoExecutionEnabled] = useState<boolean>(true);

  // Chat clearing state
  const [clearChatTrigger, setClearChatTrigger] = useState(0);
  const handleClearChatRequest = () => setClearChatTrigger(c => c + 1);


  // State for the bot details modal
  const [modalBot, setModalBot] = useState<Bot | null>(null);
  const [modalBotDetails, setModalBotDetails] = useState<any | null>(null);
  const [modalBotSummary, setModalBotSummary] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);


  // State for the bot settings modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [editingBotDetails, setEditingBotDetails] = useState<any | null>(null);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for the account settings modal
  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] = useState(false);

  // State for Memory Modal (controlled from App to allow opening from Right Panel)
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  // State for Payload Inspector Modal (opened via Ctrl+[)
  const [isPayloadInspectorOpen, setIsPayloadInspectorOpen] = useState(false);

  // Effect to handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+M or Cmd+M to open Memory modal
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        setIsMemoryModalOpen(true);
        return;
      }

      // Ctrl+[ or Cmd+[ (or Russian 'х' / 'Х', or code 'BracketLeft') to toggle Payload Inspector modal
      if ((event.ctrlKey || event.metaKey) && (event.key === '[' || event.code === 'BracketLeft' || event.key === 'х' || event.key === 'Х')) {
        event.preventDefault();
        setIsPayloadInspectorOpen(prev => !prev);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const fetchAndSaveUserVariables = useCallback(async (ruid: string) => {
      try {
          const variables = await getUserVariables(ruid);
          localStorage.setItem('userVariables', JSON.stringify(variables));
          setUserVariables(variables);
          // NEW: Pass email to Router Service and Update User State
          if (variables.user_email) {
              routerService.setUserEmail(variables.user_email);
              setUser(prev => {
                  if (prev && prev.email === 'external_auth_user') {
                      return { ...prev, email: variables.user_email };
                  }
                  return prev;
              });
          }
      } catch (error) {
          console.error("Failed to fetch user variables:", error);
      }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ruidParam = params.get('ruid');
    const publicParam = params.get('public');
    const generateParam = params.get('generate');
    const botIdParam = params.get('bot_id');
    const botTokenParam = params.get('bot_token');

    const parsedBotId = botIdParam ? parseInt(botIdParam, 10) : null;
    const isValidBotId = parsedBotId !== null && !isNaN(parsedBotId);

    if (ruidParam) {
        // Auth Bypass: User authenticated via URL RUID
        const email = 'external_auth_user';
        setUser({ ruid: ruidParam, email });
        routerService.setUserEmail(email); // Set email in router
        setIsPublicMode(false);
    } else if (publicParam === '1') {
        // Public Mode: No auth, no bots loaded initially
        setIsPublicMode(true);
    }
    
    if (generateParam) {
        setPendingGenerateDescription(decodeURIComponent(generateParam));
        setIsExpressFromUrl(true);
    }

    if (isValidBotId) {
      const target = { botId: parsedBotId, botToken: botTokenParam || undefined };
      setTargetBotFromUrl(target);

      if (botTokenParam) {
        // Мгновенно открываем бота в интерфейсе до завершения загрузки списка
        const directBot: Bot = {
          bot_id: parsedBotId,
          bot_token: botTokenParam,
          name: `Бот #${parsedBotId}`,
          ai_model: 'chatGPT 4 omni mini',
          api_host: '',
          avatar: '',
          bot_record_id: '',
          edit_record_id: '',
          favorite: false,
          hello: '',
          tarif: ''
        };
        setSelectedBot(directBot);
        routerService.setAuthToken(directBot);
        routerService.setSelectedBotContext(parsedBotId, botTokenParam);
      }
    }

    // Резервная валидация по токену бота только если RUID не был передан в ссылке
    if (!ruidParam && isValidBotId && botTokenParam) {
      validateUserByToken(parsedBotId, botTokenParam)
        .then(creds => {
          setAutoLoginCreds({ email: creds.user_email, password: creds.user_password });
        })
        .catch(err => {
          console.error("Auto-login validation failed:", err);
        });
    }
  }, []);

  // Load token usage from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedUsage = localStorage.getItem('tokenUsage');
    if (storedUsage) {
      try {
        const { date, total, botTotals } = JSON.parse(storedUsage);
        if (date === today) {
          setTokenUsage(prev => ({ ...prev, dailyTotal: total || 0, botTotals: botTotals || {} }));
        } else {
          // New day: reset daily total, but keep cumulative bot totals
          localStorage.setItem('tokenUsage', JSON.stringify({ date: today, total: 0, botTotals: botTotals || {} }));
          setTokenUsage(prev => ({ ...prev, dailyTotal: 0, botTotals: botTotals || {} }));
        }
      } catch (e) {
        // Corrupted data, reset it completely
        localStorage.setItem('tokenUsage', JSON.stringify({ date: today, total: 0, botTotals: {} }));
        setTokenUsage(prev => ({...prev, dailyTotal: 0, botTotals: {}}))
      }
    } else {
      // No stored data, initialize it
      localStorage.setItem('tokenUsage', JSON.stringify({ date: today, total: 0, botTotals: {} }));
    }
  }, []);


  const fetchBots = useCallback(async () => {
    if (user?.ruid) {
      setIsLoadingBots(true);
      try {
        const fetchedBots = await getBots(user.ruid);
        setBots(fetchedBots);
        
        // 1. Если был передан конкретный bot_id из URL, сопоставляем и выбираем его полные данные
        if (targetBotFromUrl) {
          const matchedBot = fetchedBots.find(b => b.bot_id === targetBotFromUrl.botId);
          if (matchedBot) {
            setSelectedBot(matchedBot);
            routerService.setAuthToken(matchedBot);
            routerService.setSelectedBotContext(matchedBot.bot_id, matchedBot.bot_token);
          }
        } else if (fetchedBots.length > 0) {
          // 2. Если конкретный бот не был указан, но есть RUID, автоматически открываем первого бота
          setSelectedBot(prev => {
            if (!prev) {
              routerService.setAuthToken(fetchedBots[0]);
              routerService.setSelectedBotContext(fetchedBots[0].bot_id, fetchedBots[0].bot_token);
              return fetchedBots[0];
            }
            return prev;
          });
          routerService.setAuthToken(fetchedBots[0]);
        }

        // Фоновая доклассификация записей с пустым category_id («Ожидает классификации»), без пересчёта размеченных
        if (routerService.getAuthToken()) {
          void processPendingClassifications({ syncFromDb: true });
        }
      } catch (error) {
        console.error("Failed to fetch bots:", error);
      } finally {
        setIsLoadingBots(false);
      }
    }
  }, [user, targetBotFromUrl]);

  const fetchTriggers = useCallback(async () => {
    if (user?.ruid) {
      setIsLoadingTriggers(true);
      try {
        const fetchedTriggers = await getUserTriggers(user.ruid);
        setUserTriggers(fetchedTriggers);
      } catch (error) {
        console.error("Failed to fetch triggers:", error);
      } finally {
        setIsLoadingTriggers(false);
      }
    }
  }, [user]);

  // Create a memoized function to fetch the balance
  const fetchBalance = useCallback(async () => {
    let emailToUse = user?.email;
    // Handle the 'external_auth_user' case
    if (emailToUse === 'external_auth_user' && userVariables.user_email) {
      emailToUse = userVariables.user_email;
    }

    if (emailToUse && emailToUse !== 'external_auth_user') {
      try {
        const balance = await getUserBalance(emailToUse);
        setUserBalance(balance);
      } catch (error) {
        console.error("Failed to fetch user balance:", error);
        setUserBalance(0); // Reset on error
      }
    } else {
      setUserBalance(0); // Reset if no user/email
    }
  }, [user, userVariables]);

  useEffect(() => {
    fetchBots();
    fetchTriggers();
    if (user?.ruid) {
        fetchAndSaveUserVariables(user.ruid);
    } else {
        // Clear variables if user is logged out or not set
        setUserVariables({});
    }
  }, [fetchBots, fetchTriggers, user, fetchAndSaveUserVariables]);

  // Effect to fetch balance on user/userVariables change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Load/fetch ProTalk functions when user logs in
  useEffect(() => {
    const loadFunctions = async () => {
      if (user) {
        setIsLoadingFunctions(true);
        try {
          const cachedFunctions = localStorage.getItem('proTalkFunctions');
          if (cachedFunctions && cachedFunctions !== '[]') {
            console.log("Loading ProTalk functions from localStorage cache.");
            setProTalkFunctions(JSON.parse(cachedFunctions));
          } else {
            console.log("Fetching ProTalk functions from API.");
            const functions = await getProTalkFunctions();
            setProTalkFunctions(functions);
            localStorage.setItem('proTalkFunctions', JSON.stringify(functions));
          }
        } catch (error) {
          console.error("Failed to load ProTalk functions:", error);
          // Silently fail, the modal will show an empty list
        } finally {
          setIsLoadingFunctions(false);
        }
      } else {
        // Clear functions and cache on logout
        setProTalkFunctions([]);
        localStorage.removeItem('proTalkFunctions');
      }
    };
    loadFunctions();
  }, [user]);

  // Load/fetch ProTalk knowledge bases when user logs in
  useEffect(() => {
    const loadKnowledgeBases = async () => {
      if (user?.email) {
        setIsLoadingKnowledgeBases(true);
        try {
          // Use a user-specific cache key
          const cacheKey = `proTalkKnowledgeBases_${user.email}`;
          const cachedBases = localStorage.getItem(cacheKey);
          if (cachedBases && cachedBases !== '[]') {
            console.log("Loading ProTalk knowledge bases from localStorage cache.");
            setProTalkKnowledgeBases(JSON.parse(cachedBases));
          } else {
            console.log("Fetching ProTalk knowledge bases from API.");
            const bases = await getKnowledgeBases(user.email);
            setProTalkKnowledgeBases(bases);
            localStorage.setItem(cacheKey, JSON.stringify(bases));
          }
        } catch (error) {
          console.error("Failed to load ProTalk knowledge bases:", error);
          // Silently fail, the modal will show an empty list
        } finally {
          setIsLoadingKnowledgeBases(false);
        }
      } else {
        // Clear bases and cache on logout
        setProTalkKnowledgeBases([]);
      }
    };
    loadKnowledgeBases();
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    routerService.setUserEmail(loggedInUser.email); // Set email in router
    setSelectedBot(null);
    setBots([]);
  };

  const handlePublicLoginSuccess = useCallback((newUser: User) => {
    setUser(newUser);
    routerService.setUserEmail(newUser.email); // Set email in router
    setIsPublicMode(false); // Transition out of public mode
    // fetchBots will be called automatically by the useEffect watching the `user` state.
  }, []);

  const handleSelectBot = useCallback((bot: Bot | null) => {
    setSelectedBot(bot);
    setPreviewKey(k => k + 1);

    // Reset token usage for the new session/bot to 0
    setTokenUsage(prev => {
        let newBotTotals = prev.botTotals;
        
        if (bot) {
            newBotTotals = { ...prev.botTotals, [bot.bot_id]: 0 };
            
            // Sync with localStorage
            try {
                const today = new Date().toISOString().split('T')[0];
                const storedUsageJSON = localStorage.getItem('tokenUsage');
                let currentData = { date: today, total: prev.dailyTotal, botTotals: newBotTotals };
                
                if (storedUsageJSON) {
                    const parsed = JSON.parse(storedUsageJSON);
                    currentData = { ...parsed, botTotals: newBotTotals };
                }
                localStorage.setItem('tokenUsage', JSON.stringify(currentData));
            } catch (e) {
                console.error("Error updating token usage in local storage", e);
            }
        }
        
        return { ...prev, lastRequest: 0, botTotals: newBotTotals };
    });

    if (bot) {
        setActiveMobileTab('chat'); 
    }
  }, []);

  // NEW: Effect to select bot after it appears in the list
  useEffect(() => {
    if (pendingSelectBotRecordId && bots.length > 0) {
        const botToSelect = bots.find(b => b.bot_record_id === pendingSelectBotRecordId);
        if (botToSelect) {
            handleSelectBot(botToSelect);
            setPendingSelectBotRecordId(null); // Reset pending state
        }
    }
  }, [bots, pendingSelectBotRecordId, handleSelectBot]);

  const handleLogout = () => {
    setUser(null);
    setBots([]);
    setSelectedBot(null);
    setUserTriggers([]);
    setUserVariables({});
    localStorage.removeItem('userVariables');
  }

  const handleBotUpdate = useCallback((_bot: Bot | null) => {
    setTimeout(() => {
      setPreviewKey(k => k + 1);
      // Also fetch bots in background to update panel data
      fetchBots(); 
    }, 3000);
  }, [fetchBots]);

  const handleCreateNewBot = useCallback(async (): Promise<Bot | null> => {
    if (!user) {
      alert("Ошибка: пользователь не авторизован.");
      return null;
    }
    
    // Determine email to use
    let emailToUse = user.email;
    if (emailToUse === 'external_auth_user' && userVariables.user_email) {
        emailToUse = userVariables.user_email;
    }

    setIsCreatingBot(true);
    setCreatingBotStatus('Создаем запись бота на сервере ProTalk...');
    try {
      const createResponse = await createDefaultBot(emailToUse);
      
      if (!createResponse.success || !createResponse.data?.bot_record_id) {
        const errorDetails = typeof createResponse.data === 'object' ? JSON.stringify(createResponse.data, null, 2) : createResponse.data;
        alert(`Ошибка при создании нового бота: ${errorDetails}`);
        return null;
      }
      
      const newBotRecordId = createResponse.data.bot_record_id;
      setCreatingBotStatus('Инициализируем рабочую среду бота...');

      // Retry fetching the bot list to mitigate race conditions where the new bot isn't immediately available.
      const maxRetries = 6;
      const retryDelay = 2000;
      let newBot: Bot | undefined;

      for (let i = 0; i < maxRetries; i++) {
        setCreatingBotStatus(`Синхронизируем список ботов (попытка ${i + 1}/${maxRetries})...`);
        const allBots = await getBots(user.ruid);
        newBot = allBots.find(b => b.bot_record_id === newBotRecordId);

        if (newBot) {
          // Found the new bot, update state and break the loop
          routerService.setAuthToken(newBot);
          setBots(allBots);
          break;
        }

        if (i < maxRetries - 1) {
          console.warn(`New bot not found on attempt ${i + 1}. Retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }

      if (newBot) {
        setCreatingBotStatus('Бот готов! Открываем консоль управления...');
        // Переключаем выбор на нового бота немедленно!
        handleSelectBot(newBot);
        sendMetrikaGoal('app_action_completed');
        return newBot;
      } else {
        // If bot is still not found after retries, inform the user and throw.
        console.error("Failed to find new bot after multiple retries. Bot Record ID:", newBotRecordId);
        // Refresh the list one last time in the background.
        fetchBots();
        throw new Error("Не удалось получить данные нового бота после его создания. Попробуйте обновить список ботов вручную.");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to create default bot:", errorMessage);
      alert(`Ошибка при создании нового бота: ${errorMessage}`);
      return null;
    } finally {
      setIsCreatingBot(false);
      setCreatingBotStatus('');
    }
  }, [fetchBots, user, userVariables, handleSelectBot]);

  const handleViewBotDetails = useCallback(async (bot: Bot) => {
    setModalBot(bot);
    setIsModalOpen(true);
    setIsLoadingModal(true);
    setModalBotDetails(null);
    setModalBotSummary('Генерация описания отключена.');

    try {
        const details = await getBotDetails(bot.bot_id, bot.bot_token);
        
        // If an external role URL exists, fetch its content and replace the local 'role'
        if (details && details.external_promt_url) {
            try {
                console.log(`Fetching external role for modal from: ${details.external_promt_url}`);
                const externalRoleContent = await executeProTalkFunction(
                    bot, 
                    190, // function_id for 'Чтение текста из Google документа'
                    { "url": details.external_promt_url, "limit": "1000000" }
                );

                if (typeof externalRoleContent === 'string') {
                    details.role = externalRoleContent;
                    console.log(`External role for modal loaded successfully. Length: ${externalRoleContent.length}`);
                } else {
                    console.warn("Failed to load external role content for modal, or content was not a string:", externalRoleContent);
                }
            } catch (roleError) {
                console.error("Error fetching external role for modal:", roleError);
            }
        }
        setModalBotDetails(details);
        // FIX: Used the correct state variable 'modalBotSummary'.
        setModalBotSummary('Генерация описания отключена.');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch bot details:", errorMessage);
        alert(`Ошибка при загрузке деталей для ${bot.name}: ${errorMessage}`);
        setIsModalOpen(false);
        setModalBot(null);
    } finally {
        setIsLoadingModal(false);
    }
  }, []);


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalBot(null);
    setModalBotDetails(null);
    setModalBotSummary(null);
  };

  // Shared logic to load bot details for settings
  const loadBotDetailsForSettings = async (bot: Bot) => {
      setEditingBot(bot);
      // Only open modal if not mobile view, otherwise we pass data to inline component
      // Actually, for simplicity, we'll use state to hold data and let the renderer decide
      setIsEditingLoading(true);
      setEditingBotDetails(null);

      try {
        const details = await getBotDetails(bot.bot_id, bot.bot_token);
        
        // If an external role URL exists, fetch its content and replace the local 'role'
        if (details && details.external_promt_url) {
            try {
                console.log(`Fetching external role from: ${details.external_promt_url}`);
                const externalRoleContent = await executeProTalkFunction(
                    bot, 
                    190, // function_id for 'Чтение текста из Google документа'
                    { "url": details.external_promt_url, "limit": "1000000" }
                );
                
                if (typeof externalRoleContent === 'string') {
                    details.role = externalRoleContent;
                    console.log(`External role loaded successfully. Length: ${externalRoleContent.length}`);
                } else {
                    console.warn("Failed to load external role content, or content was not a string:", externalRoleContent);
                }
            } catch (roleError) {
                console.error("Error fetching external role:", roleError);
                alert(`Не удалось загрузить внешнюю роль из ${details.external_promt_url}. Отображается внутренняя роль.`);
            }
        }
        setEditingBotDetails(details);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch bot details for editing:", errorMessage);
        alert(`Ошибка при загрузке настроек для ${bot.name}: ${errorMessage}`);
        setEditingBot(null);
      } finally {
        setIsEditingLoading(false);
      }
  };

  const handleOpenSettingsModal = useCallback(async (bot: Bot) => {
    setIsSettingsModalOpen(true);
    loadBotDetailsForSettings(bot);
  }, []);

  // When switching to Settings tab on mobile, we need to load details
  useEffect(() => {
      if (activeMobileTab === 'settings' && selectedBot && !editingBotDetails && !isEditingLoading) {
          loadBotDetailsForSettings(selectedBot);
      }
  }, [activeMobileTab, selectedBot, editingBotDetails, isEditingLoading]);


  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
    setEditingBot(null);
    setEditingBotDetails(null);
  };

  const handleSaveBotSettings = useCallback(async (updatedSettings: BotSettings) => {
    const targetBot = editingBot || selectedBot;
    if (!targetBot) return;

    setIsSaving(true);
    try {
      // We only want to send the fields that have changed.
      const changedSettings: BotSettings = {};
      for (const key in updatedSettings) {
        if (updatedSettings[key] !== editingBotDetails?.[key]) {
          changedSettings[key] = updatedSettings[key];
        }
      }

      if (Object.keys(changedSettings).length === 0) {
        alert('Нет изменений для сохранения.');
        setIsSaving(false);
        return;
      }
      
      // Обязательные системные поля bot_name и bot_gender всегда передаются при сохранении
      changedSettings.bot_name = updatedSettings.bot_name || editingBotDetails?.bot_name || targetBot.name;
      changedSettings.bot_gender = updatedSettings.bot_gender || editingBotDetails?.bot_gender || 'Мужчина';

      const result = await editBotAPI(targetBot.bot_id, targetBot.bot_token, changedSettings);
      if (result.success) {
        // Быстрый самоконтроль после сохранения
        const verification = await verifyBotSettings(targetBot.bot_id, targetBot.bot_token, changedSettings);
        if (verification.verified) {
          alert('Настройки успешно сохранены и проверены!');
        } else {
          const failedKeys = Object.keys(verification.discrepancies).join(', ');
          alert(`⚠️ Внимание: настройки сохранены, но самоконтроль обнаружил несовпадение параметров: ${failedKeys}. Проверьте детали бота.`);
        }
        handleCloseSettingsModal();
        handleBotUpdate(targetBot); // This will refresh preview and fetch bots list
        // Reload details if we are in mobile settings view
        if (activeMobileTab === 'settings' && selectedBot) {
             loadBotDetailsForSettings(selectedBot);
        }
      } else {
        throw new Error(JSON.stringify(result.data));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to save bot settings:", errorMessage);
      alert(`Ошибка при сохранении настроек: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  }, [editingBot, editingBotDetails, handleBotUpdate, selectedBot, activeMobileTab]);

  const handleOpenAccountSettingsModal = () => {
    setIsAccountSettingsModalOpen(true);
  };

  const handleCloseAccountSettingsModal = () => {
    setIsAccountSettingsModalOpen(false);
  };

  const handleTokenUsageUpdate = useCallback((count: number) => {
    if (!count || count <= 0 || !selectedBot) return;
  
    const today = new Date().toISOString().split('T')[0];
    const storedUsageJSON = localStorage.getItem('tokenUsage');
    let currentDailyTotal = 0;
    let currentBotTotals: Record<number, number> = {};
  
    if (storedUsageJSON) {
      try {
        const storedUsage = JSON.parse(storedUsageJSON);
        if (storedUsage.date === today) {
          currentDailyTotal = storedUsage.total || 0;
        }
        currentBotTotals = storedUsage.botTotals || {};
      } catch (e) {
        console.error("Could not parse tokenUsage from localStorage", e);
        // Resets totals to 0 if parsing fails
      }
    }
  
    const newDailyTotal = currentDailyTotal + count;
    const newBotTotals = {
      ...currentBotTotals,
      [selectedBot.bot_id]: (currentBotTotals[selectedBot.bot_id] || 0) + count,
    };
  
    localStorage.setItem('tokenUsage', JSON.stringify({ date: today, total: newDailyTotal, botTotals: newBotTotals }));
    setTokenUsage({ lastRequest: count, dailyTotal: newDailyTotal, botTotals: newBotTotals });
    
    // After updating usage, fetch the new balance from the server
    fetchBalance();
  }, [selectedBot, fetchBalance]);

  const handleModelChange = useCallback((newModel: string) => {
    if (newModel === 'protalk:free') {
      setCurrentModel(newModel);
      return;
    }

    // При выборе любой платной модели ВСЕГДА показываем дисклеймер
    setPendingModel(newModel);
    setShowDisclaimerModal(true);
  }, []);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimerModal(false);
    if (pendingModel) {
      setCurrentModel(pendingModel);
      setPendingModel(null);
    }
  };

  const handleCancelDisclaimer = () => {
    setShowDisclaimerModal(false);
    setPendingModel(null);
  };

  const handleToggleAutoExecution = useCallback(() => {
    setIsAutoExecutionEnabled(prev => !prev);
  }, []);

  // --- Express Create Handlers ---
  const handleOpenExpressCreate = () => setIsExpressCreateModalOpen(true);

  const handleStartExpressCreate = useCallback((description: string, model: string) => {
    if (!chatInterfaceRef.current) {
        alert("Ошибка: интерфейс чата не готов.");
        return;
    }
    setIsExpressCreateModalOpen(false);
    setIsExpressCreating(true);
    setExpressProgressData({ message: 'Анализирую ваше описание...', percent: 0 });
    chatInterfaceRef.current.startExpressCreate(description, model);
  }, []);

  const handleExpressProgress = (progress: { message: string, percent: number }) => {
    setExpressProgressData(progress);
  };

  const handleExpressComplete = (success: boolean, newBotRecordId: string | null, usage: { tokens: number; model: string; } | null) => {
    if (success && newBotRecordId) {
        setIsExpressComplete(true);
        // Set the ID of the bot we want to select once it's available in the list.
        setPendingSelectBotRecordId(newBotRecordId);
        setExpressUsageData(usage);
        sendMetrikaGoal('app_action_completed');
        // Re-fetch the bot list to get the final version (with avatar).
        // The useEffect hook will handle the selection.
        fetchBots();
    } else {
        alert("Не удалось создать бота в экспресс-режиме. Попробуйте еще раз или используйте обычный режим.");
        // Reset state
        setExpressProgressData(null);
        setIsExpressCreating(false);
        setIsExpressComplete(false);
        setExpressUsageData(null);
    }
  };
  
  const handleCloseExpressProgress = () => {
      setExpressProgressData(null);
      setIsExpressCreating(false);
      setIsExpressComplete(false);
      setExpressUsageData(null);
  };

  useEffect(() => {
    // Ensure we have a real user and email before starting the express create flow from a URL.
    if (user && user.email && user.email !== 'external_auth_user' && pendingGenerateDescription && !isExpressCreating) {
        const description = pendingGenerateDescription;
        setPendingGenerateDescription(null); // Prevent re-triggering
        // For URL-based creation, always use the fast default model.
        handleStartExpressCreate(description, 'x-ai/grok-4.1-fast');
    }
  }, [user, user?.email, pendingGenerateDescription, isExpressCreating, handleStartExpressCreate]);


  if (!user && !isPublicMode) {
    return <Login onLoginSuccess={handleLoginSuccess} email={autoLoginCreds?.email} password={autoLoginCreds?.password} />;
  }

  const renderMobileBottomNav = () => (
    <div className="md:hidden flex items-center justify-around bg-white dark:bg-[#313a41] border-t border-gray-200 dark:border-[#424e5a] h-16 shrink-0 pb-safe z-50">
        <button 
            onClick={() => setActiveMobileTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'settings' ? 'text-[#2a62ff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Редактор бота</span>
        </button>
        <button 
            onClick={() => setActiveMobileTab('chat')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'chat' ? 'text-[#2a62ff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Чат редактора</span>
        </button>
        <button 
            onClick={() => setActiveMobileTab('preview')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'preview' ? 'text-[#2a62ff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Чат превью</span>
        </button>
    </div>
  );

  return (
    <div className="bg-gray-100 dark:bg-[#23262b] text-gray-900 dark:text-white min-h-screen font-sans flex flex-col overflow-hidden">
      
      {/* DESKTOP LAYOUT */}
      <main className="hidden md:flex flex-1 items-center justify-center p-4">
        <div className="w-full h-[95vh] max-w-screen-2xl grid grid-cols-12 gap-4">
          <div className="col-span-3 bg-white dark:bg-[#313a41] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#424e5a] overflow-hidden flex flex-col">
            <BotsPanel 
              bots={bots} 
              selectedBot={selectedBot} 
              onSelectBot={handleSelectBot} 
              isLoading={isLoadingBots}
              isCreating={isCreatingBot}
              onCreateNewBot={handleCreateNewBot}
              onExpressCreate={handleOpenExpressCreate}
              userEmail={user?.email}
              onViewDetails={handleViewBotDetails}
              onEditDetails={handleOpenSettingsModal}
              onOpenAccountSettings={handleOpenAccountSettingsModal}
              isPublicMode={isPublicMode && !user}
              theme={theme}
              toggleTheme={toggleTheme}
              currentModel={currentModel}
              onModelChange={handleModelChange}
            />
          </div>
          <div className="col-span-5 bg-white dark:bg-[#313a41] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#424e5a] overflow-hidden flex flex-col">
            <ChatInterface 
              ref={chatInterfaceRef}
              selectedBot={selectedBot} 
              onBotUpdated={handleBotUpdate}
              isPublicMode={isPublicMode && !user}
              onPublicLoginSuccess={handlePublicLoginSuccess}
              user={user}
              onCreateNewBot={handleCreateNewBot}
              onSelectBot={handleSelectBot}
              onTokenUsageUpdate={handleTokenUsageUpdate}
              currentModel={currentModel}
              onModelChange={handleModelChange}
              isAutoExecutionEnabled={isAutoExecutionEnabled}
              onToggleAutoExecution={handleToggleAutoExecution}
              tokenUsage={tokenUsage}
              userBalance={userBalance}
              isMemoryModalOpen={isMemoryModalOpen}
              onCloseMemory={() => setIsMemoryModalOpen(false)}
              onClearChatRequest={handleClearChatRequest}
              clearChatTrigger={clearChatTrigger}
              theme={theme}
              onExpressProgress={handleExpressProgress}
              onExpressComplete={handleExpressComplete}
            />
          </div>
          <div className="col-span-4 bg-white dark:bg-[#313a41] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#424e5a] overflow-hidden">
            <BotPreview 
                selectedBot={selectedBot} 
                previewKey={previewKey} 
                tokenUsage={tokenUsage} 
                currentModel={currentModel}
                theme={theme}
            />
          </div>
        </div>
      </main>

      {/* MOBILE LAYOUT */}
      <main className="md:hidden flex flex-col flex-1 w-full h-full">
         {!selectedBot ? (
             // MOBILE DASHBOARD VIEW
             <div className="flex-1 overflow-hidden flex flex-col">
                 <BotsPanel 
                    bots={bots} 
                    selectedBot={selectedBot} 
                    onSelectBot={handleSelectBot} 
                    isLoading={isLoadingBots}
                    isCreating={isCreatingBot}
                    onCreateNewBot={handleCreateNewBot}
                    onExpressCreate={handleOpenExpressCreate}
                    userEmail={user?.email}
                    onViewDetails={handleViewBotDetails}
                    onEditDetails={() => { /* In mobile flow, clicking bot opens context, then they go to settings tab */ }}
                    onOpenAccountSettings={handleOpenAccountSettingsModal}
                    isPublicMode={isPublicMode && !user}
                    isMobile={true}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    currentModel={currentModel}
                    onModelChange={handleModelChange}
                 />
             </div>
         ) : (
             // MOBILE BOT CONTEXT VIEW
             <div className="flex-1 flex flex-col relative overflow-hidden">
                 {/* Mobile Context Header */}
                 <div className="h-14 flex items-center px-4 bg-white dark:bg-[#313a41] border-b border-gray-200 dark:border-[#424e5a] shrink-0 z-20">
                    <button 
                        onClick={() => setSelectedBot(null)} 
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 p-2 -ml-2 shrink-0"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                       </svg>
                       <span className="text-sm font-medium">Назад</span>
                    </button>
                    <div className="flex-1 min-w-0 ml-3 overflow-hidden relative flex items-center">
                        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,black_calc(100%-20px),transparent_100%)]">
                            <span className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap block truncate">
                                {selectedBot.name}
                            </span>
                        </div>
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-[#23262b]">
                    <div className={`absolute inset-0 flex flex-col ${activeMobileTab === 'chat' ? 'z-10' : 'z-0 invisible'}`}>
                        <ChatInterface 
                            ref={chatInterfaceRef}
                            selectedBot={selectedBot} 
                            onBotUpdated={handleBotUpdate}
                            isPublicMode={isPublicMode && !user}
                            onPublicLoginSuccess={handlePublicLoginSuccess}
                            user={user}
                            onCreateNewBot={handleCreateNewBot}
                            onSelectBot={handleSelectBot}
                            onTokenUsageUpdate={handleTokenUsageUpdate}
                            currentModel={currentModel}
                            onModelChange={handleModelChange}
                            isAutoExecutionEnabled={isAutoExecutionEnabled}
                            onToggleAutoExecution={handleToggleAutoExecution}
                            isMobile={true}
                            tokenUsage={tokenUsage}
                            userBalance={userBalance}
                            isMemoryModalOpen={isMemoryModalOpen}
                            onCloseMemory={() => setIsMemoryModalOpen(false)}
                            onClearChatRequest={handleClearChatRequest}
                            clearChatTrigger={clearChatTrigger}
                            theme={theme}
                            onExpressProgress={handleExpressProgress}
                            onExpressComplete={handleExpressComplete}
                        />
                    </div>
                    <div className={`absolute inset-0 flex flex-col ${activeMobileTab === 'preview' ? 'z-10' : 'z-0 invisible'}`}>
                        <BotPreview 
                            selectedBot={selectedBot} 
                            previewKey={previewKey} 
                            tokenUsage={tokenUsage} 
                            currentModel={currentModel}
                            isMobile={true}
                            theme={theme}
                        />
                    </div>
                    {activeMobileTab === 'settings' && (
                        <div className="absolute inset-0 z-10 bg-white dark:bg-[#313a41] flex flex-col overflow-hidden">
                            {!selectedBot ? (
                                <div className="flex items-center justify-center h-full p-4 text-center text-gray-500 dark:text-gray-400">
                                    <p className="font-semibold">Выберите бота из списка для редактирования вручную.</p>
                                </div>
                            ) : (
                                <div className="relative flex-1 w-full h-full overflow-hidden">
                                    <iframe
                                        src={`https://protalk-bot-editor.lubanyacloud.ru/?bot_id=${selectedBot.bot_id}&bot_token=${encodeURIComponent(selectedBot.bot_token)}&theme=${theme}&dark=${theme === 'dark' ? 1 : 0}`}
                                        style={{ width: 'calc(100% + 20px)', height: '100%', border: 'none' }}
                                        className="w-[calc(100%+20px)] h-full border-none no-scrollbar"
                                        title={`Редактировать вручную ${selectedBot.name}`}
                                        allow="clipboard-write; microphone"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                 </div>

                 {renderMobileBottomNav()}
             </div>
         )}
      </main>

      <BotInfoModal
        isOpen={isModalOpen}
        isLoading={isLoadingModal}
        botBasicInfo={modalBot}
        botDetails={modalBotDetails}
        onClose={handleCloseModal}
        // FIX: Used the correct state variable 'modalBotSummary'.
        botSummary={modalBotSummary}
      />
      
      {/* Desktop Settings Modal */}
      <BotSettingsModal
        isOpen={isSettingsModalOpen}
        isLoading={isEditingLoading}
        isSaving={isSaving}
        bot={editingBot}
        botDetails={editingBotDetails}
        onClose={handleCloseSettingsModal}
        onSave={handleSaveBotSettings}
        allProTalkFunctions={proTalkFunctions}
        isLoadingAllFunctions={isLoadingFunctions}
        allKnowledgeBases={proTalkKnowledgeBases}
        isLoadingAllKnowledgeBases={isLoadingKnowledgeBases}
        user={user}
        userTriggers={userTriggers}
        isLoadingTriggers={isLoadingTriggers}
        onRefreshTriggers={fetchTriggers}
      />

      <ExpressCreateModal
        isOpen={isExpressCreateModalOpen}
        onClose={() => setIsExpressCreateModalOpen(false)}
        onSubmit={handleStartExpressCreate}
        isCreating={isExpressCreating}
      />

      <ExpressProgressModal
        isOpen={!!expressProgressData}
        onClose={handleCloseExpressProgress}
        progress={expressProgressData || { message: '', percent: 0 }}
        isSuccess={isExpressComplete}
        usage={expressUsageData}
        theme={theme}
        isFromUrl={isExpressFromUrl}
      />

      <CreatingBotModal
        isOpen={isCreatingBot}
        statusMessage={creatingBotStatus}
      />

      <PayloadInspectorModal
        isOpen={isPayloadInspectorOpen}
        onClose={() => setIsPayloadInspectorOpen(false)}
      />

      {showDisclaimerModal && (
        <Disclaimer
          modelName={MODEL_OPTIONS.find(m => m.value === pendingModel)?.label}
          onAccept={handleAcceptDisclaimer}
          onCancel={handleCancelDisclaimer}
        />
      )}

    </div>
  );
};

export default App;
