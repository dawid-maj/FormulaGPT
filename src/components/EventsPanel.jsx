import React from 'react';

export const EventsPanel = ({ events = [] }) => {
  // Bierzemy maksymalnie 30 najnowszych eventów
  const recentEvents = events.slice(0, 30);

  return (
    <div className="events-panel">
      <div className="classification-header" style={{ gridTemplateColumns: '100px 1fr' }}>
        <div>Time</div>
        <div>Event</div>
      </div>
      <div className="events-container" style={{ maxHeight: '340px', overflowY: 'auto', minHeight: '340px' }}>
        {recentEvents.length === 0 ? (
          <div className="classification-row" style={{ gridTemplateColumns: '100px 1fr' }}>
            <div>-</div>
            <div>No events to display</div>
          </div>
        ) : (
          recentEvents.map((event, index) => (
            <div key={index} className="classification-row" style={{ gridTemplateColumns: '100px 1fr' }}>
              <div>{event.timestamp}</div>
              <div style={{ textAlign: 'left' }}>{event.details}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};