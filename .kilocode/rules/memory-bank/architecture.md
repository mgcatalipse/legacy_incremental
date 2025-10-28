# Architecture Documentation

## System Architecture

### Overall Architecture Pattern
The Lineage Incremental game follows a modular JavaScript architecture with clear separation of concerns. The system is built around a central game state object that manages all player data and progression.

### Component Structure
```
Lineage Incremental
├── index.html              # Main HTML structure
├── script.js               # Main game logic and UI event handling
├── styles.css              # Styling for all UI components
├── modules/                # Modular JavaScript components
│   ├── game.js            # Core game mechanics (death calculation, stat effects)
│   ├── ui.js              # UI update functions and display logic
│   ├── events.js          # Event system (selection, previews, penalties)
│   └── family.js          # Family mechanics (marriage, children, succession)
├── data/                  # Game data definitions
│   ├── ageGroups.js       # Age group definitions and death chances
│   ├── lifeEvents.js      # All available life events with effects
│   └── stats.js           # Initial stat definitions and bounds
└── tests/                 # Testing directory (currently empty)
```

### Key Technical Decisions

1. **Centralized State Management**: All game state is managed through a single `gameState` object in `script.js`, ensuring consistency across components.

2. **Modular Design**: Each major system (game mechanics, UI, events, family) is separated into its own module, promoting maintainability and testability.

3. **Data-Driven Design**: Game data (events, stats, age groups) is defined in separate JSON-like structures, making it easy to modify game balance without changing code.

4. **jQuery-Based UI**: The UI is built using jQuery for DOM manipulation, providing a consistent API across browsers.

5. **Real-time Preview System**: The stat preview system provides immediate feedback to players, enhancing the decision-making experience.

### Component Relationships

```
script.js (Main Controller)
├── gameState (Central State)
├── Event Listeners (UI interactions)
├── UI Updates (calls ui.js functions)
├── Game Logic (calls game.js functions)
├── Event Processing (calls events.js functions)
└── Family Management (calls family.js functions)

modules/game.js
├── checkDeath() - Determines if character dies
├── applyStatEffects() - Modifies stats based on events
└── calculateDeathChance() - Calculates death risk for display

modules/ui.js
├── updateUI() - Main UI update coordinator
├── updateStatsDisplay() - Shows stats with previews
├── updateGainButton() - Updates button with death risk
└── handleSpecialUIStates() - Manages special UI states

modules/events.js
├── getAvailableEvents() - Filters events by age
├── calculateStatPreviews() - Computes stat changes
├── calculateTotalPenalties() - Calculates penalties for excess events
└── updateEventsList() - Updates event display

modules/family.js
├── generateWives() - Creates potential spouses
├── createChild() - Creates child with mixed stats
├── showWifeSelection() - Displays marriage options
└── showChildSelection() - Displays succession options
```

### Critical Implementation Paths

1. **Main Game Loop**:
   ```
   User clicks "Age Up" → 
   Apply selected events → 
   Apply penalties → 
   Increment age → 
   Check for death → 
   Update UI
   ```

2. **Stat Preview System**:
   ```
   User selects/deselects event → 
   Event listener triggers → 
   calculateStatPreviews() → 
   updateStatsDisplay() → 
   UI updates with changes
   ```

3. **Death Calculation**:
   ```
   Age up → 
   Get age group → 
   Calculate base death chance → 
   Apply health/stress modifiers → 
   Apply luck roll → 
   Determine death
   ```

4. **Family Lineage**:
   ```
   Player reaches marriage age → 
   Generate wives → 
   Player selects wife → 
   Create child with mixed stats → 
   Player reaches elder age → 
   Select successor → 
   Play as child
   ```

### Design Patterns in Use

1. **Module Pattern**: Each JavaScript file uses function declarations to create a namespace, avoiding global pollution.

2. **Data Transfer Object Pattern**: Stats and events are structured as objects with consistent properties.

3. **Observer Pattern**: Event listeners in `script.js` observe UI changes and trigger updates.

4. **Strategy Pattern**: Different age groups have different rules for event selection limits and death chances.

### State Management

The central `gameState` object contains:
- `age`: Current age of the character
- `stats`: Object with innate, skills, and possessions categories
- `completedEvents`: Set of completed one-time events
- `availableEvents`: Array of currently selectable events
- `children`: Array of child objects
- `wives`: Array of potential wives
- `selectedWife`: Currently selected wife
- `showWifeSelection`: Boolean for wife selection UI
- `showChildSelection`: Boolean for child selection UI
- `isDead`: Boolean indicating game over state
- `prestigeUnlocked`: Boolean for prestige availability
- `prestigeActive`: Boolean for active prestige state

### UI Architecture

The UI is divided into logical sections:
- **Left Side**: Age display and stats with previews
- **Right Side**: Event selection and special UI elements
- **Bottom**: Action buttons (Age Up, Prestige)
- **Tabs**: Navigation between Human, Empire, and Universe views

The UI uses a grid layout with a resizable separator between the left and right panels, allowing users to customize the interface layout.