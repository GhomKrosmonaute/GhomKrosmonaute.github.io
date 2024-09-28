import type React from "react"

import type { GameState, GlobalGameState } from "@/hooks/useCardGame.tsx"

import { GAME_ADVANTAGE, LOCAL_ADVANTAGE } from "@/game-constants.ts"

import events from "@/data/events.tsx"
import { GlobalCardModifierIndex, Speed } from "@/game-enums.ts"
import { pick, tags } from "@/game-safe-utils.tsx"
import type cardModifiers from "@/data/cardModifiers.ts"

export type RarityName = keyof typeof LOCAL_ADVANTAGE

export interface QualityOptions {
  shadows: boolean // ajoute les ombres
  transparency: boolean // backgrounds transparents
  borderLights: boolean // ajoute les lumières sur les bords
  godRays: boolean // ajoute les god rays
  blur: boolean // background blur sur toutes les cartes du site
  tilt: boolean // utilise Tilt ou non (agis sur cardFoil et cardPerspective)
  foil: boolean // montre le reflet et la texture des cartes ou non
  animations: boolean // utilise les keyframes ou non
  perspective: boolean // transformStyle: "preserve-3d" | "flat"
}

export interface Settings {
  theme: string
  tutorial: boolean
  speed: Speed
  difficulty: Difficulty
  quality: QualityOptions
}

export type Difficulty = keyof typeof GAME_ADVANTAGE

export type UpgradeState = "appear" | "idle" | "triggered"

export interface Upgrade {
  type: "upgrade"
  name: string
  description: (cumul: number) => React.ReactNode
  image: string
  eventName: TriggerEventName
  condition?: (state: GameState, upgrade: Upgrade) => boolean
  onTrigger: (
    state: GameState,
    upgrade: Upgrade,
    reason: GameLog["reason"],
  ) => Promise<unknown>
  cost: Cost
  state: UpgradeState
  cumul: number
  max: number
  tags: (keyof typeof tags)[]
}

export type UpgradeCompact = Pick<Upgrade, "cumul" | "state" | "name">

export function compactUpgrade(upgrade: Upgrade): UpgradeCompact {
  return pick(upgrade, "cumul", "state", "name")
}

export type RawUpgrade = Pick<
  Upgrade,
  | "tags"
  | "name"
  | "image"
  | "onTrigger"
  | "cost"
  | "condition"
  | "eventName"
  | "description"
> & {
  max?: number
}

/**
 * @param advantage Represent the result of the calcul of the card advantage: <br>
 * `localAdvantage + difficulty - inflation`
 */
export type EffectBuilder<Data extends any[]> = (
  advantage?: number,
  state?: GameState & GlobalGameState,
  card?: Omit<GameCardInfo<true>, "effect">,
) => Effect<Data>

export type Cost = {
  value: number
  type: "money" | "energy"
}

export interface Effect<Data extends any[]> {
  description: React.ReactNode
  hint?: React.ReactNode
  cost: Cost
  condition?: (
    state: GameState & GlobalGameState,
    card: GameCardInfo<true>,
  ) => boolean
  prePlay?: (
    state: GameState & GlobalGameState,
    card: GameCardInfo<true>,
  ) => Promise<Data | "cancel">
  onPlayed: (
    state: GameState & GlobalGameState,
    card: GameCardInfo<true>,
    reason: GameLog["reason"],
    ...data: Data
  ) => Promise<unknown>
  needsPlayZone?: boolean
  waitBeforePlay?: boolean
  tags: (keyof typeof tags)[]
}

export type CommonCardInfo<Resolved = false> = {
  name: string
  image: string
} & (Resolved extends true
  ? {
      effect: Effect<any[]>
      state: GameCardState
      rarity: number
      readonly initialRarity: number
    }
  : {
      effect: EffectBuilder<any[]>
    })

export type ActionCardInfo<Resolved = false> = {
  type: "action"
  families: ActionCardFamily[]
  description?: string
  detail?: string
  url?: string
} & CommonCardInfo<Resolved>

export type SupportCardInfo<Resolved = false> = {
  type: "support"
} & CommonCardInfo<Resolved>

export type GameCardState =
  | "landing"
  | "selected"
  | "playing"
  | "discarding"
  | "drawing"
  | "unauthorized"
  | "removing"
  | "removed"
  | "idle"
  | "highlighted"
  | null

export type ActionCardFamily =
  | "Bot Discord"
  | "Serveur Discord"
  | "Jeu vidéo"
  | "Site web"
  | "Outil"
  | "TypeScript"
  | "React"
  | "PlayCurious"
  | "Open Source"

export type GameCardInfo<Resolved = false> =
  | ActionCardInfo<Resolved>
  | SupportCardInfo<Resolved>

export function isGameCardInfo(
  option: GameResolvable,
): option is GameCardInfo<true> {
  return "effect" in option && typeof option.effect !== "function"
}

export type GameCardCompact = Pick<
  GameCardInfo<true>,
  "name" | "state" | "initialRarity"
>

export function compactGameCardInfo(
  card: GameCardInfo<true>,
  newState?: GameCardState,
): GameCardCompact {
  return {
    name: card.name,
    state: newState ?? card.state,
    initialRarity: card.initialRarity,
  }
}

export interface GameResource {
  id: string
  state: GameCardState
  value: number
  type: "money" | "reputation" | "energy"
}

export function isGameResource(option: GameResolvable): option is GameResource {
  return "id" in option && "value" in option && "type" in option
}

export function isGameCardCompact(
  option: GameResolvable,
): option is GameCardCompact {
  return (
    "name" in option &&
    "state" in option &&
    "initialRarity" in option &&
    Object.keys(option).length === 3
  )
}

export type CardModifier = {
  index: GlobalCardModifierIndex
  condition?: (
    this: CardModifier,
    card: GameCardInfo<true>,
    state: GameState & GlobalGameState,
  ) => boolean
  use: (
    card: GameCardInfo<true>,
    state: GameState & GlobalGameState,
    raw: GameCardInfo,
  ) => GameCardInfo<true>
  once?: boolean
}

export type CardModifierCompact<Name extends keyof typeof cardModifiers> = {
  name: Name
  params: Parameters<(typeof cardModifiers)[Name]>
  reason: GameModifierLog["reason"]
}

export type GameResolvable =
  | GameCardCompact
  | GameResource
  | GameCardInfo
  | GameCardInfo<true>
  | UpgradeCompact

export type TriggerEventName = keyof typeof events

export type TriggerEvent = {
  name: React.ReactNode
  icon: React.FunctionComponent<React.ComponentProps<"div">>
  colors?: ColorClass | [ColorClass, ColorClass]
}

export type GameOverReason =
  | "mill"
  | "soft-lock"
  | "mill-lock"
  | "reputation"
  | null

export type GameLog = {
  type: "money" | "reputation" | "energy" | "level"
  value: number
  reason: GameCardCompact | UpgradeCompact | string
}

export type GameModifierLog = { reason: GameCardCompact | React.ReactNode } & (
  | {
      type: "localAdvantage"
      before: number
      after: number
    }
  | {
      type: "cost"
      before: Cost
      after: Cost
    }
)

export type ScreenMessageOptions = {
  id: number
  header?: string
  message: React.ReactNode
  className: ColorClass
}

export type MethodWhoCheckIfGameOver = {
  skipGameOverPause?: boolean
}

export type MethodWhoLog = {
  reason: GameLog["reason"]
}

export type GameMethodOptions = MethodWhoCheckIfGameOver & MethodWhoLog

export type CoinFlipSide = {
  message: React.ReactNode
  onTrigger: (
    state: GameState,
    card: GameCardInfo<true>,
    reason: GameLog["reason"],
  ) => Promise<void>
}

export type CoinFlipOptions<Resolved extends boolean> = {
  head: Resolved extends true
    ? CoinFlipSide
    : (advantage: number) => CoinFlipSide
  tail: Resolved extends true
    ? CoinFlipSide
    : (advantage: number) => CoinFlipSide
}

export type ColorClass = `bg-${string}` & string

export type StateDependentValue<T> =
  | T
  | ((state: GameState & GlobalGameState) => T)

export interface DynamicEffectValue {
  cost: StateDependentValue<number>
  min?: StateDependentValue<number>
  max?: StateDependentValue<number>
}

export interface ChoiceOptionsGeneratorOptions {
  exclude?: string[]
  filter?: (card: GameCardInfo, state: GameState) => boolean
  noResource?: boolean
  header: React.ReactNode
}

export interface ChoiceOptions {
  header: React.ReactNode
  options: (GameCardCompact | GameResource)[]
}
