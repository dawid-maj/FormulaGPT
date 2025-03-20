import { useCallback } from "react";
import { teamMapping } from "../data/teamMapping";

export const useCommandHandler = ({ addEvent, raceTimeRef, pathLength }) => {
  const handleCommandSubmit = useCallback((e, cmdString, sourceTeam) => {
    if (e && e.preventDefault) e.preventDefault();
    const inputCommand = (typeof cmdString === "string") ? cmdString : "";
    console.log("Otrzymana komenda w handleCommandSubmit:", inputCommand);
    // Split into individual commands by semicolon
    const commands = inputCommand
      .replace(/["']/g, "") // remove quotation marks
      .toLowerCase()
      .split(/[;,]/)
      .filter(cmd => cmd.trim());
    // console.log("Podzielone komendy:", commands);

    commands.forEach(cmd => {
      const [driver, action, param] = cmd.trim().split(" ");
      if (sourceTeam && !teamMapping[sourceTeam].includes(driver.toUpperCase())) {
        console.warn(`Ignoring command "${cmd}" - driver ${driver} does not belong to team ${sourceTeam}`);
        return;
      }
      if (action === "push" || action === "conserve" || action === "normal") {
        // This is where the error occurs - we need to handle this differently
        // since setCars is not passed to this hook
        // console.log(`Command received: ${driver} ${action}`);
        // We'll return the command instead of trying to execute it directly
        return { type: "drivingStyle", driver, style: action };
      } else if (action === "pit" && pathLength > 0) {
        if (param === "cancel") {
          //console.log(`Command received: ${driver} pit cancel`);
          return { type: "pitCancel", driver };
        } else if (["soft", "medium", "hard"].includes(param)) {
          //console.log(`Command received: ${driver} pit ${param}`);
          return { type: "pit", driver, tireType: param.toUpperCase() };
        }
      }
    });
  }, [addEvent, raceTimeRef, pathLength]);

  return handleCommandSubmit;
};
