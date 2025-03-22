import { TIRE_TYPES } from './constants';
import { teamMapping } from './teamMapping';
import { getRaceDetailsSnippet, getLongTermStrategySnippet } from './sharedPrompts';
import { defaultPathLength } from './teamPrompts';

export const getTireSelectionPrompt = (team, startingPositions, pathLength) => {
  const drivers = teamMapping[team] || [];
  const actualPathLength = typeof pathLength === 'number' ? pathLength : defaultPathLength;
  
  // Get shared race details snippet
  const raceDetails = getRaceDetailsSnippet(actualPathLength);
  const longTermStrategy = getLongTermStrategySnippet();
  
  // Create a sorted list of all drivers by position
  const allDriversWithPositions = Object.entries(startingPositions)
    .map(([driver, position]) => ({ driver, position }))
    .sort((a, b) => a.position - b.position);
  
  // Format the qualifying results in P1-P10 format
  const qualifyingResults = allDriversWithPositions
    .map(({ driver, position }) => {
      // Find which team this driver belongs to
      let driverTeam = "";
      for (const [teamName, teamDrivers] of Object.entries(teamMapping)) {
        if (teamDrivers.includes(driver)) {
          driverTeam = teamName;
          break;
        }
      }
      return `P${position}: ${driver} (${driverTeam})`;
    })
    .join('\n');
  
  // Information about your drivers' starting positions
  const teamStartPositions = drivers
    .map(driver => `${driver}: starting position ${startingPositions[driver]}`)
    .join("; ");

  // Generating available tire selection commands for each driver
  const tireSelectionCommands = drivers
    .map(driver => {
      const d = driver.toLowerCase();
      return `${d} tire soft; ${d} tire medium; ${d} tire hard; ${d}`;
    })
    .join("; ");

  return `
*** General Information ***
You are the manager of the ${team} team preparing for the upcoming Formula 1 race.
Your drivers, ${drivers.join(" and ")}, will be starting in the following positions: ${teamStartPositions}.

Below is the starting grid after qualification:
${qualifyingResults}

Before the race begins, you must decide which tire compound each of your drivers will start with.
Your tire selection will influence the initial performance, grip, and durability of your drivers throughout the early stages of the race.

Tire Compounds Overview:
- Soft Tires (S): Provide maximum grip and speed but degrade quickly.
- Medium Tires (M): Offer a balance between performance and durability.
- Hard Tires (H): Deliver lower grip but superior durability, beneficial for longer stints.

${raceDetails}

**Considerations for Your Decision:**
1. **Starting Position Strategy:**  
   - A driver starting at the front may benefit from a compound that maximizes early performance (e.g., Soft or Medium).
   - A driver starting further back might opt for a more durable compound (e.g., Hard) to mitigate initial challenges and preserve tire life.

2. **Race Strategy & Conditions:**  
   - Take into account the track layout, weather conditions, and how the tire compound choice could affect overtaking and defending positions.
   - Remember that during the race, drivers must make at least one pit stop and use at least two different tire compounds.

3. **Risk vs. Reward:**  
   - Aggressive compounds (Soft) can help secure or maintain a leading position but may force an earlier pit stop due to rapid degradation.
   - Conservative compounds (Hard) might reduce early pace but can provide an advantage by lasting longer in the opening laps.

${longTermStrategy}

*** FINAL REMINDER ***
Your decisions at this stage are crucial for setting up a strong race strategy. Ensure that the tire choices maximize your drivers' performance at the start while aligning with long-term race plans.


Please note: You may perform your reasoning process freely. However, at the very end of your response, you must include a section starting with "Actions:" followed by your final decision(s).
Formulate your decisions using the word "Actions: " and use the following commands to select tires for your drivers:
${tireSelectionCommands}


`;
};
