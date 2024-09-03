import type { CardGameState } from "@/hooks/useCardGame";
import events from "@/data/events.ts";
import React from "react";

export interface Upgrade {
  type: "upgrade";
  name: string;
  description: string;
  image: string;
  eventName: TriggerEventName;
  condition?: (state: CardGameState, upgrade: Upgrade) => boolean;
  onTrigger: (
    state: CardGameState,
    upgrade: Upgrade,
    reason: GameLog["reason"],
  ) => Promise<unknown>;
  cost: number | string;
  state: "appear" | "idle" | "triggered";
  cumul: number;
  max: number;
}

export interface Effect {
  index: number;
  description: string;
  type: "action" | "support";
  cost: number | string;
  template?: (
    state: CardGameState,
    card: GameCardInfo,
    condition: boolean,
  ) => string;
  condition?: (state: CardGameState, card: GameCardInfo) => boolean;
  onPlayed: (
    state: CardGameState,
    card: GameCardInfo,
    reason: GameLog["reason"],
  ) => Promise<unknown>;
  waitBeforePlay?: boolean;
  ephemeral?: boolean;
  upgrade?: boolean;
}

export interface ActionCardInfo {
  type: "action";
  name: string;
  image: string;
  effect: Effect;
  state: GameCardState;
  description?: string;
  detail?: string;
  url?: string;
}

export interface SupportCardInfo {
  type: "support";
  name: string;
  image: string;
  effect: Effect;
  state: GameCardState;
}

export type GameCardState =
  | "selected"
  | "playing"
  | "discarding"
  | "drawing"
  | "unauthorized"
  | "removing"
  | "removed"
  | "idle"
  | null;

export type GameCardInfo = ActionCardInfo | SupportCardInfo;

export type CardModifier = {
  condition?: (card: GameCardInfo, state: CardGameState) => boolean;
  use: (card: GameCardInfo, state: CardGameState) => GameCardInfo;
  once?: boolean;
};

export type CardModifierIndice = [name: string, params: unknown[]];

export type TriggerEventName = keyof typeof events;

export type TriggerEvent = {
  name: string;
  icon: React.FunctionComponent<React.ComponentProps<"div">>;
  colors?: ColorClass | [ColorClass, ColorClass];
};

export type GameOverReason = "mill" | "soft-lock" | "reputation" | null;

export type GameLog = {
  type: "money" | "reputation" | "energy";
  value: number;
  reason: GameCardInfo | Upgrade | string;
};

export type MethodWhoCheckIfGameOver = {
  skipGameOverPause?: boolean;
};

export type MethodWhoLog = {
  reason: GameLog["reason"];
};

export type GameMethodOptions = MethodWhoCheckIfGameOver & MethodWhoLog;

export type ColorClass = `bg-${string}` & string;

export type MaskState = "appear" | "idle" | "disappear";

export type Mask = {
  x: number;
  y: number;
  width: number;
  height: number;
  state: MaskState;
};
