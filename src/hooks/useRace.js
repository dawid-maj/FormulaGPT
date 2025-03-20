import { useRef, useState, useEffect } from 'react';
import { TIRE_TYPES, MAX_LAPS, PITLANE_LENGTH, PITLANE_SPEED, DRIVING_STYLES, FOLLOWING_PENALTY, DRIVERS } from '../data/constants';
import { driverTeamMapping } from '../data/teamMapping';

const createInitialCars = (teamControl) => {
  return DRIVERS.map((driver) => {
    const initialTire = driver => {
      const team = driverTeamMapping[driver.name];
      if (teamControl[team]?.type === "player") {
        return { ...TIRE_TYPES.MEDIUM, condition: 100, type: "MEDIUM" };
      }
      return { type: "", name: '?', condition: 100, color: '#666666' };
    };
    const tires = initialTire(driver);
    return {
      name: driver.name,
      color: driver.color,
      dotColor: driver.dotColor,
      team: driverTeamMapping[driver.name],
      distanceTraveled: -25 - (20 * DRIVERS.indexOf(driver)),
      tires: tires,
      tireHistory: [tires.name],
      laps: 0,
      inPitStop: false,
      scheduledPitStop: null,
      pitCallLap: null,
      tireChanged: false,
      status: 'Racing',
      drivingStyle: 'normal',
      styleUntil: null,
      lastLapTime: null,
      lastLapStartTime: 0,
    };
  });
};

export const useRace = ({ 
  pathLength, 
  addEvent, 
  previousRankingRef,
  paused,
  setPaused,
  setupComplete,
  initialCars,
  teamControl 
}) => {
  const [cars, setCars] = useState(() => initialCars || createInitialCars(teamControl));
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceTime, setRaceTime] = useState(0);
  const lastTimestampRef = useRef(null);
  const raceFinishTimeRef = useRef(null);

  // Automatyczne pauzowanie gdy okno traci fokus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [setPaused]);
  const PIT_EXIT_BUFFER = PITLANE_LENGTH / 2;
  const stuckTimersRef = useRef({});

  const updateCarPositions = (cars, deltaSec) => {
    // Sorting (for "gap" effect)
    const sortedCars = [...cars].sort((a, b) => b.distanceTraveled - a.distanceTraveled);

    return sortedCars.map((car) => {
      let updatedCar = { ...car };
      let blocked = false;
      let normalizedDistance = ((updatedCar.distanceTraveled % pathLength) + pathLength) % pathLength;

      // Reset driving style after 30 seconds
      if (updatedCar.styleUntil && raceTime >= updatedCar.styleUntil) {
        updatedCar.drivingStyle = 'normal';
        updatedCar.styleUntil = null;
      }

      // Effective speed based on tire condition and driving style
      let baseSpeed = updatedCar.tires.speed;
      const currentCondition = updatedCar.tires.condition ?? 100;
      let wearRate = updatedCar.tires.degradation;

      // Speed and wear modification based on driving style
      const style = DRIVING_STYLES[updatedCar.drivingStyle.toUpperCase()];
      if (style) {
        baseSpeed += style.speedModifier;
        wearRate += style.wearModifier;
      }

      const effectiveSpeed = baseSpeed - (baseSpeed * (100 - currentCondition)) / 200;
      let currentSpeed = effectiveSpeed;

      // Pitstop logic
      if (updatedCar.scheduledPitStop) {
        // Can we enter the pitlane now
        if (updatedCar.laps >= updatedCar.pitCallLap) {
          // Pit entry
          if (updatedCar.status === 'Box Called' && normalizedDistance >= pathLength - (PITLANE_LENGTH / 2)) {
            updatedCar.status = 'Pit Entry';
            addEvent('pit', `${updatedCar.name} entered pit lane`);
          }
          // Pit lane - speed limited in pit lane
          if (updatedCar.status === 'Pit Entry') {
            currentSpeed = PITLANE_SPEED;
            updatedCar.inPitStop = true;
            // Tire change just after finish line
            if (normalizedDistance < 10 && !updatedCar.tireChanged) {
              const newTireType = updatedCar.scheduledPitStop;
              if (newTireType === 'SOFT') {
                updatedCar.tires = { ...TIRE_TYPES.SOFT, condition: 100 };
              } else if (newTireType === 'MEDIUM') {
                updatedCar.tires = { ...TIRE_TYPES.MEDIUM, condition: 100 };
              } else if (newTireType === 'HARD') {
                updatedCar.tires = { ...TIRE_TYPES.HARD, condition: 100 };
              }
              updatedCar.tireChanged = true;
              updatedCar.tireHistory = [...updatedCar.tireHistory, updatedCar.tires.name];
              updatedCar.status = 'Pit Exit';
              addEvent('pit', `${updatedCar.name} changed tires to ${updatedCar.tires.name}`);
            }
          }
          // Pit exit
          if (updatedCar.status === 'Pit Exit') {
            currentSpeed = PITLANE_SPEED;
            const potentialNewDistance = updatedCar.distanceTraveled + currentSpeed * deltaSec;
            const newNormalizedDistance = ((potentialNewDistance % pathLength) + pathLength) % pathLength;
            if (newNormalizedDistance > PIT_EXIT_BUFFER) {
              updatedCar.status = 'Racing';
              updatedCar.scheduledPitStop = null;
              updatedCar.tireChanged = false;
              updatedCar.inPitStop = false;
              

              const currentPosition = sortedCars
                .sort((a, b) => b.distanceTraveled - a.distanceTraveled)
                .findIndex(c => c.name === updatedCar.name) + 1;

              addEvent('pit', `${updatedCar.name} exited pit lane in P${currentPosition}`);
            }
          }
        }
      } else {
        // If no planned pitstop - "gap" effect
        const currentCarIndex = sortedCars.findIndex(c => c.name === updatedCar.name);
        if (currentCarIndex > 0) {
          let nearestCarAhead = null;
          for (let i = currentCarIndex - 1; i >= 0; i--) {
            if (!sortedCars[i].inPitStop) {
              nearestCarAhead = sortedCars[i];
              break;
            }
          }
          if (nearestCarAhead) {
            const normalizedCurrent = ((updatedCar.distanceTraveled % pathLength) + pathLength) % pathLength;
            const normalizedAhead = ((nearestCarAhead.distanceTraveled % pathLength) + pathLength) % pathLength;
            const totalCurrent = updatedCar.laps * pathLength + normalizedCurrent;
            const totalAhead = nearestCarAhead.laps * pathLength + normalizedAhead;
            let gap = totalAhead - totalCurrent;
            if (gap < 0) gap += pathLength;
            if (gap < 20) {
              currentSpeed = effectiveSpeed - FOLLOWING_PENALTY;
              blocked = true;
            
              // Check "stuck" conditions - gap between cars
              if (gap > 8 && gap < 23) {
                // Initialize timer if it doesn't exist
                if (!stuckTimersRef.current[updatedCar.name]) {
                  stuckTimersRef.current[updatedCar.name] = {
                    startTime: raceTime,
                    lastReportTime: 0,
                    stuckBehind: nearestCarAhead.name
                  };
                }
              
                // Check if 10 seconds passed and if it's the same driver ahead
                const timer = stuckTimersRef.current[updatedCar.name];
                if (timer.stuckBehind === nearestCarAhead.name && 
                    raceTime - timer.startTime >= 10 && 
                    raceTime - timer.lastReportTime >= 10 &&
                    !updatedCar.inPitStop && !nearestCarAhead.inPitStop &&
                    updatedCar.laps > 1) {
                  addEvent('stuck', `${updatedCar.name} stuck behind ${nearestCarAhead.name} for 10 seconds`);
                  timer.lastReportTime = raceTime;
                }
              } else {
                // Reset timer if conditions are not met
                delete stuckTimersRef.current[updatedCar.name];
              }
            }
          }
        }
      }

      // After race finish, constant speed of 20
      const finalSpeed = updatedCar.hasFinished ? 12 : currentSpeed;
      
      // Update distance + laps
      const newDistance = updatedCar.distanceTraveled + finalSpeed * deltaSec;
      let newLaps = updatedCar.laps;
      const oldNormalizedDistance = ((updatedCar.distanceTraveled % pathLength) + pathLength) % pathLength;
      const newNormalizedDistance = ((newDistance % pathLength) + pathLength) % pathLength;

      // Crossing finish line
      if (oldNormalizedDistance > newNormalizedDistance) {
        if (updatedCar.laps > 0) {
          const lapTime = raceTime - (updatedCar.lastLapStartTime || 0);
          updatedCar.lastLapTime = lapTime;
        }
        newLaps++;
        updatedCar.lastLapStartTime = raceTime;
        
        // Check if this is the end of race (after completing MAX_LAPS)
        if (newLaps >= MAX_LAPS + 1 && !updatedCar.hasFinished) {
          updatedCar.hasFinished = true;
          addEvent('race', `${updatedCar.name} finished the race!`);
        }
      }

      // Tire wear
      let newCondition;
      if (updatedCar.tireChanged && updatedCar.status === 'Pit Exit') {
        newCondition = 100;
      } else {
        // Use previously calculated wearRate instead of base degradation
        newCondition = Math.max(0, updatedCar.tires.condition - wearRate * deltaSec);
      }

      return {
        ...updatedCar,
        distanceTraveled: newDistance,
        laps: newLaps,
        tires: { ...updatedCar.tires, condition: newCondition },
        currentSpeed,
        lastLapTime: updatedCar.lastLapTime,
        isBlocked: blocked
      };
    });
  };

  const updateRace = (timestamp, skipUpdate = false) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }
    if (skipUpdate) {
      lastTimestampRef.current = timestamp;
      return;
    }
    const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;
    
    setRaceTime(prev => prev + deltaSec);

    setCars(prevCars => {
      const updatedCars = updateCarPositions(prevCars, deltaSec);

      // Sprawdzamy, czy wszyscy kierowcy zakończyli wyścig
      const allFinished = updatedCars.every(car => car.hasFinished);
      if (allFinished && !raceFinished) {
        console.log('Race finished - all cars completed the race');
        setRaceFinished(true);
        // Zapisujemy czas zakończenia wyścigu
        raceFinishTimeRef.current = raceTime;
        addEvent('race', 'All drivers have finished the race!');

        // Sprawdzamy zasady F1 dotyczące zmiany opon
        updatedCars.forEach(car => {
          const uniqueTires = new Set(car.tireHistory);
          if (uniqueTires.size < 2) {
            car.status = 'DSQ';
            addEvent('race', `${car.name} disqualified - did not use at least two different tire compounds`);
          }
        });
      }

      // Calculate current ranking
      const newRanking = [...updatedCars].sort((a, b) => {
        if (b.laps !== a.laps) return b.laps - a.laps;
        const rawA = ((a.distanceTraveled % pathLength) + pathLength) % pathLength;
        const rawB = ((b.distanceTraveled % pathLength) + pathLength) % pathLength;
        return rawB - rawA;
      });

      // Compare with previous ranking and add overtaking events
      if (previousRankingRef.current.length > 0) {
        newRanking.forEach((car, newPos) => {
          const oldPos = previousRankingRef.current.indexOf(car.name);
          if (oldPos !== -1 && newPos < oldPos) {
            const overtakenDriver = previousRankingRef.current[newPos];
            addEvent('overtake', `${car.name} overtook ${overtakenDriver} for P${newPos + 1}`);
          }
        });
      }

      // Save current ranking as a list of names
      previousRankingRef.current = newRanking.map(car => car.name);

      return updatedCars;
    });

    // Sprawdzamy, czy minęło 5 sekund od zakończenia wyścigu
    if (raceFinished && raceFinishTimeRef.current && raceTime >= raceFinishTimeRef.current + 5 && !paused) {
      setPaused(true);
      addEvent('race', 'Race paused - final classification displayed');
    }
  };

  // Animation loop
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

  const applyStartingGrid = (grid) => {
    setCars(prevCars => grid.map(gridItem => {
      const car = prevCars.find(car => car.name === gridItem.name);
      const tires = { ...gridItem.tires };
      return { 
        ...car, 
        distanceTraveled: gridItem.distanceTraveled,
        tires: tires,
        tireHistory: [tires.name]
      };
    }));
  };

  return {
    raceTime,
    cars,
    setCars,
    raceFinished,
    setRaceFinished,
    updateRace,
    applyStartingGrid
  };
};
