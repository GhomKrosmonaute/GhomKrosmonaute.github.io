import type { CardModifier } from "@/game-typings"
import { ENERGY_TO_MONEY, GAME_ADVANTAGE } from "@/game-constants.ts"
import { getUpgradeCost, costTo } from "@/game-utils"

const cardModifiers = {
  "upgrade cost threshold": () => ({
    condition: (card) => Boolean(card.effect.upgrade),
    use: (card, state) => {
      if (card.effect.upgrade) {
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

  "all card inflation": () => ({
    condition: () => true,
    use: (card, state) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: {
          type: card.effect.cost.type,
          value:
            card.effect.cost.value +
            costTo(
              {
                value: Math.max(
                  0,
                  state.inflation - GAME_ADVANTAGE[state.difficulty],
                ),
                type: "energy",
              },
              card.effect.cost.type,
            ),
        },
      },
    }),
  }),

  "lowers price of hand cards": (
    handCardNames: string[],
    discount: number,
  ) => ({
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
} satisfies Record<string, (...params: never[]) => CardModifier>

export default cardModifiers
