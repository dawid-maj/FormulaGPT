// Model configuration for the application
export const MODEL_CONFIGS = {
  // Free tier models (OpenRouter) - Also available in paid OpenRouter mode
  'google/gemini-2.5-flash-preview': {
    name: 'Gemini 2.5 Flash Preview', // Simplified name, free tier status handled by logic/UI
    provider: 'openrouter',
    isFreeTier: true // Flag indicates availability in our free tier backend
  },
  'openai/gpt-4.1-mini': {
    name: 'GPT-4.1 Mini', // Simplified name
    provider: 'openrouter',
    isFreeTier: true
  },
  'x-ai/grok-3-mini-beta': {
    name: 'Grok 3 Mini Beta', // Simplified name
    provider: 'openrouter',
    isFreeTier: true
  },

  // OpenRouter paid models
  'deepseek/deepseek-chat': {
    name: 'DeepSeek V3', // Note: OpenRouter lists this as free tier sometimes, treat as regular model here
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
  'openai/o4-mini': {
    name: 'O4 Mini (OpenRouter)', // Distinguish from OpenAI direct version if needed
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
  'o4-mini': {
    name: 'O4 Mini (OpenAI)', // Distinguish from OpenRouter version if needed
    provider: 'openai'
  }
};

export const getModelDisplayName = (modelId) => {
  // Add "(Free Tier)" suffix if the model is marked as free tier *and* free mode is active (or potentially always show it for clarity?)
  // For now, just return the name from config or the ID. The modal adds "(Free Tier)" to the label.
  return MODEL_CONFIGS[modelId]?.name || modelId;
};

export const getAvailableModels = (provider, useFreeMode = false) => {
  if (useFreeMode) {
    // Filter for models explicitly marked as available in our free tier via OpenRouter backend
    return Object.entries(MODEL_CONFIGS)
      .filter(([_, config]) => config.isFreeTier === true && config.provider === 'openrouter')
      .map(([id, config]) => ({
        id,
        // Add suffix here for clarity in the dropdown when free mode is on
        name: `${config.name} (Free Tier)`
      }));
  }

  // Paid mode: Refactored filter logic for clarity
  return Object.entries(MODEL_CONFIGS)
    .filter(([_, config]) => {
      // First, ensure the provider matches the selected provider
      if (config.provider !== provider) {
        return false;
      }

      // If the provider is OpenAI, only include models NOT marked as free tier
      // (since our free tier models are specifically OpenRouter ones via backend)
      if (provider === 'openai') {
        return config.isFreeTier !== true;
      }

      // If the provider is OpenRouter, include ALL models associated with OpenRouter
      if (provider === 'openrouter') {
        return true;
      }

      // Fallback for any unexpected provider value
      return false;
    })
    .map(([id, config]) => ({
      id,
      // Display the base name; the modal indicates whether free mode is active overall.
      name: config.name
    }));
};
