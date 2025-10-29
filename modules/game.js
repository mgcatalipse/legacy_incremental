
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
   const healthModifier = 1 - (health / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR);

   // Stress modifier: 0 stress = 1x, 100 stress = 2x, 200 stress = 4x
   const stressModifier = CONSTANTS.DEATH.STRESS_MODIFIER_BASE + (stress / CONSTANTS.DEATH.STRESS_MODIFIER_DIVISOR);

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

  addLogMessage(`Death roll: ${toPercentage(roll)}% vs ${toPercentage(deathChance)}% chance. ${dies ? 'Death triggered.' : 'Survived.'}`);

  if (dies) {
    // Luck roll: 1d100 vs luck/5 to survive
    const luckRoll = rollLog();
    const luckThreshold = Math.floor(luck / CONSTANTS.DEATH.LUCK_DIVISOR);
    const survivalChance = luckThreshold.toFixed(0); // percentage out of 100

    addLogMessage(`Luck save: Rolled ${luckRoll} (need ${luckThreshold} or lower). Survival chance: ${survivalChance}%. ${luckRoll >= luckThreshold ? 'Failed luck save, died.' : 'Survived death!'}`);

    return luckRoll >= luckThreshold; // Higher luck = higher threshold = better survival chance
  }

  return false;
}

// Apply stat effects from events
function applyStatEffects(effects) {
  applyStatChanges(gameState.stats, effects);
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

  return Math.min(toPercentage(deathChance), CONSTANTS.DEATH.MAX_PERCENTAGE); // Convert to percentage, max 100%
}

// Probability calculation functions for family events
function calculateWifeFindingProbability() {
  const stats = gameState.stats;
  const baseProbability = CONSTANTS.FAMILY.WIFE_FINDING_BASE_PROBABILITY;

  // Modify probability based on stats
  const beautyModifier = stats.innate.beauty.value / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR;
  const charismaModifier = stats.innate.charisma.value / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR;
  const healthModifier = Math.max(CONSTANTS.DEATH.HEALTH_MODIFIER_BASE, stats.innate.health.value / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR);

  const modifiers = [beautyModifier, charismaModifier, healthModifier];
  const finalProbability = calculateProbability(baseProbability, modifiers);

  return Math.min(CONSTANTS.FAMILY.WIFE_FINDING_MAX_PROBABILITY, finalProbability);
}

function calculateChildBirthProbability() {
  const stats = gameState.stats;
  const baseProbability = CONSTANTS.FAMILY.CHILD_BIRTH_BASE_PROBABILITY;

  // Modify probability based on stats
  const healthModifier = stats.innate.health.value / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR;
  const luckModifier = stats.innate.luck.value / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR;
  const stressModifier = Math.max(0.1, (CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR - stats.innate.stress.value) / CONSTANTS.DEATH.HEALTH_MODIFIER_DIVISOR);

  const modifiers = [healthModifier, luckModifier, stressModifier];
  const finalProbability = calculateProbability(baseProbability, modifiers);

  return Math.min(CONSTANTS.FAMILY.CHILD_BIRTH_MAX_PROBABILITY, finalProbability);
}

// No export, functions are global