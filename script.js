
// =============================================================================
// GAME STATE
// =============================================================================

const gameState = {
  age: 0,
  baseGain: 1,
  multiplier: 1,
  prestigeUnlocked: false,
  prestigeActive: false,
  startTime: null,
  isDead: false,
  isMarried: false,
  stats: JSON.parse(JSON.stringify(STATS)), // Deep copy
  completedEvents: new Set(),
  availableEvents: [],
  children: [],
  wives: [],
  selectedWife: null,
  showWifeSelection: false,
  showChildSelection: false,
  preservedSelections: new Set()
};


// =============================================================================
// TAB MANAGEMENT
// =============================================================================

/**
 * Switch between different tab views (Human, Empire, Universe)
 */
$(".tab-btn").click(function () {
  const tabId = $(this).data("tab");

  // Update active tab button
  $(".tab-btn").removeClass("active");
  $(this).addClass("active");

  // Update active tab pane
  $(".tab-pane").removeClass("active");
  $(`#${tabId}`).addClass("active");
});

// =============================================================================
// SPECIAL EVENT PROCESSING
// =============================================================================

/**
 * Process special events that have probability calculations or unique logic
 */
function processSpecialEvents() {
  const selectedEvents = getSelectedEvents();
   
  selectedEvents.forEach(event => {
    switch(event.id) {
      case "find_wife":
        handleFindWifeEvent();
        break;
      case "wedding":
        handleWeddingEvent(event);
        break;
      case "try_for_children":
        handleChildBirthEvent();
        break;
    }
  });
}

/**
 * Handle wife finding event with probability calculation
 */
function handleFindWifeEvent() {
  const wifeProbability = calculateWifeFindingProbability();
  if (Math.random() < wifeProbability) {
    processWifeFindingResult(true);
  } else {
    processWifeFindingResult(false);
  }
}

/**
 * Handle wedding event
 */
function handleWeddingEvent(event) {
  if (gameState.selectedWife && !gameState.isMarried) {
    gameState.isMarried = true;
    applyStatEffects(event.effects);
    applyStatEffects(event.penalties);
  }
}

/**
 * Handle child birth event with probability calculation
 */
function handleChildBirthEvent() {
  if (gameState.isMarried) {
    const childProbability = calculateChildBirthProbability();
    if (Math.random() < childProbability) {
      const child = createChild(gameState.selectedWife);
      gameState.children.push(child);
      addLogMessage(`Child born! ${child.name} has inherited mixed stats from both parents.`);
    } else {
      addLogMessage("No child conceived this time. Try again next year.");
    }
  }
}

// =============================================================================
// MAIN GAME LOOP - AGE UP FUNCTIONALITY
// =============================================================================

/**
 * Handle the main age up process when player clicks the gain button
 */
$("#gain").click(() => {
  // Early returns for game states that prevent aging up
  if (isGameInUnplayableState()) return;

  // Process all selected events and their effects
  processSelectedEvents();

  // Apply penalties for selecting too many events
  applyEventPenalties();

  // Process special probability-based events
  processSpecialEvents();

  // Handle repeatable event selections for next year
  preserveRepeatableSelections();

  // Clear UI selections after processing
  clearEventSelections();

  // Age the character and apply age-related effects
  ageCharacter();

  // Check for death after aging
  if (checkForDeath()) return;

  // Check for elder stage and child selection
  checkForElderStage();

  // Update game state and UI
  refreshGameState();
});

/**
 * Check if game is in a state where aging up is not possible
 */
function isGameInUnplayableState() {
  return gameState.isDead ||
         gameState.showWifeSelection ||
         gameState.showChildSelection;
}

/**
 * Process all selected events and their immediate effects
 */
function processSelectedEvents() {
  const selectedEvents = getSelectedEvents();
  
  selectedEvents.forEach(event => {
    applyEventEffects(event);
    markEventAsCompleted(event);
  });
}

/**
 * Apply effects of an individual event
 */
function applyEventEffects(event) {
  applyStatEffects(event.effects);
}

/**
 * Mark one-time events as completed
 */
function markEventAsCompleted(event) {
  if (!event.repeatable) {
    gameState.completedEvents.add(event.id);
  }
}

/**
 * Calculate and apply penalties from selecting too many events
 */
function applyEventPenalties() {
  const totalPenalties = calculateTotalPenalties();
  applyStatEffects(totalPenalties);
}

/**
 * Preserve selections for repeatable events that will be available next year
 */
function preserveRepeatableSelections() {
  gameState.preservedSelections.clear();
  
  const selectedEvents = getSelectedEvents();
  selectedEvents.forEach(event => {
    if (event.repeatable && willEventBeAvailableNextYear(event)) {
      gameState.preservedSelections.add(event.id);
    }
  });
}

/**
 * Check if an event will be available next year
 */
function willEventBeAvailableNextYear(event) {
  const nextYear = gameState.age + 1;
  return nextYear >= event.ageRange.min && nextYear <= event.ageRange.max;
}

/**
 * Clear all event checkbox selections from UI
 */
function clearEventSelections() {
  $('.event-checkbox:checked').prop('checked', false);
}

/**
 * Age the character by 1 year and apply age-related effects
 */
function ageCharacter() {
  gameState.age += 1;
  applyElderHealthReduction();
}

/**
 * Apply health reduction for elderly characters
 */
function applyElderHealthReduction() {
  if (gameState.age >= CONSTANTS.AGE.HEALTH_REDUCTION_START) {
    let healthReduction = CONSTANTS.STATS.HEALTH_REDUCTION_ELDERLY;
    if (gameState.age >= CONSTANTS.AGE.HEALTH_REDUCTION_MULTIPLIER) {
      healthReduction += gameState.age - CONSTANTS.AGE.HEALTH_REDUCTION_MULTIPLIER;
    }
    gameState.stats.innate.health.value = Math.max(0, gameState.stats.innate.health.value - healthReduction);
  }
}

/**
 * Check if character died and handle game over state
 */
function checkForDeath() {
  if (checkDeath(gameState.age)) {
    gameState.isDead = true;
    addLogMessage(`Aged up to ${gameState.age} years old. Unfortunately, you have died.`);
    return true;
  }

  addLogMessage(`Aged up to ${gameState.age} years old.`);
  return false;
}

/**
 * Check if character reached elder stage and should select child
 */
function checkForElderStage() {
  if (gameState.age >= CONSTANTS.AGE.ELDER_START && gameState.children.length > 0) {
    gameState.showChildSelection = true;
  }
}

/**
 * Refresh game state and update UI after aging up
 */
function refreshGameState() {
  updateEventsList();
  updateUI();
}


$("#select-child").click(() => {
  if (gameState.children.length === 0) return;
  gameState.showChildSelection = true;
  updateUI();
});

$("#prestige").click(() => {
  if (!gameState.prestigeUnlocked || gameState.age < CONSTANTS.AGE.PRESTIGE_UNLOCK) return;
  if (!gameState.prestigeActive) {
    gameState.prestigeActive = true;
    gameState.age = 0; // Reset to baby
    gameState.isDead = false;
    gameState.isMarried = false;
    gameState.prestigeUnlocked = false;
    gameState.completedEvents.clear();
    gameState.stats = deepCopy(STATS); // Reset stats
    $("#prestige").addClass("disabled").text("Prestige (Done)");

    updateUI();
  }
});

// Multiplier buttons removed

updateEventsList();
updateUI();
// Event listener for event checkboxes to update previews on change
// This listener triggers when a user checks or unchecks an event checkbox.
// It calls updateUI() to refresh the entire UI with preview changes.
$(document).on('change', '.event-checkbox', function() {
         console.log('Event checkbox changed for', $(this).data('event-id'));
         updateUI();
         console.log('After updateUI');
 });

// =============================================================================
// GRID MANAGEMENT
// =============================================================================

/**
 * Initialize grid functionality (delegated to grid module)
 */
function initGrid() {
  initGridResizing();
  initPanelCollapse();
}

// Initialize grid when DOM is ready
$(document).ready(function() {
  initGrid();
});