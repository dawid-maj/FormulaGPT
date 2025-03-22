// Team driver mappings - edit team names and drivers here to update them across the application
export const teamMapping = {
  "Britania Racing": ["SAI", "ALB"],
  "Scuderia Rosa": ["LEC", "HAM"],
  "Silver Spears": ["RUS", "ANT"],
  "Papaya Team": ["NOR", "PIA"],
  "Emerald Racing": ["ALO", "STR"]
};

// Team colors for UI
export const teamColors = {
  "Britania Racing": "#00a0de",
  "Scuderia Rosa": "#F70D1A",
  "Silver Spears": "#787d80",
  "Papaya Team": "#FF8000",
  "Emerald Racing": "#229971"
};

// List of all available teams
export const availableTeams = Object.keys(teamMapping);

// Default team control configuration
export const defaultTeamControl = Object.fromEntries(
  availableTeams.map(team => [team, { type: "ai" }])
);

// Driver to team mapping
export const driverTeamMapping = Object.fromEntries(
  Object.entries(teamMapping).flatMap(([team, drivers]) => 
    drivers.map(driver => [driver, team])
  )
);
  
