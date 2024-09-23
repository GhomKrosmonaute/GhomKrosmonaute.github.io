import {
  ADVANTAGE_THRESHOLD,
  ENERGY_TO_MONEY,
  GAME_ADVANTAGE,
  LOCAL_ADVANTAGE,
  MAX_ENERGY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  UPGRADE_COST_THRESHOLDS,
} from "@/game-constants.ts"

import type {
  ActionCardFamily,
  ActionCardInfo,
  ColorClass,
  Cost,
  DynamicEffectValue,
  Effect,
  EffectBuilder,
  GameCardIndice,
  GameCardInfo,
  GameCardState,
  GameLog,
  GameResource,
  LocalAdvantage,
  GameResolvable,
  RawUpgrade,
  StateDependentValue,
  Upgrade,
  UpgradeIndice,
} from "@/game-typings.ts"

import { defaultSettings } from "@/game-settings.ts"

import type { Settings } from "@/game-typings.ts"

import type { GameState, GlobalGameState } from "@/hooks/useCardGame.ts"

export async function fetch<T>(importer: Promise<{ default: T }>): Promise<T> {
  return importer.then((m) => m.default)
}

export const families: ActionCardFamily[] = [
  "Jeu vidéo",
  "TypeScript",
  "React",
  "Bot Discord",
  "Open Source",
  "Outil",
  "Serveur Discord",
  "Site web",
  "PlayCurious",
]

export function formatText(text: string) {
  const x = (keyword: `@${string}`) =>
    new RegExp(`${keyword}([^\\s.:,)<>"]*)`, "g")

  const sharedStyles = [
    "display: inline-block",
    "transform: translateZ(3px)",
    "font-weight: bold",
  ]

  return text
    .replace(
      /(\(.+?\))/g,
      `<span style="position: relative; transform-style: preserve-3d; display: inline-block; width: 0; height: 0.8em;">
        <span style="
          position: absolute; 
          font-size: 12px; 
          white-space: nowrap;
          top: 0;
          ${sharedStyles[0]};
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
      new RegExp(`#(${families.join("|")})`, "g"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--action)); white-space: nowrap;" title="Famille $1">#$1</span>`,
    )
    .replace(
      x("@action"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--action));">Action$1</span>`,
    )
    .replace(
      x("@reputation"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--reputation));">Réputation$1</span>`,
    )
    .replace(
      x("@upgrade"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--upgrade));">Amélioration$1</span>`,
    )
    .replace(
      x("@sprint"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--upgrade));">Sprint$1</span>`,
    )
    .replace(
      x("@support"),
      `<span style="${sharedStyles.join(";")}; background-color: hsla(var(--support) / 0.5); color: hsl(var(--support-foreground)); padding: 0 6px; border-radius: 4px;">Support$1</span>`,
    )
    .replace(
      x("@energy"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--energy));">Énergie$1</span>`,
    )
    .replace(
      x("@day"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--day));">Jour$1</span>`,
    )
    .replace(
      x("@inflation"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--inflation));">Inflation$1</span>`,
    )
    .replace(
      x("@level"),
      `<span style="${sharedStyles.join(";")}; color: hsl(var(--inflation));">Niveau$1</span>`,
    )
    .replace(
      x("@recycle"),
      `<span style="${sharedStyles.join(";")};" title="Déplace le sujet de la défausse vers la pioche">Recycle$1</span>`,
    )
    .replace(
      x("@giveBack"),
      `<span style="${sharedStyles.join(";")};" title="Renvoie le sujet dans la pioche">Rend$1</span>`,
    )
    .replace(
      /((?:[\de+.]+|<span[^>]*>[\de+.]+<\/span>)[MB]\$)/g,
      `<span 
        style="
          ${sharedStyles[0]};
          ${sharedStyles[1]};
          background-color: hsl(var(--money)); 
          color: hsl(var(--money-foreground));
          padding: 0 4px; 
          border: 1px hsl(var(--money-foreground)) solid; 
          font-family: Changa, sans-serif;
          font-size: 0.8em;"
        >
          $1
        </span>`,
    )
    .replace(
      /<muted>(.+)<\/muted>/g,
      `<span style="filter: grayscale(100%) opacity(50%)">$1</span>`,
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
    .replace(/$s/g, cumul > 1 ? "s" : "")
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

export function pick<T extends object, K extends keyof T>(
  item: T,
  ...keys: K[]
): Pick<T, K> {
  const clone = {} as Pick<T, K>
  for (const key of keys) {
    clone[key] = item[key]
  }
  return clone
}

export function calculateLocalAdvantage(
  localAdvantage: LocalAdvantage,
  state: GameState & GlobalGameState,
) {
  return (
    localAdvantage.initial + GAME_ADVANTAGE[state.difficulty] - state.inflation
  )
}

export function isGameResource(option: GameResolvable): option is GameResource {
  return (
    Array.isArray(option) &&
    option.length === 4 &&
    typeof option[3] === "string"
  )
}

export function isGameCardIndice(
  option: GameResolvable,
): option is GameCardIndice {
  return /^\[".+","[a-z]+",\{"initial":\d+,"current":\d+}]$/.test(
    JSON.stringify(option),
  )
}

export function isGameCardInfo(
  option: GameResolvable,
): option is GameCardInfo<true> {
  return typeof option === "object" && "effect" in option
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

export function updateGameAutoSpeed(
  state: GameState,
  upgrades: RawUpgrade[],
): number {
  const upgradeCompletion = state.upgrades.length / upgrades.length
  const moneyCompletion = state.money / MONEY_TO_REACH
  const completion = upgradeCompletion * 0.5 + moneyCompletion * 0.5

  // 50ms to 500ms - Plus on est avancé dans la partie, plus c'est rapide
  const speed = Math.floor(50 + 450 * (1 - completion))

  document.documentElement.style.setProperty("--game-auto-speed", `${speed}ms`)

  return speed
}

export function isNewSprint(day: number) {
  return Math.floor(day) !== 0 && Math.floor(day) % 7 === 0
}

export function isGameWon(state: GameState): boolean {
  return !state.infinityMode && !state.isWon && state.money >= MONEY_TO_REACH
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

/**
 * Generate a random advantage from LOCAL_ADVANTAGE (represents rarities)
 * Each rarity has a different probability to be selected
 */
export function generateRandomAdvantage(): LocalAdvantage {
  let advantage: number = LOCAL_ADVANTAGE.common

  const seed = Math.random()

  if (seed < 0.015) advantage = LOCAL_ADVANTAGE.cosmic
  else if (seed < 0.04) advantage = LOCAL_ADVANTAGE.legendary
  else if (seed < 0.12) advantage = LOCAL_ADVANTAGE.epic
  else if (seed < 0.3) advantage = LOCAL_ADVANTAGE.rare

  return {
    initial: advantage,
    current: advantage,
  }
}

export function generateRandomResource(state: GameState): GameResource {
  const type = Math.random()
  const id = Math.random().toFixed(6)

  if (type < 0.48) {
    const { current } = generateRandomAdvantage()
    return [id, "drawing", 50 * Math.max(1, current), "money"]
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

export function getDeck(
  state: Pick<GameState, "draw" | "discard" | "hand">,
): GameCardIndice[] {
  return [...state.draw, ...state.discard, ...state.hand]
}

export function getRevivedDeck(
  state: Pick<GameState, "revivedDraw" | "revivedDiscard" | "revivedHand">,
): GameCardInfo<true>[] {
  return [...state.revivedDraw, ...state.revivedDiscard, ...state.revivedHand]
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

export function save(state: GameState & GlobalGameState) {
  localStorage.setItem(
    "save",
    JSON.stringify(
      omit(state, ...gameStateExcluded) satisfies Omit<
        GameState,
        (typeof gameStateExcluded)[number]
      >,
      (_, value) => {
        return typeof value === "function" ? undefined : value
      },
    ),
  )
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

  state.revivedHand = []
  state.revivedDraw = []
  state.revivedDiscard = []

  return state
}

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
  if (value < min && value > max) return { value: 0, rest: value, s: "" }
  if (value < min)
    return { value: min, rest: value - min, s: min > 1 ? "s" : "" }
  if (value > max)
    return { value: max, rest: value - max, s: max > 1 ? "s" : "" }
  return { value, rest: 0, s: value > 1 ? "s" : "" }
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

export function createEffect<Data extends any[]>(
  options: Partial<Omit<Effect<Data>, "description" | "onPlayed" | "cost">> & {
    basePrice?: number
    /**
     * Description of the effect <br>
     * Use $n to replace with the value of the effect <br>
     * Use $$ to replace with the value of the effect in money <br>
     * Use $s to add an "s" if the value is greater than 1
     */
    description?: string
    select?: (
      state: GameState & GlobalGameState,
      card: GameCardInfo<true>,
      testedCard: GameCardInfo<true>,
    ) => boolean
    onPlayed?: (
      this: { value?: number },
      state: GameState & GlobalGameState,
      card: GameCardInfo<true>,
      reason: GameLog["reason"],
      ...data: Data
    ) => Promise<unknown>
    costType?: Cost["type"]
    skipEnergyGain?: boolean
    dynamicEffect?: DynamicEffectValue
  },
): EffectBuilder<Data> {
  return (advantage = 0, state = fakeMegaState) => {
    const computed = computeEffect({
      basePrice: options.basePrice,
      skipEnergyGain: options.skipEnergyGain,
      dynamicEffect: options.dynamicEffect,
      noDescription: !options.description,
      advantage,
      state,
    })

    return {
      description: formatText(
        options.description
          ? (options.dynamicEffect
              ? computed.effect
                ? options.description
                    .replace(/\$n/g, String(computed.effect.value))
                    .replace(
                      /\$\$/g,
                      `${computed.effect.value * ENERGY_TO_MONEY}M$`,
                    )
                    .replace(/\$s/g, computed.effect.value > 1 ? "s" : "")
                : `<muted>${options.description
                    .replace(
                      /\$n/g,
                      String(_val(options.dynamicEffect.min, state) ?? 1),
                    )
                    .replace(
                      /\$\$/g,
                      String(
                        (_val(options.dynamicEffect.min, state) ?? 1) *
                          ENERGY_TO_MONEY,
                      ),
                    )
                    .replace(/\$s/g, "")}</muted>`
              : options.description) + computed.description
          : computed.description,
      ),
      condition: options.select
        ? (state, card) =>
            state.revivedHand.some((testedCard) =>
              options.select!(state, card, testedCard),
            )
        : undefined,
      prePlay: options.select
        ? async (state, card) => {
            const selected = await state.waitCardSelection({
              from: state.revivedHand.filter((testedCard) =>
                options.select!(state, card, testedCard),
              ),
            })

            if (!selected) {
              return "cancel"
            } else {
              return [selected] as any
            }
          }
        : undefined,
      onPlayed: async (state, card, reason, ...data) => {
        await options.onPlayed?.bind({ value: computed.effect?.value })(
          state,
          card,
          reason,
          ...data,
        )
        await computed.onPlayed(state, reason)
      },
      cost: {
        type: options.costType ?? "energy",
        value:
          options.costType === "money"
            ? computed.price.value * ENERGY_TO_MONEY
            : computed.price.value,
      },
      ...omit(
        options,
        "description",
        "onPlayed",
        "dynamicEffect",
        "basePrice",
        "costType",
        "onPlayed",
        "select",
        "skipEnergyGain",
      ),
    }
  }
}

export function _val<T>(
  value: StateDependentValue<T>,
  state: GameState & GlobalGameState,
): T {
  return typeof value === "function" ||
    value instanceof Function ||
    (typeof value === "object" && value && "call" in value)
    ? (value as (state: GameState & GlobalGameState) => T)(state)
    : (value as T)
}

export function computeEffect(options: {
  advantage: number
  state: GameState & GlobalGameState
  basePrice?: number
  skipEnergyGain?: boolean
  noDescription?: boolean
  dynamicEffect?: DynamicEffectValue
}) {
  const basePrice = options.basePrice ?? 0
  const dynamic = options.dynamicEffect
    ? {
        min: _val(options.dynamicEffect.min, options.state) ?? 1,
        max: _val(options.dynamicEffect.max, options.state) ?? Infinity,
        cost: _val(options.dynamicEffect.cost, options.state),
      }
    : undefined

  const price = smartClamp(basePrice - options.advantage)

  const isEffectPossible = dynamic ? dynamic.max > dynamic.min : false

  const effect =
    dynamic && isEffectPossible
      ? smartClamp(
          dynamic.min + Math.floor(Math.abs(price.rest) / dynamic.cost),
          dynamic.min,
          dynamic.max,
        )
      : price

  if (dynamic) effect.rest = effect.rest * dynamic.cost

  const energyGain = smartClamp(
    dynamic && isEffectPossible ? effect.rest : Math.abs(effect.rest),
    0,
    options.skipEnergyGain ? 0 : Math.floor(options.state.energyMax / 2),
  )

  const moneyGain = energyGain.rest * ENERGY_TO_MONEY

  return {
    description: computeEffectDescription({
      nothingBefore: options.noDescription,
      energy: energyGain,
      money: moneyGain,
    }),
    onPlayed: (state: GameState & GlobalGameState, reason: GameLog["reason"]) =>
      computeEffectOnPlayed({
        energy: energyGain,
        money: moneyGain,
        state,
        reason,
      }),
    price,
    effect: dynamic && isEffectPossible ? effect : undefined,
  }
}

export function computeEffectDescription(options: {
  nothingBefore?: boolean
  energy?: { value: number; rest: number; s: string }
  money?: number
}) {
  const before = options.nothingBefore ? "" : "<hr>"
  if (
    (!options.energy || options.energy.value <= 0) &&
    (!options.money || options.money <= 0)
  )
    return ""
  if (!options.energy || options.energy.value <= 0)
    return `${before}Gagne ${options.money}M$`
  if (!options.money || options.money <= 0)
    return `${before}Gagne ${options.energy.value} @energy${options.energy.s}`

  return options.energy.value > 0
    ? `${before}Gagne ${options.energy.value} @energy${options.energy.s}${
        options.money > 0 ? ` et ${options.money}M$` : ""
      }`
    : ""
}

export async function computeEffectOnPlayed(options: {
  state: GameState
  reason: GameLog["reason"]
  energy?: { value: number }
  money?: number
}) {
  if (options.energy && options.energy.value > 0) {
    await options.state.addEnergy(options.energy.value, {
      skipGameOverPause: true,
      reason: options.reason,
    })
  }

  if (options.money && options.money > 0) {
    await options.state.addMoney(options.money, {
      skipGameOverPause: true,
      reason: options.reason,
    })
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

export function canBeBuy(card: GameCardInfo<true>, state: GameState) {
  const usableCost = getUsableCost(card.effect.cost, state)
  return card.effect.cost.type === "money"
    ? state.money >= usableCost
    : state.energy + state.reputation >= usableCost
}

export const fakeState: GameState = {
  cardDetail: null,
  setCardDetail: () => {},
  addEnergy: async () => {},
  addGlobalCardModifier: async () => {},
  addLog: () => {},
  addMaxEnergy: async () => {},
  addMoney: async () => {},
  addNotification: async () => {},
  addReputation: async () => {},
  advanceTime: async () => {},
  choiceOptionCount: 0,
  choiceOptions: [],
  coinFlip: async () => {},
  coinFlips: 0,
  dangerouslyUpdate: () => {},
  day: 0,
  dayFull: false,
  defeat: () => {},
  difficulty: "normal",
  discard: [],
  discardCard: async () => {},
  discardedCards: 0,
  draw: [],
  drawCard: async () => {},
  enableInfinityMode: () => {},
  energy: 0,
  energyMax: MAX_ENERGY,
  error: null,
  globalCardModifiers: [],
  hand: [],
  handleError: (t) => t,
  increments: async () => {},
  incrementsInflation: () => {},
  infinityMode: false,
  inflation: 0,
  isGameOver: false,
  isWon: false,
  logs: [],
  money: 0,
  screenMessages: [],
  operationInProgress: [],
  pickOption: async () => {},
  playCard: async () => {},
  playZone: [],
  reason: null,
  recycleCard: async () => {},
  recycledCards: 0,
  removeCard: async () => {},
  reputation: 0,
  requestedCancel: false,
  reset: () => {},
  revivedDiscard: [],
  revivedDraw: [],
  revivedHand: [],
  score: 0,
  selectCard: () => {},
  selectedCard: null,
  setOperationInProgress: () => {},
  skip: async () => {},
  skippedChoices: 0,
  sprintFull: false,
  triggerEvent: async () => {},
  triggerUpgrade: async () => {},
  updateScore: () => {},
  upgrade: async () => {},
  upgrades: [],
  waitCardSelection: async () => null,
  win: () => {},
}

export const fakeGlobalState: GlobalGameState = {
  achievements: [],
  addAchievement: async () => {},
  addDiscovery: () => {},
  addPlayedGame: () => {},
  addWonGame: () => {},
  checkAchievements: async () => {},
  checkDiscoveries: () => {},
  debug: false,
  discoveries: [],
  playedGames: 0,
  scoreAverage: 0,
  setDebug: () => {},
  totalMoney: 0,
  wonGames: 0,
}

export const fakeMegaState: GameState & GlobalGameState = {
  ...fakeState,
  ...fakeGlobalState,
}

export const gameStateExcluded = [
  "revivedHand",
  "revivedDraw",
  "revivedDiscard",
  ...(Object.keys(fakeGlobalState) as (keyof GlobalGameState)[]),
] as const

export function rankColor(rank: number) {
  return {
    "text-upgrade": rank === 0,
    "text-zinc-400": rank === 1,
    "text-orange-600": rank === 2,
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

export function getRarityName(localAdvantage: number, full: true): string
export function getRarityName(
  localAdvantage: number,
  full?: false,
): keyof typeof LOCAL_ADVANTAGE
export function getRarityName(localAdvantage: number, full = false) {
  let rarityName = Object.entries(LOCAL_ADVANTAGE)
    .sort((a, b) => b[1] - a[1])
    .find(
      ([, advantage]) => localAdvantage >= advantage,
    )![0] as keyof typeof LOCAL_ADVANTAGE

  if (full)
    rarityName +=
      localAdvantage > LOCAL_ADVANTAGE[rarityName]
        ? "+".repeat(
            Math.floor(
              Math.max(0, localAdvantage - LOCAL_ADVANTAGE[rarityName]) /
                ADVANTAGE_THRESHOLD,
            ),
          )
        : ""

  return rarityName
}
