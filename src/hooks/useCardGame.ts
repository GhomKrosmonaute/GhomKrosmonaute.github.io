import { create } from "zustand";
import projects from "../data/projects.json";
import technos from "../data/techno.json";

interface Project {
  name: string;
  image: string;
  description: string;
  effect: string;
  onPlayed: string;
}

interface Techno {
  name: string;
  logo: string;
}

export type GameCardInfo = Project | Techno;

interface CardGameState {
  deck: GameCardInfo[];
  hand: GameCardInfo[];
  draw: (count: number) => void;
  drop: (index: number) => void;
}

const deck = [...technos, ...projects].sort(() => Math.random() - 0.5);

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
