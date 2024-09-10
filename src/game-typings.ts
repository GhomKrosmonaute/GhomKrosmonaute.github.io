import type { GameState } from "@/hooks/useCardGame";
import events from "@/data/events.ts";
import React from "react";

export type UpgradeState = "appear" | "idle" | "triggered";

export type UpgradeIndice = [name: string, cumul: number, state: UpgradeState];

export interface Upgrade {
  type: "upgrade";
  name: string;
  description: string;
  image: string;
  eventName: TriggerEventName;
  condition?: (state: GameState, upgrade: Upgrade) => boolean;
  onTrigger: (
    state: GameState,
    upgrade: Upgrade,
    reason: GameLog["reason"],
  ) => Promise<unknown>;
  cost: number | string;
  state: UpgradeState;
  cumul: number;
  max: number;
}

export interface Effect {
  index: number;
  description: string;
  type: "action" | "support";
  cost: number | string;
  template?: (
    state: GameState,
    card: GameCardInfo,
    condition: boolean,
  ) => string;
  condition?: (state: GameState, card: GameCardInfo) => boolean;
  onPlayed: (
    state: GameState,
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
  condition?: (card: GameCardInfo, state: GameState) => boolean;
  use: (card: GameCardInfo, state: GameState) => GameCardInfo;
  once?: boolean;
};

export type GameCardIndice = [name: string, state: GameCardState];

export type CardModifierIndice = [name: string, params: unknown[]];

export type TriggerEventName = keyof typeof events;

export type TriggerEvent = {
  name: string;
  icon: React.FunctionComponent<React.ComponentProps<"div">>;
  colors?: ColorClass | [ColorClass, ColorClass];
};

export type GameOverReason =
  | "mill"
  | "soft-lock"
  | "mill-lock"
  | "reputation"
  | null;

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
