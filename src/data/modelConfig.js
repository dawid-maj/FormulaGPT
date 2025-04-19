// Model configuration for the application
export const MODEL_CONFIGS = {
  // Free tier models (OpenRouter)
  'google/gemini-2.5-flash-preview': {
    name: 'Gemini 2.5 Flash Preview (Free Tier)',
    provider: 'openrouter',
    isFreeTier: true
  },
  'openai/gpt-4.1-mini': {
    name: 'GPT-4.1 Mini (Free Tier)',
    provider: 'openrouter',
    isFreeTier: true
  },
  'x-ai/grok-3-mini-beta': {
    name: 'Grok 3 Mini Beta (Free Tier)',
    provider: 'openrouter',
    isFreeTier: true
  },

  // OpenRouter paid models
  'deepseek/deepseek-chat': {
    name: 'DeepSeek V3 (Free Tier)', // Note: OpenRouter lists this as free tier, keeping it here for now
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
  'gpt-4o-mini': { // Keeping the paid OpenAI version
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
    // Filter for models explicitly marked as free tier
    return Object.entries(MODEL_CONFIGS)
      .filter(([_, config]) => config.isFreeTier === true && config.provider === 'openrouter') // Free models are only via OpenRouter currently
      .map(([id, config]) => ({
        id,
        name: config.name
      }));
  }

  // For paid mode, filter by provider, excluding explicitly marked free tier models unless they are the *only* option for that provider (edge case, unlikely)
  return Object.entries(MODEL_CONFIGS)
    .filter(([_, config]) => config.provider === provider && config.isFreeTier !== true) // Show only non-free models for the selected provider
    .map(([id, config]) => ({
      id,
      name: config.name
    }));
};
