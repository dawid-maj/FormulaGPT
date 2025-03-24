// Core React imports and custom hooks
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRaceAudio } from './hooks/useRaceAudio';
import { usePendingCommands } from './hooks/usePendingCommands';
import { useCommandHandler } from './hooks/useCommandHandler';
import "@fontsource/titillium-web/400.css";
import "@fontsource/titillium-web/600.css";
import "@fontsource/titillium-web/700.css";
import PreRaceMenu from './components/PreRaceMenu';
import TeamControls from './components/TeamControls';
import { useRace } from './hooks/useRace';
import './App.css';
import { NotificationsModal } from './components/NotificationsModal';
import { trackPoints, TIRE_TYPES, DRIVERS, MAX_LAPS } from './data/constants';
import { defaultPathLength } from './data/teamPrompts';
import { RaceTrack } from './components/RaceTrack';
import { Scoreboard } from './components/Scoreboard';
import { EventsPanel } from './components/EventsPanel';
import { teamMapping, teamColors, availableTeams, defaultTeamControl, driverTeamMapping } from './data/teamMapping';
import ApiConfigModal from './components/ApiConfigModal';
import { useApiConfig, useTeamApi, generateAIStrategy, sendTeamQuery } from './services/aiService';

const App = () => {

  // Track and race state
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [paused, setPaused] = useState(false);
  
  // Team and command management
  const [copiedTeam, setCopiedTeam] = useState(null);
  const [conversationHistory, setConversationHistory] = useState({});
  const [pendingCommands, setPendingCommands] = useState([]);
  const [aiPendingCommands, setAiPendingCommands] = useState([]); // Queue for AI commands awaiting execution
  
  // Notification system states
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationPause, setNotificationPause] = useState(false);
  
  // API interaction states
  const [apiResponsesPending, setApiResponsesPending] = useState(false);
  const [lastApiTriggerLap, setLastApiTriggerLap] = useState(0);
  const [expectedNotificationCount, setExpectedNotificationCount] = useState(null);
  const [apiQueryStartTime, setApiQueryStartTime] = useState(null);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // API configuration hook
  const [apiConfig, setApiConfig] = useApiConfig();

  // Team control configuration (player vs AI)
  const [teamControl, setTeamControl] = useState(defaultTeamControl);

  // Race setup state
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Exit to menu confirmation modal
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  // Driver highlighting state
  const [highlightedDriver, setHighlightedDriver] = useState(null);


  // Race events and command management
  const [events, setEvents] = useState([]);  // Race events log
  const eventsRef = useRef([]);              // Ref for events to avoid stale closures
  const pendingCommandsRef = useRef(pendingCommands); // Ref for pending commands

  useEffect(() => {
    pendingCommandsRef.current = pendingCommands;
  }, [pendingCommands]);
  const raceTimeRef = useRef(0);
  const conversationHistoryRef = useRef({});
  const previousRankingRef = useRef([]);
  const teamApiCooldownRef = useRef({});
  const teamApiLastLapRef = useRef({});
  const teamLastEventTimeRef = useRef({});
  
  // Initialize race audio
  //useRaceAudio(paused, setupComplete);

  // Funkcja dodająca nowy event, korzysta z funkcjonalnej aktualizacji stanu
  const addEvent = (type, details) => {
    const minutes = Math.floor(raceTime / 60);
    const seconds = Math.floor(raceTime % 60);
    const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    setEvents(prevEvents => {
      // Sprawdzamy, czy istnieje event o tym samym type i details
      const existingEvent = prevEvents.find(event =>
        event.type === type &&
        event.details === details
      );
      // Jeśli nie ma, to dodajemy
      if (!existingEvent) {
        const newEvents = [{ timestamp, time: raceTimeRef.current, type, details }, ...prevEvents].slice(0, 30);
        return newEvents;
      }
      // W przeciwnym razie – nie dodajemy duplikatu
      return prevEvents;
    });
  };

  // Hook wyścigu
  const { raceTime, cars, setCars, raceFinished, setRaceFinished, updateRace, applyStartingGrid } = useRace({
    pathLength,
    addEvent,
    previousRankingRef,
    paused,
    setPaused,
    setupComplete,
    teamControl,
    initialCars: null
  });

  // Actual command submission function that uses setCars directly
  // Używamy useCallback, aby funkcja nie była tworzona na nowo przy każdym renderowaniu
  const handleCommandSubmit = useCallback((e, cmdString, sourceTeam) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const inputCommand = (typeof cmdString === "string") ? cmdString : "";
    //console.log("Processing command:", inputCommand);
    
    // Split into individual commands by semicolon
    const commands = inputCommand
      .replace(/["']/g, "") // remove quotes
      .toLowerCase()
      .split(/[;,]/)
      .filter(cmd => cmd.trim());
    
    commands.forEach(cmd => {
      const [driver, action, param] = cmd.trim().split(" ");
      
      // Validate team ownership of driver
      if (sourceTeam && !teamMapping[sourceTeam].includes(driver.toUpperCase())) {
        console.warn(`Ignoring command "${cmd}" - driver ${driver} doesn't belong to team ${sourceTeam}`);
        return;
      }
      
      if (action === "push" || action === "conserve" || action === "normal") {
        setCars(prevCars => prevCars.map(car => {
          if (car.name.toLowerCase().startsWith(driver)) {
            return {
              ...car,
              drivingStyle: action,
              styleUntil: action === "normal" ? null : raceTimeRef.current + 30
            };
          }
          return car;
        }));
      } else if (action === "pit" && pathLength > 0) {
        if (param === "cancel") {
          setCars(prevCars => prevCars.map(car => {
            if (car.name.toLowerCase().startsWith(driver) && car.status === "Box Called") {
              addEvent("pit", `${car.name} pit stop cancelled`);
              return {
                ...car,
                scheduledPitStop: null,
                status: "Racing",
                pitCallLap: null
              };
            }
            return car;
          }));
        } else if (["soft", "medium", "hard"].includes(param)) {
          setCars(prevCars => prevCars.map(car => {
            if (car.name.toLowerCase().startsWith(driver)) {
              if (car.status === "Pit Entry" || car.status === "Pit Exit") {
                addEvent("pit", `${car.name} cannot cancel pit stop - already in pit lane`);
                return car;
              }
              const normalizedDistance = ((car.distanceTraveled % pathLength) + pathLength) % pathLength;
              // If car is just before finish line (≥ pathLength - 100), pit stop happens on next lap
              const pitCallLap = (normalizedDistance >= pathLength - 100)
                ? car.laps + 1
                : car.laps;
              return {
                ...car,
                scheduledPitStop: param.toUpperCase(),
                status: "Box Called",
                pitCallLap: pitCallLap,
              };
            }
            return car;
          }));
        }
      }
    });
  }, [pathLength, setCars, addEvent, raceTimeRef]);

  // Ref do przechowywania stanu samochodów (dla scoreboarda)
  const carsRef = useRef(cars);
  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  // Pomiar długości toru (po załadowaniu SVG i rozpoczęciu wyścigu)
  useEffect(() => {
    if (setupComplete && pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [setupComplete]);

  // Główna pętla animacji with pause support
  useEffect(() => {
    if (!setupComplete || pathLength <= 0) return;
    
    let animationId;
    const animate = (timestamp) => {
      if (paused) {
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
  }, [setupComplete, pathLength, updateRace, paused]);



  // Aktualizacja refów przy zmianie stanów
  useEffect(() => {
    raceTimeRef.current = raceTime;
  }, [raceTime]);

  // Dodanie ostrzeżenia przed zamknięciem/odświeżeniem strony podczas wyścigu
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (setupComplete && !showResults) {
        e.preventDefault();
        e.returnValue = 'Czy na pewno chcesz opuścić wyścig? Postęp zostanie utracony.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [setupComplete, showResults]);



  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  // Show results after delay when race finishes
  useEffect(() => {
    if (raceFinished) {
      const timer = setTimeout(() => {
        setPaused(true);
        setShowResults(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [raceFinished]);

  usePendingCommands({
    pendingCommands,
    setPendingCommands,
    aiPendingCommands,
    setAiPendingCommands,
    paused,
    setupComplete,
    pathLength,
    handleCommandSubmit
  });

  useTeamApi({
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
  });

  // Function to handle exit to menu
  const handleExitToMenu = () => {
    setShowExitConfirmation(false);
    setSetupComplete(false);
    setPaused(true);
    setShowResults(false);
    setEvents([]);
    setRaceFinished(false);
    // Reset any other necessary state
  };


  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="app-container">
        <div className="p-4" style={{ width: '100%', paddingLeft: 0 }}>
        {!setupComplete ? (
          <>
            <PreRaceMenu
              availableTeams={availableTeams}
              teamControl={teamControl}
              setTeamControl={setTeamControl}
              cars={cars}
              setCars={setCars}
              onGenerateAIStrategy={(team, startingGrid) =>
                generateAIStrategy(team, startingGrid, apiConfig, setApiError, setCars, setConversationHistory, setTeamControl)
              }
              conversationHistory={conversationHistory}
              onOpenApiConfig={() => setIsApiConfigModalOpen(true)}
              apiError={apiError}
              setApiError={setApiError}
              onStartRace={(grid) => {
                applyStartingGrid(grid);
                setSetupComplete(true);
                setPaused(true);

                const aiTeams = availableTeams.filter(team => teamControl[team].type === "ai");
                if (aiTeams.length > 0) {
                  setApiResponsesPending(true);
                  setExpectedNotificationCount(notifications.length + aiTeams.length);
                  setApiQueryStartTime(Date.now());

                  const scoreboardVal = grid.map((gridItem, index) => ({
                    name: gridItem.name,
                    tires: gridItem.tires,
                    laps: 0,
                    distanceTraveled: gridItem.distanceTraveled,
                    position: index + 1,
                    interval: 0,
                    status: "Racing",
                    tireHistory: [gridItem.tires.name],
                    pathLength
                  }));

                  setApiError(null);

                  //console.log('Conversation history for initial API query:', conversationHistoryRef.current);

                  Promise.all(
                    aiTeams.map(team => sendTeamQuery({
                      team,
                      scoreboardVal,
                      eventsVal: [],
                      raceTimeVal: 0,
                      conversationHistoryVal: conversationHistoryRef.current,
                      isInitial: true,
                      apiConfig,
                      setApiError,
                      setConversationHistory,
                      setNotifications,
                      setAiPendingCommands,
                      teamLastEventTimeRef,
                      pathLength: defaultPathLength // Use the computed default path length
                    }))
                  ).catch(error => {
                    console.error("Error while sending API requests:", error);
                  });
                }
              }}
            />
            <ApiConfigModal
              isOpen={isApiConfigModalOpen}
              onClose={() => setIsApiConfigModalOpen(false)}
              apiConfig={apiConfig}
              setApiConfig={setApiConfig}
              availableTeams={availableTeams}
            />
          </>
        ) : (
          <>
        <div className="layout-container">
          <div className="race-nav-bar">
            {apiError && (
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
                <span>{apiError}</span>
                <button 
                  onClick={() => setApiError(null)}
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
              pathRef={pathRef}
              pathLength={pathLength}
              paused={paused}
              setPaused={setPaused}
              setIsModalOpen={(isOpen) => {
                setIsModalOpen(isOpen);
                if (!isOpen) {
                  setSelectedNotification(null);
                }
              }}
              notifications={notifications}
              setSelectedNotification={setSelectedNotification}
              setNotificationPause={setNotificationPause}
              wasPaused={paused}
              availableTeams={availableTeams}
              selectedNotification={selectedNotification}
              teamColors={teamColors}
              apiResponsesPending={apiResponsesPending}
              aiPendingCommands={aiPendingCommands} // Przekazujemy informację o oczekujących komendach AI
              isModalOpen={isModalOpen}
              raceTime={raceTime}
              highlightedDriver={highlightedDriver}
              setHighlightedDriver={setHighlightedDriver}
            />
          </div>

          <div className="card p-2">
            <Scoreboard 
              cars={cars}
              pathLength={pathLength}
              currentLap={cars[0]?.laps || 0}
              maxLaps={MAX_LAPS}
              raceTime={raceTime}
              showResults={showResults}
              availableTeams={availableTeams}
              events={events}
              onExitToMenu={() => setShowExitConfirmation(true)}
              highlightedDriver={highlightedDriver}
              setHighlightedDriver={setHighlightedDriver}
            />
          </div>
        </div>
        
        {/* Zastępujemy bezpośrednie renderowanie TireManager przez zoptymalizowany TeamControls */}
        <TeamControls
          availableTeams={availableTeams}
          cars={cars}
          teamControl={teamControl}
          handleCommandSubmit={handleCommandSubmit}
          paused={paused}
          highlightedDriver={highlightedDriver}
          setHighlightedDriver={setHighlightedDriver}
        />

        {/* Exit to Menu Confirmation Modal */}
        {showExitConfirmation && (
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
                  onClick={() => setShowExitConfirmation(false)}
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
                  onClick={handleExitToMenu}
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
