// Core React imports and custom hooks
import { useState, useEffect } from 'react';
import { usePendingCommands } from './hooks/usePendingCommands';
import { useRaceState } from './hooks/useRaceState';
import { useApiState } from './hooks/useApiState';
import { useCommandHandler } from './hooks/useCommandHandler';
import "@fontsource/titillium-web/400.css";
import "@fontsource/titillium-web/600.css";
import "@fontsource/titillium-web/700.css";
import PreRaceMenu from './components/PreRaceMenu';
import TeamControls from './components/TeamControls';
import { useRace } from './hooks/useRace';
import './App.css';
import { trackPoints, MAX_LAPS } from './data/constants';
import { defaultPathLength } from './data/teamPrompts';
import { RaceTrack } from './components/RaceTrack';
import { Scoreboard } from './components/Scoreboard';
import { teamColors, availableTeams, defaultTeamControl } from './data/teamMapping';
import ApiConfigModal from './components/ApiConfigModal';
import { useApiConfig, useTeamApi, generateAIStrategy, sendTeamQuery } from './services/aiService';

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

  // Dodanie ostrzeżenia przed zamknięciem/odświeżeniem strony podczas wyścigu
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (raceState.setupComplete && !raceState.showResults) {
        e.preventDefault();
        e.returnValue = 'Czy na pewno chcesz opuścić wyścig? Postęp zostanie utracony.';
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



  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="app-container">
        <div className="p-4" style={{ width: '100%', paddingLeft: 0 }}>
        {!raceState.setupComplete ? (
          <>
            <PreRaceMenu
              availableTeams={availableTeams}
              teamControl={teamControl}
              setTeamControl={setTeamControl}
              cars={cars}
              setCars={setCars}
              onGenerateAIStrategy={(team, startingGrid) =>
                generateAIStrategy(team, startingGrid, apiConfig, apiState.setApiError, setCars, apiState.setConversationHistory, setTeamControl)
              }
              conversationHistory={apiState.conversationHistory}
              onOpenApiConfig={() => apiState.setIsApiConfigModalOpen(true)}
              apiError={apiState.apiError}
              setApiError={apiState.setApiError}
              onStartRace={(grid) => {
                applyStartingGrid(grid);
                raceState.setSetupComplete(true);
                raceState.setPaused(true);

                const aiTeams = availableTeams.filter(team => teamControl[team].type === "ai");
                if (aiTeams.length > 0) {
                  apiState.setApiResponsesPending(true);
                  apiState.setExpectedNotificationCount(apiState.notifications.length + aiTeams.length);
                  apiState.setApiQueryStartTime(Date.now());

                  const scoreboardVal = grid.map((gridItem, index) => ({
                    name: gridItem.name,
                    tires: gridItem.tires,
                    laps: 0,
                    distanceTraveled: gridItem.distanceTraveled,
                    position: index + 1,
                    interval: 0,
                    status: "Racing",
                    tireHistory: [gridItem.tires.name],
                    pathLength: raceState.pathLength
                  }));

                  apiState.setApiError(null);


                  Promise.all(
                    aiTeams.map(team => sendTeamQuery({
                      team,
                      scoreboardVal,
                      eventsVal: [],
                      raceTimeVal: 0,
                      conversationHistoryVal: apiState.conversationHistoryRef.current,
                      isInitial: true,
                      apiConfig,
                      setApiError: apiState.setApiError,
                      setConversationHistory: apiState.setConversationHistory,
                      setNotifications: apiState.setNotifications,
                      setAiPendingCommands: apiState.setAiPendingCommands,
                      teamLastEventTimeRef: apiState.teamLastEventTimeRef,
                      pathLength: defaultPathLength // Use the computed default path length
                    }))
                  ).catch(error => {
                    console.error("Error while sending API requests:", error);
                  });
                }
              }}
            />
            <ApiConfigModal
              isOpen={apiState.isApiConfigModalOpen}
              onClose={() => apiState.setIsApiConfigModalOpen(false)}
              apiConfig={apiConfig}
              setApiConfig={setApiConfig}
              availableTeams={availableTeams}
            />
          </>
        ) : (
          <>
        <div className="layout-container">
          <div className="race-nav-bar">
            {apiState.apiError && (
              <div className="api-error-banner" style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{apiState.apiError}</span>
                <button 
                  onClick={() => apiState.setApiError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div>
            <RaceTrack
              trackPoints={trackPoints}
              cars={cars}
              pathRef={raceState.pathRef}
              pathLength={raceState.pathLength}
              paused={raceState.paused}
              setPaused={raceState.setPaused}
              setIsModalOpen={(isOpen) => {
                apiState.setIsModalOpen(isOpen);
                if (!isOpen) {
                  apiState.setSelectedNotification(null);
                }
              }}
              notifications={apiState.notifications}
              setSelectedNotification={apiState.setSelectedNotification}
              setNotificationPause={apiState.setNotificationPause}
              wasPaused={raceState.paused}
              availableTeams={availableTeams}
              selectedNotification={apiState.selectedNotification}
              teamColors={teamColors}
              apiResponsesPending={apiState.apiResponsesPending}
              aiPendingCommands={apiState.aiPendingCommands}
              isModalOpen={apiState.isModalOpen}
              raceTime={raceTime}
              highlightedDriver={raceState.highlightedDriver}
              setHighlightedDriver={raceState.setHighlightedDriver}
            />
          </div>

          <div className="card p-2">
            <Scoreboard 
              cars={cars}
              pathLength={raceState.pathLength}
              currentLap={cars[0]?.laps || 0}
              maxLaps={MAX_LAPS}
              raceTime={raceTime}
              showResults={raceState.showResults}
              availableTeams={availableTeams}
              events={raceState.events}
              onExitToMenu={() => raceState.setShowExitConfirmation(true)}
              highlightedDriver={raceState.highlightedDriver}
              setHighlightedDriver={raceState.setHighlightedDriver}
            />
          </div>
        </div>
        
        {/* Zastępujemy bezpośrednie renderowanie TireManager przez zoptymalizowany TeamControls */}
        <TeamControls
          availableTeams={availableTeams}
          cars={cars}
          teamControl={teamControl}
          handleCommandSubmit={handleCommandSubmit}
          paused={raceState.paused}
          highlightedDriver={raceState.highlightedDriver}
          setHighlightedDriver={raceState.setHighlightedDriver}
        />

        {/* Exit to Menu Confirmation Modal */}
        {raceState.showExitConfirmation && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '15%',
            zIndex: 1000
          }}>
            <div className="modal-content" style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              padding: '20px',
              width: '400px',
              maxWidth: '90%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #333'
            }}>
              <h3 style={{ marginTop: 0 }}>Exit to Menu?</h3>
              <p>Are you sure you want to exit to the main menu? All race progress will be lost. To start a new race and clear all data (including conversation history with the models), please refresh your browser. </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={() => raceState.setShowExitConfirmation(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={raceState.handleExitToMenu}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Exit to Menu
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default App;
