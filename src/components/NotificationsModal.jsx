import React from 'react';
import { teamColors } from '../data/teamMapping';

export const NotificationsModal = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onNotificationClick,
  selectedNotification,
  notificationPause,
  raceTime
}) => {
  if (!isOpen) return null;

  // Helper function to get model display name
  const getModelDisplayName = (notification) => {
    if (!notification || !notification.model) return '';
    
    // For OpenAI models
    if (notification.model === 'gpt-4o') return 'GPT-4o';
    if (notification.model === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (notification.model === 'gpt-3.5-turbo') return 'GPT-3.5 Turbo';
    
    // For OpenRouter models
    if (notification.model === 'google/gemini-2.0-flash-001') return 'Gemini 2.0 Flash';
    if (notification.model === 'google/gemini-2.0-flash-lite-001') return 'Gemini 2.0 Flash Lite';
    if (notification.model === 'google/gemini-2.0-flash-lite-001-free') return 'Gemini 2.0 Flash Lite (Free)';
    if (notification.model === 'anthropic/claude-3.5-haiku') return 'Claude 3.5 Haiku';
    if (notification.model === 'anthropic/claude-3.5-sonnet') return 'Claude 3.5 Sonnet';
    if (notification.model === 'deepseek/deepseek-chat') return 'DeepSeek V3';
    if (notification.model === 'meta-llama/llama-3.3-70b-instruct') return 'Llama 3.3 70B';
    
    // If it's a known model ID but not in our mapping, just return the model ID
    return notification.model;
  };

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
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        margin: 0,
        padding: '1rem',
        borderRadius: 0,
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
          padding: '0.05rem 0.75rem',
          minHeight: '1.2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: selectedNotification ? 
            `linear-gradient(145deg, ${teamColors[selectedNotification.team]} 0%, ${teamColors[selectedNotification.team]}dd 100%)` :
            'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '8px 8px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {selectedNotification && (
              <button 
                onClick={() => onNotificationClick(null)}
                style={{ 
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.25rem 0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
              >
                ←
              </button>
            )}
            <h2 style={{ 
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
              <div>{selectedNotification ? selectedNotification.team : "Team Messages"}</div>
              {selectedNotification && (
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  fontWeight: 'normal',
                  textTransform: 'none'
                }}>
                  {getModelDisplayName(selectedNotification)}
                </div>
              )}
            </h2>
          </div>
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
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {selectedNotification ? (
            <div className="notification-detail">
              <div className="notification-detail-container">
                <div className="notification-navigation">
                  <button
                    onClick={() => {
                      const teamMessages = notifications.filter(n => n.team === selectedNotification.team);
                      const currentIndex = teamMessages.findIndex(n => n.timestamp === selectedNotification.timestamp);
                      if (currentIndex < teamMessages.length - 1) {
                        onNotificationClick(teamMessages[currentIndex + 1]);
                      }
                    }}
                    className="nav-arrow left"
                  >
                    ←
                  </button>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.1rem 0'
                  }}>
                    {(() => {
                      const teamMessages = notifications.filter(n => n.team === selectedNotification.team);
                      const currentIndex = teamMessages.findIndex(n => n.timestamp === selectedNotification.timestamp);
                      return (
                        <>
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            {teamMessages.length - currentIndex}/{teamMessages.length}
                          </span>
                          <span className="notification-time">
                            {Math.floor(selectedNotification.raceTime / 60)}:{Math.floor(selectedNotification.raceTime % 60).toString().padStart(2, '0')}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => {
                      const teamMessages = notifications.filter(n => n.team === selectedNotification.team);
                      const currentIndex = teamMessages.findIndex(n => n.timestamp === selectedNotification.timestamp);
                      if (currentIndex > 0) {
                        onNotificationClick(teamMessages[currentIndex - 1]);
                      }
                    }}
                    className="nav-arrow right"
                  >
                    →
                  </button>
                </div>
                <div className="notification-content" style={{
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}>
                  {selectedNotification.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    borderRadius: '8px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onClick={() => onNotificationClick(notification)}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ 
                        color: teamColors[notification.team],
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}>
                        {notification.team}
                      </span>
                      {notification.model && (
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.7rem'
                        }}>
                          {getModelDisplayName(notification)}
                        </span>
                      )}
                    </div>
                    <span style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      fontFamily: 'ui-monospace, monospace',
                    }}>
                      {Math.floor(notification.raceTime / 60)}:{Math.floor(notification.raceTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    
                  }}>
                    {notification.content.substring(0, 180)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
