import { Bold, Money, Tag } from "@/components/game/Texts.tsx"
import { MAX_HAND_SIZE, MAX_REPUTATION } from "@/game-constants.ts"
import type { RawUpgrade } from "@/game-typings"
import { t } from "@/i18n"

const upgrades: RawUpgrade[] = [
  {
    name: "Starbucks",
    eventName: "daily",
    image: "starbucks.png",
    description: (cumul) =>
      t(
        <>
          Gagne <Bold>{cumul}</Bold> <Tag name="energy" plural={cumul > 1} />
        </>,
        <>
          Gain <Bold>{cumul}</Bold> <Tag name="energy" plural={cumul > 1} />
        </>,
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
    description: (cumul) =>
      t(
        <>
          Augmente la <Tag name="reputation" /> de <Bold>{cumul}</Bold>
        </>,
        <>
          Increase the <Tag name="reputation" /> of <Bold>{cumul}</Bold>
        </>,
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
    description: (cumul) =>
      t(
        <>
          <Tag name="draw" /> <Bold>{cumul}</Bold> carte{cumul > 1 && "s"} si tu
          as moins de 5 cartes en main
        </>,
        <>
          <Tag name="draw" /> <Bold>{cumul}</Bold> card{cumul > 1 && "s"} if you
          have less than 5 cards in hand
        </>,
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
    description: (cumul) =>
      t(
        <>
          Gagne <Bold>{cumul}</Bold>% de ton capital
        </>,
        <>
          Gain <Bold>{cumul}</Bold>% of your capital
        </>,
      ),
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
    eventName: "daily",
    image: "recyclage.png",
    description: (cumul) =>
      t(
        <>
          <Tag name="recycle" /> <Bold>{cumul}</Bold> carte{cumul > 1 && "s"}{" "}
          aléatoire
          {cumul > 1 && "s"}
        </>,
        <>
          <Tag name="recycle" /> <Bold>{cumul}</Bold> random card
          {cumul > 1 && "s"}
        </>,
      ),
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.recycleCard({
        reason,
        count: upgrade.cumul,
        shuffleBefore: true,
      })

      await state.shuffleStack("draw")
    },
    max: 5,
    cost: { type: "money", value: 150 },
    tags: ["recycle"],
  },
  {
    name: "I.A",
    eventName: "daily",
    image: "ia.png",
    description: (cumul) =>
      t(
        <>
          Gagne <Money M$={cumul} /> par carte en défausse
        </>,
        <>
          Gain <Money M$={cumul} /> per card in discard
        </>,
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
    description: (cumul) =>
      t(
        <>
          Gagne <Money M$={cumul}></Money> par <Tag name="energy" /> en réserve
        </>,
        <>
          Gain <Money M$={cumul}></Money> per <Tag name="energy" /> in reserve
        </>,
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
    description: (cumul) =>
      t(
        <>
          Gagne <Money M$={cumul} /> par carte en main
        </>,
        <>
          Gain <Money M$={cumul} /> per card in hand
        </>,
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
    description: (cumul) =>
      t(
        <>
          <Tag name="draw" /> <Bold>{cumul}</Bold> carte{cumul > 1 && "s"}
        </>,
        <>
          <Tag name="draw" /> <Bold>{cumul}</Bold> card{cumul > 1 && "s"}
        </>,
      ),
    condition: (state) => state.draw.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.drawCard(Math.min(upgrade.cumul + 1, MAX_HAND_SIZE), {
        skipGameOverPause: true,
        reason,
      })
    },
    max: Math.floor(MAX_HAND_SIZE / 2),
    cost: { type: "money", value: 100 },
    tags: ["draw"],
  },
  {
    name: "Data Center",
    eventName: "onUpgradeThis",
    image: "data-center.png",
    description: () =>
      t(
        <>
          Augmente la taille de la jauge d'
          <Tag name="energy" /> de 5
        </>,
        <>
          Increase the size of the <Tag name="energy" /> gauge by 5
        </>,
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
    description: () =>
      t(
        <>
          Ajoute une option lors du <Tag name="pick">choix de carte</Tag>
        </>,
        <>
          Adds an option during the <Tag name="pick">card choice</Tag>
        </>,
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
    description: (cumul) =>
      t(
        <>
          Gagne <Bold>{cumul}</Bold> <Tag name="energy" plural={cumul > 1} />
        </>,
        <>
          Gain <Bold>{cumul}</Bold> <Tag name="energy" plural={cumul > 1} />
        </>,
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
