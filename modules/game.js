
// Get current age group based on age
function getCurrentAgeGroup(age) {
  for (const [key, group] of Object.entries(AGE_GROUPS)) {
    if (age >= group.min && age <= group.max) {
      return group;
    }
  }
  return AGE_GROUPS.ELDER; // Default to elder for ages over 200
}

// Helper function to calculate death chance modifiers
function calculateDeathModifiers(health, stress) {
  // Health modifier: 0 health = 100% death (2x multiplier), 100 health = 1x
  const healthModifier = 1 - (health / 100);

  // Stress modifier: 0 stress = 1x, 100 stress = 2x, 200 stress = 4x
  const stressModifier = 1 + (stress / 100); // 1x at 0, 2x at 100, 4x at 200

  return { healthModifier, stressModifier };
}

// Enhanced death check with health, stress, and luck
function checkDeath(age) {
  const ageGroup = getCurrentAgeGroup(age);
  const health = gameState.stats.innate.health.value;
  const stress = gameState.stats.innate.stress.value;
  const luck = gameState.stats.innate.luck.value;

  // Base death chance from age group
  let deathChance = ageGroup.deathChance;

  const { healthModifier, stressModifier } = calculateDeathModifiers(health, stress);

  // Combined modifier with interaction for high stress + low health
  deathChance *= (1 + healthModifier + stressModifier + healthModifier * stressModifier);

  // Check if death occurs
  const roll = Math.random();
  const dies = roll < deathChance;

  addLogMessage(`Death roll: ${(roll * 100).toFixed(2)}% vs ${(deathChance * 100).toFixed(2)}% chance. ${dies ? 'Death triggered.' : 'Survived.'}`);

  if (dies) {
    // Luck roll: 1d100 vs luck/5 to survive
    const luckRoll = Math.floor(Math.random() * 100);
    const luckThreshold = Math.floor(luck / 5);
    const survivalChance = (luckThreshold).toFixed(0); // percentage out of 100

    addLogMessage(`Luck save: Rolled ${luckRoll} (need ${luckThreshold} or lower). Survival chance: ${survivalChance}%. ${luckRoll >= luckThreshold ? 'Failed luck save, died.' : 'Survived death!'}`);

    return luckRoll >= luckThreshold; // Higher luck = higher threshold = better survival chance
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


// Calculate death chance for display (without actually checking death)
function calculateDeathChance(age, stats = null) {
  const ageGroup = getCurrentAgeGroup(age);
  const targetStats = stats || gameState.stats;
  const health = targetStats.innate.health.value;
  const stress = targetStats.innate.stress.value;

  // Base death chance from age group
  let deathChance = ageGroup.deathChance;

  const { healthModifier, stressModifier } = calculateDeathModifiers(health, stress);

  // Combined modifier with interaction for high stress + low health
  deathChance *= (1 + healthModifier + stressModifier + healthModifier * stressModifier);

  return Math.min(deathChance * 100, 100); // Convert to percentage, max 100%
}

// Probability calculation functions for family events
function calculateWifeFindingProbability() {
  const stats = gameState.stats;
  const baseProbability = 0.1; // 10% base chance
  
  // Modify probability based on stats
  const beautyModifier = stats.innate.beauty.value / 100; // 0-2x multiplier
  const charismaModifier = stats.innate.charisma.value / 100; // 0-2x multiplier
  const healthModifier = Math.max(0.5, stats.innate.health.value / 100); // Minimum 0.5x
  
  const finalProbability = baseProbability * beautyModifier * charismaModifier * healthModifier;
  return Math.min(0.8, finalProbability); // Cap at 80%
}

function calculateChildBirthProbability() {
  const stats = gameState.stats;
  const baseProbability = 0.3; // 30% base chance
  
  // Modify probability based on stats
  const healthModifier = stats.innate.health.value / 100; // 0-2x multiplier
  const luckModifier = stats.innate.luck.value / 100; // 0-2x multiplier
  const stressModifier = Math.max(0.1, (100 - stats.innate.stress.value) / 100); // Lower stress = higher chance
  
  const finalProbability = baseProbability * healthModifier * luckModifier * stressModifier;
  return Math.min(0.9, finalProbability); // Cap at 90%
}

// No export, functions are global