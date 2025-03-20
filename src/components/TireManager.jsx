import React, { useState, memo } from 'react';
import { teamColors } from '../data/teamMapping';
import softTiresSvg from '../assets/svg/soft_tires.svg';
import mediumTiresSvg from '../assets/svg/medium_tires.svg';
import hardTiresSvg from '../assets/svg/hard_tires.svg';

const TireManager = ({ team, driver, onCommand, currentTire, tireHealth, position = '2nd', cars, activeStyle, isEditable, highlightedDriver, setHighlightedDriver, hideLockOverlay = false }) => {
  const formatPosition = (pos) => {
    const num = parseInt(pos);
    if (isNaN(num)) return pos;
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix}`;
  };
  const teamColor = teamColors[team];
  const [showPitOptions, setShowPitOptions] = useState(false);
  const getTireColor = (tire) => {
    switch(tire.toLowerCase()) {
      case 'soft': return '#FF1801';
      case 'medium': return '#FFF200';
      case 'hard': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  // Find car status and scheduled pit stop once to avoid repeated lookups
  const carData = cars.find(car => car.name === driver);
  const carStatus = carData?.status;
  const scheduledPitStop = carData?.scheduledPitStop;

  return (
    <div 
      className="driver-card" 
      style={{
        '--team-color': teamColor, 
        position: 'relative',
        boxShadow: highlightedDriver === driver ? '0 0 8px rgba(255, 255, 0, 0.5)' : 'none',
        transition: 'box-shadow 0.2s ease'
      }}
      onMouseEnter={() => setHighlightedDriver && setHighlightedDriver(driver)}
      onMouseLeave={() => setHighlightedDriver && setHighlightedDriver(null)}
    >
      <div className="team-header">
        <div className="team-name">{team}</div>
        <div className="driver-info">
          <span className="driver-code">{driver.slice(-3)}</span>
          <span className="position">{formatPosition(position)}</span>
        </div>
      </div>

      <div className="tire-info">
        <div className="tire-indicator">
          <div className="tire-status-group">
            <img 
              src={
                currentTire === 'S' ? softTiresSvg :
                currentTire === 'M' ? mediumTiresSvg :
                hardTiresSvg
              }
              alt={`${currentTire} tires`}
              className="tire-letter"
              style={{ width: '24px', height: '24px' }}
            />
            <div className="tire-health-bar" style={{
              '--health-color': tireHealth > 92 ? '#04b345' :  // // dark green
                               tireHealth > 87 ? '#abd453' :  // // light green
                               tireHealth > 80 ? '#fbbf24' :  // yellow
                               tireHealth > 75 ? '#f97316' :  // orange 
                               tireHealth > 70 ? '#ef4444' :  // light red
                               '#dc2626',                     // dark red
              '--health-percentage': `${tireHealth}%`
            }}></div>
            <span className="tire-health">{Math.floor(tireHealth)}%</span>
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="pace-section">
          <div className="pace-header">
            <span className="pace-label">Pace</span>
            <div className="pace-dots">
              {[...Array(activeStyle === 'conserve' ? 2 : 
                         activeStyle === 'normal' ? 3 : 
                         activeStyle === 'push' ? 4 : 0)].map((_, i) => (
                <span key={i} className="pace-dot"></span>
              ))}
            </div>
          </div>
          <div className="pace-buttons">
            <button 
              className={`pace-btn conserve ${activeStyle === 'conserve' ? 'active' : ''}`}
              onClick={() => isEditable && onCommand(`${driver.toLowerCase()} conserve`)}
              disabled={!isEditable}
            >
              Conserve
            </button>
            <button 
              className={`pace-btn normal ${activeStyle === 'normal' ? 'active' : ''}`}
              onClick={() => isEditable && onCommand(`${driver.toLowerCase()} normal`)}
              disabled={!isEditable}
            >
              Normal
            </button>
            <button 
              className={`pace-btn push ${activeStyle === 'push' ? 'active' : ''}`}
              onClick={() => isEditable && onCommand(`${driver.toLowerCase()} push`)}
              disabled={!isEditable}
            >
              Push
            </button>
          </div>
        </div>

        <div className="pit-section">
          <div className="pit-label">Pit Stop</div>
          {carStatus === 'Box Called' ? (
            <div className="pit-status">
              <div className="box-called">
                Box Called: <span style={{ 
                  color: scheduledPitStop === 'SOFT' ? '#FF1801' :
                         scheduledPitStop === 'MEDIUM' ? '#FFF200' : '#FFFFFF'
                }}>
                  {scheduledPitStop?.charAt(0)}
                </span>
              </div>
              <button 
                className="pit-option cancel"
                onClick={() => isEditable && onCommand(`${driver.toLowerCase()} pit cancel`)}
                disabled={!isEditable}
              >
                Cancel
              </button>
            </div>
          ) : !showPitOptions ? (
            <button 
              className="pit-btn"
              onClick={() => isEditable && setShowPitOptions(true)}
              disabled={!isEditable}
            >
              Call to Pit
            </button>
          ) : (
            <div className="pit-options">
              <button 
                className="pit-option hard"
                onClick={() => {
                  if (isEditable) {
                    onCommand(`${driver.toLowerCase()} pit hard`);
                    setShowPitOptions(false);
                  }
                }}
                disabled={!isEditable}
              >
                H
              </button>
              <button 
                className="pit-option medium"
                onClick={() => {
                  if (isEditable) {
                    onCommand(`${driver.toLowerCase()} pit medium`);
                    setShowPitOptions(false);
                  }
                }}
                disabled={!isEditable}
              >
                M
              </button>
              <button 
                className="pit-option soft"
                onClick={() => {
                  if (isEditable) {
                    onCommand(`${driver.toLowerCase()} pit soft`);
                    setShowPitOptions(false);
                  }
                }}
                disabled={!isEditable}
              >
                S
              </button>
              <button 
                className="pit-option cancel"
                onClick={() => setShowPitOptions(false)}
              >
                X
              </button>
            </div>
          )}
        </div>
      </div>
      {!isEditable && !hideLockOverlay && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '25px',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <span style={{ color: 'white', fontSize: '24px' }}>🔒</span>
        </div>
      )}
    </div>
  );
};

import PropTypes from 'prop-types';

TireManager.propTypes = {
  team: PropTypes.string.isRequired,
  driver: PropTypes.string.isRequired,
  onCommand: PropTypes.func.isRequired,
  currentTire: PropTypes.string.isRequired,
  tireHealth: PropTypes.number.isRequired,
  position: PropTypes.string,
  cars: PropTypes.array.isRequired,
  isEditable: PropTypes.bool,
  highlightedDriver: PropTypes.string,
  setHighlightedDriver: PropTypes.func,
  hideLockOverlay: PropTypes.bool
};

// Component memoization to avoid unnecessary re-renders
export default memo(TireManager, (prevProps, nextProps) => {
  // We compare only the properties that affect the appearance of the component
  return (
    prevProps.currentTire === nextProps.currentTire &&
    Math.floor(prevProps.tireHealth) === Math.floor(nextProps.tireHealth) &&
    prevProps.position === nextProps.position &&
    prevProps.activeStyle === nextProps.activeStyle &&
    prevProps.isEditable === nextProps.isEditable &&
    prevProps.highlightedDriver === nextProps.highlightedDriver &&
    // We check only the relevant car properties
    prevProps.cars.find(car => car.name === prevProps.driver)?.status === 
    nextProps.cars.find(car => car.name === nextProps.driver)?.status &&
    prevProps.cars.find(car => car.name === prevProps.driver)?.scheduledPitStop === 
    nextProps.cars.find(car => car.name === nextProps.driver)?.scheduledPitStop
  );
});
