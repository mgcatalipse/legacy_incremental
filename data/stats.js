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