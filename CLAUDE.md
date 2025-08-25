# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```
Application runs at http://localhost:5173 (Vite default port, not 3000 as README mentions)

**Build for production:**
```bash
npm run build
```

**Lint code:**
```bash
npm run lint
```

**Preview production build:**
```bash
npm run preview
```

## Architecture Overview

FormulaGPT is a React-based Formula 1 racing simulator where players compete against AI-powered teams using LLMs (GPT, Claude, DeepSeek, etc.). The AI teams make strategic decisions in natural language during races.

### Core Architecture Pattern

The app uses a **custom hooks-based architecture** for state management:

- **State Hooks**: `useRaceState`, `useApiState`, `usePendingCommands`, `useCommandHandler`
- **Logic Hooks**: `useRace` (core race simulation), `useTeamApi` (AI interactions)
- **Main Component**: `App.jsx` orchestrates all hooks and renders the UI

### Key State Flow

1. **Pre-race**: `PreRaceMenu` → team control setup → AI strategy generation → race start
2. **During race**: Animation loop → `updateRace()` → AI queries at 75% lap intervals → command processing
3. **Race events**: Pit stops, overtakes, tire changes logged and displayed

### Critical Components

- **`App.jsx`**: Main orchestrator, holds global state, animation loop via `requestAnimationFrame`
- **`services/aiService.js`**: All AI communication, API configuration, hooks for LLM interactions
- **`hooks/useRace.js`**: Core race simulation logic (car movement, tire degradation, pit stops)
- **`RaceTrack.jsx`**: SVG track rendering with real-time car animation using Catmull-Rom splines
- **`Scoreboard.jsx`**: Live race standings, can toggle to events panel

### AI Integration Architecture

AI teams are queried via `sendTeamQuery()` when race leader reaches ~75% of a lap:
- Race automatically pauses
- Each AI team receives scoreboard data, events, and strategy prompts
- AI responds with "Actions:" commands (e.g., `"driver pit soft"`, `"driver push"`)
- Commands parsed and executed, race resumes

**API Providers**: OpenAI, OpenRouter, or Free Mode (Gemini 2.0 Flash)
**Configuration**: Stored in localStorage, managed by `useApiConfig()` hook

### Data Configuration

**`src/data/` folder contains all customizable parameters:**
- `constants.js`: Track geometry (`trackPoints`), tire types, race parameters
- `teamPrompts.js`, `sharedPrompts.js`: AI system prompts and instructions
- `teamMapping.js`: Team colors, driver assignments
- `modelConfig.js`: Available AI models and their configurations

### Custom Track System

Track defined as array of `{x, y}` coordinates in `constants.js` → converted to smooth path using `catmullRom2bezier.js` utility → rendered as SVG path with pit lane section.

### State Management Pattern

Uses refs for performance-critical data and useState for UI updates:
```javascript
// Example from useRace.js
const { raceTime, cars, setCars, raceFinished, updateRace } = useRace({
  pathLength: raceState.pathLength,
  addEvent: raceState.addEvent,
  paused: raceState.paused
});
```

## Important Implementation Notes

- **AI Command Format**: All AI responses must contain "Actions:" followed by commands like `"lec pit soft"` or `"ham push"`
- **Tire Rules**: Drivers must use at least 2 different compounds and pit at least once
- **Racing Physics**: Includes tire degradation, following penalties ("dirty air"), pit stop time penalties
- **Animation**: Uses `requestAnimationFrame` for smooth 60fps racing animation
- **Responsive Scaling**: UI scales based on `ScaleContext` for different screen sizes

## Tech Stack

- **React 18** with functional components and hooks
- **Vite** for development and building
- **Material-UI (MUI)** for UI components
- **Framer Motion** for animations
- **ESLint** with React plugins for code quality
- **SVG** for track and car rendering

## Key Files to Understand

- `src/App.jsx` - Main application orchestrator
- `src/services/aiService.js` - AI communication and configuration
- `src/hooks/useRace.js` - Core race simulation logic
- `src/data/constants.js` - All configurable race parameters
- `src/components/RaceTrack.jsx` - Track rendering and car animation
- `src/utils/catmullRom2bezier.js` - Track path generation utility