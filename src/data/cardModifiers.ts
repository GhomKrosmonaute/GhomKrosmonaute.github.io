import type { CardModifier } from "@/game-typings"
import { ENERGY_TO_MONEY } from "@/game-constants.ts"
import {
  calculateRarityAdvantage,
  getUpgradeCost,
  costTo,
} from "@/game-safe-utils.tsx"
import { GlobalCardModifierIndex } from "@/game-enums.ts"

const cardModifiers = {
  "upgrade cost threshold": () => ({
    index: GlobalCardModifierIndex.AddOrSubtract,
    condition: (card) => card.effect.tags.includes("upgrade"),
    use: (card, state) => {
      if (card.effect.tags.includes("upgrade")) {
        return {
          ...card,
          effect: {
            ...card.effect,
            cost: getUpgradeCost(state, card),
          },
        }
      }
      return card
    },
  }),

  "lowers price of hand cards": (
    handCardNames: string[],
    discount: number,
  ) => ({
    index: GlobalCardModifierIndex.AddOrSubtract,
    condition: (card) => handCardNames.includes(card.name),
    use: (card) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: {
          type: card.effect.cost.type,
          value:
            card.effect.cost.value -
            costTo({ value: discount, type: "energy" }, card.effect.cost.type),
        },
      },
    }),
  }),

  "next energy card cost money": () => ({
    index: GlobalCardModifierIndex.Last,
    once: true,
    condition: (card) => card.effect.cost.type === "energy",
    use: (card) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: {
          type: "money",
          value: Math.ceil(card.effect.cost.value * ENERGY_TO_MONEY),
        },
      },
    }),
  }),

  "next money card cost energy": () => ({
    index: GlobalCardModifierIndex.Last,
    once: true,
    condition: (card) => {
      return card.effect.cost.type === "money" && card.effect.cost.value > 0
    },
    use: (card, state) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: {
          type: "energy",
          value: Math.min(
            state.energyMax,
            Math.ceil(card.effect.cost.value / ENERGY_TO_MONEY),
          ),
        },
      },
    }),
  }),

  "next card half cost": () => ({
    index: GlobalCardModifierIndex.MultiplyOrDivide,
    once: true,
    condition: (card) => card.effect.cost.value > 1,
    use: (card) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: {
          type: card.effect.cost.type,
          value: Math.floor(card.effect.cost.value / 2),
        },
      },
    }),
  }),

  "level up cards": (handCardNames: string[], advantage: number) => ({
    index: GlobalCardModifierIndex.First,
    condition: (card) => handCardNames.includes(card.name),
    use: (card, state, raw) => {
      const rarity = card.rarity + advantage

      return {
        ...card,
        rarity,
        effect: raw.effect(
          calculateRarityAdvantage(rarity, state),
          state,
          card,
        ),
      }
    },
  }),

  "all card inflation": () => ({
    index: GlobalCardModifierIndex.First,
    condition: () => true,
    use: (card, state, raw) => {
      const rarity = card.rarity - state.inflation

      return {
        ...card,
        rarity,
        effect: raw.effect(
          calculateRarityAdvantage(rarity, state),
          state,
          card,
        ),
      }
    },
  }),
} satisfies Record<string, (...params: never[]) => CardModifier>

export default cardModifiers
