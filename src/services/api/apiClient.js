/**
 * HTTP client with timeout handling for API communication
 */

const API_TIMEOUT_MS = 25000; // 25s timeout for API responses

/**
 * Fetch with timeout functionality
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Fetch promise with timeout
 */
export function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

/**
 * Prepares API request configuration based on team settings
 * @param {Object} teamApiConfig - Team API configuration
 * @param {Array} messages - Messages to send
 * @param {Object} apiConfig - Global API configuration
 * @returns {Object} API request configuration
 */
export function prepareApiRequest(teamApiConfig, messages, apiConfig) {
  const usingFreeTier = isFreeTierModel(teamApiConfig.model);
  
  if (usingFreeTier) {
    return {
      url: "/api/freeTierModel",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: teamApiConfig.model,
        messages: messages
      })
    };
  } else if (teamApiConfig.provider === 'openai') {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiConfig.apiKeys.openai}`
      },
      body: JSON.stringify({
        model: teamApiConfig.model,
        messages: messages
      })
    };
  } else if (teamApiConfig.provider === 'openrouter') {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiConfig.apiKeys.openrouter}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "F1 Race Strategy Simulator"
      },
      body: JSON.stringify({
        model: teamApiConfig.model,
        messages: messages
      })
    };
  }
  
  throw new Error(`Unsupported provider: ${teamApiConfig.provider}`);
}

/**
 * Determines if a model is using the Free Tier
 * @param {string} model - The model ID
 * @returns {boolean} - True if using Free Tier
 */
export function isFreeTierModel(model) {
  // Import MODEL_CONFIGS dynamically to avoid circular dependencies
  try {
    const { MODEL_CONFIGS } = require('../../data/modelConfig');
    return MODEL_CONFIGS[model]?.isFreeTier || false;
  } catch (error) {
    // Fallback if import fails
    return model && model.includes('gemini');
  }
}

/**
 * Sends API request and handles response
 * @param {Object} requestConfig - Request configuration from prepareApiRequest
 * @returns {Promise} Response data
 */
export async function sendApiRequest(requestConfig) {
  try {
    const response = await fetchWithTimeout(
      requestConfig.url, 
      { 
        method: "POST", 
        headers: requestConfig.headers, 
        body: requestConfig.body 
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response: missing message in response");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}