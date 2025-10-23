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