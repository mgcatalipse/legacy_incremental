// Update stats display with previews
// This function refreshes the stats UI to show current values along with preview changes
// from selected events. It calls calculateStatPreviews() to get the total changes and
// displays them in parentheses next to each stat (e.g., "10 (+5)").
// This provides real-time feedback on how stats will change before applying events.
// It is triggered by the event listener in script.js when checkboxes are changed.
function updateStatsDisplay() {
  const previews = calculateStatPreviews();
  let statsHtml = '<div id="stats-display"><h3>Stats</h3>';

  // Innate stats
  statsHtml += '<div class="stat-category"><h4>Innate</h4>';
  for (const [stat, data] of Object.entries(gameState.stats.innate)) {
    const currentValue = data.value;
    const previewChange = previews.innate[stat] || 0;
    const previewText = previewChange !== 0 ? ` (${previewChange > 0 ? '+' : ''}${previewChange})` : '';
    const finalValue = Math.max(data.min, Math.min(data.max, currentValue + previewChange));

    statsHtml += `
      <div class="stat-item">
        <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
        <span class="stat-value">${Math.floor(currentValue)}${previewText}</span>
      </div>
    `;
  }
  statsHtml += '</div>';

  // Skills
  statsHtml += '<div class="stat-category"><h4>Skills</h4>';
  for (const [stat, data] of Object.entries(gameState.stats.skills)) {
    const currentValue = data.value;
    const previewChange = previews.skills[stat] || 0;
    const previewText = previewChange !== 0 ? ` (${previewChange > 0 ? '+' : ''}${previewChange})` : '';
    const finalValue = Math.max(data.min, Math.min(data.max, currentValue + previewChange));

    statsHtml += `
      <div class="stat-item">
        <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
        <span class="stat-value">${Math.floor(currentValue)}${previewText}</span>
      </div>
    `;
  }
  statsHtml += '</div>';

  // Possessions
  statsHtml += '<div class="stat-category"><h4>Possessions</h4>';
  for (const [stat, data] of Object.entries(gameState.stats.possessions)) {
    const currentValue = data.value;
    const previewChange = previews.possessions[stat] || 0;
    const previewText = previewChange !== 0 ? ` (${previewChange > 0 ? '+' : ''}${previewChange})` : '';
    const finalValue = Math.max(data.min, Math.min(data.max, currentValue + previewChange));

    const displayValue = stat === 'money' ? `$${Math.floor(currentValue)}` : `${Math.floor(currentValue)}`;
    const displayChange = stat === 'money' ? `$${previewChange}` : previewChange;

    statsHtml += `
      <div class="stat-item">
        <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
        <span class="stat-value">${displayValue}${previewText}</span>
      </div>
    `;
  }
  statsHtml += '</div></div>';

  // Update the left side with stats instead of just age
  $('.left-side').html(`
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

// Helper function to update time display
function updateTimeDisplay() {
  const timeStr = formatTime(gameState.gameTime);
  $("#game-time").text(timeStr);
}

// Helper function to update gain button with death chance
function updateGainButton() {
  const deathChance = calculateDeathChance(gameState.age);
  const selectedCount = $('.event-checkbox:checked').length;
  const effectText = selectedCount > 0 ? ` + Apply ${selectedCount} selected event${selectedCount > 1 ? 's' : ''}` : '';
  $("#gain").text(`Age Up (+1 year, ${deathChance.toFixed(1)}% death risk)${effectText}`);
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

  // Unlock prestige at age 18
  if (gameState.age >= 18 && !gameState.prestigeUnlocked) {
    $("#prestige").removeClass("disabled").text("Prestige (Available!)");
    gameState.prestigeUnlocked = true;
  }
}

function updateUI() {
  updateAgeDisplay();
  updateStatsDisplay();
  updateTimeDisplay();
  updateGainButton();
  handleSpecialUIStates();
}

// No export, functions are global