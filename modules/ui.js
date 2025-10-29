// Helper function to determine the CSS class for stat value based on stat name and preview change
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

// Update stats display with previews
// This function refreshes the stats UI to show current values along with preview changes
// from selected events. It calls calculateStatPreviews() to get the total changes and
// displays them in parentheses next to each stat (e.g., "10 (+5)").
// This provides real-time feedback on how stats will change before applying events.
// It is triggered by the event listener in script.js when checkboxes are changed.
function updateStatsDisplay() {
  console.log('updateStatsDisplay called');
  const previews = calculateStatPreviews();
  console.log('Updating stats display with previews:', previews);
  let statsHtml = '<div id="stats-display"><h3>Stats</h3>';

  // Innate stats
  statsHtml += '<div class="stat-category"><h4>Innate</h4>';
  for (const [stat, data] of Object.entries(gameState.stats.innate)) {
    const currentValue = data.value;
    const previewChange = previews.innate[stat] || 0;
    const changeSign = previewChange > 0 ? '+' : (previewChange < 0 ? '' : '');
    const displayChange = `${changeSign}${previewChange}`;
    const previewText = previewChange !== 0 ? ` (${displayChange})` : '';
    const rawFinalValue = currentValue + previewChange;
    const finalValue = data.max !== null && data.max !== undefined
      ? Math.max(data.min, Math.min(data.max, rawFinalValue))
      : Math.max(data.min, rawFinalValue);


    const statClass = getStatClass(stat, previewChange);
    const displayValue = isNaN(finalValue) ? 'NaN' : Math.floor(finalValue);
    statsHtml += `
      <div class="stat-item">
        <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
        <span class="stat-value ${statClass}">${displayValue}${previewText}</span>
      </div>
    `;
  }
  statsHtml += '</div>';

  // Skills
  statsHtml += '<div class="stat-category"><h4>Skills</h4>';
  for (const [stat, data] of Object.entries(gameState.stats.skills)) {
    const currentValue = data.value;
    const previewChange = previews.skills[stat] || 0;
    const changeSign = previewChange > 0 ? '+' : (previewChange < 0 ? '' : '');
    const displayChange = `${changeSign}${previewChange}`;
    const previewText = previewChange !== 0 ? ` (${displayChange})` : '';
    const rawFinalValue = currentValue + previewChange;
    const finalValue = data.max !== null && data.max !== undefined
      ? Math.max(data.min, Math.min(data.max, rawFinalValue))
      : Math.max(data.min, rawFinalValue);

    const statClass = getStatClass(stat, previewChange);
    const displayValue = isNaN(finalValue) ? 'NaN' : Math.floor(finalValue);
    statsHtml += `
      <div class="stat-item">
        <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
        <span class="stat-value ${statClass}">${displayValue}${previewText}</span>
      </div>
    `;
  }
  statsHtml += '</div>';

  // Possessions
  statsHtml += '<div class="stat-category"><h4>Possessions</h4>';
  for (const [stat, data] of Object.entries(gameState.stats.possessions)) {
    const currentValue = data.value;
    const previewChange = previews.possessions[stat] || 0;
    const changeSign = previewChange > 0 ? '+' : (previewChange < 0 ? '' : '');
    const displayChange = stat === 'money' ? `${changeSign}$${Math.abs(previewChange)}` : `${changeSign}${previewChange}`;
    const previewText = previewChange !== 0 ? ` (${displayChange})` : '';
    const rawFinalValue = currentValue + previewChange;
    const finalValue = data.max !== null && data.max !== undefined
      ? Math.max(data.min, Math.min(data.max, rawFinalValue))
      : Math.max(data.min, rawFinalValue);

    const displayValue = stat === 'money' ? formatMoney(finalValue) : (isNaN(finalValue) ? 'NaN' : `${Math.floor(finalValue)}`);

    const statClass = getStatClass(stat, previewChange);
    statsHtml += `
      <div class="stat-item">
        <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
        <span class="stat-value ${statClass}">${displayValue}${previewText}</span>
      </div>
    `;
  }
  statsHtml += '</div></div>';

  // Update the left panel with stats instead of just age
  $('.left-panel').html(`
    <div id="age-display">
      <h2 id="age-title">${getCurrentAgeGroup(gameState.age).name}</h2>
      <div id="age-points">Age: ${gameState.age}</div>
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