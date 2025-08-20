/**
 * Hook managing race state and related functionality
 */
import { useState, useRef, useEffect } from 'react';

export const useRaceState = () => {
  // Track and race state
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [paused, setPaused] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);

  // Driver highlighting state
  const [highlightedDriver, setHighlightedDriver] = useState(null);

  // Exit to menu confirmation modal
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Race events and command management
  const [events, setEvents] = useState([]);
  const eventsRef = useRef([]);
  const raceTimeRef = useRef(0);
  const previousRankingRef = useRef([]);

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Function to add race events
  const addEvent = (type, details, raceTime) => {
    const minutes = Math.floor(raceTime / 60);
    const seconds = Math.floor(raceTime % 60);
    const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    setEvents(prevEvents => {
      // Check if event with same type and details already exists
      const existingEvent = prevEvents.find(event =>
        event.type === type && event.details === details
      );
      
      if (!existingEvent) {
        const newEvents = [{ timestamp, time: raceTime, type, details }, ...prevEvents].slice(0, 30);
        return newEvents;
      }
      return prevEvents;
    });
  };

  // Function to handle exit to menu
  const handleExitToMenu = () => {
    setShowExitConfirmation(false);
    setSetupComplete(false);
    setPaused(true);
    setShowResults(false);
    setEvents([]);
    setRaceFinished(false);
  };

  return {
    // State
    pathRef,
    pathLength,
    setPathLength,
    showResults,
    setShowResults,
    paused,
    setPaused,
    setupComplete,
    setSetupComplete,
    raceFinished,
    setRaceFinished,
    highlightedDriver,
    setHighlightedDriver,
    showExitConfirmation,
    setShowExitConfirmation,
    events,
    setEvents,
    
    // Refs
    eventsRef,
    raceTimeRef,
    previousRankingRef,
    
    // Functions
    addEvent,
    handleExitToMenu
  };
};