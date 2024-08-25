import { bank } from "@/sound.ts";
import { create } from "zustand";

import {
  MAX_ENERGY,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  UPGRADE_COST_THRESHOLDS,
  MAX_HAND_SIZE,
  TRIGGER_EVENTS,
  INFINITE_DRAW_COST,
  REPUTATION_TO_ENERGY,
  ENERGY_TO_MONEY,
} from "@/game-constants.ts";

import { metadata } from "@/game-metadata.ts";
import { settings } from "@/game-settings.ts";

import technos from "../data/techno.json";
import projects from "../data/projects.json";
import effects from "../data/effects.ts";
import upgrades from "../data/upgrades.ts";

export interface Upgrade {
  name: string;
  description: string;
  image: string;
  triggerEvent: TriggerEvent;
  condition?: (state: CardGameState, upgrade: Upgrade) => boolean;
  onTrigger: (state: CardGameState, upgrade: Upgrade) => Promise<unknown>;
  cost: number | string;
  state: "appear" | "idle" | "triggered";
  cumul: number;
  max: number;
}

export interface Effect {
  description: string;
  type: "action" | "support";
  cost: number | string;
  condition?: (state: CardGameState, card: GameCardInfo) => boolean;
  onPlayed: (state: CardGameState, card: GameCardInfo) => Promise<unknown>;
  waitBeforePlay?: boolean;
  ephemeral?: boolean;
  upgrade?: boolean;
}

export interface ActionCardInfo {
  name: string;
  image: string;
  effect: Effect;
  state: GameCardState;
  description?: string;
  detail?: string;
  url?: string;
}

export interface SupportCardInfo {
  name: string;
  logo: string;
  effect: Effect;
  state: GameCardState;
}

export type GameCardState =
  | "played"
  | "dropped"
  | "drawn"
  | "unauthorized"
  | "idle"
  | null;

export type GameCardInfo = ActionCardInfo | SupportCardInfo;

export type CardModifier = (card: GameCardInfo) => GameCardInfo;

export type TriggerEvent = keyof typeof TRIGGER_EVENTS;

export type GameOverReason = "mill" | "soft-lock" | "reputation" | null;

interface CardGameState {
  operationInProgress: Record<string, boolean>;
  setOperationInProgress: (operation: string, value: boolean) => void;
  reason: GameOverReason;
  isWon: boolean;
  isGameOver: boolean;
  deck: GameCardInfo[];
  hand: GameCardInfo[];
  discard: GameCardInfo[];
  upgrades: Upgrade[];
  nextCardModifiers: CardModifier[];
  score: number;
  day: number;
  energy: number;
  reputation: number;
  money: number;
  updateScore: () => void;
  addEnergy: (
    count: number,
    options?: { skipGameOverCheck?: boolean },
  ) => Promise<void>;
  addReputation: (
    count: number,
    options?: { skipGameOverCheck?: boolean },
  ) => Promise<void>;
  addMoney: (count: number) => Promise<void>;
  addDay: (count?: number) => Promise<void>;
  upgrade: (name: string) => Promise<void>;
  triggerUpgrade: (name: string) => Promise<void>;
  triggerUpgradeEvent: (event: TriggerEvent) => Promise<void>;
  addNextCardModifier: (
    callback: (card: GameCardInfo) => GameCardInfo,
    options?: { before?: boolean },
  ) => unknown;
  draw: (
    count?: number,
    options?: Partial<{
      fromDiscardPile: boolean;
      filter: (card: GameCardInfo) => boolean;
    }>,
  ) => Promise<void>;
  drop: (options?: { toDeck?: boolean }) => Promise<void>;
  dropAll: (options?: {
    toDeck?: boolean;
    filter?: (card: GameCardInfo) => boolean;
  }) => Promise<void>;
  recycle: (count?: number) => Promise<void>;
  play: (card: GameCardInfo, options?: { free?: boolean }) => Promise<void>;
  win: () => void;
  gameOver: (reason: GameOverReason) => void;
  reset: () => void;
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
): number {
  const index = state.upgrades.length;
  const priceThreshold =
    UPGRADE_COST_THRESHOLDS[typeof card.effect.cost as "string" | "number"][
      index
    ] ?? Infinity;

  return Math.min(Number(priceThreshold), Number(card.effect.cost));
}

export function cloneSomething<T>(something: T): T {
  return JSON.parse(
    JSON.stringify(something, (_key, value) =>
      typeof value === "function" ? undefined : value,
    ),
  );
}

export function applyNextCardModifiers(
  state: CardGameState,
  card: GameCardInfo,
) {
  const clone = cloneSomething(card);

  const modifiers = state.nextCardModifiers.slice();

  if (card.effect.upgrade) {
    modifiers.unshift((card) => {
      if (card.effect.upgrade) {
        return {
          ...card,
          effect: {
            ...card.effect,
            cost: getUpgradeCost(state, card),
          },
        };
      }
      return card;
    });
  }

  return modifiers.reduce(
    (card, modifier) => modifier(card as GameCardInfo),
    clone,
  );
}

export function parseCost(state: CardGameState, card: GameCardInfo) {
  const needs = typeof card.effect.cost === "number" ? "energy" : "money";
  const tempCard = applyNextCardModifiers(state, card);
  const cost = Number(tempCard.effect.cost);
  const canBeBuy =
    needs === "money"
      ? state[needs] >= cost
      : state[needs] + state.reputation >= cost;

  return { needs, cost, canBeBuy } as const;
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
  return (card as ActionCardInfo).image !== undefined;
}

const supportEffects = effects.filter((effect) => effect.type === "support");
const actionEffects = effects.filter((effect) => effect.type === "action");

function generateInitialState(): Omit<
  CardGameState,
  keyof ReturnType<typeof cardGameMethods>
> {
  const saveMetadata = localStorage.getItem("card-game-metadata");
  const saveDifficulty =
    localStorage.getItem("card-game-difficulty") ?? "normal";
  const save = localStorage.getItem("card-game");

  if (
    save &&
    JSON.stringify(metadata) === saveMetadata &&
    settings.difficulty === saveDifficulty
  ) {
    return JSON.parse(save, (key, value) => {
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
                onPlayed: card.effect.upgrade
                  ? async (state) => await state.upgrade(card.name)
                  : effects.find(
                      (effect) =>
                        formatText(effect.description) ===
                        card.effect.description,
                    )?.onPlayed,
                condition: effects.find(
                  (effect) =>
                    formatText(effect.description) === card.effect.description,
                )?.condition,
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
        case "nextCardModifiers":
          return value.map((modifier: string) => {
            return eval(modifier);
          });
        case "operationInProgress":
          return {};
      }

      return value;
    });
  }

  localStorage.setItem("card-game-metadata", JSON.stringify(metadata));
  localStorage.setItem("card-game-difficulty", settings.difficulty);

  const supports = technos.map((techno, i) => {
    const mapping = map(i, 0, technos.length, 0, supportEffects.length, true);
    const effect = supportEffects[Math.floor(mapping)];

    return {
      ...techno,
      logo: `images/techno/${techno.logo}`,
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
      name: upgrade.name,
      image: `images/upgrades/${upgrade.image}`,
      state: "idle",
      effect: {
        upgrade: true,
        ephemeral: !upgrade.cumulable,
        description: formatText(
          `@upgrade <br/> ${formatUpgradeText(upgrade.description, 1)}`,
        ),
        onPlayed: async (state) => await state.upgrade(upgrade.name),
        type: "action",
        cost: upgrade.cost,
      } satisfies Effect,
    } satisfies GameCardInfo;
  });

  const deck = shuffle([...supports, ...actions, ...upgradeActions], 3);

  return {
    operationInProgress: {},
    score: 0,
    reason: null,
    isWon: false,
    isGameOver: false,
    deck: deck.slice(7),
    hand: deck.slice(0, 7),
    discard: [],
    upgrades: [],
    nextCardModifiers: [],
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
    setOperationInProgress: (operation: string, value: boolean) => {
      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          [operation]: value,
        },
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
              100,
        ),
      }));
    },

    addEnergy: async (count, options) => {
      if (count > 0) {
        // on joue le son de la banque
        bank.gain.play();

        set((state) => {
          return {
            energy: Math.max(0, Math.min(MAX_ENERGY, state.energy + count)),
          };
        });
      } else if (count < 0) {
        const state = getState();

        // on retire toute l'énergie et on puise dans la réputation pour le reste
        const missingEnergy = Math.abs(count) - state.energy;

        set({ energy: 0 });

        await state.addReputation(-missingEnergy, {
          skipGameOverCheck: options?.skipGameOverCheck,
        });
      }
    },

    addReputation: async (count, options) => {
      // on joue le son de la banque
      if (count === 10) bank.powerUp.play();
      else if (count > 0) bank.gain.play();
      else bank.loss.play();

      set((state) => {
        return {
          reputation: Math.max(
            0,
            Math.min(MAX_REPUTATION, state.reputation + count),
          ),
        };
      });

      await wait();

      if (options?.skipGameOverCheck) return;

      const state = getState();

      if (state.isGameOver) return;

      if (state.reputation === 0) {
        // on joue le son de la banque
        bank.defeat.play();
        bank.music.fade(0.7, 0, 1000);

        set({ isGameOver: true, isWon: false, reason: "reputation" });
      }
    },

    addMoney: async (count) => {
      if (count > 0) bank.cashing.play();

      set((state) => {
        const money = state.money + count;

        return { money };
      });

      await wait();

      const state = getState();

      if (state.money >= MONEY_TO_REACH) {
        state.win();
      }
    },

    addDay: async (count = 1) => {
      set((state) => ({
        day: state.day + count,
        operationInProgress: {
          ...state.operationInProgress,
          day: true,
        },
      }));

      if (count > 0) {
        // appliquer les effets de fin de journée
        const state = getState();

        for (let i = 0; i < count; i++) {
          await state.triggerUpgradeEvent("eachDay");
        }
      }

      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          day: false,
        },
      }));
    },

    upgrade: async (name) => {
      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          [`upgrade ${name}`]: true,
        },
      }));

      const rawUpgrades = upgrades.find((a) => a.name === name)!;

      // on joue le son de la banque
      bank.upgrade.play();

      let state = getState();

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
                max: rawUpgrades.cumulable ? (rawUpgrades.max ?? Infinity) : 1,
              },
            ],
          };
        });
      }

      if (rawUpgrades.cumulable && rawUpgrades.max) {
        // on vérifie si la carte qui sert à découvrir cette activité doit être supprimée ou non

        state = getState();

        const upgrade = state.upgrades.find((a) => a.name === name)!;

        if (upgrade.cumul === upgrade.max) {
          const card = state.hand.find(
            (c) => c.effect.upgrade && c.name === name,
          )!;

          set({
            hand: state.hand.map((c) => {
              if (c.name === card.name) return { ...c, state: "played" };
              return c;
            }),
          });

          await wait();

          set({
            hand: state.hand.filter((c) => {
              return c.name !== card.name;
            }),
          });
        }
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
          operationInProgress: {
            ...state.operationInProgress,
            [`upgrade ${name}`]: false,
          },
        };
      });
    },

    triggerUpgrade: async (name) => {
      const state = getState();
      const upgrade = state.upgrades.find((a) => a.name === name)!;

      // mettre l'activité en triggered
      set((state) => {
        return {
          upgrades: state.upgrades.map((a) => {
            if (a.name === upgrade.name) {
              return { ...a, state: "triggered" };
            }
            return a;
          }),
          operationInProgress: {
            ...state.operationInProgress,
            [`trigger ${name}`]: true,
          },
        };
      });

      await wait();

      await upgrade.onTrigger(state, upgrade);

      await wait();

      // remettre l'activité en idle
      set((state) => {
        return {
          upgrades: state.upgrades.map((a) => {
            if (a.name === upgrade.name) {
              return { ...a, state: "idle" };
            }
            return a;
          }),
          operationInProgress: {
            ...state.operationInProgress,
            [`trigger ${name}`]: false,
          },
        };
      });
    },

    triggerUpgradeEvent: async (event: TriggerEvent) => {
      const state = getState();

      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          [`trigger ${event}`]: true,
        },
      }));

      await Promise.all(
        state.upgrades
          .slice()
          .filter(
            (upgrade) =>
              upgrade.triggerEvent === event &&
              (!upgrade.condition || upgrade.condition(state, upgrade)),
          )
          .map(async (upgrade, index) => {
            await wait(250 * index);
            await state.triggerUpgrade(upgrade.name);
          }),
      );

      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          [`trigger ${event}`]: false,
        },
      }));
    },

    addNextCardModifier: async (callback, options) => {
      bank.powerUp.play();

      set((state) => {
        return {
          nextCardModifiers: options?.before
            ? [callback, ...state.nextCardModifiers]
            : [...state.nextCardModifiers, callback],
        };
      });
    },

    draw: async (count = 1, options) => {
      set((state) => {
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
        else if (discardAdded) bank.draw.play();

        return {
          hand,
          discard,
          [fromKey]: shuffle(
            state[fromKey].filter((c) => !drawn.includes(c.name)),
            2,
          ),
          operationInProgress: {
            ...state.operationInProgress,
            draw: true,
          },
        };
      });

      await wait();

      // on passe la main en idle
      set((state) => ({
        hand: state.hand.map((c) => {
          return { ...c, state: "idle" };
        }),
        operationInProgress: {
          ...state.operationInProgress,
          draw: false,
        },
      }));
    },

    drop: async (options) => {
      const toKey = options?.toDeck ? "deck" : "discard";

      // on joue le son de la banque
      bank.drop.play();

      const state = getState();

      const hand = state.hand.slice().filter((c) => c.state === "idle");

      const index = Math.floor(Math.random() * hand.length);

      const card = hand[index];

      // on active l'animation de retrait de la carte
      set({
        hand: state.hand.map((c) => {
          if (c.name === card.name) {
            return { ...c, state: "dropped" };
          }
          return c;
        }),
        operationInProgress: {
          ...state.operationInProgress,
          drop: true,
        },
      });

      // on attend la fin de l'animation
      await wait();

      // la carte retourne dans le deck et on retire la carte de la main
      set((state) => ({
        hand: state.hand.filter((c) => c.name !== card.name),
        [toKey]: shuffle([{ ...card, state: null }, ...state[toKey]], 2),
        operationInProgress: {
          ...state.operationInProgress,
          drop: false,
        },
      }));
    },

    dropAll: async (options) => {
      const toKey = options?.toDeck ? "deck" : "discard";

      // on joue le son de la banque
      bank.drop.play();

      const state = getState();

      // on active l'animation de retrait de la carte
      set({
        hand: state.hand.map((c) => {
          if (c.state === "idle" && (!options?.filter || options.filter(c))) {
            return { ...c, state: "dropped" };
          }
          return c;
        }),
        operationInProgress: {
          ...state.operationInProgress,
          dropAll: true,
        },
      });

      // on attend la fin de l'animation
      await wait();

      // les cartes retournent dans le deck et on vide la main
      set((state) => ({
        [toKey]: shuffle(
          [
            ...state.hand
              .filter((c) => !options?.filter || options.filter(c))
              .map((c) => ({ ...c, state: null })),
            ...state[toKey],
          ],
          2,
        ),
        hand: state.hand.filter((c) => options?.filter && !options.filter(c)),
        operationInProgress: {
          ...state.operationInProgress,
          dropAll: false,
        },
      }));
    },

    /**
     * Place des cartes de la défausse dans le deck
     */
    recycle: async (count = 1) => {
      // on joue le son de la banque
      bank.recycle.play();

      const state = getState();

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
      });
    },

    play: async (card, options) => {
      const free = !!options?.free;

      let state = getState();

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

      if (!free) {
        const { needs, cost } = parseCost(state, card);

        // on vérifie si on a assez de ressources
        if (state[needs] < cost) {
          if (needs === "energy") {
            // on vérifie si on a assez de réputation et d'énergie
            if (state.reputation + state.energy < cost) {
              await cantPlay();
              return;
            }

            await state.addEnergy(-cost, { skipGameOverCheck: true });
          } else {
            await cantPlay();
            return;
          }
        } else {
          // on soustrait le coût de la carte à l'énergie
          set({ [needs]: state[needs] - cost });
        }
      }

      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          play: true,
        },
      }));

      // on joue le son de la banque
      bank.play.play();

      const cardManagement = async () => {
        // on active l'animation de retrait de la carte
        set((state) => ({
          nextCardModifiers: [],
          hand: state.hand.map((c) => {
            if (c.name === card.name) {
              return { ...c, state: "played" };
            }
            return c;
          }),
        }));

        // on attend la fin de l'animation
        await wait();

        // la carte va dans la défausse et on retire la carte de la main
        set((state) => ({
          discard: card.effect.ephemeral
            ? state.discard
            : shuffle([{ ...card, state: null }, ...state.discard], 3),
          hand: state.hand.filter((c) => c.name !== card.name),
        }));

        // on change de jour si besoin
        if (card.effect.type === "action") {
          await state.addDay();
        }
      };

      const effectManagement = async () => {
        // si il ne s'agit que de pioche une carte, on attend avant de piocher
        if (card.effect.waitBeforePlay) await wait();

        // on applique l'effet de la carte (toujours via eval)
        await card.effect.onPlayed(state, card);

        // on met à jour le score
        state.updateScore();
      };

      await Promise.all([cardManagement(), effectManagement()]);

      // on vérifie si la main est vide
      // si la main est vide, on pioche

      state = getState();

      if (state.hand.length === 0) {
        await state.draw();
      }

      if (isGameOver(getState())) {
        await wait(2000);
      }

      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          play: false,
        },
      }));
    },

    win: () => {
      bank.victory.play();

      set({ isGameOver: true, isWon: true });
    },

    gameOver: (reason) => {
      bank.defeat.play();
      bank.music.fade(0.7, 0, 1000);

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

      bank.music.stop();
      bank.music.play();
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
      if (typeof value === "function" && !(key in state))
        return value.toString();
      return value;
    }),
  );

  // on vérifie si le jeu est fini
  if (
    Object.values(state.operationInProgress).every((v) => !v) &&
    !state.isGameOver
  ) {
    const reason = isGameOver(state);

    if (reason) state.gameOver(reason);
  }
});
