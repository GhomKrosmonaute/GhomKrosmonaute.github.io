import type { GlobalGameState, GameState } from "@/hooks/useCardGame.ts"
import { reviveCard } from "@/game-utils.ts"
import { MAX_HAND_SIZE } from "@/game-constants.ts"
import cards from "@/data/cards.ts"
import upgrades from "@/data/upgrades.ts"
import { fetchSettings } from "@/game-safe-utils.ts"

const achievements: {
  name: string
  description: string
  unlockCondition: (state: GameState & GlobalGameState) => boolean
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
    name: "Try harder",
    description: "Gagner 25 parties",
    unlockCondition: (state) => state.wonGames >= 10,
  },
  {
    name: "Maître du jeu",
    description: "Utiliser 5 améliorations différentes en une partie",
    unlockCondition: (state) => state.upgrades.length >= 5,
  },
  {
    name: "Enutrof",
    description: "Utiliser toutes les améliorations économiques en une partie",
    unlockCondition: (state) =>
      upgrades
        .filter((raw) => raw.description.includes("M$"))
        .every((raw) =>
          state.upgrades.some((upgrade) => upgrade[0] === raw.name),
        ),
  },
  {
    name: "Eliatrop",
    description: "Utiliser toutes les améliorations énergétiques en une partie",
    unlockCondition: (state) =>
      upgrades
        .filter((raw) => raw.description.includes("@energy"))
        .every((raw) =>
          state.upgrades.some((upgrade) => upgrade[0] === raw.name),
        ),
  },
  {
    name: "Ecaflip",
    description: "Faire 20 lancés de pièce en une partie",
    unlockCondition: (state) => state.coinFlips >= 20,
  },
  {
    name: "Xelor",
    description: `Avoir ${MAX_HAND_SIZE} cartes en main qui coutent zéro`,
    unlockCondition: (state) =>
      state.hand.filter(
        (card) => reviveCard(card, state).effect.cost.value === 0,
      ).length >= 5,
  },
  {
    name: "Sadida",
    description: "Recycler 150 cartes en une partie",
    unlockCondition: (state) => state.recycledCards >= 150,
  },
  {
    name: "Sacrieur",
    description: "Défausser 50 cartes en une partie",
    unlockCondition: (state) => state.discardedCards >= 50,
  },
  {
    name: "Trader",
    description: "Avoir 7 cartes @action en main",
    unlockCondition: (state) =>
      state.hand.filter((card) => reviveCard(card, state).type === "action")
        .length >= 7,
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
    name: "Perfectionniste",
    description: "Découvrir toutes les cartes @upgrade",
    unlockCondition: (state) =>
      upgrades.every((raw) => state.discoveries.includes(raw.name)),
  },
  {
    name: "Complétionniste",
    description: "Découvrir toutes les cartes",
    unlockCondition: (state) => state.discoveries.length === cards.length,
  },
  {
    name: "Retro gamer",
    description: "Utiliser le Konami code",
    unlockCondition: (state) => state.debug,
  },
  {
    name: "Changer de thême",
    description: "Changer le thême du jeu",
    unlockCondition: () => fetchSettings().theme !== "default",
  },
  {
    name: "Procrastinateur",
    description: "Faire durer la partie plus de 90 jours",
    unlockCondition: (state) => state.day >= 90,
  },
  {
    name: "Sélectif",
    description: "Passer 20 choix de carte en une partie",
    unlockCondition: (state) => state.skippedChoices >= 20,
  },
  {
    name: "Jour, nuit, jour, nuit...",
    description: "Passer du thème clair au thème sombre 2 fois",
    unlockCondition: () =>
      +(localStorage.getItem("Jour, nuit, jour, nuit...") ?? 0) >= 4,
  },
]

export default achievements
