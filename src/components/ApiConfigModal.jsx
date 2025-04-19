import React, { useState, useEffect } from 'react';
import { getAvailableModels, MODEL_CONFIGS } from '../data/modelConfig';
import {Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,FormControl,InputLabel,MenuItem,Select,TextField,Typography,Grid,Divider,IconButton,Tooltip,CircularProgress,
  Switch, FormControlLabel
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';

import { availableTeams, teamColors } from '../data/teamMapping';

// Define the new default free model
const DEFAULT_FREE_MODEL = 'google/gemini-2.5-flash-preview';
const DEFAULT_OPENROUTER_PAID_MODEL = 'google/gemini-2.5-flash-preview'; // Or choose another default paid OpenRouter model
const DEFAULT_OPENAI_PAID_MODEL = 'gpt-4o-mini';

const ApiConfigModal = ({ isOpen, onClose, apiConfig, setApiConfig }) => {
  const [localConfig, setLocalConfig] = useState(apiConfig);
  const [testingApi, setTestingApi] = useState(null); // Changed to null instead of boolean
  const [testResult, setTestResult] = useState({ provider: null, status: null, message: null });
  // Store previous non-free mode configuration
  const [previousNonFreeConfig, setPreviousNonFreeConfig] = useState(null);

  // Initialize local config with default values for all teams
  useEffect(() => {
    const defaultConfig = Object.fromEntries(
      availableTeams.map(team => [
        team,
        {
          provider: 'openrouter', // Default provider
          model: DEFAULT_FREE_MODEL, // Default model (now the new Gemini Flash)
          color: teamColors[team]
        }
      ])
    );
    // Merge existing config over defaults, ensuring apiKeys is preserved
    const mergedConfig = {
      ...defaultConfig,
      ...apiConfig,
      apiKeys: apiConfig.apiKeys || { openai: '', openrouter: '' }, // Ensure apiKeys exists
    };

    // If starting in free mode, ensure all teams use a valid free model
    if (mergedConfig.useFreeMode) {
       availableTeams.forEach(team => {
         mergedConfig[team] = {
           provider: 'openrouter',
           model: DEFAULT_FREE_MODEL,
           color: teamColors[team]
         };
       });
    } else {
      // If not in free mode, store the current config as previous non-free config
      const teamConfigs = {};
      availableTeams.forEach(team => {
        if (apiConfig[team]) {
          teamConfigs[team] = { ...apiConfig[team] };
        }
      });
      setPreviousNonFreeConfig(teamConfigs);
    }

    setLocalConfig(mergedConfig);

  }, [apiConfig, isOpen]); // Rerun when modal opens to reflect external changes

  const handleProviderChange = (team, provider) => {
    // When changing provider, set the default model for that provider
    const defaultModel = provider === 'openai'
      ? DEFAULT_OPENAI_PAID_MODEL
      : DEFAULT_OPENROUTER_PAID_MODEL; // Use the new Gemini Flash as default paid OpenRouter too

    setLocalConfig(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        provider,
        model: defaultModel
      }
    }));
  };

  const handleModelChange = (team, model) => {
    setLocalConfig(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        model
      }
    }));
  };

  const handleApiKeyChange = (provider, apiKey) => {
    setLocalConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: apiKey
      }
    }));
  };

  const handleSave = () => {
    setApiConfig(localConfig);
    onClose();
  };

  const testApiConnection = async (provider) => {
    setTestingApi(provider); // Store which provider is being tested
    setTestResult({ provider, status: null, message: null });

    const apiKey = localConfig.apiKeys[provider];
    // Check if we're using Free Tier for OpenRouter
    const isFreeTier = localConfig.useFreeMode;

    if (!apiKey && !isFreeTier && provider !== 'openrouter') { // Free tier only applies to openrouter via our backend
      setTestResult({
        provider,
        status: 'error',
        message: 'No API key. Please enter a key before testing.'
      });
      setTestingApi(null);
      return;
    }
     if (!apiKey && !isFreeTier && provider === 'openrouter') {
        setTestResult({
            provider,
            status: 'error',
            message: 'No API key for OpenRouter. Please enter a key or enable Free Mode.'
        });
        setTestingApi(null);
        return;
    }


    try {
      let apiUrl, headers, body;

      if (provider === 'openai') {
        apiUrl = "https://api.openai.com/v1/chat/completions";
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        };
        body = JSON.stringify({
          model: DEFAULT_OPENAI_PAID_MODEL, // Use default paid model for testing
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say 'API connection successful' if you can read this." }
          ],
          max_tokens: 20
        });
      } else if (provider === 'openrouter') {
        if (isFreeTier) {
          // Use our backend endpoint for Free Tier
          apiUrl = "/api/freeTierModel";
          headers = {
            "Content-Type": "application/json"
          };
          body = JSON.stringify({
            model: DEFAULT_FREE_MODEL, // Use the new default free model for testing
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: "Say 'API connection successful' if you can read this." }
            ],
            max_tokens: 20
          });
        } else {
          apiUrl = "https://openrouter.ai/api/v1/chat/completions";
          headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.href,
            "X-Title": "F1 Race Strategy Simulator"
          };
          body = JSON.stringify({
            model: DEFAULT_OPENROUTER_PAID_MODEL, // Use default paid model for testing
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: "Say 'API connection successful' if you can read this." }
            ],
            max_tokens: 20
          });
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
        setTestResult({
          provider,
          status: 'error',
          message: `API Error: ${errorMessage}`
        });
      } else {
        // Don't necessarily need to parse the response body for a simple connection test
        // const data = await response.json();
        setTestResult({
          provider,
          status: 'success',
          message: `${provider === 'openai' ? 'OpenAI' : 'OpenRouter'} API connection successful!`
        });
      }
    } catch (error) {
      setTestResult({
        provider,
        status: 'error',
        message: `Communication error: ${error.message}`
      });
    } finally {
      setTestingApi(null);
    }
  };

  const handleFreeModeToggle = (event) => {
    const useFreeMode = event.target.checked;

    if (useFreeMode) {
      // Store current non-free configuration before switching to free mode
      const teamConfigs = {};
      availableTeams.forEach(team => {
        if (localConfig[team]) {
          teamConfigs[team] = { ...localConfig[team] };
        }
      });
      setPreviousNonFreeConfig(teamConfigs);

      // Create updated config with free mode setting
      const updatedConfig = {
        ...localConfig,
        useFreeMode
      };

      // Update all teams to use the default free tier model
      availableTeams.forEach(team => {
        updatedConfig[team] = {
          provider: 'openrouter', // Free tier is only via OpenRouter backend
          model: DEFAULT_FREE_MODEL, // Set the new default free model
          color: teamColors[team]
        };
      });

      setLocalConfig(updatedConfig);
    } else {
      // Switching back from free mode to paid mode
      const updatedConfig = {
        ...localConfig,
        useFreeMode: false
      };

      // Restore previous configuration if available, otherwise set defaults
      if (previousNonFreeConfig) {
        availableTeams.forEach(team => {
          if (previousNonFreeConfig[team]) {
            updatedConfig[team] = { ...previousNonFreeConfig[team] };
          } else {
            // Default to appropriate paid model if no previous config for this team
            updatedConfig[team] = {
              ...updatedConfig[team], // Keep color etc.
              provider: 'openrouter', // Default provider
              model: DEFAULT_OPENROUTER_PAID_MODEL // Default paid model
            };
          }
        });
      } else {
        // If no previous config exists at all, set all to default paid models
        availableTeams.forEach(team => {
          updatedConfig[team] = {
            ...updatedConfig[team], // Keep color etc.
            provider: 'openrouter', // Default provider
            model: DEFAULT_OPENROUTER_PAID_MODEL // Default paid model
          };
        });
      }

      setLocalConfig(updatedConfig);
    }
  };

  // Ensure localConfig and localConfig.apiKeys are initialized
  if (!localConfig || !localConfig.apiKeys) {
      return <CircularProgress />; // Or some other loading/error state
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          color: 'white',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        pb: 1
      }}>
        <Typography variant="h5" component="div" sx={{ fontFamily: 'Titillium Web', fontWeight: 600 }}>
          API Configuration
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {/* Free Mode Toggle */}
        <Box sx={{
          mb: 3,
          p: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={localConfig.useFreeMode || false}
                onChange={handleFreeModeToggle}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#4caf50',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#4caf50',
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Use Free Mode
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  When enabled, all teams will use free tier models (via OpenRouter backend) and no API keys are required.
                </Typography>
              </Box>
            }
            sx={{
              m: 0,
              width: '100%',
              alignItems: 'flex-start'
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Titillium Web', fontWeight: 600 }}>
            API Keys
          </Typography>
          {localConfig.useFreeMode && (
            <Box sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Typography variant="body1" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                You're using Free Mode. No API keys are required.
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type="password"
                  value={localConfig.apiKeys.openai || ''}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  variant="outlined"
                  disabled={localConfig.useFreeMode} // Always disabled in free mode
                  helperText={localConfig.useFreeMode ? "Not required in Free Mode" : "Required for OpenAI models"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-disabled': { // Style for disabled state
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.1) !important',
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-disabled': {
                         color: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                       '&.Mui-disabled': {
                         color: 'rgba(255, 255, 255, 0.5)',
                         WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)', // For Chrome/Safari
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: localConfig.useFreeMode ? '#4caf50' : 'rgba(255, 255, 255, 0.7)', // Green in free mode, default otherwise
                    },
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={() => testApiConnection('openai')}
                disabled={testingApi !== null || localConfig.useFreeMode} // Disable test button in free mode
                sx={{
                  color: testingApi === 'openai' ? 'white' :
                         testResult.status === 'success' && testResult.provider === 'openai' ? '#4caf50' :
                         testResult.status === 'error' && testResult.provider === 'openai' ? '#f44336' : 'white',
                  borderColor: testingApi === 'openai' ? 'white' :
                               testResult.status === 'success' && testResult.provider === 'openai' ? '#4caf50' :
                               testResult.status === 'error' && testResult.provider === 'openai' ? '#f44336' : 'rgba(255, 255, 255, 0.2)',
                  '&.Mui-disabled': { // Style for disabled button
                    color: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {testingApi === 'openai' ? (
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                ) : null}
                Test OpenAI Connection
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  label="OpenRouter API Key"
                  type="password"
                  value={localConfig.apiKeys.openrouter || ''}
                  onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
                  variant="outlined"
                  disabled={localConfig.useFreeMode} // Also disable OpenRouter key field in free mode
                  helperText={localConfig.useFreeMode ? "Not required in Free Mode" : "Required for non-free OpenRouter models"}
                   sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-disabled': { // Style for disabled state
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.1) !important',
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-disabled': {
                         color: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                       '&.Mui-disabled': {
                         color: 'rgba(255, 255, 255, 0.5)',
                         WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)', // For Chrome/Safari
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: localConfig.useFreeMode ? '#4caf50' : 'rgba(255, 255, 255, 0.7)', // Green in free mode, default otherwise
                    },
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={() => testApiConnection('openrouter')}
                disabled={testingApi !== null} // Test button is always enabled unless a test is running (works for free/paid)
                sx={{
                  color: testingApi === 'openrouter' ? 'white' :
                         testResult.status === 'success' && testResult.provider === 'openrouter' ? '#4caf50' :
                         testResult.status === 'error' && testResult.provider === 'openrouter' ? '#f44336' : 'white',
                  borderColor: testingApi === 'openrouter' ? 'white' :
                               testResult.status === 'success' && testResult.provider === 'openrouter' ? '#4caf50' :
                               testResult.status === 'error' && testResult.provider === 'openrouter' ? '#f44336' : 'rgba(255, 255, 255, 0.2)',
                   '&.Mui-disabled': { // Style for disabled button (only when testingApi is not null)
                    color: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {testingApi === 'openrouter' ? (
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                ) : null}
                Test OpenRouter Connection {localConfig.useFreeMode ? '(Free Mode)' : ''}
              </Button>
            </Grid>
          </Grid>

          {testResult.message && (
            <Box sx={{
              mt: 2,
              p: 1,
              borderRadius: 1,
              backgroundColor: testResult.status === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              border: `1px solid ${testResult.status === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
              color: testResult.status === 'success' ? '#4caf50' : '#f44336'
            }}>
              {testResult.message}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Titillium Web', fontWeight: 600 }}>
          Team API Settings
        </Typography>

        <Grid container spacing={3}>
          {availableTeams.map(team => (
            <Grid item xs={12} md={6} key={team}>
              <Box sx={{
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.03)'
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{
                  fontWeight: 'bold',
                  color: teamColors[team] || 'white'
                }}>
                  {team}
                </Typography>

                {/* Provider Selection - Disabled in Free Mode */}
                 <FormControl fullWidth sx={{ mb: 2 }} disabled={localConfig.useFreeMode}>
                  <InputLabel id={`provider-label-${team}`} sx={{ color: localConfig.useFreeMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)' }}>
                    API Provider
                  </InputLabel>
                  <Select
                    labelId={`provider-label-${team}`}
                    value={localConfig[team]?.provider || 'openrouter'} // Default to openrouter
                    onChange={(e) => handleProviderChange(team, e.target.value)}
                    label="API Provider"
                    sx={{
                      color: localConfig.useFreeMode ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: localConfig.useFreeMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: localConfig.useFreeMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: localConfig.useFreeMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                      },
                      '.MuiSvgIcon-root': {
                        color: localConfig.useFreeMode ? 'rgba(255, 255, 255, 0.3)' : 'white',
                      },
                       '&.Mui-disabled': { // Style for disabled state
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <MenuItem value="openai">OpenAI</MenuItem>
                    <MenuItem value="openrouter">OpenRouter</MenuItem>
                  </Select>
                   {localConfig.useFreeMode && (
                      <Typography variant="caption" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                        Provider set to OpenRouter in Free Mode.
                      </Typography>
                    )}
                </FormControl>

                {/* Model Selection - Always enabled, but list changes based on Free Mode */}
                <FormControl fullWidth>
                   <InputLabel id={`model-label-${team}`} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Model {localConfig.useFreeMode ? '(Free Tier)' : ''}
                  </InputLabel>
                  <Select
                    labelId={`model-label-${team}`}
                    value={localConfig[team]?.model || ''}
                    onChange={(e) => handleModelChange(team, e.target.value)}
                    label={`Model ${localConfig.useFreeMode ? '(Free Tier)' : ''}`}
                    disabled={false} // Always enabled
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '.MuiSvgIcon-root': {
                        color: 'white',
                      }
                    }}
                  >
                    {getAvailableModels(localConfig[team]?.provider || 'openrouter', localConfig.useFreeMode).map(model => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {localConfig.useFreeMode && !getAvailableModels('openrouter', true).some(m => m.id === localConfig[team]?.model) && (
                   <Typography variant="body2" sx={{ mt: 1, color: '#f44336' }}>
                     Warning: Selected model might not be available in free tier. Defaulting to {DEFAULT_FREE_MODEL}.
                   </Typography>
                 )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20'
            }
          }}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiConfigModal;
