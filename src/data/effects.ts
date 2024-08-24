import type { Effect } from "@/hooks/useCardGame.ts";

import { ENERGY_TO_MONEY, REPUTATION_TO_ENERGY } from "@/game-constants.ts";

const effects: Effect[] = [
  {
    description: `Gagne ${2 * ENERGY_TO_MONEY}M$`,
    onPlayed: async (state) => await state.addMoney(2 * ENERGY_TO_MONEY),
    type: "action",
    cost: 2,
  },
  {
    description: `Gagne ${4 * ENERGY_TO_MONEY}M$`,
    onPlayed: async (state) => await state.addMoney(4 * ENERGY_TO_MONEY),
    type: "action",
    cost: 4,
  },
  {
    description: `Le matin, gagne ${2 * ENERGY_TO_MONEY}M$. L'après-midi, gagne 2 @energys`,
    onPlayed: async (state) => {
      if (new Date().getHours() < 12) {
        await state.addMoney(2 * ENERGY_TO_MONEY);
      } else {
        await state.addEnergy(2);
      }
    },
    type: "action",
    cost: 0,
  },
  {
    description: `Gagne ${2 * ENERGY_TO_MONEY}M$ fois le nombre de cartes @action en main en comptant celle-ci`,
    onPlayed: async (state) => {
      await state.addMoney(
        2 *
          ENERGY_TO_MONEY *
          state.hand.filter((card) => card.effect.type === "action").length,
      );
    },
    type: "action",
    cost: 4,
  },
  {
    description: `Si le dark mode est activé, gagne ${4 * ENERGY_TO_MONEY}M$`,
    onPlayed: async (state) => await state.addMoney(4 * ENERGY_TO_MONEY),
    condition: () => localStorage.getItem("theme") === "dark",
    type: "action",
    cost: 3,
  },
  {
    description: `Si la @reputation est inférieur à 5, gagne ${4 * ENERGY_TO_MONEY}M$`,
    onPlayed: async (state) => await state.addMoney(4 * ENERGY_TO_MONEY),
    condition: (state) => state.reputation < 5,
    type: "action",
    cost: 2,
  },
  {
    description: "Joue gratuitement la carte la plus à droite de ta main",
    onPlayed: async (state) =>
      await state.play(state.hand[state.hand.length - 1], { free: true }),
    condition: (state, card) => {
      const target = state.hand[state.hand.length - 1];

      return (
        target &&
        target.name !== card.name &&
        (!target.effect.condition ||
          target.effect.condition(state, state.hand[state.hand.length - 1]))
      );
    },
    type: "action",
    cost: 4, // ~ middle cost
    waitBeforePlay: true,
  },
  {
    description: "Pioche une carte",
    onPlayed: async (state) => await state.draw(),
    condition: (state) => state.deck.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  },
  {
    description: "Pioche 2 cartes",
    onPlayed: async (state) => await state.draw(2),
    condition: (state) => state.deck.length >= 1,
    type: "support",
    cost: 2,
    waitBeforePlay: true,
  },
  {
    description: "Si tu as moins de 5 cartes en main, pioche 2 cartes",
    onPlayed: async (state) => await state.draw(2),
    condition: (state) => state.hand.length < 5 && state.deck.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  },
  {
    description: "Pioche une carte @action",
    onPlayed: async (state) =>
      await state.draw(1, { filter: (card) => card.effect.type === "action" }),
    condition: (state) =>
      state.deck.some((card) => card.effect.type === "action"),
    type: "support",
    cost: 2,
    waitBeforePlay: true,
  },
  {
    description:
      "Si tu n'as pas de carte @action en main, pioche une carte @action",
    onPlayed: async (state) =>
      await state.draw(1, { filter: (card) => card.effect.type === "action" }),
    condition: (state) =>
      state.hand.every((card) => card.effect.type !== "action") &&
      state.deck.some((card) => card.effect.type === "action"),
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  },
  {
    description: `Défausse une carte aléatoire, pioche une carte et gagne ${2 * ENERGY_TO_MONEY}M$`, // -2 +1 +2 = +1
    onPlayed: async (state) => {
      await state.drop();
      await state.draw();
      await state.addMoney(2 * ENERGY_TO_MONEY);
    },
    condition: (state) => state.hand.length >= 2 && state.deck.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  },
  {
    description: "Renvoie une carte aléatoire dans la pioche, pioche une carte",
    onPlayed: async (state) => {
      await state.drop({ toDeck: true });
      await state.draw();
    },
    condition: (state) => state.hand.length >= 2,
    type: "support",
    cost: 0,
    waitBeforePlay: true,
  },
  {
    description: "Défausse les cartes en main, pioche 5 cartes",
    onPlayed: async (state) => {
      await state.dropAll();
      await state.draw(5);
    },
    condition: (state) => state.deck.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  },
  {
    description:
      "Renvoie toutes les cartes en main dans la pioche, pioche 5 cartes",
    onPlayed: async (state) => {
      await state.dropAll({ toDeck: true });
      await state.draw(5);
    },
    type: "support",
    cost: 5,
    waitBeforePlay: true,
  },
  {
    description: "Pioche autant de carte que d'@upgrades découvertes",
    onPlayed: async (state) => {
      await state.draw(state.upgrades.length);
    },
    condition: (state) => state.upgrades.length > 0 && state.deck.length >= 1,
    type: "support",
    cost: 3,
    waitBeforePlay: true,
  },
  {
    description:
      "Défausse les cartes @support en main(min 1), pioche 2 cartes @action", // -3 + 4 = +1
    onPlayed: async (state) => {
      await state.dropAll({ filter: (card) => card.effect.type === "support" });
      await state.draw(2, { filter: (card) => card.effect.type === "action" });
    },
    condition: (state) =>
      state.hand.filter((card) => card.effect.type === "support").length > 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  },
  {
    description: "Défausse les cartes @action en main(min 1), pioche 3 cartes",
    onPlayed: async (state) => {
      await state.dropAll({ filter: (card) => card.effect.type === "action" });
      await state.draw(3);
    },
    condition: (state) =>
      state.hand.some((card) => card.effect.type === "action"),
    type: "support",
    cost: 0,
    waitBeforePlay: true,
  },
  {
    description: "Pioche 2 cartes qui coûtent de l'@energy",
    onPlayed: async (state) => {
      await state.draw(2, { filter: (c) => typeof c.effect.cost === "number" });
    },
    condition: (state) =>
      state.deck.some((c) => typeof c.effect.cost === "number"),
    type: "support",
    cost: 4,
    waitBeforePlay: true,
  },
  {
    description: "Divise le prix de la prochaine carte jouée par 2", // 4 (middle effect) - 1 (easy condition) = 3
    onPlayed: async (state) =>
      await state.addNextCardModifier((card) => ({
        ...card,
        effect: {
          ...card.effect,
          cost:
            typeof card.effect.cost === "number"
              ? Math.ceil(card.effect.cost / 2)
              : String(Math.ceil(Number(card.effect.cost) / 2)),
        },
      })),
    type: "support",
    cost: 3,
  },
  {
    description: "Double l'@energy", // as middle effect
    onPlayed: async (state) => await state.addEnergy(state.energy),
    type: "action",
    cost: "20",
  },
  {
    description: "Ajoute 4 @energys",
    onPlayed: async (state) => await state.addEnergy(4),
    type: "action",
    cost: String(4 * ENERGY_TO_MONEY),
  },
  {
    description: "Si la @reputation est inférieur à 5, ajoute 5 @energys", // -2 + 5 = +3
    onPlayed: async (state) => await state.addEnergy(5),
    condition: (state) => state.reputation < 5,
    type: "action",
    cost: String(3 * ENERGY_TO_MONEY),
  },
  {
    description: "Remplis la jauge de @reputation", // middle score of reputation = 5 (parce qu'elle n'est jamais vide)
    onPlayed: async (state) => await state.addReputation(10),
    type: "action",
    cost: String(5 * REPUTATION_TO_ENERGY * ENERGY_TO_MONEY),
    ephemeral: true,
  },
];

export default effects;
