import { bank } from "@/sound.ts";
import { create } from "zustand";

import {
  MAX_ENERGY,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  UPGRADE_COST_THRESHOLDS,
  MAX_HAND_SIZE,
  TRIGGER_EVENTS,
} from "@/game-constants.ts";

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
  onPlayed: (state: CardGameState, card: GameCardInfo) => Promise<unknown>;
  type: "action" | "support";
  cost: number | string;
  condition?: (state: CardGameState, card: GameCardInfo) => boolean;
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
      '<span style="color: #2563eb; transform: translateZ(5px);">Action$1</span>',
    )
    .replace(
      /@reputation([^\s.:,]*)/g,
      '<span style="color: #d946ef; transform: translateZ(5px);">Réputation$1</span>',
    )
    .replace(
      /@upgrade([^\s.:,]*)/g,
      '<span style="color: #f59e0b; transform: translateZ(5px);">Amélioration$1</span>',
    )
    .replace(
      /@support([^\s.:,]*)/g,
      '<span style="display: inline-block; background-color: hsla(var(--secondary) / 0.5); color: hsl(var(--secondary-foreground)); padding: 0 6px; border-radius: 4px; transform: translateZ(5px);">Support$1</span>',
    )
    .replace(
      /@energy([^\s.:,]*)/g,
      '<span style="color: hsl(var(--primary)); transform: translateZ(5px);">Énergie$1</span>',
    )
    .replace(
      /((?:\d+|<span[^>]*>\d+<\/span>)M\$)/g,
      `<span 
        style="display: inline-block; 
        background-color: #022c22; 
        color: white; 
        padding: 0 4px; 
        border: 1px white solid; 
        transform: translateZ(5px); 
        font-family: Changa, sans-serif;"
      >
        $1
      </span>`,
    );
}

export function formatUpgradeText(text: string, cumul: number) {
  return text
    .replace(/@cumul/g, `<span style="color: #f59e0b">${cumul}</span>`)
    .replace(/@s/g, cumul > 1 ? "s" : "");
}

async function wait(ms = 500) {
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
  | "updateScore"
  | "addEnergy"
  | "addReputation"
  | "addMoney"
  | "addDay"
  | "upgrade"
  | "triggerUpgrade"
  | "addNextCardModifier"
  | "draw"
  | "drop"
  | "dropAll"
  | "recycle"
  | "play"
  | "reset"
> {
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

interface CardGameState {
  reason: "mill" | "soft-lock" | "reputation" | null;
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
  addEnergy: (count: number) => Promise<void>;
  addReputation: (
    count: number,
    options?: { skipGameOverCheck?: boolean },
  ) => Promise<void>;
  addMoney: (count: number) => Promise<void>;
  addDay: (count?: number) => Promise<void>;
  upgrade: (name: string) => Promise<void>;
  triggerUpgrade: (name: string) => Promise<void>;
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
  reset: () => void;
}

export const useCardGame = create<CardGameState>((set, getState) => ({
  ...generateInitialState(),

  updateScore: () => {
    // Plus la partie dure longtemps, plus le score diminue.
    // Moins tu perds de réputation, plus le score est élevé.
    // Plus tu as d'argent en fin de partie, plus le score est élevé.
    // Chaque cumul d'activité augmente le score.
    // L'énergie restante augmente légèrement le score.
    // Calcul :

    set((state) => ({
      score: Math.max(
        0,
        state.reputation * 100 +
          state.money * 100 +
          state.upgrades.reduce((acc, upgrade) => acc + upgrade.cumul, 0) *
            100 +
          state.energy * 50 -
          state.day * 75,
      ),
    }));
  },

  addEnergy: async (count) => {
    // on joue le son de la banque
    bank.gain.play();

    set((state) => {
      return {
        energy: Math.max(0, Math.min(MAX_ENERGY, state.energy + count)),
      };
    });
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
      // on joue le son de la banque
      bank.victory.play();

      set({ isGameOver: true, isWon: true });
    }
  },

  addDay: async (count = 1) => {
    set((state) => ({
      day: state.day + count,
    }));

    if (count > 0) {
      // appliquer les effets de fin de journée
      const state = getState();

      for (let i = 0; i < count; i++) {
        await Promise.all(
          state.upgrades.slice().map(async (upgrade, index) => {
            await wait(250 * index);
            await state.triggerUpgrade(upgrade.name);
          }),
        );
      }
    }
  },

  upgrade: async (name) => {
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
      };
    });
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

        if (hand.length - 1 >= MAX_HAND_SIZE) {
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
      };
    });

    await wait();

    // on passe la main en idle
    set((state) => ({
      hand: state.hand.map((c) => {
        return { ...c, state: "idle" };
      }),
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
    });

    // on attend la fin de l'animation
    await wait();

    // la carte retourne dans le deck et on retire la carte de la main
    set((state) => ({
      hand: state.hand.filter((c) => c.name !== card.name),
      [toKey]: shuffle([{ ...card, state: null }, ...state[toKey]], 2),
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

          // on retire toute l'énergie et on puise dans la réputation pour le reste
          const missingEnergy = cost - state.energy;

          set({ energy: 0 });

          await state.addReputation(-missingEnergy, {
            skipGameOverCheck: true,
          });
        } else {
          await cantPlay();
          return;
        }
      } else {
        // on soustrait le coût de la carte à l'énergie
        set({ [needs]: state[needs] - cost });
      }
    }

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

    if (state.isGameOver) return;

    // vérifier le game over par réputation

    if (state.reputation === 0) {
      // on joue le son de la banque
      bank.defeat.play();
      bank.music.fade(0.7, 0, 1000);

      set({ isGameOver: true, isWon: false, reason: "reputation" });

      // on met à jour le score
      state.updateScore();

      return;
    }

    if (state.hand.length === 0) {
      await state.draw();
    }

    // vérifier si le jeu est soft lock

    state = getState();

    const isMill = state.deck.length === 0 && state.hand.length === 0;
    const isSoftLocked = state.hand.every((c) => {
      // on vérifie si la condition s'il y en
      if (c.effect.condition && !c.effect.condition(state, c)) return true;

      // on vérifie si on a assez de resources
      return !parseCost(state, c).canBeBuy;
    });

    if (isMill || isSoftLocked) {
      bank.defeat.play();
      bank.music.fade(0.7, 0, 1000);

      set({
        isGameOver: true,
        isWon: false,
        reason: isMill ? "mill" : "soft-lock",
      });
    }

    // on met à jour le score
    state.updateScore();
  },

  reset: () => {
    set(generateInitialState());

    bank.music.stop();
    bank.music.play();
  },
}));
