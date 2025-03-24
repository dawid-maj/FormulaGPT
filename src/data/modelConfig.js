// Model configuration for the application
export const MODEL_CONFIGS = {
  // Free tier models (OpenRouter)
  'google/gemini-2.0-flash-001': {
    name: 'Gemini 2.0 Flash (Free Tier)',
    provider: 'openrouter',
    isFreeTier: true
  },
  'openai/gpt-4o-mini': {
    name: 'GPT-4o Mini (Free Tier)',
    provider: 'openrouter',
    isFreeTier: true
  },
  'meta-llama/llama-3.3-70b-instruct': {
    name: 'Llama 3.3 70B (Free Tier)',
    provider: 'openrouter',
    isFreeTier: true
  },


  // OpenRouter paid models
  'deepseek/deepseek-chat': {
    name: 'DeepSeek V3 (Free Tier)',
    provider: 'openrouter',
  },
  'deepseek/deepseek-r1': {
    name: 'DeepSeek R1',
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
  'openai/gpt-4o-2024-11-20': {
    name: 'GPT-4o 2024',
    provider: 'openrouter'
  },
  'openai/o3-mini': {
    name: 'O3 Mini',
    provider: 'openrouter'
  },

  // OpenAI paid models
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'openai'
  },
  'o3-mini': {
    name: 'O3 Mini',
    provider: 'openai'
  }
};

export const getModelDisplayName = (modelId) => {
  return MODEL_CONFIGS[modelId]?.name || modelId;
};

export const getAvailableModels = (provider, useFreeMode = false) => {
  if (useFreeMode) {
    return Object.entries(MODEL_CONFIGS)
      .filter(([_, config]) => config.isFreeTier)
      .map(([id, config]) => ({
        id,
        name: config.name
      }));
  }

  return Object.entries(MODEL_CONFIGS)
    .filter(([_, config]) => config.provider === provider)
    .map(([id, config]) => ({
      id,
      name: config.name
    }));
};
