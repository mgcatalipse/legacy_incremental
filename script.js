// Age groups and death chances
const AGE_GROUPS = {
  BABY: { min: 0, max: 2, deathChance: 0.02, name: "Baby" },
  CHILD: { min: 3, max: 12, deathChance: 0.005, name: "Child" },
  TEENAGE: { min: 13, max: 19, deathChance: 0.003, name: "Teenager" },
  ADULT: { min: 20, max: 64, deathChance: 0.001, name: "Adult" },
  ELDER: { min: 65, max: 200, deathChance: 0.05, name: "Elder" }
};

// Event system data structure
const LIFE_EVENTS = [
  // BABY EVENTS (0-2 years)
  {
    id: "first_steps",
    name: "Learn to Walk",
    ageRange: { min: 0, max: 2 },
    repeatable: false,
    description: "Take your first steps! +{bonus} agility",
    effects: {
      innate: { agility: 5 },
      skills: {},
      possessions: {}
    },
    penalties: {
      innate: { health: 2 },
      skills: {},
      possessions: {}
    },
    specialFactor: 1.5
  },
  {
    id: "first_words",
    name: "First Words",
    ageRange: { min: 0, max: 2 },
    repeatable: false,
    description: "Speak your first words! +{bonus} intelligence",
    effects: {
      innate: { intelligence: 5 },
      skills: {},
      possessions: {}
    },
    penalties: {
      innate: { stress: 2 },
      skills: {},
      possessions: {}
    },
    specialFactor: 1
  },
  {
    id: "enjoy_life",
    name: "Enjoy life",
    ageRange: { min: 0, max: 200 },
    repeatable: true,
    description: "Do nothing ! Reduce moderate amount of stress ",
    effects: {
      innate: { stress: -3 },
      skills: {},
      possessions: {}
    }
  },

  // CHILD EVENTS (3-12 years)
  {
    id: "school",
    name: "Attend School",
    ageRange: { min: 3, max: 12 },
    repeatable: true,
    description: "Begin formal education. +{bonus} intelligence and education skills",
    effects: {
      innate: { intelligence: 1, stress : 1 },
      skills: { education: 2 },
      possessions: {}
    },
    penalties: {
      innate: { stress: 5 },
      skills: {},
      possessions: {}
    },
    specialFactor: 1.0
  },
  {
    id: "play_sports",
    name: "Join Sports Team",
    ageRange: { min: 3, max: 12 },
    repeatable: true,
    description: "Regular physical activity. +{bonus} health, strength, and agility",
    effects: {
      innate: { health: 1, strength: 3, agility: 2 },
      skills: {},
      possessions: {}
    },
    penalties: {
      innate: { health: -3, stress: 1},
      skills: {},
      possessions: {}
    },
    
  },

  // TEENAGE EVENTS (13-19 years)
  {
    id: "part_time_job",
    name: "Get Part-time Job",
    ageRange: { min: 13, max: 19 },
    repeatable: true,
    description: "Earn your first money. +{bonus} money and labor skills",
    effects: {
      innate: {},
      skills: { labor: 1 },
      possessions: { money: 500 }
    },
    penalties: {
      innate: { health: -3, stress: 3},
      skills: {},
      possessions: {}
    },
  },
  {
    id: "high_school",
    name: "Graduate High School",
    ageRange: { min: 13, max: 19 },
    repeatable: false,
    description: "Complete secondary education. +{bonus} intelligence and education",
    effects: {
      innate: { intelligence: 1 },
      skills: { education: 3 },
      possessions: {}
    },
    penalties: {
      innate: { health: -3, stress: 3},
      skills: {},
      possessions: {}
    },
  },
  {
    id: "farm_job",
    name: "Farm job",
    ageRange: { min: 13, max: 64 },
    repeatable: true,
    description: "Real work",
    effects: {
      innate: { health: -1},
      skills: { labor: 3 },
      possessions: { money: 1000 }
    },
    penalties: {
      innate: { health: -7, stress: 10},
      skills: {},
      possessions: {}
    },
  },

  // ADULT EVENTS (20-64 years)
  {
    id: "career",
    name: "Start Career",
    ageRange: { min: 20, max: 64 },
    repeatable: true,
    description: "Begin professional career. +{bonus} money and labor skills",
    effects: {
      innate: {},
      skills: { labor: 25 },
      possessions: { money: 2000 }
    },
    penalties: {
      innate: { health: -4, stress: 10},
      skills: {},
      possessions: {}
    },
  },
  {
    id: "exercise",
    name: "Regular Exercise",
    ageRange: { min: 20, max: 64 },
    repeatable: true,
    description: "Maintain fitness routine. +{bonus} health and strength",
    effects: {
      innate: { health: 3, strength: 4, agility: 1 },
      skills: {},
      possessions: {}
    },
    penalties: {
      innate: { stress: 3 },
      skills: {},
      possessions: {}
    },
    specialFactor: 1.0
  },

  // ELDER EVENTS (65+ years)
  {
    id: "retirement",
    name: "Retire",
    ageRange: { min: 65, max: 200 },
    repeatable: false,
    description: "Enjoy retirement. +{bonus} comfort but -{penalty} labor skills",
    effects: {
      innate: {},
      skills: { labor: -15 },
      possessions: { comfort: 20 }
    }
  },
  {
    id: "wisdom",
    name: "Share Wisdom",
    ageRange: { min: 65, max: 200 },
    repeatable: true,
    description: "Pass on knowledge to others.",
    effects: {
      innate: {},
      skills: {},
      possessions: {}
    }
  }
];

// Stats system
const STATS = {
  innate: {
    health: { value: 100, min: 0, max: 200 },
    beauty: { value: 5, min: 0, max: 200 },
    charisma: { value: 5, min: 0, max: 200 },
    intelligence: { value: 5, min: 0, max: 200 },
    strength: { value: 5, min: 0, max: 200 },
    agility: { value: 5, min: 0, max: 200 },
    luck: { value: 5, min: 0, max: 200 },
    stress: { value: 0, min: 0, max: 200 }
  },
  skills: {
    education: { value: 0, min: 0, max: 200 },
    labor: { value: 0, min: 0, max: 200 }
  },
  possessions: {
    money: { value: 0, min: 0, max: 1000000 },
    comfort: { value: 0, min: 0, max: 200 }
  }
};

const gameState = {
  age: 0,
  baseGain: 1,
  multiplier: 1,
  lastTime: Date.now(),
  running: false,
  prestigeUnlocked: false,
  prestigeActive: false,
  gameTime: 0,
  startTime: null,
  isDead: false,
  stats: JSON.parse(JSON.stringify(STATS)), // Deep copy
  completedEvents: new Set(),
  availableEvents: [],
  children: [],
  wives: [],
  selectedWife: null,
  showWifeSelection: false,
  showChildSelection: false
};

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

// Generate dynamic description for events
function generateEventDescription(event) {
  let description = event.description;

  // Replace bonus placeholders with actual values
  for (const [category, stats] of Object.entries(event.effects)) {
    for (const [stat, value] of Object.entries(stats)) {
      const placeholder = `{bonus}`;
      const actualValue = Math.abs(value);
      description = description.replace(placeholder, actualValue);
    }
  }

  // Add penalty information if penalties exist
  if (event.penalties) {
    const penaltyTexts = [];
    for (const [category, stats] of Object.entries(event.penalties)) {
      for (const [stat, value] of Object.entries(stats)) {
        if (value !== 0) {
          const sign = value > 0 ? '+' : '';
          penaltyTexts.push(`${sign}${value} ${stat}`);
        }
      }
    }

    if (penaltyTexts.length > 0) {
      description += ` (Cost: ${penaltyTexts.join(', ')})`;
    }
  }

  return description;
}

// Get available events based on current age and completed events
function getAvailableEvents() {
  return LIFE_EVENTS.filter(event => {
    const inAgeRange = gameState.age >= event.ageRange.min && gameState.age <= event.ageRange.max;
    const notCompleted = !gameState.completedEvents.has(event.id);
    return inAgeRange && notCompleted;
  });
}

// Generate potential wives based on player stats
function generateWives() {
  const playerStats = gameState.stats;
  const wives = [];

  // Generate 3-5 potential wives
  const numWives = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < numWives; i++) {
    const wife = {
      id: `wife_${i}`,
      name: `Wife ${i + 1}`,
      stats: {
        innate: {
          beauty: Math.floor(playerStats.innate.beauty.value * (0.8 + Math.random() * 0.4)),
          charisma: Math.floor(playerStats.innate.charisma.value * (0.8 + Math.random() * 0.4)),
          health: Math.floor(playerStats.innate.health.value * (0.9 + Math.random() * 0.2))
        }
      },
      cost: Math.floor(playerStats.possessions.money.value * 0.1 * (0.5 + Math.random()))
    };
    wives.push(wife);
  }

  return wives;
}

// Create a child with mixed stats from parents
function createChild(wife) {
  const playerStats = gameState.stats;
  const child = {
    id: `child_${Date.now()}`,
    name: `Child ${gameState.children.length + 1}`,
    age: 0,
    stats: {
      innate: {},
      skills: { education: 0, labor: 0 },
      possessions: { money: 0, comfort: 0 }
    }
  };

  // Mix innate stats (50% player, 30% wife, 20% random)
  for (const stat of Object.keys(playerStats.innate)) {
    if (stat !== 'stress') { // Don't inherit stress
      const playerValue = playerStats.innate[stat].value;
      const wifeValue = wife.stats.innate[stat] || 50;
      const randomFactor = (Math.random() - 0.5) * 20; // ±10 variation

      child.stats.innate[stat] = {
        value: Math.floor((playerValue * 0.5) + (wifeValue * 0.3) + 50 + randomFactor),
        min: 0,
        max: 100
      };
    }
  }

  // Split money between children
  const moneySplit = Math.floor(playerStats.possessions.money.value * 0.2);
  child.stats.possessions.money = { value: moneySplit, min: 0, max: 1000000 };

  // Reduce player's money
  playerStats.possessions.money.value -= moneySplit;

  return child;
}

// Show wife selection UI
function showWifeSelection() {
  if (gameState.age < 13 || gameState.age > 64) return;

  const wives = generateWives();
  gameState.wives = wives;

  let wifeHtml = '<div id="wife-selection"><h3>Choose a Wife</h3>';
  wives.forEach((wife, index) => {
    wifeHtml += `
      <div class="wife-option" data-wife-index="${index}">
        <h4>${wife.name}</h4>
        <div class="wife-stats">
          <div>Beauty: ${wife.stats.innate.beauty}</div>
          <div>Charisma: ${wife.stats.innate.charisma}</div>
          <div>Health: ${wife.stats.innate.health}</div>
        </div>
        <div class="wife-cost">Cost: $${wife.cost}</div>
        <button class="select-wife-btn" data-wife-index="${index}">Select</button>
      </div>
    `;
  });
  wifeHtml += '</div>';

  $('.right-side').append(wifeHtml);

  // Handle wife selection
  $('.select-wife-btn').click(function() {
    const wifeIndex = $(this).data('wife-index');
    const selectedWife = wives[wifeIndex];

    if (gameState.stats.possessions.money.value >= selectedWife.cost) {
      gameState.selectedWife = selectedWife;
      gameState.stats.possessions.money.value -= selectedWife.cost;
      $('#wife-selection').remove();
      gameState.showWifeSelection = false;

      // Create child
      const child = createChild(selectedWife);
      gameState.children.push(child);

      alert(`Child created! ${child.name} born with mixed stats from you and ${selectedWife.name}`);
      updateUI();
    } else {
      alert('Not enough money to marry this person!');
    }
  });
}

// Show child selection UI (for retirement)
function showChildSelection() {
  if (gameState.children.length === 0) {
    alert('No children to choose from. Continue as new character.');
    resetForNewLife();
    return;
  }

  let childHtml = '<div id="child-selection"><h3>Choose Successor</h3>';
  gameState.children.forEach((child, index) => {
    childHtml += `
      <div class="child-option" data-child-index="${index}">
        <h4>${child.name} (Age: ${child.age})</h4>
        <div class="child-stats">
          <div>Health: ${child.stats.innate.health.value}</div>
          <div>Intelligence: ${child.stats.innate.intelligence.value}</div>
          <div>Charisma: ${child.stats.innate.charisma.value}</div>
          <div>Money: $${child.stats.possessions.money.value}</div>
        </div>
        <button class="select-child-btn" data-child-index="${index}">Continue as ${child.name}</button>
      </div>
    `;
  });
  childHtml += '</div>';

  $('.right-side').append(childHtml);

  // Handle child selection
  $('.select-child-btn').click(function() {
    const childIndex = $(this).data('child-index');
    const selectedChild = gameState.children[childIndex];

    // Transfer child stats to player
    gameState.stats = JSON.parse(JSON.stringify(selectedChild.stats));
    gameState.age = selectedChild.age;
    gameState.children = [];
    gameState.selectedWife = null;
    gameState.showChildSelection = false;

    $('#child-selection').remove();
    alert(`Now playing as ${selectedChild.name}!`);
    updateUI();
  });
}

// Reset for new life (when no children)
function resetForNewLife() {
  gameState.age = 0;
  gameState.isDead = false;
  gameState.completedEvents.clear();
  gameState.stats = JSON.parse(JSON.stringify(STATS));
  gameState.children = [];
  gameState.wives = [];
  gameState.selectedWife = null;
  gameState.showChildSelection = false;
  updateUI();
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

// Calculate stat previews from selected events and penalties
function calculateStatPreviews() {
  const selectedEvents = getSelectedEvents();
  const totalPenalties = calculateTotalPenalties();

  let totalEffects = {
    innate: {},
    skills: {},
    possessions: {}
  };

  // Sum all effects from selected events
  selectedEvents.forEach(event => {
    for (const [category, stats] of Object.entries(event.effects)) {
      for (const [stat, value] of Object.entries(stats)) {
        if (!totalEffects[category][stat]) {
          totalEffects[category][stat] = 0;
        }
        totalEffects[category][stat] += value;
      }
    }
  });

  // Add penalties
  for (const [category, stats] of Object.entries(totalPenalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (!totalEffects[category][stat]) {
        totalEffects[category][stat] = 0;
      }
      totalEffects[category][stat] += value;
    }
  }

  return totalEffects;
}

// Update stats display with previews
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

// Update the events list in the UI
function updateEventsList() {
  const availableEvents = getAvailableEvents();
  const eventsContainer = $('#events-list');

  if (eventsContainer.length === 0) {
    // Create events container if it doesn't exist
    $('.right-side').empty().append(`
      <div id="events-container">
        <h3>Life Events</h3>
        <div id="events-list"></div>
      </div>
    `);
  }

  const eventsList = $('#events-list');
  eventsList.empty();

  if (availableEvents.length === 0) {
    eventsList.append('<p>No events available for your current age.</p>');
    return;
  }

  // Group events by repeatable status
  const oneTimeEvents = availableEvents.filter(e => !e.repeatable);
  const repeatableEvents = availableEvents.filter(e => e.repeatable);

  // Add one-time events
  if (oneTimeEvents.length > 0) {
    oneTimeEvents.forEach(event => {
      const costInfo = event.penalties ? generatePenaltyText(event.penalties) : '';
      eventsList.append(`
        <div class="event-item">
          <label class="event-label">
            <input type="checkbox" class="event-checkbox" data-event-id="${event.id}">
            <span class="event-name">${event.name}</span>
          </label>
          <div class="event-description">${generateEventDescription(event)}</div>
          ${costInfo ? `<div class="event-cost">Cost: ${costInfo}</div>` : ''}
        </div>
      `);
    });
  }

  // Add separator if both types exist
  if (oneTimeEvents.length > 0 && repeatableEvents.length > 0) {
    eventsList.append('<hr class="event-separator">');
  }

  // Add repeatable events
  if (repeatableEvents.length > 0) {
    repeatableEvents.forEach(event => {
      const costInfo = event.penalties ? generatePenaltyText(event.penalties) : '';
      eventsList.append(`
        <div class="event-item repeatable">
          <label class="event-label">
            <input type="checkbox" class="event-checkbox" data-event-id="${event.id}">
            <span class="event-name">${event.name}</span>
            <span class="repeatable-badge">Repeatable</span>
          </label>
          <div class="event-description">${generateEventDescription(event)}</div>
          ${costInfo ? `<div class="event-cost">Cost per use: ${costInfo}</div>` : ''}
        </div>
      `);
    });
  }
}

// Generate penalty text for display
function generatePenaltyText(penalties) {
  const penaltyTexts = [];
  for (const [category, stats] of Object.entries(penalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        penaltyTexts.push(`${sign}${value} ${stat}`);
      }
    }
  }
  return penaltyTexts.join(', ');
}

function updateUI() {
  if (gameState.isDead) {
    $("#age-title").text("DEAD");
    $("#age-points").text("Game Over");
    $("#gain").prop("disabled", true).text("Game Over");
    return;
  }

  // Update age display in left side
  const ageGroup = getCurrentAgeGroup(gameState.age);
  $("#age-title").text(ageGroup.name);
  $("#age-points").text(`Age: ${gameState.age}`);

  // Update stats display with previews
  updateStatsDisplay();

  // Update available events
  updateEventsList();

  // Update game time display
  const timeStr = formatTime(gameState.gameTime);
  $("#game-time").text(timeStr);

  // Update death chance on gain button
  const deathChance = calculateDeathChance(gameState.age);
  $("#gain").text(`Age Up (+1 year, ${deathChance.toFixed(1)}% death risk)`);

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

// --- Buttons ---
$("#pause-restart").click(() => {
  if (gameState.running) {
    gameState.running = false;
    $("#pause-restart").text("▶️"); // Play icon when paused
  } else {
    gameState.running = true;
    gameState.lastTime = Date.now();
    $("#pause-restart").text("⏸️"); // Pause icon when running
    gameLoop();
  }
});

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

$(".multiplier-btn").click(function () {
  $(".multiplier-btn").removeClass("active");
  $(this).addClass("active");
  gameState.multiplier = parseInt($(this).attr("id").substring(1)); // x1, x2, x4
});

$("#gain").click(() => {
  if (gameState.isDead) return;

  // Check if showing selection UI
  if (gameState.showWifeSelection || gameState.showChildSelection) return;

  // Calculate and apply penalties from selected events
  const totalPenalties = calculateTotalPenalties();
  applyStatEffects(totalPenalties);

  // Age the character by 1 year
  gameState.age += 1;

  // Check for death
  if (checkDeath(gameState.age)) {
    gameState.isDead = true;
    updateUI();
    return;
  }

  // Check for wife selection (teen to adult)
  if (gameState.age >= 13 && gameState.age <= 30 && !gameState.selectedWife && Math.random() < 0.3) {
    gameState.showWifeSelection = true;
  }

  // Check for retirement/child selection (elder)
  if (gameState.age >= 65 && gameState.children.length > 0) {
    gameState.showChildSelection = true;
  }

  updateUI();
});

// Calculate total penalties from selected events
function calculateTotalPenalties() {
  const selectedEvents = getSelectedEvents();
  let totalPenalties = {
    innate: {},
    skills: {},
    possessions: {}
  };

  selectedEvents.forEach(event => {
    const multiplier = selectedEvents.length; // Multiply by number of selected events

    // Apply special factor if exists
    const factor = event.specialFactor || 1;
    const finalMultiplier = multiplier * factor;

    // Sum penalties
    if (event.penalties) {
      for (const [category, stats] of Object.entries(event.penalties)) {
        for (const [stat, value] of Object.entries(stats)) {
          if (!totalPenalties[category][stat]) {
            totalPenalties[category][stat] = 0;
          }
          totalPenalties[category][stat] += value * finalMultiplier;
        }
      }
    }
  });

  return totalPenalties;
}

// Get currently selected events
function getSelectedEvents() {
  const selectedCheckboxes = $('.event-checkbox:checked');
  const selectedEvents = [];

  selectedCheckboxes.each(function() {
    const eventId = $(this).data('event-id');
    const event = LIFE_EVENTS.find(e => e.id === eventId);
    if (event) {
      selectedEvents.push(event);
    }
  });

  return selectedEvents;
}

// Enhanced event checkbox handler
$(document).on('change', '.event-checkbox', function() {
  const eventId = $(this).data('event-id');
  const event = LIFE_EVENTS.find(e => e.id === eventId);

  if (this.checked) {
    // Apply event effects immediately
    applyStatEffects(event.effects);
    gameState.completedEvents.add(eventId);
  } else {
    // Remove event effects if unchecked (for repeatable events)
    if (event.repeatable) {
      applyStatEffects(invertEffects(event.effects));
      gameState.completedEvents.delete(eventId);
    }
  }

  // Update UI with new previews
  updateUI();
});

// Invert effects for removal
function invertEffects(effects) {
  const inverted = {
    innate: {},
    skills: {},
    possessions: {}
  };

  for (const [category, stats] of Object.entries(effects)) {
    for (const [stat, value] of Object.entries(stats)) {
      inverted[category][stat] = -value;
    }
  }

  return inverted;
}

$("#prestige").click(() => {
  if (!gameState.prestigeUnlocked || gameState.age < 18) return;
  if (!gameState.prestigeActive) {
    gameState.prestigeActive = true;
    gameState.age = 0; // Reset to baby
    gameState.isDead = false;
    gameState.prestigeUnlocked = false;
    gameState.completedEvents.clear();
    gameState.stats = JSON.parse(JSON.stringify(STATS)); // Reset stats
    $("#prestige").addClass("disabled").text("Prestige (Done)");

    // Unlock Business tab on first prestige
    if (!$('[data-tab="business"]').hasClass('unlocked')) {
      $('[data-tab="business"]').removeClass('hidden').addClass('unlocked');
      // Show time display when Business tab is unlocked
      $('#time-label, #game-time').show();
    }

    updateUI();
  }
});

// Default selected multiplier
$("#x1").addClass("active");

// Set initial pause-restart state
$("#pause-restart").text("▶️"); // Start with play icon

updateUI();