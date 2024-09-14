import type { RawUpgrade } from "@/game-typings"
import {
  ENERGY_TO_MONEY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
} from "@/game-constants.ts"

export default function generateUpgrades(advantage: number): RawUpgrade[] {
  return [
    {
      name: "Starbucks",
      eventName: "onPlay",
      description: "Rend @cumul @energy@s",
      image: "starbucks.png",
      condition: (state) => state.energy < state.energyMax,
      onTrigger: async (state, upgrade, reason) => {
        await state.addEnergy(upgrade.cumul, {
          skipGameOverPause: true,
          reason,
        })
      },
      max: 3,
      cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "Méditation",
      eventName: "onPlay",
      description: "Pioche @cumul carte@s si tu as moins de 5 cartes en main",
      image: "meditation.png",
      condition: (state) => state.draw.length > 0 && state.hand.length < 5,
      onTrigger: async (state, upgrade, reason) => {
        await state.drawCard(
          Math.min(upgrade.cumul, MAX_HAND_SIZE - state.hand.length),
          { skipGameOverPause: true, reason },
        )
      },
      max: 3,
      cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY),
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
      cost: String(Math.max(0, 10 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "Recyclage",
      eventName: "onDraw",
      description: "Recycle @cumul carte@s aléatoire@s",
      image: "recyclage.png",
      condition: (state) => state.discard.length > 0,
      onTrigger: async (state, upgrade, reason) => {
        await state.recycleCard(upgrade.cumul, { reason })
      },
      max: 3,
      cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "I.A",
      eventName: "onDraw",
      description: "Gagne @cumulM$ par carte en défausse",
      image: "ia.png",
      condition: (state) => state.discard.length > 0,
      onTrigger: async (state, upgrade, reason) => {
        await state.addMoney(upgrade.cumul * state.discard.length, {
          skipGameOverPause: true,
          reason,
        })
      },
      cost: String(Math.max(0, 80 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "Sport",
      eventName: "daily",
      description: "Gagne @cumul @reputation@s",
      image: "sport.png",
      condition: (state) => state.reputation < MAX_REPUTATION,
      onTrigger: async (state, upgrade, reason) => {
        await state.addReputation(upgrade.cumul, {
          skipGameOverPause: true,
          reason,
        })
      },
      max: 5,
      cost: Math.max(0, 20 - advantage),
    },
    {
      name: "PC Puissant",
      eventName: "onDraw",
      description: "Gagne @cumulM$ par @energy",
      image: "pc-puissant.png",
      condition: (state) => state.energy > 0,
      onTrigger: async (state, upgrade, reason) => {
        await state.addMoney(upgrade.cumul * state.energy, {
          skipGameOverPause: true,
          reason,
        })
      },
      max: 2,
      cost: String(Math.max(0, 40 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "Stagiaire",
      eventName: "onDraw",
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
      cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "DevOps",
      eventName: "onEmptyHand",
      description: "Pioche @cumul carte@s",
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
      cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY),
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
      cost: String(Math.max(0, 50 - advantage) * ENERGY_TO_MONEY),
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
      cost: String(Math.max(0, 50 - advantage) * ENERGY_TO_MONEY),
    },
    {
      name: "Anti-virus",
      eventName: "onReputationDeclines",
      description: "Gagne @cumul @energy@s",
      image: "anti-virus.png",
      condition: (state) => state.energy < state.energyMax,
      onTrigger: async (state, upgrade, reason) => {
        await state.addEnergy(upgrade.cumul, {
          skipGameOverPause: true,
          reason,
        })
      },
      max: 5,
      cost: String(Math.max(0, 20 - advantage) * ENERGY_TO_MONEY),
    },
  ]
}
