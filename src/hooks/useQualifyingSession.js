/**
 * Hook managing qualifying session logic and state machine
 */
import { useCallback, useEffect } from 'react';
import { 
  QUALIFYING_DRIVER_STATES,
  QUALIFYING_LAP_SPEEDS,
  QUALIFYING_TIRE_WEAR,
  ATTACK_MODES,
  TIRE_TYPES,
  TIRE_SET_STATUS,
  FOLLOWING_PENALTY
} from '../data/constants';

export const useQualifyingSession = ({
  sessionActive,
  sessionTime,
  sessionTimeRef,
  lastTimestampRef,
  paused,
  drivers,
  setDrivers,
  setSessionTime,
  setSessionFinished,
  addEvent,
  trackGrip,
  updateTrackEvolution,
  incrementSectorsCompleted,
  pathLength
}) => {

  // Update driver positions and handle state machine
  const updateDriverPositions = useCallback((drivers, deltaTime) => {
    return drivers.map(driver => {
      if (driver.state === QUALIFYING_DRIVER_STATES.PIT) {
        return driver;
      }

      let updatedDriver = { ...driver };
      let currentSpeed = 0;
      let tireWear = 0;

      // Determine speed and tire wear based on current state/phase
      switch (driver.state) {
        case QUALIFYING_DRIVER_STATES.OUT_LAP:
          currentSpeed = QUALIFYING_LAP_SPEEDS.OUT_LAP;
          tireWear = QUALIFYING_TIRE_WEAR.OUT_LAP;
          break;
          
        case QUALIFYING_DRIVER_STATES.PUSH_LAP:
          // Base speed from soft tires + track evolution + attack mode bonus
          const attackMode = ATTACK_MODES[driver.currentAttackMode.toUpperCase().replace(/\s+/g, '_')];
          currentSpeed = TIRE_TYPES.SOFT.speed * trackGrip + (attackMode?.speedBonus || 0);
          tireWear = QUALIFYING_TIRE_WEAR.PUSH_LAP_BASE * (attackMode?.wearMultiplier || 1);
          
          // Check for error on push lap
          if (attackMode && Math.random() < attackMode.errorRisk * deltaTime) {
            addEvent('error', `${driver.name} made an error - lap time invalidated`);
            updatedDriver.lastLapValid = false;
            // Transition to IN lap immediately
            updatedDriver.state = QUALIFYING_DRIVER_STATES.IN_LAP;
            updatedDriver.lapPhase = 'IN';
            updatedDriver.lapPhaseStartTime = sessionTimeRef.current;
          }
          break;
          
        case QUALIFYING_DRIVER_STATES.IN_LAP:
          currentSpeed = QUALIFYING_LAP_SPEEDS.IN_LAP;
          tireWear = QUALIFYING_TIRE_WEAR.IN_LAP;
          break;
          
        default:
          currentSpeed = 0;
      }

      // Apply traffic penalty if close to other cars
      const otherCars = drivers.filter(d => d.name !== driver.name && d.state !== QUALIFYING_DRIVER_STATES.PIT);
      const currentNormalizedDistance = ((driver.distanceTraveled % pathLength) + pathLength) % pathLength;
      
      for (const otherCar of otherCars) {
        const otherNormalizedDistance = ((otherCar.distanceTraveled % pathLength) + pathLength) % pathLength;
        let gap = Math.abs(currentNormalizedDistance - otherNormalizedDistance);
        gap = Math.min(gap, pathLength - gap); // Consider circular track
        
        if (gap < 25) { // Within traffic range
          currentSpeed -= FOLLOWING_PENALTY;
          break;
        }
      }

      // Update distance traveled
      const newDistance = driver.distanceTraveled + currentSpeed * deltaTime;
      const oldNormalizedDistance = ((driver.distanceTraveled % pathLength) + pathLength) % pathLength;
      const newNormalizedDistance = ((newDistance % pathLength) + pathLength) % pathLength;

      // Check for lap completion (crossing finish line)
      if (oldNormalizedDistance > newNormalizedDistance && pathLength > 0) {
        incrementSectorsCompleted();
        
        // Handle state transitions on lap completion
        switch (driver.state) {
          case QUALIFYING_DRIVER_STATES.OUT_LAP:
            // Transition to PUSH lap
            updatedDriver.state = QUALIFYING_DRIVER_STATES.PUSH_LAP;
            updatedDriver.lapPhase = 'PUSH';
            updatedDriver.lapPhaseStartTime = sessionTimeRef.current;
            updatedDriver.currentLapStartTime = sessionTimeRef.current;
            addEvent('qualifying', `${driver.name} starting push lap with ${driver.currentAttackMode} mode`);
            break;
            
          case QUALIFYING_DRIVER_STATES.PUSH_LAP:
            // Record lap time and transition to IN lap
            const lapTime = sessionTimeRef.current - driver.currentLapStartTime;
            const isValid = updatedDriver.lastLapValid !== false;
            
            if (isValid) {
              updatedDriver.lastLapTime = lapTime;
              
              // Update best lap time if this is better
              if (!driver.bestLapTime || lapTime < driver.bestLapTime) {
                updatedDriver.bestLapTime = lapTime;
                addEvent('timing', `${driver.name} sets new personal best: ${lapTime.toFixed(3)}s`);
              }
              
              // Add to attempts
              updatedDriver.attempts = [...driver.attempts, {
                lapTime,
                attackMode: driver.currentAttackMode,
                tireSet: driver.selectedTireSet,
                trackGrip,
                sessionTime: sessionTimeRef.current,
                valid: true
              }];
            } else {
              // Invalid lap
              updatedDriver.attempts = [...driver.attempts, {
                lapTime: null,
                attackMode: driver.currentAttackMode,
                tireSet: driver.selectedTireSet,
                trackGrip,
                sessionTime: sessionTimeRef.current,
                valid: false
              }];
            }
            
            // Transition to IN lap
            updatedDriver.state = QUALIFYING_DRIVER_STATES.IN_LAP;
            updatedDriver.lapPhase = 'IN';
            updatedDriver.lapPhaseStartTime = sessionTimeRef.current;
            updatedDriver.lastLapValid = true; // Reset for next attempt
            break;
            
          case QUALIFYING_DRIVER_STATES.IN_LAP:
            // Return to pit
            updatedDriver.state = QUALIFYING_DRIVER_STATES.PIT;
            updatedDriver.lapPhase = null;
            updatedDriver.lapPhaseStartTime = null;
            updatedDriver.distanceTraveled = 0; // Reset position to pit
            addEvent('qualifying', `${driver.name} returned to pit`);
            break;
        }
      }

      // Apply tire wear to selected tire set
      if (driver.state !== QUALIFYING_DRIVER_STATES.PIT && tireWear > 0) {
        const tireSetIndex = driver.selectedTireSet;
        if (tireSetIndex >= 0 && tireSetIndex < driver.tireSets.length) {
          const updatedTireSets = [...driver.tireSets];
          const currentTireSet = { ...updatedTireSets[tireSetIndex] };
          
          currentTireSet.condition = Math.max(0, currentTireSet.condition - tireWear * deltaTime);
          
          // Mark tire set as used after any track time
          if (currentTireSet.status === TIRE_SET_STATUS.NEW) {
            currentTireSet.status = TIRE_SET_STATUS.USED;
            currentTireSet.usageCount = 1;
          }
          
          updatedTireSets[tireSetIndex] = currentTireSet;
          updatedDriver.tireSets = updatedTireSets;
        }
      }

      return {
        ...updatedDriver,
        distanceTraveled: newDistance,
        currentSpeed
      };
    });
  }, [addEvent, sessionTimeRef, trackGrip, incrementSectorsCompleted, pathLength]);

  // Main update function for qualifying session
  const updateQualifyingSession = useCallback((timestamp) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
      return;
    }
    
    if (paused) {
      lastTimestampRef.current = timestamp;
      return;
    }

    const deltaTime = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    // Update session time
    const newSessionTime = Math.max(0, sessionTime - deltaTime);
    setSessionTime(newSessionTime);

    // Check if session should end
    if (newSessionTime <= 0 && sessionActive) {
      // Allow drivers currently on push laps to finish
      const driversOnPushLap = drivers.filter(d => d.state === QUALIFYING_DRIVER_STATES.PUSH_LAP);
      if (driversOnPushLap.length === 0) {
        setSessionFinished(true);
        addEvent('session', 'Qualifying session ended');
        return;
      }
    }

    // Update track evolution
    updateTrackEvolution(deltaTime);

    // Update driver positions and states
    setDrivers(prevDrivers => updateDriverPositions(prevDrivers, deltaTime));

  }, [
    sessionTime, 
    sessionActive, 
    paused, 
    drivers, 
    setSessionTime, 
    setSessionFinished, 
    addEvent, 
    updateTrackEvolution, 
    updateDriverPositions, 
    setDrivers
  ]);

  // Animation loop for qualifying session
  useEffect(() => {
    if (!sessionActive || pathLength <= 0) return;
    
    let animationId;
    const animate = (timestamp) => {
      updateQualifyingSession(timestamp);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [sessionActive, pathLength, updateQualifyingSession]);

  return {
    updateQualifyingSession
  };
};