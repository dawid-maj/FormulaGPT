import React from 'react';
import { Typography, Box } from '@mui/material';
import { TIRE_TYPES, MAX_LAPS, PITLANE_LENGTH, PITLANE_SPEED, PITSTOP_TIME_PENALTY, TIRE_DEGRADATION, DRIVING_STYLES, trackPoints, FOLLOWING_PENALTY } from '../data/constants';

export const RaceInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ 
      position: 'absolute',
      top: 25,
      left: 0,
      width: '100%',
      height: '92%',
      background: 'rgba(0, 0, 0, 0.92)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      pointerEvents: 'auto'
    }}>
      <div className="modal-content" style={{
        width: '100%',
        maxWidth: '600px',
        margin: '2rem',
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #1a2234 0%, #0c1220 100%)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}>
        <div className="modal-header" style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          minHeight: '3rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '8px 8px 0 0'
        }}>
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
            Race Information
          </Typography>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.15rem 0.5rem',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>
        <Box sx={{ p: 3, color: '#ffffff' }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            <strong>Basic Race Parameters</strong><br />
            • Track length: {(() => {
                let length = 0;
                for (let i = 1; i < trackPoints.length; i++) {
                  const dx = trackPoints[i].x - trackPoints[i-1].x;
                  const dy = trackPoints[i].y - trackPoints[i-1].y;
                  length += Math.sqrt(dx * dx + dy * dy);
                }
                return Math.round(length);
              })()}px<br />
            • Number of laps: {MAX_LAPS}<br />
            • Pit stop lane length: {PITLANE_LENGTH}px ({PITLANE_SPEED}px/s speed limit)<br />
            • Estimated pit stop time loss: {PITSTOP_TIME_PENALTY}s<br />
            • Following penalty: {FOLLOWING_PENALTY}px/s speed loss when in dirty air
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            <strong>Tire Compounds</strong><br />
            • Soft (S): {TIRE_TYPES.SOFT.speed}px/s, wear rate {TIRE_DEGRADATION.SOFT}/s<br />
            • Medium (M): {TIRE_TYPES.MEDIUM.speed}px/s, wear rate {TIRE_DEGRADATION.MEDIUM}/s<br />
            • Hard (H): {TIRE_TYPES.HARD.speed}px/s, wear rate {TIRE_DEGRADATION.HARD}/s
          </Typography>

          <Typography variant="body1">
            <strong>Driving Styles</strong><br />
            • Push: Speed +{DRIVING_STYLES.PUSH.speedModifier}px/s, Wear +{DRIVING_STYLES.PUSH.wearModifier}/s<br />
            • Normal: No modifiers<br />
            • Conserve: Speed {DRIVING_STYLES.CONSERVE.speedModifier}px/s, Wear {DRIVING_STYLES.CONSERVE.wearModifier}/s
          </Typography>
        </Box>
      </div>
    </div>
  );
};
