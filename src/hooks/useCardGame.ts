import { create } from "zustand";
import projects from "../data/projects.json";
import technos from "../data/techno.json";
import effects from "../data/effects.json";

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

export function isProjectCardInfo(card: GameCardInfo): card is ProjectCardInfo {
  return (card as ProjectCardInfo).image !== undefined;
}

export interface Effect {
  description: string;
  onPlayed: string;
  type: string;
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

export type GameCardInfo = ProjectCardInfo | TechnoCardInfo;

interface CardGameState {
  deck: GameCardInfo[];
  hand: GameCardInfo[];
  draw: (count: number) => void;
  drop: (index: number) => void;
}

const technoWithEffect = technos.map((techno, i) => {
  const supports = effects.filter((effect) => effect.type === "support");

  return {
    ...techno,
    effect:
      supports[Math.floor(map(i, 0, technos.length, 0, supports.length, true))],
  };
});

const projectsWithEffect = projects.map((project, i) => {
  const actions = effects.filter((effect) => effect.type === "action");

  return {
    ...project,
    effect:
      actions[Math.floor(map(i, 0, projects.length, 0, actions.length, true))],
  };
});

const deck = [...technoWithEffect, ...projectsWithEffect].sort(
  () => Math.random() - 0.5,
);

export const useCardGame = create<CardGameState>((set) => ({
  deck: deck.slice(7),
  hand: deck.slice(0, 7),
  draw: (count: number) => {
    set((state) => {
      const deck = state.deck.slice();
      const hand = state.hand.slice();

      for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
          break;
        }

        hand.push(deck.pop()!);
      }

      return { deck, hand };
    });
  },
  drop: (index: number) => {
    set((state) => {
      const deck = state.deck.slice();
      const hand = state.hand.slice();

      deck.push(hand[index]);
      hand.splice(index, 1);

      return { deck, hand };
    });
  },
}));
