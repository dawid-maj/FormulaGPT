// Team driver mappings - edit team names and drivers here to update them across the application
export const teamMapping = {
  "DeepSeek Racing": ["SAI", "ALB"],
  "Scuderia Gemini": ["LEC", "HAM"],
  "Llama Motosport": ["RUS", "ANT"],
  "Papaya Claude": ["NOR", "PIA"],
  "Emerald GPTo": ["ALO", "STR"]
};

// Team colors for UI
export const teamColors = {
  "DeepSeek Racing": "#00a0de",
  "Scuderia Gemini": "#F70D1A",
  "Llama Motosport": "#787d80",
  "Papaya Claude": "#FF8000",
  "Emerald GPTo": "#229971"
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
  
