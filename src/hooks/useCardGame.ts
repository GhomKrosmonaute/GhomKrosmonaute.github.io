import { create } from "zustand";
import projects from "../data/projects.json";
import technos from "../data/techno.json";
import effects from "../data/effects.json";

async function wait() {
  return new Promise((resolve) => setTimeout(resolve, 500));
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
    ((value - start1) / (stop1 - start1)) * (start2 - stop2) + start2;
  if (!withinBounds) {
    return newValue;
  }
  if (start2 < stop2) {
    return Math.max(Math.min(newValue, stop2), start2);
  } else {
    return Math.max(Math.min(newValue, start2), stop2);
  }
}

export function isProjectCardInfo(
  card: GameCardInfo,
): card is ProjectCardInfo & { state: GameCardState } {
  return (card as ProjectCardInfo).image !== undefined;
}

export interface Effect {
  description: string;
  onPlayed: string;
  type: string;
  cost: number;
  condition?: string;
}

export interface ProjectCardInfo {
  name: string;
  image: string;
  description: string;
  effect: Effect;
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
};

interface CardGameState {
  deck: GameCardInfo[];
  hand: GameCardInfo[];
  energy: number;
  streetCred: number;
  addEnergy: (count: number) => void;
  addStreetCred: (count: number) => void;
  draw: (count: number) => void;
  drop: () => void;
  play: (card: GameCardInfo) => void;
}

const supports = effects.filter((effect) => effect.type === "support");
const actions = effects.filter((effect) => effect.type === "action");

const technoWithEffect = technos.map((techno, i) => {
  return {
    ...techno,
    state: "idle" as const,
    effect:
      supports[Math.floor(map(i, 0, technos.length, 0, supports.length, true))],
  };
});

const projectsWithEffect = projects.map((project, i) => {
  return {
    ...project,
    state: "idle" as const,
    effect:
      actions[Math.floor(map(i, 0, projects.length, 0, actions.length, true))],
  };
});

const deck = [...technoWithEffect, ...projectsWithEffect].sort(
  () => Math.random() - 0.5,
);

export const useCardGame = create<CardGameState>((set, getState) => ({
  deck: deck.slice(7),
  hand: deck.slice(0, 7),
  energy: 10,
  streetCred: 0,
  addEnergy: (count: number) => {
    set((state) => {
      return { energy: state.energy + count };
    });
  },
  addStreetCred: (count: number) => {
    set((state) => {
      return { streetCred: state.streetCred + count };
    });
  },
  draw: async (count = 1) => {
    set((state) => {
      const deck = state.deck.slice();
      const hand = state.hand.slice();

      for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
          break;
        }

        const card = deck.pop()!;

        card.state = "drawn";

        hand.push(card);
      }

      return { deck, hand };
    });

    await wait();

    // on passe la main en idle
    set((state) => ({
      hand: state.hand.map((c) => {
        return { ...c, state: "idle" };
      }),
    }));
  },
  drop: async () => {
    const state = getState();

    const hand = state.hand.slice();

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
    set({
      deck: [...state.deck, { ...card, state: null }],
      hand: state.hand.filter((c) => c.name !== card.name),
    });
  },
  play: async (card: GameCardInfo) => {
    const state = getState();

    // on vérifie la condition s'il y en a une (eval(effect.condition))
    if (card.effect.condition && !eval(card.effect.condition)) {
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

      return;
    }

    // on vérifie si on a assez d'énergie (state.energy >= effect.cost)
    if (state.energy < card.effect.cost) {
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

      return;
    }

    // on soustrait le coût de la carte à l'énergie
    set({ energy: state.energy - card.effect.cost });

    // on active l'animation de retrait de la carte
    set({
      hand: state.hand.map((c) => {
        if (c.name === card.name) {
          return { ...c, state: "played" };
        }
        return c;
      }),
    });

    // on attend la fin de l'animation
    await wait();

    // on applique l'effet de la carte (toujours via eval)
    eval(`(async () => { ${card.effect.onPlayed} })()`);

    // la carte retourne dans le deck et on retire la carte de la main
    set((state) => ({
      deck: [...state.deck, { ...card, state: null }],
      hand: state.hand.filter((c) => c.name !== card.name),
    }));
  },
}));
