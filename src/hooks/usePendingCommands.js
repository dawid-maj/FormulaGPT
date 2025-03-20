import { useEffect } from 'react';

export const usePendingCommands = ({
  pendingCommands,
  setPendingCommands,
  aiPendingCommands,
  setAiPendingCommands,
  paused,
  setupComplete,
  pathLength,
  handleCommandSubmit
}) => {

  // Process player commands
  useEffect(() => {
    if (pendingCommands.length > 0 && !paused && setupComplete && pathLength > 0) {
      const commandToApply = pendingCommands[0];
      handleCommandSubmit({ preventDefault: () => {} }, commandToApply);
      setPendingCommands(prev => prev.slice(1));
    }
  }, [pendingCommands, paused, setupComplete, pathLength, handleCommandSubmit, setPendingCommands]);

  // Process AI commands
  useEffect(() => {
    if (aiPendingCommands.length > 0 && !paused && setupComplete && pathLength > 0) {
      aiPendingCommands.forEach(({ team, command }) => {
        handleCommandSubmit({ preventDefault: () => {} }, command, team);
      });
      setAiPendingCommands([]);
    }
  }, [aiPendingCommands, paused, setupComplete, pathLength, handleCommandSubmit, setAiPendingCommands]);
};
