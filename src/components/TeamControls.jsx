import React, { useMemo, memo } from 'react';
import TireManager from './TireManager';

const TeamControls = ({ 
  availableTeams, 
  cars, 
  teamControl, 
  handleCommandSubmit, 
  paused,
  highlightedDriver,
  setHighlightedDriver
}) => {
  // We memoize the entire list of team controls to avoid unnecessary rendering
  const teamControlsElements = useMemo(() => {
    const isAIOnly = cars.every(car => teamControl[car.team]?.type === "ai");

    if (isAIOnly) {
      const sortedCars = [...cars].sort((a, b) => {
        if (b.laps !== a.laps) {
          return b.laps - a.laps;
        }
        return b.distanceTraveled - a.distanceTraveled;
      });

      return sortedCars.map((car, index) => (
        <TireManager 
          key={car.name}
          team={car.team}
          driver={car.name}
          currentTire={car.tires.name.charAt(0)}
          tireHealth={car.tires.condition}
          onCommand={(cmd) => handleCommandSubmit({ preventDefault: () => {} }, cmd, car.team)}
          cars={cars}
          position={(index + 1).toString()}
          activeStyle={car.drivingStyle}
          isEditable={false}
          hideLockOverlay={true}
          highlightedDriver={highlightedDriver}
          setHighlightedDriver={setHighlightedDriver}
        />
      ));
    } else {
      // If there are player teams, render only those, otherwise render all
      const anyPlayerTeam = availableTeams.some(team => teamControl[team]?.type === "player");
      return availableTeams
        .filter(team => !anyPlayerTeam || teamControl[team]?.type === "player")
        .flatMap(team => {
          const teamCars = cars.filter(car => car.team === team);
          return teamCars.map(teamCar => {
            const position = cars.findIndex(c => c.name === teamCar.name) + 1 || '-';
            return (
              <TireManager 
                key={teamCar.name}
                team={team}
                driver={teamCar.name}
                currentTire={teamCar.tires.name.charAt(0)}
                tireHealth={teamCar.tires.condition}
                onCommand={(cmd) => handleCommandSubmit({ preventDefault: () => {} }, cmd, team)}
                cars={cars}
                position={position.toString()}
                activeStyle={teamCar.drivingStyle}
                isEditable={teamControl[team]?.type === "player" && paused}
                highlightedDriver={highlightedDriver}
                setHighlightedDriver={setHighlightedDriver}
              />
            );
          });
        });
    }
  }, [availableTeams, cars, teamControl, handleCommandSubmit, paused]);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '1rem',
      marginTop: '1rem',
      width: '100%',
      paddingLeft: '0rem'
    }}>
      {teamControlsElements}
    </div>
  );
};

// We memoize the entire component to avoid unnecessary rendering
export default memo(TeamControls);
