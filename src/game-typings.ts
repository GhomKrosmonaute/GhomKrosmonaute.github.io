import type { GameState } from "@/hooks/useCardGame"
import events from "@/data/events.ts"
import React from "react"

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

export type EffectBuilder<Data extends any[]> = (
  advantage: number,
  state: GameState,
  card?: Omit<GameCardInfo<true>, "effect">,
) => Effect<Data>

export type Cost = {
  value: number
  type: "money" | "energy"
}

export interface Effect<Data extends any[]> {
  description: string
  cost: Cost
  condition?: (state: GameState, card: GameCardInfo<true>) => boolean
  prePlay?: (
    state: GameState,
    card: GameCardInfo<true>,
  ) => Promise<Data | "cancel">
  onPlayed: (
    state: GameState,
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
  condition?: (
    this: CardModifier,
    card: GameCardInfo<true>,
    state: GameState,
  ) => boolean
  use: (card: GameCardInfo<true>, state: GameState) => GameCardInfo<true>
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
  index: number,
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
  type: "money" | "reputation" | "energy"
  value: number
  reason: GameCardIndice | UpgradeIndice | string
}

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
