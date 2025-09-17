/**
 * Qualifying driver card component - styled like TireManager but for qualifying
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  ATTACK_MODES, 
  QUALIFYING_DRIVER_STATES,
  TIRE_SET_STATUS 
} from '../data/constants';

const QualifyingDriverCard = ({ 
  driver,
  sessionActive,
  sessionFinished,
  sendDriverToTrack,
  highlightedDriver,
  setHighlightedDriver,
  isEditable = true
}) => {
  const [selectedAttackMode, setSelectedAttackMode] = useState('Aggressive');
  const [selectedTireSet, setSelectedTireSet] = useState(0);
  const [showPitOptions, setShowPitOptions] = useState(false);

  const isInPit = driver.state === QUALIFYING_DRIVER_STATES.PIT;
  const canSendToTrack = sessionActive && !sessionFinished && isInPit && isEditable;
  const isHighlighted = highlightedDriver === driver.name;
  
  // Get current tire set for display
  const currentTireSet = driver.selectedTireSet !== null ? driver.tireSets[driver.selectedTireSet] : null;

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return '-';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = (timeInSeconds % 60).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const handleSendToTrack = () => {
    if (canSendToTrack) {
      sendDriverToTrack(driver.name, selectedAttackMode, selectedTireSet);
      setShowPitOptions(false);
    }
  };

  const getTireSetDisplay = (tireSet, index) => {
    const condition = tireSet.condition;
    const isSelected = selectedTireSet === index;
    
    return (
      <div 
        key={index}
        className={`tire-set-option ${isSelected ? 'selected' : ''} ${condition <= 0 ? 'disabled' : ''}`}
        onClick={() => condition > 0 && setSelectedTireSet(index)}
      >
        <div className="set-number">#{index + 1}</div>
        <div className="condition-bar">
          <div 
            className="condition-fill"
            style={{ 
              width: `${condition}%`,
              backgroundColor: condition > 70 ? '#4caf50' : 
                             condition > 30 ? '#ff9800' : '#f44336'
            }}
          ></div>
        </div>
        <div className={`set-status ${tireSet.status}`}>
          {tireSet.status === TIRE_SET_STATUS.NEW ? 'NEW' : 'USED'}
        </div>
        <div className="condition-percent">{condition.toFixed(0)}%</div>
      </div>
    );
  };

  return (
    <div 
      className="driver-card"
      style={{
        '--team-color': driver.color, 
        position: 'relative',
        boxShadow: isHighlighted ? '0 0 8px rgba(255, 255, 0, 0.5)' : 'none',
        transition: 'box-shadow 0.2s ease'
      }}
      onMouseEnter={() => setHighlightedDriver && setHighlightedDriver(driver.name)}
      onMouseLeave={() => setHighlightedDriver && setHighlightedDriver(null)}
    >
      <div className="team-header">
        <div className="team-name">{driver.name}</div>
        <div className="driver-info">
          <span className="driver-code">{driver.name.slice(-3)}</span>
          <span className="position">{driver.attempts?.length || 0} att</span>
        </div>
      </div>

      <div className="tire-info">
        <div className="tire-indicator">
          <div className="tire-status-group">
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#ff1744',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              S
            </div>
            <div className="tire-health-bar" style={{
              '--health-color': currentTireSet ? 
                (currentTireSet.condition > 70 ? '#04b345' : 
                 currentTireSet.condition > 30 ? '#fbbf24' : '#dc2626') : '#666',
              '--health-percentage': currentTireSet ? `${currentTireSet.condition}%` : '100%'
            }}></div>
            <span className="tire-health">
              {currentTireSet ? `${Math.floor(currentTireSet.condition)}%` : '100%'}
            </span>
          </div>
        </div>
      </div>

      <div className="controls">
        {/* Attack mode section */}
        <div className="pace-section">
          <div className="pace-header">
            <span className="pace-label">Attack Mode</span>
            <div style={{ fontSize: '0.8em', color: '#888' }}>
              {selectedAttackMode}
            </div>
          </div>
          <div className="pace-buttons">
            <button 
              className={`pace-btn ${selectedAttackMode === 'Aggressive' ? 'active' : ''}`}
              onClick={() => isEditable && setSelectedAttackMode('Aggressive')}
              disabled={!isEditable}
              style={{ fontSize: '0.7em', padding: '2px 4px' }}
            >
              Aggr
            </button>
            <button 
              className={`pace-btn ${selectedAttackMode === 'Super Aggressive' ? 'active' : ''}`}
              onClick={() => isEditable && setSelectedAttackMode('Super Aggressive')}
              disabled={!isEditable}
              style={{ fontSize: '0.7em', padding: '2px 4px' }}
            >
              Super
            </button>
            <button 
              className={`pace-btn ${selectedAttackMode === 'Mega Aggressive' ? 'active' : ''}`}
              onClick={() => isEditable && setSelectedAttackMode('Mega Aggressive')}
              disabled={!isEditable}
              style={{ fontSize: '0.7em', padding: '2px 4px' }}
            >
              Mega
            </button>
          </div>
        </div>

        {/* Tire set and send to track section */}
        <div className="pit-section">
          <div className="pit-label">
            {isInPit ? 'Send to Track' : driver.state}
          </div>
          {isInPit ? (
            !showPitOptions ? (
              <>
                <div style={{ fontSize: '0.8em', marginBottom: '4px' }}>
                  Set #{selectedTireSet + 1} ({driver.tireSets[selectedTireSet]?.condition.toFixed(0)}%)
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    className="pit-option"
                    onClick={() => setShowPitOptions(true)}
                    disabled={!canSendToTrack}
                    style={{ flex: 1, fontSize: '0.7em' }}
                  >
                    Config
                  </button>
                  <button 
                    className="pit-btn"
                    onClick={handleSendToTrack}
                    disabled={!canSendToTrack || driver.tireSets[selectedTireSet]?.condition <= 0}
                    style={{ flex: 2, fontSize: '0.7em' }}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="pit-options">
                <div style={{ marginBottom: '8px' }}>
                  {driver.tireSets.map((tireSet, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTireSet(index)}
                      disabled={tireSet.condition <= 0}
                      style={{
                        margin: '2px',
                        padding: '2px 6px',
                        fontSize: '0.7em',
                        backgroundColor: selectedTireSet === index ? driver.color : 
                                       tireSet.condition <= 0 ? '#444' : '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px'
                      }}
                    >
                      #{index + 1} ({tireSet.condition.toFixed(0)}%)
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    className="pit-option"
                    onClick={() => setShowPitOptions(false)}
                    style={{ flex: 1, fontSize: '0.7em' }}
                  >
                    ✗
                  </button>
                  <button 
                    className="pit-btn"
                    onClick={handleSendToTrack}
                    disabled={!canSendToTrack || driver.tireSets[selectedTireSet]?.condition <= 0}
                    style={{ flex: 2, fontSize: '0.7em' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ fontSize: '0.8em', textAlign: 'center', padding: '8px' }}>
              {driver.lapPhase && <div>Phase: {driver.lapPhase}</div>}
              {driver.currentSpeed && <div>Speed: {driver.currentSpeed.toFixed(1)}</div>}
              {formatTime(driver.bestLapTime) !== '-' && <div>Best: {formatTime(driver.bestLapTime)}</div>}
            </div>
          )}
        </div>
      </div>

      {!isEditable && (
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

QualifyingDriverCard.propTypes = {
  driver: PropTypes.object.isRequired,
  sessionActive: PropTypes.bool.isRequired,
  sessionFinished: PropTypes.bool.isRequired,
  sendDriverToTrack: PropTypes.func.isRequired,
  highlightedDriver: PropTypes.string,
  setHighlightedDriver: PropTypes.func.isRequired,
  isEditable: PropTypes.bool
};

export default QualifyingDriverCard;