/**
 * Unit tests for event availability filtering
 * Tests the getAvailableEvents() function with different age parameters
 */

// Mock the required dependencies
global.LIFE_EVENTS = [
  // Baby events (0-2)
  {
    id: "first_steps",
    name: "Learn to Walk",
    ageRange: { min: 0, max: 2 },
    repeatable: false,
    description: "Take your first steps! +5 agility",
    effects: { innate: { agility: 5 } },
    penalties: { innate: { health: -2 } }
  },
  {
    id: "first_words",
    name: "First Words",
    ageRange: { min: 0, max: 2 },
    repeatable: false,
    description: "Speak your first words! +5 intelligence",
    effects: { innate: { intelligence: 5 } },
    penalties: { innate: { stress: 2 } }
  },
  // Child events (3-12)
  {
    id: "school",
    name: "Attend School",
    ageRange: { min: 3, max: 12 },
    repeatable: true,
    description: "Begin formal education",
    effects: { innate: { intelligence: 1 }, skills: { education: 2 } },
    penalties: { innate: { stress: 5 } }
  },
  // Teen events (13-19)
  {
    id: "high_school",
    name: "Graduate High School",
    ageRange: { min: 13, max: 19 },
    repeatable: false,
    description: "Complete secondary education",
    effects: { innate: { intelligence: 1 }, skills: { education: 3 } },
    penalties: { innate: { health: -3, stress: 3 } }
  },
  // Adult events (20-64)
  {
    id: "find_wife",
    name: "Find a Wife",
    ageRange: { min: 16, max: 40 },
    repeatable: true,
    description: "Look for potential partners",
    effects: {},
    specialRequirements: { hasNoWife: true }
  },
  {
    id: "wedding",
    name: "Wedding",
    ageRange: { min: 16, max: 50 },
    repeatable: false,
    description: "Get married",
    effects: { possessions: { comfort: 10 } },
    penalties: { possessions: { money: -1000 } },
    specialRequirements: { hasWife: true, notMarried: true }
  },
  {
    id: "try_for_children",
    name: "Try for Children",
    ageRange: { min: 18, max: 45 },
    repeatable: true,
    description: "Try to have children",
    effects: {},
    specialRequirements: { isMarried: true }
  },
  // Elder events (65+)
  {
    id: "retirement",
    name: "Retire",
    ageRange: { min: 65, max: 200 },
    repeatable: false,
    description: "Enjoy retirement",
    effects: { skills: { labor: -15 }, possessions: { comfort: 20 } }
  }
];

// Mock checkSpecialRequirements function
global.checkSpecialRequirements = function(event) {
  switch(event.id) {
    case "find_wife":
      return !global.gameState.selectedWife;
    case "wedding":
      return global.gameState.selectedWife && !global.gameState.isMarried;
    case "try_for_children":
      return global.gameState.isMarried;
    default:
      return true;
  }
};

// Mock gameState
global.gameState = {
  age: 0,
  completedEvents: new Set(),
  selectedWife: null,
  isMarried: false
};

// Import the function to test
const { getAvailableEvents } = require('../modules/events.js');

describe('Event Availability Filtering - Unit Tests', () => {
  beforeEach(() => {
    // Reset gameState for each test
    global.gameState.age = 0;
    global.gameState.completedEvents.clear();
    global.gameState.selectedWife = null;
    global.gameState.isMarried = false;
  });

  test('returns baby events for age 0', () => {
    global.gameState.age = 0;
    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(2);
    expect(availableEvents.map(e => e.id)).toEqual(['first_steps', 'first_words']);
  });

  test('returns child events for age 5', () => {
    global.gameState.age = 5;
    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(1);
    expect(availableEvents[0].id).toBe('school');
  });

  test('returns teen events for age 15', () => {
    global.gameState.age = 15;
    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(2);
    expect(availableEvents.map(e => e.id).sort()).toEqual(['find_wife', 'high_school']);
  });

  test('filters out completed one-time events', () => {
    global.gameState.age = 0;
    global.gameState.completedEvents.add('first_steps');

    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(1);
    expect(availableEvents[0].id).toBe('first_words');
  });

  test('includes repeatable events even after completion', () => {
    global.gameState.age = 5;
    global.gameState.completedEvents.add('school');

    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(1);
    expect(availableEvents[0].id).toBe('school');
  });

  test('respects age boundaries - age 2 to 3 transition', () => {
    // Age 2 should include baby events
    global.gameState.age = 2;
    let availableEvents = getAvailableEvents();
    expect(availableEvents.map(e => e.id).sort()).toEqual(['first_steps', 'first_words']);

    // Age 3 should include child events
    global.gameState.age = 3;
    availableEvents = getAvailableEvents();
    expect(availableEvents.map(e => e.id)).toEqual(['school']);
  });

  test('handles empty event lists for invalid ages', () => {
    global.gameState.age = 201; // Beyond max age
    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(0);
  });

  test('respects special requirements for family events', () => {
    global.gameState.age = 20;

    // Should show find_wife when no wife selected
    let availableEvents = getAvailableEvents();
    expect(availableEvents.map(e => e.id).sort()).toEqual(['find_wife', 'try_for_children', 'wedding']);

    // Should not show wedding when no wife selected
    expect(availableEvents.find(e => e.id === 'wedding')).toBeUndefined();

    // Should show wedding when wife is selected but not married
    global.gameState.selectedWife = { name: 'Test Wife' };
    availableEvents = getAvailableEvents();
    expect(availableEvents.find(e => e.id === 'wedding')).toBeDefined();

    // Should not show find_wife when wife is selected
    expect(availableEvents.find(e => e.id === 'find_wife')).toBeUndefined();

    // Should show try_for_children only when married
    global.gameState.isMarried = true;
    availableEvents = getAvailableEvents();
    expect(availableEvents.find(e => e.id === 'try_for_children')).toBeDefined();
  });

  test('returns elder events for age 65', () => {
    global.gameState.age = 65;
    const availableEvents = getAvailableEvents();

    expect(availableEvents.length).toBe(1);
    expect(availableEvents[0].id).toBe('retirement');
  });

  test('handles age boundaries correctly', () => {
    // Test exact boundary values
    global.gameState.age = 2; // Max for baby
    let availableEvents = getAvailableEvents();
    expect(availableEvents.some(e => e.ageRange.max === 2)).toBe(true);

    global.gameState.age = 3; // Min for child
    availableEvents = getAvailableEvents();
    expect(availableEvents.some(e => e.ageRange.min === 3)).toBe(true);
  });
});