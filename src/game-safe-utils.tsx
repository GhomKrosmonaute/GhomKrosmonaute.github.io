import React from "react"

import {
  ADVANTAGE_THRESHOLD,
  ENERGY_TO_MONEY,
  GAME_ADVANTAGE,
  RARITIES,
  MAX_ENERGY,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  UPGRADE_COST_THRESHOLDS,
} from "@/game-constants.ts"

import {
  ActionCardFamily,
  ActionCardInfo,
  ColorClass,
  Cost,
  DynamicEffectValue,
  Effect,
  EffectBuilder,
  GameCardCompact,
  GameCardInfo,
  GameCardState,
  GameLog,
  GameResource,
  isGameResource,
  RarityName,
  RawUpgrade,
  StateDependentValue,
  Upgrade,
  UpgradeCompact,
} from "@/game-typings.ts"

import { defaultSettings } from "@/game-settings.ts"

import type { Settings } from "@/game-typings.ts"

import type { GameState, GlobalGameState } from "@/hooks/useCardGame.tsx"
import { Money, Muted, Tag } from "@/components/game/Texts.tsx"

export const extractTextFromReactNode = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    // Si le noeud est une chaîne ou un nombre, on le retourne tel quel
    return node.toString()
  }

  if (Array.isArray(node)) {
    // Si le noeud est un tableau (par exemple un fragment), on parcourt chaque élément
    return node.map(extractTextFromReactNode).join("")
  }

  if (React.isValidElement(node)) {
    // Si le noeud est un élément React, on extrait le texte des children
    return extractTextFromReactNode(node.props.children)
  }

  // Sinon, on retourne une chaîne vide pour les autres types de noeuds (null, undefined, etc.)
  return ""
}

export function includesSome<T>(array: T[], ...values: T[]): boolean {
  return values.some((value) => array.includes(value))
}

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

export const tags = {
  ephemeral: {
    name: "Éphémère",
    plural: "s",
    description: "Une carte Éphémère se détruit lorsqu'elle est jouée",
    className: "text-muted-foreground",
  },
  recyclage: {
    name: "Recyclage",
    plural: "s",
    description:
      "Une carte Recyclage retourne dans la pioche lorsqu'elle est jouée",
    className: "text-muted-foreground",
  },
  token: {
    name: "Token",
    plural: "s",
    description:
      "Les changements de niveau n'ont aucun effet sur les cartes Token",
    className: "text-muted-foreground",
  },
  upgrade: {
    name: "Amélioration",
    plural: "s",
    description: "Ajoute un effet permanent à la partie",
  },
  action: {
    name: "Action",
    plural: "s",
    description:
      "Une carte Action représente un projet sur lequel Ghom a travaillé. Jouez-la pour obtenir des ressources.",
  },
  support: {
    name: "Support",
    plural: "s",
    description:
      "Les cartes Support représentent des technologies que Ghom utilise pour ses projets. Elles permettent de gérer les cartes.",
  },
  energy: {
    name: "Énergie",
    plural: "s",
    description: "L'énergie est une ressource pour jouer des cartes",
  },
  reputation: {
    name: "Réputation",
    plural: "s",
    description:
      "La réputation est une ressource pour jouer des cartes, si elle s'épuise, vous perdez la partie",
  },
  day: {
    name: "Jour",
    plural: "s",
    description:
      "Chaque jour, vous gagnez une carte, le temps avance lorsque vous jouez des cartes",
  },
  sprint: {
    name: "Sprint",
    plural: "s",
    description:
      "Un sprint est une période de 7 jours. A la fin d'un sprint, vous gagnez des cartes",
  },
  inflation: {
    name: "Inflation",
    plural: "s",
    description:
      "L'inflation augmente le niveau de difficulté du jeu tous les 28 jours",
    className: "text-inflation",
  },
  level: {
    name: "Niveau",
    plural: "x",
    description: "Le niveau d'une carte agis sur sa rareté et sa puissance",
    className: "text-inflation",
  },
  draw: {
    name: "Pioche",
    description: "Retire une carte de la pioche et l'ajoute à ta main",
  },
  discard: {
    name: "Défausse",
    description: "Retire une carte de ta main et la place dans la défausse",
  },
  recycle: {
    name: "Recycle",
    plural: "nt",
    description: "Déplace le sujet de la défausse vers la pioche",
    className: "text-foreground",
  },
  giveBack: {
    name: "Rend",
    description: "Renvoie le sujet dans la pioche",
    className: "text-foreground",
  },
  pick: {
    name: "Choisi",
    description: "Choisi une carte a ajouter à ton deck",
    className: "text-foreground",
  },
  coinFlip: {
    name: "Lance une pièce",
    description: "Lance une pièce pour obtenir un effet aléatoire",
    className: "text-foreground",
  },
  destroy: {
    name: "Détruit",
    description: "Retire le sujet du deck",
    className: "bg-destructive text-destructive-foreground",
  },
  money: {
    name: "Argent",
    description:
      "L'argent est la ressource principale du jeu, elle peut servir a jouer certaines cartes.",
    className: "bg-money text-money-foreground",
  },
} satisfies Record<
  string,
  {
    name: string
    description: string
    plural?: string
    className?: string
  }
>

export function formatCoinFlipText(options: {
  heads: React.ReactNode
  tails: React.ReactNode
}) {
  return (
    <>
      <Tag name="coinFlip" />. <br />
      Face: {options.heads} <br />
      Pile: {options.tails}
    </>
  )
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

export function calculateRarityAdvantage(
  initialRarity: number,
  state: GameState & GlobalGameState,
) {
  return initialRarity + GAME_ADVANTAGE[state.difficulty]
}

/**
 * Return a new list of cards without the given card(s)
 * @param from initial list of cards
 * @param cardName card(s) to exclude
 */
export function excludeCard(
  from: GameCardCompact[],
  cardName: string | string[],
): GameCardCompact[] {
  const toExclude: string[] =
    typeof cardName === "string" ? [cardName] : cardName
  return from.filter((c) => !toExclude.includes(c.name))
}

/**
 * Return a new list of cards with only the given card(s)
 * @param from initial list of cards
 * @param cardName card(s) to include
 */
export function includeCard(
  from: GameCardCompact[],
  cardName: string | string[],
): GameCardCompact[] {
  const toInclude: string[] =
    typeof cardName === "string" ? [cardName] : cardName
  return from.filter((c) => toInclude.includes(c.name))
}

/**
 * Update the state of a card in a list of cards
 */
export function updateCardState<T extends (GameCardCompact | GameResource)[]>(
  from: T,
  newState: GameCardState,
): T
export function updateCardState<T extends (GameCardCompact | GameResource)[]>(
  from: T,
  cardName: string | string[],
  newState: GameCardState,
): T
export function updateCardState<T extends (GameCardCompact | GameResource)[]>(
  from: T,
  cardName: string | string[] | GameCardState,
  newState?: GameCardState,
): T {
  if (arguments.length === 2) {
    return from.map((c) => {
      return { ...c, state: cardName as GameCardState }
    }) as T
  } else {
    const toUpdate: string[] =
      typeof cardName === "string" ? [cardName] : cardName!
    return from.map((c) => {
      if (toUpdate.includes(isGameResource(c) ? c.id : c.name))
        return { ...c, state: newState! }
      return c
    }) as T
  }
}
export function updateUpgradeState(
  from: UpgradeCompact[],
  upgradeName: Upgrade["state"],
): UpgradeCompact[]
export function updateUpgradeState(
  from: UpgradeCompact[],
  upgradeName: string,
  newState: Upgrade["state"],
): UpgradeCompact[]
export function updateUpgradeState(
  from: UpgradeCompact[],
  upgradeName: string | Upgrade["state"],
  newState?: Upgrade["state"],
): UpgradeCompact[] {
  if (arguments.length === 2) {
    return from.map((u) => {
      return { ...u, state: upgradeName as Upgrade["state"] }
    })
  } else {
    return from.map((u) => {
      return u.name === upgradeName ? { ...u, state: newState! } : u
    })
  }
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

export function isReactNode(node: any): node is React.ReactNode {
  if (node === null || node === undefined) {
    return true // null ou undefined sont valides en tant que ReactNode
  }

  // Vérifier les types primitifs que ReactNode peut être
  if (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "boolean"
  ) {
    return true
  }

  // Vérifier si c'est un élément React
  if (React.isValidElement(node)) {
    return true
  }

  if (typeof node === "object" && "key" in node && "props" in node) return true

  // Vérifier si c'est un tableau de ReactNodes
  return Array.isArray(node) && !node.some((i) => !isReactNode(i))
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
export function generateRandomAdvantage(): number {
  let advantage: number = RARITIES.common

  const seed = Math.random()

  if (seed < 0.015) advantage = RARITIES.cosmic
  else if (seed < 0.04) advantage = RARITIES.legendary
  else if (seed < 0.12) advantage = RARITIES.epic
  else if (seed < 0.3) advantage = RARITIES.rare

  return advantage
}

export function generateRandomResource(state: GameState): GameResource {
  const type = Math.random()
  const id = Math.random().toFixed(6)

  if (type < 0.48) {
    const advantage = generateRandomAdvantage()

    return {
      id,
      type: "money",
      state: "drawing",
      value: 50 * Math.max(1, advantage),
    }
  } else if (type < 0.96) {
    const rdm = Math.random()

    return {
      id,
      state: "drawing",
      value: rdm < 0.6 ? Math.floor(state.energyMax / 2) : state.energyMax,
      type: "energy",
    }
  } else {
    const rdm = Math.random()
    return {
      id,
      state: "drawing",
      value: rdm < 0.6 ? Math.floor(MAX_REPUTATION / 2) : MAX_REPUTATION,
      type: "reputation",
    }
  }
}

export function getDeck(
  state: Pick<GameState, "draw" | "discard" | "hand">,
): GameCardCompact[] {
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

export async function waitFor(callback: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (callback()) {
        clearInterval(interval)
        resolve()
      }
    }, getGameSpeed())
  })
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
  plural: boolean
} {
  if (value < min && value > max)
    return { value: 0, rest: value, plural: false }
  if (value < min) return { value: min, rest: value - min, plural: min > 1 }
  if (value > max) return { value: max, rest: value - max, plural: max > 1 }
  return { value, rest: 0, plural: value > 1 }
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

export function resolveSubTypes(effect: Effect<any>) {
  return (["ephemeral", "recyclage", "upgrade", "token"] as const).filter(
    (subType) => effect.tags.includes(subType),
  )
}

export function createEffect<
  Data extends any[],
  Dynamic extends DynamicEffectValue | never,
>(
  options: Partial<Omit<Effect<Data>, "description" | "onPlayed" | "cost">> & {
    basePrice?: number
    /**
     * Description of the effect <br>
     * Use $n to replace with the value of the effect <br>
     * Use $$ to replace with the value of the effect in money <br>
     * Use $s to add an "s" if the value is greater than 1
     */
    description?:
      | React.ReactNode
      | ((
          ctx: Dynamic extends DynamicEffectValue
            ? { value: number; plural: boolean }
            : undefined,
        ) => React.ReactNode)
    select?: (
      state: GameState & GlobalGameState,
      card: GameCardInfo<true>,
      testedCard: GameCardInfo<true>,
    ) => boolean
    onPlayed?: (
      this: Dynamic extends DynamicEffectValue ? { value: number } : never,
      state: GameState & GlobalGameState,
      card: GameCardInfo<true>,
      reason: GameLog["reason"],
      ...data: Data
    ) => Promise<unknown>
    costType?: Cost["type"]
    skipEnergyGain?: boolean
    dynamicEffect?: Dynamic
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

    // @ts-expect-error DynamicEffectValue is never
    const description:
      | ((ctx?: { value: number; plural: boolean }) => React.ReactNode)
      | null = options.description
      ? typeof options.description === "function"
        ? options.description
        : () => options.description
      : null

    return {
      description: (
        <>
          {description &&
            (options.dynamicEffect ? (
              computed.effect ? (
                description({
                  value: computed.effect.value,
                  plural: computed.effect.value > 1,
                })
              ) : (
                <Muted>
                  {description({
                    value: _val(options.dynamicEffect.min, state) ?? 1,
                    plural: false,
                  })}
                </Muted>
              )
            ) : (
              description()
            ))}
          {computed.description}
        </>
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
        // @ts-expect-error DynamicEffectValue is never
        await options.onPlayed?.bind(
          // @ts-expect-error DynamicEffectValue is never
          options.dynamicEffect ? { value: computed.effect!.value } : undefined,
        )(state, card, reason, ...data)
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
        "tags",
      ),
      tags: options.tags ?? [],
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
  energy?: { value: number; rest: number; plural: boolean }
  money?: number
}): React.ReactNode {
  if (
    (!options.energy || options.energy.value <= 0) &&
    (!options.money || options.money <= 0)
  )
    return null

  const before: React.ReactNode = options.nothingBefore ? null : <hr />

  if (!options.energy || options.energy.value <= 0)
    return (
      <>
        {before}Gagne <Money M$={options.money!} />
      </>
    )

  if (!options.money || options.money <= 0)
    return (
      <>
        {before}Gagne {options.energy.value}{" "}
        <Tag name="energy" plural={options.energy.plural} />
      </>
    )

  return options.energy.value > 0 ? (
    <>
      {before}Gagne {options.energy.value}{" "}
      <Tag name="energy" plural={options.energy.plural} />
      {options.money > 0 ? (
        <>
          {" "}
          et <Money M$={options.money} />
        </>
      ) : null}
    </>
  ) : null
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
  transformCardsAnimation: async () => {},
  setCardDetail: () => {},
  addEnergy: async () => {},
  addGlobalCardModifier: async () => {},
  addLog: () => {},
  addMaxEnergy: async () => {},
  addMoney: async () => {},
  addScreenMessage: async () => {},
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
  screenMessageQueue: [],
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
export function getRarityName(localAdvantage: number, full?: false): RarityName
export function getRarityName(localAdvantage: number, full = false) {
  let rarityName: RarityName = "singularity"
  let lastName: RarityName = "common"

  for (const name in RARITIES) {
    const advantage = RARITIES[name as RarityName]

    if (advantage === localAdvantage) {
      rarityName = name as RarityName
      break
    } else if (advantage > localAdvantage) {
      rarityName = lastName
      break
      // lastName = name as keyof typeof LOCAL_ADVANTAGE
    }

    lastName = name as RarityName
  }

  if (full)
    return (
      rarityName +
      (localAdvantage > RARITIES[rarityName]
        ? "+".repeat(
            Math.floor(
              Math.max(0, localAdvantage - RARITIES[rarityName]) /
                ADVANTAGE_THRESHOLD,
            ),
          )
        : rarityName === "common" && localAdvantage < 0
          ? "-".repeat(
              Math.floor(Math.max(0, -localAdvantage) / ADVANTAGE_THRESHOLD),
            )
          : "")
    )

  return rarityName
}
