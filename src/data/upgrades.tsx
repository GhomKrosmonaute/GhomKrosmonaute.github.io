import type { RawUpgrade } from "@/game-typings"
import { MAX_HAND_SIZE, MAX_REPUTATION } from "@/game-constants.ts"
import { Money, Tag } from "@/components/game/Texts.tsx"

const upgrades: RawUpgrade[] = [
  {
    name: "Starbucks",
    eventName: "daily",
    image: "starbucks.png",
    description: (cumul) => (
      <>
        Gagne {cumul} <Tag name="energy" plural={cumul > 1} />
      </>
    ),
    condition: (state) => state.energy < state.energyMax,
    onTrigger: async (state, upgrade, reason) => {
      await state.addEnergy(upgrade.cumul, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 10,
    cost: { type: "money", value: 200 },
    tags: ["energy"],
  },
  {
    name: "Sport",
    eventName: "daily",
    image: "sport.png",
    description: (cumul) => (
      <>
        Augmente la <Tag name="reputation" /> de {cumul}
      </>
    ),
    condition: (state) => state.reputation < MAX_REPUTATION,
    onTrigger: async (state, upgrade, reason) => {
      await state.addReputation(upgrade.cumul, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: {
      type: "energy",
      value: 20,
    },
    tags: ["reputation"],
  },
  {
    name: "Méditation",
    eventName: "onPlay",
    image: "meditation.png",
    description: (cumul) => (
      <>
        <Tag name="draw" /> {cumul} carte{cumul > 1 && "s"} si tu as moins de 5
        cartes en main
      </>
    ),
    condition: (state) => state.draw.length > 0 && state.hand.length < 5,
    onTrigger: async (state, upgrade, reason) => {
      await state.drawCard(
        Math.min(upgrade.cumul, MAX_HAND_SIZE - state.hand.length),
        { skipGameOverPause: true, reason },
      )
    },
    max: 3,
    cost: { type: "money", value: 200 },
    tags: ["draw"],
  },
  {
    name: "Bourse",
    eventName: "weekly",
    image: "bourse.png",
    description: (cumul) => <>Gagne {cumul}% de ton capital</>,
    condition: (state) => state.money > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(Math.ceil(upgrade.cumul * (state.money / 100)), {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: { type: "money", value: 500 },
    tags: ["money"],
  },
  {
    name: "Recyclage",
    eventName: "onDraw",
    image: "recyclage.png",
    description: (cumul) => (
      <>
        <Tag name="recycle" /> {cumul} carte{cumul > 1 && "s"} aléatoire
        {cumul > 1 && "s"}
      </>
    ),
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.recycleCard({ reason, count: upgrade.cumul })
    },
    max: 5,
    cost: { type: "money", value: 150 },
    tags: ["recycle"],
  },
  {
    name: "I.A",
    eventName: "daily",
    image: "ia.png",
    description: (cumul) => (
      <>
        Gagne <Money M$={cumul} /> par carte en défausse
      </>
    ),
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.discard.length, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 10,
    cost: { type: "money", value: 500 },
    tags: ["money"],
  },
  {
    name: "PC Puissant",
    eventName: "daily",
    image: "pc-puissant.png",
    description: (cumul) => (
      <>
        Gagne <Money M$={cumul}></Money> par <Tag name="energy" /> en réserve
      </>
    ),
    condition: (state) => state.energy > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.energy, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 10,
    cost: { type: "money", value: 200 },
    tags: ["money"],
  },
  {
    name: "Stagiaire",
    eventName: "onPlay",
    image: "stagiaire.png",
    description: (cumul) => (
      <>
        Gagne <Money M$={cumul} /> par carte en main
      </>
    ),
    condition: (state) => state.hand.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.hand.length, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: { type: "money", value: 500 },
    tags: ["money"],
  },
  {
    name: "DevOps",
    eventName: "onEmptyHand",
    image: "devops.png",
    description: (cumul) => (
      <>
        <Tag name="draw" /> {cumul} carte{cumul > 1 && "s"}
      </>
    ),
    condition: (state) =>
      state.draw.length > 0 && state.hand.length < MAX_HAND_SIZE,
    onTrigger: async (state, upgrade, reason) => {
      await state.drawCard(
        Math.min(upgrade.cumul, MAX_HAND_SIZE - state.hand.length),
        { skipGameOverPause: true, reason },
      )
    },
    max: Math.floor(MAX_HAND_SIZE / 2),
    cost: { type: "money", value: 100 },
    tags: ["draw"],
  },
  {
    name: "Data Center",
    eventName: "onUpgradeThis",
    image: "data-center.png",
    description: () => (
      <>
        Augmente la taille de la jauge d'
        <Tag name="energy" /> de 5
      </>
    ),
    onTrigger: async (state, _, reason) => {
      await state.addMaxEnergy(5, { reason })
    },
    max: 4,
    cost: { type: "money", value: 250 },
    tags: ["energy"],
  },
  {
    name: "Méthode Agile",
    eventName: "onUpgradeThis",
    image: "agile.png",
    description: () => (
      <>
        Ajoute une option lors du <Tag name="pick">choix de carte</Tag>
      </>
    ),
    onTrigger: async (state) => {
      state.dangerouslyUpdate({
        choiceOptionCount: state.choiceOptionCount + 1,
      })
    },
    max: 3,
    cost: { type: "money", value: 500 },
    tags: ["pick"],
  },
  {
    name: "Anti-virus",
    eventName: "onReputationDeclines",
    description: (cumul) => (
      <>
        Gagne {cumul} <Tag name="energy" plural={cumul > 1} />
      </>
    ),
    image: "anti-virus.png",
    condition: (state) => state.energy < state.energyMax,
    onTrigger: async (state, upgrade, reason) => {
      await state.addEnergy(upgrade.cumul, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: { type: "money", value: 250 },
    tags: ["energy"],
  },
]

export default upgrades
