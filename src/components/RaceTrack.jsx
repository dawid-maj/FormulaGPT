import React from 'react';
import { motion } from "framer-motion";
import { catmullRom2bezier } from '../utils/catmullRom2bezier';
import { PITLANE_LENGTH } from '../data/constants';
import { NotificationsModal } from './NotificationsModal';

export const RaceTrack = ({ 
  trackPoints, 
  cars, 
  pathRef, 
  pathLength,
  paused = false,
  setPaused = () => {},
  setIsModalOpen = () => {},
  notifications = [],
  setSelectedNotification = () => {},
  setNotificationPause = () => {},
  notificationPause = false,
  availableTeams = [],
  selectedNotification = null,
  teamColors = {},
  apiResponsesPending = false,
  isModalOpen = false,
  raceTime = 0,
  highlightedDriver = null,
  setHighlightedDriver = () => {}
}) => {
  // Compute the current leader based on laps and normalized distance
  const sortedCars = [...cars].sort((a, b) => {
    if (b.laps !== a.laps) return b.laps - a.laps;
    const rawA = ((a.distanceTraveled % pathLength) + pathLength) % pathLength;
    const rawB = ((b.distanceTraveled % pathLength) + pathLength) % pathLength;
    return rawB - rawA;
  });
  const leaderName = sortedCars[0]?.name;

  const trackPathD = catmullRom2bezier(trackPoints, true);

  return (
    <div className="border rounded-2xl p-2 inline-block h-full" style={{ position: 'relative' }}>
      <div className="race-nav-bar">
        <button 
          className="race-nav-button"
          onClick={() => setPaused(prev => !prev)}
          disabled={apiResponsesPending}
        >
          {apiResponsesPending ? (
            <div className="spinner"></div>
          ) : (
            paused ? "Play" : "Stop"
          )}
        </button>
        <button 
          className="race-nav-item clickable"
          onClick={() => {
            setIsModalOpen(true);
            setSelectedNotification(null);
          }}
        >
          All ({notifications.length})
        </button>
        {availableTeams.map(team => (
          <button
            key={team}
            className="race-nav-item clickable"
            onClick={() => {
              const wasNotPaused = !paused;
              setNotificationPause(wasNotPaused);
              setIsModalOpen(true);
              const teamNotifications = notifications.filter(n => n.team === team);
              if (teamNotifications.length > 0) {
                setSelectedNotification(teamNotifications[0]);
              }
            }}
            style={{
              backgroundColor: selectedNotification?.team === team ? teamColors[team] : 'inherit'
            }}
          >
            {team} ({notifications.filter(n => n.team === team).length})
          </button>
        ))}
      </div>
      <svg viewBox="0 0 630 423" preserveAspectRatio="xMidYMid meet" className="race-track-bg" style={{width: '100%', height: 'auto'}}>
        <defs>
          {/* Gradient for the track. */}
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff5ba" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fffdd0" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff5ba" stopOpacity="0.8" />
          </linearGradient>
          

          {/* Filter for the track glow. */}
          <filter id="trackGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow under the track. */}
        <path
          d={trackPathD}
          stroke="#000"
          strokeWidth={8}
          fill="none"
          filter="blur(8px)"
          opacity={0.3}
          transform="translate(2, 2)"
        />


        {/* Main track path with glow. */}
        <path
          ref={pathRef}
          d={trackPathD}
          stroke="url(#trackGradient)"
          strokeWidth={5}
          fill="none"
          filter="url(#trackGlow)"
          style={{
            filter: "drop-shadow(0 0 3px rgba(255, 245, 186, 0.5))"
          }}
        />
        {/* Additional track outline. */}
        <path
          d={trackPathD}
          stroke="rgba(255, 245, 186, 0.2)"
          strokeWidth={12}
          fill="none"
          style={{
            filter: "drop-shadow(0 0 3px rgba(249, 255, 186, 0.3))"
          }}
        />
        {/* Pit lane with gradient and animation. */}
        {pathRef.current && (
          <>
            <path
              d={trackPathD}
              stroke="#333"
              strokeWidth={9}
              fill="none"
              strokeDasharray={`${pathLength - PITLANE_LENGTH} ${PITLANE_LENGTH}`}
              strokeDashoffset={-PITLANE_LENGTH / 2}
            />
            <path
              className="pit-lane-path"
              d={trackPathD}
              stroke="linear-gradient(90deg, #666, #999)"
              strokeWidth={7}
              fill="none"
              strokeDasharray={`${pathLength - PITLANE_LENGTH} ${PITLANE_LENGTH}`}
              strokeDashoffset={-PITLANE_LENGTH / 2}
            />
          </>
        )}

                {/* Pit lane */}

        {/* Definition of the checkered pattern. */}
        <defs>
          <pattern id="checkered" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="white"/>
            <rect x="2" y="0" width="2" height="2" fill="black"/>
            <rect x="0" y="2" width="2" height="2" fill="black"/>
            <rect x="2" y="2" width="2" height="2" fill="white"/>
          </pattern>
        </defs>
        
        {/* Start/finish line. */}
        {trackPoints.length > 0 && (
          <line
            x1={trackPoints[0].x}
            y1={trackPoints[0].y - 15}
            x2={trackPoints[0].x}
            y2={trackPoints[0].y + 15}
            stroke="url(#checkered)"
            strokeWidth={6}
          />
        )}
        
        {/* 75% track marker. */}
        {pathRef.current && pathLength > 0 && (
          (() => {
            const point = pathRef.current.getPointAtLength(pathLength * 0.75);
            const nextPoint = pathRef.current.getPointAtLength(pathLength * 0.75 + 1);
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) + Math.PI/2;
            return (
              <line
                x1={point.x + Math.cos(angle) * 5}
                y1={point.y + Math.sin(angle) * 5}
                x2={point.x - Math.cos(angle) * 5}
                y2={point.y - Math.sin(angle) * 5}
                stroke="#dae3aa"
                strokeWidth={8}
              />
            );
          })()
        )}
        {/* Cars. */}
        {[...cars].sort((a, b) => {
          // Highlighted car should be rendered last (on top)
          if (a.name === highlightedDriver) return 1;
          if (b.name === highlightedDriver) return -1;
          // Then sort by pit stop status
          if (a.inPitStop && !b.inPitStop) return -1;
          if (!a.inPitStop && b.inPitStop) return 1;
          return 0;
        }).map((car) => {
          let posX = trackPoints[0]?.x || 0;
          let posY = trackPoints[0]?.y || 0;
          
          if (pathRef.current && pathLength > 0 && !isNaN(car.distanceTraveled)) {
            try {
              const normalizedDistance = ((car.distanceTraveled % pathLength) + pathLength) % pathLength;
              if (isFinite(normalizedDistance)) {
                const pt = pathRef.current.getPointAtLength(normalizedDistance);
                
                // Calculate perpendicular offset for cars in pit stop
                if (car.inPitStop) {
                  // Get point slightly ahead to determine direction
                  const ptAhead = pathRef.current.getPointAtLength(normalizedDistance + 1);
                  // Calculate perpendicular vector
                  const dx = ptAhead.x - pt.x;
                  const dy = ptAhead.y - pt.y;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  // Normalize and rotate 90 degrees
                  const offsetX = -dy / length * -4; // 10 pixels offset
                  const offsetY = dx / length * -4;
                  
                  posX = pt.x + offsetX;
                  posY = pt.y + offsetY;
                } else {
                  posX = pt.x;
                  posY = pt.y;
                }
              }
            } catch (error) {
              console.warn(`Failed to calculate position for car ${car.name}:`, error);
            }
          }

          return (
            <g key={`${car.name}-${car.inPitStop ? 'pitstop' : (car.name === leaderName ? 'leader' : 'nonleader')}`}>
              <g
                onMouseEnter={() => setHighlightedDriver(car.name)}
                onMouseLeave={() => setHighlightedDriver(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Shadow under the car. */}
                <motion.circle
                  cx={posX}
                  cy={posY + 2}
                  r={highlightedDriver === car.name ? 10 : 8}
                  fill="rgba(0, 0, 0, 0.3)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Main car circle. */}
                <motion.circle
                  cx={posX}
                  cy={posY}
                  r={highlightedDriver === car.name ? 10 : 8}
                  fill={car.color}
                  style={{
                    stroke: "white",
                    strokeWidth: 1
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </g>
              {car.dotColor && (
                <motion.circle
                  cx={posX}
                  cy={posY}
                  r={2}
                  fill={car.dotColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {true && (
                <g style={{
                  filter: car.name === highlightedDriver ? 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' : 'none'
                }}>
                  <rect
                    x={posX -5}
                    y={posY - 25}
                    width={40}
                    height={20}
                    rx={5}
                    fill={car.name === highlightedDriver ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)'}
                  />
                  <text
                    x={posX +15}
                    y={posY - 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize={car.name === highlightedDriver ? "13" : "12"}
                    fontWeight={car.name === highlightedDriver ? "bold" : "normal"}
                  >
                    {car.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <NotificationsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
          if (notificationPause) {
            setPaused(false);
            setNotificationPause(false);
          }
        }}
        notifications={notifications}
        selectedNotification={selectedNotification}
        notificationPause={notificationPause}
        onNotificationClick={(notification) => {
          setSelectedNotification(notification);
        }}
        raceTime={raceTime}
      />
    </div>
  );
};
