import type { CardModifier } from "@/game-typings";
import { ENERGY_TO_MONEY } from "@/game-constants.ts";
import { getUpgradeCost } from "@/game-utils";

const cardModifiers = {
  "upgrade cost threshold": () => ({
    condition: (card) => !!card.effect.upgrade,
    use: (card, state) => {
      if (card.effect.upgrade) {
        return {
          ...card,
          effect: {
            ...card.effect,
            cost: getUpgradeCost(state, card),
          },
        };
      }
      return card;
    },
  }),
  "lowers price of hand cards": (
    handCardNames: string[],
    discount: number,
  ) => ({
    once: true,
    condition: (card) => handCardNames.includes(card.name),
    use: (card) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: (typeof card.effect.cost === "string" ? String : Number)(
          Math.max(
            0,
            Number(card.effect.cost) -
              discount *
                (typeof card.effect.cost === "string" ? ENERGY_TO_MONEY : 1),
          ),
        ),
      },
    }),
  }),
  "next money card cost energy": () => ({
    once: true,
    condition: (card) =>
      typeof card.effect.cost === "string" && Number(card.effect.cost) > 0,
    use: (card) => ({
      ...card,
      effect: {
        ...card.effect,
        cost: Math.min(
          20,
          Math.ceil(Number(card.effect.cost) / ENERGY_TO_MONEY),
        ),
      },
    }),
  }),
  "next card half cost": () => ({
    once: true,
    condition: (card) => Number(card.effect.cost) > 1,
    use: (card) => ({
      ...card,
      effect: {
        ...card.effect,
        cost:
          typeof card.effect.cost === "number"
            ? Math.ceil(card.effect.cost / 2)
            : String(Math.ceil(Number(card.effect.cost) / 2)),
      },
    }),
  }),
} satisfies Record<string, (...params: never[]) => CardModifier>;

export default cardModifiers;
