export const GAME_ADVANTAGE = {
  noob: 4,
  easy: 3,
  normal: 2,
  hard: 1,
  veteran: 0,
};
export const MAX_ENERGY = 20;
export const MAX_HAND_SIZE = 8;
export const MAX_REPUTATION = 10;
export const MONEY_TO_REACH = 500;
export const INFINITE_DRAW_COST = 5;
export const UPGRADE_COST_THRESHOLDS = {
  string: ["20", "50", "75"],
  number: [5, 7, 10],
};

/**
 * From Energy to Money <br/>
 * 1 Energy = 5 Money
 * 2 Energy = 10 Money
 * 4 Energy = 20 Money
 */
export const ENERGY_TO_MONEY = 5;

/**
 * From Reputation to Energy <br/>
 * 1 Reputation = 10 Energy
 * 2 Reputation = 20 Energy
 * 4 Reputation = 40 Energy
 */
export const REPUTATION_TO_ENERGY = 10;

export const TRIGGER_EVENTS = {
  eachDay: ["Chaque jour", "par jour"],
  eachTurn: ["A chaque carte jouée", "par carte"],
  emptyHand: ["Quand votre main est vide", "chaque fois que la main est vide"],
  reputationDeclines: [
    "Quand votre réputation baisse",
    "à chaque baisse de réputation",
  ],
} as const;
