import React from 'react';
import { teamColors } from '../data/teamMapping';

export const TeamResponses = ({ conversationHistory, teams, onTeamClick }) => {
  return (
    <div className="team-responses-container mt-4 grid grid-cols-5 gap-4" style={{ 
      width: '780px', 
      marginLeft: '0.5rem',
      padding: '0 0.5rem'
    }}>
      {teams.map(team => {
        const teamHistory = conversationHistory[team] || [];
        const lastResponse = teamHistory.filter(msg => msg.role === "assistant").pop();
        
        return (
          <div 
            key={team} 
            className="team-response-card p-4 rounded shadow cursor-pointer"
            onClick={() => onTeamClick(team)}
            style={{ 
              borderLeft: `4px solid ${teamColors[team]}`,
              minHeight: '180px',
              backgroundColor: '#1a1a1a',
              color: '#fff'
            }}
          >
            <h3 className="font-bold mb-2" style={{ color: teamColors[team] }}>{team}</h3>
            <div className="response-content text-sm" style={{ 
              maxHeight: '130px',
              overflowY: 'auto',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {lastResponse ? lastResponse.content : 'Waiting for response...'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
