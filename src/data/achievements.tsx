import React from "react"
import type { GlobalGameState, GameState } from "@/hooks/useCardGame.tsx"
import { reviveCard } from "@/game-utils.ts"
import { RARITIES, MAX_HAND_SIZE } from "@/game-constants.ts"
import cards from "@/data/cards.tsx"
import upgrades from "@/data/upgrades.tsx"
import { fetchSettings, getRevivedDeck } from "@/game-safe-utils.tsx"
import { Money, Tag, RarityBadge } from "@/components/game/Texts.tsx"
import { t } from "@/i18n.ts"

const achievements: {
  id: string
  name: string
  description: React.ReactNode
  unlockCondition: (state: GameState & GlobalGameState) => boolean
}[] = [
  {
    id: "first-win",
    name: t("Première victoire", "First win"),
    description: t("Gagne une partie", "Win a game"),
    unlockCondition: (state) => state.wonGames >= 1,
  },
  {
    id: "conqueror",
    name: t("Conquérant", "Conqueror"),
    description: t("Gagne 5 parties", "Win 5 games"),
    unlockCondition: (state) => state.wonGames >= 5,
  },
  {
    id: "try-harder",
    name: "Try harder",
    description: t("Gagne 25 parties", "Win 25 games"),
    unlockCondition: (state) => state.wonGames >= 10,
  },
  {
    id: "master",
    name: t("Maître du jeu", "Game Master"),
    description: t(
      "Utilise 5 améliorations différentes en une partie",
      "Use 5 different upgrades in one game",
    ),
    unlockCondition: (state) => state.upgrades.length >= 5,
  },
  {
    id: "enutrof",
    name: "Enutrof",
    description: t(
      "Utilise toutes les améliorations économiques en une partie",
      "Use all economic upgrades in one game",
    ),
    unlockCondition: (state) =>
      upgrades
        .filter((raw) => raw.tags.includes("money"))
        .every((raw) =>
          state.upgrades.some((upgrade) => upgrade.name === raw.name),
        ),
  },
  {
    id: "eliatrop",
    name: "Eliatrop",
    description: t(
      "Utilise toutes les améliorations énergétiques en une partie",
      "Use all energy upgrades in one game",
    ),
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
    id: "ecaflip",
    name: "Ecaflip",
    description: (
      <>
        <Tag name="coinFlip" />{" "}
        {t("20 fois en une partie", "20 times in one game")}
      </>
    ),
    unlockCondition: (state) => state.coinFlips >= 20,
  },
  {
    id: "xelor",
    name: "Xelor",
    description: t(
      `Ai ${MAX_HAND_SIZE} cartes en main qui coutent zéro en même temps`,
      `Have ${MAX_HAND_SIZE} cards in hand that cost zero at the same time`,
    ),
    unlockCondition: (state) =>
      state.hand.filter(
        (card) => reviveCard(card, state).effect.cost.value <= 0,
      ).length >= 5,
  },
  {
    id: "sadida",
    name: "Sadida",
    description: (
      <>
        <Tag name="recycle" />{" "}
        {t("150 cartes en une partie", "150 cards in one game")}
      </>
    ),
    unlockCondition: (state) => state.recycledCards >= 150,
  },
  {
    id: "sacrieur",
    name: "Sacrieur",
    description: (
      <>
        <Tag name="discard" />{" "}
        {t("50 cartes en une partie", "50 cards in one game")}
      </>
    ),
    unlockCondition: (state) => state.discardedCards >= 50,
  },
  {
    id: "trader",
    name: "Trader",
    description: (
      <>
        {t("Ai 7 cartes", "Have 7 cards")} <Tag name="action" />{" "}
        {t("en main en même temps", "in hand at the same time")}
      </>
    ),
    unlockCondition: (state) =>
      state.hand.filter((card) => reviveCard(card, state).type === "action")
        .length >= 7,
  },
  {
    id: "billionaire",
    name: t("Milliardaire", "Billionaire"),
    description: (
      <>
        {t("Gagne", "Earn")} <Money M$={1000} />{" "}
        {t("en une partie", "in one game")}
      </>
    ),
    unlockCondition: (state) => state.money >= 1000,
  },
  {
    id: "collector",
    name: t("Collectionneur", "Collector"),
    description: t(
      "Découvre 30 cartes différentes",
      "Discover 30 different cards",
    ),
    unlockCondition: (state) => state.discoveries.length >= 30,
  },
  {
    id: "perfectionist",
    name: t("Perfectionniste", "Perfectionist"),
    description: (
      <>
        {t("Découvre toutes les cartes", "Discover all cards")}{" "}
        <Tag name="upgrade" />
      </>
    ),
    unlockCondition: (state) =>
      upgrades.every((raw) => state.discoveries.includes(raw.name)),
  },
  {
    id: "completionist",
    name: t("Complétionniste", "Completionist"),
    description: t("Découvre toutes les cartes", "Discover all cards"),
    unlockCondition: (state) => state.discoveries.length === cards.length,
  },
  {
    id: "retro-gamer",
    name: t("Retro gamer", "Retro gamer"),
    description: t("Utilise le Konami code", "Use the Konami code"),
    unlockCondition: (state) => state.debug,
  },
  {
    id: "theme-changer",
    name: t("Changer de thême", "Change theme"),
    description: t("Change le thême du jeu", "Change the game theme"),
    unlockCondition: () => fetchSettings().theme !== "default",
  },
  {
    id: "procrastinator",
    name: t("Procrastinateur", "Procrastinator"),
    description: (
      <>
        {t(
          "Faire durer la partie plus de 90",
          "Make the game last more than 90",
        )}{" "}
        <Tag name="day" plural />
      </>
    ),
    unlockCondition: (state) => state.day >= 90,
  },
  {
    id: "selective",
    name: t("Sélectif", "Selective"),
    description: (
      <>
        {t("Passer 20", "Skip 20")}{" "}
        <Tag name="pick">{t("choix de carte", "card choices")}</Tag>{" "}
        {t("en une partie", "in one game")}
      </>
    ),
    unlockCondition: (state) => state.skippedChoices >= 20,
  },
  {
    id: "day-night",
    name: t("Jour, nuit, jour, nuit...", "Day, night, day, night..."),
    description: t(
      "Passe du thème clair au thème sombre 2 fois",
      "Switch from light theme to dark theme 2 times",
    ),
    unlockCondition: () =>
      +(localStorage.getItem("Jour, nuit, jour, nuit...") ?? 0) >= 4,
  },
  {
    id: "time-is-money",
    name: t("Le temps c'est de l'argent", "Time is money"),
    description: (
      <>
        {t("Gagne", "Earn")} <Money M$={100} />{" "}
        {t("avant le deuxième", "before the second")} <Tag name="day" />
      </>
    ),
    unlockCondition: (state) => state.money >= 100 && state.day <= 1,
  },
  {
    id: "ultra-badass",
    name: t("Ultra badass", "Ultra badass"),
    description: (
      <>
        {t("Obtient une carte de", "Get a card of")} <Tag name="level" />{" "}
        <RarityBadge advantage={RARITIES.singularity} />{" "}
        {t("ou plus", "or higher")}
      </>
    ),
    unlockCondition: (state) =>
      getRevivedDeck(state).some((card) => card.rarity >= RARITIES.singularity),
  },
]

export default achievements
