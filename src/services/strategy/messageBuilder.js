/**
 * Message building utilities for AI communication
 */

import { PITSTOP_TIME_PENALTY } from '../../data/constants';

/**
 * Formats race time from seconds to MM:SS format
 * @param {number} raceTimeVal - Race time in seconds
 * @returns {string} Formatted time string
 */
export function formatRaceTime(raceTimeVal) {
  const minutes = Math.floor(raceTimeVal / 60);
  const seconds = Math.floor(raceTimeVal % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Builds scoreboard text for AI context
 * @param {Array} scoreboardVal - Scoreboard data
 * @param {number} pathLength - Track path length
 * @returns {string} Formatted scoreboard text
 */
export function buildScoreboardText(scoreboardVal, pathLength) {
  return scoreboardVal.map(item => {
    const normalizedDistance = ((item.distanceTraveled % pathLength) + pathLength) % pathLength;
    const distPercent = Math.round((normalizedDistance / pathLength) * 100);
    
    return [
      `P${item.position}: ${item.name}`,
      `tires: ${item.tires.name}`,
      `cond: ${Math.round(item.tires.condition)}%`,
      `speed: ${item.currentSpeed?.toFixed(1) ?? item.tires.speed}`,
      `interval: ${item.position === 1 ? '---' : `+${item.interval.toFixed(2)}`}`,
      `laps: ${item.laps}`,
      `lap dist: ${distPercent}%`,
      `status: ${item.status}`,
      `tire history: ${item.tireHistory.join('-')}`,
      `last lap: ${item.lastLapTime ? item.lastLapTime.toFixed(2) : '-'}`
    ].join(', ');
  }).join('\n');
}

/**
 * Builds events text from filtered events
 * @param {Array} eventsVal - All events
 * @param {number} lastSentTime - Last sent time for filtering
 * @returns {string} Formatted events text
 */
export function buildEventsText(eventsVal, lastSentTime) {
  const newEvents = eventsVal.filter(event => event.time >= lastSentTime);
  return newEvents.reverse().map(event => `${event.timestamp} - ${event.details}`).join('\n');
}

/**
 * Builds driver situation text for team
 * @param {Array} teamDrivers - Team driver names
 * @param {Array} scoreboardVal - Scoreboard data
 * @param {number} pathLength - Track path length
 * @param {number} totalLaps - Total race laps
 * @returns {string} Formatted driver situation text
 */
export function buildDriverSituationText(teamDrivers, scoreboardVal, pathLength, totalLaps = 12) {
  return teamDrivers
    .map(driver => {
      const car = scoreboardVal.find(item => item.name.toLowerCase() === driver.toLowerCase());
      if (car) {
        const normalizedDistance = ((car.distanceTraveled % pathLength) + pathLength) % pathLength;
        const progressFraction = normalizedDistance / pathLength;
        const lapsRemaining = totalLaps - (car.laps + progressFraction) + 1;
        
        // Format pit stop projection information
        let pitProjectionText = "";
        if (car.pitProjection) {
          const { projectedPosition, projectedGap, carAhead } = car.pitProjection;
          pitProjectionText = ` Pit projection: P${projectedPosition} (${PITSTOP_TIME_PENALTY}s loss)${carAhead ? ` | After stop: ${projectedGap.toFixed(1)}s behind ${carAhead}` : ''}`;
        }
        
        return { 
          driver, 
          position: car.position, 
          text: `P${car.position} ${driver} [${lapsRemaining.toFixed(2)} laps left]${pitProjectionText}` 
        };
      }
      return { driver, position: 999, text: `P- ${driver} ? laps remaining` };
    })
    .sort((a, b) => a.position - b.position)
    .map(item => item.text)
    .join(';\n');
}

/**
 * Builds enhanced pre-race context for initial race queries
 * @param {Array} scoreboardVal - Starting grid data
 * @param {Object} driverTeamMapping - Driver to team mapping
 * @param {Array} teamDrivers - Team driver names
 * @param {Object} preRaceResponse - Previous AI response
 * @returns {string} Enhanced pre-race context
 */
export function buildEnhancedPreRaceContext(scoreboardVal, driverTeamMapping, teamDrivers, preRaceResponse) {
  // Create a formatted qualifying list from the scoreboard
  const qualifyingList = scoreboardVal.map(item => 
    `P${item.position}: ${item.name} (${driverTeamMapping[item.name] || "Unknown Team"})`
  ).join('\n');
  
  // Extract tire choices from the pre-race response
  let driver1Tire = "unknown";
  let driver2Tire = "unknown";
  
  // Try to extract tire choices from the pre-race response
  const tireMatches = [...preRaceResponse.content.matchAll(/([a-zA-Z]+)\s+tire\s+(soft|medium|hard)/gi)];
  if (tireMatches.length > 0) {
    tireMatches.forEach(match => {
      const driver = match[1].toUpperCase();
      const tire = match[2].toLowerCase();
      if (driver === teamDrivers[0]) {
        driver1Tire = tire;
      } else if (teamDrivers[1] && driver === teamDrivers[1]) {
        driver2Tire = tire;
      }
    });
  }
  
  return `Alright, before the race, here's a quick recap of yesterday's qualifying session:\n\n${qualifyingList}\n\nJust a reminder, we decided to go with ${driver1Tire} tires for ${teamDrivers[0]}${teamDrivers[1] ? ` and ${driver2Tire} tires for ${teamDrivers[1]}` : ''}. Here's the reasoning you shared with your team yesterday:\n"\n${preRaceResponse.content}"\n###\nThat was your line of thinking. In the next message, you'll receive the starting table, and you'll decide the pace of your drivers for the first lap.`;
}

/**
 * Builds the full context message for AI queries
 * @param {string} raceTimeStr - Formatted race time
 * @param {number} currentLap - Current lap number
 * @param {number} totalLaps - Total laps
 * @param {string} scoreboardText - Formatted scoreboard
 * @param {string} eventsText - Formatted events
 * @param {boolean} isInitial - Whether this is initial race query
 * @param {string} driverSituation - Driver situation text
 * @returns {string} Full context message
 */
export function buildFullContext(raceTimeStr, currentLap, totalLaps, scoreboardText, eventsText, isInitial, driverSituation) {
  const extraReminder = `Remember, you are responsible for the success of your drivers. Current situation of your drivers:\n${driverSituation}.\nIn your reasoning and decisions, focus on ensuring their success. Important: The commands listed in the "Actions" section apply immediately to the current lap. Although you may freely discuss and propose strategic plans for upcoming laps, remember that any command you explicitly include in "Actions" will be executed right away, within this lap.`;
  
  return `Race Time: ${raceTimeStr} | Lap: ${currentLap}/${totalLaps}\n\nActual Results:\n${scoreboardText}\n\nLast Events:\n${eventsText}\n\n${isInitial ? 'NOTE: This is the beginning of the race.' : ''}\n${extraReminder}`;
}