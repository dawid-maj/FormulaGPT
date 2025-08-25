import React from 'react';

const ApiErrorBanner = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="api-error-banner" style={{
      backgroundColor: '#f44336',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{error}</span>
      <button 
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ApiErrorBanner;