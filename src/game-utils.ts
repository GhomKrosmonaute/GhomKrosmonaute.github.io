import type { GlobalGameState, GameState } from "@/hooks/useCardGame"

import type {
  ActionCardInfo,
  CardModifier,
  CardModifierIndice,
  ColorClass,
  GameCardIndice,
  GameCardInfo,
  GameOverReason,
  RawUpgrade,
  Upgrade,
  UpgradeIndice,
} from "@/game-typings"

import {
  ENERGY_TO_MONEY,
  GAME_ADVANTAGE,
  INFINITE_DRAW_COST,
  MAX_HAND_SIZE,
  MONEY_TO_REACH,
  UPGRADE_COST_THRESHOLDS,
} from "@/game-constants"

import { defaultSettings, Difficulty, Settings } from "@/game-settings.ts"

import cardModifiers from "@/data/cardModifiers.ts"

import generateCards from "@/data/cards.ts"
import generateUpgrades from "@/data/upgrades.ts"

export enum GlobalCardModifierIndex {
  First = 0,
  AddOrSubtract = 1,
  MultiplyOrDivide = 2,
  Last = 3,
}

export function log<T>(items: T): T {
  if (import.meta.env.DEV) console.log(items)
  return items
}

export function fetchSettings(): Settings {
  return localStorage.getItem("settings")
    ? JSON.parse(localStorage.getItem("settings")!)
    : defaultSettings
}

export function updateGameAutoSpeed(state: GameState): number {
  const upgradeCompletion = state.upgrades.length / state.rawUpgrades.length
  const moneyCompletion = state.money / MONEY_TO_REACH
  const completion = upgradeCompletion * 0.5 + moneyCompletion * 0.5

  // 50ms to 500ms - Plus on est avancé dans la partie, plus c'est rapide
  const speed = Math.floor(50 + 950 * (1 - completion))

  document.documentElement.style.setProperty("--game-auto-speed", `${speed}ms`)

  return speed
}

export function getGameSpeed(): number {
  return log(
    Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--game-speed")
        .replace("ms", ""),
    ),
  )
}

export function handleErrors(
  getState: () => {
    throwError: (error: Error) => void
  },
  cb: () => void,
) {
  try {
    cb()
  } catch (error) {
    getState().throwError(error as Error)
  }
}

export async function handleErrorsAsync(
  getState: () => {
    throwError: (error: Error) => void
  },
  cb: () => Promise<void>,
) {
  try {
    await cb()
  } catch (error) {
    getState().throwError(error as Error)
  }
}

interface ChoiceOptionsGeneratorOptions {
  exclude?: string[]
  filter?: (card: GameCardInfo, state: GameState) => boolean
}

export function generateChoiceOptions(
  state: GameState & GlobalGameState,
  options?: ChoiceOptionsGeneratorOptions,
): GameCardIndice[] {
  state.setOperationInProgress("choices", true)

  const _cards = state.cards.filter(
    (card) =>
      (state.choiceOptions.length === 0 ||
        state.choiceOptions.every(
          (o) => o.length === 0 || o.every((i) => i[0] !== card.name),
        )) &&
      (state.draw.length === 0 ||
        state.draw.every((name) => name !== card.name)) &&
      (state.discard.length === 0 ||
        state.discard.every((name) => name !== card.name)) &&
      (state.hand.length === 0 ||
        state.hand.every(([name]) => name !== card.name)) &&
      (!options?.exclude ||
        options?.exclude?.every((name) => name !== card.name)) &&
      (!options?.filter || options?.filter?.(card, state)) &&
      (!card.effect.upgrade ||
        state.upgrades.length === 0 ||
        state.upgrades.every((u) => {
          const up = reviveUpgrade(u, state)
          return up.name !== card.name || up.cumul < up.max
        })),
  )

  if (_cards.length === 0) {
    return []
  }

  // todo: add random rarity to selected cards

  const outputOptions: string[] = shuffle(_cards, 3)
    .slice(0, state.choiceOptionCount)
    .map((c) => c.name)

  return outputOptions.map((name) => [name, "drawing"])
}

export function getDeck(state: GameState): GameCardIndice[] {
  return [
    ...[...state.draw, ...state.discard].map<GameCardIndice>((name) => [
      name,
      null,
    ]),
    ...state.hand,
  ]
}

export function energyCostColor(
  state: GameState,
  cost: number,
): ColorClass | [ColorClass, ColorClass] {
  return state.energy >= cost
    ? "bg-energy"
    : state.energy > 0
      ? ["bg-energy", "bg-reputation"]
      : "bg-reputation"
}

export function isNewSprint(day: number) {
  return Math.floor(day) !== 0 && Math.floor(day) % 7 === 0
}

export function isGameWon(state: GameState): boolean {
  return !state.infinityMode && !state.isWon && state.money >= MONEY_TO_REACH
}

export function isGameOver(state: GameState): GameOverReason | false {
  if (state.reputation === 0) return "reputation"
  if (state.draw.length === 0 && state.hand.length === 0) return "mill"
  if (
    state.hand.every((c) => {
      const card = reviveCard(c, state)

      // on vérifie si la condition s'il y en
      if (card.effect.condition && !card.effect.condition(state, card))
        return true

      // on vérifie si on a assez de resources
      return !parseCost(state, card, []).canBeBuy
    }) &&
    (state.reputation + state.energy < INFINITE_DRAW_COST ||
      state.hand.length >= MAX_HAND_SIZE ||
      state.draw.length === 0)
  )
    return state.draw.length === 0 ? "mill-lock" : "soft-lock"

  return false
}

export function rankColor(rank: number) {
  return {
    "text-upgrade": rank === 0,
    "text-zinc-400": rank === 1,
    "text-orange-600": rank === 2,
  }
}

export function getUpgradeCost(
  state: GameState,
  card: GameCardInfo,
): number | string {
  const index = state.upgrades.length

  const priceThreshold =
    UPGRADE_COST_THRESHOLDS[typeof card.effect.cost as "string" | "number"][
      index
    ] ?? Infinity

  return (typeof card.effect.cost == "string" ? String : Number)(
    Math.min(Number(priceThreshold), Number(card.effect.cost)),
  )
}

export function updateCost<T extends string | number>(
  cost: T,
  modifier: (energyCost: number) => number,
): T {
  const energyCost =
    typeof cost === "string" ? Number(cost) / ENERGY_TO_MONEY : (cost as number)
  const newEnergyCost = modifier(energyCost)
  return (typeof cost === "string" ? String : Number)(
    typeof cost === "string" ? newEnergyCost * ENERGY_TO_MONEY : newEnergyCost,
  ) as T
}

export function cloneSomething<T>(something: T): T {
  return JSON.parse(
    JSON.stringify(something, (_key, value) =>
      typeof value === "function" ? undefined : value,
    ),
  )
}

export function applyGlobalCardModifiers(
  state: GameState,
  card: GameCardInfo,
  used: string[],
): { card: GameCardInfo; appliedModifiers: CardModifierIndice[] } {
  const clone = cloneSomething(card)
  const modifiers = state.globalCardModifiers.slice().toSorted((a, b) => {
    return a[2] - b[2]
  })

  return modifiers.reduce<{
    card: GameCardInfo
    appliedModifiers: CardModifierIndice[]
  }>(
    (previousValue, indice) => {
      const stringIndice = JSON.stringify(indice)

      if (used.includes(stringIndice)) return previousValue
      else used.push(stringIndice)

      const modifier = reviveCardModifier(indice)

      return !modifier.condition ||
        modifier.condition(previousValue.card, state)
        ? {
            card: modifier.use(previousValue.card, state),
            appliedModifiers: [...previousValue.appliedModifiers, indice],
          }
        : previousValue
    },
    { card: clone, appliedModifiers: [] },
  )
}

export function parseCost(
  state: GameState,
  card: GameCardInfo,
  used: string[],
) {
  const { card: tempCard, appliedModifiers } = applyGlobalCardModifiers(
    state,
    card,
    used,
  )
  const needs = typeof tempCard.effect.cost === "number" ? "energy" : "money"
  const cost = Number(tempCard.effect.cost)
  const canBeBuy =
    needs === "money"
      ? state[needs] >= cost
      : state[needs] + state.reputation >= cost

  return { needs, cost, canBeBuy, appliedModifiers } as const
}

export function willBeRemoved(state: GameState, card: GameCardInfo) {
  if (card.effect.ephemeral) return true

  if (card.effect.upgrade) {
    const rawUpgrade = state.rawUpgrades.find((u) => u.name === card.name)!

    if (rawUpgrade.max) {
      if (rawUpgrade.max === 1) return true

      const indice = state.upgrades.find((u) => u[0] === card.name)

      if (!indice) return false

      const upgrade = reviveUpgrade(indice, state)

      return upgrade.cumul >= upgrade.max - 1
    }
  }

  return false
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
      const amount = Number(n)

      return amount >= 1000
        ? `${(amount / 1000).toFixed(2).replace(".00", "").replace(/\.0\b/, "")}B$`
        : `${amount}M$`
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
      /@inflation([^\s.:,)]*)/g,
      '<span style="color: hsl(var(--inflation)); transform: translateZ(5px); font-weight: bold;">Inflation$1</span>',
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
    )
}

export function formatUpgradeText(text: string, cumul: number) {
  return text
    .replace(
      /@cumul/g,
      `<span style="color: #f59e0b; font-weight: bold">${cumul}</span>`,
    )
    .replace(/@s/g, cumul > 1 ? "s" : "")
}

export async function wait(ms?: number) {
  return new Promise((resolve) => setTimeout(resolve, ms ?? getGameSpeed()))
}

export async function waitAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

export function shuffle<T>(cards: T[], times = 1): T[] {
  for (let i = 0; i < times; i++) {
    cards.sort(() => Math.random() - 0.5)
  }
  return cards
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
    ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
  if (!withinBounds) {
    return newValue
  }
  if (start2 < stop2) {
    return Math.max(Math.min(newValue, stop2), start2)
  } else {
    return Math.max(Math.min(newValue, start2), stop2)
  }
}

export function isActionCardInfo(card: GameCardInfo): card is ActionCardInfo {
  return card.type === "action"
}

export function reviveCardModifier(indice: CardModifierIndice): CardModifier {
  // @ts-expect-error C'est normal
  return cardModifiers[indice[0]](...indice[1])
}

export function reviveCard(
  indice: GameCardIndice | string,
  state: { cards: GameCardInfo[] },
): GameCardInfo {
  const card = state.cards.find((c) =>
    typeof indice === "string" ? c.name === indice : c.name === indice[0],
  )

  if (!card) throw new Error(`Card ${indice} not found`)

  if (typeof indice !== "string") card.state = indice[1]

  return card
}

export function reviveUpgrade(
  indice: UpgradeIndice | string,
  state: { rawUpgrades: RawUpgrade[] },
): Upgrade {
  const raw = state.rawUpgrades.find((u) =>
    typeof indice === "string" ? u.name === indice : u.name === indice[0],
  )

  if (!raw) throw new Error(`Upgrade ${indice} not found`)

  return {
    ...raw,
    type: "upgrade",
    state: typeof indice !== "string" ? indice[2] : "appear",
    cumul: typeof indice !== "string" ? indice[1] : 1,
    max: raw.max ?? Infinity,
  }
}

export function parseSave(save: string, difficulty: Difficulty) {
  const baseAdvantage = GAME_ADVANTAGE[difficulty]

  const state: GameState & GlobalGameState = {
    ...JSON.parse(save, (key, value) => {
      if (typeof value === "object") {
        switch (key) {
          case "operationInProgress":
            return []
        }
      }

      if (key === "isOperationInProgress") {
        return false
      }

      return value
    }),
  }

  state.cards = generateCards(baseAdvantage - state.inflation)
  state.rawUpgrades = generateUpgrades(baseAdvantage - state.inflation)

  return state
}
