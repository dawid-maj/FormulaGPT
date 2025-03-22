import {
  MAX_LAPS,
  PITLANE_LENGTH,
  PITLANE_SPEED,
  FOLLOWING_PENALTY,
  TIRE_TYPES,
  TIRE_DEGRADATION,
  PITSTOP_TIME_PENALTY
} from './constants';

/**
 * Returns a shared Race Details snippet for prompts.
 * @param {number} actualPathLength - computed length of the track in px
 */
export function getRaceDetailsSnippet(actualPathLength) {
  return `Race Details:
- Track length: ${actualPathLength} px.
- Number of laps: ${MAX_LAPS}
- Pit stop lane: ${PITLANE_LENGTH} px long (${PITLANE_LENGTH/2} px before and ${PITLANE_LENGTH/2} px after the finish line). When a driver enters the pit lane, their speed is limited to ${PITLANE_SPEED} px/s.
- Mandatory Pit Stop Rules:
  * Each driver must make at least one pit stop during the race
  * Each driver must use at least two different tire compounds during the race, under penalty of disqualification.
- Tires and Speed:
  - Soft tires (S): base speed ${TIRE_TYPES.SOFT.speed} px/s  
  - Medium tires (M): base speed ${TIRE_TYPES.MEDIUM.speed} px/s  
  - Hard tires (H): base speed ${TIRE_TYPES.HARD.speed} px/s
- Tire degradation per second:
  - Soft tires: ${TIRE_DEGRADATION.SOFT}%
  - Medium tires: ${TIRE_DEGRADATION.MEDIUM}%
  - Hard tires: ${TIRE_DEGRADATION.HARD}%
- Effective speed is calculated as:
  effective speed = base speed - (base speed * (100 - tire condition)) / 200
- Overtaking: If a driver is directly behind another, their speed is further reduced by ${FOLLOWING_PENALTY} px/s.
- Note: In the race update table, if the gap value is followed by an exclamation mark (e.g. "0.62s !"), it indicates that the driver is blocked by another car (i.e. their speed is affected by the following penalty).`;
}

/**
 * Returns a snippet about the proposed long-term strategy
 */
export function getLongTermStrategySnippet() {
  return `* In your reasoning, you may include a section titled "Proposed Long-Term Strategy", outlining an initial pit stop plan for both drivers for the remainder of the race. It can adapt during the race, but serves as a useful baseline for tire management and overall race control.`;
}

/**
 * Returns a snippet about pit stop time penalty
 */
export function getPitStopPenaltySnippet() {
  return `* Weigh the time lost in the pit lane against potential speed gains from fresher tires. A pit stop costs you approximately ${PITSTOP_TIME_PENALTY} seconds compared to drivers who do not pit.`;
}
