import React from 'react';
import { teamColors } from '../data/teamMapping';
import { getModelDisplayName } from '../data/modelConfig';

const formatBoldText = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

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
  const getNotificationModelName = (notification) => {
    if (!notification || !notification.model) return '';
    return getModelDisplayName(notification.model);
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
          padding: '0.75rem 1rem',
          minHeight: '3rem',
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
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              fontFamily: 'Titillium Web, sans-serif'
            }}>
              <div>{selectedNotification ? selectedNotification.team : "Team Messages"}</div>
              {selectedNotification && (
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  fontWeight: 'normal',
                  textTransform: 'none'
                }}>
                  {getNotificationModelName(selectedNotification)}
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
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.1rem 0',
                    fontFamily: 'Titillium Web, sans-serif'
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
                    →
                  </button>
                </div>
                <div className="notification-content" style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  padding: '1rem',
                  margin: '0.5rem 0rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontFamily: 'Titillium Web, sans-serif'
                }}>
                  <div 
                    style={{ whiteSpace: 'pre-wrap', margin: 0, textAlign: 'left' }}
                    dangerouslySetInnerHTML={{ __html: formatBoldText(selectedNotification.content) }}
                  />
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    fontFamily: 'Titillium Web, sans-serif'
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
                          {getNotificationModelName(notification)}
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
                    <div 
                      className="notification-preview"
                      style={{ 
                        whiteSpace: 'pre-wrap', 
                        margin: 0, 
                        textAlign: 'left',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4em',
                        maxHeight: '2.8em' // 2 lines * 1.4em line-height
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: formatBoldText(notification.content.replace(/\n/g, ' ') + '...') 
                      }}
                    />
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
