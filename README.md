<p align="center">
  <img src="src/assets/logos/fgpt_logo.svg" alt="FormulaGPT Logo" width="200"/>
</p>

## FormulaGPT - Project Overview

**FormulaGPT** is an experimental racing simulator where you can directly **compete against advanced LLMs** (Large Language Models) such as **OpenAI's GPT models**, **Anthropic's Claude**, **DeepSeek**, and others. These AI-powered teams dynamically analyze on-track scenarios in **natural language**, strategically suggesting pit-stop timings, tire selections, and driving styles—all aiming to outsmart their rivals and secure victory.

As a player, you'll craft your own racing strategy, testing your skills against cutting-edge AI. But unlike traditional game AI driven by scripted logic or fixed heuristics, these LLM-based teams think contextually and adaptively. They don’t just react, they observe tire wear across all teams, assess evolving race conditions, infer opponents’ strategies, and revise their own plans mid-race. They might undercut you with an early pit stop, defend a lead by switching to harder compounds, or gamble on a late-race surge if they notice your pace dropping.

Their decisions aren’t just “if this, then that” - they’re shaped by natural language reasoning, subtle prediction, and opportunistic thinking. In short: you're not just racing cars, you're racing minds.

Curious how it works in practice? 

Check out a video showing FormulaGPT in action:  
**https://youtu.be/j6pMt2D1KYU** 

If you're not in the mood for a head-to-head showdown, you can simply sit back and watch a full LLM vs. LLM race unfold. Observe how different models: GPT4o, Claude, DeepSeek and others, analyze the same situation and reach entirely different conclusions. You’ll not only see the action on track, but also gain insight into their live strategic reasoning: why they pit, why they stay out, when they defend, and when they take risks. It’s part race, part AI psychology lab.

Try it online at:  
**https://formula-gpt.vercel.app/**

You can bring your own API key to connect with powerful language models like OpenAI's GPT, Anthropic's Claude, DeepSeek, and others—via  OpenAI or OpenRouter API.

Alternatively, if you just want to dive in without any setup, you can run the simulation in Free Mode—powered by smaller LLMs with no API key required from you. Access to this model is provided and covered by the project.

![Screenshot of FormulaGPT](images/screenshot.png)

## Features

1. **AI vs. Player Mode**  
   - **Team Control Selection**: Choose which teams you want to manage directly and which ones will be controlled by AI. This allows you to pitch your own race strategy skills against cutting-edge LLM-powered rivals.  
   - **Real-Time Decision-Making**: You and the AI both make key calls (pit stops, tire changes, driving styles) *as the race unfolds*, reacting to track conditions, opponent tactics, and unexpected events.  
   - **Adaptive Strategy**: Watch how AI teams analyze your moves—if you push too hard on soft tires, they might undercut you with an early pit stop or switch to a more durable compound and outlast your pace.

2. **AI vs. AI Mode**  
   - **Fully Autonomous Races**: Set all teams to AI control, sit back, and watch them battle each other. The models dynamically generate pit-stop schedules, handle tire wear, and try to exploit each other’s weaknesses.  
   - **Strategic Reasoning Insight**: Beyond just watching the cars on track, you can view each AI’s manager “thought process” in the notifications panel. This reveals how different LLMs—Claude, GPT, DeepSeek, etc.—interpret and respond to the same race scenario.  
   - **Compare Model Behaviors**: Perfect for a deeper look into how various AI models prioritize tire wear, how they gauge overcut vs. undercut strategies, and how consistently they adapt to evolving race conditions.

3. **Full Customization (Local Only)**  
   - **Editable Data Files**: If you run FormulaGPT locally, you can modify the simulation parameters in the `src/data/` folder. This includes adjusting tire wear rates, changing driving style effects, redesigning the track layout, or even renaming teams and drivers.  
   - **Color & Identity**: Assign new color schemes or driver names, tailor your grid to emulate real-world F1 teams—or create entirely fictional racing stables.  
   - **Depth & Creativity**: Tweak the rules for push/conserve modes, alter pit lane speeds, experiment with drastically different tire performances, and see how the AI (and players) adapt to your custom settings.

4. **Dynamic Race Simulation**  
   - **Tire Degradation**: Each tire compound (Soft, Medium, Hard) has its own wear rate, affecting speed and grip. Failing to manage worn tires can lead to massive pace drops.  
   - **Pit Stops & Tire Compound Rules**: Drivers must use at least two different compounds or face disqualification. Pit-stop timing, combined with the pit-lane time penalty, becomes a critical strategic decision.  
   - **Following & Overtaking**: A “dirty air” penalty slows drivers directly behind opponents, making overtaking a multi-lap endeavor. The AI can exploit this, using defensive driving or offset pit strategies.  
   - **Penalties & Risk**: Going for only one pit strategy, pitting too late, or pushing tires to the edge can all derail a once-promising strategy.

5. **Interactive Scoreboard & RaceTrack**  
   - **Live Position Tracking**: See who’s leading, which tire they’re on, and how big the gap is to the next competitor. Watch intervals expand or shrink in real time.  
   - **Tire & Status Indicators**: Tire condition percentages, calls to pit, “Box Called” status, and driving style changes (push/normal/conserve) are all visible at a glance.  
   - **Track Animation**: The SVG-based race track provides a smooth, real-time representation of cars speeding around corners, entering the pit lane, and jostling for position.  
   - **Highlight & Inspect**: Hover over a driver to focus on their name, tire condition, and any pending pit strategy.

6. **Notifications & Events**  
   - **In-Race Messages**: AI teams send strategic updates or thoughts, displayed in a chat-like notifications modal. You can pause the race to read them in detail—perfect for following the AI’s logic.  
   - **Event Log**: Overtakes, pit stops, disqualifications, and other significant actions are recorded in real time. A separate events panel lets you review the biggest moments of the race.  
   - **Transparency & Teaching Tool**: This detailed logging allows players to learn from the AI’s approach—seeing exactly *why* it called a pit stop or instructed its driver to push for an overtake.

## Race Strategy & Tire Rules

1. **Tire Compounds**
 
      There are **three tire compounds**, each with distinct characteristics:
  
    - <img src="src/assets/svg/hard_tires.svg" alt="Hard Tires" width="20" style="vertical-align:middle; margin-right:8px"/> **Hard Tires** – Longest-lasting, but offer less grip and lower peak speed. Great for fewer pit stops and consistent pace.
    - <img src="src/assets/svg/medium_tires.svg" alt="Medium Tires" width="20" style="vertical-align:middle; margin-right:8px"/> **Medium Tires** – Balanced in both durability and speed. A versatile choice for varied strategies.
    - <img src="src/assets/svg/soft_tires.svg" alt="Soft Tires" width="20" style="vertical-align:middle; margin-right:8px"/> **Soft Tires** – Fastest but degrade quickly. Ideal for aggressive stints or late-race pushes.

2. **Driving Pace Strategy**

      Each team can dynamically adjust their **driving pace**, which directly impacts tire wear and lap times. Choosing the right pace at the right moment can be the difference between winning and falling off the cliff.
  
    - **Push** 🔸🔸🔸🔸  Maximal performance, increased speed and overtaking potential, but with high tire degradation. Use it to chase down rivals or defend a lead under pressure.
  
    - **Normal** 🔸🔸🔸  Balanced and safe. Maintains solid pace while preserving tires moderately. The default mode for most race scenarios.
  
    - **Conserve** 🔸🔸 Slower pace with significantly reduced tire wear. Useful for extending stints or managing worn-out compounds near the end.
    
    - **Automatic Reversion**: After 30 seconds, any chosen driving style (Push or Conserve) automatically reverts back to Normal. However, you can reapply a new pace command at the next strategic checkpoint.
  
    - *Note: Driving directly behind a slower car reduces your effective pace and can compromise tire life.*

3. **Pit Stop Mandatory Rules**  
    - To avoid disqualification, **every driver is required to make at least one pit stop**—no driver can complete the race without pitting.
    - Additionally, each driver must use at least two different tire compounds** during the race.  

## Requirements & Installation

- **Node.js** >= 14 (Node 18 recommended)
- **npm** *(default)*  to manage dependencies

**Installation**:

```bash
# Using npm:
npm install
```

## Quick Start 

1. **Run Development Server**:

   ```bash
   npm start
   ```
  
   The application will be available at:  
   **[http://localhost:3000](http://localhost:3000)**

2. **Try Online**:  
   Visit the deployed version at:  
   **[https://formula-gpt.vercel.app/](https://formula-gpt.vercel.app/)**

## Folder Structure

```
src/
├─ assets/                # Static assets (images, audio)
├─ components/            # Main React components
├─ contexts/              # Context API (e.g. ScaleContext)
├─ data/                  # Core data: track config, prompts, tire definitions, etc.
├─ hooks/                 # Custom Hooks for race logic
├─ services/              # AI-related service logic (requests)
├─ utils/                 # Helper functions
├─ App.jsx                # Main application component
├─ App.css                # Global CSS
└─ index.js               # Entry point
```

## Detailed Overview of Key Components

### `App.jsx`
This is the main, top-level component of the application, coordinating and unifying all the core elements of the simulation:

- **Application State**: Holds key states such as:
  - race status (`raceFinished`, `paused`, `setupComplete`)
  - car data (`cars`)
  - race event log (`events`)
  - AI models’ conversation history (`conversationHistory`)
  - notifications and notification modal (`notifications`, `isModalOpen`)
  - API configuration (e.g. OpenAI / OpenRouter keys)
- **Animation Loop**: Calls the `updateRace()` function in a `requestAnimationFrame` loop to simulate car movement, tire wear, etc.
- **Hooks Integration**:
  - `useRace()` – contains core race logic (position updates, pit stops, tire degradation).
  - `usePendingCommands()` – manages the queue of commands (like pit-stop, push/conserve).
  - `useTeamApi()` – triggers API requests to language models at appropriate moments (AI strategy).
- **Rendering**:
  - In pre-race mode, it displays the `PreRaceMenu` and API configuration options.
  - In race mode, it renders `RaceTrack`, `Scoreboard`, `TeamControls`, manages notifications, and so on.
- **Event Handling**: Provides the `addEvent()` function to append new entries to the event log (shown in `EventsPanel`).
- **Pause & Finish**: Can pause/resume the race and displays final results once a driver crosses the finish line.

In short, `App.jsx` is the “brain” of the app – handling global state, orchestrating race logic calls, and tying together the overall user-facing interface.

### `RaceTrack.jsx`
Responsible for **visualizing the track** and **animating cars**:

- **SVG Path**: Uses `trackPoints` and `catmullRom2bezier` to create a vector path (Catmull-Rom spline).
- **Car Positioning**: Each car has a `distanceTraveled` value; based on the track’s total length (`pathRef`), the component calculates each car’s `(x, y)` coordinates on the spline.
- **Pit Lane Effect**: A portion of the path is marked as a pit lane (shorter segment with a strict speed limit).
- **Interactions & Overlay**:
  - A “Stop/Play” button to pause or resume the race.
  - A “Notifications” section (`All (...)` and team-specific buttons) to open the `NotificationsModal` with AI messages.
- **Highlighting**: Mousing over a specific car (`highlightedDriver`) enlarges and highlights it visually.

`RaceTrack.jsx` thus manages the **visual side of the race** – drawing the track, the pit lane, and animating car positions in real time.

### `Scoreboard.jsx`
Displays the **race standings** and optionally the final classification:

- **Live Classification**:
  - Uses a `requestAnimationFrame`-driven update (from `App.jsx`) to compute a sorted list of cars by position, distance, tire data, etc.
  - Shows this data in a grid (position, tire condition, intervals, status like “Pit Entry,” etc.).
- **Events Log (`showEvents`)**: The user can switch the scoreboard to display the event log (`EventsPanel`) instead.
- **End of Race**: When `showResults` is `true`, it presents a final summary including points (e.g. 10-9-8 for top 10) and a constructors’ ranking.
- **Highlighting**: Similar to `RaceTrack`, uses `highlightedDriver` to highlight the corresponding row.

Through `Scoreboard.jsx`, you get a **clear overview** of the race – who’s leading, tire choices, pit-stop statuses, time gaps, and more.

### `ApiConfigModal.jsx`
A modal overlay for **managing API keys and choosing AI models**:

- **Forms**: Lets the user enter OpenAI/OpenRouter keys and select which LLM model is assigned to each team.
- **Free Mode**: A toggle (`useFreeMode`) that bypasses the need for user API keys by relying on a provided free-tier model (e.g. “Gemini 2.0 Flash”).
- **Connection Testing**: “Test OpenAI Connection” / “Test OpenRouter Connection” buttons send a simple request to validate the entered keys.
- **Local Storage**: The `useApiConfig` hook (in `aiService.js`) saves the config to localStorage for persistence.

Essentially, `ApiConfigModal` is the **configuration panel for LLM access** (keys, models, providers).

### `aiService.js`
Contains the **core AI logic** and relevant hooks:

1. **`useApiConfig()`**  
   - A hook for storing API config (keys, free-mode toggle, model selection per team).  
   - Persists data in `localStorage`.

2. **`useTeamApi()`**  
   - The main hook that triggers AI model calls during the race.  
   - Detects when the race leader reaches 75% of a lap, then pauses the race and queries each AI model for strategic input.  
   - Collects the AI responses as notifications (`notifications`) and enqueues commands (`setAiPendingCommands`).

3. **`generateAIStrategy(team, startingGrid, ...)`**  
   - Called before the race begins to pick an initial tire compound (Soft/Medium/Hard) for each AI driver.  
   - Sends a prompt to the AI requesting “Actions: …” and assigns the chosen tire to the respective drivers.

4. **`sendTeamQuery({ team, scoreboardVal, ... })`**  
   - Used during the race to get updated strategy calls (pit-stop, push/conserve).  
   - The AI’s “Actions: …” content is parsed into commands (e.g. `lec pit soft`, `lec push`) and appended to `aiPendingCommands`.

`aiService.js` effectively acts as the application’s “backend”—enabling it to register and call LLMs (OpenAI, OpenRouter) while retrieving pit-stop and strategy commands in real time.

### `TireManager.jsx`
A single “card” that manages **one driver’s status** and provides basic in-race interactions:

- **Driver Data**: Shows the current tires, their condition (e.g. 83%), driving style, or a pending pit stop (“Box Called”).
- **Commands**:
  - Buttons to switch driving style (push, normal, conserve)
  - A button that opens a pit-stop menu (soft/medium/hard/cancel).
- **Edit Lock** (`isEditable`): If a team is AI-controlled or the race isn’t paused, the user can’t manually intervene.
- **Highlight** (`highlightedDriver`): Highlights the driver card when hovered, matching the `RaceTrack` highlight.

In short, `TireManager` is the **per-driver view** for tires and pit-stop/pace controls.

### `TeamControls.jsx`
A higher-level component that **renders multiple `TireManager`** instances:

- **Filtering**: Only shows `TireManager` for teams controlled by the player, unless all teams are AI – in which case it displays locked (non-editable) cards.
- **Commands**: Passes down `handleCommandSubmit` to each `TireManager` to execute pit/pace commands.
- **Layout**: Arranges driver cards in a flex row (wrapping as needed).

Thus, `TeamControls` provides a **consolidated UI** for managing tires and pit-stop strategy across one or more teams.

### `EventsPanel.jsx`
A simple component to **display race event logs**:

- Shows up to the 30 most recent events (e.g. `1:12 - LEC overtakes HAM`, `1:34 - ALO pit stop called`).
- The user can switch from the scoreboard to the events list using the toggle in `Scoreboard`.

`EventsPanel` offers a **quick chronological overview** of notable moments: overtakes, pit calls, and other important actions.

### `NotificationsModal.jsx`
A fullscreen overlay for **reading AI messages**:

- **Notifications List**: Displays them as smaller previews (snippet of the message, time).
- **Detailed View**: Clicking on a notification opens the entire content (potentially large, as LLMs can provide detailed “thinking”).
- **Navigation**: Arrows to browse between a team’s notifications (previous/next).
- **Closing**: On closing, the race can resume if it was paused for reading.

`NotificationsModal` is the **communication hub** between you (the player) and virtual race engineers (the AI models).

### `PreRaceMenu.jsx`
The screen shown **before the race starts**:

- **Team Control Selection**: Allows marking each team as “player” or “AI”-controlled.
- **Randomization**:  
  - `randomizeGridFair` to shuffle starting positions in a fair manner.  
  - A button to randomly assign tire compounds to any player-controlled drivers who haven’t chosen yet.
- **Generate AI Strategy** (`onGenerateAIStrategy`) for AI teams – triggers the `generateAIStrategy(...)` call in `aiService.js`.
- **API Config** – a button to open `ApiConfigModal`.
- **Start Race** – finalizes the `grid` and calls `onStartRace` to switch to race mode (`setupComplete = true` in `App.jsx`).

Here, you **set up the race** – selecting control modes, grid positions, initial tires, and calling AI for preliminary strategies. Once you’re ready (all tires assigned), you click “Start Race.”

### `RaceInfoModal.jsx`
A small help modal that shows **race parameters and rules**:

- Details the computed track length (sum of distances from `trackPoints`), number of laps, pit-stop time penalty, and general mechanics (tire wear rates, driving style effects).
- Invoked via a button in `PreRaceMenu`.

`RaceInfoModal` provides a quick **reference to simulation rules and parameters** during the setup stage.

Below is an expanded version of these sections to provide additional detail and clarity.

## API Management

All AI-related logic is centralized in the [`services/aiService.js`](./src/services/aiService.js) file. This file provides two main functions that drive AI interaction:

1. **`generateAIStrategy(team, startingGrid, apiConfig, ...)`**  
   - **Purpose**: Determines each AI team’s initial tire compound (Soft, Medium, or Hard) before the race starts.  
   - **Process**: 
     - Sends a specialized prompt describing each driver’s starting position and requests specific "Actions" to assign tires (e.g., `"driver tire soft"`).  
     - When the AI responds, it parses those commands and applies them to the race state.  
   - **Usage**: Typically called from the pre-race screen (`PreRaceMenu.jsx`) when the user clicks **“Generate AI Strategies”** for AI-controlled teams.

2. **`sendTeamQuery({ team, scoreboardVal, eventsVal, ... })`**  
   - **Purpose**: Fetches mid-race strategy updates from the AI (e.g., pit calls, pace changes).  
   - **Process**: 
     - **Trigger**: When the race leader completes ~75% of a lap (or at other key intervals), the race automatically pauses, and `sendTeamQuery` is invoked for each AI-controlled team.  
     - **Context**:  
       - A fresh **system prompt** is always added (from `teamPrompts.js`), which reiterates the rules and the team’s responsibilities.  
       - Only the **most recent** user and assistant messages (e.g. the last 4) are included in order to provide partial continuity of the conversation without sending the entire chat log (saving token usage/cost). This effectively continues the AI’s thought process, but with a concise snapshot of prior exchanges.  
       - The latest scoreboard data, events, and lap/time info are appended as a user message.  
     - **AI Response**:  
       - The AI replies with “Actions” (e.g., `"driver pit hard"`, `"driver push"`) to be executed immediately.  
       - Its full textual output is stored as a **notification**, so you can read the AI’s reasoning in the in-game chat UI.  
     - **Usage**: Called automatically in race mode. You’ll see the race pause while waiting for the AI’s instructions.

### Configuration
In the **API Configuration** panel, you can specify:
- **Keys** for OpenAI/OpenRouter if you want to use a paid model.
- **Free Mode**: If enabled, no key is needed and all AI calls go to “Gemini 2.0 Flash Lite” (a free-tier model included with the project).  
- **Model Selection**: On a per-team basis, you may choose any supported model from the drop-down.  

All changes are persisted locally (via `localStorage`) so you don’t need to reconfigure them each time the app is launched.

## Extensibility & Customization

The **`src/data/`** folder is your go-to location for customizing various aspects of FormulaGPT. Here are some key files:

- **`constants.js`**  
  - Defines the **track geometry** (`trackPoints`), as an array of `{ x, y }` coordinates. If you want a different track layout, you can alter or replace these coordinates to shape the racing line.  
  - Lists **tire types** (`TIRE_TYPES`), including their base speed and wear rate. You can add new compounds or tweak existing ones.  
  - Contains **global race parameters** like the pit lane length, pit stop time penalty, or total laps (`MAX_LAPS`).

- **`teamPrompts.js`, `sharedPrompts.js`, `tireDecisionPrompt.js`**  
  - These files house the **default AI prompts** and instructions for the models. If you want to modify how the AI reasons about strategy, you can edit or extend these prompts.  
  - For instance, you might add additional constraints, mention a “rain scenario,” or instruct the model to place more emphasis on overtaking.  
  - `teamPrompts.js` is particularly important since it determines how each AI team is initially guided to respond (pit-stop commands, driving styles, etc.).

By editing these data files, you can easily:
- Rename teams/drivers and assign new color themes (`teamMapping.js`).
- Adjust tire wear rates, speeds, or the track layout to create entirely new race conditions.
- Experiment with custom logic for the AI’s pit-stop or tire decisions, by revising the text prompts and instructions.

Essentially, everything from **track layout** to **AI strategy text** to **team names and driver rosters** is fair game for modification.

## Console Logging & Debugging

When running the app in development mode (`npm start`), **detailed logs** will appear in the browser’s developer console:

- **Request & Response Logs**:  
  - Every API call to the LLM includes a “system” message (instructions) and a “user” message (the race data). The full content of both is printed for transparency and debugging.  
  - Once the AI responds, its entire output is also logged, letting you inspect or troubleshoot any logic or parsing issues.

- **Reasoning vs. Content**:  
  - Some language models (e.g. `deepseek/r1`) split their responses into multiple parts like `'reasoning'` (an internal chain-of-thought) and `'content'` (final user-facing text).  
  - By default, the `'content'` is displayed to you in the in-game notifications, but `'reasoning'` is visible only in the console logs.  
  - This is especially helpful for debugging or analyzing how the AI arrives at its strategic conclusions without cluttering the main chat UI.

These logs are your best friend for **troubleshooting** any odd AI behavior, verifying if the model receives the correct context, or diagnosing response parsing issues. If something looks off, open the dev console to see exactly what data was sent and returned.

## Contributions & Collaboration

I welcome contributions:
- File **Issues** for bugs or feature requests.
- Make **Pull Requests** with changes or new ideas.

## License

This project is under the **MIT License**.  
See [LICENSE](LICENSE) for details.  

**Attribution Requirement**

If you use or build upon **FormulaGPT**, please include visible attribution, such as:

> “Powered by FormulaGPT”  
> or  
> “Based on FormulaGPT by Dawid Maj (MIT Licensed)”

This can appear in your README, documentation, or app footer.
 
---

Thank you for exploring **FormulaGPT**!  
Compete against AI-driven teams, refine your strategies, and see if you can take the checkered flag. Enjoy!
