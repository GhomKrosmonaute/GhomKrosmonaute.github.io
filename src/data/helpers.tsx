import React from "react"

import { Bold, Money, Tag } from "@/components/game/Texts.tsx"
import { MAX_HAND_SIZE, MONEY_TO_REACH } from "@/game-constants.ts"
import type { GameOverReason } from "@/game-typings.ts"

import { t } from "@/i18n"

const helpers = {
  consumeReputation: t(
    <>
      Lorsque tu n'as plus d'
      <Tag name="energy" />, tu consommes la <Tag name="reputation" />.
    </>,
    <>
      When you run out of <Tag name="energy" />, you consume{" "}
      <Tag name="reputation" />.
    </>,
  ),
  emptyReputation: t(
    <>
      Si tu n'as plus de <Tag name="reputation" />, tu perds la partie.
    </>,
    <>
      If you have no <Tag name="reputation" /> left, you lose the game.
    </>,
  ),
  cantPlay: t(
    "Si tu ne peux plus jouer de carte, tu perds la partie.",
    "If you can no longer play a card, you lose the game.",
  ),
  playedToDiscard: t(
    "Quand une carte est jouée, elle va dans la défausse.",
    "When a card is played, it goes to the discard pile.",
  ),
  supportInterest: t(
    <>
      Les cartes <Tag name="support" /> sont importantes pour toujours avoir des
      cartes à jouer.
    </>,
    <>
      <Tag name="support" /> cards are important to always have cards to play.
    </>,
  ),
  costDollars: t(
    <>
      Certaines cartes coutent de l'
      <Tag name="money" /> pour être jouées.
    </>,
    <>
      Some cards cost <Tag name="money" /> to be played.
    </>,
  ),
  limitedDraw: t(
    "Votre pioche est limitée. Jouez prudemment !",
    "Your draw is limited. Play carefully!",
  ),
  actionGivesResources: t(
    <>
      Les cartes <Tag name="action" /> donnent souvent des resources
    </>,
    <>
      <Tag name="action" /> cards often provide resources
    </>,
  ),
  upgradesAreActions: t(
    <>
      Les cartes <Tag name="upgrade" /> sont considérées comme des cartes{" "}
      <Tag name="action" />.
    </>,
    <>
      <Tag name="upgrade" /> cards are considered as <Tag name="action" />{" "}
      cards.
    </>,
  ),
  ephemeralDestroyed: t(
    <>
      Les cartes <Tag name="ephemeral" plural /> sont détruites après
      utilisation.
    </>,
    <>
      <Tag name="ephemeral" plural /> cards are destroyed after use.
    </>,
  ),
  recyclageToDraw: t(
    <>
      Les cartes <Tag name="recyclage" /> retournent dans la pioche.
    </>,
    <>
      <Tag name="recyclage" /> cards return to the draw pile.
    </>,
  ),
  upgradesCumulable: t(
    <>
      Les effets des <Tag name="upgrade" plural /> sont cumulables !
    </>,
    <>
      The effects of <Tag name="upgrade" plural /> are cumulative!
    </>,
  ),
  maxHandSize: t(
    <>Tu ne peux pas avoir plus de {MAX_HAND_SIZE} cartes en main.</>,
    <>You cannot have more than {MAX_HAND_SIZE} cards in hand.</>,
  ),
  overDraw: t(
    "Les cartes piochées en trop restent dans la pioche.",
    "Excess drawn cards remain in the draw pile.",
  ),
  upgradeCostThreshold: t(
    <>
      Le prix des cartes d'
      <Tag name="upgrade" /> augmente progressivement.
    </>,
    <>
      The cost of <Tag name="upgrade" /> cards increases gradually.
    </>,
  ),
  winCondition: t(
    <>
      Si tu obtiens <Money M$={MONEY_TO_REACH} />, tu gagnes la partie.
    </>,
    <>
      If you obtain <Money M$={MONEY_TO_REACH} />, you win the game.
    </>,
  ),
  sprintsAreWeek: t(
    <>
      Chaque <Tag name="sprint" /> contient une semaine (7{" "}
      <Tag name="day" plural />
      ).
    </>,
    <>
      Each <Tag name="sprint" /> contains a week (7 <Tag name="day" plural />
      ).
    </>,
  ),
  sprintReward: t(
    <>
      A la fin d'un <Tag name="sprint" />, tu ajoutes une carte{" "}
      <Tag name="upgrade" /> et une carte <Tag name="action" /> à ton deck.
    </>,
    <>
      At the end of a <Tag name="sprint" />, you add an <Tag name="upgrade" />{" "}
      card and an <Tag name="action" /> card to your deck.
    </>,
  ),
  cardsAdvancesTime: t(
    <>
      Chaque carte jouée fait avancer le temps en fonction de son cout en{" "}
      <Tag name="energy" />.
    </>,
    <>
      Each card played advances time based on its <Tag name="energy" /> cost.
    </>,
  ),
  rightClicDetail: t(
    <>
      Fait un <Bold>clic droit</Bold> sur une carte pour avoir plus
      d'informations.
    </>,
    <>Right-click on a card for more information.</>,
  ),
  recycleTarget: t(
    <>
      Une carte qui <Tag name="recycle" /> sort une cible de la défausse pour la
      remettre dans la pioche.
    </>,
    <>
      A card that <Tag name="recycle" /> takes a target from the discard pile
      and puts it back into the draw pile.
    </>,
  ),
  dailyReward: t(
    <>
      Chaque <Tag name="day" />, tu ajoutes une nouvelle carte à ta pioche.
    </>,
    <>
      Each <Tag name="day" />, you add a new card to your draw pile.
    </>,
  ),
  permanentSave: t(
    "Quittez et revenez quand vous le voulez, tout est sauvegardé !",
    "Leave and return whenever you want, everything is saved!",
  ),
  konamiCode: t(
    "Ce jeu a un petit point commun avec les jeux Konami...",
    "This game has a little something in common with Konami games...",
  ),
  inflation: t(
    <>
      Tous les 28 <Tag name="day" plural />, l'
      <Tag name="inflation" /> diminue le <Tag name="level" /> des cartes.
    </>,
    <>
      Every 28 <Tag name="day" plural />, <Tag name="inflation" /> decreases the{" "}
      <Tag name="level" /> of the cards.
    </>,
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
