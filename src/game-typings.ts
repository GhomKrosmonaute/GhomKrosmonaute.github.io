import React from "react"

import type { GameState, GlobalGameState } from "@/hooks/useCardGame"

import { GAME_ADVANTAGE } from "@/game-constants.ts"

import events from "@/data/events.ts"
import { GlobalCardModifierIndex, Speed } from "@/game-enums.ts"

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

export type UpgradeIndice = [name: string, cumul: number, state: UpgradeState]

export interface Upgrade {
  type: "upgrade"
  name: string
  description: string
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
}

export type RawUpgrade = Pick<
  Upgrade,
  | "name"
  | "description"
  | "image"
  | "onTrigger"
  | "cost"
  | "condition"
  | "eventName"
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
  description: string
  hint?: string
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
  ephemeral?: boolean
  recycle?: boolean
  upgrade?: boolean
}

export interface ActionCardInfo<Resolved = false> {
  type: "action"
  name: string
  image: string
  families: ActionCardFamily[]
  effect: Resolved extends true ? Effect<any[]> : EffectBuilder<any[]>
  state: Resolved extends true ? GameCardState : null
  localAdvantage: Resolved extends true ? number : null
  description?: string
  detail?: string
  url?: string
}

export interface SupportCardInfo<Resolved = false> {
  type: "support"
  name: string
  image: string
  effect: Resolved extends true ? Effect<any[]> : EffectBuilder<any[]>
  state: Resolved extends true ? GameCardState : null
  localAdvantage: Resolved extends true ? number : null
}

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

export type GameResource = [
  id: string,
  state: GameCardState,
  value: number,
  type: "money" | "reputation" | "energy",
]

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

export type GameCardIndice = [
  name: string,
  state: GameCardState,
  localAdvantage: number,
]

export type CardModifierIndice = [
  name: string,
  params: unknown[],
  reason: GameModifierLog["reason"],
]

export type TriggerEventName = keyof typeof events

export type TriggerEvent = {
  name: string
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
  reason: GameCardIndice | UpgradeIndice | string
}

export type GameModifierLog = { reason: GameCardIndice | string } & (
  | {
      type: "level"
      before: number
      after: number
    }
  | {
      type: "cost"
      before: Cost
      after: Cost
    }
)

export type GameNotification = {
  header?: string
  message: string
  className: ColorClass
}

export type MethodWhoCheckIfGameOver = {
  skipGameOverPause?: boolean
}

export type MethodWhoLog = {
  reason: GameLog["reason"]
}

export type GameMethodOptions = MethodWhoCheckIfGameOver & MethodWhoLog

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
}
