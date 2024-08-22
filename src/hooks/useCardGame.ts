import { bank } from "@/sound.ts";
import { create } from "zustand";

import projects from "../data/projects.json";
import technos from "../data/techno.json";
import effects from "../data/effects.json";
import activities from "../data/activities.json";

export const MAX_REPUTATION = 10;
export const MAX_ENERGY = 20;
export const MONEY_TO_REACH = 200;

export function formatText(text: string) {
  return text
    .replace(/MONEY_TO_REACH/g, String(MONEY_TO_REACH))
    .replace(/@action(\S*)/g, '<span style="color: #2563eb">Action$1</span>')
    .replace(
      /@reputation(\S*)/g,
      '<span style="color: #d946ef">Réputation$1</span>',
    )
    .replace(
      /@activity(\S*)/g,
      '<span style="color: #f59e0b">Activité$1</span>',
    )
    .replace(
      /@support(\S*)/g,
      '<span style="background-color: hsla(var(--secondary) / 0.5); color: hsl(var(--secondary-foreground))">Support$1</span>',
    )
    .replace(
      /@energy(\S*)/g,
      '<span style="color: hsl(var(--primary))">Énergie$1</span>',
    )
    .replace(
      /(\d+M\$)/g,
      '<span style="display: inline-block; background-color: #022c22; color: white; padding: 0 4px;">$1</span>',
    );
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

export function isActionCardInfo(
  card: GameCardInfo,
): card is ProjectCardInfo & { state: GameCardState } {
  return (card as ProjectCardInfo).image !== undefined;
}

export interface Activity {
  name: string;
  description: string;
  image: string;
  onTrigger: string;
  cost: number | string;
  state: "appear" | "idle" | "triggered";
  cumul: number;
  max: number;
}

export interface Effect {
  description: string;
  onPlayed: string;
  type: string;
  cost: number | string;
  condition?: string;
}

export interface ProjectCardInfo {
  name: string;
  image: string;
  effect: Effect;
  description?: string;
  detail?: string;
  url?: string;
}

export interface TechnoCardInfo {
  name: string;
  logo: string;
  effect: Effect;
}

export type GameCardState =
  | "played"
  | "dropped"
  | "drawn"
  | "unauthorized"
  | "idle"
  | null;

export type GameCardInfo = (ProjectCardInfo | TechnoCardInfo) & {
  state: GameCardState;
  ephemeral?: boolean;
};

const supportEffects = effects.filter((effect) => effect.type === "support");
const actionEffects = effects.filter((effect) => effect.type === "action");

function generateInitialState(): Omit<
  CardGameState,
  | "addEnergy"
  | "addReputation"
  | "addMoney"
  | "addDay"
  | "discover"
  | "triggerActivity"
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
    };
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
    };
  });

  const bonusesAsActions = activities.map((activity) => {
    return {
      name: activity.name,
      image: `images/activities/${activity.image}`,
      state: "idle" as const,
      ephemeral: !activity.cumulable,
      effect: {
        description: formatText("Découvre une @activity"),
        onPlayed: `await state.discover("${activity.name}")`,
        type: "action",
        cost: activity.cost,
      },
    };
  });

  const deck = shuffle([...supports, ...actions, ...bonusesAsActions], 3);

  return {
    reason: null,
    isWon: false,
    isGameOver: false,
    deck: deck.slice(7),
    hand: deck.slice(0, 7),
    discard: [],
    activities: [],
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
  activities: Activity[];
  day: number;
  energy: number;
  reputation: number;
  money: number;
  addEnergy: (count: number) => Promise<void>;
  addReputation: (
    count: number,
    options?: { skipGameOverCheck?: boolean },
  ) => Promise<void>;
  addMoney: (count: number) => Promise<void>;
  addDay: (count?: number) => Promise<void>;
  discover: (name: string) => Promise<void>;
  triggerActivity: (name: string) => Promise<void>;
  draw: (
    count?: number,
    options?: Partial<{
      type: "action" | "support";
      fromDiscardPile: boolean;
    }>,
  ) => Promise<void>;
  drop: (options?: { toDeck?: boolean }) => Promise<void>;
  dropAll: (options?: { toDeck?: boolean }) => Promise<void>;
  recycle: (count?: number) => Promise<void>;
  play: (card: GameCardInfo) => Promise<void>;
  reset: () => void;
}

export const useCardGame = create<CardGameState>((set, getState) => ({
  ...generateInitialState(),

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
    if (count > 0) bank.gain.play();
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

      set({ isGameOver: true, isWon: false, reason: "reputation" });
    }
  },

  addMoney: async (count) => {
    // on joue le son de la banque
    if (count > 0) bank.gain.play();

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
          state.activities.slice().map(async (activity, index) => {
            await wait(250 * index);
            await state.triggerActivity(activity.name);
          }),
        );
      }
    }
  },

  discover: async (name) => {
    const rawActivity = activities.find((a) => a.name === name)!;

    // on joue le son de la banque
    bank.discover.play();

    let state = getState();

    // si l'activité est déjà découverte, on augmente son cumul
    if (state.activities.find((a) => a.name === name)) {
      set((state) => {
        return {
          activities: state.activities.map((a) => {
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
          activities: [
            ...state.activities,
            {
              ...rawActivity,
              state: "appear",
              cumul: 1,
              max: rawActivity.cumulable ? (rawActivity.max ?? Infinity) : 1,
            },
          ],
        };
      });
    }

    if (rawActivity.cumulable) {
      // on vérifie si la carte qui sert à découvrir cette activité doit passer en éphémère ou non

      state = getState();

      const activity = state.activities.find((a) => a.name === name)!;
      const pattern = `discover("${name}")`;
      const card =
        state.hand.find((c) => c.effect.onPlayed.includes(pattern)) ||
        state.deck.find((c) => c.effect.onPlayed.includes(pattern)) ||
        state.discard.find((c) => c.effect.onPlayed.includes(pattern));

      if (card) {
        set((state) => {
          return {
            hand: state.hand.map((c) => {
              if (c.name === card.name) {
                return {
                  ...c,
                  ephemeral: rawActivity.max
                    ? activity.cumul >= rawActivity.max - 1
                    : false,
                };
              }
              return c;
            }),
          };
        });
      }
    }

    await wait();

    // remet l'activité en idle
    set((state) => {
      return {
        activities: state.activities.map((a) => {
          if (a.name === name) {
            return { ...a, state: "idle" };
          }
          return a;
        }),
      };
    });
  },

  triggerActivity: async (name) => {
    const state = getState();
    const activity = state.activities.find((a) => a.name === name)!;

    // mettre l'activité en triggered
    set((state) => {
      return {
        activities: state.activities.map((a) => {
          if (a.name === activity.name) {
            return { ...a, state: "triggered" };
          }
          return a;
        }),
      };
    });

    await wait();

    await eval(`(async () => {
      ${activity.onTrigger}
    })()`);

    await wait();

    // remettre l'activité en idle
    set((state) => {
      return {
        activities: state.activities.map((a) => {
          if (a.name === activity.name) {
            return { ...a, state: "idle" };
          }
          return a;
        }),
      };
    });
  },

  draw: async (count = 1, options) => {
    // on joue le son de la banque
    bank.draw.play();

    set((state) => {
      const fromKey = options?.fromDiscardPile ? "discard" : "deck";

      const hand = state.hand.slice();
      const from = state[fromKey].slice().filter((c) => {
        if (options?.type) return c.effect.type === options.type;
        return true;
      });

      const drawn: string[] = [];

      for (let i = 0; i < count; i++) {
        if (from.length === 0) {
          break;
        }

        const card = from.pop()!;

        card.state = "drawn";

        drawn.push(card.name);
        hand.push(card);
      }

      return {
        hand,
        [fromKey]: shuffle(
          state[fromKey].filter((c) => !drawn.includes(c.name)),
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
        if (c.state === "idle") {
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
        [...state.hand.map((c) => ({ ...c, state: null })), ...state[toKey]],
        2,
      ),
      hand: [],
    }));
  },

  /**
   * Place des cartes de la défausse dans le deck
   */
  recycle: async (count = 1) => {
    // on joue le son de la banque
    bank.gain.play();

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

  play: async (card) => {
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
    if (card.effect.condition && !eval(card.effect.condition)) {
      await cantPlay();

      return;
    }

    const payWith = typeof card.effect.cost === "number" ? "energy" : "money";
    const cost = Number(card.effect.cost);

    // on vérifie si on a assez d'énergie (state.energy >= effect.cost)
    if (state[payWith] < cost) {
      if (payWith === "energy") {
        // on vérifie si on a assez de réputation et d'énergie
        if (state.reputation + state.energy < cost) {
          await cantPlay();
          return;
        }

        // on retire toute l'énergie et on puise dans la réputation pour le reste
        const missingEnergy = cost - state.energy;

        set({ energy: 0 });

        await state.addReputation(-missingEnergy, { skipGameOverCheck: true });
      } else {
        await cantPlay();
        return;
      }
    } else {
      // on soustrait le coût de la carte à l'énergie
      set({ [payWith]: state[payWith] - cost });
    }

    // on joue le son de la banque
    bank.play.play();

    const thread1 = async () => {
      // on active l'animation de retrait de la carte
      set((state) => ({
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
        discard: card.ephemeral
          ? state.discard
          : shuffle([{ ...card, state: null }, ...state.discard], 3),
        hand: state.hand.filter((c) => c.name !== card.name),
      }));

      // on change de jour si besoin
      if (card.effect.type === "action") {
        await state.addDay();
      }
    };

    const thread2 = async () => {
      // si il ne s'agit que de pioche une carte, on attend avant de piocher
      if (/^await state.draw(.*?)$/.test(card.effect.onPlayed)) await wait();

      // on applique l'effet de la carte (toujours via eval)
      await eval(`(async () => { ${card.effect.onPlayed} })()`);
    };

    await Promise.all([thread1(), thread2()]);

    // on vérifie si la main est vide
    // si la main est vide, on pioche

    state = getState();

    if (state.isGameOver) return;

    // vérifier le game over par réputation

    if (state.reputation === 0) {
      // on joue le son de la banque
      bank.defeat.play();

      set({ isGameOver: true, isWon: false, reason: "reputation" });

      return;
    }

    if (state.hand.length === 0) {
      await state.draw();
    }

    // vérifier si le jeu est soft lock

    state = getState();

    const isMill = state.deck.length === 0 && state.hand.length === 0;
    const isSoftLocked = state.hand.every(
      (c) =>
        (c.effect.condition && !eval(c.effect.condition)) ||
        (typeof c.effect.cost === "number" &&
          c.effect.cost > state.energy + state.reputation) ||
        (typeof c.effect.cost === "string" &&
          Number(c.effect.cost) > state.money),
    );

    if (isMill || isSoftLocked) {
      set({
        isGameOver: true,
        isWon: false,
        reason: isMill ? "mill" : "soft-lock",
      });
    }
  },

  reset: () => {
    set(generateInitialState());

    bank.music.stop();
    bank.music.play();
  },
}));
