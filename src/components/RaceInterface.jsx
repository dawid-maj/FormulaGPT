import React from 'react';
import { RaceTrack } from './RaceTrack';
import { Scoreboard } from './Scoreboard';
import TeamControls from './TeamControls';
import { trackPoints, MAX_LAPS } from '../data/constants';

const RaceInterface = ({
  // Race data
  cars,
  raceTime,
  pathRef,
  pathLength,
  events,
  
  // Race control
  paused,
  setPaused,
  showResults,
  highlightedDriver,
  setHighlightedDriver,
  handleCommandSubmit,
  onExitToMenu,
  
  // API & Notifications
  apiResponsesPending,
  aiPendingCommands,
  notifications,
  selectedNotification,
  setSelectedNotification,
  isModalOpen,
  setIsModalOpen,
  setNotificationPause,
  
  // Team data
  availableTeams,
  teamControl,
  teamColors
}) => {
  return (
    <>
      <div className="layout-container">
        <div className="race-track-column">
          <RaceTrack
            trackPoints={trackPoints}
            cars={cars}
            pathRef={pathRef}
            pathLength={pathLength}
            paused={paused}
            setPaused={setPaused}
            setIsModalOpen={(isOpen) => {
              setIsModalOpen(isOpen);
              if (!isOpen) {
                setSelectedNotification(null);
              }
            }}
            notifications={notifications}
            setSelectedNotification={setSelectedNotification}
            setNotificationPause={setNotificationPause}
            wasPaused={paused}
            availableTeams={availableTeams}
            selectedNotification={selectedNotification}
            teamColors={teamColors}
            apiResponsesPending={apiResponsesPending}
            aiPendingCommands={aiPendingCommands}
            isModalOpen={isModalOpen}
            raceTime={raceTime}
            highlightedDriver={highlightedDriver}
            setHighlightedDriver={setHighlightedDriver}
          />
        </div>

        <div className="card p-2">
          <Scoreboard 
            cars={cars}
            pathLength={pathLength}
            currentLap={cars[0]?.laps || 0}
            maxLaps={MAX_LAPS}
            raceTime={raceTime}
            showResults={showResults}
            availableTeams={availableTeams}
            events={events}
            onExitToMenu={onExitToMenu}
            highlightedDriver={highlightedDriver}
            setHighlightedDriver={setHighlightedDriver}
          />
        </div>
      </div>
      
      <TeamControls
        availableTeams={availableTeams}
        cars={cars}
        teamControl={teamControl}
        handleCommandSubmit={handleCommandSubmit}
        paused={paused}
        highlightedDriver={highlightedDriver}
        setHighlightedDriver={setHighlightedDriver}
      />
    </>
  );
};

export default RaceInterface;