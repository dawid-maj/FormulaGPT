/**
 * Race Context for global state management
 */

import React, { createContext, useContext } from 'react';
import { useRaceState } from '../hooks/useRaceState';
import { useApiState } from '../hooks/useApiState';
import { useRace } from '../hooks/useRace';
import { useCommandHandler } from '../hooks/useCommandHandler';
import { usePendingCommands } from '../hooks/usePendingCommands';
import { useApiConfig, useTeamApi } from '../services/aiService';
import { availableTeams, defaultTeamControl } from '../data/teamMapping';
import { useState, useEffect } from 'react';

const RaceContext = createContext(null);

export const RaceProvider = ({ children }) => {
  // All state management hooks
  const raceState = useRaceState();
  const apiState = useApiState();
  const [apiConfig, setApiConfig] = useApiConfig();
  const [teamControl, setTeamControl] = useState(defaultTeamControl);

  // Update refs when state changes
  useEffect(() => {
    apiState.pendingCommandsRef.current = apiState.pendingCommands;
  }, [apiState.pendingCommands]);
  
  useEffect(() => {
    apiState.conversationHistoryRef.current = apiState.conversationHistory;
  }, [apiState.conversationHistory]);

  // Race hook
  const { raceTime, cars, setCars, raceFinished, updateRace, applyStartingGrid } = useRace({
    pathLength: raceState.pathLength,
    addEvent: (type, details) => raceState.addEvent(type, details, raceTime),
    previousRankingRef: raceState.previousRankingRef,
    paused: raceState.paused,
    setPaused: raceState.setPaused,
    setupComplete: raceState.setupComplete,
    teamControl,
    initialCars: null
  });

  // Command handler hook
  const { handleCommandSubmit } = useCommandHandler({
    setCars,
    pathLength: raceState.pathLength,
    addEvent: (type, details) => raceState.addEvent(type, details, raceTime),
    raceTimeRef: raceState.raceTimeRef
  });

  // Update race time ref
  useEffect(() => {
    raceState.raceTimeRef.current = raceTime;
  }, [raceTime, raceState.raceTimeRef]);

  // Pending commands hook
  usePendingCommands({
    pendingCommands: apiState.pendingCommands,
    setPendingCommands: apiState.setPendingCommands,
    aiPendingCommands: apiState.aiPendingCommands,
    setAiPendingCommands: apiState.setAiPendingCommands,
    paused: raceState.paused,
    setupComplete: raceState.setupComplete,
    pathLength: raceState.pathLength,
    handleCommandSubmit
  });

  // Team API hook
  useTeamApi({
    setupComplete: raceState.setupComplete,
    pathLength: raceState.pathLength,
    cars,
    events: raceState.events,
    raceTimeRef: raceState.raceTimeRef,
    conversationHistoryRef: apiState.conversationHistoryRef,
    lastApiTriggerLap: apiState.lastApiTriggerLap,
    setLastApiTriggerLap: apiState.setLastApiTriggerLap,
    availableTeams,
    teamControl,
    setPaused: raceState.setPaused,
    apiConfig,
    notifications: apiState.notifications,
    expectedNotificationCount: apiState.expectedNotificationCount,
    setApiResponsesPending: apiState.setApiResponsesPending,
    setExpectedNotificationCount: apiState.setExpectedNotificationCount,
    apiQueryStartTime: apiState.apiQueryStartTime,
    setApiQueryStartTime: apiState.setApiQueryStartTime,
    setApiError: apiState.setApiError,
    setConversationHistory: apiState.setConversationHistory,
    setNotifications: apiState.setNotifications,
    setAiPendingCommands: apiState.setAiPendingCommands,
    teamLastEventTimeRef: apiState.teamLastEventTimeRef
  });

  // Context value
  const contextValue = {
    // Race state
    ...raceState,
    
    // API state
    ...apiState,
    
    // Race data
    raceTime,
    cars,
    setCars,
    raceFinished,
    updateRace,
    applyStartingGrid,
    
    // Configuration
    apiConfig,
    setApiConfig,
    teamControl,
    setTeamControl,
    
    // Actions
    handleCommandSubmit,
    
    // Constants
    availableTeams
  };

  return (
    <RaceContext.Provider value={contextValue}>
      {children}
    </RaceContext.Provider>
  );
};

export const useRaceContext = () => {
  const context = useContext(RaceContext);
  if (!context) {
    throw new Error('useRaceContext must be used within a RaceProvider');
  }
  return context;
};