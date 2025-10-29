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

// =============================================================================
// UNIFIED PENALTY CALCULATION SYSTEM
// =============================================================================

/**
 * Calculate unified penalty system for event selection
 * This function provides a centralized way to calculate penalties when
 * selecting too many events, taking into account various factors
 * @param {array} selectedEvents - Array of selected events
 * @param {number} maxEvents - Maximum events allowed without penalties
 * @returns {object} Object containing total penalties and calculation details
 */
function calculateUnifiedPenalties(selectedEvents, maxEvents) {
  const penaltyInfo = {
    totalPenalties: { innate: {}, skills: {}, possessions: {} },
    calculation: {
      selectedCount: selectedEvents.length,
      maxAllowed: maxEvents,
      penaltyApplied: selectedEvents.length > maxEvents,
      finalMultiplier: 1
    },
    breakdown: { innate: {}, skills: {}, possessions: {} }
  };

  // If no penalty needed, return early
  if (!penaltyInfo.calculation.penaltyApplied) {
    return penaltyInfo;
  }

  const selectedCount = selectedEvents.length;
  
  // Calculate base multiplier from exceeding limits
  const baseMultiplier = selectedCount * CONSTANTS.EVENTS.PENALTY_BASE_MULTIPLIER;
  
  // Apply special factors based on event types
  let specialFactorSum = 0;
  let eventsWithSpecialFactors = 0;
  
  selectedEvents.forEach(event => {
    if (event.specialFactor) {
      specialFactorSum += event.specialFactor;
      eventsWithSpecialFactors++;
    }
  });
  
  // Calculate final multiplier
  const averageSpecialFactor = eventsWithSpecialFactors > 0 ? specialFactorSum / eventsWithSpecialFactors : 1;
  penaltyInfo.calculation.finalMultiplier = baseMultiplier * averageSpecialFactor;

  // Calculate total penalties
  selectedEvents.forEach(event => {
    if (event.penalties) {
      for (const [category, stats] of Object.entries(event.penalties)) {
        for (const [stat, value] of Object.entries(stats)) {
          // Initialize category and stat if not present
          if (!penaltyInfo.totalPenalties[category][stat]) {
            penaltyInfo.totalPenalties[category][stat] = 0;
            penaltyInfo.breakdown[category][stat] = [];
          }
          
          // Calculate penalty with final multiplier
          const finalPenalty = value * penaltyInfo.calculation.finalMultiplier;
          penaltyInfo.totalPenalties[category][stat] += finalPenalty;
          
          // Add to breakdown for transparency
          penaltyInfo.breakdown[category][stat].push({
            eventName: event.name,
            basePenalty: value,
            multiplier: penaltyInfo.calculation.finalMultiplier,
            finalPenalty: finalPenalty
          });
        }
      }
    }
  });

  return penaltyInfo;
}

/**
 * Generate human-readable penalty explanation
 * @param {object} penaltyInfo - Penalty information from calculateUnifiedPenalties
 * @returns {string} Human-readable explanation of penalties
 */
function explainPenalties(penaltyInfo) {
  if (!penaltyInfo.calculation.penaltyApplied) {
    return "No penalties applied.";
  }
  
  const explanation = [];
  explanation.push(`Selected ${penaltyInfo.calculation.selectedCount} events (max: ${penaltyInfo.calculation.maxAllowed})`);
  explanation.push(`Penalty multiplier: ${penaltyInfo.calculation.finalMultiplier.toFixed(2)}x`);
  
  const penaltyCount = Object.values(penaltyInfo.totalPenalties)
    .reduce((count, category) => count + Object.keys(category).length, 0);
  
  if (penaltyCount > 0) {
    explanation.push("Penalties will be applied to your stats.");
  }
  
  return explanation.join(". ") + ".";
}

// No export, functions are global