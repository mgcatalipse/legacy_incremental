
const gameState = {
  age: 0,
  baseGain: 1,
  multiplier: 1,
  lastTime: Date.now(),
  running: false,
  prestigeUnlocked: false,
  prestigeActive: false,
  gameTime: 0,
  startTime: null,
  isDead: false,
  stats: JSON.parse(JSON.stringify(STATS)), // Deep copy
  completedEvents: new Set(),
  availableEvents: [],
  children: [],
  wives: [],
  selectedWife: null,
  showWifeSelection: false,
  showChildSelection: false
};

// --- Buttons ---
$("#pause-restart").click(() => {
  if (gameState.running) {
    gameState.running = false;
    $("#pause-restart").text("▶️"); // Play icon when paused
  } else {
    gameState.running = true;
    gameState.lastTime = Date.now();
    $("#pause-restart").text("⏸️"); // Pause icon when running
    gameLoop();
  }
});

// Tab switching
$(".tab-btn").click(function () {
  const tabId = $(this).data("tab");

  // Update active tab button
  $(".tab-btn").removeClass("active");
  $(this).addClass("active");

  // Update active tab pane
  $(".tab-pane").removeClass("active");
  $(`#${tabId}`).addClass("active");
});

$(".multiplier-btn").click(function () {
  $(".multiplier-btn").removeClass("active");
  $(this).addClass("active");
  gameState.multiplier = parseInt($(this).attr("id").substring(1)); // x1, x2, x4
});

$("#gain").click(() => {
  if (gameState.isDead) return;

  // Check if showing selection UI
  if (gameState.showWifeSelection || gameState.showChildSelection) return;

  // Get selected events and apply their effects
  const selectedEvents = getSelectedEvents();
  selectedEvents.forEach(event => {
    // Apply event effects
    applyStatEffects(event.effects);
    // Mark as completed (for one-time events)
    if (!event.repeatable) {
      gameState.completedEvents.add(event.id);
    }
  });

  // Calculate and apply penalties from selected events
  const totalPenalties = calculateTotalPenalties();
  applyStatEffects(totalPenalties);

  // Clear all selections after applying effects
  $('.event-checkbox:checked').prop('checked', false);

  // Age the character by 1 year
  gameState.age += 1;

  // Check for death
  if (checkDeath(gameState.age)) {
    gameState.isDead = true;
    updateUI();
    return;
  }

  // Check for wife selection (teen to adult)
  if (gameState.age >= 13 && gameState.age <= 30 && !gameState.selectedWife && Math.random() < 0.3) {
    gameState.showWifeSelection = true;
  }

  // Check for retirement/child selection (elder)
  if (gameState.age >= 65 && gameState.children.length > 0) {
    gameState.showChildSelection = true;
  }

  // Update available events
  updateEventsList();

  updateUI();
});


$("#prestige").click(() => {
  if (!gameState.prestigeUnlocked || gameState.age < 18) return;
  if (!gameState.prestigeActive) {
    gameState.prestigeActive = true;
    gameState.age = 0; // Reset to baby
    gameState.isDead = false;
    gameState.prestigeUnlocked = false;
    gameState.completedEvents.clear();
    gameState.stats = JSON.parse(JSON.stringify(STATS)); // Reset stats
    $("#prestige").addClass("disabled").text("Prestige (Done)");

    // Unlock Business tab on first prestige
    if (!$('[data-tab="business"]').hasClass('unlocked')) {
      $('[data-tab="business"]').removeClass('hidden').addClass('unlocked');
      // Show time display when Business tab is unlocked
      $('#time-label, #game-time').show();
    }

    updateUI();
  }
});

// Default selected multiplier
$("#x1").addClass("active");

// Set initial pause-restart state
$("#pause-restart").text("▶️"); // Start with play icon

updateUI();
updateEventsList();
// Event listener for event checkboxes to update previews on change
// This listener triggers when a user checks or unchecks an event checkbox.
// It calls updateStatsDisplay() to refresh the stats with preview changes
// and updateEventsList() to update the events UI, including the selection summary.
// This enables real-time preview of stat changes before applying them.
$(document).on('change', '.event-checkbox', function() {
    updateStatsDisplay();
    updateEventsList();
});