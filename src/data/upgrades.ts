import type { Upgrade } from "@/hooks/useCardGame.ts";
import {
  ENERGY_TO_MONEY,
  MAX_ENERGY,
  MAX_REPUTATION,
  TRIGGER_EVENTS,
} from "@/game-constants.ts";

type RawUpgrade = Pick<
  Upgrade,
  | "name"
  | "description"
  | "image"
  | "onTrigger"
  | "cost"
  | "condition"
  | "triggerEvent"
> & {
  max?: number;
  cumulable?: boolean;
};

const upgrades: RawUpgrade[] = [
  {
    name: "Starbucks",
    triggerEvent: "eachDay",
    description: "Rend @cumul @energy@s",
    image: "starbucks.png",
    condition: (state) => state.energy < MAX_ENERGY,
    onTrigger: async (state, upgrade) => {
      await state.addEnergy(upgrade.cumul);
    },
    cumulable: true,
    max: 3,
    cost: String(20 * ENERGY_TO_MONEY), // 10 days * 2 cumul * 1 energy = 20
  },
  {
    name: "Méditation",
    triggerEvent: "eachDay",
    description: "Pioche @cumul carte@s",
    image: "meditation.png",
    condition: (state) => state.deck.length > 0,
    onTrigger: async (state, upgrade) => {
      await state.draw(upgrade.cumul);
    },
    cumulable: true,
    max: 3,
    cost: String(20 * ENERGY_TO_MONEY), // 10 days * 2 cumul * 1 energy (for draw) = 20
  },
  {
    name: "Bourse",
    triggerEvent: "eachDay",
    description: "Gagne @cumul fois 10% de votre capital",
    image: "bourse.png",
    condition: (state) => state.money > 0,
    onTrigger: async (state, upgrade) => {
      await state.addMoney(Math.ceil((upgrade.cumul / 100) * state.money));
    },
    cumulable: true,
    cost: String(8 * ENERGY_TO_MONEY), // 20 days (for infinite cumul) * 2 cumul * 1/5 energy = 20
  },
  {
    name: "Recyclage",
    triggerEvent: "eachDay",
    description: "Place @cumul carte@s aléatoire@s de la défausse dans le deck",
    image: "recyclage.png",
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade) => {
      await state.recycle(upgrade.cumul);
    },
    cumulable: true,
    max: 3,
    cost: String(20 * ENERGY_TO_MONEY), // 10 days * 2 cumul * 1 energy (for recycle) = 20
  },
  {
    name: "I.A",
    triggerEvent: "eachDay",
    description: "Gagne @cumulM$ fois le nombre de carte en défausse",
    image: "ia.png",
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade) => {
      await state.addMoney(upgrade.cumul * state.discard.length);
    },
    cumulable: true,
    cost: String(80 * ENERGY_TO_MONEY), // 20 days (for infinite cumul) * 2 cumul * 1/5 energy * 10 (discard average) = 20
  },
  {
    name: "Sport",
    triggerEvent: "eachDay",
    description: "Gagne @cumul @reputation@s",
    image: "sport.png",
    condition: (state) => state.reputation < MAX_REPUTATION,
    onTrigger: async (state, upgrade) => {
      await state.addReputation(upgrade.cumul, { skipGameOverCheck: true });
    },
    cumulable: true,
    max: 2,
    cost: 20, // 10 days * 2 cumul * 1 (for reputation) = 20
  },
  {
    name: "PC Puissant",
    triggerEvent: "eachDay",
    description: "Gagne @cumulM$ fois le nombre d'@energy",
    image: "pc-puissant.png",
    condition: (state) => state.energy > 0,
    onTrigger: async (state, upgrade) => {
      await state.addMoney(upgrade.cumul * state.energy);
    },
    cumulable: true,
    max: 2,
    cost: String(40 * ENERGY_TO_MONEY), // 10 days * 2 cumul * 10 (for energy average) * 1/5 (money) = 40
  },
  {
    name: "Stagiaire",
    triggerEvent: "eachDay",
    description: "Gagne @cumulM$ fois le nombre de cartes en main",
    image: "stagiaire.png",
    condition: (state) => state.hand.length > 0,
    onTrigger: async (state, upgrade) => {
      await state.addMoney(upgrade.cumul * state.hand.length);
    },
    cumulable: true,
    max: 5,
    cost: String(20 * ENERGY_TO_MONEY), // 10 days * 2 cumul * 5 (for hand average) * 1/5 (money) = 20
  },
];

export default upgrades.map((upgrade) => {
  upgrade.description = `${upgrade.description} ${TRIGGER_EVENTS[upgrade.triggerEvent][1]}`;
  return upgrade;
});
