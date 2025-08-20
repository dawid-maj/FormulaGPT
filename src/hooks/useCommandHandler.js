/**
 * Hook for handling race commands (pit stops, driving styles)
 */
import { useCallback } from 'react';
import { teamMapping } from '../data/teamMapping';

export const useCommandHandler = ({ setCars, pathLength, addEvent, raceTimeRef }) => {
  const handleCommandSubmit = useCallback((e, cmdString, sourceTeam) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const inputCommand = (typeof cmdString === "string") ? cmdString : "";
    
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
              addEvent("pit", `${car.name} pit stop cancelled`, raceTimeRef.current);
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
                addEvent("pit", `${car.name} cannot cancel pit stop - already in pit lane`, raceTimeRef.current);
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

  return {
    handleCommandSubmit
  };
};