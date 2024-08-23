import type { Effect } from "@/hooks/useCardGame.ts";

const effects: Effect[] = [
  {
    description: "Gagne 10M$",
    onPlayed: async (state) => await state.addMoney(10),
    type: "action",
    cost: 2,
  },
  {
    description: "Gagne 20M$",
    onPlayed: async (state) => await state.addMoney(20),
    type: "action",
    cost: 4,
  },
  {
    description: "Le matin, gagne 10M$. L'après-midi, gagne 2 @energys",
    onPlayed: async (state) => {
      if (new Date().getHours() < 12) {
        await state.addMoney(10);
      } else {
        await state.addEnergy(2);
      }
    },
    type: "action",
    cost: 0,
  },
  {
    description: "Gagne 10M$ fois le nombre de cartes @action en main",
    onPlayed: async (state) => {
      await state.addMoney(
        10 *
          (state.hand.filter((card) => card.effect.type === "action").length -
            1),
      );
    },
    type: "action",
    cost: 4,
  },
  {
    description: "Si le dark mode est activé, gagne 20M$",
    onPlayed: async (state) => await state.addMoney(20),
    condition: () => localStorage.getItem("theme") === "dark",
    type: "action",
    cost: 3,
  },
  {
    description: "Si la @reputation est inférieur à 5, gagne 20M$",
    onPlayed: async (state) => await state.addMoney(20),
    condition: (state) => state.reputation < 5,
    type: "action",
    cost: 3,
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
    cost: 4,
  },
  {
    description: "Pioche une carte",
    onPlayed: async (state) => await state.draw(),
    condition: (state) => state.deck.length >= 1,
    type: "support",
    cost: 1,
  },
  {
    description: "Pioche 2 cartes",
    onPlayed: async (state) => await state.draw(2),
    condition: (state) => state.deck.length >= 2,
    type: "support",
    cost: 2,
  },
  {
    description: "Si tu as moins de 4 cartes en main, pioche 2 cartes",
    onPlayed: async (state) => await state.draw(2),
    condition: (state) => state.hand.length < 4 && state.deck.length >= 2,
    type: "support",
    cost: 1,
  },
  {
    description: "Pioche une carte @action",
    onPlayed: async (state) =>
      await state.draw(1, { filter: (card) => card.effect.type === "action" }),
    condition: (state) =>
      state.deck.some((card) => card.effect.type === "action"),
    type: "support",
    cost: 2,
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
  },
  {
    description: "Défausse une carte aléatoire, pioche une carte et gagne 10M$",
    onPlayed: async (state) => {
      await state.drop();
      await state.draw();
      await state.addMoney(10);
    },
    condition: (state) => state.hand.length >= 2,
    type: "support",
    cost: 0,
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
  },
  {
    description: "Défausse toutes les cartes en main, pioche 5 cartes",
    onPlayed: async (state) => {
      await state.dropAll();
      await state.draw(5);
    },
    type: "support",
    cost: 0,
  },
  {
    description:
      "Renvoie toutes les cartes en main dans la pioche, pioche 5 cartes",
    onPlayed: async (state) => {
      await state.dropAll({ toDeck: true });
      await state.draw(5);
    },
    type: "support",
    cost: 3,
  },
  {
    description: "Pioche autant de carte que d'@upgrades découvertes",
    onPlayed: async (state) => {
      await state.draw(state.upgrades.length);
    },
    condition: (state) => state.upgrades.length > 0,
    type: "support",
    cost: 3,
  },
  {
    description:
      "Défausse toutes les cartes @support en main (1 minimum), pioche 2 cartes @action",
    onPlayed: async (state) => {
      await state.dropAll({ filter: (card) => card.effect.type === "support" });
      await state.draw(2, { filter: (card) => card.effect.type === "action" });
    },
    condition: (state) =>
      state.hand.some((card) => card.effect.type === "support"),
    type: "support",
    cost: 3,
  },
  {
    description:
      "Défausse toutes les cartes @action en main (1 minimum), pioche 3 cartes",
    onPlayed: async (state) => {
      await state.dropAll({ filter: (card) => card.effect.type === "action" });
      await state.draw(3);
    },
    condition: (state) =>
      state.hand.some((card) => card.effect.type === "action"),
    type: "support",
    cost: 1,
  },
  {
    description: "Pioche 2 cartes qui coûtent de l'@energy",
    onPlayed: async (state) => {
      await state.draw(2, { filter: (c) => typeof c.effect.cost === "number" });
    },
    condition: (state) =>
      state.deck.some((c) => typeof c.effect.cost === "number"),
    type: "support",
    cost: 3,
  },
  {
    description: "Divise le prix de la prochaine carte jouée par 2",
    onPlayed: async (state) =>
      await state.setNextCardCost((cost) =>
        typeof cost === "number"
          ? Math.ceil(cost / 2)
          : String(Math.ceil(Number(cost) / 2)),
      ),
    type: "support",
    cost: 3,
  },
  {
    description: "Double l'@energy",
    onPlayed: async (state) => await state.addEnergy(state.energy),
    type: "action",
    cost: "10",
  },
  {
    description: "Ajoute 4 @energys",
    onPlayed: async (state) => await state.addEnergy(3),
    type: "action",
    cost: "10",
  },
  {
    description: "Si la @reputation est inférieur à 5, ajoute 5 @energys",
    onPlayed: async (state) => await state.addEnergy(5),
    condition: (state) => state.reputation < 5,
    type: "action",
    cost: "5",
  },
  {
    description: "Remplis la jauge de @reputation",
    onPlayed: async (state) => await state.addReputation(10),
    type: "action",
    cost: "100",
    ephemeral: true,
  },
];

export default effects;
