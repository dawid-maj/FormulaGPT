/**
 * Unified API service module handling API communication, configuration and hooks
 */

import { useState, useEffect } from 'react';
import { getTireSelectionPrompt } from '../data/tireDecisionPrompt';
import { TIRE_TYPES, PITSTOP_TIME_PENALTY } from '../data/constants';
import { getTeamPrompt } from '../data/teamPrompts';
import { teamMapping, teamColors, availableTeams } from '../data/teamMapping';
import { MODEL_CONFIGS, getAvailableModels } from '../data/modelConfig';
import { computeScoreboardData } from "../utils/computeScoreboardData";

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
        console.log("All responses received - disabling spinner");
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

/**
 * Determines if a model is using the Free Tier
 * @param {string} model - The model ID
 * @returns {boolean} - True if using Free Tier
 */
const isFreeTierModel = (model) => {
  return MODEL_CONFIGS[model]?.isFreeTier || false;
};

/**
 * Prepares API request configuration based on team settings
 * @param {Object} teamApiConfig - Team API configuration
 * @param {Array} messages - Messages to send
 * @param {Object} apiConfig - Global API configuration
 * @returns {Object} API request configuration
 */
const prepareApiRequest = (teamApiConfig, messages, apiConfig) => {
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
};

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
  
  // Detailed logging of API configuration
  /*
  console.log(`Team ${team} API Configuration:`, {
    provider: teamApiConfig.provider,
    model: teamApiConfig.model,
    usingFreeTier: usingFreeTier
  });
  */
  
  // Logowanie pełnej zawartości wysyłanej do API
  const messagesToSend = [{ role: "system", content: prompt }];
  console.log(`Full API request for TIRE SELECTION, team ${team}:`, {
    provider: teamApiConfig.provider,
    model: teamApiConfig.model,
    messages: messagesToSend
  });
  
  // Only check for API key if not using Free Tier
  if (!usingFreeTier) {
    const apiKey = apiConfig.apiKeys[teamApiConfig.provider];
    if (!apiKey) {
      setApiError(`Missing API key for ${teamApiConfig.provider}. Configure the key in the API settings.`);
      return Promise.reject(new Error(`Missing API key for ${teamApiConfig.provider}`));
    }
  }

  try {
    const { url, headers, body } = prepareApiRequest(teamApiConfig, messagesToSend, apiConfig);
    
    /*
    console.log(`API request details for team ${team}:`, {
      url: url,
      provider: teamApiConfig.provider,
      model: teamApiConfig.model
    });
*/

    // Send API request to selected provider (OpenAI, OpenRouter, or our backend)
    const response = await fetch(url, { method: "POST", headers, body });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      setApiError(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      return Promise.reject(new Error(`API error: ${response.status}`));
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      setApiError("Invalid API response: missing message in response");
      return Promise.reject(new Error("Invalid API response"));
    }

     const assistantMessage = data.choices[0].message;
     console.log("Assistant response for team", team, ":", assistantMessage);

    let commandsText = assistantMessage.content;
    const codeBlockMatch = commandsText.match(/```([^`]+)```/);
    if (codeBlockMatch) {
      commandsText = codeBlockMatch[1];
    } else {
      const actionsIndex = commandsText.toLowerCase().indexOf("actions:");
      if (actionsIndex !== -1) {
        commandsText = commandsText.substring(actionsIndex + "actions:".length);
      }
    }
    commandsText = commandsText.replace(/\n/g, ' ').replace(/[*_]+/g, '').trim();

    const tireMatches = [...commandsText.matchAll(/([a-zA-Z]+)\s+tire\s+(soft|medium|hard)/gi)];
    //console.log("Tire command matches:", tireMatches);

    setCars(prevCars =>
      prevCars.map(car => {
        if (car.team === team) {
          const match = tireMatches.find(m => m[1].toLowerCase() === car.name.toLowerCase());
          if (match) {
            const tireAction = match[2].toLowerCase();
            if (['soft', 'medium', 'hard'].includes(tireAction)) {
              // console.log("Updating tires for", car.name, "to", tireAction);
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
  const minutes = Math.floor(raceTimeVal / 60);
  const seconds = Math.floor(raceTimeVal % 60);
  const raceTimeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const totalLaps = 12; // Uaktualnij wartość, jeśli liczba okrążeń jest inna

  const scoreboardText = scoreboardVal.map(item => {
    const normalizedDistance = ((item.distanceTraveled % pathLength) + pathLength) % pathLength;
    const distPercent = Math.round((normalizedDistance / pathLength) * 100);
    return `P${item.position}: ${item.name}, tires: ${item.tires.name}, cond: ${Math.round(item.tires.condition)}%, speed: ${item.currentSpeed?.toFixed(1) ?? item.tires.speed}, interval: ${item.position === 1 ? '---' : `+${item.interval.toFixed(2)}`}, laps: ${item.laps}, lap dist: ${distPercent}%, status: ${item.status}, tire history: ${item.tireHistory.join('-')}, last lap: ${item.lastLapTime ? item.lastLapTime.toFixed(2) : '-'}`;
  }).join('\n');

  const lastSentTime = teamLastEventTimeRef.current[team] || 0;
  const newEvents = eventsVal.filter(event => event.time >= lastSentTime);
  const eventsText = newEvents.reverse().map(event => `${event.timestamp} - ${event.details}`).join('\n');

  const driversSituation = teamMapping[team]
    .map(driver => {
      const car = scoreboardVal.find(item => item.name.toLowerCase() === driver.toLowerCase());
      if (car) {
        const normalizedDistance = ((car.distanceTraveled % pathLength) + pathLength) % pathLength;
        const progressFraction = normalizedDistance / pathLength;
        const lapsRemaining = totalLaps - (car.laps + progressFraction) + 1;
        
        // Format pit stop projection information
        let pitProjectionText = "";
        if (car.pitProjection) {
          const { projectedPosition, projectedGap, carAhead } = car.pitProjection;
          pitProjectionText = ` Pit projection: P${projectedPosition} (${PITSTOP_TIME_PENALTY}s loss)${carAhead ? ` | After stop: ${projectedGap.toFixed(1)}s behind ${carAhead}` : ''}`;
        }
        
        return { 
          driver, 
          position: car.position, 
          text: `P${car.position} ${driver} [${lapsRemaining.toFixed(2)} laps left]${pitProjectionText}` 
        };
      }
      return { driver, position: 999, text: `P- ${driver} ? laps remaining` };
    })
    .sort((a, b) => a.position - b.position)
    .map(item => item.text)
    .join(';\n');

  const extraReminder = `Remember, you are responsible for the success of ${teamMapping[team].join(" and ")}. Current situation of your drivers:\n${driversSituation}.\nIn your reasoning and decisions, focus on ensuring their success. Important: The commands listed in the "Actions" section apply immediately to the current lap. Although you may freely discuss and propose strategic plans for upcoming laps, remember that any command you explicitly include in "Actions" will be executed right away, within this lap.`;
  const currentLap = Math.max(...scoreboardVal.map(item => item.laps));
  
  const fullContext = `Race Time: ${raceTimeStr} | Lap: ${currentLap}/${totalLaps}\n\nActual Results:\n${scoreboardText}\n\nLast Events:\n${eventsText}\n\n${isInitial ? 'NOTE: This is the beginning of the race.' : ''}\n${extraReminder}`;

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
      // Create a formatted qualifying list from the scoreboard
      const qualifyingList = scoreboardVal.map(item => 
        `P${item.position}: ${item.name} (${driverTeamMapping[item.name] || "Unknown Team"})`
      ).join('\n');
      
      // Extract tire choices from the pre-race response
      const drivers = teamMapping[team] || [];
      let driver1Tire = "unknown";
      let driver2Tire = "unknown";
      
      // Try to extract tire choices from the pre-race response
      const tireMatches = [...preRaceResponse.content.matchAll(/([a-zA-Z]+)\s+tire\s+(soft|medium|hard)/gi)];
      if (tireMatches.length > 0) {
        tireMatches.forEach(match => {
          const driver = match[1].toUpperCase();
          const tire = match[2].toLowerCase();
          if (driver === drivers[0]) {
            driver1Tire = tire;
          } else if (drivers[1] && driver === drivers[1]) {
            driver2Tire = tire;
          }
        });
      }
      
      // Create enhanced context for the pre-race response
      const enhancedPreRaceContext = `Alright, before the race, here's a quick recap of yesterday's qualifying session:\n\n${qualifyingList}\n\nJust a reminder, we decided to go with ${driver1Tire} tires for ${drivers[0]}${drivers[1] ? ` and ${driver2Tire} tires for ${drivers[1]}` : ''}. Here's the reasoning you shared with your team yesterday:\n"\n${preRaceResponse.content}"\n###\nThat was your line of thinking. In the next message, you'll receive the starting table, and you'll decide the pace of your drivers for the first lap.`;
      
      // Replace the original pre-race response with a user message containing the enhanced context
      // instead of modifying the assistant message
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
  
  // Detailed logging of API configuration
  /*
  console.log(`Team ${team} RACE STRATEGY API Configuration:`, {
    provider: teamApiConfig.provider,
    model: teamApiConfig.model,
    usingFreeTier: usingFreeTier
  });
  */
  // Logowanie pełnej zawartości wysyłanej do API
  console.log(`Full API request for RACE STRATEGY, team ${team}:`, {
    provider: teamApiConfig.provider,
    model: teamApiConfig.model,
    messages: messagesToSend
  });
  
  // Only check for API key if not using Free Tier
  if (!usingFreeTier) {
    const apiKey = apiConfig.apiKeys[teamApiConfig.provider];
    if (!apiKey) {
      setApiError(`Missing API key for ${teamApiConfig.provider}. Configure the key in the API settings.`);
      return;
    }
  }

  try {
    const { url, headers, body } = prepareApiRequest(teamApiConfig, messagesToSend, apiConfig);

    /*
    console.log(`API request details for team ${team} race strategy:`, {
      url: url,
      provider: teamApiConfig.provider,
      model: teamApiConfig.model
    });
    */

    const response = await fetch(url, { method: "POST", headers, body });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      setApiError(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      return;
    }

    const data = await response.json();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      setApiError("Invalid API response: missing message in response");
      return;
    }

    const assistantMessage = data.choices[0].message;
    console.log("Assistant response for team", team, ":", assistantMessage);

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

    // Extract valid commands from AI response using regex
    // Matches patterns like: "driver pit soft", "driver push", "driver normal", etc.
    const commandRegex = /\b(\w+)\s+(pit\s+(soft|medium|hard|cancel)|push|normal|conserve|nothing)\b/gi;
    let commands = [];
    let match;
    while ((match = commandRegex.exec(assistantMessage.content)) !== null) {
      commands.push(match[0].trim());
    }

    if (commands.length > 0) {
      commands = commands.filter(cmd => {
        const [driver] = cmd.trim().split(' ');
        return teamMapping[team].includes(driver.toUpperCase());
      });
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
    setApiError(`API communication error: ${error.message}`);
  }
}
