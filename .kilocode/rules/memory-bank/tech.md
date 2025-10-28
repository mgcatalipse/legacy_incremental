# Technical Documentation

## Technologies Used

### Frontend Technologies
- **HTML5**: Semantic markup for the game interface
- **CSS3**: Styling with modern features like grid layout, flexbox, and transitions
- **JavaScript (ES5)**: Core game logic and interactivity
- **jQuery 3.7.1**: DOM manipulation and event handling

### Data Formats
- **JSON-like structures**: Game data defined in JavaScript objects/arrays
- **Set data structure**: For tracking completed events to ensure uniqueness

### Development Tools
- **VS Code**: Primary development environment
- **Git**: Version control (indicated by .gitignore file)

## Development Setup

### Project Structure
```
legacy_incremental/
├── .kilocode/               # Memory bank and rules
├── data/                   # Game data definitions
├── modules/                # Modular JavaScript components
├── tests/                  # Testing directory (currently empty)
├── index.html              # Main HTML file
├── script.js               # Main game logic
├── styles.css              # Game styles
├── jquery-3.7.1.min.js    # jQuery library
├── README.md               # Project documentation
├── bug_list.md             # Active bug tracking
└── .gitignore              # Git ignore rules
```

### File Loading Order
The application loads files in a specific order to ensure dependencies are met:
1. jQuery library
2. Data files (ageGroups.js, lifeEvents.js, stats.js)
3. Module files (game.js, ui.js, events.js, family.js)
4. Main script.js file

## Technical Constraints

### Browser Compatibility
- Requires JavaScript support
- Uses jQuery for cross-browser compatibility
- CSS features supported by modern browsers

### Performance Considerations
- Minimal DOM manipulation for performance
- Efficient event handling with delegation
- Deep copying of game state to prevent reference issues

### Memory Management
- Game state is reset on prestige to prevent memory bloat
- Event listeners are properly managed to prevent memory leaks
- No persistent storage required (client-side only)

## Dependencies

### External Libraries
- **jQuery 3.7.1**: Used for DOM manipulation, event handling, and AJAX capabilities
  - Loaded via CDN-style local file inclusion
  - Critical for UI updates and event handling

### Internal Dependencies
- **Data modules**: Provide game configuration and content
- **Functional modules**: Handle specific aspects of game logic
- **Main script**: Orchestrates all components and manages game state

## Tool Usage Patterns

### Code Organization
- **Modular structure**: Each major system separated into its own file
- **Function-based namespace**: Avoids global pollution
- **Data-driven design**: Game content separated from logic

### UI Updates
- **Centralized update function**: `updateUI()` coordinates all UI changes
- **Event-driven updates**: UI responds to user interactions through event listeners
- **Preview system**: Real-time feedback without committing changes

### State Management
- **Single source of truth**: All game state in `gameState` object
- **Immutable updates**: State changes through dedicated functions
- **Deep copying**: Prevents reference issues when resetting state

### Testing Approach
- **Manual testing**: Prepare a test scenario, display it and ask user to execute it, then ask if test is sucess, faillure or limitation