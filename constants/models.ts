
export interface ModelOption {
    value: string;
    label: string;
    coef: number;
    isDefault?: boolean;
    isExpressDefault?: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
    { value: 'protalk:free', label: 'ProTalk Free', coef: 0, isDefault: true, isExpressDefault: true },
    { value: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 flash', coef: 1 },
    { value: 'openai/gpt-6-luna', label: 'chatGPT 6 Luna', coef: 1 },
    { value: 'xiaomi/mimo-v2.6-flash', label: 'Xiaomi MiMo 2.6 Flash', coef: 1 },
    { value: 'anymodel/ag/gemini-3.1-flash-lite-preview', label: 'AM Gemini 3.1 Flash Lite preview', coef: 1 },
    { value: 'anymodel/ag/gemini-3.8-flash-low', label: 'AM Gemini 3.8 Flash low', coef: 1 },
    { value: 'anymodel/ag/gemini-3.1-pro-low', label: 'AM Gemini 3.1 Pro low', coef: 1 },
    { value: 'anymodel/ag/gemini-pro-agent', label: 'AM Gemini 3.1 Pro', coef: 1 },
    { value: 'anymodel/cx/gpt-5.6-sol', label: 'AM GPT 5.6 Sol', coef: 1 },
    { value: 'anymodel/cc/claude-opus-5', label: 'AM Claude Opus 5', coef: 1 },
    { value: 'anymodel/gcli/grok-4.6', label: 'AM Grok 4.6', coef: 1 },
    { value: 'openai/gpt-5-mini', label: 'GPT 5 Mini', coef: 2.3 },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', coef: 2.8 },
    { value: 'openai/gpt-4.1-mini', label: 'GPT 4.1 Mini', coef: 3 },
];
 
export const AI_MODELS = [
  'protalk:free',
  'ProTalk Free',
  'ag/gemini-3.1-flash-lite-preview',
  'anymodel/ag/gemini-3.1-flash-lite-preview',
  'AM Gemini 3.1 Flash Lite preview',
  'ag/gemini-3.8-flash-low',
  'anymodel/ag/gemini-3.8-flash-low',
  'AM Gemini 3.8 Flash low',
  'ag/gemini-3.1-pro-low',
  'anymodel/ag/gemini-3.1-pro-low',
  'AM Gemini 3.1 Pro low',
  'anymodel/ag/gemini-pro-agent',
  'anymodel/cx/gpt-5.6-sol',
  'anymodel/cc/claude-opus-5',
  'anymodel/gcli/grok-4.6',
  'chatGPT 3.5 turbo', 'chatGPT 4 omni mini', 'chatGPT 4.1', 'chatGPT 4.1 mini', 'chatGPT 4.1 nano', 'chatGPT 4o',
  'chatGPT 5', 'chatGPT 5 mini', 'chatGPT 5 nano', 'chatGPT 6 Luna', 'chatGPT 6 Sol',
  'Claude Haiku 3.5', 'Claude Haiku 4.5', 'Claude Sonnet 3.7',
  'Claude Sonnet 4', 'Claude Sonnet 4.5', 'DeepSeek chat', 'DeepSeek chat V3-0324 (free)', 'DeepSeek chat v3.1',
  'DeepSeek R1', 'DeepSeek v3.2 exp', 'DeepSeek V3.2 Exp Thinking', 'Gemini 3 Flash Preview', 'Gemini 3 Pro Preview', 'Gemini Flash 2.0', 'Gemini Flash 2.5',
  'Gemini Flash 2.5 Light', 'Gemini Flash 2.5 Pre', 'Gemini Pro 2.5', 'GigaChat', 'GigaChat Pro', 'Grok 3',
  'Grok 3-mini', 'Grok 4', 'Grok 4 fast', 'Grok 4.7', 'Groq (llama3-8b) FREE', 'Llama 4 Maverick', 'Llama 4 Scout',
  'Microsoft Phi-3.5-mini-instruct FREE', 'Moonshotai Kimi K2', 'Moonshotai Kimi K2 fast', 'OpenAI Fine-tune',
  'OpenAI GPTs (Assistant)', 'OpenAI o1', 'OpenAI o1 mini', 'OpenAI o3', 'OpenAI o3 mini', 'OpenAI: OSS 20b',
  'OpenAI: OSS 20b (free)', 'OpenAI: OSS 120b', 'Qwen Plus', 'Qwen3 30b thinking', 'Xiaomi MiMo 2.6 Flash', 'YandexGPT Lite',
  'YandexGPT Pro', 'Z.AI: GLM 4.5', 'Z.AI: GLM 4.5 Air', 'Z.AI: GLM 4.5 Air (free)'
];
