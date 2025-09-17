/**
 * Main qualifying session interface component
 * Uses same layout structure as RaceInterface for consistency
 */
import React from 'react';
import { RaceTrack } from './RaceTrack';
import QualifyingScoreboard from './QualifyingScoreboard';
import QualifyingTeamControls from './QualifyingTeamControls';
import { trackPoints, QUALIFYING_SESSION_DURATION } from '../data/constants';

const QualifyingInterface = ({
  // Session state
  sessionActive,
  sessionTime,
  sessionFinished,
  paused,
  setPaused,
  
  // Track and drivers
  pathRef,
  pathLength,
  drivers,
  trackGrip,
  
  // Driver management
  sendDriverToTrack,
  
  // Results and events
  qualifyingResults,
  events,
  
  // UI state
  highlightedDriver,
  setHighlightedDriver,
  
  // Session control
  onExitToMenu
}) => {
  console.log('QualifyingInterface rendering with:', { 
    driversCount: drivers?.length, 
    resultsCount: qualifyingResults?.length, 
    sessionActive 
  });

  return (
    <>
      <div className="layout-container">
        <div className="race-track-column">
          <RaceTrack
            trackPoints={trackPoints}
            cars={drivers.map(driver => ({
              name: driver.name,
              color: driver.color,
              dotColor: driver.dotColor,
              distanceTraveled: driver.distanceTraveled,
              status: driver.state,
              currentSpeed: driver.currentSpeed
            }))}
            pathRef={pathRef}
            pathLength={pathLength}
            paused={paused}
            setPaused={setPaused}
            highlightedDriver={highlightedDriver}
            setHighlightedDriver={setHighlightedDriver}
            // Qualifying specific props
            mode="qualifying"
            sessionTime={sessionTime}
            trackGrip={trackGrip}
            // Empty handlers for unused race props
            setIsModalOpen={() => {}}
            notifications={[]}
            setSelectedNotification={() => {}}
            setNotificationPause={() => {}}
            wasPaused={paused}
            availableTeams={[]}
            selectedNotification={null}
            teamColors={{}}
            apiResponsesPending={false}
            aiPendingCommands={[]}
            isModalOpen={false}
            raceTime={sessionTime}
          />
        </div>

        <div className="card p-2">
          <QualifyingScoreboard 
            results={qualifyingResults}
            events={events}
            sessionTime={sessionTime}
            trackGrip={trackGrip}
            sessionActive={sessionActive}
            sessionFinished={sessionFinished}
            onExitToMenu={onExitToMenu}
            highlightedDriver={highlightedDriver}
            setHighlightedDriver={setHighlightedDriver}
          />
        </div>
      </div>
      
      <QualifyingTeamControls
        drivers={drivers}
        sessionActive={sessionActive}
        sessionFinished={sessionFinished}
        sendDriverToTrack={sendDriverToTrack}
        highlightedDriver={highlightedDriver}
        setHighlightedDriver={setHighlightedDriver}
      />
    </>
  );
};

export default QualifyingInterface;