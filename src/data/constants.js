/**
 * Array of track points defining the racing line
 * Each point is a coordinate {x, y} in pixels that forms the race track path
 * These points are used to create a smooth curve using Catmull-Rom spline interpolation
 */

export const trackPoints = [
  { x: 348, y: 327 },
  { x: 262, y: 327 },
  { x: 243, y: 305 },
  { x: 170, y: 305 },
  { x: 105, y: 286 },
  { x: 120, y: 259 },
  { x: 82,  y: 223 },
  { x: 105, y: 128 },
  { x: 133, y: 120 },
  { x: 170, y: 101 },
  { x: 238, y: 146 },
  { x: 283, y: 223 },
  { x: 370, y: 229 },
  { x: 389, y: 204 },
  { x: 460, y: 196 },
  { x: 545, y: 240 },
  { x: 510, y: 297 },
  { x: 460, y: 286 },
  { x: 460, y: 317 },
  { x: 416, y: 327 }
];






/**
 * Base tire degradation rates per second for each compound
 * Higher values mean faster wear
 */
export const TIRE_DEGRADATION = {
  SOFT: 0.18,    // Fastest wear rate
  MEDIUM: 0.09,  // Balanced wear rate
  HARD: 0.06     // Slowest wear rate
};

/**
 * Tire compound characteristics
 * - name: Single letter identifier shown in UI
 * - speed: Base speed in pixels per second
 * - color: UI color for tire indicator
 * - degradation: Wear rate from TIRE_DEGRADATION
 */
export const TIRE_TYPES = {
  SOFT: { name: 'S', speed: 30.5, color: 'red', degradation: TIRE_DEGRADATION.SOFT },
  MEDIUM: { name: 'M', speed: 29, color: 'yellow', degradation: TIRE_DEGRADATION.MEDIUM },
  HARD: { name: 'H', speed: 28, color: 'white', degradation: TIRE_DEGRADATION.HARD }
};

/**
 * Driving style modifiers affecting speed and tire wear
 * - speedModifier: Change to base tire speed (pixels/sec)
 * - wearModifier: Additional tire degradation per second
 */
export const DRIVING_STYLES = {
  PUSH: {
    speedModifier: 2,     // Increased speed by 2 units
    wearModifier: 0.12    // Increased tire wear by 0.12 units/sec
  },
  NORMAL: {
    speedModifier: 0,     // No speed modification
    wearModifier: 0       // No wear modification
  },
  CONSERVE: {
    speedModifier: -1.2,    // Reduced speed by 1.2 unit
    wearModifier: -0.04   // Reduced tire wear by 0.04 units/sec
  }
};

/** Total number of laps in the race */
export const MAX_LAPS = 12;

/** Speed reduction factor when following another car (dirty air effect) */
export const FOLLOWING_PENALTY = 0.7;

/** Pit lane parameters */
export const PITLANE_LENGTH = 100; // Length of pit lane in pixels
export const PITLANE_SPEED = 4;    // Speed limit in pit lane in px/s

/**
 * Calculate total time penalty for making a pit stop
 * Formula: Time difference between:
 * - Driving through pit lane at pit speed limit
 * - Normal racing speed on HARD tires (slowest compound)
 */
const pitlaneTime = PITLANE_LENGTH / PITLANE_SPEED;
const bypassedPitlaneTime = PITLANE_LENGTH / TIRE_TYPES.HARD.speed;
export const PITSTOP_TIME_PENALTY = Math.round(pitlaneTime - bypassedPitlaneTime);



import { teamMapping, teamColors } from './teamMapping';

/**
 * Generate array of driver objects from team mapping
 * Each driver object contains:
 * - name: Driver's name from teamMapping
 * - color: Team's primary color
 * - dotColor: White dot for first driver, null for second (for UI distinction)
 */
export const DRIVERS = Object.entries(teamMapping).flatMap(([team, drivers]) =>
  drivers.map((driver, index) => ({
    name: driver,
    color: teamColors[team],
    dotColor: index === 0 ? "white" : null
  }))
);
