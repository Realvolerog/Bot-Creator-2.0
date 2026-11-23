
import type { User, Bot, BotSettings, ProTalkFunction, KnowledgeBase, Trigger } from '../types';
import { payloadLogger } from './payloadLoggerService';

// New constants as requested for direct API calls
const API_CONFIG = {
  functions_base_id: "appkq3HrzrxYxoAV8",
  api_url: "https://ru1.api.pro-talk.ru/api/v1.0"
};

const ACCOUNT_BASE_URL = "https://ru1.account.dialog.ai.atiks.org";

// --- New code for debug mode toggle ---
let isDebugModeEnabled = false;

// Function to show a temporary toast message for feedback
const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#1a202c'; // bg-gray-900
    toast.style.color = '#a0aec0'; // text-gray-400
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    toast.style.border = '1px solid #4a5568'; // border-gray-700
    toast.style.fontSize = '14px';
    toast.style.fontFamily = 'sans-serif';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease-out';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 500);
    }, 2500);
};

// Global event listener to toggle debug mode with CTRL + \
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === '\\') {
    event.preventDefault();
    isDebugModeEnabled = !isDebugModeEnabled;
    showToast(`API Debug Mode is now ${isDebugModeEnabled ? 'ON' : 'OFF'}`);
  }
});
// --- End of new code ---


// Helper function to show a debug modal with API request and response info
const showDebugModal = (endpoint: string, requestBody: object, responseBody?: object | string) => {
  // Only show the modal if debug mode is enabled
  if (!isDebugModeEnabled) {
    return;
  }
  
  let contentText = `Endpoint: ${endpoint}\n\nRequest Body:\n${JSON.stringify(requestBody, null, 2)}`;
  
  if (responseBody !== undefined) {
    const responseString = typeof responseBody === 'string' 
      ? responseBody 
      : JSON.stringify(responseBody, null, 2);
    contentText += `\n\n----\n\nResponse Body:\n${responseString}`;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('role', 'dialog');

  // Create modal
  const modal = document.createElement('div');
  modal.style.backgroundColor = '#2d3748'; // bg-gray-800
  modal.style.color = '#e2e8f0'; // text-gray-200
  modal.style.padding = '24px';
  modal.style.borderRadius = '16px';
  modal.style.border = '1px solid #4a5568'; // border-gray-700
  modal.style.width = '90%';
  modal.style.maxWidth = '600px';
  modal.style.fontFamily = 'monospace';
  modal.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

  // Title
  const title = document.createElement('h3');
  title.textContent = 'API Request/Response (Debug Mode)';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  modal.appendChild(title);

  // Content
  const content = document.createElement('pre');
  content.textContent = contentText;
  content.style.whiteSpace = 'pre-wrap';
  content.style.wordBreak = 'break-all';
  content.style.backgroundColor = '#1a202c'; // bg-gray-900
  content.style.padding = '12px';
  content.style.borderRadius = '8px';
  content.style.maxHeight = '50vh';
  content.style.overflowY = 'auto';
  modal.appendChild(content);

  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '24px';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '12px';

  // Copy button
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.style.padding = '8px 16px';
  copyButton.style.backgroundColor = '#2b6cb0'; // bg-blue-600
  copyButton.style.color = 'white';
  copyButton.style.border = 'none';
  copyButton.style.borderRadius = '8px';
  copyButton.style.cursor = 'pointer';
  copyButton.onclick = () => {
    navigator.clipboard.writeText(contentText).then(() => {
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    });
  };
  buttonContainer.appendChild(copyButton);

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.padding = '8px 16px';
  closeButton.style.backgroundColor = '#4a5568'; // bg-gray-700
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '8px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };
  buttonContainer.appendChild(closeButton);

  modal.appendChild(buttonContainer);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

// --- HELPER FUNCTIONS FOR RETRY AND LOGGING ---
// FIX: Export the ProTalkApiError class to make it available for import in other modules.
export class ProTalkApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProTalkApiError';
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
    const startTime = Date.now();
    let parsedBody: any = null;
    if (options.body) {
        try {
            parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        } catch {
            parsedBody = options.body;
        }
    }

    const cleanEndpointName = url
        .replace('https://ru1.api.pro-talk.ru', '')
        .replace('https://api.pro-talk.ru', '')
        .replace('https://ru1.account.dialog.ai.atiks.org', '')
        .replace('https://account.pro-talk.ru', '')
        .split('?')[0] || url;

    const logId = payloadLogger.logRequest({
        endpoint: url,
        label: `ProTalk: ${cleanEndpointName}`,
        method: options.method || 'GET',
        payload: parsedBody,
    });

    const logGroupLabel = `[API Request] ${options.method || 'GET'} ${url}`;
    console.groupCollapsed(logGroupLabel);
    console.log('Payload:', parsedBody || 'No body');

    try {
        const response = await fetch(url, options);
        
        // Log the raw response for debugging
        const clone = response.clone();
        let responseData: any = null;
        try {
            responseData = await clone.json();
            console.log('Response (JSON):', responseData);
        } catch (e) {
            responseData = await clone.text().catch(() => null);
            console.log('Response (Text):', responseData);
        }

        payloadLogger.updateLog(logId, {
            status: response.ok ? 'success' : 'error',
            statusCode: response.status,
            response: responseData,
            errorMessage: !response.ok ? `HTTP ${response.status} ${response.statusText}` : undefined,
            durationMs: Date.now() - startTime
        });

        // Retry on Server Errors (5xx)
        if (!response.ok && response.status >= 500) {
            if (retries > 0) {
                console.warn(`Server error ${response.status}. Retrying in ${delay}ms... (${retries} attempts left)`);
                console.groupEnd();
                await wait(delay);
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            } else {
                // After all retries, throw a specific error to be caught by the UI
                throw new ProTalkApiError(`Server error ${response.status} after multiple retries.`);
            }
        }

        console.groupEnd();
        return response;
    } catch (error: any) {
        payloadLogger.updateLog(logId, {
            status: 'error',
            errorMessage: error?.message || 'Network request failed',
            durationMs: Date.now() - startTime
        });

        // If it's already our custom error, re-throw it
        if (error instanceof ProTalkApiError) {
            console.groupEnd();
            throw error;
        }
        
        console.error('Network or Execution Error:', error);
        
        if (retries > 0) {
            console.warn(`Network error. Retrying in ${delay}ms... (${retries} attempts left)`);
            console.groupEnd();
            await wait(delay);
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        
        console.groupEnd();
        // After all retries for network errors, wrap it in our custom error
        throw new ProTalkApiError(error instanceof Error ? error.message : 'Network request failed after multiple retries.');
    }
}


// API function to send verification email for registration
export const apiSendMail = async (email: string, code: string): Promise<void> => {
  const url = `https://account.pro-talk.ru/protalkt_send_mail?to=${encodeURIComponent(email)}&subject=${encodeURIComponent('ProTalk Ai Bot Creator — код подтверждения')}&body=${encodeURIComponent(`Ваш код подтверждения: ${code}`)}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Не удалось отправить письмо');
  }
};

// API function for account registration
export const apiRegister = async (email: string, referralCode: string = ''): Promise<{
  deploy_token: string;
  ruid: string;
  bot_id?: number | string;
  bot_token?: string;
}> => {
  const endpoint = 'https://account.pro-talk.ru/create_user_bot';
  const body = {
    platform_ruid: 'recPj84tK8zN4E0dx',
    user_email: email,
    bot_settings: {
      bot_name: 'Новый бот',
      bot_position: 'ИИ помощник',
      role: 'Ты - ИИ ассистент',
      ai_model: 'chatGPT 4 omni mini',
    },
    referal_code: referralCode || '',
  };

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const resData = await response.json();
  showDebugModal(endpoint, body, resData);

  const data = resData.data || resData;

  if (!response.ok || !data || !data.deploy_token) {
    throw new Error('Сервер не вернул deploy_token');
  }

  return {
    deploy_token: data.deploy_token,
    ruid: data.ruid,
    bot_id: data.bot_id || data.user_bot_id,
    bot_token: data.bot_token || data.user_bot_token,
  };
};

// API function to fetch user bots list during registration fallback
export const getUserBots = async (ruid: string): Promise<any[]> => {
  const endpoint = 'https://account.pro-talk.ru/get_user_bots';
  const body = { ruid };

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  showDebugModal(endpoint, body, data);

  if (!response.ok) {
    throw new Error('Не удалось получить список ботов.');
  }

  return Array.isArray(data) ? data : (data.bots || []);
};

// API function to validate user by bot token
export const validateUserByToken = async (bot_id: number, bot_token: string): Promise<{ user_email: string; user_password: string }> => {
  const endpoint = `${ACCOUNT_BASE_URL}/validate_user`;
  const body = { bot_id, bot_token, show_creds: true };

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  showDebugModal(endpoint, body, data);

  if (!response.ok || data.result !== 'success') {
    throw new Error(data.message || data.error || 'Не удалось валидировать пользователя по токену.');
  }

  return { user_email: data.user_email, user_password: data.user_password };
};

// API function to handle user login
export const login = async (email: string, password: string): Promise<User> => {
  const endpoint = `${ACCOUNT_BASE_URL}/get_user_ruid`;
  const body = { email, password };
  
  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  showDebugModal(endpoint, body, data);
  
  if (!response.ok || !data.ruid) {
    throw new Error(data.message || data.error || 'Неверный email или пароль.');
  }
  
  return { ruid: data.ruid, email };
};

// API function to fetch user balance
export const getUserBalance = async (email: string): Promise<number> => {
  const endpoint = `${ACCOUNT_BASE_URL}/get_user_balance`;
  const body = { email };

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  showDebugModal(endpoint, body, data);

  if (!response.ok) {
    const errorMessage = (data && (data.message || data.error)) || 'Не удалось загрузить баланс пользователя.';
    throw new Error(errorMessage);
  }

  // Case 1: The response is the number itself.
  if (typeof data === 'number') {
    return data;
  }
  
  // Case 2: The response is a string that can be parsed to a number.
  if (typeof data === 'string') {
    const balance = parseFloat(data);
    if (!isNaN(balance)) {
      return balance;
    }
  }

  // Case 3: The response is an object with a 'balance' key.
  if (data && typeof data.balance !== 'undefined' && data.balance !== null) {
    const balance = parseFloat(data.balance);
    if (!isNaN(balance)) {
      return balance;
    }
  }
  
  // Case 4: The response is an object with some other key that holds the balance.
  // This is speculative. From python snippet `reply`, maybe the key is `reply`.
  if (data && typeof data.reply !== 'undefined' && data.reply !== null) {
      const balance = parseFloat(data.reply);
      if (!isNaN(balance)) {
          return balance;
      }
  }
  
  // Case 5: The response is an object with a 'result' key, as provided in the error report.
  if (data && typeof data.result !== 'undefined' && data.result !== null) {
    const balance = parseFloat(data.result);
    if (!isNaN(balance)) {
      return balance;
    }
  }

  throw new Error('Не удалось определить баланс из ответа API.');
};

// API function to fetch user variables
export const getUserVariables = async (ruid: string): Promise<Record<string, any>> => {
    const endpoint = `${ACCOUNT_BASE_URL}/get_user_variables`;
    const body = { ruid };

    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    showDebugModal(endpoint, body, data);

    if (!response.ok) {
        console.warn('Failed to fetch user variables:', data);
        return {};
    }

    return data;
};

// API function to fetch user bots
export const getBots = async (ruid: string): Promise<Bot[]> => {
    const endpoint = `${ACCOUNT_BASE_URL}/get_user_bots`;
    const body = { ruid };

    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    
    const data = await response.json();
    showDebugModal(endpoint, body, data);

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Не удалось загрузить список ботов.');
    }
    
    return Array.isArray(data) ? data : [];
};

// API function to fetch detailed bot settings
export const getBotDetails = async (bot_id: number, bot_token: string): Promise<any> => {
    const endpoint = `${ACCOUNT_BASE_URL}/read_bot_settings`;
    const body = { bot_id, bot_token };
    
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    showDebugModal(endpoint, body, data);

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Не удалось загрузить детали бота.');
    }
    
    return data;
};

// Helper function to find a bot object in a nested API response
const findBotObjectInResponse = (obj: any): object | null => {
    if (!obj || typeof obj !== 'object') {
        return null;
    }
    // A valid bot object must have bot_record_id. bot_id is optional at this stage.
    if (obj.bot_record_id && typeof obj.bot_record_id === 'string') {
        return obj;
    }
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const found = findBotObjectInResponse(item);
            if (found) return found;
        }
    } else {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const found = findBotObjectInResponse(obj[key]);
                if (found) return found;
            }
        }
    }
    return null;
};


// API function to create a user and a bot (used by Gemini)
export const createUserAndBotAPI = async (email: string, bot_settings: BotSettings): Promise<{ success: boolean; data: any }> => {
  const endpoint = `${ACCOUNT_BASE_URL}/create_user_bot`;
  const body = { user_email: email, bot_settings };
  
  try {
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const responseData = await response.json();
    showDebugModal(endpoint, body, responseData);

    if (!response.ok) {
        const errorDetails = responseData.message || responseData.error || 'API call failed';
        throw new Error(typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : String(errorDetails));
    }
    
    const botObject = findBotObjectInResponse(responseData);
    
    if (botObject) {
        return { success: true, data: botObject };
    }
    
    // NEW: Lenient check for async creation. If the API returns a generic success message,
    // we trust it and pass the response through, assuming the bot will be available shortly.
    if (responseData && (responseData.result === 'Success' || responseData.success === true)) {
        console.warn('API returned success but no bot object. Assuming async creation.');
        return { success: true, data: responseData };
    }
    
    // If no valid bot object and not a generic success, the operation is a failure.
    const errorMessage = responseData.message || responseData.error || 'API не вернул данные созданного бота.';
    console.warn('API did not return valid bot data.', { response: responseData });
    return { success: false, data: errorMessage };

  } catch (error: any) {
    if (error instanceof ProTalkApiError) {
        throw error;
    }
    console.error("API Error in createUserAndBotAPI:", error);
    return { success: false, data: error.message };
  }
};

// API function to create a default bot (used by "New bot" button)
export const createDefaultBot = async (userEmail: string): Promise<{ success: boolean; data: any }> => {
  const endpoint = `${ACCOUNT_BASE_URL}/create_user_bot`;
  const body = {
    'user_email': userEmail,
    'bot_settings': {
        'bot_name': 'Новый',
        'bot_position': 'бот',
        'role' : 'Ты - ИИ ассистент',
        'purpose': '',
        'behavior': '',
        'ai_model': 'chatGPT 5.6 Luna',
        'bot_gender': 'Мужчина',
        'ai_modal_image': true,
        'ai_modal_doc': true
    }
  };

  try {
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const responseData = await response.json();
    showDebugModal(endpoint, body, responseData);

    const botObject = findBotObjectInResponse(responseData);
    
    if (botObject) {
        return { success: true, data: botObject };
    }
    
    // NEW: Lenient check for async creation.
    if (responseData && (responseData.result === 'Success' || responseData.success === true)) {
        console.warn('API returned success but no bot object. Assuming async creation.');
        return { success: true, data: responseData };
    }
    
    // If no valid bot object, the operation is a failure.
    const errorMessage = responseData.message || responseData.error || 'API не вернул данные созданного бота.';
    console.warn('API did not return valid bot data.', { response: responseData });
    return { success: false, data: errorMessage };

  } catch (error: any) {
    if (error instanceof ProTalkApiError) {
        throw error;
    }
    console.error("API Error in createDefaultBot:", error);
    return { success: false, data: error.message };
  }
};


// API function to edit a bot
export const editBotAPI = async (bot_id: number, bot_token: string, bot_settings: BotSettings): Promise<{ success: boolean; data: any }> => {
  const endpoint = `${ACCOUNT_BASE_URL}/update_user_bot`;
  const body = { bot_id, bot_token, bot_settings };

  try {
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    showDebugModal(endpoint, body, data);
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Ошибка при редактировании бота.');
    }
    return { success: true, data };
  } catch (error: any) {
    if (error instanceof ProTalkApiError) {
        throw error;
    }
    console.error("API Error in editBotAPI:", error);
    return { success: false, data: error.message };
  }
};

// Функция быстрого самоконтроля после внесения изменений в настройки бота
export const verifyBotSettings = async (
  bot_id: number,
  bot_token: string,
  expectedSettings: BotSettings
): Promise<{ verified: boolean; discrepancies: Record<string, { expected: any; actual: any }>; actual?: any; retried?: boolean }> => {
  const checkFields = (expected: BotSettings, actual: any) => {
    const discrepancies: Record<string, { expected: any; actual: any }> = {};
    for (const key of Object.keys(expected) as (keyof BotSettings)[]) {
      const expVal = expected[key];
      if (expVal === undefined || expVal === null) continue;
      const actVal = actual?.[key];

      if (Array.isArray(expVal)) {
        const actArr = Array.isArray(actVal) ? actVal : (actVal ? [actVal] : []);
        const expSorted = [...expVal].map(String).sort();
        const actSorted = [...actArr].map(String).sort();
        const isArrEqual = expSorted.length === actSorted.length && expSorted.every((v, i) => v === actSorted[i]);
        if (!isArrEqual) {
          discrepancies[key] = { expected: expVal, actual: actVal };
        }
      } else if (typeof expVal === 'number') {
        if (Number(actVal) !== Number(expVal)) {
          discrepancies[key] = { expected: expVal, actual: actVal };
        }
      } else if (typeof expVal === 'string') {
        const expStr = expVal.trim();
        const actStr = String(actVal ?? '').trim();
        if (expStr !== actStr) {
          discrepancies[key] = { expected: expVal, actual: actVal };
        }
      } else if (typeof expVal === 'boolean') {
        if (Boolean(actVal) !== Boolean(expVal)) {
          discrepancies[key] = { expected: expVal, actual: actVal };
        }
      }
    }
    return discrepancies;
  };

  try {
    // 1-я проверка с небольшой паузой для серверной синхронизации
    await new Promise(res => setTimeout(res, 350));
    let actualDetails = await getBotDetails(bot_id, bot_token);
    let discrepancies = checkFields(expectedSettings, actualDetails);

    if (Object.keys(discrepancies).length === 0) {
      return { verified: true, discrepancies: {}, actual: actualDetails };
    }

    // Если есть несовпадение, даем серверу еще 600мс (возможная задержка репликации) и перечитываем
    await new Promise(res => setTimeout(res, 600));
    actualDetails = await getBotDetails(bot_id, bot_token);
    discrepancies = checkFields(expectedSettings, actualDetails);

    if (Object.keys(discrepancies).length === 0) {
      return { verified: true, discrepancies: {}, actual: actualDetails };
    }

    // Если всё ещё не совпадает, производим 1 автоматический повтор сохранения
    console.warn("Самоконтроль выявил несовпадение настроек, выполняю авто-повтор editBotAPI...", discrepancies);
    await editBotAPI(bot_id, bot_token, expectedSettings);
    await new Promise(res => setTimeout(res, 600));
    actualDetails = await getBotDetails(bot_id, bot_token);
    discrepancies = checkFields(expectedSettings, actualDetails);

    const verified = Object.keys(discrepancies).length === 0;
    return { verified, discrepancies, actual: actualDetails, retried: true };
  } catch (err: any) {
    console.error("Ошибка при выполнении самоконтроля настроек бота:", err);
    return {
      verified: false,
      discrepancies: { error: { expected: "Успешная верификация", actual: err.message || String(err) } }
    };
  }
};

// API function to fetch detailed info about a single ProTalk function
export const getFunctionInfo = async (functionId: number): Promise<any> => {
  const endpoint = `${ACCOUNT_BASE_URL}/get_function_info`;
  const params = new URLSearchParams({
    functions_base_id: 'appkq3HrzrxYxoAV8',
    functions_id: functionId.toString(),
  });
  const fullEndpoint = `${endpoint}?${params.toString()}`;
  const requestBody = { functions_base_id: 'appkq3HrzrxYxoAV8', functions_id: functionId };

  const response = await fetchWithRetry(fullEndpoint, { method: 'GET' });
  const data = await response.json();
  showDebugModal(fullEndpoint, requestBody, data);
  
  if (!response.ok) {
    throw new Error(data.message || data.error || `Не удалось загрузить информацию для функции ${functionId}.`);
  }
  
  return data;
};

// API function to fetch the catalog of all available ProTalk functions
export const getProTalkFunctions = async (): Promise<ProTalkFunction[]> => {
  console.log('Fetching ProTalk functions catalog');
  const endpoint = 'https://account.pro-talk.ru/protalk_functions';
  
  // We use standard fetch here as it's a static catalog, high availability, usually safe.
  const response = await fetch(endpoint);
  
  const data = await response.json();
  // No body, so we don't call showDebugModal
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Не удалось загрузить каталог функций.');
  }
  
  // Filter out any records that are missing essential fields
  const validFunctions = (data.records || []).filter((rec: any) => 
    rec.fields && typeof rec.fields.ID === 'number' && rec.fields.Название
  );
  
  return validFunctions;
};

// API function to fetch the catalog of all available user knowledge bases
export const getKnowledgeBases = async (email: string): Promise<KnowledgeBase[]> => {
  const endpoint = `${ACCOUNT_BASE_URL}/get_user_knowledges`;
  const body = {
    functions_base_id: 'appkq3HrzrxYxoAV8',
    email,
  };
  
  const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
  });
  
  const data = await response.json();
  showDebugModal(endpoint, body, data);
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Не удалось загрузить базы знаний.');
  }
  
  return Array.isArray(data) ? data : [];
};

// API function to fetch all of a user's triggers
export const getUserTriggers = async (ruid: string): Promise<Trigger[]> => {
  const endpoint = `${ACCOUNT_BASE_URL}/get_user_triggers`;
  const body = { ruid };
  
  const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
  });
  
  const data = await response.json();
  showDebugModal(endpoint, body, data);
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Не удалось загрузить триггеры.');
  }
  
  return Array.isArray(data) ? data : [];
};

// API function to create a new trigger
export const createTrigger = async (record: any): Promise<void> => {
  const endpoint = `${ACCOUNT_BASE_URL}/protalk_fillout_create_trigger`;
  const body = { record };

  showDebugModal(endpoint, body); // Show fire-and-forget calls too

  // Fire-and-forget
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).catch(error => {
    console.error("Error in createTrigger (fire-and-forget):", error);
  });
};

// API function to delete a trigger
export const deleteTrigger = async (triggerId: string): Promise<void> => {
  const endpoint = `${ACCOUNT_BASE_URL}/delete_user_trigger`;
  const body = {
    employee_base_id: 'appkq3HrzrxYxoAV8',
    id: triggerId
  };

  showDebugModal(endpoint, body); // Show fire-and-forget calls too
  
  // Fire-and-forget
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).catch(error => {
    console.error("Error in deleteTrigger (fire-and-forget):", error);
  });
};


// --- New Direct API Call Implementation ---

// 1. Run the function and get a task ID or a direct result
const runProTalkFunction = async (bot: Bot, functionId: number, args: object): Promise<any> => {
    const endpoint = `${API_CONFIG.api_url}/run_function`;
    const body = {
        function_id: functionId,
        functions_base_id: API_CONFIG.functions_base_id,
        bot_id: bot.bot_id,
        bot_token: bot.bot_token,
        arguments: args
    };

    // Use retry here as well for stability
    const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        data = responseText; // if not json, treat as text
    }

    showDebugModal(endpoint, body, data);

    if (!response.ok) {
        const errorDetails = (typeof data === 'object' && data !== null)
            ? (data.error || data.message || JSON.stringify(data))
            : data;
        throw new Error(`API call failed with status ${response.status}: ${errorDetails}`);
    }

    return data; // Return the full response object
};


// 2. Poll for the result using the task ID
const getProTalkFunctionResult = async (bot: Bot, taskId: string): Promise<any> => {
    const endpoint = `${API_CONFIG.api_url}/get_function_result`;
    const body = {
        task_id: taskId,
        bot_id: bot.bot_id,
        bot_token: bot.bot_token,
        dialogs_api_host: API_CONFIG.api_url.replace('/api/v1.0', '')
    };

    // Polling usually shouldn't retry heavily on 500s to avoid hammering, 
    // but a light retry (1) is okay.
    const response = await fetchWithRetry(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }, 1, 1000);

    const data = await response.json();
    // Do not call showDebugModal here to avoid flooding during polling

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Ошибка при проверке результата функции.');
    }
    
    return data;
};

// Helper to normalize URLs and prepend https: if needed
export const normalizeImageUrl = (raw: string): string => {
  if (!raw || typeof raw !== 'string') return '';
  let url = raw.trim();
  url = url.replace(/^["'(\[<]+|["')\]>]+$/g, '');
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (/^([a-zA-Z0-9-]+\.)*(?:talk\.ru|pro-talk\.ru|atiks\.org)\//i.test(url)) {
    return `https://${url}`;
  }
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/.*\.(?:png|jpg|jpeg|webp|gif)/i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

// Universal helper to extract image URL from diverse function response formats
export const extractImageUrl = (result: any): string => {
  if (!result) return '';
  
  if (typeof result === 'string') {
    const trimmed = result.trim();
    const mdMatch = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s)]+|\/\/[^\s)]+|[a-zA-Z0-9.-]*talk\.ru\/[^\s)]+)\)/i);
    if (mdMatch && mdMatch[1]) return normalizeImageUrl(mdMatch[1]);
    
    const prefixMatch = trimmed.match(/URL:\s*([^\s"'<>\\]+)/i);
    if (prefixMatch && prefixMatch[1]) return normalizeImageUrl(prefixMatch[1]);
    
    const domainMatch = trimmed.match(/((?:https?:\/\/|\/\/)?(?:[a-zA-Z0-9-]+\.)*(?:talk\.ru|pro-talk\.ru)\/[^\s"'<>\\]+)/i);
    if (domainMatch && domainMatch[1]) return normalizeImageUrl(domainMatch[1]);

    const httpMatch = trimmed.match(/(https?:\/\/[^\s"'<>\\]+)/i);
    if (httpMatch && httpMatch[1]) return normalizeImageUrl(httpMatch[1]);

    try {
      const parsed = JSON.parse(trimmed);
      const urlFromParsed = extractImageUrl(parsed);
      if (urlFromParsed) return urlFromParsed;
    } catch {
      // not json
    }
    return '';
  }

  if (typeof result === 'object') {
    if (typeof result.image_url === 'string' && result.image_url.trim()) return normalizeImageUrl(result.image_url);
    if (typeof result.imageUrl === 'string' && result.imageUrl.trim()) return normalizeImageUrl(result.imageUrl);
    if (typeof result.photo_url === 'string' && result.photo_url.trim()) return normalizeImageUrl(result.photo_url);
    if (typeof result.url === 'string' && result.url.trim()) return normalizeImageUrl(result.url);
    if (typeof result.image === 'string' && result.image.trim()) return normalizeImageUrl(result.image);

    if (Array.isArray(result.data) && result.data.length > 0) {
      const first = result.data[0];
      const fromFirst = extractImageUrl(first);
      if (fromFirst) return fromFirst;
    }
    if (Array.isArray(result.images) && result.images.length > 0) {
      const first = result.images[0];
      const fromFirst = extractImageUrl(first);
      if (fromFirst) return fromFirst;
    }
    if (Array.isArray(result.choices) && result.choices.length > 0) {
      const first = result.choices[0];
      const fromFirst = extractImageUrl(first?.message?.content || first?.text || first);
      if (fromFirst) return fromFirst;
    }

    if (result.output) {
      const fromOutput = extractImageUrl(result.output);
      if (fromOutput) return fromOutput;
    }
    if (result.result) {
      const fromResult = extractImageUrl(result.result);
      if (fromResult) return fromResult;
    }
    if (result.response) {
      const fromResponse = extractImageUrl(result.response);
      if (fromResponse) return fromResponse;
    }

    for (const key of Object.keys(result)) {
      const val = result[key];
      if (typeof val === 'string') {
        const found = extractImageUrl(val);
        if (found) return found;
      }
    }

    try {
      const str = JSON.stringify(result);
      const domainMatch = str.match(/((?:https?:\/\/|\/\/)?(?:[a-zA-Z0-9-]+\.)*(?:talk\.ru|pro-talk\.ru)\/[^"'\s\\<>]+)/i);
      if (domainMatch && domainMatch[1]) return normalizeImageUrl(domainMatch[1]);

      const httpImgMatch = str.match(/(https?:\/\/[^"'\s\\<>]+\.(?:png|jpg|jpeg|webp|gif))/i);
      if (httpImgMatch && httpImgMatch[1]) return normalizeImageUrl(httpImgMatch[1]);

      const anyHttp = str.match(/(https?:\/\/[^"'\s\\<>]+)/i);
      if (anyHttp && anyHttp[1]) return normalizeImageUrl(anyHttp[1]);
    } catch {
      // ignore
    }
  }

  return '';
};

// 3. Main execution function that orchestrates the run and poll process
export const executeProTalkFunction = async (
    bot: Bot, 
    functionId: number, 
    args: object,
    onPoll?: (status: string, attempt: number) => void
): Promise<any> => {
    // Step 1: Run the function
    const initialResponse = await runProTalkFunction(bot, functionId, args);

    // Some endpoints might return 'id' instead of 'task_id', handle both.
    // FIX: Added check for 'taskId' (camelCase) which is returned by some functions like image generation.
    const taskId = initialResponse?.task_id || initialResponse?.id || initialResponse?.taskId || initialResponse?.task;

    // Case A: Asynchronous task started, poll for result.
    if (taskId) {
        const maxAttempts = 80; // ~4 minutes timeout, increased for long-running tasks like image/video generation
        const intervalMs = 3000; // 3 seconds

        for (let i = 1; i <= maxAttempts; i++) {
            onPoll?.('polling', i);
            const result = await getProTalkFunctionResult(bot, taskId);
            
            const isDone = result.status === 'done' || result.status === 'success' || result.status === 'completed';
            const hasData = result.output !== undefined || result.result !== undefined || result.data !== undefined;
            const extractedUrl = extractImageUrl(result);

            if (isDone || hasData || extractedUrl) {
                onPoll?.('done', i);
                showDebugModal(`${API_CONFIG.api_url}/get_function_result (Final)`, { taskId }, result);
                const finalResult = result.output ?? result.result ?? result.data ?? result;

                let parsedResult;
                try {
                    parsedResult = typeof finalResult === 'string' ? JSON.parse(finalResult) : finalResult;
                } catch (e) {
                    parsedResult = finalResult;
                }

                const finalUrl = extractedUrl || extractImageUrl(parsedResult);
                if (finalUrl) {
                    return { 
                        image_url: finalUrl, 
                        ...((typeof parsedResult === 'object' && parsedResult) ? parsedResult : {}) 
                    };
                }
                
                return parsedResult;
            }
          
            if (result.status === 'error' || result.status === 'failed') {
                onPoll?.('error', i);
                showDebugModal(`${API_CONFIG.api_url}/get_function_result (Error)`, { taskId }, result);
                throw new Error(result.error || result.message || 'Выполнение функции завершилось с ошибкой.');
            }

            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        
        throw new Error(`Тайм-аут: функция не завершила выполнение за ${Math.round(maxAttempts * intervalMs / 60000)} минуты.`);
    }

    // Step 2: Check for immediate image URL in synchronous response (handles Function 787 directly!)
    const directImageUrl = extractImageUrl(initialResponse);
    if (directImageUrl) {
        onPoll?.('done', 1);
        const resultObj = (typeof initialResponse === 'object' && initialResponse !== null)
            ? { ...initialResponse, image_url: directImageUrl }
            : { image_url: directImageUrl, raw: initialResponse };
        showDebugModal(`run_function (Direct Image Result)`, { functionId, args }, resultObj);
        return resultObj;
    }

    // Case B: Synchronous result received directly with success status or outputs
    if (
        initialResponse?.status === 'done' || 
        initialResponse?.status === 'success' || 
        initialResponse?.status === 'completed' ||
        initialResponse?.output !== undefined || 
        initialResponse?.result !== undefined ||
        initialResponse?.data !== undefined ||
        initialResponse?.usage?.delivered_images > 0
    ) {
        onPoll?.('done', 1);
        const finalResult = initialResponse.output ?? initialResponse.result ?? initialResponse.data ?? initialResponse;
        try {
            return typeof finalResult === 'string' ? JSON.parse(finalResult) : finalResult;
        } catch (e) {
            return finalResult;
        }
    }
    // Case C: The response is a direct array (e.g., from Google Sheets function #201).
    else if (Array.isArray(initialResponse)) {
        onPoll?.('done', 1);
        return initialResponse;
    }
    // Case D: The response is a string
    else if (typeof initialResponse === 'string') {
        const url = extractImageUrl(initialResponse);
        if (url) {
            onPoll?.('done', 1);
            const result = { image_url: url };
            showDebugModal(`run_function (Parsed String Result)`, { functionId, args }, result);
            return result;
        }
        if (initialResponse === 'Success' || initialResponse.includes('"status":"success"') || initialResponse.includes('success')) {
            onPoll?.('done', 1);
            return { success: true, message: initialResponse };
        }
        return initialResponse;
    }
    // Case E: Simple success object
    else if (initialResponse === 'Success' || (initialResponse && (initialResponse.result === 'Success' || initialResponse.message === 'Success' || initialResponse.success === true))) {
        onPoll?.('done', 1);
        const result = { success: true, message: 'Operation completed successfully.' };
        showDebugModal(`run_function (Parsed simple success result)`, { functionId, args }, result);
        return result;
    }
    // Case F: Error or unexpected format from the initial call.
    else {
         console.warn('ProTalk function returned unexpected format:', initialResponse);
         const errorDetails = (initialResponse?.error || initialResponse?.message) ?? (typeof initialResponse === 'object' ? JSON.stringify(initialResponse) : initialResponse);
         throw new Error(`API did not return a task_id: ${errorDetails}`);
    }
};

// 4. New method for avatar generation using proxy tasks
export const generateAvatarViaProxy = async (
    bot: Bot, 
    prompt: string, 
    onPoll?: (status: string, attempt: number) => void
): Promise<any> => {
    const endpoint = `${ACCOUNT_BASE_URL}/proxy/tasks`;
    const pollingTaskId = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const payload = {
        action: "run_function",
        function_id: 604,
        arguments: {
            prompt: prompt,
            image_size: "1:1",
            output_format: "png",
            taskId_only: false
        },
        polling_task_id: pollingTaskId,
        cost: 12,
        instrument_name: "Генерация изображений",
        bot_id: bot.bot_id,
        bot_token: bot.bot_token,
        is_static: true
    };

    const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    showDebugModal(endpoint, payload, data);

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to start avatar generation task.');
    }

    // Now poll for the result
    const maxAttempts = 80;
    const intervalMs = 3000;

    for (let i = 1; i <= maxAttempts; i++) {
        onPoll?.('polling', i);
        const result = await getProTalkFunctionResult(bot, pollingTaskId);
        
        if (result.status === 'done') {
            onPoll?.('done', i);
            showDebugModal(`${API_CONFIG.api_url}/get_function_result (Final)`, { taskId: pollingTaskId }, result);
            const finalResult = result.output ?? result.result;

            let parsedResult;
            try {
                parsedResult = JSON.parse(finalResult);
            } catch (e) {
                parsedResult = finalResult;
            }

            if (typeof parsedResult === 'string' && parsedResult.includes('URL:')) {
                const urlMatch = parsedResult.match(/URL:\s*(https?:\/\/[^\s]+)/);
                if (urlMatch && urlMatch[1]) {
                    return { image_url: urlMatch[1] };
                }
            }
            
            return parsedResult;
        }
        
        if (result.status === 'error') {
            onPoll?.('error', i);
            showDebugModal(`${API_CONFIG.api_url}/get_function_result (Error)`, { taskId: pollingTaskId }, result);
            throw new Error(result.error || 'Выполнение функции завершилось с ошибкой.');
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error(`Тайм-аут: функция не завершила выполнение за ${Math.round(maxAttempts * intervalMs / 60000)} минуты.`);
};

/**
 * Загружает аудио-блоб на файловый шлюз ProTalk и отправляет ссылку в сервис STT для расшифровки.
 * @param audioBlob Склеенный аудио-блоб в формате audio/webm
 * @returns Распознанный текст
 */
export const transcribeVoiceMessage = async (audioBlob: Blob): Promise<string> => {
    const startTimeUpload = Date.now();
    const uploadLogId = payloadLogger.logRequest({
        endpoint: 'https://file.pro-talk.ru/upload_tmp',
        label: 'ProTalk: /upload_tmp (Voice WebM)',
        method: 'POST',
        payload: { file: 'voice_message.webm', sizeBytes: audioBlob.size, type: audioBlob.type || 'audio/webm' },
    });

    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_message.webm');

    let uploadResult: any = null;
    let audioUrl: string | null = null;
    try {
        const uploadResponse = await fetch('https://file.pro-talk.ru/upload_tmp', {
            method: 'POST',
            body: formData,
        });

        uploadResult = await uploadResponse.json().catch(() => null);

        if (!uploadResponse.ok) {
            payloadLogger.updateLog(uploadLogId, {
                status: 'error',
                statusCode: uploadResponse.status,
                response: uploadResult,
                errorMessage: `Ошибка загрузки аудио: ${uploadResponse.status} ${uploadResponse.statusText}`,
                durationMs: Date.now() - startTimeUpload,
            });
            throw new Error(`Ошибка загрузки аудиозаписи: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        audioUrl = uploadResult?.data?.url || uploadResult?.url;
        payloadLogger.updateLog(uploadLogId, {
            status: 'success',
            statusCode: uploadResponse.status,
            response: uploadResult,
            durationMs: Date.now() - startTimeUpload,
        });
    } catch (err: any) {
        payloadLogger.updateLog(uploadLogId, {
            status: 'error',
            errorMessage: err.message,
            durationMs: Date.now() - startTimeUpload,
        });
        throw err;
    }

    if (!audioUrl) {
        throw new Error('Файловый шлюз не вернул ссылку на сохраненную аудиозапись.');
    }

    const startTimeStt = Date.now();
    const sttUrl = `https://api.pro-talk.ru/api/v1.0/stt_from_widget?url=${encodeURIComponent(audioUrl)}`;
    const sttLogId = payloadLogger.logRequest({
        endpoint: sttUrl,
        label: 'ProTalk: /stt_from_widget (Voice STT)',
        method: 'GET',
        payload: { url: audioUrl },
    });

    try {
        const sttResponse = await fetch(sttUrl);
        const sttData = await sttResponse.json().catch(() => null);

        if (!sttResponse.ok) {
            payloadLogger.updateLog(sttLogId, {
                status: 'error',
                statusCode: sttResponse.status,
                response: sttData,
                errorMessage: `Ошибка распознавания речи: ${sttResponse.status} ${sttResponse.statusText}`,
                durationMs: Date.now() - startTimeStt,
            });
            throw new Error(`Ошибка сервиса распознавания речи: ${sttResponse.status} ${sttResponse.statusText}`);
        }

        payloadLogger.updateLog(sttLogId, {
            status: 'success',
            statusCode: sttResponse.status,
            response: sttData,
            durationMs: Date.now() - startTimeStt,
        });

        return (sttData?.text || '').trim();
    } catch (err: any) {
        payloadLogger.updateLog(sttLogId, {
            status: 'error',
            errorMessage: err.message,
            durationMs: Date.now() - startTimeStt,
        });
        throw err;
    }
};
