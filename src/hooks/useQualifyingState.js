/**
 * Hook managing qualifying session state and functionality
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  QUALIFYING_SESSION_DURATION, 
  TIRE_SETS_PER_DRIVER, 
  QUALIFYING_DRIVER_STATES,
  ATTACK_MODES,
  TIRE_SET_STATUS,
  TRACK_EVOLUTION
} from '../data/constants';
import { DRIVERS } from '../data/constants';
import { driverTeamMapping } from '../data/teamMapping';

export const useQualifyingState = () => {
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(QUALIFYING_SESSION_DURATION);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [paused, setPaused] = useState(false);

  // Track evolution state
  const [trackGrip, setTrackGrip] = useState(TRACK_EVOLUTION.INITIAL_GRIP);
  const sectorsCompletedRef = useRef(0);

  // Driver states and tire management
  const [drivers, setDrivers] = useState(() => 
    DRIVERS.map(driver => ({
      name: driver.name,
      team: driverTeamMapping[driver.name],
      color: driver.color,
      dotColor: driver.dotColor,
      
      // Qualifying specific state
      state: QUALIFYING_DRIVER_STATES.PIT,
      currentAttackMode: ATTACK_MODES.AGGRESSIVE.name,
      selectedTireSet: 0,
      
      // Tire sets (3 per driver, all soft, starting as new)
      tireSets: Array.from({ length: TIRE_SETS_PER_DRIVER }, (_, index) => ({
        id: index,
        status: TIRE_SET_STATUS.NEW,
        condition: 100,
        usageCount: 0
      })),
      
      // Lap timing and results
      bestLapTime: null,
      currentLapStartTime: null,
      lastLapTime: null,
      lastLapValid: true,
      attempts: [],
      
      // Track position
      distanceTraveled: 0,
      currentSpeed: 0,
      
      // Lap phase tracking
      lapPhase: null,
      lapPhaseStartTime: null
    }))
  );

  // Qualifying results and timing
  const [qualifyingResults, setQualifyingResults] = useState([]);
  const [events, setEvents] = useState([]);
  const eventsRef = useRef([]);

  // References for animation loop
  const sessionTimeRef = useRef(QUALIFYING_SESSION_DURATION);
  const lastTimestampRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    eventsRef.current = events;
    sessionTimeRef.current = sessionTime;
  }, [events, sessionTime]);

  // Function to add qualifying events
  const addEvent = useCallback((type, details, timestamp = null) => {
    const eventTime = timestamp || sessionTimeRef.current;
    const minutes = Math.floor((QUALIFYING_SESSION_DURATION - eventTime) / 60);
    const seconds = Math.floor((QUALIFYING_SESSION_DURATION - eventTime) % 60);
    const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    setEvents(prevEvents => {
      const newEvent = { 
        timestamp: timeDisplay, 
        time: eventTime, 
        type, 
        details 
      };
      return [newEvent, ...prevEvents].slice(0, 50); // Keep last 50 events
    });
  }, []);

  // Update track evolution based on time and traffic
  const updateTrackEvolution = useCallback((deltaTime) => {
    setTrackGrip(prevGrip => {
      const timeEvolution = TRACK_EVOLUTION.TIME_FACTOR * deltaTime;
      const trafficEvolution = TRACK_EVOLUTION.TRAFFIC_FACTOR * sectorsCompletedRef.current;
      
      let newGrip = prevGrip + timeEvolution + trafficEvolution;
      
      // Apply logarithmic curve if specified
      if (TRACK_EVOLUTION.EVOLUTION_CURVE === 'logarithmic') {
        const progress = (newGrip - TRACK_EVOLUTION.INITIAL_GRIP) / 
                        (TRACK_EVOLUTION.MAX_GRIP - TRACK_EVOLUTION.INITIAL_GRIP);
        const logProgress = Math.log(1 + progress * 9) / Math.log(10); // Scale 0-1 through log curve
        newGrip = TRACK_EVOLUTION.INITIAL_GRIP + 
                  logProgress * (TRACK_EVOLUTION.MAX_GRIP - TRACK_EVOLUTION.INITIAL_GRIP);
      }
      
      return Math.min(newGrip, TRACK_EVOLUTION.MAX_GRIP);
    });
    
    // Reset sectors completed counter
    sectorsCompletedRef.current = 0;
  }, []);

  // Function to send driver to track
  const sendDriverToTrack = useCallback((driverName, attackMode, tireSetId) => {
    setDrivers(prevDrivers =>
      prevDrivers.map(driver => {
        if (driver.name === driverName && driver.state === QUALIFYING_DRIVER_STATES.PIT) {
          const selectedTireSet = driver.tireSets[tireSetId];
          if (selectedTireSet.condition <= 0) {
            addEvent('error', `${driverName} cannot use tire set ${tireSetId + 1} - completely worn`);
            return driver;
          }
          
          addEvent('qualifying', `${driverName} sent to track on tire set ${tireSetId + 1} (${selectedTireSet.status}) with ${attackMode} mode`);
          
          return {
            ...driver,
            state: QUALIFYING_DRIVER_STATES.OUT_LAP,
            currentAttackMode: attackMode,
            selectedTireSet: tireSetId,
            lapPhase: 'OUT',
            lapPhaseStartTime: sessionTimeRef.current,
            currentLapStartTime: sessionTimeRef.current
          };
        }
        return driver;
      })
    );
  }, [addEvent]);

  // Function to update qualifying results
  const updateQualifyingResults = useCallback(() => {
    const results = drivers
      .filter(driver => driver.bestLapTime !== null)
      .sort((a, b) => a.bestLapTime - b.bestLapTime)
      .map((driver, index) => ({
        position: index + 1,
        name: driver.name,
        team: driver.team,
        color: driver.color,
        bestLapTime: driver.bestLapTime,
        attempts: driver.attempts.length,
        gap: index === 0 ? 0 : driver.bestLapTime - drivers.find(d => d.bestLapTime === Math.min(...drivers.filter(dr => dr.bestLapTime !== null).map(dr => dr.bestLapTime))).bestLapTime
      }));
      
    setQualifyingResults(results);
  }, [drivers]);

  // Update results when drivers change
  useEffect(() => {
    updateQualifyingResults();
  }, [updateQualifyingResults]);

  // Function to start qualifying session
  const startSession = useCallback(() => {
    setSessionActive(true);
    setSessionFinished(false);
    setPaused(false);
    setSessionTime(QUALIFYING_SESSION_DURATION);
    setTrackGrip(TRACK_EVOLUTION.INITIAL_GRIP);
    sectorsCompletedRef.current = 0;
    
    // Reset all drivers to pit
    setDrivers(prevDrivers =>
      prevDrivers.map(driver => ({
        ...driver,
        state: QUALIFYING_DRIVER_STATES.PIT,
        bestLapTime: null,
        attempts: [],
        distanceTraveled: 0,
        currentSpeed: 0,
        lapPhase: null,
        lapPhaseStartTime: null,
        // Reset tire sets to new condition
        tireSets: Array.from({ length: TIRE_SETS_PER_DRIVER }, (_, index) => ({
          id: index,
          status: TIRE_SET_STATUS.NEW,
          condition: 100,
          usageCount: 0
        }))
      }))
    );
    
    setEvents([]);
    setQualifyingResults([]);
    addEvent('session', 'Qualifying session started');
  }, [addEvent]);

  // Function to end qualifying session
  const endSession = useCallback(() => {
    setSessionActive(false);
    setSessionFinished(true);
    setPaused(true);
    addEvent('session', 'Qualifying session finished');
  }, [addEvent]);

  // Function to increment sectors completed (for track evolution)
  const incrementSectorsCompleted = useCallback(() => {
    sectorsCompletedRef.current += 1;
  }, []);

  return {
    // Session state
    sessionActive,
    sessionTime,
    sessionFinished,
    paused,
    setPaused,
    
    // Track evolution
    trackGrip,
    updateTrackEvolution,
    incrementSectorsCompleted,
    
    // Driver management
    drivers,
    setDrivers,
    sendDriverToTrack,
    
    // Results and events
    qualifyingResults,
    events,
    eventsRef,
    addEvent,
    
    // Session control
    startSession,
    endSession,
    
    // Refs for animation
    sessionTimeRef,
    lastTimestampRef,
    
    // State setters
    setSessionTime,
    setSessionFinished
  };
};