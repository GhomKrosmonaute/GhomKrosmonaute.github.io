import type { RawUpgrade } from "@/game-typings"
import { MAX_HAND_SIZE, MAX_REPUTATION } from "@/game-constants.ts"

const upgrades: RawUpgrade[] = [
  {
    name: "Starbucks",
    eventName: "daily",
    description: "Rend @cumul @energy$s",
    image: "starbucks.png",
    condition: (state) => state.energy < state.energyMax,
    onTrigger: async (state, upgrade, reason) => {
      await state.addEnergy(upgrade.cumul, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 10,
    cost: { type: "money", value: 100 },
  },
  {
    name: "Sport",
    eventName: "daily",
    description: "Gagne @cumul @reputation$s",
    image: "sport.png",
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
  },
  {
    name: "Méditation",
    eventName: "onPlay",
    description: "Pioche @cumul carte$s si tu as moins de 5 cartes en main",
    image: "meditation.png",
    condition: (state) => state.draw.length > 0 && state.hand.length < 5,
    onTrigger: async (state, upgrade, reason) => {
      await state.drawCard(
        Math.min(upgrade.cumul, MAX_HAND_SIZE - state.hand.length),
        { skipGameOverPause: true, reason },
      )
    },
    max: 3,
    cost: { type: "money", value: 100 },
  },
  {
    name: "Bourse",
    eventName: "weekly",
    description: "Gagne @cumul% de ton capital",
    image: "bourse.png",
    condition: (state) => state.money > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(Math.ceil(upgrade.cumul * (state.money / 100)), {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: { type: "money", value: 100 },
  },
  {
    name: "Recyclage",
    eventName: "onDraw",
    description: "@recycle @cumul carte$s aléatoire$s de la défausse",
    image: "recyclage.png",
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.recycleCard(upgrade.cumul, { reason })
    },
    max: 5,
    cost: { type: "money", value: 50 },
  },
  {
    name: "I.A",
    eventName: "weekly",
    description: "Gagne @cumulM$ par carte en défausse",
    image: "ia.png",
    condition: (state) => state.discard.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.discard.length, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 10,
    cost: { type: "money", value: 100 },
  },
  {
    name: "PC Puissant",
    eventName: "daily",
    description: "Gagne @cumulM$ par @energy en réserve",
    image: "pc-puissant.png",
    condition: (state) => state.energy > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.energy, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 10,
    cost: { type: "money", value: 100 },
  },
  {
    name: "Stagiaire",
    eventName: "onPlay",
    description: "Gagne @cumulM$ par cartes en main",
    image: "stagiaire.png",
    condition: (state) => state.hand.length > 0,
    onTrigger: async (state, upgrade, reason) => {
      await state.addMoney(upgrade.cumul * state.hand.length, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: { type: "money", value: 50 },
  },
  {
    name: "DevOps",
    eventName: "onEmptyHand",
    description: "Pioche @cumul carte$s",
    image: "devops.png",
    condition: (state) =>
      state.draw.length > 0 && state.hand.length < MAX_HAND_SIZE,
    onTrigger: async (state, upgrade, reason) => {
      await state.drawCard(
        Math.min(upgrade.cumul, MAX_HAND_SIZE - state.hand.length),
        { skipGameOverPause: true, reason },
      )
    },
    max: Math.floor(MAX_HAND_SIZE / 2),
    cost: { type: "money", value: 25 },
  },
  {
    name: "Data Center",
    eventName: "onUpgradeThis",
    description: "Augmente la taille de la jauge d'@energy de 5",
    image: "data-center.png",
    onTrigger: async (state, _, reason) => {
      await state.addMaxEnergy(5, { reason })
    },
    max: 4,
    cost: { type: "money", value: 50 },
  },
  {
    name: "Méthode Agile",
    eventName: "onUpgradeThis",
    description: "Ajoute une option lors du choix de carte",
    image: "agile.png",
    onTrigger: async (state) => {
      state.dangerouslyUpdate({
        choiceOptionCount: state.choiceOptionCount + 1,
      })
    },
    max: 3,
    cost: { type: "money", value: 100 },
  },
  {
    name: "Anti-virus",
    eventName: "onReputationDeclines",
    description: "Gagne @cumul @energy$s",
    image: "anti-virus.png",
    condition: (state) => state.energy < state.energyMax,
    onTrigger: async (state, upgrade, reason) => {
      await state.addEnergy(upgrade.cumul, {
        skipGameOverPause: true,
        reason,
      })
    },
    max: 5,
    cost: { type: "money", value: 100 },
  },
]

export default upgrades
