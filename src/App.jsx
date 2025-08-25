// Core React imports and custom hooks
import { useState, useEffect } from 'react';
import { usePendingCommands } from './hooks/usePendingCommands';
import { useRaceState } from './hooks/useRaceState';
import { useApiState } from './hooks/useApiState';
import { useCommandHandler } from './hooks/useCommandHandler';
import { useRace } from './hooks/useRace';
import "@fontsource/titillium-web/400.css";
import "@fontsource/titillium-web/600.css";
import "@fontsource/titillium-web/700.css";
import './App.css';

// Components
import PreRaceSetup from './components/PreRaceSetup';
import RaceInterface from './components/RaceInterface';
import ExitConfirmationModal from './components/ExitConfirmationModal';
import ApiErrorBanner from './components/ApiErrorBanner';

// Data and services
import { teamColors, availableTeams, defaultTeamControl } from './data/teamMapping';
import { useApiConfig, useTeamApi } from './services/aiService';

const App = () => {
  // Use custom hooks for state management
  const raceState = useRaceState();
  const apiState = useApiState();
  
  // API configuration hook
  const [apiConfig, setApiConfig] = useApiConfig();

  // Team control configuration (player vs AI)
  const [teamControl, setTeamControl] = useState(defaultTeamControl);

  // Update refs when state changes
  useEffect(() => {
    apiState.pendingCommandsRef.current = apiState.pendingCommands;
  }, [apiState.pendingCommands]);
  
  useEffect(() => {
    apiState.conversationHistoryRef.current = apiState.conversationHistory;
  }, [apiState.conversationHistory]);
  


  // Hook wyścigu
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


  // Pomiar długości toru (po załadowaniu SVG i rozpoczęciu wyścigu)
  useEffect(() => {
    if (raceState.setupComplete && raceState.pathRef.current) {
      raceState.setPathLength(raceState.pathRef.current.getTotalLength());
    }
  }, [raceState.setupComplete, raceState.pathRef, raceState.setPathLength]);

  // Główna pętla animacji with pause support
  useEffect(() => {
    if (!raceState.setupComplete || raceState.pathLength <= 0) return;
    
    let animationId;
    const animate = (timestamp) => {
      if (raceState.paused) {
        updateRace(timestamp, true);
      } else {
        updateRace(timestamp);
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [raceState.setupComplete, raceState.pathLength, updateRace, raceState.paused]);



  // Aktualizacja refów przy zmianie stanów
  useEffect(() => {
    raceState.raceTimeRef.current = raceTime;
  }, [raceTime, raceState.raceTimeRef]);

  // Add warning before closing/refreshing page during race
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (raceState.setupComplete && !raceState.showResults) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the race? Progress will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [raceState.setupComplete, raceState.showResults]);




  // Show results after delay when race finishes
  useEffect(() => {
    if (raceFinished) {
      const timer = setTimeout(() => {
        raceState.setPaused(true);
        raceState.setShowResults(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [raceFinished, raceState]);

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



  const handleRaceStart = (grid, apiPromises = []) => {
    applyStartingGrid(grid);
    raceState.setSetupComplete(true);
    raceState.setPaused(true);

    if (apiPromises.length > 0) {
      apiState.setApiResponsesPending(true);
      apiState.setExpectedNotificationCount(apiState.notifications.length + apiPromises.length);
      apiState.setApiQueryStartTime(Date.now());
      apiState.setApiError(null);

      Promise.all(apiPromises).catch(error => {
        console.error("Error while sending API requests:", error);
      });
    }
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="app-container">
        <div className="p-4" style={{ width: '100%', paddingLeft: 0 }}>
          {!raceState.setupComplete ? (
            <PreRaceSetup
              availableTeams={availableTeams}
              teamControl={teamControl}
              setTeamControl={setTeamControl}
              cars={cars}
              setCars={setCars}
              conversationHistory={apiState.conversationHistory}
              setConversationHistory={apiState.setConversationHistory}
              apiConfig={apiConfig}
              setApiConfig={setApiConfig}
              apiError={apiState.apiError}
              setApiError={apiState.setApiError}
              isApiConfigModalOpen={apiState.isApiConfigModalOpen}
              setIsApiConfigModalOpen={apiState.setIsApiConfigModalOpen}
              setNotifications={apiState.setNotifications}
              setAiPendingCommands={apiState.setAiPendingCommands}
              teamLastEventTimeRef={apiState.teamLastEventTimeRef}
              pathLength={raceState.pathLength}
              onRaceStart={handleRaceStart}
            />
          ) : (
            <>
              <div className="race-nav-bar">
                <ApiErrorBanner 
                  error={apiState.apiError} 
                  onDismiss={() => apiState.setApiError(null)}
                />
              </div>
              
              <RaceInterface
                cars={cars}
                raceTime={raceTime}
                pathRef={raceState.pathRef}
                pathLength={raceState.pathLength}
                events={raceState.events}
                paused={raceState.paused}
                setPaused={raceState.setPaused}
                showResults={raceState.showResults}
                highlightedDriver={raceState.highlightedDriver}
                setHighlightedDriver={raceState.setHighlightedDriver}
                handleCommandSubmit={handleCommandSubmit}
                onExitToMenu={() => raceState.setShowExitConfirmation(true)}
                apiResponsesPending={apiState.apiResponsesPending}
                aiPendingCommands={apiState.aiPendingCommands}
                notifications={apiState.notifications}
                selectedNotification={apiState.selectedNotification}
                setSelectedNotification={apiState.setSelectedNotification}
                isModalOpen={apiState.isModalOpen}
                setIsModalOpen={apiState.setIsModalOpen}
                setNotificationPause={apiState.setNotificationPause}
                availableTeams={availableTeams}
                teamControl={teamControl}
                teamColors={teamColors}
              />
            </>
          )}
        </div>
        
        <ExitConfirmationModal
          isOpen={raceState.showExitConfirmation}
          onCancel={() => raceState.setShowExitConfirmation(false)}
          onConfirm={raceState.handleExitToMenu}
        />
      </div>
    </div>
  );
};

export default App;
