# Requirements Document for Lineage Incremental Game

## 1. User Interface (UI) Requirements

**REQ-001:** The system shall display the current age and age group of the player in the left-side panel.  
*Traceability:* Source: `modules/ui.js`, `updateAgeDisplay()` function. Rationale: Provides essential feedback on the player's life stage for decision-making. Related: REQ-002, REQ-003.  
*Testability:* Verify by checking if the age is updated correctly after clicking the "Age Up" button and matches the game state.

**REQ-002:** The system shall display player stats categorized into Innate, Skills, and Possessions with current values and preview changes in parentheses.  
*Traceability:* Source: `modules/ui.js`, `updateStatsDisplay()` function. Rationale: Allows players to see stat impacts from selected events before applying them. Related: REQ-001, REQ-004.  
*Testability:* Select events and verify that stat previews appear correctly in the UI, matching calculations from `calculateStatPreviews()`.

**REQ-003:** The system shall update the "Age Up" button text to include death risk percentage and selected event count.  
*Traceability:* Source: `modules/ui.js`, `updateGainButton()` function. Rationale: Informs players of risks and effects to make informed choices. Related: REQ-001, REQ-005.  
*Testability:* Check button text updates dynamically based on selected events and stats, ensuring death chance is calculated accurately.

**REQ-004:** The system shall apply color coding to stats based on preview changes (green for positive, red for negative).  
*Traceability:* Source: `modules/ui.js`, `getStatClass()` function. Rationale: Enhances visual feedback for stat changes. Related: REQ-002.  
*Testability:* Select events with positive/negative effects and verify color classes are applied correctly in the HTML.

**REQ-005:** The system shall display a list of available life events with checkboxes for selection.  
*Traceability:* Source: `modules/events.js`, `updateEventsList()` function. Rationale: Enables players to choose events affecting their progression. Related: REQ-003, REQ-006.  
*Testability:* Verify events are listed based on age range and repeatable status, with checkboxes functional.

**REQ-006:** The system shall show a selection summary including total effects and penalties from selected events.  
*Traceability:* Source: `modules/events.js`, `buildSelectionSummaryHtml()` function. Rationale: Provides a clear overview of choices before application. Related: REQ-005.  
*Testability:* Select multiple events and confirm the summary displays accurate totals.

**REQ-007:** The system shall handle tab navigation between Human, Empire, and Universe sections.  
*Traceability:* Source: `script.js`, tab switching event listener. Rationale: Supports future expansions while keeping current focus on Human tab. Related: REQ-008.  
*Testability:* Click tab buttons and verify active tab changes correctly.

**REQ-008:** The system shall display placeholder text for Empire and Universe tabs indicating future features.  
*Traceability:* Source: `index.html`. Rationale: Indicates incomplete sections without breaking functionality. Related: REQ-007.  
*Testability:* Switch to Empire/Universe tabs and confirm placeholder messages appear.

## 2. Game Mechanics Requirements

**REQ-009:** The system shall increment the player's age by 1 year upon clicking the "Age Up" button.  
*Traceability:* Source: `script.js`, `#gain` click handler. Rationale: Core progression mechanic for aging the character. Related: REQ-010, REQ-011.  
*Testability:* Click "Age Up" and verify age increases by 1 in the UI and game state.

**REQ-010:** The system shall apply effects from selected events to player stats after aging up.  
*Traceability:* Source: `script.js`, `applyStatEffects()` call in `#gain` handler. Rationale: Events drive stat changes for gameplay. Related: REQ-009, REQ-012.  
*Testability:* Select events, age up, and check if stats update according to event effects.

**REQ-011:** The system shall check for player death based on age, health, stress, and luck after aging up.  
*Traceability:* Source: `modules/game.js`, `checkDeath()` function. Rationale: Introduces risk and challenge to progression. Related: REQ-009, REQ-013.  
*Testability:* Simulate conditions leading to death and verify game over state is triggered.

**REQ-012:** The system shall apply penalties if more events are selected than allowed by the age group.  
*Traceability:* Source: `modules/events.js`, `calculateTotalPenalties()` function. Rationale: Balances event selection with consequences. Related: REQ-010.  
*Testability:* Select excess events and confirm penalties are applied to stats.

**REQ-013:** The system shall calculate death chance based on age group, health, and stress.  
*Traceability:* Source: `modules/game.js`, `calculateDeathChance()` function. Rationale: Provides risk assessment for UI display. Related: REQ-011.  
*Testability:* Input various stats and verify death chance percentage matches expected formula.

**REQ-014:** The system shall unlock prestige at age 18 and allow reset upon activation.  
*Traceability:* Source: `modules/ui.js`, `handleSpecialUIStates()` and `script.js`, `#prestige` handler. Rationale: Offers replayability through reset mechanics. Related: REQ-015.  
*Testability:* Reach age 18, check prestige button enables, and verify reset functionality.

**REQ-015:** The system shall reset stats, age, and completed events upon prestige activation.  
*Traceability:* Source: `script.js`, `#prestige` click handler. Rationale: Ensures a fresh start for new playthroughs. Related: REQ-014.  
*Testability:* Activate prestige and confirm all specified elements reset to initial values.

## 3. Event System Requirements

**REQ-016:** The system shall filter available events based on current age range.  
*Traceability:* Source: `modules/events.js`, `getAvailableEvents()` function. Rationale: Ensures age-appropriate choices. Related: REQ-017.  
*Testability:* Change age and verify only relevant events are displayed.

**REQ-017:** The system shall distinguish between one-time and repeatable events in the UI.  
*Traceability:* Source: `modules/events.js`, `buildOneTimeEventsHtml()` and `buildRepeatableEventsHtml()` functions. Rationale: Differentiates event types for clarity. Related: REQ-016.  
*Testability:* Check UI rendering for badges and selection behavior for repeatable vs. one-time events.

**REQ-018:** The system shall calculate stat previews from selected events in real-time.  
*Traceability:* Source: `modules/events.js`, `calculateStatPreviews()` function. Rationale: Enables preview before commitment. Related: REQ-019.  
*Testability:* Toggle event selections and verify previews update immediately.

**REQ-019:** The system shall include penalties in stat previews when exceeding max events.  
*Traceability:* Source: `modules/events.js`, `calculateTotalPenalties()` integrated into previews. Rationale: Shows full impact including costs. Related: REQ-018.  
*Testability:* Select excess events and confirm penalties appear in previews.

**REQ-020:** The system shall mark one-time events as completed after application.  
*Traceability:* Source: `script.js`, event completion in `#gain` handler. Rationale: Prevents re-selection of non-repeatable events. Related: REQ-021.  
*Testability:* Apply a one-time event and verify it no longer appears in future lists.

**REQ-021:** The system shall allow repeatable events to be selected multiple times.  
*Traceability:* Source: `modules/events.js`, `getAvailableEvents()` checks repeatable flag. Rationale: Supports ongoing choices. Related: REQ-020.  
*Testability:* Apply a repeatable event and confirm it remains available.

## 4. Family Management Requirements

**REQ-022:** The system shall trigger wife selection UI between ages 13 and 30 with a 30% chance.  
*Traceability:* Source: `script.js`, wife selection check in `#gain` handler. Rationale: Introduces family mechanics at appropriate ages. Related: REQ-023.  
*Testability:* Age to 13-30 and verify UI appears probabilistically.

**REQ-023:** The system shall generate potential wives based on player stats and display selection options.  
*Traceability:* Source: `modules/family.js`, `generateWives()` and `showWifeSelection()` functions. Rationale: Creates varied family choices. Related: REQ-022, REQ-024.  
*Testability:* Trigger selection and check if wives are generated with stats derived from player.

**REQ-024:** The system shall create a child upon wife selection, mixing stats from parents.  
*Traceability:* Source: `modules/family.js`, `createChild()` function. Rationale: Simulates inheritance for lineage. Related: REQ-023.  
*Testability:* Select a wife and verify child stats are calculated as per mixing formula.

**REQ-025:** The system shall trigger child selection UI at age 65 if children exist.  
*Traceability:* Source: `script.js`, child selection check in `#gain` handler. Rationale: Allows succession for continuity. Related: REQ-026.  
*Testability:* Reach age 65 with children and confirm UI appears.

**REQ-026:** The system shall transfer selected child's stats to the player upon succession.  
*Traceability:* Source: `modules/family.js`, `showChildSelection()` handler. Rationale: Enables playing as descendants. Related: REQ-025.  
*Testability:* Select a child and verify player stats update to child's values.

## 5. Data Management Requirements

**REQ-027:** The system shall load initial stats from a predefined structure.  
*Traceability:* Source: `data/stats.js`, `STATS` constant. Rationale: Provides starting point for gameplay. Related: REQ-028.  
*Testability:* Verify game state initializes with values from STATS.

**REQ-028:** The system shall define age groups with death chances and names.  
*Traceability:* Source: `data/ageGroups.js`, `AGE_GROUPS` constant. Rationale: Structures life stages and risks. Related: REQ-027.  
*Testability:* Check age group assignment and death chance calculations.

**REQ-029:** The system shall load life events with effects, penalties, and age ranges.  
*Traceability:* Source: `data/lifeEvents.js`, `LIFE_EVENTS` array. Rationale: Defines available choices and impacts. Related: REQ-030.  
*Testability:* Verify events are filtered and applied based on data.

**REQ-030:** The system shall enforce stat min/max bounds when applying changes.  
*Traceability:* Source: `modules/game.js`, `applyStatEffects()` function. Rationale: Prevents invalid stat values. Related: REQ-029.  
*Testability:* Apply effects that would exceed bounds and confirm clamping.

## 6. System Integration Requirements

**REQ-031:** The system shall update the UI after every age-up or event selection.  
*Traceability:* Source: `script.js`, `updateUI()` calls. Rationale: Maintains consistency across components. Related: REQ-032.  
*Testability:* Perform actions and verify all UI elements reflect changes.

**REQ-032:** The system shall handle game over state by disabling interactions and updating displays.  
*Traceability:* Source: `modules/ui.js`, `updateAgeDisplay()` for death. Rationale: Ends gameplay appropriately. Related: REQ-031.  
*Testability:* Trigger death and confirm UI disables and shows "Game Over".

**REQ-033:** The system shall support resizable panels for UI layout.  
*Traceability:* Source: `script.js`, separator drag handlers. Rationale: Improves user experience. Related: REQ-034.  
*Testability:* Drag separator and verify panel widths adjust within limits.

**REQ-034:** The system shall clamp panel resize between 20% and 80% width.  
*Traceability:* Source: `script.js`, `onMouseMove()` function. Rationale: Prevents layout breakage. Related: REQ-033.  
*Testability:* Attempt to resize beyond limits and confirm clamping.

This document outlines specific, testable requirements derived from the codebase analysis, ensuring traceability and verifiability for implementation and testing.