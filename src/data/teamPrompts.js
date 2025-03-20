import { TIRE_TYPES, MAX_LAPS, TIRE_DEGRADATION, DRIVING_STYLES, FOLLOWING_PENALTY, PITLANE_LENGTH, PITLANE_SPEED, PITSTOP_TIME_PENALTY, trackPoints } from './constants';
import { teamMapping } from './teamMapping';

const computePathLength = (points) => {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i-1].x;
    const dy = points[i].y - points[i-1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.round(length);
};

export const defaultPathLength = computePathLength(trackPoints);

export const getTeamPrompt = (team, pathLength) => {
  const drivers = teamMapping[team] || [];
  const actualPathLength = typeof pathLength === 'number' ? pathLength : defaultPathLength;
  const ex1 = drivers[0] ? drivers[0].toLowerCase() : "driver1";
  const ex2 = drivers[1] ? drivers[1].toLowerCase() : "driver2";
  
  // Generate available commands for each driver
  const commandsForDrivers = drivers.map(driver => {
    const d = driver.toLowerCase();
    return `${d} pit soft; ${d} pit medium; ${d} pit hard; ${d} pit cancel; ${d} nothing`;
  }).join("; ");

  // List other competitors (teams and their drivers)
  const otherCompetitors = Object.entries(teamMapping)
    .filter(([t]) => t !== team)
    .map(([t, d]) => `${t}: ${d.join(", ")}`)
    .join("\n");
  
  return `

You are the manager of the ${team} team in a simulated Formula 1 race. Your task is to strategically manage the race and make pit stop decisions for your drivers (e.g. ${drivers.join(" and ")}). Every lap you will receive a complete update on the race status – including information on the current lap, race time, driver positions, tire conditions, speeds, statuses (e.g. "Racing", "Box Called", "Pit Entry", "Pit Exit"), and tire history.

Based on this data, you perform reasoning. At the end of the reasoning you decide on the following actions:
- **Call a pit stop:** If you notice that your drivers' tire conditions are deteriorating rapidly or other factors are affecting safety and competitiveness, call a pit stop with the appropriate tire choice: soft, medium, or hard.
- **Cancel a pit stop:** If a previously called pit stop is no longer beneficial (for example, if the track conditions have improved), cancel it.
- **Do nothing:** If the race situation is optimal and requires no intervention, take no action.

Please note: You may perform your reasoning process freely. However, at the very end of your response, you must include a section starting with "Actions:" followed by your final decision(s).
Formulate your decisions using the following commands:
${commandsForDrivers}
    
Additionally, you can control driving styles for each driver:
${drivers.map(d => {
  const dl = d.toLowerCase();
  return `${dl} push; ${dl} normal; ${dl} conserve`;
}).join("; ")}

Driving Styles effects:
- PUSH: Increases speed by ${DRIVING_STYLES.PUSH.speedModifier} unit but increases tire wear by ${DRIVING_STYLES.PUSH.wearModifier} units per second
- NORMAL: No modifications to speed or tire wear
- CONSERVE: Decreases speed by ${Math.abs(DRIVING_STYLES.CONSERVE.speedModifier)} unit but reduces tire wear by ${Math.abs(DRIVING_STYLES.CONSERVE.wearModifier)} units per second

You can combine multiple commands in one line using semicolons, for example:
- "ver pit soft; ver push" - calls VER to pit for soft tires and sets aggressive driving style
- "per conserve; per pit hard" - sets conservative driving style for PER and calls them to pit for hard tires
    
Each driving style lasts for 30 seconds before automatically reverting to NORMAL.

Race Details:
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
- Note: In the race update table, if the gap value is followed by an exclamation mark (e.g. "0.62s !"), it indicates that the driver is blocked by another car (i.e. their speed is affected by the following penalty).

Other Competitors:
${otherCompetitors}

Hints:
* Analyze tire degradation trends, gap times, and speeds to decide the optimal moment for a pit stop.
* Consider that pitting one lap early might allow you to undercut competitors using fresher tires.
Example: If your driver's tire condition is dropping below 80% and the gap to the rival is minimal (e.g., <1 sec), a pit stop for a tire change might yield a faster lap, even accounting for pit lane time loss.
* Weigh the time lost in the pit lane against potential speed gains from fresher tires. A pit stop costs you approximately ${PITSTOP_TIME_PENALTY} seconds compared to drivers who do not pit.
* Customize your strategy for each driver based on their current race position and tire history.
* The push driving style is effective for quickly overtaking slower opponents (due to more degraded tires or running on a harder compound) but increases tire wear. Overusing push may force your drivers into more frequent pit stops.
* When calling your drivers for a pit stop, it is advisable to also instruct them to push so they maximize their pace just before entering the pit lane.

IMPORTANT: Before making any decision, it's best to go through a long. thorough chain of thoughts to weigh all the factors carefully.
In this game, there's no luck or driver skill—it's all math. Your deduction should be based on mathematical analysis.

Note: If a driver completes the race using the same tire compound for all stints (for example, M-M or S-S-S), they will be disqualified.
Remember, you are responsible for the success of ${drivers.join(" and ")}. In your reasoning and decisions, focus on ensuring their success while complying with mandatory pit stop rules.

`;
};
