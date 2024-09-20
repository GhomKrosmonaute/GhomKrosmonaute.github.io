import { ActionCardInfo, GameLog } from "@/game-typings.ts"
import {
  formatText,
  generateDescriptionRest,
  getDeck,
  GlobalCardModifierIndex,
  resolveCost,
  reviveCard,
  smartClamp,
} from "@/game-utils.ts"
import {
  ACTIONS_COST,
  ENERGY_TO_MONEY,
  MAX_HAND_SIZE,
} from "@/game-constants.ts"

import type { GameState } from "@/hooks/useCardGame.ts"

async function completeOnPlayed(options: {
  state: GameState
  energy: { value: number }
  money: number
  reason: GameLog["reason"]
}) {
  if (options.energy.value > 0) {
    await options.state.addEnergy(options.energy.value, {
      skipGameOverPause: true,
      reason: options.reason,
    })

    if (options.money > 0) {
      await options.state.addMoney(options.money, {
        skipGameOverPause: true,
        reason: options.reason,
      })
    }
  }
}

const actions: ActionCardInfo[] = [
  {
    name: "Bot.ts",
    image: "bot.ts.png",
    description: "TypeScript framework for building Discord bots",
    detail:
      "Inclus un CLI pour générer des bots et des fichiers de bot. Actuellement mon projet le plus important.",
    url: "https://ghom.gitbook.io/bot.ts",
    type: "action",
    families: ["TypeScript", "Outil", "Open Source"],
    effect: (advantage: number) => {
      const level = 1 + Math.floor(advantage / (MAX_HAND_SIZE / 2))

      return {
        description: formatText(
          `Augmente de ${level} @level${level > 1 ? "s" : ""} toutes les cartes "Bot Discord" de ton deck`,
        ),
        onPlayed: async (state) =>
          state.addGlobalCardModifier(
            "level up cards",
            [
              getDeck(state)
                .map((i) => reviveCard(i, state))
                .filter(
                  (card) =>
                    card.type === "action" &&
                    card.families.includes("Bot Discord"),
                )
                .map((card) => card.name),
              level,
            ],
            GlobalCardModifierIndex.First,
          ),
        type: "action",
        cost: resolveCost(Math.floor(MAX_HAND_SIZE / 2)),
      }
    },
    state: null,
    localAdvantage: null,
  },
  {
    name: "CRISPR-Crunch",
    image: "crispr-crunch.png",
    description: "Puzzle game about gene editing",
    detail:
      "Un jeu de puzzle sur l'édition de gènes réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious.",
    url: "https://playcurious.games/our-games/crispr-crunch",
    type: "action",
    families: ["Jeu vidéo", "TypeScript", "PlayCurious"],
    effect: (advantage: number, state) => {
      const drawSpecific = smartClamp(
        1 + Math.floor(advantage / ACTIONS_COST.drawSpecific),
        2,
        Math.floor(MAX_HAND_SIZE / 2),
      )
      const energy = smartClamp(drawSpecific.rest, 0, state.energyMax)
      const money = energy.rest * ENERGY_TO_MONEY

      return {
        description: formatText(
          `Pioche ${drawSpecific.value} carte${drawSpecific.s} "PlayCurious"${generateDescriptionRest(
            {
              energy,
              money,
            },
          )}`,
        ),
        onPlayed: async (state, _, reason) => {
          await state.drawCard(drawSpecific.value, {
            filter: (card) =>
              card.type === "action" && card.families.includes("PlayCurious"),
            skipGameOverPause: true,
            reason,
          })

          await completeOnPlayed({
            state,
            energy,
            money,
            reason,
          })
        },
        condition: (state) =>
          state.draw.some((indice) => {
            const card = reviveCard(indice, state)
            return (
              card.type === "action" && card.families.includes("PlayCurious")
            )
          }),
        cost: resolveCost(2),
      }
    },
    state: null,
    localAdvantage: null,
  },
  {
    name: "Portfolio",
    image: "portfolio.png",
    description: "My personal portfolio with a card game",
    detail:
      "Mon portfolio réalisé avec TypeScript, React, Vite, Tailwind CSS, Zustand et beaucoup de passion",
  },
  {
    name: "Les Labs JS",
    image: "js-labs.png",
    description: "A Discord server for JavaScript developers I own and manage",
    detail:
      "Le meilleur endroit pour apprendre et partager sur l'écosystème JavaScript",
    url: "https://discord.gg/3vC2XWK",
  },
  {
    name: "2D Shooter",
    image: "shooter.png",
    description: "My first game in TypeScript",
    detail:
      "Un simple jeu de tir 2D avec un vaisseau spatial et des ennemis réalisé avec p5.js en TypeScript",
    url: "https://github.com/GhomKrosmonaute/TypedShooterGame",
  },
  {
    name: "Gario",
    image: "gario.png",
    description: "A 2D platformer game for showcase",
    detail:
      "Un simple jeu de plateforme 2D avec un système de checkpoint réalisé avec p5.js en TypeScript",
    url: "https://github.com/GhomKrosmonaute/Gario",
  },
  {
    name: "Booyah",
    image: "booyah.png",
    description: "A TypeScript game engine",
    detail:
      "Un moteur de jeu puissant utilisant des machines à états réalisé en TypeScript par Jesse Himmelstein et amélioré par Ghom",
    url: "https://github.com/GhomKrosmonaute/Booyah",
  },
  {
    name: "Nano",
    image: "nano.png",
    description: "TypeScript library for building modular Discord bots",
    detail:
      "Cette lib sert à construire des bots Discord avec une architecture modulaire et flexible",
    url: "https://github.com/NanoWorkspace",
  },
  {
    name: "Sea Rescue",
    image: "sea-rescue.png",
    description: "3D game about ocean cleaning",
    detail:
      "Réalisé avec TypeScript, Three.js et Booyah avec l'équipe PlayCurious.",
    url: "https://playcurious.games/our-games/sea-rescue/",
  },
  {
    name: "Site Photographe",
    image: "photo.png",
    description: "A website for a photographer",
    detail:
      "Rélisé avec Next.js, TypeScript, React et Tailwind CSS. Optimisé pour le référencement et les performances. Inclus un CMS.",
  },
  {
    name: "RedMetrics",
    image: "red-metrics.png",
    description: "Open source web metrics tool",
    detail:
      "Réalisé avec TypeScript, React, PostgreSQL et Express chez PlayCurious.",
    url: "https://github.com/play-curious/RedMetrics2/",
  },
  {
    name: "WakFight",
    image: "wak-fight.png",
    description: "RPG fighting Discord bot",
    detail: "Mon premier bot Discord RPG basé sur l'univers de Wakfu.",
  },
  {
    name: "Boat Quest",
    image: "edenred.png",
    description: "2D game about ocean cleaning",
    detail:
      "Réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious pour EdenRed.",
    url: "https://playcurious.games/our-games/edenred-boat-quest/",
  },
  {
    name: "Survival RPG",
    image: "survival-rpg.png",
    description: "Hardcore RPG Discord bot",
    detail: "Un bot Discord RPG hardcore en rogue-like.",
    url: "https://discord.gg/7N5pJEY",
  },
  {
    name: "Windows.js",
    image: "windows.png",
    description: "JavaScript fun UI library",
    detail:
      "Librairie JavaScript pour créer des fenêtres d'OS dans le navigateur.",
    url: "https://ghomkrosmonaute.github.io/Windows.js/",
  },
  {
    name: "Just a Forum",
    image: "just-a-forum.png",
    description: "A recursive forum",
    detail:
      "Un forum a posts récursifs réalisé avec TypeScript, EJS, Enmap et Express.",
    url: "https://github.com/GhomKrosmonaute/just-a-forum.git",
  },
]
