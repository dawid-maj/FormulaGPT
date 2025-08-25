import React from 'react';

const ExitConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '15%',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        padding: '20px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #333'
      }}>
        <h3 style={{ marginTop: 0 }}>Exit to Menu?</h3>
        <p>
          Are you sure you want to exit to the main menu? All race progress will be lost. 
          To start a new race and clear all data (including conversation history with the models), 
          please refresh your browser.
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginTop: '20px' 
        }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;