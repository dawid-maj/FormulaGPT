/**
 * Qualifying team controls component - styled like TeamControls but for qualifying
 */
import React, { useMemo, memo } from 'react';
import QualifyingDriverCard from './QualifyingDriverCard';

const QualifyingTeamControls = ({ 
  drivers,
  sessionActive,
  sessionFinished,
  sendDriverToTrack,
  highlightedDriver,
  setHighlightedDriver
}) => {
  console.log('QualifyingTeamControls rendering with:', { driversCount: drivers?.length });
  
  // Sort drivers by current position in results
  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => {
      // First by best lap time (if they have one)
      if (a.bestLapTime && b.bestLapTime) {
        return a.bestLapTime - b.bestLapTime;
      }
      if (a.bestLapTime && !b.bestLapTime) return -1;
      if (!a.bestLapTime && b.bestLapTime) return 1;
      
      // Then by number of attempts
      const aAttempts = a.attempts?.length || 0;
      const bAttempts = b.attempts?.length || 0;
      if (aAttempts !== bAttempts) return bAttempts - aAttempts;
      
      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }, [drivers]);

  const driverCards = useMemo(() => {
    return sortedDrivers.map((driver, index) => (
      <QualifyingDriverCard
        key={driver.name}
        driver={driver}
        sessionActive={sessionActive}
        sessionFinished={sessionFinished}
        sendDriverToTrack={sendDriverToTrack}
        highlightedDriver={highlightedDriver}
        setHighlightedDriver={setHighlightedDriver}
        isEditable={true}
      />
    ));
  }, [
    sortedDrivers, 
    sessionActive, 
    sessionFinished, 
    sendDriverToTrack, 
    highlightedDriver, 
    setHighlightedDriver
  ]);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '1rem',
      marginTop: '1rem',
      width: '100%',
      paddingLeft: '0rem'
    }}>
      {driverCards}
    </div>
  );
};

export default memo(QualifyingTeamControls);