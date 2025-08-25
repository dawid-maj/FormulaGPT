/**
 * Command parsing utilities for AI responses
 */

/**
 * Extracts tire selection commands from AI response
 * @param {string} commandsText - AI response text
 * @returns {Array} Array of tire matches [driver, tire]
 */
export function parseTireSelectionCommands(commandsText) {
  // Clean up the commands text
  let cleanText = commandsText;
  
  const codeBlockMatch = cleanText.match(/```([^`]+)```/);
  if (codeBlockMatch) {
    cleanText = codeBlockMatch[1];
  } else {
    const actionsIndex = cleanText.toLowerCase().indexOf("actions:");
    if (actionsIndex !== -1) {
      cleanText = cleanText.substring(actionsIndex + "actions:".length);
    }
  }
  
  cleanText = cleanText.replace(/\n/g, ' ').replace(/[*_]+/g, '').trim();

  return [...cleanText.matchAll(/([a-zA-Z]+)\s+tire\s+(soft|medium|hard)/gi)];
}

/**
 * Extracts race commands from AI response
 * @param {string} responseText - AI response text
 * @param {Array} teamDrivers - Array of drivers for this team
 * @returns {Array} Array of valid commands
 */
export function parseRaceCommands(responseText, teamDrivers) {
  // Matches patterns like: "driver pit soft", "driver push", "driver normal", etc.
  const commandRegex = /\b(\w+)\s+(pit\s+(soft|medium|hard|cancel)|push|normal|conserve|nothing)\b/gi;
  let commands = [];
  let match;
  
  while ((match = commandRegex.exec(responseText)) !== null) {
    commands.push(match[0].trim());
  }

  // Filter commands to only include team drivers
  return commands.filter(cmd => {
    const [driver] = cmd.trim().split(' ');
    return teamDrivers.includes(driver.toUpperCase());
  });
}

/**
 * Validates if a command is properly formatted
 * @param {string} command - Command to validate
 * @returns {boolean} True if command is valid
 */
export function isValidCommand(command) {
  const validPatterns = [
    /^\w+\s+pit\s+(soft|medium|hard|cancel)$/i,
    /^\w+\s+(push|normal|conserve|nothing)$/i
  ];
  
  return validPatterns.some(pattern => pattern.test(command.trim()));
}

/**
 * Parses a single command into structured data
 * @param {string} command - Command string
 * @returns {Object} Parsed command object
 */
export function parseCommand(command) {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const [driver, action, ...args] = parts;
  
  const commandObj = {
    driver: driver.toUpperCase(),
    action,
    raw: command
  };
  
  if (action === 'pit' && args.length > 0) {
    commandObj.tireCompound = args[0].toUpperCase();
  }
  
  return commandObj;
}