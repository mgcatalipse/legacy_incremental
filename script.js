
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

  // Apply health reduction for elderly
  if (gameState.age >= 66) {
      let healthReduction = 1;
      if (gameState.age >= 100) {
          healthReduction += gameState.age - 100;
      }
      gameState.stats.innate.health.value = Math.max(0, gameState.stats.innate.health.value - healthReduction);
  }

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


$("#select-child").click(() => {
  if (gameState.children.length === 0) return;
  gameState.showChildSelection = true;
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

// Stored panel fr values for collapse/expand
let storedLeftFr = 20;
let storedCenterFr = 50;
let storedRightFr = 30;

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
    const totalWidth = containerRect.width - 80; // Subtract separator widths (40px each)

    if (currentSeparator === 'left') {
        let leftFr = ((e.clientX - containerRect.left) / totalWidth) * 100;
        leftFr = Math.max(20, Math.min(80, leftFr)); // Clamp between 20% and 80%
        let centerFr = 100 - leftFr - storedRightFr;
        let rightFr = storedRightFr;

        // If center would be < 20%, adjust right panel
        if (centerFr < 20) {
            centerFr = 20;
            rightFr = 100 - leftFr - centerFr;
            rightFr = Math.max(20, rightFr); // Ensure right doesn't go below 20%
        }

        container.style.gridTemplateColumns = `${leftFr}fr 40px ${centerFr}fr 40px ${rightFr}fr`;
        // Update stored fr values
        storedLeftFr = leftFr;
        storedCenterFr = centerFr;
        storedRightFr = rightFr;
    } else if (currentSeparator === 'right') {
        let rightFr = ((containerRect.right - e.clientX) / totalWidth) * 100;
        rightFr = Math.max(20, Math.min(80, rightFr)); // Clamp between 20% and 80%
        let centerFr = 100 - storedLeftFr - rightFr;
        let leftFr = storedLeftFr;

        // If center would be < 20%, adjust left panel
        if (centerFr < 20) {
            centerFr = 20;
            leftFr = 100 - centerFr - rightFr;
            leftFr = Math.max(20, leftFr); // Ensure left doesn't go below 20%
        }

        container.style.gridTemplateColumns = `${leftFr}fr 40px ${centerFr}fr 40px ${rightFr}fr`;
        // Update stored fr values
        storedLeftFr = leftFr;
        storedCenterFr = centerFr;
        storedRightFr = rightFr;
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
    // Store current fr values before collapsing
    const currentGrid = container.style.gridTemplateColumns || '20fr 40px 50fr 40px 30fr';
    const parts = currentGrid.split(' ');
    if (parts.length === 5) {
        storedLeftFr = parseFloat(parts[0]);
        storedCenterFr = parseFloat(parts[2]);
        storedRightFr = parseFloat(parts[4]);
    }
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
    // Store current fr values before collapsing
    const currentGrid = container.style.gridTemplateColumns || '20fr 40px 50fr 40px 30fr';
    const parts = currentGrid.split(' ');
    if (parts.length === 5) {
        storedLeftFr = parseFloat(parts[0]);
        storedCenterFr = parseFloat(parts[2]);
        storedRightFr = parseFloat(parts[4]);
    }
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
    if (side === 'left' && action === 'collapse') {
        // Collapse left panel, redistribute space to center and right
        const totalFr = storedLeftFr + storedCenterFr + storedRightFr;
        const newCenterFr = storedCenterFr + (storedLeftFr / 2);
        const newRightFr = storedRightFr + (storedLeftFr / 2);
        container.style.gridTemplateColumns = `0px 40px ${newCenterFr}fr 40px ${newRightFr}fr`;
    } else if (side === 'left' && action === 'expand') {
        // Expand left panel, restore stored fr values
        container.style.gridTemplateColumns = `${storedLeftFr}fr 40px ${storedCenterFr}fr 40px ${storedRightFr}fr`;
    } else if (side === 'right' && action === 'collapse') {
        // Collapse right panel, redistribute space to left and center
        const totalFr = storedLeftFr + storedCenterFr + storedRightFr;
        const newLeftFr = storedLeftFr + (storedRightFr / 2);
        const newCenterFr = storedCenterFr + (storedRightFr / 2);
        container.style.gridTemplateColumns = `${newLeftFr}fr 40px ${newCenterFr}fr 40px 0px`;
    } else if (side === 'right' && action === 'expand') {
        // Expand right panel, restore stored fr values
        container.style.gridTemplateColumns = `${storedLeftFr}fr 40px ${storedCenterFr}fr 40px ${storedRightFr}fr`;
    }
}