# Test Implementation Plan for Lineage Incremental Game

This document outlines a comprehensive testing strategy for the Lineage Incremental game based on the memory bank specifications. Tests are categorized by functionality and specify whether they require unit tests (Jest), integration tests (Playwright), or both. All tests depend on the local development server (live-server on port 5500) for integration testing.

## Basic Functionality Tests

### 1. Page Load and Initial State
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires full browser environment to verify DOM rendering and JavaScript initialization.

**Scenario**:
1. Start local development server (`npx live-server ./ --port=5500`)
2. Navigate to `http://127.0.0.1:5500`
3. Wait for network idle state

**Input/Output**:
- Input: None (page load)
- Output: Page title = "Incremental Game", game title = "Lineage Incremental", age display = "Baby Age: 0", gain button visible

**Bounds/Edge Cases**: Test with different browsers (Chrome, Firefox), slow network conditions, JavaScript disabled (should show basic HTML)

### 2. Game State Initialization
**Test Type**: Both (Unit for state object, Integration for UI rendering)  
**Reasoning**: Unit test for isolated state logic, integration for UI synchronization.

**Scenario**:
- Unit: Import gameState object directly
- Integration: Load page and verify initial UI state

**Input/Output**:
- Input: None (default initialization)
- Output: gameState.age = 0, stats.health = 100, all other stats = 5 or 0 as per defaults

**Bounds/Edge Cases**: Verify all stat categories (innate, skills, possessions) initialize correctly, empty completedEvents Set, empty availableEvents array

### 3. Age Progression Without Events
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires UI interaction and state updates across multiple components.

**Scenario**:
1. Load game in initial state
2. Click "Age Up" button multiple times
3. Verify age increments and UI updates

**Input/Output**:
- Input: Multiple clicks on #gain button
- Output: Age increases by 1 each click, age group changes at boundaries (Baby→Child at age 3, etc.)

**Bounds/Edge Cases**: Test age progression to maximum (200+), verify death risk display updates, test rapid clicking

## Event System Tests

### 4. Event Availability Filtering
**Test Type**: Both (Unit for filtering logic, Integration for UI display)  
**Reasoning**: Unit test for pure logic, integration for visual verification.

**Scenario**:
- Unit: Call getAvailableEvents() with different age parameters
- Integration: Load game at different ages and verify displayed events

**Input/Output**:
- Input: age = 0 (Baby events), age = 5 (Child events), age = 15 (Teen events)
- Output: Only age-appropriate events shown, one-time events disappear after completion

**Bounds/Edge Cases**: Test age boundaries (age 2→3 transition), empty event lists for invalid ages, events with prerequisites

### 5. Event Selection and Stat Previews
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires real-time UI updates and preview calculations.

**Scenario**:
1. Load game at age 0
2. Select/deselect event checkboxes
3. Verify stat preview updates immediately

**Input/Output**:
- Input: Check "Learn to Walk" checkbox
- Output: Agility stat preview shows +5, UI highlights preview changes

**Bounds/Edge Cases**: Multiple selections within limits, over-selection showing penalties, unchecking events removes previews

### 6. Event Application and Penalties
**Test Type**: Both (Unit for calculation, Integration for full flow)  
**Reasoning**: Unit for penalty math, integration for end-to-end event processing.

**Scenario**:
- Unit: Test calculateTotalPenalties() with different event counts
- Integration: Select events beyond limit, age up, verify penalty application

**Input/Output**:
- Input: Age group allows 1 event, select 3 events
- Output: Penalty applied (e.g., -10 health), events still applied but with cost

**Bounds/Edge Cases**: Test penalty scaling with excess events (2 excess = higher penalty), zero penalty for within limits, maximum penalty caps

## Death Risk System Tests

### 7. Death Chance Calculation
**Test Type**: Both (Unit for calculation, Integration for display)  
**Reasoning**: Unit for mathematical accuracy, integration for UI feedback.

**Scenario**:
- Unit: Call calculateDeathChance() with different stat combinations
- Integration: Modify stats via events, verify death risk display

**Input/Output**:
- Input: age = 0, health = 100, stress = 0, luck = 5
- Output: Death chance ≈ 0.1% (base baby chance)

**Bounds/Edge Cases**: High health/low stress (minimum risk), low health/high stress (maximum risk), luck modifiers (±20% range), age group transitions

### 8. Death Outcome Simulation
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires random number generation and full game state reset.

**Scenario**:
1. Set character to high death risk state
2. Click Age Up repeatedly until death occurs
3. Verify game over state

**Input/Output**:
- Input: Low health (20), high stress (80), bad luck (1)
- Output: Eventual death (isDead = true), UI shows game over message

**Bounds/Edge Cases**: Test with guaranteed death (health = 0), guaranteed survival (perfect stats), multiple death scenarios

## Family Lineage System Tests

### 9. Marriage System Activation
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires age progression and UI state changes.

**Scenario**:
1. Progress character to age 18
2. Verify wife selection UI appears

**Input/Output**:
- Input: Age up to 18
- Output: showWifeSelection = true, wife selection panel visible

**Bounds/Edge Cases**: Test exact age 18 trigger, no activation before 18, multiple attempts

### 10. Wife Generation and Selection
**Test Type**: Both (Unit for generation logic, Integration for UI)  
**Reasoning**: Unit for stat inheritance math, integration for selection flow.

**Scenario**:
- Unit: Test generateWives() output
- Integration: Select wife and verify child creation

**Input/Output**:
- Input: Player stats (intelligence = 50, beauty = 30)
- Output: Generated wives with mixed stats, selection creates child with averaged stats

**Bounds/Edge Cases**: Test with extreme parent stats (0 and 100), verify stat inheritance formulas, wife rejection/cancellation

### 11. Child Creation and Succession
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires full family flow and game state transitions.

**Scenario**:
1. Complete marriage
2. Progress to elder age
3. Select successor child

**Input/Output**:
- Input: Select wife, age to elder (60+)
- Output: Child created with inherited stats, successor selection UI, game continues as child

**Bounds/Edge Cases**: Multiple children selection, stat inheritance accuracy, lineage continuation without interruption

## Prestige System Tests

### 12. Prestige Unlock and Activation
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires age progression and UI button states.

**Scenario**:
1. Reach age 18
2. Verify prestige button appears
3. Click prestige and verify reset

**Input/Output**:
- Input: Age up to 18
- Output: Prestige button visible, click resets game with enhanced stats

**Bounds/Edge Cases**: Test prestige before age 18 (should be hidden), verify enhanced starting stats, multiple prestige cycles

## UI/UX Tests

### 13. Panel Resizing Functionality
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires DOM manipulation and CSS layout changes.

**Scenario**:
1. Load game
2. Click collapse/expand buttons
3. Verify panel visibility and layout

**Input/Output**:
- Input: Click #collapse-left button
- Output: Left panel hidden, center panel expands

**Bounds/Edge Cases**: Test all panel combinations, window resize events, mobile responsiveness

### 14. Real-time Stat Previews
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires immediate UI updates on user interaction.

**Scenario**:
1. Select multiple events rapidly
2. Verify preview updates without delay

**Input/Output**:
- Input: Check/uncheck events quickly
- Output: Stat displays update instantly with correct preview values

**Bounds/Edge Cases**: Test with many events selected, verify preview removal on uncheck, performance with 10+ events

### 15. Tab Navigation
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires tab switching and content display.

**Scenario**:
1. Click Empire and Universe tabs
2. Verify placeholder content

**Input/Output**:
- Input: Click .tab-btn[data-tab="empire"]
- Output: Empire tab content visible, placeholder text displayed

**Bounds/Edge Cases**: Test tab persistence, invalid tab clicks, future content expansion

## Performance Tests

### 16. Long Game Session Stability
**Test Type**: Integration Test (Playwright)  
**Reasoning**: Requires extended automation to test memory and performance.

**Scenario**:
1. Automate 200+ age ups
2. Monitor for memory leaks or slowdowns

**Input/Output**:
- Input: Programmatic age progression
- Output: No crashes, UI remains responsive, memory usage stable

**Bounds/Edge Cases**: Test with maximum events selected each age, extreme stat values, continuous rapid clicking

### 17. Large Dataset Handling
**Test Type**: Both (Unit for data processing, Integration for UI rendering)  
**Reasoning**: Unit for algorithm efficiency, integration for display performance.

**Scenario**:
- Unit: Test with arrays of 1000+ events
- Integration: Load game with many completed events

**Input/Output**:
- Input: Large completedEvents Set
- Output: UI updates within 100ms, no rendering delays

**Bounds/Edge Cases**: Test memory limits, browser performance boundaries, cleanup on prestige reset

## Implementation Priorities

1. **High Priority**: Basic functionality (1-3), death system (7-8), UI responsiveness (13-14)
2. **Medium Priority**: Event system (4-6), family mechanics (9-11)
3. **Low Priority**: Prestige system (12), advanced UI (15), performance (16-17)

## Dependencies

- **Playwright**: For all integration tests requiring browser automation
- **Jest**: For unit tests of isolated functions
- **live-server**: Local development server for integration testing
- **Node.js**: Package management and test execution

## Test Execution Strategy

- Run unit tests: `npm test`
- Run integration tests: `npx playwright test`
- CI/CD integration: Combine both test suites with parallel execution
- Manual verification: Use `npx playwright show-report` for detailed results