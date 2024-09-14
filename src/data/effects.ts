import type { EffectBuilder } from "@/game-typings"

import {
  ENERGY_TO_MONEY,
  MAX_HAND_SIZE,
  REPUTATION_TO_ENERGY,
} from "@/game-constants.ts"

import {
  formatText,
  GlobalCardModifierIndex,
  parseCost,
  reviveCard,
} from "@/game-utils.ts"

const effects: EffectBuilder[] = [
  (advantage: number) => ({
    description: formatText(`Gagne ${(2 + advantage) * ENERGY_TO_MONEY}M$`),
    onPlayed: async (state, _, reason) =>
      await state.addMoney((2 + advantage) * ENERGY_TO_MONEY, {
        skipGameOverPause: true,
        reason,
      }),
    type: "action",
    cost: 2,
  }),
  (advantage: number) => ({
    description: formatText(`Gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`),
    onPlayed: async (state, _, reason) =>
      await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
        skipGameOverPause: true,
        reason,
      }),
    type: "action",
    cost: 4,
  }),
  (advantage: number) => ({
    description: formatText(
      `Lance une pièce. <br/> Face: gagne ${(2 + advantage) * ENERGY_TO_MONEY}M$. <br/> Pile: gagne ${2 + advantage} @energy${2 + advantage > 1 ? "s" : ""}`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.coinFlip({
        onHead: async () =>
          await state.addMoney((1 + advantage) * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          }),
        onTail: async () =>
          await state.addEnergy(1 + advantage, {
            skipGameOverPause: true,
            reason,
          }),
      }),
    type: "action",
    cost: 1,
  }),
  (advantage: number) => ({
    description: formatText(
      `Lance une pièce. <br/> Face: gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$. <br/> Pile: gagne ${4 + advantage} @energy${4 + advantage > 1 ? "s" : ""}`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.coinFlip({
        onHead: async () =>
          await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          }),
        onTail: async () =>
          await state.addEnergy(4 + advantage, {
            skipGameOverPause: true,
            reason,
          }),
      }),
    condition: () => localStorage.getItem("theme") === "dark",
    type: "action",
    cost: 3,
  }),
  (advantage: number) => ({
    description: formatText(
      `Gagne ${(2 + advantage) * ENERGY_TO_MONEY}M$ par carte @action en main en comptant celle-ci`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.addMoney(
        (2 + advantage) *
          ENERGY_TO_MONEY *
          state.hand
            .map((c) => reviveCard(c, state))
            .filter((card) => card.effect.type === "action").length,
        { skipGameOverPause: true, reason },
      )
    },
    type: "action",
    cost: 4,
  }),
  (advantage: number) => ({
    description: formatText(
      `Si la @reputation est inférieur à 5, gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
        skipGameOverPause: true,
        reason,
      }),
    condition: (state) => state.reputation < 5,
    type: "action",
    cost: 2,
  }),
  (advantage: number) => ({
    description: formatText(
      `Joue gratuitement la carte la plus à droite de ta main${
        advantage > 4
          ? ` et gagne ${advantage - 4} @energy${advantage - 4 > 1 ? "s" : ""}`
          : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.playCard(
        reviveCard(state.hand[state.hand.length - 1], state),
        {
          free: true,
          skipGameOverPause: true,
          reason,
        },
      )

      if (advantage > 4) {
        await state.addEnergy(advantage - 4, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state, card) => {
      const indice = state.hand[state.hand.length - 1]

      if (!indice) return false

      const target = reviveCard(indice, state)
      const targetEffect = target.effect

      return (
        target.name !== card.name &&
        target.state === "idle" &&
        card.state === "idle" &&
        (!targetEffect.condition || targetEffect.condition(state, target))
      )
    },
    type: "action",
    cost: Math.max(0, 4 - advantage), // ~ middle cost
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Défausse la carte la plus à droite de ta main, gagne son coût en @energy${
        advantage > 0
          ? ` plus ${advantage} @energy${advantage > 1 ? "s" : ""}`
          : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      const target = reviveCard(state.hand[state.hand.length - 1], state)

      await state.discardCard({
        filter: (card) => card.name === target.name,
        reason,
      })

      const cost = parseCost(state, target, []).cost

      await state.addEnergy(cost, { skipGameOverPause: true, reason })
    },
    condition: (state, card) => {
      const indice = state.hand[state.hand.length - 1]

      return (
        state.hand.length > 1 &&
        card.name !== indice[0] &&
        parseCost(state, reviveCard(indice, state), []).cost > 0
      )
    },
    // template: (state, _, cond) => {
    //   if (!cond) return "";
    //
    //   const target = state.hand[state.hand.length - 1];
    //   const cost =
    //     typeof target.effect.cost === "string"
    //       ? Math.ceil(Number(target.effect.cost) / ENERGY_TO_MONEY)
    //       : target.effect.cost;
    //
    //   return `(${cost} @energy${cost > 1 ? "s" : ""})`;
    // },
    type: "action",
    cost: 0,
  }),
  (advantage: number) => ({
    description: formatText(
      `Pioche ${1 + advantage} carte${advantage > 0 ? "s" : ""}`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.drawCard(1 + advantage, {
        skipGameOverPause: true,
        reason,
      }),
    condition: (state) => state.draw.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Pioche ${advantage > 2 ? 2 + (advantage - 2) : 2} cartes`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.drawCard(advantage > 2 ? 2 + (advantage - 2) : 2, {
        skipGameOverPause: true,
        reason,
      }),
    condition: (state) => state.draw.length >= 1,
    type: "support",
    cost: Math.max(0, 2 - advantage),
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Si tu as moins de 5 cartes en main, pioche ${2 + advantage} cartes`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.drawCard(2 + advantage, {
        skipGameOverPause: true,
        reason,
      }),
    condition: (state) => state.hand.length < 5 && state.draw.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Pioche ${advantage >= 4 ? 1 + Math.floor((advantage - 2) / 2) : 1} carte${advantage >= 4 ? "s" : ""} @action${
        advantage >= 2 && advantage % 2 !== 0
          ? ` et gagne ${advantage % 2} @energy${advantage % 2 > 0 ? "s" : ""}`
          : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.drawCard(
        advantage >= 2 ? 1 + Math.floor((advantage - 2) / 2) : 1,
        {
          filter: (card) => card.effect.type === "action",
          skipGameOverPause: true,
          reason,
        },
      )

      if (advantage >= 2 && advantage % 2 !== 0) {
        await state.addEnergy(advantage % 2, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state) =>
      state.draw.some(
        (card) => reviveCard(card, state).effect.type === "action",
      ),
    type: "support",
    cost: Math.max(0, 2 - advantage),
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Si tu n'as pas de carte @action en main, pioche ${1 + Math.floor(advantage / 2)} carte${advantage >= 2 ? "s" : ""} @action${
        advantage % 2 !== 0
          ? ` et gagne ${(advantage % 2) * ENERGY_TO_MONEY}M$`
          : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.drawCard(1, {
        filter: (card) => card.effect.type === "action",
        skipGameOverPause: true,
        reason,
      })

      if (advantage % 2 !== 0) {
        await state.addMoney((advantage % 2) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state) =>
      state.hand.every(
        (card) => reviveCard(card, state).effect.type !== "action",
      ) &&
      state.draw.some(
        (card) => reviveCard(card, state).effect.type === "action",
      ),
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Défausse une carte aléatoire, pioche ${advantage >= 1 ? 2 : "une"} carte${advantage > 1 ? "s" : ""} et gagne ${(2 + advantage - 1) * ENERGY_TO_MONEY}M$`,
    ),
    onPlayed: async (state, card, reason) => {
      await state.discardCard({
        random: true,
        reason,
        filter: (c) => c.name !== card.name,
      })

      await state.drawCard(advantage >= 1 ? 2 : 1, {
        skipGameOverPause: true,
        reason,
      })

      await state.addMoney((2 + advantage - 1) * ENERGY_TO_MONEY, {
        skipGameOverPause: true,
        reason,
      })
    },
    condition: (state) => state.hand.length >= 2 && state.draw.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Renvoie une carte aléatoire dans la pioche, pioche ${advantage >= 1 ? 1 + advantage : "une"} carte${advantage >= 1 ? "s" : ""}`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.discardCard({ toDraw: true, random: true, reason })
      await state.drawCard(advantage >= 1 ? 1 + advantage : 1, {
        skipGameOverPause: true,
        reason,
      })
    },
    condition: (state) => state.hand.length >= 2,
    type: "support",
    cost: 0,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Pioche ${advantage >= 3 ? 1 + Math.floor(advantage / 2) : "une"} carte${advantage >= 3 ? "s" : ""} dans la défausse`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.drawCard(advantage >= 1 ? 1 + advantage : 1, {
        fromDiscardPile: true,
        skipGameOverPause: true,
        reason,
      }),
    condition: (state) => state.discard.length >= 1,
    type: "support",
    cost: 2,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Défausse les cartes en main, pioche ${5 + advantage} cartes`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.discardCard({ reason })
      await state.drawCard(5 + advantage, {
        skipGameOverPause: true,
        reason,
      })
    },
    condition: (state) => state.draw.length >= 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Renvoie toutes les cartes en main dans la pioche, pioche ${
        advantage > 5 ? 5 + (advantage - 5) : 5
      } cartes`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.discardCard({ toDraw: true, reason })
      await state.drawCard(advantage > 5 ? 5 + (advantage - 5) : 5, {
        skipGameOverPause: true,
        reason,
      })
    },
    type: "support",
    cost: Math.max(0, 5 - advantage),
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Pioche autant de carte que d'@upgrades découvertes${
        advantage > 3 ? ` et gagne ${(advantage - 3) * ENERGY_TO_MONEY}M$` : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.drawCard(state.upgrades.length, {
        skipGameOverPause: true,
        reason,
      })

      if (advantage > 3) {
        await state.addMoney((advantage - 3) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state) => state.upgrades.length > 0 && state.draw.length >= 1,
    type: "support",
    cost: Math.max(0, 3 - advantage),
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Défausse les cartes @support en main(min 1), pioche 2 cartes @action${
        advantage > 0 ? ` et gagne ${advantage * ENERGY_TO_MONEY}M$` : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.discardCard({
        filter: (card) => card.effect.type === "support",
        reason,
      })
      await state.drawCard(2, {
        filter: (card) => card.effect.type === "action",
        skipGameOverPause: true,
        reason,
      })

      if (advantage > 0) {
        await state.addMoney(advantage * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state) =>
      state.hand
        .map((c) => reviveCard(c, state))
        .filter((card) => card.effect.type === "support").length > 1,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Défausse les cartes @action en main(min 1), pioche ${3 + advantage} cartes`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.discardCard({
        filter: (card) => card.effect.type === "action",
        reason,
      })

      await state.drawCard(3 + advantage, {
        skipGameOverPause: true,
        reason,
      })
    },
    condition: (state) =>
      state.hand.some(
        (card) => reviveCard(card, state).effect.type === "action",
      ),
    type: "support",
    cost: 0,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText("Recycle toutes les cartes de la défausse"),
    onPlayed: async (state, _, reason) => {
      await state.recycleCard(state.discard.length + 1, { reason })
    },
    condition: (state) => state.discard.length > 0,
    type: "support",
    cost: Math.max(0, 10 - advantage),
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Recycle ${1 + advantage} carte${advantage > 0 ? "s" : ""} aléatoire${advantage > 0 ? "s" : ""} de la défausse`,
    ),
    onPlayed: async (state, _, reason) => {
      // on ajoute 1 pour que ça compte la carte qui est jouée, car elle
      // est déjà dans la défausse malgrès qu'on lui ai dit d'attendre avant d'être jouée
      await state.recycleCard(2 + advantage, { reason })
    },
    condition: (state) => state.discard.length > 0,
    type: "support",
    cost: 1,
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `Pioche 2 cartes qui coûtent de l'@energy${
        advantage > 4
          ? ` et gagne ${advantage - 4} @energy${advantage - 4 > 1 ? "s" : ""}`
          : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.drawCard(2, {
        filter: (c) => parseCost(state, c, []).needs === "energy",
        skipGameOverPause: true,
        reason,
      })

      if (advantage > 4) {
        await state.addEnergy(advantage - 4, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state) =>
      state.draw.some(
        (c) => parseCost(state, reviveCard(c, state), []).needs === "energy",
      ),
    type: "support",
    cost: Math.max(0, 4 - advantage),
    waitBeforePlay: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `La prochaine carte jouée coûte la moitié de son prix${
        advantage > 3
          ? `, gagne ${advantage - 3} @energy${advantage - 3 > 1 ? "s" : ""}`
          : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      state.addGlobalCardModifier(
        "next card half cost",
        [],
        GlobalCardModifierIndex.MultiplyOrDivide,
      )

      if (advantage > 3) {
        await state.addEnergy(advantage - 3, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    type: "support",
    cost: Math.max(0, 3 - advantage),
  }),
  (advantage: number) => ({
    description: formatText(
      `La prochaine carte qui coûte de l'argent coûte maintenant de l'@energy${
        advantage > 0
          ? ` et gagne ${advantage} @energy${advantage > 1 ? "s" : ""}`
          : ""
      }`,
    ),
    onPlayed: async (state) => {
      state.addGlobalCardModifier(
        "next money card cost energy",
        [],
        GlobalCardModifierIndex.Last,
      )
    },
    type: "support",
    cost: 0,
  }),
  (advantage: number) => ({
    description: formatText(
      `Baisse le prix de toutes les cartes en main de ${
        1 + advantage
      } @energys ou de ${(1 + advantage) * ENERGY_TO_MONEY}M$`,
    ),
    onPlayed: async (state, card) => {
      const handCardNames = state.hand
        .map((c) => reviveCard(c, state))
        .filter(
          (c) => c.name !== card.name && parseCost(state, card, []).cost > 0,
        )
        .map((c) => c.name)

      state.addGlobalCardModifier(
        "lowers price of hand cards",
        [handCardNames, 1 + advantage],
        GlobalCardModifierIndex.AddOrSubtract,
      )
    },
    condition: (state) =>
      state.hand.some(
        (card) => parseCost(state, reviveCard(card, state), []).cost > 0,
      ),
    type: "support",
    cost: Math.max(0, MAX_HAND_SIZE - advantage),
    ephemeral: true,
  }),
  (advantage: number) => ({
    description: formatText(
      `${advantage > 4 ? `Ajoute ${advantage - 4} @energy${advantage > 5 ? "s" : ""}` : "D"}ouble l'@energy`,
    ),
    onPlayed: async (state, _, reason) => {
      if (advantage > 4) {
        await state.addEnergy(advantage - 4, {
          skipGameOverPause: true,
          reason,
        })
      }

      await state.addEnergy(state.energy, {
        skipGameOverPause: true,
        reason,
      })
    },
    type: "action",
    cost: String(Math.max(0, 4 - advantage) * ENERGY_TO_MONEY),
  }),
  (advantage: number) => ({
    description: formatText(`Ajoute ${4 + advantage} @energys`),
    onPlayed: async (state, _, reason) =>
      await state.addEnergy(4 + advantage, {
        skipGameOverPause: true,
        reason,
      }),
    type: "action",
    cost: String(4 * ENERGY_TO_MONEY),
  }),
  (advantage: number) => ({
    description: formatText(
      `Si la @reputation est inférieur à 5, ajoute ${
        advantage > 3 ? 5 + advantage - 3 : 5
      } @energys`,
    ),
    onPlayed: async (state, _, reason) =>
      await state.addEnergy(advantage > 3 ? 5 + advantage - 3 : 5, {
        skipGameOverPause: true,
        reason,
      }),
    condition: (state) => state.reputation < 5,
    type: "action",
    cost: String(Math.max(0, 3 - advantage) * ENERGY_TO_MONEY),
  }),
  (advantage: number) => ({
    description: formatText("Remplis la jauge de @reputation"),
    onPlayed: async (state, _, reason) =>
      await state.addReputation(10, { skipGameOverPause: true, reason }),
    type: "action",
    cost: String(
      Math.max(0, 5 * REPUTATION_TO_ENERGY - advantage) * ENERGY_TO_MONEY,
    ),
    ephemeral: true,
  }),
]

export default effects
