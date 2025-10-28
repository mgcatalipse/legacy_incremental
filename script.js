
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
            addLogMessage(`Child born! ${child.name} has inherited mixed stats from both parents.`);
          } else {
            addLogMessage("No child conceived this time. Try again next year.");
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
    addLogMessage(`Aged up to ${gameState.age} years old. Unfortunately, you have died.`);
    return;
  }

  addLogMessage(`Aged up to ${gameState.age} years old.`);

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
const separatorLeft = $('.separator-left')[0];
const separatorRight = $('.separator-right')[0];
const leftPanel = $('.left-panel')[0];
const centerPanel = $('.center-panel')[0];
const rightPanel = $('.right-panel')[0];
const container = $('.human-content')[0];

let isDragging = false;
let currentSeparator = null;

separatorLeft.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;
    currentSeparator = 'left';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

separatorRight.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;
    currentSeparator = 'right';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    if (!isDragging) return;
    const containerRect = container.getBoundingClientRect();

    if (currentSeparator === 'left') {
        let leftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        leftWidth = Math.max(15, Math.min(35, leftWidth)); // Clamp between 15% and 35%
        const centerWidth = 50 - leftWidth;
        const rightWidth = 100 - leftWidth - centerWidth;
        container.style.gridTemplateColumns = `${leftWidth}% 40px ${centerWidth}% 40px ${rightWidth}%`;
    } else if (currentSeparator === 'right') {
        let rightWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
        rightWidth = Math.max(15, Math.min(35, rightWidth)); // Clamp between 15% and 35%
        const centerWidth = 50 - rightWidth;
        const leftWidth = 100 - centerWidth - rightWidth;
        container.style.gridTemplateColumns = `${leftWidth}% 40px ${centerWidth}% 40px ${rightWidth}%`;
    }
}

function onMouseUp() {
    isDragging = false;
    currentSeparator = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// Collapse/expand functionality
$('#collapse-left').click(function() {
    $('.left-panel').hide();
    $('#expand-left').show();
    $('#collapse-left').hide();
    updateGridAfterCollapse('left', 'collapse');
});

$('#expand-left').click(function() {
    $('.left-panel').show();
    $('#expand-left').hide();
    $('#collapse-left').show();
    updateGridAfterCollapse('left', 'expand');
});

$('#collapse-right').click(function() {
    $('.right-panel').hide();
    $('#expand-right').show();
    $('#collapse-right').hide();
    updateGridAfterCollapse('right', 'collapse');
});

$('#expand-right').click(function() {
    $('.right-panel').show();
    $('#expand-right').hide();
    $('#collapse-right').show();
    updateGridAfterCollapse('right', 'expand');
});

function updateGridAfterCollapse(side, action) {
    const currentGrid = container.style.gridTemplateColumns || '1fr 40px 1fr 40px 1fr';
    const parts = currentGrid.split(' ');
    if (parts.length !== 5) return;

    if (side === 'left' && action === 'collapse') {
        container.style.gridTemplateColumns = `0px 40px ${parts[2]} 40px ${parts[4]}`;
    } else if (side === 'left' && action === 'expand') {
        container.style.gridTemplateColumns = `20% 40px 40% 40px 40%`;
    } else if (side === 'right' && action === 'collapse') {
        container.style.gridTemplateColumns = `${parts[0]} 40px ${parts[2]} 40px 0px`;
    } else if (side === 'right' && action === 'expand') {
        container.style.gridTemplateColumns = `20% 40px 40% 40px 40%`;
    }
}