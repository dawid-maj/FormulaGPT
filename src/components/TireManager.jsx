import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { teamColors } from '../data/teamMapping';
import softTiresSvg from '../assets/svg/soft_tires.svg';
import mediumTiresSvg from '../assets/svg/medium_tires.svg';
import hardTiresSvg from '../assets/svg/hard_tires.svg';
import unknownTiresSvg from '../assets/svg/unknown_tires.svg';

// Stałe style dla przycisków pit-option
const pitOptionStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px',
  backgroundColor: '#1e293b',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.05)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  transition: 'all 0.2s'
};

// Komponent przycisku pit-option
const PitOptionButton = ({ onClick, disabled, children }) => (
  <button 
    className="pit-option"
    onClick={onClick}
    disabled={disabled}
    style={pitOptionStyle}
  >
    {children}
  </button>
);

PitOptionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired
};

const TireManager = ({ team, driver, onCommand, currentTire, tireHealth, position = '2nd', cars, activeStyle, isEditable, highlightedDriver, setHighlightedDriver, hideLockOverlay = false }) => {
  const formatPosition = (pos) => {
    const num = parseInt(pos);
    if (isNaN(num)) return pos;
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix}`;
  };
  const teamColor = teamColors[team];
  const [showPitOptions, setShowPitOptions] = useState(false);
  // Mapowanie typów opon do kolorów i obrazów
  const tireMapping = {
    'S': { color: '#FF1801', image: softTiresSvg },
    'M': { color: '#FFF200', image: mediumTiresSvg },
    'H': { color: '#FFFFFF', image: hardTiresSvg },
    '?': { color: '#666666', image: unknownTiresSvg }
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
              src={tireMapping[currentTire]?.image || hardTiresSvg}
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
                Box Called: 
                <img 
                  src={
                    scheduledPitStop === 'SOFT' ? softTiresSvg :
                    scheduledPitStop === 'MEDIUM' ? mediumTiresSvg :
                    scheduledPitStop === 'HARD' ? hardTiresSvg : 
                    unknownTiresSvg
                  }
                  alt={`${scheduledPitStop} tires`}
                  style={{ width: '20px', height: '20px', marginLeft: '4px', verticalAlign: 'middle' }}
                />
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
              {/* Przyciski wyboru opon */}
              {[
                { type: 'hard', image: hardTiresSvg, alt: 'Hard tires' },
                { type: 'medium', image: mediumTiresSvg, alt: 'Medium tires' },
                { type: 'soft', image: softTiresSvg, alt: 'Soft tires' }
              ].map(tire => (
                <PitOptionButton
                  key={tire.type}
                  onClick={() => {
                    if (isEditable) {
                      onCommand(`${driver.toLowerCase()} pit ${tire.type}`);
                      setShowPitOptions(false);
                    }
                  }}
                  disabled={!isEditable}
                >
                  <img 
                    src={tire.image}
                    alt={tire.alt}
                    style={{ width: '20spx', height: '20px' }}
                  />
                </PitOptionButton>
              ))}
              
              {/* Przycisk zamknięcia */}
              <PitOptionButton 
                onClick={() => setShowPitOptions(false)}
                style={{
                  ...pitOptionStyle,
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              >
                X
              </PitOptionButton>
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
