
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

// Multiplier buttons removed

// Process special events with probability calculations
function processSpecialEvents() {
  const selectedEvents = getSelectedEvents();
  
  selectedEvents.forEach(event => {
    switch(event.id) {
      case "find_wife":
        const wifeProbability = calculateWifeFindingProbability();
        if (Math.random() < wifeProbability) {
          processWifeFindingResult(true);
        } else {
          processWifeFindingResult(false);
        }
        break;
      case "wedding":
        if (gameState.selectedWife && !gameState.isMarried) {
          gameState.isMarried = true;
          applyStatEffects(event.effects);
          applyStatEffects(event.penalties);
        }
        break;
      case "try_for_children":
        if (gameState.isMarried) {
          const childProbability = calculateChildBirthProbability();
          if (Math.random() < childProbability) {
            const child = createChild(gameState.selectedWife);
            gameState.children.push(child);
            alert(`Child born! ${child.name} has inherited mixed stats from both parents.`);
          } else {
            alert("No child conceived this time. Try again next year.");
          }
        }
        break;
    }
  });
}

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

  // Process special events
  processSpecialEvents();

  // Preserve selections for repeatable events that will be available next year
  gameState.preservedSelections.clear();
  selectedEvents.forEach(event => {
    if (event.repeatable) {
      // Check if this event will be available next year
      const nextYear = gameState.age + 1;
      const willBeAvailable = nextYear >= event.ageRange.min && nextYear <= event.ageRange.max;
      if (willBeAvailable) {
        gameState.preservedSelections.add(event.id);
      }
    }
  });

  // Clear all selections after applying effects
  $('.event-checkbox:checked').prop('checked', false);

  // Age the character by 1 year
  gameState.age += 1;

  // Check for death
  if (checkDeath(gameState.age)) {
    gameState.isDead = true;
    return;
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
    gameState.isMarried = false;
    gameState.prestigeUnlocked = false;
    gameState.completedEvents.clear();
    gameState.stats = JSON.parse(JSON.stringify(STATS)); // Reset stats
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

// Resizable separator functionality
const separator = $('.vertical-separator')[0];
const leftSide = $('.left-side')[0];
const rightSide = $('.right-side')[0];
const container = $('.human-content')[0];

let isDragging = false;

separator.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    if (!isDragging) return;
    const containerRect = container.getBoundingClientRect();
    let leftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    leftWidth = Math.max(20, Math.min(80, leftWidth)); // Clamp between 20% and 80%
    container.style.gridTemplateColumns = `${leftWidth}% 10px ${100 - leftWidth}%`;
}

function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}