// Utility Functions - Shared functions to reduce code duplication

// Clamp a value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Unified stat modification function
function applyStatChanges(stats, changes) {
  for (const [category, categoryChanges] of Object.entries(changes)) {
    for (const [stat, change] of Object.entries(categoryChanges)) {
      if (stats[category] && stats[category][stat]) {
        const newValue = stats[category][stat].value + change;
        const maxValue = (stats[category][stat].max !== null && stats[category][stat].max !== undefined) ? stats[category][stat].max : Infinity;
        stats[category][stat].value = clamp(
          newValue,
          stats[category][stat].min,
          maxValue
        );
      }
    }
  }
}

// Calculate probability with stat modifiers
function calculateProbability(baseProbability, modifiers) {
  let probability = baseProbability;

  modifiers.forEach(modifier => {
    probability *= modifier;
  });

  return clamp(probability, 0, 1);
}

// Deep copy an object
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Generate random number between min and max (inclusive)
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format money display
function formatMoney(amount) {
  return `$${Math.floor(amount)}`;
}

// Calculate weighted average for stat inheritance
function calculateInheritedStat(playerValue, wifeValue, randomVariation = 0) {
  const randomFactor = (Math.random() - 0.5) * randomVariation;
  const inheritedValue = (playerValue * CONSTANTS.FAMILY.CHILD_INHERITANCE_PLAYER_WEIGHT) +
                        (wifeValue * CONSTANTS.FAMILY.CHILD_INHERITANCE_WIFE_WEIGHT) +
                        CONSTANTS.FAMILY.CHILD_INHERITANCE_BASE_STAT + randomFactor;

  return Math.floor(inheritedValue);
}

// Check if value is within range
function isInRange(value, min, max) {
  return value >= min && value <= max;
}

// Get percentage from decimal (0.5 -> 50)
function toPercentage(decimal) {
  return Math.min(decimal * 100, CONSTANTS.DEATH.MAX_PERCENTAGE);
}

// Log roll calculation (d100 style)
function rollLog() {
  return Math.floor(Math.random() * CONSTANTS.PROBABILITY.LOG_ROLL_MAX);
}

// No export, functions are global