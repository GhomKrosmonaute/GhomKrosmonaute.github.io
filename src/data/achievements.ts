import type { CardGame, CardGameState } from "@/hooks/useCardGame.ts";
import cards from "@/data/cards.ts";
import { reviveCard } from "@/game-utils.ts";

const achievements: {
  name: string;
  description: string;
  unlockCondition: (state: CardGameState & CardGame) => boolean;
}[] = [
  {
    name: "Première victoire",
    description: "Gagner une partie",
    unlockCondition: (state) => state.wonGames >= 1,
  },
  {
    name: "Conquérant",
    description: "Gagner 5 parties",
    unlockCondition: (state) => state.wonGames >= 5,
  },
  {
    name: "Maître du jeu",
    description: "Utiliser 5 améliorations différentes",
    unlockCondition: (state) => state.upgrades.length >= 5,
  },
  {
    name: "Trader",
    description: "Avoir 5 cartes @action en main",
    unlockCondition: (state) =>
      state.hand.filter((card) => reviveCard(card).type === "action").length >=
      5,
  },
  {
    name: "Milliardaire",
    description: "Obtenir 1000M$",
    unlockCondition: (state) => state.money >= 1000,
  },
  {
    name: "Collectionneur",
    description: "Découvrir 20 cartes différentes",
    unlockCondition: (state) => state.discoveries.length >= 20,
  },
  {
    name: "Complétionniste",
    description: "Découvrir toutes les cartes",
    unlockCondition: (state) => state.discoveries.length === cards.length,
  },
];

export default achievements;
