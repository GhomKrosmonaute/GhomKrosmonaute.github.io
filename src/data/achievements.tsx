import React from "react"
import type { GlobalGameState, GameState } from "@/hooks/useCardGame.tsx"
import { reviveCard } from "@/game-utils.ts"
import { RARITIES, MAX_HAND_SIZE } from "@/game-constants.ts"
import cards from "@/data/cards.tsx"
import upgrades from "@/data/upgrades.tsx"
import { fetchSettings, getRevivedDeck } from "@/game-safe-utils.tsx"
import { Money, Tag, RarityBadge } from "@/components/game/Texts.tsx"

const achievements: {
  name: string
  description: React.ReactNode
  unlockCondition: (state: GameState & GlobalGameState) => boolean
}[] = [
  {
    name: "Première victoire",
    description: "Gagne une partie",
    unlockCondition: (state) => state.wonGames >= 1,
  },
  {
    name: "Conquérant",
    description: "Gagne 5 parties",
    unlockCondition: (state) => state.wonGames >= 5,
  },
  {
    name: "Try harder",
    description: "Gagne 25 parties",
    unlockCondition: (state) => state.wonGames >= 10,
  },
  {
    name: "Maître du jeu",
    description: "Utilise 5 améliorations différentes en une partie",
    unlockCondition: (state) => state.upgrades.length >= 5,
  },
  {
    name: "Enutrof",
    description: "Utilise toutes les améliorations économiques en une partie",
    unlockCondition: (state) =>
      upgrades
        .filter((raw) => raw.tags.includes("money"))
        .every((raw) =>
          state.upgrades.some((upgrade) => upgrade.name === raw.name),
        ),
  },
  {
    name: "Eliatrop",
    description: "Utilise toutes les améliorations énergétiques en une partie",
    unlockCondition: (state) =>
      upgrades
        .filter(
          (raw) =>
            raw.tags.includes("energy") || raw.tags.includes("reputation"),
        )
        .every((raw) =>
          state.upgrades.some((upgrade) => upgrade.name === raw.name),
        ),
  },
  {
    name: "Ecaflip",
    description: (
      <>
        <Tag name="coinFlip" /> 20 fois en une partie
      </>
    ),
    unlockCondition: (state) => state.coinFlips >= 20,
  },
  {
    name: "Xelor",
    description: `Avoir ${MAX_HAND_SIZE} cartes en main qui coutent zéro en même temps`,
    unlockCondition: (state) =>
      state.hand.filter(
        (card) => reviveCard(card, state).effect.cost.value === 0,
      ).length >= 5,
  },
  {
    name: "Sadida",
    description: (
      <>
        <Tag name="recycle" /> 150 cartes en une partie
      </>
    ),
    unlockCondition: (state) => state.recycledCards >= 150,
  },
  {
    name: "Sacrieur",
    description: (
      <>
        <Tag name="discard" /> 50 cartes en une partie
      </>
    ),
    unlockCondition: (state) => state.discardedCards >= 50,
  },
  {
    name: "Trader",
    description: (
      <>
        Ai 7 cartes <Tag name="action" /> en main en même temps
      </>
    ),
    unlockCondition: (state) =>
      state.hand.filter((card) => reviveCard(card, state).type === "action")
        .length >= 7,
  },
  {
    name: "Milliardaire",
    description: (
      <>
        Gagne <Money M$={1000} /> en une partie
      </>
    ),
    unlockCondition: (state) => state.money >= 1000,
  },
  {
    name: "Collectionneur",
    description: "Découvre 30 cartes différentes",
    unlockCondition: (state) => state.discoveries.length >= 30,
  },
  {
    name: "Perfectionniste",
    description: (
      <>
        Découvrir toutes les cartes <Tag name="upgrade" />
      </>
    ),
    unlockCondition: (state) =>
      upgrades.every((raw) => state.discoveries.includes(raw.name)),
  },
  {
    name: "Complétionniste",
    description: "Découvre toutes les cartes",
    unlockCondition: (state) => state.discoveries.length === cards.length,
  },
  {
    name: "Retro gamer",
    description: "Utilise le Konami code",
    unlockCondition: (state) => state.debug,
  },
  {
    name: "Changer de thême",
    description: "Change le thême du jeu",
    unlockCondition: () => fetchSettings().theme !== "default",
  },
  {
    name: "Procrastinateur",
    description: (
      <>
        Faire durer la partie plus de 90 <Tag name="day" plural />
      </>
    ),
    unlockCondition: (state) => state.day >= 90,
  },
  {
    name: "Sélectif",
    description: (
      <>
        Passer 20 <Tag name="pick">choix de carte</Tag> en une partie
      </>
    ),
    unlockCondition: (state) => state.skippedChoices >= 20,
  },
  {
    name: "Jour, nuit, jour, nuit...",
    description: "Passe du thème clair au thème sombre 2 fois",
    unlockCondition: () =>
      +(localStorage.getItem("Jour, nuit, jour, nuit...") ?? 0) >= 4,
  },
  {
    name: "Le temps c'est de l'argent",
    description: (
      <>
        Gagne <Money M$={100} /> avant le deuxième <Tag name="day" />
      </>
    ),
    unlockCondition: (state) => state.money >= 100 && state.day <= 2,
  },
  {
    name: "Ultra badass",
    description: (
      <>
        Obtient une carte de <Tag name="level" />{" "}
        <RarityBadge advantage={RARITIES.singularity} /> ou plus
      </>
    ),
    unlockCondition: (state) =>
      getRevivedDeck(state).some((card) => card.rarity >= RARITIES.singularity),
  },
]

export default achievements
