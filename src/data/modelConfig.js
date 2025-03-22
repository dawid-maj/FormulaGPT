// Model configuration for the application
export const MODEL_CONFIGS = {

  'google/gemini-2.0-flash-001': {
    name: 'Gemini 2.0 Flash',
    provider: 'openrouter'
  },
  
  // OpenAI Models 
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'openai'
  },
  'google/gemini-2.0-flash-lite-001': {
    name: 'Gemini 2.0 Flash Lite (Free Tier)',
    provider: 'openrouter'
  },
  'google/gemini-2.0-flash-thinking-exp:free': {
    name: 'Gemini 2.0 Flash Thinking exp',
    provider: 'openrouter'
  },
  'anthropic/claude-3.5-haiku': {
    name: 'Claude 3.5 Haiku',
    provider: 'openrouter'
  },
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter'
  },
  'deepseek/deepseek-chat': {
    name: 'DeepSeek V3',
    provider: 'openrouter'
  },
  'deepseek/deepseek-r1': {
    name: 'DeepSeek R1',
    provider: 'openrouter'
  },
  'deepseek/deepseek-r1-distill-llama-70b': {
    name: 'DeepSeek R1 distill lama 70B',
    provider: 'openrouter'
  },
  'meta-llama/llama-3.3-70b-instruct': {
    name: 'Llama 3.3 70B',
    provider: 'openrouter'
  }
};

export const getModelDisplayName = (modelId) => {
  return MODEL_CONFIGS[modelId]?.name || modelId;
};

export const getAvailableModels = (provider, useFreeMode = false) => {
  if (useFreeMode) {
    return [
      { id: 'google/gemini-2.0-flash-lite-001', name: 'Gemini 2.0 Flash Lite (Free Tier)' }
    ];
  }

  return Object.entries(MODEL_CONFIGS)
    .filter(([_, config]) => config.provider === provider)
    .map(([id, config]) => ({
      id,
      name: config.name
    }));
};
