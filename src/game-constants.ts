export const INITIAL_CHOICE_OPTION_COUNT = 3
export const INITIAL_CHOICE_COUNT = 5

export const GAME_ADVANTAGE = {
  noob: 4,
  easy: 3,
  normal: 2,
  hard: 1,
  veteran: 0,
} as const

export const LOCAL_ADVANTAGE = {
  legendary: 10,
  epic: 5,
  rare: 2,
  common: 0,
} as const

export const MAX_ENERGY = 20
export const MAX_HAND_SIZE = 8
export const MAX_REPUTATION = 10
export const MONEY_TO_REACH = 10_000 // en M$
export const INFINITE_DRAW_COST = 5
export const UPGRADE_COST_THRESHOLDS = {
  money: [20, 50, 75, 100, 150, 250, 500, 1_000, 2_500, 5_000, 10_000],
  energy: [5, 7, 10, 15],
}

/**
 * From Energy to Money <br/>
 * 1 Energy = 5 Money
 * 2 Energy = 10 Money
 * 4 Energy = 20 Money
 */
export const ENERGY_TO_MONEY = 5

/**
 * From Reputation to Energy <br/>
 * 1 Reputation = 10 Energy
 * 2 Reputation = 20 Energy
 * 4 Reputation = 40 Energy
 */
export const REPUTATION_TO_ENERGY = 10

/**
 * 1 energy = 0.08 day
 */
export const ENERGY_TO_DAYS = 0.12

export const ACTIONS_COST = {
  draw: 1,
  drawSpecific: 2,
  gainEnergy: 1,
  gainReputation: REPUTATION_TO_ENERGY,
  condition: -1,
  hardCondition: -2,
} as const
