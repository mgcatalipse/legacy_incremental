// Age groups and death chances
const AGE_GROUPS = {
  BABY: { min: 0, max: 2, deathChance: 0.02, name: "Baby" },
  CHILD: { min: 3, max: 12, deathChance: 0.005, name: "Child" },
  TEENAGE: { min: 13, max: 19, deathChance: 0.003, name: "Teenager" },
  ADULT: { min: 20, max: 65, deathChance: 0.001, name: "Adult" },
  ELDER: { min: 66, max: 200, deathChance: 0.01, name: "Elder" }
};