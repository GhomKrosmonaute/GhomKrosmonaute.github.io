import type {
  ActionCardInfo,
  CardModifier,
  CardModifierIndice,
  ColorClass,
  GameCardInfo,
  GameOverReason,
  Upgrade,
} from "@/game-typings";

import type { CardGameState } from "@/hooks/useCardGame";

import {
  INFINITE_DRAW_COST,
  MAX_HAND_SIZE,
  MONEY_TO_REACH,
  UPGRADE_COST_THRESHOLDS,
} from "@/game-constants";

import cardModifiers from "@/data/cardModifiers.ts";
import effects from "@/data/effects.ts";
import upgrades from "@/data/upgrades.ts";
import cards from "@/data/cards.ts";

interface ChoiceOptionsGeneratorOptions {
  exclude?: GameCardInfo[];
  filter?: (card: GameCardInfo, state: CardGameState) => boolean;
}

export function generateChoiceOptions(
  state: CardGameState,
  options?: ChoiceOptionsGeneratorOptions,
): GameCardInfo[] {
  const _cards = cards.filter(
    (card) =>
      (state.draw.length === 0 ||
        state.draw.every((c) => c.name !== card.name)) &&
      (state.discard.length === 0 ||
        state.discard.every((c) => c.name !== card.name)) &&
      (state.hand.length === 0 ||
        state.hand.every((c) => c.name !== card.name)) &&
      (!options?.exclude ||
        options?.exclude?.every((c) => c.name !== card.name)) &&
      (!options?.filter || options?.filter?.(card, state)) &&
      (!card.effect.upgrade ||
        state.upgrades.length === 0 ||
        state.upgrades.every((u) => u.name !== card.name || u.cumul < u.max)),
  );

  if (_cards.length === 0) {
    return [];
  }

  // todo: add random rarity to selected cards

  return shuffle(_cards, 3)
    .slice(0, state.choiceOptionCount)
    .map((c) => ({ ...c, state: "drawing" }));
}

export function energyCostColor(
  state: CardGameState,
  cost: number,
): ColorClass | [ColorClass, ColorClass] {
  return state.energy >= cost
    ? "bg-energy"
    : state.energy > 0
      ? ["bg-energy", "bg-reputation"]
      : "bg-reputation";
}

export function isGameOver(state: CardGameState): GameOverReason | false {
  if (state.reputation === 0) return "reputation";
  if (state.draw.length === 0 && state.hand.length === 0) return "mill";
  if (
    state.hand.every((c) => {
      // on vérifie si la condition s'il y en
      if (c.effect.condition && !c.effect.condition(state, c)) return true;

      // on vérifie si on a assez de resources
      return !parseCost(state, c, []).canBeBuy;
    }) &&
    (state.reputation + state.energy < INFINITE_DRAW_COST ||
      state.hand.length >= MAX_HAND_SIZE ||
      state.draw.length === 0)
  )
    return "soft-lock";

  return false;
}

export function rankColor(rank: number) {
  return {
    "text-upgrade": rank === 0,
    "text-zinc-400": rank === 1,
    "text-orange-600": rank === 2,
  };
}

export function getUpgradeCost(
  state: CardGameState,
  card: GameCardInfo,
): number | string {
  const index = state.upgrades.length;

  const priceThreshold =
    UPGRADE_COST_THRESHOLDS[typeof card.effect.cost as "string" | "number"][
      index
    ] ?? Infinity;

  return (typeof card.effect.cost == "string" ? String : Number)(
    Math.min(Number(priceThreshold), Number(card.effect.cost)),
  );
}

export function cloneSomething<T>(something: T): T {
  return JSON.parse(
    JSON.stringify(something, (_key, value) =>
      typeof value === "function" ? undefined : value,
    ),
  );
}

export function applyCardModifiers(
  state: CardGameState,
  card: GameCardInfo,
  used: string[],
): { card: GameCardInfo; appliedModifiers: CardModifierIndice[] } {
  const clone = cloneSomething(card);
  const modifiers = state.cardModifiers.slice();

  return modifiers.reduce<{
    card: GameCardInfo;
    appliedModifiers: CardModifierIndice[];
  }>(
    (previousValue, indice) => {
      const stringIndice = JSON.stringify(indice);

      if (used.includes(stringIndice)) return previousValue;
      else used.push(stringIndice);

      const modifier = reviveCardModifier(indice);

      return !modifier.condition ||
        modifier.condition(previousValue.card, state)
        ? {
            card: modifier.use(previousValue.card, state),
            appliedModifiers: [...previousValue.appliedModifiers, indice],
          }
        : previousValue;
    },
    { card: clone, appliedModifiers: [] },
  );
}

export function parseCost(
  state: CardGameState,
  card: GameCardInfo,
  used: string[],
) {
  const { card: tempCard, appliedModifiers } = applyCardModifiers(
    state,
    card,
    used,
  );
  const needs = typeof tempCard.effect.cost === "number" ? "energy" : "money";
  const cost = Number(tempCard.effect.cost);
  const canBeBuy =
    needs === "money"
      ? state[needs] >= cost
      : state[needs] + state.reputation >= cost;

  return { needs, cost, canBeBuy, appliedModifiers } as const;
}

export function willBeRemoved(state: CardGameState, card: GameCardInfo) {
  if (card.effect.ephemeral) return true;

  if (card.effect.upgrade) {
    const rawUpgrade = upgrades.find((u) => u.name === card.name)!;

    if (rawUpgrade.max) {
      if (rawUpgrade.max === 1) return true;

      const upgrade = state.upgrades.find((u) => u.name === card.name);

      return upgrade && upgrade.cumul >= upgrade.max - 1;
    }
  }

  return false;
}

export function formatText(text: string) {
  return text
    .replace(
      /(\(.+?\))/g,
      `<span style="position: relative; transform-style: preserve-3d">
        <span style="
          display: inline-block; 
          position: absolute; 
          font-size: 12px; 
          white-space: nowrap;
          transform: rotate(5deg) translateX(-50%) translateY(-30%) translateZ(10px);">$1</span>
      </span>`,
    )
    .replace(/MONEY_TO_REACH/g, String(MONEY_TO_REACH))
    .replace(/MAX_HAND_SIZE/g, String(MAX_HAND_SIZE))
    .replace(/\b([\de+.]+)M\$/g, (_, n) => {
      const amount = Number(n);
      console.trace(_, amount);
      return amount >= 1000
        ? `${(amount / 1000).toFixed(2).replace(".00", "").replace(/\.0\b/, "")}B$`
        : `${amount}M$`;
    })
    .replace(
      /@action([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--action)); transform: translateZ(5px); font-weight: bold;">Action$1</span>',
    )
    .replace(
      /@reputation([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--reputation)); transform: translateZ(5px); font-weight: bold;">Réputation$1</span>',
    )
    .replace(
      /@upgrade([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--upgrade)); transform: translateZ(5px); font-weight: bold;">Amélioration$1</span>',
    )
    .replace(
      /@sprint([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--upgrade)); transform: translateZ(5px); font-weight: bold;">Sprint$1</span>',
    )
    .replace(
      /@support([^\s.:,)]*)/g,
      '<span style="display: inline-block; background-color: hsla(var(--support) / 0.5); color: hsl(var(--support-foreground)); padding: 0 6px; border-radius: 4px; transform: translateZ(5px); font-weight: bold;">Support$1</span>',
    )
    .replace(
      /@energy([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--energy)); transform: translateZ(5px); font-weight: bold;">Énergie$1</span>',
    )
    .replace(
      /@day([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--day)); transform: translateZ(5px); font-weight: bold;">Jour$1</span>',
    )
    .replace(
      /((?:[\de+.]+|<span[^>]*>[\de+.]+<\/span>)[MB]\$)/g,
      `<span 
        style="display: inline-block; 
        background-color: hsl(var(--money)); 
        color: hsl(var(--money-foreground));
        padding: 0 4px; 
        border: 1px hsl(var(--money-foreground)) solid; 
        transform: translateZ(5px); 
        font-family: Changa, sans-serif;"
      >
        $1
      </span>`,
    );
}

export function formatUpgradeText(text: string, cumul: number) {
  return text
    .replace(
      /@cumul/g,
      `<span style="color: #f59e0b; font-weight: bold">${cumul}</span>`,
    )
    .replace(/@s/g, cumul > 1 ? "s" : "");
}

export async function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function shuffle(cards: GameCardInfo[], times = 1): GameCardInfo[] {
  for (let i = 0; i < times; i++) {
    cards.sort(() => Math.random() - 0.5);
  }
  return cards;
}

/**
 * Re-maps a number from one range to another.
 * @param value - The incoming value to be converted.
 * @param start1 - Lower bound of the value's current range.
 * @param stop1 - Upper bound of the value's current range.
 * @param start2 - Lower bound of the value's target range.
 * @param stop2 - Upper bound of the value's target range.
 * @param withinBounds - Constrain the value to the newly mapped range.
 * @returns The mapped value.
 */
export function map(
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  withinBounds: boolean = false,
): number {
  const newValue =
    ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newValue;
  }
  if (start2 < stop2) {
    return Math.max(Math.min(newValue, stop2), start2);
  } else {
    return Math.max(Math.min(newValue, start2), stop2);
  }
}

export function isActionCardInfo(card: GameCardInfo): card is ActionCardInfo {
  return card.type === "action";
}

export function reviveCardModifier(indice: CardModifierIndice): CardModifier {
  // @ts-expect-error C'est normal
  return cardModifiers[indice[0]](...indice[1]);
}

export function parseSave(save: string) {
  return JSON.parse(save, (key, value) => {
    if (typeof value === "object") {
      switch (key) {
        case "discard":
        case "draw":
        case "hand":
          return value.map((card: GameCardInfo) => {
            return {
              ...card,
              state: "idle",
              effect: {
                ...card.effect,
                template: effects[card.effect.index]?.template,
                onPlayed: card.effect.upgrade
                  ? async (state) => await state.upgrade(card.name)
                  : effects[card.effect.index]?.onPlayed,
                condition: effects[card.effect.index]?.condition,
              },
            } as GameCardInfo;
          });
        case "upgrades":
          return value.map((upgrade: Upgrade) => {
            return {
              ...upgrade,
              state: "idle",
              onTrigger: upgrades.find((u) => u.name === upgrade.name)
                ?.onTrigger,
              condition: upgrades.find((u) => u.name === upgrade.name)
                ?.condition,
            } as Upgrade;
          });
        case "operationInProgress":
          return [];
      }
    }

    if (key === "isOperationInProgress") {
      return false;
    }

    return value;
  });
}
