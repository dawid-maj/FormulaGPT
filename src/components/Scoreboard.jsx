/**
 * Scoreboard component displays race information including driver positions, 
 * tire conditions, lap times and team standings
 * 
 * @param {Object[]} cars - Array of car objects with current race data
 * @param {number} pathLength - Length of race track
 * @param {number} currentLap - Current lap number
 * @param {number} maxLaps - Total number of laps in race
 * @param {number} raceTime - Current race time in seconds
 * @param {boolean} showResults - Whether to show final race results
 * @param {string[]} availableTeams - List of teams in the race
 * @param {Object[]} events - Array of race events
 * @param {Function} onExitToMenu - Function to handle exit to menu button click
 */
import React, { useState, useEffect, useRef } from 'react';
import { teamColors } from '../data/teamMapping';
import { EventsPanel } from './EventsPanel';
import { computeScoreboardData } from '../utils/computeScoreboardData';
import softTiresSvg from '../assets/svg/soft_tires.svg';
import mediumTiresSvg from '../assets/svg/medium_tires.svg';
import hardTiresSvg from '../assets/svg/hard_tires.svg';

const columns = [
  { key: 'position', label: 'Pos', width: 45 },
  { key: 'driver', label: 'Driver', width: 60 },
  { key: 'tires', label: 'Tires', width: 30 },
  { key: 'condition', label: 'Cond', width: 50 },
  { key: 'speed', label: 'Speed', width: 45 },
  { key: 'gap', label: 'Interval', width: 70 },
  { key: 'laps', label: 'Laps', width: 25 },
  { key: 'dist', label: 'Dist', width: 50 },
  { key: 'status', label: 'Status', width: 80 },
  { key: 'style', label: 'Pace', width: 60 },
  { key: 'history', label: 'History', width: 50 },
  { key: 'lastLap', label: 'Last Lap', width: 60 }
];

export const Scoreboard = ({ cars, pathLength, currentLap, maxLaps, raceTime, showResults, availableTeams, events, onExitToMenu, highlightedDriver, setHighlightedDriver }) => {
  const [scoreboardData, setScoreboardData] = useState([]);
  const carsRef = useRef(cars);

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  // Update scoreboard data using requestAnimationFrame for smooth updates
  useEffect(() => {
    if (pathLength <= 0) return;

    let animationFrameId;
    let lastUpdate = 0;
    const minUpdateInterval = 50; // Limit updates to 20fps for performance

    /**
     * Updates scoreboard positions and intervals between cars
     * Uses requestAnimationFrame for smooth animation
     */
    const updateScoreboard = (timestamp) => {
      if (timestamp - lastUpdate >= minUpdateInterval) {
        const startTime = performance.now();
        
        const newScoreboardData = computeScoreboardData(carsRef.current, pathLength);
        setScoreboardData(newScoreboardData);
        lastUpdate = timestamp;

        const duration = performance.now() - startTime;

        /*
        if (duration > 16) {
          console.log('📊 Scoreboard update took:', duration.toFixed(2), 'ms');
        }
          */
      }
      
      animationFrameId = requestAnimationFrame(updateScoreboard);
    };

    animationFrameId = requestAnimationFrame(updateScoreboard);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pathLength]);
  const [showEvents, setShowEvents] = useState(false);

  // Display final race results with points calculation
  if (showResults) {
    const startTime = performance.now();
    const points = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // Points awarded for positions 1-10
    
    // Sort drivers - disqualified drivers go to the end
    const sortedDrivers = [...scoreboardData].sort((a, b) => {
      if (a.status === 'DSQ' && b.status !== 'DSQ') return 1;
      if (a.status !== 'DSQ' && b.status === 'DSQ') return -1;
      return a.position - b.position;
    });

    // Calculate constructor championship points and best positions
    const teamPoints = {};
    const teamBestPosition = {};
    availableTeams.forEach(team => {
      teamPoints[team] = 0;
      teamBestPosition[team] = 100;
    });
    
    sortedDrivers.forEach((driver, index) => {
      const team = driver.team;
      if (team && driver.status !== 'DSQ') {
        const driverPoints = points[index] || 0; // Use index instead of position for points
        teamPoints[team] += driverPoints;
        teamBestPosition[team] = Math.min(teamBestPosition[team], index + 1);
      }
    });

    const teamsStandings = availableTeams
      .map(team => ({
        team,
        points: teamPoints[team],
        bestPosition: teamBestPosition[team]
      }))
      .sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return a.bestPosition - b.bestPosition;
      });

    const duration = performance.now() - startTime;
    /*
    if (duration > 16) { // Log only if takes more than 1 frame (16ms)
      console.log('🏆 Results calculation took:', duration.toFixed(2), 'ms');
    }
      */
    return (
      <div className="card-content">
        <div className="results-grid">
          <div className="drivers-results">
            <h3>Drivers Championship</h3>
            <div className="classification-header">
              <div>Pos</div>
              <div>Driver</div>
              <div>Team</div>
              <div>History</div>
              <div>Points</div>
            </div>
            {sortedDrivers.map((driver, index) => (
              <div key={driver.name} className="classification-row">
                <div>{index + 1}</div>
                <div className="driver-cell">
                  <span className="driver-dot-stack">
                    <span className="driver-big-dot" style={{ backgroundColor: driver.color }} />
                    {driver.dotColor && (
                      <span className="driver-dot" style={{ backgroundColor: driver.dotColor }} />
                    )}
                  </span>
                  {driver.name}
                </div>
                <div style={{ color: teamColors[driver.team] }}>{driver.team}</div>
                <div>
                  {driver.tireHistory.map((tire, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: tire.charAt(0) === 'S' ? 'red' : tire.charAt(0) === 'M' ? 'yellow' : 'white',
                        textShadow: tire.charAt(0) === 'M' || tire.charAt(0) === 'H' ? '0 0 1px black' : 'none',
                        marginRight: '4px'
                      }}
                    >
                      {tire.charAt(0)}
                    </span>
                  ))}
                </div>
                <div>{driver.status === 'DSQ' ? 'DSQ' : (points[index] || 0)}</div>
              </div>
            ))}
          </div>
          <div className="teams-results">
            <h3>Constructors Championship</h3>
            <div className="classification-header">
              <div>Pos</div>
              <div>Team</div>
              <div>Points</div>
            </div>
            {teamsStandings.map((team, index) => (
              <div key={team.team} className="classification-row">
                <div>{index + 1}</div>
                <div style={{ color: teamColors[team.team] }}>{team.team}</div>
                <div>{team.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-content">
      <div className="toggle-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label className="toggle-control">
          <input 
            type="checkbox" 
            id="toggle-events" 
            checked={showEvents}
            onChange={() => setShowEvents(!showEvents)}
          />
          Show Events
        </label>
        
        {/* Back to Menu button */}
        <button 
          className="back-to-menu-btn"
          onClick={onExitToMenu}
          style={{
            padding: '6px 12px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Back to Menu
        </button>
      </div>
      <div className="race-info mb-4">
        <div className="text-xl font-semibold">
          Lap {currentLap}/{maxLaps}
          <span className="text-gray-500 ml-4">
            {Math.floor(raceTime / 60)}:{Math.floor(raceTime % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      
      {showEvents ? (
        <EventsPanel events={events} />
      ) : (
        <>
          <div 
            className="classification-header"
            style={{
              gridTemplateColumns: columns.map(col => col.width + 'px').join(' ')
            }}
          >
            {columns.map(col => (
              <div key={col.key}>{col.label}</div>
            ))}
          </div>
          {scoreboardData.map(item => {
            const normalizedDistance = ((item.distanceTraveled % pathLength) + pathLength) % pathLength;
            const distInLap = Math.round((normalizedDistance / pathLength) * 100);
            return (
              <div 
                key={item.name} 
                className="classification-row"
                onMouseEnter={() => setHighlightedDriver(item.name)}
                onMouseLeave={() => setHighlightedDriver(null)}
                style={{
                  gridTemplateColumns: columns.map(col => col.width + 'px').join(' '),
                  backgroundColor: highlightedDriver === item.name ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {columns.map(col => {
                  switch (col.key) {
                    case 'position':
                      return (
                        <div key={col.key}>
                          {item.position}
                          {item.laps >= maxLaps + 1 ? ' 🏁' : ''}
                        </div>
                      );
                    case 'driver':
                      return (
                        <div key={col.key} className="driver-cell">
                          <span className="driver-dot-stack">
                            <span className="driver-big-dot" style={{ backgroundColor: item.color }} />
                            {item.dotColor && (
                              <span className="driver-dot" style={{ backgroundColor: item.dotColor }} />
                            )}
                          </span>
                          {item.name}
                        </div>
                      );
                    case 'status':
                      return <div key={col.key} style={{
                        color: item.status === 'Box Called' ? '#f5eeb0' : // jasnoniebieski
                               item.status === 'Pit Entry' ? '#7dd3fc' : // niebieski
                               item.status === 'Pit Exit' ? '#7dd3fc' : // niebieski
                               'inherit' // domyślny kolor dla innych statusów
                      }}>
                        {item.status}
                      </div>;
                    case 'style':
                      return <div key={col.key} style={{
                        color: item.drivingStyle === 'push' ? '#f97316' : // pomarańczowy dla push
                               item.drivingStyle === 'conserve' ? '#86efac' : // jasnozielony dla conserve
                               'inherit' // domyślny kolor dla innych wartości
                      }}>
                        {item.drivingStyle}
                      </div>;
                    case 'tires':
                      return (
                        <div key={col.key}>
                          <img
                            src={
                              item.tires.name.charAt(0) === 'S' ? softTiresSvg :
                              item.tires.name.charAt(0) === 'M' ? mediumTiresSvg :
                              hardTiresSvg
                            }
                            alt={`${item.tires.name} tires`}
                            style={{
                              width: '18px',
                              height: '18px',
                              verticalAlign: 'middle'
                            }}
                          />
                        </div>
                      );
                    case 'condition':
                      return (
                        <div key={col.key} style={{
                          color: item.tires.condition > 92 ? '#04b345' :  // dark green - excellent
                                 item.tires.condition > 87 ? '#abd453' :  // light green - very good
                                 item.tires.condition > 80 ? '#fbbf24' :  // yellow - good
                                 item.tires.condition > 77 ? '#f97316' :  // orange - warning
                                 item.tires.condition > 70 ? '#ef4444' :  // light red - critical
                                 '#dc2626'                                // dark red - dangerous
                        }}>
                          {Math.round(item.tires.condition)}%
                        </div>
                      );
                    case 'speed':
                      return <div key={col.key}>{item.currentSpeed?.toFixed(1) ?? item.tires.speed}</div>;
                    case 'laps':
                      return <div key={col.key}>{item.laps}</div>;
                    case 'dist':
                      return <div key={col.key}>{distInLap}%</div>;
                      case 'gap':
                        return (
                          <div key={col.key}>
                            {item.position === 1 
                              ? '---' 
                              : `+${item.interval.toFixed(2)}`
                            }                            
                          </div>
                        );
                    case 'history':
                      return (
                        <div key={col.key}>
                          {item.tireHistory.map((tire, idx) => (
                            <span
                              key={idx}
                              style={{
                                color: tire.charAt(0) === 'S' ? 'red' : tire.charAt(0) === 'M' ? 'yellow' : 'white',
                                textShadow: tire.charAt(0) === 'M' || tire.charAt(0) === 'H' ? '0 0 1px black' : 'none',
                                marginRight: '4px'
                              }}
                            >
                              {tire.charAt(0)}
                            </span>
                          ))}
                        </div>
                      );
                    case 'lastLap':
                      return (
                        <div key={col.key} style={{
                          color: (() => {
                            // Check if driver has finished current lap
                            const currentLap = Math.max(...scoreboardData.map(car => car.laps));
                            if (item.laps < currentLap) return 'inherit';

                            // Find the best time for a given lap
                            const driversOnSameLap = scoreboardData.filter(car => car.laps === item.laps);
                            const bestDriver = driversOnSameLap
                              .filter(car => car.lastLapTime) // Only those who have a lap time
                              .reduce((best, current) => {
                                if (!best || !best.lastLapTime) return current;
                                if (!current.lastLapTime) return best;
                                if (current.lastLapTime < best.lastLapTime) return current;
                                if (current.lastLapTime === best.lastLapTime && current.position < best.position) return current;
                                return best;
                              }, null);
                            // Return purple color only to the best driver on a given lap
                            return (bestDriver && item.name === bestDriver.name && item.laps > 0) ? '#a855f7' : 'inherit';
                          })()
                        }}>
                          {item.lastLapTime ? item.lastLapTime.toFixed(2) : '-'}
                        </div>
                      );
                    default:
                      return <div key={col.key}>{item[col.key]}</div>;
                  }
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
