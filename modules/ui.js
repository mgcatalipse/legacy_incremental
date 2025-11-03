/**
 * UI Module - Handles all user interface updates and display logic
 */

// =============================================================================
// STAT DISPLAY LOGIC
// =============================================================================

/**
 * Determine CSS class for stat value based on stat name and preview change
 * @param {string} statName - The name of the stat
 * @param {number} previewChange - The preview change value
 * @returns {string} CSS class name for styling
 */
function getStatClass(statName, previewChange) {
  if (statName === 'stress') {
    if (previewChange > 0) return 'stat-stress-positive-shadow-red';
    if (previewChange < 0) return 'stat-stress-negative-green';
  } else {
    if (previewChange > 0) return 'stat-positive-green';
    if (previewChange < 0) return 'stat-negative-shadow-red';
  }
  return '';
}

/**
 * Calculate final value after applying preview changes
 * @param {number} currentValue - Current stat value
 * @param {number} previewChange - Proposed change from selected events
 * @param {object} bounds - Min/max bounds for the stat
 * @returns {number} Final value clamped within bounds
 */
function calculateFinalValue(currentValue, previewChange, bounds) {
  const rawFinalValue = currentValue + previewChange;
  const maxValue = (bounds.max !== null && bounds.max !== undefined) ? bounds.max : Infinity;
  return Math.max(bounds.min, Math.min(maxValue, rawFinalValue));
}

/**
 * Format stat change for display
 * @param {number} previewChange - The change value
 * @param {string} statName - The name of the stat (for special formatting)
 * @returns {string} Formatted change string
 */
function formatStatChange(previewChange, statName) {
  if (previewChange === 0) return '';
  
  const sign = previewChange > 0 ? '+' : '';
  if (statName === 'money') {
    return `${sign}$${Math.abs(previewChange)}`;
  }
  return `${sign}${previewChange}`;
}

/**
 * Format stat value for display
 * @param {number} value - The stat value
 * @param {string} statName - The name of the stat
 * @returns {string} Formatted value for display
 */
function formatStatValue(value, statName) {
  if (isNaN(value)) return 'NaN';
  
  if (statName === 'money') {
    return formatMoney(value);
  }
  return Math.floor(value);
}

/**
 * Render a single stat item for display
 * @param {string} statName - Name of the stat
 * @param {object} data - Stat data object with value, min, max
 * @param {number} previewChange - Current preview change
 * @returns {string} HTML string for the stat item
 */
function renderStatItem(statName, data, previewChange) {
  const currentValue = data.value;
  const finalValue = calculateFinalValue(currentValue, previewChange, data);
  const displayValue = formatStatValue(finalValue, statName);
  const changeText = formatStatChange(previewChange, statName);
  const previewText = previewChange !== 0 ? ` (${changeText})` : '';
  const statClass = getStatClass(statName, previewChange);

  return `
    <div class="stat-item">
      <span class="stat-name">${statName.charAt(0).toUpperCase() + statName.slice(1)}:</span>
      <span class="stat-value ${statClass}">${displayValue}${previewText}</span>
    </div>
  `;
}

/**
 * Render all stats for a category (innate, skills, possessions)
 * @param {string} categoryName - Name of the category
 * @param {object} stats - Stats object for the category
 * @param {object} previews - Preview changes object
 * @returns {string} HTML string for the stat category
 */
function renderStatCategory(categoryName, stats, previews) {
  let categoryHtml = `<div class="stat-category"><h4>${categoryName}</h4>`;
  
  for (const [statName, data] of Object.entries(stats)) {
    const previewChange = previews[categoryName.toLowerCase()]?.[statName] || 0;
    categoryHtml += renderStatItem(statName, data, previewChange);
  }
  
  categoryHtml += '</div>';
  return categoryHtml;
}

/**
 * Update stats display with previews
 * This function refreshes the stats UI to show current values along with preview changes
 * from selected events. It calls calculateStatPreviews() to get the total changes and
 * displays them in parentheses next to each stat (e.g., "10 (+5)").
 * This provides real-time feedback on how stats will change before applying events.
 */
function updateStatsDisplay() {
  const previews = calculateStatPreviews();

  let statsHtml = '<div id="stats-display"><h3>Stats</h3>';
  statsHtml += renderStatCategory('Innate', gameState.stats.innate, previews);
  statsHtml += renderStatCategory('Skills', gameState.stats.skills, previews);
  statsHtml += renderStatCategory('Possessions', gameState.stats.possessions, previews);
  statsHtml += '</div>';

  // Update the left panel with stats instead of just age
  $('.left-panel').html(`
    <div id="age-display">
      <h2 id="age-title">${getCurrentAgeGroup(gameState.age).name}</h2>
      <div id="age-points">${getCurrentAgeGroup(gameState.age).name} Age: ${gameState.age}</div>
    </div>
    ${statsHtml}
  `);
}

// Helper function to update age display
function updateAgeDisplay() {
  if (gameState.isDead) {
    $("#age-title").text("DEAD");
    $("#age-points").text("Game Over");
    $("#gain").prop("disabled", true).text("Game Over");
    return;
  }

  const ageGroup = getCurrentAgeGroup(gameState.age);
  $("#age-title").text(ageGroup.name);
  $("#age-points").text(`Age: ${gameState.age}`);
}


// Helper function to update gain button with death chance
function updateGainButton() {
  console.log('updateGainButton called');
  const previews = calculateStatPreviews();
  console.log('Previews:', previews);
  const finalStats = computeFinalStats(previews);
  console.log('Final stats:', finalStats);
  const deathChance = calculateDeathChance(gameState.age, finalStats);
  console.log('Death chance:', deathChance);
  const selectedCount = $('.event-checkbox:checked').length;
  const effectText = selectedCount > 0 ? ` + Apply ${selectedCount} selected event${selectedCount > 1 ? 's' : ''}` : '';

  // Update button text
  const newText = `Age Up (+1 year, ${deathChance.toFixed(1)}% death risk)${effectText}`;
  console.log('Setting gain button text to:', newText);
  $("#gain").text(newText);

  // Update color scheme based on risk level
  $("#gain").removeClass('gain-low-risk gain-medium-risk gain-high-risk');
  if (deathChance < 10) {
    $("#gain").addClass('gain-low-risk');
  } else if (deathChance < 50) {
    $("#gain").addClass('gain-medium-risk');
  } else {
    $("#gain").addClass('gain-high-risk');
  }
}

// Helper function to handle special UI states
function handleSpecialUIStates() {
  // Handle wife selection UI
  if (gameState.showWifeSelection) {
    showWifeSelection();
  }

  // Handle child selection UI
  if (gameState.showChildSelection) {
    showChildSelection();
  }

  // Show/hide select child button
  if (gameState.children.length > 0 && gameState.age >= CONSTANTS.AGE.PRESTIGE_UNLOCK) {
    $('#select-child').show();
  } else {
    $('#select-child').hide();
  }

  // Unlock prestige at age 18
  if (gameState.age >= CONSTANTS.AGE.PRESTIGE_UNLOCK && !gameState.prestigeUnlocked) {
    $("#prestige").removeClass("disabled").text("Prestige (Available!)");
    gameState.prestigeUnlocked = true;
  }
}

function addLogMessage(message) {
  const logMessages = $('#log-messages');
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `<div class="log-entry">[${timestamp}] ${message}</div>`;
  logMessages.prepend(logEntry);
  // Keep only last N messages
  const entries = logMessages.children();
  if (entries.length > CONSTANTS.UI.LOG_MAX_ENTRIES) {
    entries.last().remove();
  }
  // Auto-scroll to top (since newest are at top)
  logMessages.scrollTop(0);
}

function updateEventsHeader() {
   // Update header with selectable count
   const Y = getMaxEvents();
   const selectedCount = getSelectedEvents().length;
   const colorClass = selectedCount > Y ? 'penalty-red' : 'penalty-green';
   const headerText = `Life Events (${selectedCount}/${Y} selectable without penalties)`;
   $('#events-container h3').html(headerText.replace(`${selectedCount}/${Y}`, `<span class="${colorClass}">${selectedCount}/${Y}</span>`));
}

function updateUI() {
   updateAgeDisplay();
   updateStatsDisplay();
   updateGainButton();
   handleSpecialUIStates();
   updateEventsHeader();
}

// No export, functions are global