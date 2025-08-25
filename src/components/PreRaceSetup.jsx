import React from 'react';
import PreRaceMenu from './PreRaceMenu';
import ApiConfigModal from './ApiConfigModal';
import { generateAIStrategy, sendTeamQuery } from '../services/aiService';
import { defaultPathLength } from '../data/teamPrompts';

const PreRaceSetup = ({
  availableTeams,
  teamControl,
  setTeamControl,
  cars,
  setCars,
  conversationHistory,
  setConversationHistory,
  apiConfig,
  setApiConfig,
  apiError,
  setApiError,
  isApiConfigModalOpen,
  setIsApiConfigModalOpen,
  setNotifications,
  setAiPendingCommands,
  teamLastEventTimeRef,
  pathLength,
  onRaceStart
}) => {
  const handleGenerateAIStrategy = (team, startingGrid) => {
    return generateAIStrategy(
      team, 
      startingGrid, 
      apiConfig, 
      setApiError, 
      setCars, 
      setConversationHistory,
      setTeamControl
    );
  };

  const handleStartRace = (grid) => {
    const aiTeams = availableTeams.filter(team => teamControl[team].type === "ai");
    
    if (aiTeams.length > 0) {
      const scoreboardVal = grid.map((gridItem, index) => ({
        name: gridItem.name,
        tires: gridItem.tires,
        laps: 0,
        distanceTraveled: gridItem.distanceTraveled,
        position: index + 1,
        interval: 0,
        status: "Racing",
        tireHistory: [gridItem.tires.name],
        pathLength: defaultPathLength
      }));

      const apiPromises = aiTeams.map(team => 
        sendTeamQuery({
          team,
          scoreboardVal,
          eventsVal: [],
          raceTimeVal: 0,
          conversationHistoryVal: conversationHistory,
          isInitial: true,
          apiConfig,
          setApiError,
          setConversationHistory,
          setNotifications,
          setAiPendingCommands,
          teamLastEventTimeRef,
          pathLength: pathLength || defaultPathLength
        })
      );

      onRaceStart(grid, apiPromises);
    } else {
      onRaceStart(grid, []);
    }
  };

  return (
    <>
      <PreRaceMenu
        availableTeams={availableTeams}
        teamControl={teamControl}
        setTeamControl={setTeamControl}
        cars={cars}
        setCars={setCars}
        onGenerateAIStrategy={handleGenerateAIStrategy}
        conversationHistory={conversationHistory}
        onOpenApiConfig={() => setIsApiConfigModalOpen(true)}
        apiError={apiError}
        setApiError={setApiError}
        onStartRace={handleStartRace}
      />
      <ApiConfigModal
        isOpen={isApiConfigModalOpen}
        onClose={() => setIsApiConfigModalOpen(false)}
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
        availableTeams={availableTeams}
      />
    </>
  );
};

export default PreRaceSetup;