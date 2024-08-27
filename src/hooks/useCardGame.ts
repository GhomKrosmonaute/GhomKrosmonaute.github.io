import { bank, music, musicId } from "@/sound.ts";
import { create } from "zustand";

import {
  ENERGY_TO_MONEY,
  GAME_ADVANTAGE,
  INFINITE_DRAW_COST,
  MAX_ENERGY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  REPUTATION_TO_ENERGY,
  TRIGGER_EVENTS,
  UPGRADE_COST_THRESHOLDS,
} from "@/game-constants.ts";

import { metadata } from "@/game-metadata.ts";
import { settings } from "@/game-settings.ts";

import technos from "@/data/techno.json";
import projects from "@/data/projects.json";
import effects from "@/data/effects.ts";
import upgrades from "@/data/upgrades.ts";
import cardModifiers from "@/data/cardModifiers.ts";

export interface Upgrade {
  name: string;
  description: string;
  image: string;
  triggerEvent: TriggerEvent;
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
  | "played"
  | "dropped"
  | "drawn"
  | "unauthorized"
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

export type TriggerEvent = keyof typeof TRIGGER_EVENTS;

export type GameOverReason = "mill" | "soft-lock" | "reputation" | null;

export type GameLog = {
  type: "money" | "reputation" | "energy";
  value: number;
  reason: GameCardInfo | Upgrade | string;
};

type MethodWhoCheckIfGameOver = {
  skipGameOverPause?: boolean;
};

type MethodWhoLog = {
  reason: GameLog["reason"];
};

type GameMethodOptions = MethodWhoCheckIfGameOver & MethodWhoLog;

export interface CardGameState {
  logs: GameLog[];
  operationInProgress: string[];
  setOperationInProgress: (operation: string, value: boolean) => void;
  reason: GameOverReason;
  isWon: boolean;
  isGameOver: boolean;
  infinityMode: boolean;
  deck: GameCardInfo[];
  hand: GameCardInfo[];
  discard: GameCardInfo[];
  upgrades: Upgrade[];
  cardModifiers: CardModifierIndice[];
  score: number;
  day: number;
  energy: number;
  reputation: number;
  money: number;
  addLog: (log: GameLog) => void;
  dangerouslyUpdate: (partial: Partial<CardGameState>) => void;
  updateScore: () => void;
  addEnergy: (count: number, options: GameMethodOptions) => Promise<void>;
  addReputation: (count: number, options: GameMethodOptions) => Promise<void>;
  addMoney: (count: number, options: GameMethodOptions) => Promise<void>;
  addDay: (count: number, options: MethodWhoCheckIfGameOver) => Promise<void>;
  upgrade: (name: string) => Promise<void>;
  triggerUpgrade: (name: string, options: GameMethodOptions) => Promise<void>;
  triggerUpgradeEvent: (
    event: TriggerEvent,
    options: MethodWhoCheckIfGameOver,
  ) => Promise<void>;
  addCardModifier: <CardModifierName extends keyof typeof cardModifiers>(
    name: CardModifierName,
    params: Parameters<(typeof cardModifiers)[CardModifierName]>,
    options?: { before?: boolean },
  ) => unknown;
  draw: (
    count: number,
    options: GameMethodOptions &
      Partial<{
        fromDiscardPile: boolean;
        filter: (card: GameCardInfo) => boolean;
      }>,
  ) => Promise<void>;
  discardCard: (options: {
    toDeck?: boolean;
    random?: boolean;
    reason: GameLog["reason"];
    filter?: (card: GameCardInfo) => boolean;
  }) => Promise<void>;
  removeCard: (name: string) => Promise<void>;
  recycle: (count: number, options: GameMethodOptions) => Promise<void>;
  play: (
    card: GameCardInfo,
    options: GameMethodOptions & { free?: boolean },
  ) => Promise<void>;
  win: () => void;
  gameOver: (reason: GameOverReason) => void;
  reset: () => void;
  continue: () => void;
}

export function isGameOver(state: CardGameState): GameOverReason | false {
  if (state.reputation === 0) return "reputation";
  if (state.deck.length === 0 && state.hand.length === 0) return "mill";
  if (
    state.hand.every((c) => {
      // on vérifie si la condition s'il y en
      if (c.effect.condition && !c.effect.condition(state, c)) return true;

      // on vérifie si on a assez de resources
      return !parseCost(state, c).canBeBuy;
    }) &&
    (state.reputation + state.energy < INFINITE_DRAW_COST ||
      state.hand.length >= MAX_HAND_SIZE ||
      state.deck.length === 0)
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
): { card: GameCardInfo; appliedModifiers: CardModifierIndice[] } {
  const clone = cloneSomething(card);
  const modifiers = state.cardModifiers.slice();

  return modifiers.reduce<{
    card: GameCardInfo;
    appliedModifiers: CardModifierIndice[];
  }>(
    (previousValue, indice) => {
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

export function parseCost(state: CardGameState, card: GameCardInfo) {
  const { card: tempCard, appliedModifiers } = applyCardModifiers(state, card);
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
    .replace(
      /@action([^\s.:,]*)/g,
      '<span style="color: hsl(var(--action)); transform: translateZ(5px); font-weight: bold;">Action$1</span>',
    )
    .replace(
      /@reputation([^\s.:,]*)/g,
      '<span style="color: hsl(var(--reputation)); transform: translateZ(5px); font-weight: bold;">Réputation$1</span>',
    )
    .replace(
      /@upgrade([^\s.:,]*)/g,
      '<span style="color: hsl(var(--upgrade)); transform: translateZ(5px); font-weight: bold;">Amélioration$1</span>',
    )
    .replace(
      /@support([^\s.:,]*)/g,
      '<span style="display: inline-block; background-color: hsla(var(--support) / 0.5); color: hsl(var(--support-foreground)); padding: 0 6px; border-radius: 4px; transform: translateZ(5px); font-weight: bold;">Support$1</span>',
    )
    .replace(
      /@energy([^\s.:,]*)/g,
      '<span style="color: hsl(var(--energy)); transform: translateZ(5px); font-weight: bold;">Énergie$1</span>',
    )
    .replace(
      /((?:\d+|<span[^>]*>\d+<\/span>)M\$)/g,
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

function shuffle(cards: GameCardInfo[], times = 1): GameCardInfo[] {
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

function reviveCardModifier(indice: CardModifierIndice): CardModifier {
  // @ts-expect-error C'est normal
  return cardModifiers[indice[0]](...indice[1]);
}

function parseSave(save: string) {
  return JSON.parse(save, (key, value) => {
    if (typeof value === "object") {
      switch (key) {
        case "discard":
        case "deck":
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

const supportEffects = effects.filter((effect) => effect.type === "support");
const actionEffects = effects.filter((effect) => effect.type === "action");

function generateInitialState(): Omit<
  CardGameState,
  keyof ReturnType<typeof cardGameMethods>
> {
  music.stop(musicId);
  music.play(musicId);
  music.fade(0, 0.5, 500, musicId);

  const saveMetadata = localStorage.getItem("card-game-metadata");
  const saveDifficulty =
    localStorage.getItem("card-game-difficulty") ?? "normal";
  const save = localStorage.getItem("card-game");

  if (
    save &&
    JSON.stringify(metadata) === saveMetadata &&
    settings.difficulty === saveDifficulty
  ) {
    return parseSave(save);
  }

  localStorage.setItem("card-game-metadata", JSON.stringify(metadata));
  localStorage.setItem("card-game-difficulty", settings.difficulty);

  const supports = technos.map((techno, i) => {
    const mapping = map(i, 0, technos.length, 0, supportEffects.length, true);
    const effect = supportEffects[Math.floor(mapping)];

    return {
      ...techno,
      type: "support" as const,
      image: `images/techno/${techno.image}`,
      state: "idle" as const,
      effect: {
        ...effect,
        description: formatText(effect.description),
      },
    } satisfies GameCardInfo;
  });

  const actions = projects.map((project, i) => {
    const mapping = map(i, 0, projects.length, 0, actionEffects.length, true);
    const effect = actionEffects[Math.floor(mapping)];

    return {
      ...project,
      type: "action" as const,
      image: `images/projects/${project.image}`,
      state: "idle" as const,
      effect: {
        ...effect,
        description: formatText(effect.description),
      },
    } satisfies GameCardInfo;
  });

  const upgradeActions = upgrades.map((upgrade) => {
    return {
      type: "action",
      name: upgrade.name,
      image: `images/upgrades/${upgrade.image}`,
      state: "idle",
      effect: {
        index: -1,
        upgrade: true,
        ephemeral: upgrade.max === 1,
        description: formatText(
          `@upgrade <br/> ${formatUpgradeText(upgrade.description, 1)}`,
        ),
        onPlayed: async (state) => await state.upgrade(upgrade.name),
        type: "action",
        cost: upgrade.cost,
        waitBeforePlay: false,
      },
    } satisfies GameCardInfo;
  });

  const deck = shuffle([...supports, ...actions, ...upgradeActions], 3);

  return {
    logs: [],
    operationInProgress: [],
    score: 0,
    reason: null,
    isWon: false,
    isGameOver: false,
    infinityMode: false,
    deck: deck.slice(7),
    hand: deck.slice(0, 7),
    discard: [],
    upgrades: [],
    cardModifiers: [["upgrade cost threshold", []]],
    day: 1,
    energy: MAX_ENERGY,
    reputation: MAX_REPUTATION,
    money: 0,
  };
}

function cardGameMethods(
  set: (
    partial:
      | CardGameState
      | Partial<CardGameState>
      | ((state: CardGameState) => CardGameState | Partial<CardGameState>),
    replace?: boolean | undefined,
  ) => void,
  getState: () => CardGameState,
) {
  return {
    addLog: (log) => {
      set((state) => ({
        logs: [...state.logs, log],
      }));
    },

    dangerouslyUpdate: (partial: Partial<CardGameState>) => set(partial),

    setOperationInProgress: (operation: string, value: boolean) => {
      set((state) => ({
        operationInProgress: value
          ? [...state.operationInProgress, operation]
          : state.operationInProgress.filter((op) => op !== operation),
      }));
    },

    updateScore: () => {
      // Plus la partie dure longtemps, plus le score diminue.
      // Moins tu perds de réputation, plus le score est élevé.
      // Plus tu as d'argent en fin de partie, plus le score est élevé.
      // Chaque cumul d'activité augmente le score.
      // L'énergie restante augmente légèrement le score.
      // Calcul :

      set((state) => ({
        score: Math.floor(
          state.energy +
            state.reputation * REPUTATION_TO_ENERGY +
            state.money / ENERGY_TO_MONEY +
            state.upgrades.reduce((acc, upgrade) => acc + upgrade.cumul, 0) *
              10 *
              (50 / state.day) *
              100 *
              (1 + Object.keys(GAME_ADVANTAGE).indexOf(settings.difficulty)),
        ),
      }));
    },

    addEnergy: async (count, options) => {
      const state = getState();

      state.setOperationInProgress("energy", true);

      if (count > 0) {
        // on joue le son de la banque
        bank.gain.play();

        state.addLog({
          value: count,
          type: "energy",
          reason: options.reason,
        });

        await wait();

        set((state) => {
          return {
            energy: Math.max(0, Math.min(MAX_ENERGY, state.energy + count)),
          };
        });
      } else if (count < 0) {
        const state = getState();

        // on retire toute l'énergie et on puise dans la réputation pour le reste
        const missingEnergy = Math.abs(count) - state.energy;

        const consumedEnergy = Math.min(Math.abs(count), state.energy);

        state.addLog({
          value: -consumedEnergy,
          type: "energy",
          reason: options.reason,
        });

        if (missingEnergy > 0) {
          set({ energy: 0 });

          await state.addReputation(-missingEnergy, options);
        } else {
          set((state) => {
            return {
              energy: state.energy + count,
            };
          });
        }
      }

      state.setOperationInProgress("energy", false);
    },

    addReputation: async (count, options) => {
      const state = getState();

      state.setOperationInProgress("reputation", true);

      // on joue le son de la banque
      if (count === 10) bank.powerUp.play();
      else if (count > 0) bank.gain.play();
      else bank.loss.play();

      if (count !== 0) {
        state.addLog({
          value: count,
          type: "reputation",
          reason: options.reason,
        });
      }

      set((state) => {
        return {
          reputation: Math.max(
            0,
            Math.min(MAX_REPUTATION, state.reputation + count),
          ),
        };
      });

      await wait();

      if (!options?.skipGameOverPause && isGameOver(state)) {
        await wait(2000);
      }

      state.setOperationInProgress("reputation", false);
    },

    addMoney: async (count, options) => {
      let state = getState();

      state.addLog({
        value: count,
        type: "money",
        reason: options?.reason,
      });

      state.setOperationInProgress("money", true);

      if (count > 0) {
        bank.cashing.play();

        await wait();
      }

      set((state) => {
        const money = state.money + count;

        return { money };
      });

      state = getState();

      if (!options?.skipGameOverPause && state.money >= MONEY_TO_REACH) {
        await wait(2000);
      }

      state.setOperationInProgress("money", false);
    },

    addDay: async (count = 1, options) => {
      const state = getState();

      state.setOperationInProgress("addDay", true);

      set({ day: state.day + count });

      if (count > 0) {
        // appliquer les effets de fin de journée
        const state = getState();

        for (let i = 0; i < count; i++) {
          await state.triggerUpgradeEvent("eachDay", options);
        }
      }

      state.setOperationInProgress("addDay", false);
    },

    upgrade: async (name) => {
      const state = getState();

      state.setOperationInProgress(`upgrade ${name}`, true);

      const rawUpgrades = upgrades.find((a) => a.name === name)!;

      // on joue le son de la banque
      bank.upgrade.play();

      // si l'activité est déjà découverte, on augmente son cumul
      if (state.upgrades.find((a) => a.name === name)) {
        set((state) => {
          return {
            upgrades: state.upgrades.map((a) => {
              if (a.name === name) {
                return { ...a, cumul: a.cumul + 1 };
              }
              return a;
            }),
          };
        });
      } else {
        set((state) => {
          return {
            upgrades: [
              ...state.upgrades,
              {
                ...rawUpgrades,
                state: "appear",
                cumul: 1,
                max: rawUpgrades.max ?? Infinity,
              },
            ],
          };
        });
      }

      await wait();

      // remet l'activité en idle
      set((state) => {
        return {
          upgrades: state.upgrades.map((a) => {
            if (a.name === name) {
              return { ...a, state: "idle" };
            }
            return a;
          }),
        };
      });

      state.setOperationInProgress(`upgrade ${name}`, false);
    },

    triggerUpgrade: async (name, options) => {
      const state = getState();
      const upgrade = state.upgrades.find((a) => a.name === name)!;

      state.setOperationInProgress(`triggerUpgrade ${name}`, true);

      // mettre l'activité en triggered
      set({
        upgrades: state.upgrades.map((a) => {
          if (a.name === upgrade.name) {
            return { ...a, state: "triggered" };
          }
          return a;
        }),
      });

      await wait();

      await upgrade.onTrigger(getState(), upgrade, options?.reason ?? upgrade);

      await wait();

      // remettre l'activité en idle
      set((state) => ({
        upgrades: state.upgrades.map((a) => {
          if (a.name === upgrade.name) {
            return { ...a, state: "idle" };
          }
          return a;
        }),
      }));

      state.setOperationInProgress(`triggerUpgrade ${name}`, false);
    },

    triggerUpgradeEvent: async (event, options) => {
      let state = getState();

      state.setOperationInProgress(`triggerUpgradeEvent ${event}`, true);

      const upgrades = state.upgrades
        .slice()
        .filter((upgrade) => upgrade.triggerEvent === event);

      let i = 0;

      await Promise.all(
        upgrades.map(async (upgrade) => {
          if (!upgrade.condition || upgrade.condition(getState(), upgrade)) {
            await wait(500 * i++);
            await state.triggerUpgrade(upgrade.name, {
              skipGameOverPause: options.skipGameOverPause,
              reason: upgrade,
            });
          }
        }),
      );

      state = getState();

      if (!options.skipGameOverPause && isGameOver(state)) {
        await wait(2000);
      }

      state.setOperationInProgress(`triggerUpgradeEvent ${event}`, false);
    },

    addCardModifier: async (name, params, options) => {
      bank.powerUp.play();

      const indice = [name, params] as unknown as CardModifierIndice;

      set((state) => {
        return {
          cardModifiers: options?.before
            ? [indice, ...state.cardModifiers]
            : [...state.cardModifiers, indice],
        };
      });
    },

    draw: async (count = 1, options) => {
      let state = getState();

      state.setOperationInProgress("draw", true);

      const fromKey = options?.fromDiscardPile ? "discard" : "deck";

      const hand = state.hand.slice();
      const discard = state.discard.slice();

      const from = state[fromKey].slice().filter((c) => {
        if (options?.filter) return options.filter(c);
        return true;
      });

      const drawn: string[] = [];

      let handAdded = false;
      let discardAdded = false;

      for (let i = 0; i < count; i++) {
        if (from.length === 0) {
          break;
        }

        const card = from.pop()!;

        card.state = "drawn";

        drawn.push(card.name);

        if (hand.length >= MAX_HAND_SIZE) {
          discard.push(card);
          discardAdded = true;
        } else {
          hand.push(card);
          handAdded = true;
        }
      }

      if (handAdded) bank.draw.play();
      else if (discardAdded) bank.drop.play();

      set({
        hand,
        discard,
        [fromKey]: shuffle(
          state[fromKey].filter((c) => !drawn.includes(c.name)),
          2,
        ),
      });

      await wait();

      // on passe la main en idle
      set((state) => ({
        hand: state.hand.map((c) => {
          return { ...c, state: "idle" };
        }),
      }));

      state = getState();

      if (!options?.skipGameOverPause && isGameOver(state)) {
        await wait(2000);
      }

      state.setOperationInProgress("draw", false);
    },

    discardCard: async (options) => {
      const toKey = options?.toDeck ? "deck" : "discard";

      // on joue le son de la banque
      bank.drop.play();

      const state = getState();

      state.setOperationInProgress("discard", true);

      const hand = state.hand
        .slice()
        .filter(
          (c) =>
            c.state !== "played" && (!options?.filter || options.filter(c)),
        );

      const dropped = options?.random
        ? [hand[Math.floor(Math.random() * state.hand.length)]]
        : hand;

      // on active l'animation de retrait des cartes
      set({
        hand: state.hand.map((c) => {
          if (dropped.some((d) => d.name === c.name)) {
            return { ...c, state: "dropped" };
          }
          return c;
        }),
      });

      // on attend la fin de l'animation
      await wait();

      // les cartes retournent dans le deck et on vide la main
      set((state) => ({
        [toKey]: shuffle(
          [
            ...state.hand
              .filter((c) => dropped.some((d) => d.name === c.name))
              .map((c) => ({ ...c, state: null })),
            ...state[toKey],
          ],
          2,
        ),
        hand: state.hand.filter((c) => !dropped.some((d) => d.name === c.name)),
      }));

      state.setOperationInProgress("discard", false);
    },

    removeCard: async (name) => {
      const state = getState();

      state.setOperationInProgress(`removeCard ${name}`, true);

      if (state.hand.some((c) => c.name === name)) {
        // on active l'animation de suppression de la carte
        set({
          hand: state.hand.map((c) => {
            if (c.name === name) {
              return { ...c, state: "removed" };
            }
            return c;
          }),
        });

        bank.remove.play();

        // on attend la fin de l'animation
        await wait(1000);
      }

      // on retire la carte de la main, du deck et de la défausse

      const from = ["discard", "deck", "hand"] as const;

      set((state) => ({
        ...from.reduce((acc, key) => {
          return {
            ...acc,
            [key]: state[key].filter((c) => c.name !== name),
          };
        }, {} as Partial<CardGameState>),
      }));

      state.setOperationInProgress(`removeCard ${name}`, false);
    },

    /**
     * Place des cartes de la défausse dans le deck
     */
    recycle: async (count = 1) => {
      // on joue le son de la banque
      bank.recycle.play();

      const state = getState();

      state.setOperationInProgress("recycle", true);

      const from = state.discard.slice();
      const to = state.deck.slice();

      const recycled: string[] = [];

      for (let i = 0; i < count; i++) {
        if (from.length === 0) {
          break;
        }

        const card = from.pop()!;

        recycled.push(card.name);
        to.push(card);
      }

      set({
        deck: shuffle(to),
        discard: state.discard.filter((c) => !recycled.includes(c.name)),
        operationInProgress: state.operationInProgress.filter(
          (o) => o !== "recycle",
        ),
      });
    },

    play: async (card, options) => {
      const free = !!options?.free;

      let state = getState();

      const reason = options?.reason ?? card;

      const cantPlay = async () => {
        // jouer le son de la banque
        bank.unauthorized.play();

        // activer l'animation can't play
        set({
          hand: state.hand.map((c) => {
            if (c.name === card.name) {
              return { ...c, state: "unauthorized" };
            }
            return c;
          }),
        });

        // on attend la fin de l'animation
        await wait();

        // on remet la carte en idle
        set({
          hand: state.hand.map((c) => {
            if (c.name === card.name) {
              return { ...c, state: "idle" };
            }
            return c;
          }),
        });
      };

      // on vérifie la condition s'il y en a une (eval(effect.condition))
      if (card.effect.condition && !card.effect.condition(state, card)) {
        await cantPlay();

        return;
      }

      const { needs, cost, appliedModifiers } = parseCost(state, card);

      if (
        free ||
        Number(card.effect.cost) === 0 ||
        (needs === "money"
          ? state.money >= cost
          : state.reputation + state.energy >= cost)
      ) {
        if (!free) {
          if (needs === "money")
            await state.addMoney(-cost, { skipGameOverPause: true, reason });
          else
            await state.addEnergy(-cost, { skipGameOverPause: true, reason });
        }

        state.setOperationInProgress(`play ${card.name}`, true);
      } else {
        await cantPlay();

        return;
      }

      // on joue le son de la banque
      bank.play.play();

      const removing = willBeRemoved(state, card);

      if (removing) {
        wait(200).then(() => bank.remove.play());
      }

      const cardManagement = async () => {
        // on active l'animation de retrait de la carte
        set((state) => ({
          hand: state.hand.map((c) => {
            if (c.name === card.name) {
              return {
                ...c,
                state: removing ? "removed" : "played",
              };
            }
            return c;
          }),
        }));

        // on attend la fin de l'animation
        await wait(removing ? 1000 : undefined);

        // la carte va dans la défausse et on retire la carte de la main
        set((state) => ({
          discard: removing
            ? state.discard
            : shuffle([{ ...card, state: null }, ...state.discard], 3),
          hand: state.hand.filter((c) => c.name !== card.name),
          cardModifiers: state.cardModifiers.filter((indice) => {
            const modifier = reviveCardModifier(indice);

            return (
              // s'il n'est pas unique
              !modifier.once ||
              // sinon s'il a été appliqué
              !appliedModifiers.some((m) => m.toString() === indice.toString())
            );
          }),
        }));

        // on change de jour si besoin
        if (card.effect.type === "action") {
          await state.addDay(1, options);
        }
      };

      const effectManagement = async () => {
        // si il ne s'agit que de pioche une carte, on attend avant de piocher
        if (card.effect.waitBeforePlay) await wait();

        // on applique l'effet de la carte (toujours via eval)
        await card.effect.onPlayed(state, card, reason);
      };

      await Promise.all([cardManagement(), effectManagement()]);

      // on vérifie si la main est vide
      // si la main est vide, on pioche

      state = getState();

      if (state.hand.length === 0) {
        await state.draw(1, { reason });
      }

      if (!options?.skipGameOverPause && isGameOver(getState())) {
        await wait(2000);
      }

      state.setOperationInProgress(`play ${card.name}`, false);
    },

    win: () => {
      music.fade(0.5, 0, 500, musicId);

      set({ isGameOver: true, isWon: true });
    },

    gameOver: (reason) => {
      bank.defeat.play();
      music.fade(0.5, 0, 500, musicId);

      set({
        isGameOver: true,
        isWon: false,
        reason,
      });
    },

    reset: () => {
      localStorage.removeItem("card-game-metadata");
      localStorage.removeItem("card-game-difficulty");
      localStorage.removeItem("card-game");

      set(generateInitialState());
    },

    continue: () => {
      set({
        infinityMode: true,
        isGameOver: false,
        isWon: false,
      });
    },
  } satisfies Partial<CardGameState>;
}

export const useCardGame = create<CardGameState>((set, getState) => ({
  ...generateInitialState(),
  ...cardGameMethods(set, getState),
}));

useCardGame.subscribe((state, prevState) => {
  // on met à jour le score
  if (
    state.reputation !== prevState.reputation ||
    state.money !== prevState.money ||
    state.upgrades !== prevState.upgrades ||
    state.energy !== prevState.energy ||
    state.day !== prevState.day
  )
    state.updateScore();

  localStorage.setItem(
    "card-game",
    JSON.stringify(state, (key, value) => {
      if (typeof value === "function" && !(key in state)) return undefined;
      return value;
    }),
  );

  // si aucune opération n'est en cours
  if (
    state.operationInProgress.join(",") !==
      prevState.operationInProgress.join("") &&
    state.operationInProgress.length === 0
  ) {
    // on vérifie si le jeu est fini
    if (!state.infinityMode && !state.isWon && state.money >= MONEY_TO_REACH)
      state.win();
    else if (!state.isGameOver) {
      const reason = isGameOver(state);

      if (reason) state.gameOver(reason);
    }

    // const cardWithTemplate = state.hand.filter((card) => card.effect.template);
    // const changed: [string, string][] = [];
    //
    // for (const card of cardWithTemplate) {
    //   const template = card.effect.template!(
    //     state,
    //     card,
    //     !card.effect.condition || card.effect.condition(state, card),
    //   );
    //
    //   if (!card.effect.description.includes(`<template>${template}</template>`))
    //     changed.push([card.name, template]);
    // }
    //
    // if (changed.length > 0) {
    //   state.dangerouslyUpdate({
    //     hand: state.hand.map((card) => {
    //       const template = changed.find(([name]) => name === card.name)?.[1];
    //       if (template) {
    //         return {
    //           ...card,
    //           effect: {
    //             ...card.effect,
    //             description: card.effect.description.replace(
    //               /<template>.+?<\/template>/,
    //               `<template>${template}</template>`,
    //             ),
    //           },
    //         };
    //       }
    //       return card;
    //     }),
    //   });
    // }
  }
});
