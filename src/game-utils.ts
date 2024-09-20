import type { GameState, GlobalGameState } from "@/hooks/useCardGame"

import type {
  Cost,
  Upgrade,
  ColorClass,
  RawUpgrade,
  CardModifier,
  GameCardInfo,
  GameCardState,
  UpgradeIndice,
  ActionCardInfo,
  GameOverReason,
  GameCardIndice,
  CardModifierIndice,
  GameResource,
} from "@/game-typings"

import {
  MAX_HAND_SIZE,
  GAME_ADVANTAGE,
  MONEY_TO_REACH,
  ENERGY_TO_MONEY,
  LOCAL_ADVANTAGE,
  INFINITE_DRAW_COST,
  UPGRADE_COST_THRESHOLDS,
  MAX_REPUTATION,
} from "@/game-constants"

import { defaultSettings, Settings } from "@/game-settings.ts"

import cardModifiers from "@/data/cardModifiers.ts"

import generateCards from "@/data/cards.ts"
import generateUpgrades from "@/data/upgrades.ts"

export enum GlobalCardModifierIndex {
  First = 0,
  AddOrSubtract = 1,
  MultiplyOrDivide = 2,
  Last = 3,
}

export function omit<T extends object, K extends keyof T>(
  item: T,
  ...keys: K[]
): Omit<T, K> {
  const clone = { ...item }
  for (const key of keys) {
    delete clone[key]
  }
  return clone
}

export function isGameCardIndice(input: object): input is GameCardIndice {
  return /^\[".+","[a-z]+",\d+]$/.test(JSON.stringify(input))
}

/**
 * Return a new list of cards without the given card(s)
 * @param from initial list of cards
 * @param cardName card(s) to exclude
 */
export function excludeCard(
  from: GameCardIndice[],
  cardName: string | string[],
): GameCardIndice[] {
  const toExclude: string[] =
    typeof cardName === "string" ? [cardName] : cardName
  return from.filter((c) => !toExclude.includes(c[0]))
}

export function includeCard(
  from: GameCardIndice[],
  cardName: string | string[],
): GameCardIndice[] {
  const toInclude: string[] =
    typeof cardName === "string" ? [cardName] : cardName
  return from.filter((c) => toInclude.includes(c[0]))
}

/**
 * Update the state of a card in a list of cards
 */
export function updateCardState<T extends (GameCardIndice | GameResource)[]>(
  from: T,
  newState: GameCardState,
): T
export function updateCardState<T extends (GameCardIndice | GameResource)[]>(
  from: T,
  cardName: string | string[],
  newState: GameCardState,
): T
export function updateCardState<T extends (GameCardIndice | GameResource)[]>(
  from: T,
  cardName: string | string[] | GameCardState,
  newState?: GameCardState,
): T {
  if (arguments.length === 2) {
    return from.map((c) => {
      return isGameResource(c)
        ? [c[0], cardName as GameCardState, c[2], c[3]]
        : [c[0], cardName as GameCardState, c[2]]
    }) as T
  } else {
    const toUpdate: string[] =
      typeof cardName === "string" ? [cardName] : cardName!
    return from.map((c) => {
      if (toUpdate.includes(c[0]))
        return isGameResource(c)
          ? [c[0], newState!, c[2], c[3]]
          : [c[0], newState!, c[2]]
      return c
    }) as T
  }
}

export function cardInfoToIndice(
  card: GameCardInfo<true>,
  newState?: GameCardState,
): GameCardIndice {
  return [card.name, newState ?? card.state, card.localAdvantage]
}

export function upgradeToIndice(upgrade: Upgrade): UpgradeIndice {
  return [upgrade.name, upgrade.cumul, upgrade.state]
}

export function log<T>(label: string, items: T): T {
  if (import.meta.env.DEV) console.log(label, items)
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
  const speed = Math.floor(50 + 450 * (1 - completion))

  document.documentElement.style.setProperty("--game-auto-speed", `${speed}ms`)

  return speed
}

export function getGameSpeed(): number {
  return log(
    "anim",
    Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--game-speed")
        .replace("ms", ""),
    ),
  )
}

export function handleErrors(
  getState: () => {
    handleError: (error: Error) => void
  },
  cb: () => void,
) {
  try {
    cb()
  } catch (error) {
    getState().handleError(error as Error)
  }
}

export async function handleErrorsAsync(
  getState: () => {
    handleError: (error: Error) => void
  },
  cb: () => Promise<void>,
) {
  try {
    await cb()
  } catch (error) {
    getState().handleError(error as Error)
  }
}

interface ChoiceOptionsGeneratorOptions {
  exclude?: string[]
  filter?: (card: GameCardInfo, state: GameState) => boolean
  noResource?: boolean
}

/**
 * Generate a random advantage from LOCAL_ADVANTAGE (represents rarities)
 * Each rarity has a different probability to be selected
 */
export function generateRandomAdvantage(): number {
  const seed = Math.random()
  if (seed < 0.01) return LOCAL_ADVANTAGE.legendary
  if (seed < 0.1) return LOCAL_ADVANTAGE.epic
  if (seed < 0.2) return LOCAL_ADVANTAGE.rare
  return LOCAL_ADVANTAGE.common
}

export function generateRandomResource(state: GameState): GameResource {
  const type = Math.random()
  const id = Math.random().toFixed(6)

  if (type < 0.48) {
    const quantity = generateRandomAdvantage()
    return [id, "drawing", 50 * Math.max(1, quantity), "money"]
  } else if (type < 0.96) {
    const rdm = Math.random()
    return [
      id,
      "drawing",
      rdm < 0.6 ? Math.floor(state.energyMax / 2) : state.energyMax,
      "energy",
    ]
  } else {
    const rdm = Math.random()
    return [
      id,
      "drawing",
      rdm < 0.6 ? Math.floor(MAX_REPUTATION / 2) : MAX_REPUTATION,
      "reputation",
    ]
  }
}

export function generateChoiceOptions(
  state: GameState & GlobalGameState,
  options?: ChoiceOptionsGeneratorOptions,
): (GameCardIndice | GameResource)[] {
  state.setOperationInProgress("choices", true)

  const _cards: (GameCardInfo | GameResource)[] = state.cards.filter(
    (card) =>
      (state.choiceOptions.length === 0 ||
        state.choiceOptions.every(
          (o) =>
            o.length === 0 ||
            o.every((i) => !isGameResource(i) && i[0] !== card.name),
        )) &&
      (state.draw.length === 0 ||
        state.draw.every(([name]) => name !== card.name)) &&
      (state.discard.length === 0 ||
        state.discard.every(([name]) => name !== card.name)) &&
      (state.hand.length === 0 ||
        state.hand.every(([name]) => name !== card.name)) &&
      (!options?.exclude ||
        options?.exclude?.every((name) => name !== card.name)) &&
      (!options?.filter || options?.filter?.(card, state)) &&
      (!card.effect(0, state).upgrade ||
        state.upgrades.length === 0 ||
        state.upgrades.every((u) => {
          const up = reviveUpgrade(u, state)
          return up.name !== card.name || up.cumul < up.max
        })),
  )

  if (_cards.length < state.choiceOptionCount) {
    while (_cards.length < state.choiceOptionCount) {
      _cards.push(generateRandomResource(state))
    }
  } else if (!options?.noResource) {
    const length = _cards.length
    for (let i = 0; i < Math.ceil(length / 10); i++) {
      _cards.push(generateRandomResource(state))
    }
  }

  return shuffle(_cards, 3)
    .slice(0, state.choiceOptionCount)
    .map((option) =>
      isGameResource(option)
        ? option
        : [option.name, "drawing", generateRandomAdvantage()],
    )
}

export function getDeck(
  state: Pick<GameState, "draw" | "discard" | "hand">,
): GameCardIndice[] {
  return [...state.draw, ...state.discard, ...state.hand]
}

export function energyCostColor(
  state: Pick<GameState, "energy">,
  cost: number,
): ColorClass | [ColorClass, ColorClass] {
  return state.energy >= cost
    ? "bg-energy"
    : state.energy > 0
      ? ["bg-energy", "bg-reputation"]
      : "bg-reputation"
}

export function isGameResource<T>(option: T): option is T & GameResource {
  return (
    Array.isArray(option) &&
    option.length === 4 &&
    typeof option[3] === "string"
  )
}

export function isNewSprint(day: number) {
  return Math.floor(day) !== 0 && Math.floor(day) % 7 === 0
}

export function isGameWon(state: GameState): boolean {
  return !state.infinityMode && !state.isWon && state.money >= MONEY_TO_REACH
}

export function isGameOver(
  state: GameState & GlobalGameState,
): GameOverReason | false {
  if (state.reputation === 0) return "reputation"
  if (state.draw.length === 0 && state.hand.length === 0) return "mill"
  if (
    state.hand.every((c) => {
      const card = reviveCard(c, state)

      // on vérifie si la condition s'il y en
      if (card.effect.condition && !card.effect.condition(state, card))
        return true

      // on vérifie si on a assez de resources
      return !canBeBuy(card, state)
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

export function getUsableCost(cost: Cost, state: GameState): number {
  return Math.max(
    0,
    Math.min(cost.type === "energy" ? state.energyMax : Infinity, cost.value),
  )
}

export function resolveCost(resolvable: number | string): Cost {
  return {
    type: typeof resolvable === "number" ? "energy" : "money",
    value: Number(resolvable),
  }
}

export function costToEnergy(cost: Cost): number {
  return cost.type === "money"
    ? Math.ceil(cost.value / ENERGY_TO_MONEY)
    : cost.value
}

export function costToMoney(cost: Cost): number {
  return cost.type === "money"
    ? cost.value
    : Math.ceil(cost.value * ENERGY_TO_MONEY)
}

export function costTo(cost: Cost, type: "money" | "energy"): number {
  return cost.type === type
    ? cost.value
    : cost.type === "money"
      ? costToEnergy(cost)
      : costToMoney(cost)
}

export function getUpgradeCost(
  state: GameState,
  card: GameCardInfo<true>,
): Cost {
  const index = state.upgrades.length

  const priceThreshold =
    UPGRADE_COST_THRESHOLDS[card.effect.cost.type][index] ?? Infinity

  return {
    value: Math.min(priceThreshold, card.effect.cost.value),
    type: card.effect.cost.type,
  }
}

/**
 * Clone an object and stringify it to remove functions
 * @param something
 */
export function stringifyClone<T>(something: T): T {
  return JSON.parse(
    JSON.stringify(something, (_key, value) =>
      typeof value === "function" ? undefined : value,
    ),
  )
}

/**
 * Clone an object recursively
 * @param something
 */
export function recursiveClone<T>(something: T): T {
  if (something === null || something === undefined) return something
  if (typeof something === "function") return something
  if (typeof something !== "object") return something
  if (Array.isArray(something)) {
    return something.map((value) => recursiveClone(value)) as unknown as T
  }
  const cloned = Object.create(Object.getPrototypeOf(something))
  for (const key in something) {
    cloned[key] = recursiveClone(something[key])
  }
  return cloned
}

export function applyGlobalCardModifiers(
  state: GameState,
  card: GameCardInfo<true>,
  clean = false,
): GameCardInfo<true> {
  const modifiers = state.globalCardModifiers.toSorted((a, b) => {
    return a[2] - b[2]
  })

  for (const indice of modifiers) {
    const modifier = reviveCardModifier(indice)

    if (modifier.condition && !modifier.condition(card, state)) continue

    card = modifier.use(card, state)

    if (clean && modifier.once)
      state.dangerouslyUpdate({
        globalCardModifiers: state.globalCardModifiers.filter(
          (m) => m !== indice,
        ),
      })
  }

  return card
}

export function canBeBuy(card: GameCardInfo<true>, state: GameState) {
  const usableCost = getUsableCost(card.effect.cost, state)
  return card.effect.cost.type === "money"
    ? state.money >= usableCost
    : state.energy + state.reputation >= usableCost
}

export function willBeRemoved(state: GameState, card: GameCardInfo<true>) {
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
      `<span style="position: relative; transform-style: preserve-3d; display: inline-block; width: 0; height: 0.8em;">
        <span style="
          display: inline-block;
          position: absolute; 
          font-size: 12px; 
          white-space: nowrap;
          top: 0;
          transform: rotate(5deg) translateX(-50%) translateY(-30%) translateZ(5px);">$1</span>
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

export function formatCoinFlipText(options: { heads: string; tails: string }) {
  return formatText(
    `Lance une pièce. <br/> Face: ${options.heads} <br/> Pile: ${options.tails}`,
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

// /**
//  * Convert a list of actions to a human-readable text
//  * @param actions
//  */
// export function actionsToText(actions): string {}

export function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function smartClamp(
  value: number,
  min = 0,
  max = Infinity,
): {
  value: number
  rest: number
  s: string
} {
  if (value < min)
    return { value: min, rest: value - min, s: min > 1 ? "s" : "" }
  if (value > max)
    return { value: max, rest: value - max, s: max > 1 ? "s" : "" }
  return { value, rest: 0, s: value > 1 ? "s" : "" }
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

export function getSortedHand(hand: GameCardIndice[], state: GameState) {
  return hand
    .map((i) => reviveCard(i, state))
    .toSorted((a, b) => {
      // trier par type de carte (action ou support) puis par type de prix (énergie ou $) puis par prix puis par description de l'effet
      const typeA = a.effect.type === "action" ? 1 : 0
      const typeB = b.effect.type === "action" ? 1 : 0
      const priceA = a.effect.cost.type === "money" ? 1 : 0
      const priceB = b.effect.cost.type === "money" ? 1 : 0
      const costA = a.effect.cost.value
      const costB = b.effect.cost.value
      const effect = a.effect.description.localeCompare(b.effect.description)
      return typeA - typeB || priceA - priceB || costA - costB || effect
    })
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

export function isActionCardInfo(
  card: GameCardInfo<true>,
): card is ActionCardInfo<true> {
  return card.type === "action"
}

export function reviveCardModifier(indice: CardModifierIndice): CardModifier {
  // @ts-expect-error C'est normal
  return cardModifiers[indice[0]](...indice[1])
}

export function reviveCard(
  indice: GameCardIndice | string,
  state: GameState,
  clean?: boolean,
): GameCardInfo<true> {
  const card = state.cards.find((c) =>
    typeof indice === "string" ? c.name === indice : c.name === indice[0],
  )

  if (!card) throw new Error(`Card ${indice} not found`)

  const output: Omit<GameCardInfo<true>, "effect"> = {
    ...card,
    type: card.type,
    state: typeof indice !== "string" ? indice[1] : null,
    localAdvantage:
      typeof indice !== "string" ? indice[2] : LOCAL_ADVANTAGE.common,
  }

  return applyGlobalCardModifiers(
    state,
    {
      ...output,
      effect: card.effect(
        Math.max(
          0,
          GAME_ADVANTAGE[state.difficulty] +
            (typeof indice !== "string" ? indice[2] : LOCAL_ADVANTAGE.common) -
            state.inflation,
        ),
        state,
        output,
      ),
    },
    clean,
  )
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

export function parseSave(save: string) {
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

  state.cards = generateCards(state)
  state.rawUpgrades = generateUpgrades()
  state.revivedHand = []

  return state
}
