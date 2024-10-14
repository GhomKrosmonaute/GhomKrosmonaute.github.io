import React from "react"

import { Bold, Money, Tag } from "@/components/game/Texts.tsx"
import { MAX_HAND_SIZE, MONEY_TO_REACH } from "@/game-constants.ts"
import type { GameOverReason } from "@/game-typings.ts"

const helpers = {
  consumeReputation: (
    <>
      Lorsque tu n'as plus d'
      <Tag name="energy" />, tu consommes la <Tag name="reputation" />.
    </>
  ),
  emptyReputation: (
    <>
      Si tu n'as plus de <Tag name="reputation" />, tu perds la partie.
    </>
  ),
  cantPlay: "Si tu ne peux plus jouer de carte, tu perds la partie.",
  playedToDiscard: "Quand une carte est jouée, elle va dans la défausse.",
  supportInterest: (
    <>
      Les cartes <Tag name="support" /> sont importantes pour toujours avoir des
      cartes à jouer.
    </>
  ),
  costDollars: (
    <>
      Certaines cartes coutent de l'
      <Tag name="money" /> pour être jouées.
    </>
  ),
  limitedDraw: "Votre pioche est limitée. Jouez prudemment !",
  actionGivesResources: (
    <>
      Les cartes <Tag name="action" /> donnent souvent des resources
    </>
  ),
  upgradesAreActions: (
    <>
      Les cartes <Tag name="upgrade" /> sont considérées comme des cartes{" "}
      <Tag name="action" />.
    </>
  ),
  ephemeralDestroyed: (
    <>
      Les cartes <Tag name="ephemeral" plural /> sont détruites après
      utilisation.
    </>
  ),
  recyclageToDraw: (
    <>
      Les cartes <Tag name="recyclage" /> retournent dans la pioche.
    </>
  ),
  upgradesCumulable: (
    <>
      Les effets des <Tag name="upgrade" plural /> sont cumulables !
    </>
  ),
  maxHandSize: (
    <>Tu ne peux pas avoir plus de {MAX_HAND_SIZE} cartes en main.</>
  ),
  overDraw: "Les cartes piochées en trop restent dans la pioche.",
  upgradeCostThreshold: (
    <>
      Le prix des cartes d'
      <Tag name="upgrade" /> augmente progressivement.
    </>
  ),
  winCondition: (
    <>
      Si tu obtiens <Money M$={MONEY_TO_REACH} />, tu gagnes la partie.
    </>
  ),
  sprintsAreWeek: (
    <>
      Chaque <Tag name="sprint" /> contient une semaine (7{" "}
      <Tag name="day" plural />
      ).
    </>
  ),
  sprintReward: (
    <>
      A la fin d'un <Tag name="sprint" />, tu ajoutes une carte{" "}
      <Tag name="upgrade" /> et une carte <Tag name="action" /> à ton deck.
    </>
  ),
  cardsAdvancesTime: (
    <>
      Chaque carte jouée fait avancer le temps en fonction de son cout en{" "}
      <Tag name="energy" />.
    </>
  ),
  rightClicDetail: (
    <>
      Fait un <Bold>clic droit</Bold> sur une carte pour avoir plus
      d'informations.
    </>
  ),
  recycleTarget: (
    <>
      Une carte qui <Tag name="recycle" /> sort une cible de la défausse pour la
      remettre dans la pioche.
    </>
  ),
  dailyReward: (
    <>
      Chaque <Tag name="day" />, tu ajoutes une nouvelle carte à ta pioche.
    </>
  ),
  permanentSave:
    "Quittez et revenez quand vous le voulez, tout est sauvegardé !",
  konamiCode: "Ce jeu a un petit point commun avec les jeux Konami...",
  inflation: (
    <>
      Tous les 28 <Tag name="day" plural />, l'
      <Tag name="inflation" /> diminue le <Tag name="level" /> des cartes.
    </>
  ),
} satisfies Record<string, React.ReactNode>

export const gameOverHelpers: Record<
  GameOverReason & string,
  (keyof typeof helpers)[]
> = {
  // la réputation est vide.
  reputation: ["consumeReputation", "emptyReputation", "winCondition"],
  // la pioche et la main sont vides.
  mill: [
    "ephemeralDestroyed",
    "limitedDraw",
    "playedToDiscard",
    "cantPlay",
    "supportInterest",
    "recyclageToDraw",
    "recycleTarget",
    "winCondition",
  ],
  // la main est injouable.
  "soft-lock": [
    "costDollars",
    "upgradeCostThreshold",
    "actionGivesResources",
    "inflation",
    "winCondition",
  ],
  // il n'y a plus de carte dans la pioche.
  "mill-lock": [
    "overDraw",
    "cardsAdvancesTime",
    "upgradesAreActions",
    "upgradesCumulable",
    "maxHandSize",
    "winCondition",
  ],
}

export default helpers
