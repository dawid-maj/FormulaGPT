/**
 * Unified API service module handling API communication, configuration and hooks
 */

import { useState, useEffect } from 'react';
import { getTireSelectionPrompt } from '../data/tireDecisionPrompt';
import { TIRE_TYPES } from '../data/constants';
import { getTeamPrompt } from '../data/teamPrompts';
import { teamMapping, teamColors, availableTeams } from '../data/teamMapping';
import { MODEL_CONFIGS, getAvailableModels } from '../data/modelConfig';
import { computeScoreboardData } from "../utils/computeScoreboardData";

// API utilities
import { fetchWithTimeout, prepareApiRequest, sendApiRequest, isFreeTierModel } from './api/apiClient';
import { parseTireSelectionCommands, parseRaceCommands } from './strategy/commandParser';
import { 
  formatRaceTime, 
  buildScoreboardText, 
  buildEventsText, 
  buildDriverSituationText,
  buildEnhancedPreRaceContext,
  buildFullContext 
} from './strategy/messageBuilder';

// ============================================================================
// API Configuration Hook
// ============================================================================

export function useApiConfig() {
  const [apiConfig, setApiConfig] = useState(() => {
    const savedConfig = localStorage.getItem('f1ApiConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        
        // Ensure all teams have proper configuration
        const completeConfig = {
          apiKeys: parsedConfig.apiKeys || { openai: '', openrouter: '' },
          useFreeMode: parsedConfig.useFreeMode !== undefined ? parsedConfig.useFreeMode : false,
          ...availableTeams.reduce((acc, team) => {
            // Use existing team config if available, otherwise set defaults
            const freeTierModel = getAvailableModels('openrouter', true)[0];
            acc[team] = parsedConfig[team] || { 
              provider: 'openrouter', 
              model: freeTierModel.id, 
              color: teamColors[team] 
            };
            return acc;
          }, {})
        };
        
        return completeConfig;
      } catch (e) {
        console.error('Error parsing saved API config:', e);
      }
    }
    
    // Default configuration if nothing is saved or parsing failed
    return {
      apiKeys: {
        openai: '',
        openrouter: ''
      },
      useFreeMode: false,
      ...availableTeams.reduce((acc, team) => {
        acc[team] = { provider: 'openrouter', model: Object.keys(MODEL_CONFIGS)[0], color: teamColors[team] };
        return acc;
      }, {})
    };
  });

  useEffect(() => {
    localStorage.setItem('f1ApiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  return [apiConfig, setApiConfig];
}

// ============================================================================
// Team API Hook
// ============================================================================

export const useTeamApi = ({
  setupComplete,
  pathLength,
  cars,
  events,
  raceTimeRef,
  conversationHistoryRef,
  lastApiTriggerLap,
  setLastApiTriggerLap,
  availableTeams,
  teamControl,
  setPaused,
  apiConfig,
  notifications,
  expectedNotificationCount,
  setApiResponsesPending,
  setExpectedNotificationCount,
  apiQueryStartTime,
  setApiQueryStartTime,
  setApiError,
  setConversationHistory,
  setNotifications,
  setAiPendingCommands,
  teamLastEventTimeRef
}) => {

  // Wyzwalanie zapytań API, gdy lider osiąga 75% toru
  useEffect(() => {
    if (!setupComplete || pathLength <= 0 || !cars?.length) return;
    const leader = [...cars].sort((a, b) => b.laps - a.laps || b.distanceTraveled - a.distanceTraveled)[0];
    const normalizedDistance = ((leader.distanceTraveled % pathLength) + pathLength) % pathLength;
    if (normalizedDistance >= 0.75 * pathLength && leader.laps > lastApiTriggerLap) {
      setLastApiTriggerLap(leader.laps);
      // Pauza niezależnie od sterowania
      setPaused(true);
      const aiTeams = availableTeams.filter(team => teamControl[team].type === "ai");
      if (aiTeams.length > 0) {
        setApiResponsesPending(true);
        setExpectedNotificationCount(notifications.length + aiTeams.length);
        setApiQueryStartTime(Date.now());
        setApiError(null);

        const carsWithData = computeScoreboardData(cars, pathLength);
        const apiPayload = {
          scoreboard: carsWithData.map((car) => ({
            name: car.name,
            tires: car.tires,
            laps: car.laps || 0,
            distanceTraveled: car.distanceTraveled,
            position: car.position,
            interval: car.interval,
            status: car.status || "Racing",
            tireHistory: car.tireHistory,
            currentSpeed: car.currentSpeed, 
            pathLength,
            pitProjection: car.pitProjection
          }))
        };

        Promise.all(
          aiTeams.map(team =>
            sendTeamQuery({
              team,
              scoreboardVal: apiPayload.scoreboard,
              eventsVal: events,
              raceTimeVal: raceTimeRef.current,
              conversationHistoryVal: conversationHistoryRef.current,
              isInitial: false,
              apiConfig,
              setApiError,
              setConversationHistory,
              setNotifications,
              setAiPendingCommands,
              teamLastEventTimeRef,
              pathLength
            })
          )
        ).catch(error => {
          console.error("Error while sending API requests:", error);
        });
      }
    }
  }, [
    setupComplete,
    pathLength,
    cars,
    lastApiTriggerLap,
    availableTeams,
    teamControl,
    notifications,
    apiConfig,
    events,
    raceTimeRef,
    conversationHistoryRef,
    teamLastEventTimeRef,
    setLastApiTriggerLap,
    setPaused,
    setApiResponsesPending,
    setExpectedNotificationCount,
    setApiQueryStartTime,
    setApiError,
    setConversationHistory,
    setNotifications,
    setAiPendingCommands
  ]);

  // Monitorowanie otrzymanych odpowiedzi
  useEffect(() => {
    const minDisplayTime = 1000;
    const now = Date.now();
    if (expectedNotificationCount !== null && apiQueryStartTime !== null) {
      if (notifications.length >= expectedNotificationCount && (now - apiQueryStartTime >= minDisplayTime)) {
        setApiResponsesPending(false);
        setExpectedNotificationCount(null);
        setApiQueryStartTime(null);
      }
    }
  }, [notifications, expectedNotificationCount, apiQueryStartTime, setApiResponsesPending, setExpectedNotificationCount, setApiQueryStartTime]);
};

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Create a reverse mapping from driver to team
 */
const createDriverTeamMapping = () => {
  const mapping = {};
  Object.entries(teamMapping).forEach(([team, drivers]) => {
    drivers.forEach(driver => {
      mapping[driver] = team;
    });
  });
  return mapping;
};

// Driver to team mapping
const driverTeamMapping = createDriverTeamMapping();

// These functions are now imported from api/apiClient.js and strategy/ modules

/**
 * Generates initial AI strategy for team's tire selection before race start
 * @param {string} team - Team name
 * @param {Array} startingGrid - Array of drivers in starting order
 * @param {Object} apiConfig - API configuration including keys and models
 * @param {Function} setApiError - Error state setter
 * @param {Function} setCars - Cars state setter
 * @param {Function} setConversationHistory - Conversation history state setter
 * @param {Function} setTeamControl - Team control state setter
 * @returns {Promise} Resolves when strategy is generated and applied
 */
export async function generateAIStrategy(team, startingGrid, apiConfig, setApiError, setCars, setConversationHistory, setTeamControl) {
  const startingPositions = {};
  startingGrid.forEach((driver, idx) => {
    if(driver) startingPositions[driver] = idx + 1;
  });

  const prompt = getTireSelectionPrompt(team, startingPositions);
  
  // Get team API configuration
  const teamApiConfig = apiConfig[team];
  const usingFreeTier = isFreeTierModel(teamApiConfig.model);
  
  
  const messagesToSend = [{ role: "system", content: prompt }];
  
  // Only check for API key if not using Free Tier
  if (!usingFreeTier) {
    const apiKey = apiConfig.apiKeys[teamApiConfig.provider];
    if (!apiKey) {
      setApiError(`Missing API key for ${teamApiConfig.provider}. Configure the key in the API settings.`);
      return Promise.reject(new Error(`Missing API key for ${teamApiConfig.provider}`));
    }
  }

  try {
    const requestConfig = prepareApiRequest(teamApiConfig, messagesToSend, apiConfig);
    const data = await sendApiRequest(requestConfig);
    const assistantMessage = data.choices[0].message;

    const tireMatches = parseTireSelectionCommands(assistantMessage.content);

    setCars(prevCars =>
      prevCars.map(car => {
        if (car.team === team) {
          const match = tireMatches.find(m => m[1].toLowerCase() === car.name.toLowerCase());
          if (match) {
            const tireAction = match[2].toLowerCase();
            if (['soft', 'medium', 'hard'].includes(tireAction)) {
              const newTireType = TIRE_TYPES[tireAction.toUpperCase()];
              return {
                ...car,
                tires: { ...newTireType, condition: 100, type: tireAction.toUpperCase() },
                tireHistory: [newTireType.name]
              };
            }
          }
        }
        return car;
      })
    );

    // Zapisujemy w historii konwersacji zarówno system message jak i odpowiedź asystenta
    setConversationHistory(prev => ({
      ...prev,
      [team]: [
        { role: "system", content: prompt },
        { role: "assistant", content: assistantMessage.content }
      ]
    }));

    // Store the model information in teamControl
    setTeamControl(prev => ({
      ...prev,
      [team]: { 
        ...prev[team], 
        aiStrategyApplied: true,
        // Explicitly store the model that was actually used
        model: teamApiConfig.model,
        provider: teamApiConfig.provider
      }
    }));

    setApiError(null);
    return Promise.resolve();
  } catch (error) {
    console.error("Error fetching tire strategy for team", team, ":", error);
    setApiError(`API communication error: ${error.message}`);
    return Promise.reject(error);
  }
}

/**
 * Sends query to AI for team strategy during race
 * @param {Object} params - Query parameters
 * @param {string} params.team - Team name
 * @param {Array} params.scoreboardVal - Current race standings
 * @param {Array} params.eventsVal - Race events history
 * @param {number} params.raceTimeVal - Current race time
 * @param {Object} params.conversationHistoryVal - Team conversation history
 * @param {boolean} params.isInitial - Whether this is initial race query
 * @param {Object} params.apiConfig - API configuration
 * @param {Function} params.setApiError - Error state setter
 * @param {Function} params.setConversationHistory - History state setter
 * @param {Function} params.setNotifications - Notifications state setter
 * @param {Function} params.setAiPendingCommands - Pending commands state setter
 * @param {Object} params.teamLastEventTimeRef - Last event time reference
 * @param {number} params.pathLength - Race track length
 */
export async function sendTeamQuery({ 
  team, 
  scoreboardVal, 
  eventsVal, 
  raceTimeVal, 
  conversationHistoryVal, 
  isInitial = false, 
  apiConfig, 
  setApiError, 
  setConversationHistory, 
  setNotifications, 
  setAiPendingCommands, 
  teamLastEventTimeRef,
  pathLength 
}) {
  const systemMessage = { role: "system", content: getTeamPrompt(team) };
  const raceTimeStr = formatRaceTime(raceTimeVal);
  const totalLaps = 12; // Update this value if race laps change
  
  const scoreboardText = buildScoreboardText(scoreboardVal, pathLength);
  const eventsText = buildEventsText(eventsVal, teamLastEventTimeRef.current[team] || 0);
  const driversSituation = buildDriverSituationText(teamMapping[team], scoreboardVal, pathLength, totalLaps);
  
  const currentLap = Math.max(...scoreboardVal.map(item => item.laps));
  const fullContext = buildFullContext(raceTimeStr, currentLap, totalLaps, scoreboardText, eventsText, isInitial, driversSituation);

  const history = conversationHistoryVal[team] || [];
  
  // Zawsze używamy nowego promptu systemowego z teamPrompts.js
  // Usuwamy stary prompt systemowy, jeśli istnieje
  const filteredHistory = history.filter(msg => msg.role !== "system");
  
  // Enhance the pre-race response with more context
  let enhancedHistory = [...filteredHistory];
  
  // If this is the first race query and we have a pre-race response
  if (isInitial || (filteredHistory.length === 1 && filteredHistory[0].role === "assistant")) {
    const preRaceResponse = filteredHistory.find(msg => msg.role === "assistant");
    
    if (preRaceResponse) {
      const enhancedPreRaceContext = buildEnhancedPreRaceContext(
        scoreboardVal, 
        driverTeamMapping, 
        teamMapping[team] || [], 
        preRaceResponse
      );
      
      // Replace the original pre-race response with enhanced context
      enhancedHistory = enhancedHistory.filter(msg => msg.role !== "assistant");
      enhancedHistory.push({ role: "user", content: enhancedPreRaceContext });
    }
  }
  
  // Bierzemy ostatnie 4 wiadomości z przefiltrowanej historii (bez system message)
  const limitedHistory = enhancedHistory.slice(-4);
  
  // Zawsze dodajemy nowy prompt systemowy na początku
  const messagesToSend = [
    systemMessage,
    ...limitedHistory,
    { role: "user", content: fullContext }
  ];

  // Get team API configuration
  const teamApiConfig = apiConfig[team];
  const usingFreeTier = isFreeTierModel(teamApiConfig.model);
  
  
  // Only check for API key if not using Free Tier
  if (!usingFreeTier) {
    const apiKey = apiConfig.apiKeys[teamApiConfig.provider];
    if (!apiKey) {
      setApiError(`Missing API key for ${teamApiConfig.provider}. Configure the key in the API settings.`);
      return;
    }
  }

  try {
    const requestConfig = prepareApiRequest(teamApiConfig, messagesToSend, apiConfig);
    const data = await sendApiRequest(requestConfig);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const assistantMessage = data.choices[0].message;

    // Zapisujemy w historii konwersacji, zawsze z nowym promptem systemowym
    setConversationHistory(prev => {
      const currentHistory = prev[team] || [];
      // Usuwamy stary prompt systemowy
      const filteredHistory = currentHistory.filter(msg => msg.role !== "system");
      
      return {
        ...prev,
        [team]: [
          systemMessage,
          ...filteredHistory,
          { role: "user", content: fullContext },
          assistantMessage
        ]
      };
    });

    setNotifications(prev => [{
      team,
      content: assistantMessage.content,
      timestamp: Date.now(),
      raceTime: raceTimeVal,
      // Include model information in notifications
      model: teamApiConfig.model,
      provider: teamApiConfig.provider
    }, ...prev]);

    // Extract and validate commands from AI response
    const commands = parseRaceCommands(assistantMessage.content, teamMapping[team]);

    if (commands.length > 0) {
      setAiPendingCommands(prev => [...prev, ...commands.map(cmd => ({ 
        team, 
        command: cmd,
        // Include model information in pending commands
        model: teamApiConfig.model,
        provider: teamApiConfig.provider
      }))]);
    }

    setApiError(null);
    teamLastEventTimeRef.current = { ...teamLastEventTimeRef.current, [team]: raceTimeVal };
  } catch (error) {
    console.error("Error for team", team, ":", error);

    // Timeout/network failure fallback
    setNotifications(prev => [{
      team,
      content: "**System**: Communication disruption - no response from model.",
      timestamp: Date.now(),
      raceTime: raceTimeVal,
      error: true,
      model: teamApiConfig.model,
      provider: teamApiConfig.provider
    }, ...prev]);

    // Fallback commands for both drivers to keep race going
    const nothingCmds = teamMapping[team].map(d => `${d.toLowerCase()} nothing`);
    setAiPendingCommands(prev => [
      ...prev,
      ...nothingCmds.map(cmd => ({ team, command: cmd, model: teamApiConfig.model, provider: teamApiConfig.provider }))
    ]);

    setApiError(`API communication error: ${error.message.includes("timeout") || error.name === "AbortError" ? "timeout" : error.message}`);
  }
}
