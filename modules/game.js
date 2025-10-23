// Main game loop
function gameLoop() {
  if (!gameState.running) return;
  const now = Date.now();
  const delta = now - gameState.lastTime;
  gameState.lastTime = now;

  // Update game time
  gameState.gameTime += delta / 1000; // Convert to seconds

  // You can use delta if you add auto gain features later
  updateUI();
  requestAnimationFrame(gameLoop);
}

// Get current age group based on age
function getCurrentAgeGroup(age) {
  for (const [key, group] of Object.entries(AGE_GROUPS)) {
    if (age >= group.min && age <= group.max) {
      return group;
    }
  }
  return AGE_GROUPS.ELDER; // Default to elder for ages over 200
}

// Enhanced death check with health, stress, and luck
function checkDeath(age) {
  const ageGroup = getCurrentAgeGroup(age);
  const health = gameState.stats.innate.health.value;
  const stress = gameState.stats.innate.stress.value;
  const luck = gameState.stats.innate.luck.value;

  // Base death chance from age group
  let deathChance = ageGroup.deathChance;

  // Health modifier: 0 health = certain death, 100 health = normal chance
  const healthModifier = 1 - (health / 100);
  deathChance *= (1 + healthModifier);

  // Stress modifier: 0 stress = normal, 100 stress = 3x chance
  const stressModifier = 1 + (stress / 100) * 2; // Up to 3x at 100 stress
  deathChance *= stressModifier;

  // Check if death occurs
  const dies = Math.random() < deathChance;

  if (dies) {
    // Luck roll: 1d100 vs luck/5 to survive
    const luckRoll = Math.floor(Math.random() * 100) + 1;
    const luckThreshold = Math.floor(luck / 5);

    return luckRoll >= luckThreshold; // Higher luck = lower threshold = better survival chance
  }

  return false;
}

// Apply stat effects from events
function applyStatEffects(effects) {
  for (const [category, stats] of Object.entries(effects)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (gameState.stats[category] && gameState.stats[category][stat]) {
        const newValue = gameState.stats[category][stat].value + value;
        gameState.stats[category][stat].value = Math.max(
          gameState.stats[category][stat].min,
          Math.min(gameState.stats[category][stat].max, newValue)
        );
      }
    }
  }
}

// Format time in YY:MM:dd h:m:s, showing only relevant units
function formatTime(seconds) {
  const years = Math.floor(seconds / (365 * 24 * 60 * 60));
  const days = Math.floor((seconds % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  let timeStr = '';
  if (years > 0) timeStr += `${years}:`;
  if (days > 0 || years > 0) timeStr += `${days.toString().padStart(2, '0')}:`;
  if (hours > 0 || days > 0 || years > 0) timeStr += `${hours.toString().padStart(2, '0')}:`;
  timeStr += `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return timeStr;
}

// Calculate death chance for display (without actually checking death)
function calculateDeathChance(age) {
  const ageGroup = getCurrentAgeGroup(age);
  const health = gameState.stats.innate.health.value;
  const stress = gameState.stats.innate.stress.value;

  // Base death chance from age group
  let deathChance = ageGroup.deathChance;

  // Health modifier: 0 health = certain death, 100 health = normal chance
  const healthModifier = 1 - (health / 100);
  deathChance *= (1 + healthModifier);

  // Stress modifier: 0 stress = normal, 100 stress = 3x chance
  const stressModifier = 1 + (stress / 100) * 2;
  deathChance *= stressModifier;

  return Math.min(deathChance * 100, 100); // Convert to percentage, max 100%
}

// No export, functions are global