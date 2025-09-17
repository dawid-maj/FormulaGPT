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

// ============================================================================
// QUALIFYING SESSION CONSTANTS
// ============================================================================

/** Qualifying session duration in seconds */
export const QUALIFYING_SESSION_DURATION = 18 * 60; // 18 minutes

/** Number of tire sets per driver in qualifying */
export const TIRE_SETS_PER_DRIVER = 3;

/** Qualifying lap phases */
export const QUALIFYING_LAP_PHASES = {
  OUT: 'OUT',
  PUSH: 'PUSH', 
  IN: 'IN'
};

/** Qualifying driver states */
export const QUALIFYING_DRIVER_STATES = {
  PIT: 'Pit',
  OUT_LAP: 'OUT',
  PUSH_LAP: 'PUSH',
  IN_LAP: 'IN'
};

/**
 * Attack modes for qualifying push laps
 * Each mode has different speed bonus and error risk
 */
export const ATTACK_MODES = {
  AGGRESSIVE: {
    name: 'Aggressive',
    speedBonus: 1.5,        // Additional speed in px/s
    errorRisk: 0.08,        // 8% chance of error per lap
    wearMultiplier: 1.2     // Additional tire wear
  },
  SUPER_AGGRESSIVE: {
    name: 'Super Aggressive', 
    speedBonus: 3.0,        // Additional speed in px/s
    errorRisk: 0.15,        // 15% chance of error per lap
    wearMultiplier: 1.5     // Additional tire wear
  },
  MEGA_AGGRESSIVE: {
    name: 'Mega Aggressive',
    speedBonus: 4.5,        // Additional speed in px/s  
    errorRisk: 0.25,        // 25% chance of error per lap
    wearMultiplier: 2.0     // Additional tire wear
  }
};

/**
 * Qualifying lap type speeds (for OUT and IN laps)
 */
export const QUALIFYING_LAP_SPEEDS = {
  OUT_LAP: 22,    // Slower outlap speed in px/s
  IN_LAP: 20      // Slower inlap speed in px/s  
};

/**
 * Tire wear rates for qualifying lap phases
 */
export const QUALIFYING_TIRE_WEAR = {
  OUT_LAP: 0.02,     // Minimal wear on out lap per second
  IN_LAP: 0.02,      // Minimal wear on in lap per second
  PUSH_LAP_BASE: 0.15 // Base wear on push lap per second (before mode multiplier)
};

/**
 * Track evolution parameters
 * Track grip improves over time and with more cars running
 */
export const TRACK_EVOLUTION = {
  INITIAL_GRIP: 0.95,        // Starting grip level (95%)
  MAX_GRIP: 1.05,            // Maximum grip level (105%) 
  TIME_FACTOR: 0.00008,      // Grip increase per second
  TRAFFIC_FACTOR: 0.0001,    // Grip increase per sector completed by any car
  EVOLUTION_CURVE: 'logarithmic' // Type of evolution curve
};

/**
 * Tire set status types
 */
export const TIRE_SET_STATUS = {
  NEW: 'new',
  USED: 'used'
};
