import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { routerService } from '../services/ProTalkRouterService'; // New Service
import { safeParseJson } from '../services/jsonRepair';
// FIX: Corrected import path to use the new unambiguous filename 'proTalkApiService'.
import { 
  getBotDetails, 
  createUserAndBotAPI, 
  editBotAPI, 
  verifyBotSettings, 
  getFunctionInfo, 
  executeProTalkFunction, 
  ProTalkApiError, 
  getBots,
  extractImageUrl,
  normalizeImageUrl
} from '../services/proTalkApiService';
import type { Message, Bot, User } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Header from './Header';
import ThinkingSteps from './ThinkingSteps';
import MemoryModal from './MemoryModal';
import ErrorModal from './ErrorModal';
import { detectRequiredModalities, getRecommendedMultimodalModel, getModalitiesToApply } from '../services/modelModalities';
import { recordUserRequest, recordFirstRequest, hasRecordedFirstRequest, resolveUserLoginAndEmail } from '../services/userNeedsDbService';
import { sendMetrikaGoal } from '../services/metrikaService';

export { extractImageUrl, normalizeImageUrl };

interface ChatInterfaceProps {
  selectedBot: Bot | null;
  onBotUpdated: (bot: Bot | null) => void;
  isPublicMode: boolean;
  onPublicLoginSuccess: (user: User) => void;
  user: User | null;
  onCreateNewBot: () => Promise<Bot | null>;
  onSelectBot: (bot: Bot | null) => void;
  onTokenUsageUpdate: (count: number) => void;
  currentModel?: string;
  onModelChange?: (model: string) => void;
  isAutoExecutionEnabled?: boolean;
  onToggleAutoExecution?: () => void;
  isMobile?: boolean;
  tokenUsage: {
    lastRequest: number;
    dailyTotal: number;
    botTotals: Record<number, number>;
  };
  userBalance: number;
  isMemoryModalOpen: boolean;
  onCloseMemory: () => void;
  clearChatTrigger: number;
  onClearChatRequest: () => void;
  theme: 'light' | 'dark';
  onExpressProgress: (progress: { message: string, percent: number }) => void;
  onExpressComplete: (success: boolean, newBotRecordId: string | null, usage: { tokens: number; model: string; } | null) => void;
}

// Define the type for the forwarded ref
export interface ChatInterfaceHandle {
  startExpressCreate: (description: string, model: string) => void;
}

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(({ 
    selectedBot, 
    onBotUpdated, 
    isPublicMode, 
    onPublicLoginSuccess, 
    user,
    onCreateNewBot,
    onSelectBot,
    onTokenUsageUpdate,
    currentModel,
    onModelChange,
    isAutoExecutionEnabled = true,
    onToggleAutoExecution = () => {},
    isMobile = false,
    tokenUsage,
    userBalance,
    isMemoryModalOpen,
    onCloseMemory,
    clearChatTrigger,
    onClearChatRequest,
    theme,
    onExpressProgress,
    onExpressComplete,
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState<boolean>(false);
  const [apiCallMessage, setApiCallMessage] = useState<string>('');
  const [pendingFunctionCalls, setPendingFunctionCalls] = useState<any[]>([]);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  
  // Editor iframe overlay state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // Vector storage iframe overlay state
  const [isVectorStorageOpen, setIsVectorStorageOpen] = useState(false);
  
  // Express Debug state
  const [showExpressDebugModal, setShowExpressDebugModal] = useState(false);
  const [expressDebugPayloads, setExpressDebugPayloads] = useState<any[]>([]);

  // Error handling state
  const [lastErrorData, setLastErrorData] = useState<any | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [showProTalkError, setShowProTalkError] = useState(false);

  // Thinking steps state
  const [thinkingSteps, setThinkingSteps] = useState<Message[]>([]);
  const thinkingStepsRef = useRef<Message[]>([]); // Ref to access current steps synchronously

  const chatEndRef = useRef<HTMLDivElement>(null);
  const isAutoCreatingRef = useRef<boolean>(false);
  
  // CRITICAL: Track the ACTIVE bot ID to prevent unnecessary resets and handle race conditions
  const activeBotIdRef = useRef<number | string | null | undefined>(undefined);
  // Track previous model to prevent resets on re-renders if model hasn't changed
  const prevModelRef = useRef<string | undefined>(currentModel);
  // Track previous user to detect logins/logouts
  const prevUserEmailRef = useRef<string | undefined>(user?.email);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to sync state and ref
  const updateThinkingSteps = (newSteps: Message[]) => {
      setThinkingSteps(newSteps);
      thinkingStepsRef.current = newSteps;
  };

  const addThinkingStep = (step: Message) => {
      const newSteps = [...thinkingStepsRef.current, step];
      updateThinkingSteps(newSteps);
  };

  // Helper function to flush thinking steps to history
  const saveThinkingSteps = useCallback(() => {
      if (thinkingStepsRef.current.length > 0) {
          const stepsToSave = [...thinkingStepsRef.current];
          // We clear the current buffer immediately
          updateThinkingSteps([]);
          
          // Create a special message that holds the component
          // We use 'system' sender for styling, but the content will be the ThinkingSteps component
          setMessages(prev => [...prev, {
              id: Date.now().toString() + '-thoughts',
              text: <ThinkingSteps steps={stepsToSave} />,
              sender: 'system'
          }]);
      }
  }, []);

  // Effect to save chat history to localStorage whenever it changes
  useEffect(() => {
    // We only save if the currently displayed bot (activeBotIdRef) is the same as the one in props (selectedBot),
    // and that bot is not null. This prevents saving old message state for a newly selected bot
    // during the re-render cycle before the messages state has been updated.
    if (selectedBot && selectedBot.bot_id === activeBotIdRef.current && messages.length > 1) {
      try {
        const routerHistory = routerService.getInternalHistory();
        if (routerHistory.length > 0) {
          // We save both the visual messages (which can contain React nodes)
          // and the raw router history for full context restoration.
          // Note: Saving React nodes to localStorage isn't possible, so we filter them.
          // This is a limitation, but for text/markdown it works.
          const serializableMessages = messages.filter(m => typeof m.text === 'string');
          localStorage.setItem(`chatHistory_visual_${selectedBot.bot_id}`, JSON.stringify(serializableMessages));
          localStorage.setItem(`chatHistory_router_${selectedBot.bot_id}`, JSON.stringify(routerHistory));
        }
      } catch (e) {
        console.error("Failed to save chat history to localStorage:", e);
      }
    }
  }, [messages, selectedBot]);


  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isApiCallInProgress, pendingFunctionCalls, thinkingSteps]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'm') {
        setShowExpressDebugModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // To fix the "used before declaration" error, a ref is used to break the circular dependency.
  const processRouterResponseRef = useRef<((response: any) => void) | null>(null);
  const handleExecuteToolCallsRef = useRef<((toolCalls: any[]) => void) | null>(null);

  const processRouterResponse = useCallback((response: any) => {
      // STALENESS CHECK
      // eslint-disable-next-line eqeqeq
      if (selectedBot && selectedBot.bot_id != activeBotIdRef.current) {
          console.log(`Ignored stale Router response.`);
          return;
      }

      if (response.text && typeof response.text === 'string' && response.text.trim()) {
          const cleanText = response.text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          const isEnglishReasoning = /^(need to|i need to|let me|i will|we need to|the user wants|first,|looking at|calling the|i should)/i.test(cleanText);
          if (cleanText && !isEnglishReasoning) {
              saveThinkingSteps();
              const botMessage: Message = {
                id: Date.now().toString() + '-bot',
                text: cleanText,
                sender: 'bot',
              };
              setMessages(prevMessages => [...prevMessages, botMessage]);
          }
      }
      
      // Handle tool calls (functionCalls)
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCalls = response.functionCalls;
        
        if (isAutoExecutionEnabled) {
            setTimeout(() => handleExecuteToolCallsRef.current?.(functionCalls), 0);
        } else {
            setPendingFunctionCalls(functionCalls);
        }
      }
  }, [selectedBot, isAutoExecutionEnabled, saveThinkingSteps]);

  const handleExecuteToolCalls = useCallback(async (toolCalls: any[]) => {
    setPendingFunctionCalls([]);
    setExpandedCallId(null);

    toolCalls.forEach(call => {
        let loadingMessageText = `Выполняю команду ${call.name}...`;
        if (call.name === 'create_user_and_bot') loadingMessageText = '🚀 Создаем вашего ИИ-агента...';
        if (call.name === 'edit_bot') loadingMessageText = '⚙️ Обновляем конфигурацию бота...';
        if (call.name === 'get_bot_details') loadingMessageText = '🔍 Получаю текущие настройки бота...';
        if (call.name === 'get_function_info') loadingMessageText = `🔍 Изучаю функцию #${call.args.function_id}...`;
        addThinkingStep({ id: Date.now().toString() + call.id, text: loadingMessageText, sender: 'system' });
    });
    setIsApiCallInProgress(true);

    const executeSingleTool = async (toolCall: any): Promise<{ result: any, newMessages: Message[], botWasUpdated: boolean }> => {
        const { name, args } = toolCall;
        let toolResultData: any = {};
        let newMessages: Message[] = [];
        let botWasUpdated = false;

        try {
            if (name === 'create_user_and_bot') {
                let { user_email, bot_settings } = args;
                if (!user_email && user?.email) user_email = user.email;
                if (!user_email) throw new Error("Не указан Email.");
                const apiResponse = await createUserAndBotAPI(user_email, bot_settings);

                if (apiResponse.success) {
                    const botData = apiResponse.data;
                    // Always trigger a refresh. If the bot was created async, this will pick it up.
                    onBotUpdated(null);
                    // For public mode, we might get an RUID back to log the user in.
                    if (isPublicMode && botData?.ruid) {
                        onPublicLoginSuccess({ ruid: botData.ruid, email: user_email });
                    }
                    // Return success to Gemini. Pass the record_id if we have it.
                    toolResultData = { success: true, message: "Команда создания бота отправлена.", bot_record_id: botData?.bot_record_id };
                } else {
                    throw new Error(`Ошибка создания: ${JSON.stringify(apiResponse.data, null, 2)}`);
                }
            } else if (name === 'edit_bot') {
                const bot_id = args.bot_id || selectedBot?.bot_id;
                const bot_token = args.bot_token || selectedBot?.bot_token;
                if (!bot_id || !bot_token) throw new Error("ID бота не найден.");
                
                const apiResponse = await editBotAPI(bot_id, bot_token, args.bot_settings);
                if (apiResponse.success) {
                    addThinkingStep({ id: Date.now().toString() + '-verify', text: '🔎 Выполняю быстрый самоконтроль: проверяю применение изменений к боту...', sender: 'system' });
                    
                    const verification = await verifyBotSettings(bot_id, bot_token, args.bot_settings);
                    
                    if (verification.verified) {
                        sendMetrikaGoal('app_action_completed');
                        newMessages.push({ id: Date.now().toString() + '-success', text: `Настройки бота обновлены и успешно проверены!`, sender: 'bot' });
                        botWasUpdated = true;
                        toolResultData = { 
                            success: true, 
                            verified: true, 
                            message: "Настройки обновлены и успешно проверены через самоконтроль: бот зафиксировал все изменения.", 
                            applied_settings: args.bot_settings 
                        };
                    } else {
                        console.warn("Самоконтроль: выявлено несовпадение настроек бота", verification.discrepancies);
                        const failedKeys = Object.keys(verification.discrepancies).join(', ');
                        newMessages.push({ 
                            id: Date.now().toString() + '-warning', 
                            text: `⚠️ Самоконтроль: часть параметров (${failedKeys}) возможно не зафиксировалась на сервере.`, 
                            sender: 'bot' 
                        });
                        botWasUpdated = true;
                        toolResultData = { 
                            success: false, 
                            verified: false, 
                            error: `Самоконтроль: изменения (${failedKeys}) не были зафиксированы сервером бота.`, 
                            discrepancies: verification.discrepancies,
                            current_settings: verification.actual
                        };
                    }
                } else {
                    throw new Error(`Ошибка: ${JSON.stringify(apiResponse.data, null, 2)}`);
                }
            } else if (name === 'get_bot_details') {
                const bot_id = args.bot_id || selectedBot?.bot_id;
                const bot_token = args.bot_token || selectedBot?.bot_token;
                if (!bot_id || !bot_token) throw new Error("ID бота не найден.");
                const details = await getBotDetails(bot_id, bot_token);

                // If an external role URL exists, fetch its content and replace the local 'role'
                if (details && details.external_promt_url && selectedBot) {
                    try {
                        addThinkingStep({ id: Date.now().toString() + '-external-role', text: `Загружаю внешнюю роль из документа...`, sender: 'system' });
                        const externalRoleContent = await executeProTalkFunction(
                            selectedBot, 
                            190, // function_id for 'Чтение текста из Google документа'
                            { "url": details.external_promt_url, "limit": "1000000" }
                        );

                        if (typeof externalRoleContent === 'string') {
                            details.role = externalRoleContent;
                        } else {
                            console.warn("Tool 'get_bot_details' failed to load external role, or content was not a string:", externalRoleContent);
                        }
                    } catch (roleError) {
                        console.error("Tool 'get_bot_details' error fetching external role:", roleError);
                    }
                }

                toolResultData = { success: true, details: details };
            } else if (name === 'get_function_info') {
                const { function_id } = args;
                if (!function_id) throw new Error("Не указан ID функции.");
                const info = await getFunctionInfo(function_id);
                toolResultData = { success: true, info: info };
            } else if (name === 'run_function') {
                const { function_id, arguments: func_args } = args;
                if (!selectedBot) throw new Error("Бот не выбран.");
                if (!function_id) throw new Error("Не указан ID функции.");

                let parsedArgs = {};
                if (typeof func_args === 'string') {
                    parsedArgs = safeParseJson(func_args);
                } else if (func_args) {
                    parsedArgs = func_args;
                }

                const pollStatusStepId = Date.now().toString() + '-poll';
                addThinkingStep({ id: pollStatusStepId, sender: 'system', text: `Запускаю функцию #${function_id}...`});

                const onPoll = (status: string, attempt: number) => {
                    let text = `Проверяю результат (попытка #${attempt})...`;
                    if (status === 'done') text = `✅ Функция #${function_id} выполнена!`;
                    if (status === 'error') text = `❌ Ошибка выполнения функции #${function_id}.`;
                    
                    updateThinkingSteps(thinkingStepsRef.current.map(step => 
                        step.id === pollStatusStepId ? { ...step, text } : step
                    ));
                };

                let result;
                if (Number(function_id) === 787) {
                    try {
                        result = await executeProTalkFunction(selectedBot, 787, parsedArgs, onPoll);
                        const extracted = extractImageUrl(result);
                        if (!extracted) {
                            throw new Error("Функция 787 не вернула изображение");
                        }
                    } catch (err787: any) {
                        console.warn("Function 787 did not return an image or threw error, trying reserve function 621:", err787);
                        const fallbackStepId = Date.now().toString() + '-fallback-787';
                        addThinkingStep({
                            id: fallbackStepId,
                            sender: 'system',
                            text: `Функция #787 не вернула картинку (${err787.message || 'нет URL'}). Повторяю с запасной функцией #621...`
                        });
                        const onPollFallback = (status: string, attempt: number) => {
                            let text = `Запасная функция #621: проверяю результат (попытка #${attempt})...`;
                            if (status === 'done') text = `✅ Запасная функция #621 выполнена!`;
                            if (status === 'error') text = `❌ Ошибка выполнения запасной функции #621.`;
                            
                            updateThinkingSteps(thinkingStepsRef.current.map(step => 
                                step.id === fallbackStepId ? { ...step, text } : step
                            ));
                        };
                        result = await executeProTalkFunction(selectedBot, 621, parsedArgs, onPollFallback);
                    }
                } else {
                    result = await executeProTalkFunction(selectedBot, function_id, parsedArgs, onPoll);
                }
                toolResultData = { success: true, result: result };
            } else if (name === 'get_filtered_google_table_v2') {
                if (!selectedBot) throw new Error("Бот не выбран.");
                const functionId = 201; // Function ID for "База данных в виде Google таблицы"
                const pollStatusStepId = Date.now().toString() + '-poll-gtable';
                addThinkingStep({ id: pollStatusStepId, sender: 'system', text: `Читаю данные из Google Таблицы...`});

                const onPoll = (status: string, attempt: number) => {
                    let text = `Проверяю результат (попытка #${attempt})...`;
                    if (status === 'done') text = `✅ Данные из таблицы получены!`;
                    if (status === 'error') text = `❌ Ошибка чтения таблицы.`;
                    
                    updateThinkingSteps(thinkingStepsRef.current.map(step => 
                        step.id === pollStatusStepId ? { ...step, text } : step
                    ));
                };

                const result = await executeProTalkFunction(selectedBot, functionId, args, onPoll);
                toolResultData = { success: true, result: result };
            }
        } catch (error: any) {
            console.error(`Error executing tool ${name}:`, error);
            // Gracefully report error to the LLM agent instead of crashing the entire UI with a modal
            toolResultData = { 
                success: false, 
                error: error instanceof ProTalkApiError 
                    ? `Функция ${name} не смогла завершиться на сервере ProTalk (${error.message}). Проверьте настройки функции или повторите попытку позже.`
                    : (error?.message || String(error)) 
            };
        }
        return { result: toolResultData, newMessages, botWasUpdated };
    };
    
    try {
        const outcomes = await Promise.all(toolCalls.map(executeSingleTool));
        saveThinkingSteps();

        const allNewMessages = outcomes.flatMap(o => o.newMessages);
        if (allNewMessages.length > 0) {
            setMessages(prev => [...prev, ...allNewMessages]);
        }
        if (outcomes.some(o => o.botWasUpdated)) {
            onBotUpdated(selectedBot);
        }

        const toolCallResults = outcomes.map((outcome, index) => ({
            id: toolCalls[index].id,
            name: toolCalls[index].name,
            response: outcome.result
        }));

        setIsApiCallInProgress(false);
        setIsLoading(true);
        const response = await routerService.sendToolResponse(toolCallResults);
        if (response?.usageMetadata?.totalTokenCount) {
            onTokenUsageUpdate(response.usageMetadata.totalTokenCount);
        }
        processRouterResponseRef.current?.(response);
    } catch (error: any) {
        saveThinkingSteps();
        if (error instanceof ProTalkApiError) {
            console.error("Caught ProTalk API Error. Displaying modal.", error);
            setShowProTalkError(true);
        } else {
            const errorMsg = error?.message || String(error || '');
            const isTimeoutErr = errorMsg.includes('Превышено время ожидания') || 
                                 errorMsg.includes('таймаут') || 
                                 errorMsg.includes('timeout') || 
                                 errorMsg.includes('Timed out');
            const isProviderErr = errorMsg.includes('Provider returned error') || 
                                  errorMsg.includes('discount routes') || 
                                  errorMsg.includes('fallback failed') ||
                                  errorMsg.includes('502') ||
                                  errorMsg.includes('503') ||
                                  errorMsg.includes('504');
            const isFreeModel = currentModel === 'protalk:free' || currentModel?.toLowerCase().includes('free');

            let errorMessageText: string;
            if (isFreeModel && (isTimeoutErr || isProviderErr)) {
                errorMessageText = `Бесплатная модель генерации временно недоступна из-за повышенного спроса. Пожалуйста, выберите любую модель из списка в шапке приложения.##INLINE:[Выбрать модель(cmd:open_model_picker);Повторить запрос]##`;
            } else if (isTimeoutErr) {
                errorMessageText = `Превышено время ожидания ответа от ИИ агента. Сервер временно перегружен. Пожалуйста, повторите запрос или выберите другую модель из списка в шапке приложения.##INLINE:[Повторить запрос;Выбрать модель(cmd:open_model_picker)]##`;
            } else if (isProviderErr) {
                errorMessageText = `⚠️ Сервер ИИ временно перегружен или недоступен (сбой внешнего маршрута провайдера). Пожалуйста, повторите запрос или выберите другую модель в шапке приложения.##INLINE:[Повторить запрос;Выбрать модель(cmd:open_model_picker)]##`;
            } else {
                errorMessageText = `К сожалению, произошла ошибка после выполнения команды: ${errorMsg}`;
                if (error.rawResponse) {
                    setLastErrorData({ request: error.requestPayload, response: error.rawResponse });
                    errorMessageText += `##INLINE:[Повторить запрос;🐞 Подробнее об ошибке(cmd:show_error_details)]##`;
                }
            }
            setMessages(prev => [...prev, { id: Date.now().toString() + '-error', sender: 'bot', text: errorMessageText }]);
        }
    } finally {
        setIsApiCallInProgress(false);
        setIsLoading(false);
    }
  }, [selectedBot, user, isPublicMode, onBotUpdated, onPublicLoginSuccess, onTokenUsageUpdate, saveThinkingSteps, currentModel]);

  useLayoutEffect(() => {
    processRouterResponseRef.current = processRouterResponse;
    handleExecuteToolCallsRef.current = handleExecuteToolCalls;
  });

  // Initialize chat context
  const initializeChat = useCallback(async (forcedBotId?: number | string | null, forcedBotToken?: string, botName?: string) => {
    if (isApiCallInProgress) return;
  
    const targetId = forcedBotId === undefined ? selectedBot?.bot_id : forcedBotId;
    // eslint-disable-next-line eqeqeq
    const isActive = activeBotIdRef.current == targetId;
    if (isActive && targetId !== undefined && targetId !== null) return;
  
    activeBotIdRef.current = targetId;
  
    const botContext = {
      botId: typeof targetId === 'string' ? parseInt(targetId, 10) : (targetId ?? null),
      botToken: forcedBotToken ?? null
    };
  
    const botDisplayName = botName || (targetId ? `Бот #${targetId}` : '');
    const botCreatedText = `🎉 Бот "${botDisplayName}" создан и ждёт ваших указаний!

Опишите своими словами, какую задачу он должен выполнять:
• Какая у него роль или профессия?
• С какими вопросами к нему будут обращаться пользователи и в каком стиле он должен отвечать?
• Нужны ли ему специальные возможности (Google Таблицы, генерация изображений, ссылки, приём файлов)?

Напишите задачу так подробно, как хотите — я сам сформирую системный промпт, инструкции и подготовлю бота к работе.`;

    const debugOfferText = `Бот "${botDisplayName}" открыт и готов к работе! 🛠️
Давайте приступим к отладке и более детальной настройке. Что вы хотите проверить или улучшить в его поведении?##INLINE:[Проверить промпт и роль;Протестировать ответы бота;Настроить функции и действия;Изменить приветствие и имя]##`;

    // --- NEW: Chat History Loading Logic ---
    if (targetId) {
      try {
        const savedVisualHistoryJSON = localStorage.getItem(`chatHistory_visual_${targetId}`);
        const savedRouterHistoryJSON = localStorage.getItem(`chatHistory_router_${targetId}`);
  
        if (savedVisualHistoryJSON && savedRouterHistoryJSON) {
          console.log(`Restoring chat history for bot ${targetId}`);
          let visualHistory = JSON.parse(savedVisualHistoryJSON);
          const routerHistory = JSON.parse(savedRouterHistoryJSON);

          // Предлагаем приступить к отладке, если такого предложения ещё нет в конце истории
          const hasRecentDebugPrompt = visualHistory.length > 0 && 
              typeof visualHistory[visualHistory.length - 1]?.text === 'string' &&
              visualHistory[visualHistory.length - 1].text.includes('приступим к отладке');

          if (!hasRecentDebugPrompt && forcedBotId) {
              const debugPromptMsg: Message = {
                  id: 'init-debug-' + Date.now(),
                  sender: 'bot',
                  text: debugOfferText
              };
              visualHistory = [...visualHistory, debugPromptMsg];
          }
  
          setMessages(visualHistory);
          await routerService.resetChat(user?.email, currentModel, routerHistory, botContext);
          
          setPendingFunctionCalls([]);
          updateThinkingSteps([]); 
          setIsLoading(false);
          setIsApiCallInProgress(false);
          setApiCallMessage('');
          return; // Exit here
        }
      } catch (e) {
        console.error("Failed to parse saved chat history:", e);
        // Clear corrupted data
        localStorage.removeItem(`chatHistory_visual_${targetId}`);
        localStorage.removeItem(`chatHistory_router_${targetId}`);
      }
    }
    // --- End of New Loading Logic ---
  
    // This part runs only if no saved history was found
    setMessages([]);
    setPendingFunctionCalls([]);
    updateThinkingSteps([]);
    setIsLoading(false);
    setIsApiCallInProgress(false);
    setApiCallMessage('');
  
    if (targetId) {
      const isNewBot = !hasRecordedFirstRequest(targetId) || botDisplayName.toLowerCase().includes('новый');
      const welcomeText = isNewBot ? botCreatedText : debugOfferText;
      const initialHistory = [{ role: 'assistant', content: welcomeText }];
      await routerService.resetChat(user?.email, currentModel, initialHistory, botContext);
      setMessages([{ id: 'init-edit', sender: 'bot', text: welcomeText }]);
    } else {
      const initialText = isPublicMode
        ? 'Привет! Я помогу вам создать вашего ИИ-агента в ProTalk. Для начала, пожалуйста, укажите email для нового пользователя.'
        : 'Привет! Я готов помочь создать нового ИИ-агента. Расскажите, какую задачу он должен выполнять?';
      const initialHistory = [{ role: 'assistant', content: initialText }];
      await routerService.resetChat(user?.email, currentModel, initialHistory, botContext);
      setMessages([{ id: 'init', sender: 'bot', text: initialText }]);
    }
  }, [user, isPublicMode, currentModel, isApiCallInProgress, selectedBot]);


  // Effect to handle chat clearing
  useEffect(() => {
    // Do not run on initial render (trigger === 0)
    if (clearChatTrigger > 0) {
      if (selectedBot) {
        console.log(`Clearing chat for bot ${selectedBot.bot_id}`);
        localStorage.removeItem(`chatHistory_visual_${selectedBot.bot_id}`);
        localStorage.removeItem(`chatHistory_router_${selectedBot.bot_id}`);

        // Force re-initialization of the chat by invalidating the active bot ref
        activeBotIdRef.current = null; 
        initializeChat(selectedBot.bot_id, selectedBot.bot_token, selectedBot.name);
      } else {
        initializeChat();
      }
    }
  }, [clearChatTrigger, initializeChat, selectedBot]);


  // Consolidated effect to manage chat state changes
  useEffect(() => {
    if (isApiCallInProgress) return;

    // eslint-disable-next-line eqeqeq
    const botIdChanged = selectedBot?.bot_id != activeBotIdRef.current;
    const modelChanged = currentModel && currentModel !== prevModelRef.current;
    const userChanged = user?.email !== prevUserEmailRef.current;

    if (botIdChanged && !isAutoCreatingRef.current) {
        initializeChat(selectedBot?.bot_id, selectedBot?.bot_token, selectedBot?.name);
    } else if (!botIdChanged && (modelChanged || userChanged)) {
        const botContext = { botId: selectedBot?.bot_id ?? null, botToken: selectedBot?.bot_token ?? null };
        routerService.resetChat(user?.email, currentModel, true, botContext);
    }

    if (currentModel) prevModelRef.current = currentModel;
    prevUserEmailRef.current = user?.email;

  }, [selectedBot, currentModel, user, isApiCallInProgress, initializeChat]);

  
  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    saveThinkingSteps();
    setPendingFunctionCalls([]);
    setExpandedCallId(null);
    
    // --- Auto-create bot on first message if none is selected ---
    if (!selectedBot && user) {
        isAutoCreatingRef.current = true; 
        setIsLoading(true);
        
        // VISUAL FIX: Show system messages FIRST to establish timeline
        setMessages(prev => [...prev, { 
            id: 'creating-system-msg', 
            text: 'Отличная идея! Минутку, создаю для вас нового бота...', 
            sender: 'system' 
        }]);
        
        try {
            const newBot = await onCreateNewBot();
            if (!newBot) throw new Error("Не удалось получить данные нового бота.");

            // Сохраняем первый запрос пользователя для нового бота в PostgreSQL user_needs
            const userCredentials = resolveUserLoginAndEmail(user);
            recordFirstRequest({
                user_login: userCredentials.user_login,
                user_email: userCredentials.user_email,
                query: userInput,
                bot_id: newBot.bot_id,
                bot_name: newBot.name,
                bot_token: newBot.bot_token,
                metadata: { source: 'auto_create_chat', model: currentModel }
            });

            activeBotIdRef.current = newBot.bot_id;
            onSelectBot(newBot);
            routerService.setAuthToken(newBot);

            // VISUAL FIX: Show "Bot Created" message SECOND
            setMessages(prev => [...prev, { 
                id: 'created-system-msg', 
                text: `Бот "${newBot.name}" создан. Теперь отправляю ваше задание...`, 
                sender: 'system'
            }]);

            // VISUAL FIX: Show User Message LAST, so it appears chronologically after creation
            setMessages(prev => [...prev, { id: Date.now().toString(), text: userInput, sender: 'user' }]);
            
            // Backend operations
            await routerService.resetChat(user.email, currentModel, [], { botId: newBot.bot_id, botToken: newBot.bot_token });
            const response = await routerService.sendMessage(userInput);

            if (response?.usageMetadata?.totalTokenCount) onTokenUsageUpdate(response.usageMetadata.totalTokenCount);
            processRouterResponse(response);

        } catch (error: any) {
            if (error instanceof ProTalkApiError) {
                setShowProTalkError(true);
            } else {
                 console.error('Failed to create bot and send message:', error);
                 setMessages(prev => [
                    ...prev,
                    { id: Date.now().toString(), text: userInput, sender: 'user' },
                    { id: Date.now().toString() + '-error', text: `Произошла ошибка при создании бота.`, sender: 'bot' }
                 ]);
            }
        } finally {
            setIsLoading(false);
            isAutoCreatingRef.current = false;
        }
        return;
    }

    // Normal flow (if bot is already selected)
    // Сохраняем сформулированное ТЗ для нового бота (только если для этого бота ТЗ ещё не фиксировалось)
    if (selectedBot && !hasRecordedFirstRequest(selectedBot.bot_id)) {
        const userCredentials = resolveUserLoginAndEmail(user);
        recordFirstRequest({
            user_login: userCredentials.user_login,
            user_email: userCredentials.user_email,
            query: userInput.trim(),
            bot_id: selectedBot.bot_id,
            bot_name: selectedBot.name,
            bot_token: selectedBot.bot_token,
            metadata: { source: 'chat_new_bot_tz', model: currentModel }
        });
    }

    setMessages(prevMessages => [...prevMessages, { id: Date.now().toString(), text: userInput, sender: 'user' }]);
    setIsLoading(true);
    try {
      const response = await routerService.sendMessage(userInput);
      if (response?.usageMetadata?.totalTokenCount) onTokenUsageUpdate(response.usageMetadata.totalTokenCount);
      processRouterResponse(response);
    } catch (error: any) {
      console.error('Failed to get response:', error);
      const errorMsg = error?.message || String(error || '');
      const isTimeoutErr = errorMsg.includes('Превышено время ожидания') || 
                           errorMsg.includes('таймаут') || 
                           errorMsg.includes('timeout') || 
                           errorMsg.includes('Timed out');
      const isProviderErr = errorMsg.includes('Provider returned error') || 
                            errorMsg.includes('discount routes') || 
                            errorMsg.includes('fallback failed') ||
                            errorMsg.includes('502') ||
                            errorMsg.includes('503') ||
                            errorMsg.includes('504');
      const isFreeModel = currentModel === 'protalk:free' || currentModel?.toLowerCase().includes('free');

      let errorMessageText: string;
      if (isFreeModel && (isTimeoutErr || isProviderErr)) {
          errorMessageText = `Бесплатная модель генерации временно недоступна из-за повышенного спроса. Пожалуйста, выберите любую модель из списка в шапке приложения.##INLINE:[Выбрать модель(cmd:open_model_picker);Повторить запрос]##`;
      } else if (isTimeoutErr) {
          errorMessageText = `Превышено время ожидания ответа от ИИ агента. Сервер временно перегружен. Пожалуйста, повторите запрос или выберите другую модель из списка в шапке приложения.##INLINE:[Повторить запрос;Выбрать модель(cmd:open_model_picker)]##`;
      } else if (isProviderErr) {
          errorMessageText = `⚠️ Сервер ИИ временно перегружен или недоступен (сбой внешнего маршрута провайдера). Попробуйте повторить запрос через несколько секунд или выберите другую модель.##INLINE:[Повторить запрос;Выбрать модель(cmd:open_model_picker);🐞 Подробнее об ошибке(cmd:show_error_details)]##`;
      } else if (error.rawResponse) {
          setLastErrorData({
              request: error.requestPayload || "Request details not available",
              response: error.rawResponse
          });
          errorMessageText = `⚠️ Ошибка: ${errorMsg}##INLINE:[Повторить запрос;🐞 Подробнее об ошибке(cmd:show_error_details)]##`;
      } else {
          errorMessageText = `К сожалению, произошла ошибка: ${errorMsg}`;
      }

      saveThinkingSteps();
      setMessages(prev => [...prev, { id: Date.now().toString() + '-error', text: errorMessageText, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBot, user, onCreateNewBot, onSelectBot, onTokenUsageUpdate, saveThinkingSteps, currentModel, processRouterResponse]);

  const handleQuickReply = (replyText: string) => {
    if (replyText.includes('cmd:open_model_picker')) {
        window.dispatchEvent(new CustomEvent('protalk:open_model_picker'));
        return;
    }
    if (replyText.includes('cmd:show_error_details')) {
        setIsErrorModalOpen(true);
        return;
    }
    if (
        replyText.includes('cmd:open_vector_storage') || 
        replyText.includes('open_vector_storage') || 
        replyText.toLowerCase().includes('загрузка знаний в векторном виде')
    ) {
        setIsVectorStorageOpen(true);
        return;
    }
    handleSendMessage(replyText);
  };
  
  // Expose the express create function via the ref
  useImperativeHandle(ref, () => ({
    async startExpressCreate(description: string, model: string) {
        if (!user?.ruid || !user?.email) {
            onExpressComplete(false, null, null);
            return;
        }

        const originalModel = routerService.getModel();
        let totalTokens = 0;

        // DEBUG: Start express create flow
        console.group('[Express Debug] Start Express Create');
        console.log('User:', user.email);
        console.log('Description:', description);
        console.log('Selected Model:', model);
        setExpressDebugPayloads([{ stage: 'Start', user: user.email, description, model }]);

        try {
            // STEP 1: Use the selected model for express creation
            const expressModel = model;
            routerService.setModel(expressModel);
            console.log('Model set to:', expressModel);

            onExpressProgress({ message: 'Создаю нового бота...', percent: 10 });
            
            // STEP 2: Create base bot FIRST
            const minimalSettings = {
                bot_name: 'Новый Бот',
                bot_gender: 'Мужчина',
                bot_language: 'Русский',
                ai_model: 'chatGPT 5.6 Luna',
                role: 'System initialization...',
                bot_position: 'Ассистент',
                ai_modal_image: true,
                ai_modal_doc: true
            };

            const existingBotRecordIds = new Set((await getBots(user.ruid)).map(b => b.bot_record_id));
            const createApiResponse = await createUserAndBotAPI(user.email, minimalSettings);
            if (!createApiResponse.success || !createApiResponse.data) {
                throw new Error(createApiResponse.data || "Ошибка при создании базового бота.");
            }
            const newBotRecordId = createApiResponse.data.bot_record_id;
            
            onExpressProgress({ message: 'Ожидание готовности бота...', percent: 25 });
            
            let newBot: Bot | undefined;
            const MAX_POLL_TIME_MS = 120000; // 2 minutes timeout
            const startTime = Date.now();
            let delay = 2000; // Start with 2s
            let attempt = 1;

            while (Date.now() - startTime < MAX_POLL_TIME_MS) {
                const currentBots = await getBots(user.ruid);
                
                if (newBotRecordId) {
                    newBot = currentBots.find(b => b.bot_record_id === newBotRecordId && b.bot_id && b.bot_token);
                } else {
                    newBot = currentBots.find(b => !existingBotRecordIds.has(b.bot_record_id) && b.bot_id && b.bot_token);
                }
                
                if (newBot) {
                    break;
                }
                
                const elapsedTime = Date.now() - startTime;
                const progressPercent = 25 + Math.floor((elapsedTime / MAX_POLL_TIME_MS) * 15); 
                onExpressProgress({ message: `Ожидание готовности сервера... (попытка ${attempt})`, percent: progressPercent });
                
                await new Promise(resolve => setTimeout(resolve, delay));
                
                delay = Math.min(delay + 1000, 8000); 
                attempt++;
            }

            if (!newBot) {
                throw new Error("Не удалось получить данные нового бота после создания. Бот может быть создан, но не виден в списке. Попробуйте обновить список ботов вручную.");
            }

            // Сохраняем первый запрос пользователя (описание бота) для нового бота в PostgreSQL user_needs
            const userCredentials = resolveUserLoginAndEmail(user);
            recordFirstRequest({
                user_login: userCredentials.user_login,
                user_email: userCredentials.user_email,
                query: description,
                bot_id: newBot.bot_id,
                bot_name: newBot.name,
                bot_token: newBot.bot_token,
                metadata: { source: 'express_create', model: expressModel }
            });
            
            // STEP 3: Set Auth Token for Router based on the NEW bot (This fixes 401)
            routerService.setAuthToken(newBot);
            await routerService.resetChat(user.email, expressModel, false, { botId: newBot.bot_id, botToken: newBot.bot_token });

            // STEP 4: Ask LLM to generate settings
            onExpressProgress({ message: 'Формирую личность и промпт...', percent: 45 });
            
            // Определение потребности в файлах на входе по описанию задачи
            const reqModalities = detectRequiredModalities(description);
            const needsFiles = reqModalities.image || reqModalities.video || reqModalities.audio || reqModalities.doc;
            const recommendedModel = needsFiles ? getRecommendedMultimodalModel(reqModalities) : 'chatGPT 4 omni mini';

            const expressPrompt = `EXPRESS_CREATE_MODE: Проанализируй описание бота: "${description}". Работай полностью автономно, не задавай вопросов. Сразу вызови функцию 'propose_express_bot_configuration'. Заполни 'bot_settings' всеми параметрами, которые ты можешь определить из описания.
ВАЖНО ПО ОБРАБОТКЕ ВХОДЯЩИХ ФАЙЛОВ: Если в описании есть необходимость обработки файлов (фото/изображения, видео, аудио/голосовые, документы PDF/DOCX/TXT), ОБЯЗАТЕЛЬНО выбери мультимодальную модель, поддерживающую эти форматы (рекомендуется: '${recommendedModel}'), и СРАЗУ установи нужные булевы ключи в 'bot_settings':
- 'ai_modal_image': true/false (обработка фото)
- 'ai_modal_video': true/false (обработка видео)
- 'ai_modal_audio': true/false (обработка аудио/голосовых)
- 'ai_modal_doc': true/false (обработка документов)
Если обработка файлов не требуется, поставь 'ai_model': 'chatGPT 4 omni mini', а все ключи 'ai_modal_*' в false.
Также заполни остальные параметры: 'bot_name', 'telegram_bot_token', 'telegram_bot_name', 'bot_position', 'company', 'bot_gender', 'bot_language', 'creativity', 'voice_name', 'greeting', 'role', 'functions', 'knowledge_bases', 'api_server', 'external_log_url', 'external_promt_url', 'openai_vector_store_id'. Если в описании указан токен Telegram бота, ОБЯЗАТЕЛЬНО сохрани его в поле 'telegram_bot_token'. Если указан никнейм/имя Telegram бота (например, @myname_bot), ОБЯЗАТЕЛЬНО сохрани в 'telegram_bot_name'. Если указано просто имя бота, сохрани в 'bot_name'. Также ОБЯЗАТЕЛЬНО сгенерируй отдельный креативный 'avatar_prompt' на английском языке для создания аватара.`;
            
            console.log('Sending message to Router...');
            const response = await routerService.sendMessage(expressPrompt);
            console.log('Router Response:', response);
            setExpressDebugPayloads(prev => [...prev, { stage: 'Router Response', response }]);

            // Accumulate tokens
            const callTokens = response?.usageMetadata?.totalTokenCount || 0;
            totalTokens += callTokens;
            onTokenUsageUpdate(callTokens); // Also update global counter

            const proposalCall = response.functionCalls?.find((call: any) => call.name === 'propose_express_bot_configuration');
            if (!proposalCall) throw new Error("Ассистент не смог сформировать конфигурацию для бота (нет вызова функции propose_express_bot_configuration).");

            const { bot_settings, avatar_prompt } = proposalCall.args;
            console.log('Proposal Args:', proposalCall.args);
            setExpressDebugPayloads(prev => [...prev, { stage: 'Proposal Args', args: proposalCall.args }]);

            if (!bot_settings || !avatar_prompt) throw new Error("Ассистент вернул неполную конфигурацию.");

            // STEP 5: Generate Avatar (Primary: Function 787, Fallback: Function 621)
            onExpressProgress({ message: 'Генерирую аватар (Функция 787)...', percent: 60 });
            let avatarUrl = '';
            let avatarResult: any = null;

            try {
                // Primary: Use function ID 787 for avatar generation
                avatarResult = await executeProTalkFunction(newBot, 787, {
                    "prompt": avatar_prompt,
                }, (status, attempt) => {
                     const p = 60 + Math.min(18, attempt * 1);
                     onExpressProgress({ message: `Генерирую аватар (Функция 787)... (${attempt * 3} сек.)`, percent: p });
                });
                
                console.log("Raw Avatar Result (Function 787):", avatarResult);
                setExpressDebugPayloads(prev => [...prev, { stage: 'Avatar Result (Function 787)', avatarResult }]);
                avatarUrl = extractImageUrl(avatarResult);
            } catch (avatarError787: any) {
                console.warn("Function 787 avatar generation failed or returned error:", avatarError787);
                setExpressDebugPayloads(prev => [...prev, { stage: 'Function 787 Error', error: avatarError787.message || String(avatarError787) }]);
            }

            // Fallback: If Function 787 did not return a valid image URL, repeat with reserve function 621
            if (!avatarUrl) {
                console.log("Функция 787 не вернула картинку. Повторяю с помощью запасной функции 621...");
                onExpressProgress({ message: 'Функция 787 не вернула изображение, повторяю с запасной функцией...', percent: 70 });
                try {
                    avatarResult = await executeProTalkFunction(newBot, 621, {
                        "prompt": avatar_prompt,
                    }, (status, attempt) => {
                         const p = 70 + Math.min(18, attempt * 1);
                         onExpressProgress({ message: `Генерирую аватар запасной функцией 621... (${attempt * 3} сек.)`, percent: p });
                    });
                    
                    console.log("Raw Avatar Result (Reserve Function 621):", avatarResult);
                    setExpressDebugPayloads(prev => [...prev, { stage: 'Avatar Result (Fallback 621)', avatarResult }]);
                    avatarUrl = extractImageUrl(avatarResult);
                } catch (fallbackError: any) {
                    console.error("Express create: reserve avatar generation failed, continuing.", fallbackError);
                    onExpressProgress({ message: `Ошибка генерации аватара: ${fallbackError.message || 'Unknown'}. Пропускаю...`, percent: 75 });
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            if (avatarUrl) {
                setExpressDebugPayloads(prev => [...prev, { stage: 'Extracted Avatar URL', avatarUrl }]);
                console.log("Avatar generated successfully:", avatarUrl);
            } else {
                console.warn("Avatar generation did not return a valid URL. Result:", avatarResult);
            }
            
            // STEP 6: Apply final settings with multimodal configuration
            onExpressProgress({ message: 'Применяю детальные настройки...', percent: 90 });
            
            const chosenModel = bot_settings.ai_model || recommendedModel;
            const resolvedModalities = getModalitiesToApply(chosenModel, {
                image: bot_settings.ai_modal_image ?? reqModalities.image,
                video: bot_settings.ai_modal_video ?? reqModalities.video,
                audio: bot_settings.ai_modal_audio ?? reqModalities.audio,
                doc: bot_settings.ai_modal_doc ?? reqModalities.doc,
            });

            const finalSettings = {
                ...bot_settings,
                ai_model: chosenModel,
                ...resolvedModalities,
                ...(avatarUrl && { photo_url: avatarUrl }) // Apply avatar URL only if generated
            };
            setExpressDebugPayloads(prev => [...prev, { stage: 'Final Settings', finalSettings }]);
            
            try {
                await editBotAPI(newBot.bot_id, newBot.bot_token, finalSettings);
            } catch (updateError) {
                console.error("Error applying final detailed settings:", updateError);
            }

            onExpressProgress({ message: 'Завершение...', percent: 100 });
            onExpressComplete(true, newBot.bot_record_id, { tokens: totalTokens, model: expressModel });
            console.log('[Express Debug] Success!', { tokens: totalTokens });

        } catch (error) {
            console.error("[Express Debug] Failed:", error);
            onExpressComplete(false, null, null);
        } finally {
            console.groupEnd();
            routerService.setModel(originalModel); // Restore the original model
        }
    }
  }), [user, currentModel, onExpressComplete, onExpressProgress, onTokenUsageUpdate]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#313a41] text-gray-900 dark:text-white relative">
      {showProTalkError && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-fade-in p-4"
          onClick={() => setShowProTalkError(false)}
        >
            <div 
              className="bg-white dark:bg-[#313a41] p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center border border-amber-400 dark:border-amber-600 relative animate-fade-in-scale"
              onClick={e => e.stopPropagation()}
            >
                <button
                  type="button"
                  onClick={() => setShowProTalkError(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg cursor-pointer transition-colors"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">Внимание!</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Сервер ProTalk временно не отвечает на один из сетевых запросов. Чтобы избежать лишнего расхода токенов, рекомендуем подождать несколько секунд перед продолжением.
                </p>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Если ошибка повторяется регулярно, отправьте скриншот в техподдержку.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button 
                      onClick={() => setShowProTalkError(false)}
                      className="px-6 py-2.5 bg-[#2a62ff] text-white text-sm font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer transition-colors shadow-sm"
                  >
                      Понятно
                  </button>
                  <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl cursor-pointer transition-colors"
                  >
                      Обновить страницу
                  </button>
                </div>
            </div>
        </div>
      )}

      <Header 
        isAutoExecutionEnabled={isAutoExecutionEnabled} 
        onToggleAutoExecution={onToggleAutoExecution}
        onClearChat={onClearChatRequest}
        currentModel={currentModel || 'google/gemini-2.5-pro'}
        tokenUsage={tokenUsage}
        userBalance={userBalance}
        selectedBotId={selectedBot?.bot_id}
        selectedBotName={selectedBot?.name}
        selectedBot={selectedBot}
        theme={theme}
        onOpenEditor={() => setIsEditorOpen(true)}
        onModelChange={onModelChange}
      />

      {/* Editor iframe overlay covering full width & height of central chat editor block */}
      {isEditorOpen && selectedBot && (
        <div className="absolute inset-0 z-40 bg-white dark:bg-[#313a41] flex flex-col overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-[#424e5a] bg-white dark:bg-[#313a41] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2a62ff] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                  <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                Редактор бота {selectedBot.name}
              </h3>
            </div>
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Закрыть редактор"
              aria-label="Закрыть редактор"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative flex-1 w-full h-full bg-gray-50 dark:bg-[#23262b] overflow-hidden">
            <iframe
              src={`https://protalk-bot-editor.lubanyacloud.ru/?bot_id=${selectedBot.bot_id}&bot_token=${encodeURIComponent(selectedBot.bot_token)}&theme=${theme}&dark=${theme === 'dark' ? 1 : 0}`}
              style={{ width: 'calc(100% + 20px)', height: '100%', border: 'none' }}
              className="w-[calc(100%+20px)] h-full border-0 no-scrollbar"
              title={`Редактировать вручную ${selectedBot.name}`}
              allow="clipboard-write; microphone"
            />
          </div>
        </div>
      )}

      {/* Vector Storage iframe overlay covering full width & height of central chat editor block */}
      {isVectorStorageOpen && selectedBot && (
        <div className="absolute inset-0 z-40 bg-white dark:bg-[#313a41] flex flex-col overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-[#424e5a] bg-white dark:bg-[#313a41] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                Загрузка знаний в векторном виде {selectedBot.name ? `(${selectedBot.name})` : ''}
              </h3>
            </div>
            <button 
              onClick={() => setIsVectorStorageOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Закрыть векторное хранилище"
              aria-label="Закрыть векторное хранилище"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative flex-1 w-full h-full bg-gray-50 dark:bg-[#23262b] overflow-hidden">
            <iframe
              src={`https://protalk-vector-storage.lubanyacloud.ru/?bot_id=${selectedBot.bot_id}&bot_token=${encodeURIComponent(selectedBot.bot_token)}&theme=${theme}&dark=${theme === 'dark' ? 1 : 0}`}
              style={{ width: 'calc(100% + 20px)', height: '100%', border: 'none' }}
              className="w-[calc(100%+20px)] h-full border-0 no-scrollbar"
              title={`Векторное хранилище ${selectedBot.name}`}
              allow="clipboard-write; microphone"
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onQuickReply={handleQuickReply} 
            isLoading={isLoading || isApiCallInProgress} 
            theme={theme}
            onOpenVectorStorage={() => setIsVectorStorageOpen(true)}
            onOpenEditor={() => setIsEditorOpen(true)}
          />
        ))}
        {thinkingSteps.length > 0 && <ThinkingSteps steps={thinkingSteps} />}
        {isLoading && !thinkingSteps.length && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-200 dark:bg-[#36404a] rounded-tr-2xl rounded-tl-2xl rounded-br-2xl px-5 py-3 shadow-md flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2a62ff] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#2a62ff] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#2a62ff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
        
        {pendingFunctionCalls.length > 0 && !isAutoExecutionEnabled && (
            <div className="sticky bottom-4 left-0 right-0 mx-auto w-full max-w-2xl bg-white dark:bg-[#313a41] border border-gray-200 dark:border-[#424e5a] rounded-xl shadow-2xl p-4 flex flex-col gap-3 z-50 animate-fade-in-up">
                <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400">
                    <span className="font-semibold text-sm">Требуется подтверждение {pendingFunctionCalls.length > 1 ? 'действий' : 'действия'}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#23262b]/50 p-2 rounded border border-gray-200 dark:border-[#424e5a] max-h-80 overflow-y-auto custom-scrollbar">
                    {pendingFunctionCalls.map((call, index) => {
                        const callId = call.id || index.toString();
                        const isExpanded = expandedCallId === callId;
                        return (
                            <div key={callId} className="font-mono p-1 text-xs">
                                <div 
                                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-[#36404a] rounded p-1 break-all"
                                    onClick={() => setExpandedCallId(isExpanded ? null : callId)}
                                    title="Нажмите, чтобы развернуть/свернуть"
                                >
                                    - {call.name}({isExpanded ? '...' : `${JSON.stringify(call.args).substring(0, 100)}...`})
                                </div>
                                {isExpanded && (
                                    <pre className="whitespace-pre-wrap break-all p-2 bg-gray-50 dark:bg-black/20 rounded mt-1 text-[11px] max-h-64 overflow-auto custom-scrollbar">
                                        {JSON.stringify(call.args, null, 2)}
                                    </pre>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-3 mt-1">
                    <button 
                        onClick={() => handleExecuteToolCalls(pendingFunctionCalls)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                        Выполнить все ({pendingFunctionCalls.length})
                    </button>
                    <button 
                        onClick={() => {
                            setPendingFunctionCalls([]);
                            setExpandedCallId(null);
                        }}
                        className="flex-1 bg-gray-600 dark:bg-[#424e5a] hover:bg-gray-500 dark:hover:bg-[#36404a] text-white py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className={`${isMobile && !selectedBot ? 'hidden' : ''}`}>
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isApiCallInProgress} />
      </div>

      <MemoryModal 
        isOpen={isMemoryModalOpen} 
        onClose={onCloseMemory} 
        user={user}
      />
      
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorData={lastErrorData}
      />

      {showExpressDebugModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2b333b] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Express Debug Payloads</h2>
              <button onClick={() => setShowExpressDebugModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50 dark:bg-[#1a2026]">
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                {JSON.stringify(expressDebugPayloads, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ChatInterface;