<p align="center">
  <img src="src/assets/logos/fgpt_logo.svg" alt="FormulaGPT Logo" width="200"/>
</p>

## FormulaGPT - Project Overview

**FormulaGPT** is an experimental racing simulator where you can directly **compete against advanced LLMs** (Large Language Models) such as **OpenAI's GPT models**, **Anthropic's Claude**, **DeepSeek**, and others. These AI-powered teams dynamically analyze on-track scenarios in **natural language**, strategically suggesting pit-stop timings, tire selections, and driving styles—all aiming to outsmart their rivals and secure victory.

As a player, you'll craft your own racing strategy, testing your skills against cutting-edge AI. But unlike traditional game AI driven by scripted logic or fixed heuristics, these LLM-based teams think contextually and adaptively. They don’t just react, they observe tire wear across all teams, assess evolving race conditions, infer opponents’ strategies, and revise their own plans mid-race. They might undercut you with an early pit stop, defend a lead by switching to harder compounds, or gamble on a late-race surge if they notice your pace dropping.

Their decisions aren’t just “if this, then that” - they’re shaped by natural language reasoning, subtle prediction, and opportunistic thinking. In short: you're not just racing cars, you're racing minds.

Curious how it works in practice? Check out a  **[Demo Video](https://youtu.be/tAv6Qz2SmIs/)** showing FormulaGPT in action:

**Your mission:** Strategically outsmart  AI teams by mastering the art of racecraft—timing pit stops with surgical precision, managing tire degradation under pressure, and constantly adapting your tactics as the race unfolds. Every decision counts: pit a lap too late and you might lose track position; choose the wrong compound and you’ll be hunted down by fresher tires. The AI is watching, learning, and recalibrating its strategy as you go—so stay sharp, think ahead, and fight for every second on the clock.

But if you're not in the mood for a head-to-head showdown, you can simply sit back and watch a full LLM vs. LLM race unfold. Observe how different models: GPT4o, Claude, DeepSeek and others, analyze the same situation and reach entirely different conclusions. You’ll not only see the action on track, but also gain insight into their live strategic reasoning: why they pit, why they stay out, when they defend, and when they take risks. It’s part race, part AI psychology lab.

Try it online now at:  
**[https://formula-gpt.vercel.app/](https://formula-gpt.vercel.app/)**

You can bring your own API key to connect with powerful language models like OpenAI's GPT, Anthropic's Claude, DeepSeek, and others—via  OpenAI or OpenRouter API.

**Alternatively, if you just want to dive in without any setup, you can run the simulation in Free Mode—powered by Gemini 2.0 Flash Lite—with no API key required from you. Access to this model is provided and covered by the project.**

![Screenshot of FormulaGPT](images/screenshot.png)

## Features

1. **AI vs. Player Showdown**  
   - Decide which teams are controlled by you and which belong to an AI model.  
   - Battle it out on the track with real-time decision-making.

2. **AI vs. AI Mode**  
    - Watch races between fully autonomous AI teams.
    - Go beyond just visuals—access each AI team manager’s full strategic reasoning and thought process.
    - Perfect for analyzing how different LLMs like Claude, GPT, or DeepSeek interpret and react to race scenarios. 

3. **Full Cusromization (Local Only)**  
   - Personalize the simulation by editing files in the `src/data/` folder.  
   - You can rename teams and drivers, assign unique colors, tweak tire parameters, redefine push/conserve strategies, or even design your own track layout.  
   *Note: These customizations are only available when running the app locally.*

4. **Dynamic Race Simulation**  
   - Tire degradation, pit stops, speed penalties for following too closely, disqualification for not changing tire compounds, etc.

5. **Interactive Scoreboard & RaceTrack**  
   - *Scoreboard*: Keep track of positions, tire conditions, and intervals.  
   - *RaceTrack*: Visual animation of cars on a custom path.

6. **Notifications & Events**  
   - Team messages appear in a chat-like modal (e.g. AI instructions).  
   - Real-time event logging (overtakes, pit calls, etc.).

## Race Strategy & Tire Rules

A successful race isn’t just about raw speed—it’s about making the right calls at the right time. **Tire management lies at the heart of every strategy**, and in FormulaGPT, you’ll need to balance pace, grip, and durability to outsmart your opponents.

**Tire Compounds**

There are **three tire compounds**, each with distinct characteristics:

- <img src="src/assets/svg/hard_tires.svg" alt="Hard Tires" width="20" style="vertical-align:middle; margin-right:8px"/> **Hard Tires** – Longest-lasting, but offer less grip and lower peak speed. Great for fewer pit stops and consistent pace.
- <img src="src/assets/svg/medium_tires.svg" alt="Medium Tires" width="20" style="vertical-align:middle; margin-right:8px"/> **Medium Tires** – Balanced in both durability and speed. A versatile choice for varied strategies.
- <img src="src/assets/svg/soft_tires.svg" alt="Soft Tires" width="20" style="vertical-align:middle; margin-right:8px"/> **Soft Tires** – Fastest but degrade quickly. Ideal for aggressive stints or late-race pushes.

**Driving Pace Strategy**

Each team can dynamically adjust their **driving pace**, which directly impacts tire wear and lap times. Choosing the right pace at the right moment can be the difference between winning and falling off the cliff.

- **Push** 🔸🔸🔸🔸  Maximal performance, increased speed and overtaking potential, but with high tire degradation. Use it to chase down rivals or defend a lead under pressure.

- **Normal** 🔸🔸🔸  Balanced and safe. Maintains solid pace while preserving tires moderately. The default mode for most race scenarios.

- **Conserve** 🔸🔸 Slower pace with significantly reduced tire wear. Useful for extending stints or managing worn-out compounds near the end.
  
- *Note: Driving directly behind a slower car reduces your effective pace and can compromise tire life.*

**Pit Stop Rules**
* To avoid disqualification, at least two different tire compounds must be used during the race.
* Tire degradation affects grip and lap time—running too long on worn tires can cost you valuable seconds or open you up to an undercut.
* AI teams adapt their strategy based on tire performance data, current race situation, and what other teams are doing on track.
Mastering when to push and conserve, when to pit, and which compound to trust is key to crossing the finish line first.

## Requirements & Installation

- **Node.js** >= 14 (Node 18 recommended)
- **npm** *(default)* or **yarn** *(alternative)* to manage dependencies

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

## Key Components

1. **`App.jsx`**  
   - Central orchestration of the simulation. Ties together `PreRaceMenu`, `Scoreboard`, `NotificationsModal`, etc.

2. **`ApiConfigModal.jsx`**  
   - Panel for configuring API keys & switching to *Free Mode*.

3. **`PreRaceMenu.jsx`**  
   - Lets you designate human- vs. AI-controlled teams.
   - Provides randomization (grid, tires) and AI strategy generation.

4. **`RaceTrack.jsx`**  
   - SVG-based track animation (using framer-motion).  
   - Shows cars moving with real-time updates.

5. **`Scoreboard.jsx`**  
   - Displayed classification table with position, speed, tire condition, and intervals.

6. **`NotificationsModal.jsx`**  
   - Chat-like popup for AI messages.
   - Optionally pauses the race for reading.

## API Management

Located in `services/aiService.js`:
- **`generateAIStrategy(...)`** – AI’s initial tire selection logic.
- **`sendTeamQuery(...)`** – AI’s mid-race updates for strategy.

**Configuration**: 
- In the app’s **API Configuration** panel, specify keys for OpenAI or OpenRouter.
- Use *Free Mode* (Gemini 2.0 Flash Lite) if no key is set.

## Extensibility & Customization

Primary race parameters and text prompts reside in **`src/data/`**:
- **`constants.js`**: Track points (`trackPoints`), tire definitions (`TIRE_TYPES`), etc.
- **`teamPrompts.js`**, **`sharedPrompts.js`**, **`tireDecisionPrompt.js`**: default AI prompts and instructions.  
- Tweak them to suit your own custom scenario or adapt the logic for different LLM usage.

## Console Logging & Debugging

- **Request & Response Logs**: The full API prompts (system & user) and the complete AI response are printed in the browser console.  
- **Reasoning vs. Content**: Some LLMs (like `deepseek/r1`) may separate `'reasoning'` and `'content'`. Only `'content'` is displayed in the app’s chat, but `'reasoning'` is visible in console logs—useful for debugging or deeper insight into the AI’s thought process.

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
