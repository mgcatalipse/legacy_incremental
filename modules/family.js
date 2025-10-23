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
      updateEventsList();
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
    updateEventsList();
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
  updateEventsList();
}

// No export, functions are global