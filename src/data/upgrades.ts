import type { Upgrade } from "@/game-typings";
import {
  ENERGY_TO_MONEY,
  GAME_ADVANTAGE,
  MAX_ENERGY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
} from "@/game-constants.ts";

import { settings } from "@/game-settings.ts";

const advantage = GAME_ADVANTAGE[settings.difficulty];

type RawUpgrade = Pick<
  Upgrade,
  | "name"
  | "description"
  | "image"
  | "onTrigger"
  | "cost"
  | "condition"
  | "eventName"
> & {
  max?: number;
};

const upgrades: RawUpgrade[] = [
  {
    name: "Starbucks",
    eventName: "onPlay",
    description: "Rend @cumul @energy@s",
    image: "starbucks.png",
    condition: (state) => state.energy < MAX_ENERGY,
    onTrigger: async (state, upgrade, reason) => {
      await state.addEnergy(upgrade.cumul, { skipGameOverPause: true, reason });
    },
    max: 3,
    cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY), // 10 days * 2 cumul * 1 energy = 20
  },
  {
    name: "Méditation",
    eventName: "onPlay",
    description: "Pioche @cumul carte@s tant que ta main n'est pas pleine",
    image: "meditation.png",
    condition: (state) =>
      state.draw.length > 0 && state.hand.length < MAX_HAND_SIZE,
    onTrigger: async (state, upgrade, reason) => {
      await state.drawCard(
        Math.min(upgrade.cumul, MAX_HAND_SIZE - state.hand.length),
        { skipGameOverPause: true, reason },
      );
    },
    max: 3,
    cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY), // 10 days * 2 cumul * 1 energy (for draw) = 20
  },
  {
    name: "Bourse",
    eventName: "daily",
    description: "Gagne @cumul fois 10% de ton capital",
    image: "bourse.png",
    condition: (state) => state.money > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(Math.ceil(upgrade.cumul * (state.money / 10)), {
        skipGameOverPause: true,
        reason,
      });
    },
    max: 5,
    cost: String(Math.max(0, 10 - advantage) * ENERGY_TO_MONEY),
  },
  {
    name: "Recyclage",
    eventName: "onDraw",
    description: "Recycle @cumul carte@s aléatoire@s",
    image: "recyclage.png",
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.recycleCard(upgrade.cumul, { reason });
    },
    max: 3,
    cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY), // 10 days * 2 cumul * 1 energy (for recycle) = 20
  },
  {
    name: "I.A",
    eventName: "onDraw",
    description: "Gagne @cumulM$ par carte en défausse",
    image: "ia.png",
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.discard.length, {
        skipGameOverPause: true,
        reason,
      });
    },
    cost: String(Math.max(0, 80 - advantage) * ENERGY_TO_MONEY), // 20 days (for infinite cumul) * 2 cumul * 1/5 energy * 10 (discard average) = 20
  },
  {
    name: "Sport",
    eventName: "daily",
    description: "Gagne @cumul @reputation@s",
    image: "sport.png",
    condition: (state) => state.reputation < MAX_REPUTATION,
    onTrigger: async (state, upgrade, reason) => {
      await state.addReputation(upgrade.cumul, {
        skipGameOverPause: true,
        reason,
      });
    },
    max: 5,
    cost: Math.max(0, 20 - advantage), // 10 days * 2 cumul * 1 (for reputation) = 20
  },
  {
    name: "PC Puissant",
    eventName: "onDraw",
    description: "Gagne @cumulM$ par @energy",
    image: "pc-puissant.png",
    condition: (state) => state.energy > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.energy, {
        skipGameOverPause: true,
        reason,
      });
    },
    max: 2,
    cost: String(Math.max(0, 40 - advantage) * ENERGY_TO_MONEY), // 10 days * 2 cumul * 10 (for energy average) * 1/5 (money) = 40
  },
  {
    name: "Stagiaire",
    eventName: "onDraw",
    description: "Gagne @cumulM$ par cartes en main",
    image: "stagiaire.png",
    condition: (state) => state.hand.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.hand.length, {
        skipGameOverPause: true,
        reason,
      });
    },
    max: 5,
    cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY), // 10 days * 2 cumul * 5 (for hand average) * 1/5 (money) = 20
  },
];

export default upgrades;
