export const INITIAL_CHOICE_OPTION_COUNT = 3
export const INITIAL_CHOICE_COUNT = 5

export const MAX_LOG_COUNT = 100

export const GAME_CARD_SIZE = "w-[210px] h-[293px] rounded-xl"

export const GAME_ADVANTAGE = {
  noob: 4,
  easy: 2,
  normal: 0,
  hard: -2,
  veteran: -4,
} as const

export const RARITIES = {
  common: 0, // +2 = 2
  rare: 2, //  +4 = 6
  epic: 6, //  +6 = 12
  legendary: 12, // +8 = 20
  cosmic: 20, // +10 = 30
  singularity: 30,
} as const

export const ADVANTAGE_THRESHOLD = 2

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
  chose: 3,
  choseSpecific: 5,
  gainEnergy: 1,
  gainReputation: REPUTATION_TO_ENERGY,
  condition: -1,
  hardCondition: -2,
  recycle: 1,
  recycleSpecific: 2,
  discard: -1,
  discardRandom: -2,
  discardAll: -4,
  levelUp: ADVANTAGE_THRESHOLD,
  levelDown: -ADVANTAGE_THRESHOLD,
  levelDownRandom: -2 * ADVANTAGE_THRESHOLD,
  levelUpLabel: ADVANTAGE_THRESHOLD * 5,
} as const
