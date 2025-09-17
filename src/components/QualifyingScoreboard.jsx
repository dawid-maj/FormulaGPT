/**
 * Qualifying scoreboard component - styled like regular Scoreboard but for qualifying data
 */
import React, { useState, memo } from 'react';
import { EventsPanel } from './EventsPanel';

const qualifyingColumns = [
  { key: 'position', label: 'Pos', width: 45 },
  { key: 'driver', label: 'Driver', width: 60 },
  { key: 'bestTime', label: 'Best Time', width: 80 },
  { key: 'gap', label: 'Gap', width: 70 },
  { key: 'attempts', label: 'Att', width: 35 },
  { key: 'status', label: 'Status', width: 80 },
  { key: 'tireSet', label: 'Tire', width: 40 },
  { key: 'trackGrip', label: 'Grip', width: 50 }
];

const QualifyingScoreboard = memo(({ 
  results = [], 
  events = [], 
  sessionTime = 1080, 
  trackGrip = 1.0, 
  sessionActive = true,
  sessionFinished = false,
  onExitToMenu = () => {}, 
  highlightedDriver = null, 
  setHighlightedDriver = () => {} 
}) => {
  console.log('QualifyingScoreboard rendering with:', { resultsCount: results?.length, eventsCount: events?.length });
  const [showEvents, setShowEvents] = useState(false);

  // Add early return for debugging
  if (!Array.isArray(results)) {
    return <div style={{color: 'red'}}>ERROR: Results is not an array: {typeof results}</div>;
  }

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return '-';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = (timeInSeconds % 60).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const formatSessionTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatGap = (gapInSeconds) => {
    if (!gapInSeconds || gapInSeconds === 0) return '-';
    return `+${gapInSeconds.toFixed(3)}`;
  };

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
          Qualifying Session
          <span className="text-gray-500 ml-4">
            {formatSessionTime(sessionTime)} remaining
          </span>
          <span className="text-gray-500 ml-4">
            Grip: {(trackGrip * 100).toFixed(1)}%
          </span>
          <span className={`ml-4 ${sessionActive ? 'text-green-500' : 'text-red-500'}`}>
            {sessionActive ? 'LIVE' : 'FINISHED'}
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
              gridTemplateColumns: qualifyingColumns.map(col => col.width + 'px').join(' ')
            }}
          >
            {qualifyingColumns.map(col => (
              <div key={col.key}>{col.label}</div>
            ))}
          </div>
          {results.length > 0 ? (
            results.map((result, index) => (
              <div 
                key={result.name} 
                className="classification-row"
                onMouseEnter={() => setHighlightedDriver(result.name)}
                onMouseLeave={() => setHighlightedDriver(null)}
                style={{
                  gridTemplateColumns: qualifyingColumns.map(col => col.width + 'px').join(' '),
                  backgroundColor: highlightedDriver === result.name ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div>{result.position}</div>
                <div className="driver-cell">
                  <span className="driver-dot-stack">
                    <span className="driver-big-dot" style={{ backgroundColor: result.color }} />
                  </span>
                  {result.name}
                </div>
                <div>{formatTime(result.bestLapTime)}</div>
                <div>{formatGap(result.gap)}</div>
                <div>{result.attempts}</div>
                <div style={{
                  color: result.status === 'On Track' ? '#4caf50' : 
                         result.status === 'Pit' ? 'white' : 
                         'inherit'
                }}>
                  {result.status || 'Pit'}
                </div>
                <div>
                  {result.currentTireSet !== null ? `#${result.currentTireSet + 1}` : '-'}
                </div>
                <div>
                  {result.lastGrip ? `${(result.lastGrip * 100).toFixed(0)}%` : '-'}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <h4>No Times Set</h4>
              <p>Send drivers to track to start qualifying</p>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default QualifyingScoreboard;