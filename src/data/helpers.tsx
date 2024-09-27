import React from "react"

import { Money, Tag } from "@/components/game/Texts.tsx"
import { MAX_HAND_SIZE, MONEY_TO_REACH } from "@/game-constants.ts"

const helpers: React.ReactNode[] = [
  "Si tu ne peux plus jouer de carte, tu perds la partie.",
  "Quand une carte est jouée, elle va dans la défausse.",
  <>
    Les cartes <Tag name="support" /> sont importantes pour toujours avoir des
    cartes à jouer.
  </>,
  "Certaines cartes coutent des dollars pour être jouées.",
  "Votre pioche est limitée. Jouez prudemment !",
  <>
    Les cartes <Tag name="action" /> ont une entête bleue.
  </>,
  <>
    Les cartes <Tag name="upgrade" /> sont considérées comme des cartes{" "}
    <Tag name="action" />.
  </>,
  <>
    Lorsque tu n'as plus d'
    <Tag name="energy" />, tu consommes la <Tag name="reputation" />.
  </>,
  <>
    Si tu n'as plus de <Tag name="reputation" />, tu perds la partie.
  </>,
  <>
    Les cartes <Tag name="ephemeral" plural /> sont détruites après utilisation.
  </>,
  <>
    Les cartes <Tag name="recyclage" /> retournent dans la pioche.
  </>,
  <>
    Les effets des <Tag name="upgrade" plural /> sont cumulables !
  </>,
  <>Tu ne peux pas avoir plus de {MAX_HAND_SIZE} cartes en main.</>,
  "Les cartes piochées en trop restent dans la pioche.",
  <>
    Le prix des cartes d'
    <Tag name="upgrade" /> augmente progressivement.
  </>,
  <>
    Si tu obtiens <Money M$={MONEY_TO_REACH} />, tu gagnes la partie.
  </>,
  <>
    Chaque <Tag name="sprint" /> contient une semaine (7{" "}
    <Tag name="day" plural />
    ).
  </>,
  <>
    A la fin d'un <Tag name="sprint" />, tu ajoutes une carte{" "}
    <Tag name="upgrade" /> et une carte <Tag name="action" /> à ton deck.
  </>,
  <>
    Chaque carte jouée fait avancer le temps en fonction de son cout en{" "}
    <Tag name="energy" />.
  </>,
  "Fait un clic droit sur une carte pour avoir plus d'informations.",
  <>
    Une carte qui <Tag name="recycle" /> sort une de la défausse pour la
    remettre dans la pioche.
  </>,
  <>
    Chaque <Tag name="day" />, tu ajoutes une nouvelle carte à ta pioche.
  </>,
  "Quittez et revenez quand vous le voulez, tout est sauvegardé !",
  "Plus une carte jouée est chère, plus elle fait avancer le temps.",
  "Ce jeu a un petit point commun avec les jeux Konami...",
  <>
    Tous les 28 <Tag name="day" plural />, l'
    <Tag name="inflation" /> diminue le <Tag name="level" /> des cartes.
  </>,
]

export default helpers
