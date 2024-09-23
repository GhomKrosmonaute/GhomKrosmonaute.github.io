import type {
  ActionCardInfo,
  EffectBuilder,
  GameCardInfo,
} from "@/game-typings.ts"

import {
  ACTIONS_COST,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  ENERGY_TO_MONEY,
  REPUTATION_TO_ENERGY,
  ADVANTAGE_THRESHOLD,
} from "@/game-constants.ts"

import {
  wait,
  formatText,
  smartClamp,
  resolveCost,
  createEffect,
  costToEnergy,
  formatCoinFlipText,
  cardInfoToIndice,
} from "@/game-safe-utils.ts"

import { bank } from "@/sound.ts"

const reusable = {
  levelUpAllLabel: (label: string, filter: (card: GameCardInfo) => boolean) =>
    createEffect({
      basePrice: ACTIONS_COST.levelUpFamily,
      description: `Augmente d'un @level toutes les cartes ${label}`,
      hint: "Agis aussi sur les cartes non-obtenues",
      async onPlayed(state, card) {
        const cards = await import("@/data/cards.ts").then(
          (module) => module.default,
        )

        await state.addGlobalCardModifier(
          "level up cards",
          [cards.filter(filter).map((card) => card.name), ADVANTAGE_THRESHOLD],
          cardInfoToIndice(card),
        )
      },
      ephemeral: true,
    }),
  choseSpecific: (label: string, filter: (card: GameCardInfo) => boolean) =>
    createEffect({
      basePrice: ACTIONS_COST.choseSpecific,
      description: `Choisi une carte ${label}`,
      onPlayed: async (state) => {
        bank.powerUp.play()

        const { generateChoiceOptions } = await import("@/game-utils.ts")

        state.dangerouslyUpdate({
          choiceOptions: [
            ...state.choiceOptions,
            generateChoiceOptions(state, {
              filter,
              noResource: true,
            }),
          ],
        })

        await wait()
      },
    }),
} satisfies Record<string, (...params: any[]) => EffectBuilder<any[]>>

const actions: ActionCardInfo[] = (
  [
    {
      name: "Bot.ts",
      image: "bot.ts.png",
      description: "TypeScript framework for building Discord bots",
      detail:
        "Inclus un CLI pour générer des bots et des fichiers de bot. Actuellement mon projet le plus important.",
      url: "https://ghom.gitbook.io/bot.ts",
      families: ["TypeScript", "Outil", "Open Source"],
      effect: reusable.levelUpAllLabel(
        "#Bot Discord",
        (card) =>
          card.type === "action" && card.families.includes("Bot Discord"),
      ),
    },
    {
      name: "CRISPR-Crunch",
      image: "crispr-crunch.png",
      description: "Puzzle game about gene editing",
      detail:
        "Un jeu de puzzle sur l'édition de gènes réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious.",
      url: "https://playcurious.games/our-games/crispr-crunch",
      families: ["Jeu vidéo", "TypeScript", "PlayCurious"],
      effect: (advantage = 0) => {
        const energyGain = smartClamp(4 + advantage, 4, MAX_HAND_SIZE)
        const moneyGain = energyGain.rest * ENERGY_TO_MONEY

        return {
          description: formatCoinFlipText({
            heads: `gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`,
            tails: `gagne ${energyGain.value} @energy${energyGain.s}${
              moneyGain > 0 ? ` et ${moneyGain}M$` : ""
            }`,
          }),
          onPlayed: async (state, _, reason) =>
            await state.coinFlip({
              onHead: async () =>
                await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
                  skipGameOverPause: true,
                  reason,
                }),
              onTail: async () => {
                await state.addEnergy(energyGain.value, {
                  skipGameOverPause: true,
                  reason,
                })

                if (moneyGain > 0) {
                  await state.addMoney(moneyGain, {
                    skipGameOverPause: true,
                    reason,
                  })
                }
              },
            }),
          type: "action",
          cost: resolveCost(3),
          needsPlayZone: true,
        }
      },
    },
    {
      name: "Portfolio",
      image: "portfolio.png",
      description: "My personal portfolio with a card game",
      detail:
        "Mon portfolio réalisé avec TypeScript, React, Vite, Tailwind CSS, Zustand et beaucoup de passion",
      families: ["Site web", "TypeScript", "React", "Open Source"],
      effect: (advantage = 0) => {
        const basePrice = 4
        const baseMoneyGain = 5

        const price = smartClamp(basePrice - advantage)
        const moneyGain = baseMoneyGain + Math.abs(price.rest) * ENERGY_TO_MONEY

        return {
          description: formatText(
            `Gagne ${moneyGain}M$ par carte @action en main en comptant celle-ci`,
          ),
          onPlayed: async (state, _, reason) => {
            await state.addMoney(
              moneyGain *
                state.revivedHand.filter((card) => card.type === "action")
                  .length,
              { skipGameOverPause: true, reason },
            )
          },
          type: "action",
          cost: resolveCost(price.value),
        }
      },
    },
    {
      name: "Les Labs JS",
      image: "js-labs.png",
      description: "A Discord server for JavaScript developers I own",
      detail:
        "Le meilleur endroit pour apprendre et partager sur l'écosystème JavaScript",
      url: "https://discord.gg/3vC2XWK",
      families: ["Serveur Discord"],
      effect: reusable.levelUpAllLabel(
        "#TypeScript",
        (card) =>
          card.type === "action" && card.families.includes("TypeScript"),
      ),
    },
    {
      name: "2D Shooter",
      image: "shooter.png",
      description: "My first game in TypeScript",
      detail:
        "Un simple jeu de tir 2D avec un vaisseau spatial et des ennemis réalisé avec p5.js en TypeScript",
      url: "https://github.com/GhomKrosmonaute/TypedShooterGame",
      families: ["Jeu vidéo", "TypeScript"],
      effect: reusable.choseSpecific(
        "#PlayCurious",
        (c) => c.type === "action" && c.families.includes("PlayCurious"),
      ),
    },
    {
      name: "Gario",
      image: "gario.png",
      description: "A 2D platformer game for showcase",
      detail:
        "Un simple jeu de plateforme 2D avec un système de checkpoint réalisé avec p5.js en TypeScript",
      url: "https://github.com/GhomKrosmonaute/Gario",
      families: ["Jeu vidéo", "TypeScript"],
      effect: reusable.levelUpAllLabel(
        "#Jeu vidéo",
        (card) => card.type === "action" && card.families.includes("Jeu vidéo"),
      ),
    },
    {
      name: "Booyah",
      image: "booyah.png",
      description: "A TypeScript game engine",
      detail:
        "Un moteur de jeu puissant utilisant des machines à états réalisé en TypeScript par Jesse Himmelstein et amélioré par Ghom",
      url: "https://github.com/GhomKrosmonaute/Booyah",
      families: ["Outil", "TypeScript", "Open Source", "PlayCurious"],
      effect: createEffect({
        basePrice: MAX_HAND_SIZE,
        dynamicEffect: { cost: 1, max: 5 },
        description:
          "Baisse le prix des cartes en main de $n @energy$s ou de $$",
        condition: (state, card) =>
          state.revivedHand.some(
            (c) => c.name !== card.name && c.effect.cost.value > 0,
          ),
        async onPlayed(state, card) {
          const handCardNames = state.revivedHand
            .filter((c) => c.name !== card.name && card.effect.cost.value > 0)
            .map((c) => c.name)

          await state.addGlobalCardModifier(
            "lowers price of hand cards",
            [handCardNames, this.value!],
            cardInfoToIndice(card),
          )
        },
        ephemeral: true,
        needsPlayZone: true,
      }),
    },
    {
      name: "Nano",
      image: "nano.png",
      description: "TypeScript library for building modular Discord bots",
      detail:
        "Cette lib sert à construire des bots Discord avec une architecture modulaire et flexible",
      url: "https://github.com/NanoWorkspace",
      families: ["TypeScript", "Outil", "Open Source"],
      effect: createEffect({
        basePrice: ACTIONS_COST.levelUp * MAX_HAND_SIZE,
        costType: "money",
        description: "Augmente d'un @level les cartes en main",
        async onPlayed(state, card) {
          await state.addGlobalCardModifier(
            "level up cards",
            [state.revivedHand.map((card) => card.name), ADVANTAGE_THRESHOLD],
            cardInfoToIndice(card),
          )
        },
        ephemeral: true,
      }),
    },
    {
      name: "Sea Rescue",
      image: "sea-rescue.png",
      description: "3D game about ocean cleaning",
      detail:
        "Réalisé avec TypeScript, Three.js et Booyah avec l'équipe PlayCurious.",
      url: "https://playcurious.games/our-games/sea-rescue/",
      families: ["Jeu vidéo", "TypeScript", "PlayCurious"],
      effect: reusable.choseSpecific("Recyclage", (c) =>
        Boolean(c.effect().recycle),
      ),
    },
    {
      name: "Vitrine",
      image: "photographer.gif",
      description: "A website for a photographer",
      detail:
        "Rélisé avec Next.js, TypeScript, React et Tailwind CSS. Optimisé pour le référencement et les performances. Inclus un CMS.",
      families: ["Site web", "TypeScript", "React", "React"],
      effect: createEffect({
        basePrice: Math.floor(MAX_REPUTATION / 2) * REPUTATION_TO_ENERGY,
        description: "Remplis la jauge de @reputation",
        onPlayed: async (state, _, reason) => {
          await state.addReputation(10, { skipGameOverPause: true, reason })
        },
        costType: "money",
        ephemeral: true,
      }),
    },
    {
      name: "RedMetrics",
      image: "red-metrics.png",
      description: "Open source web metrics tool",
      detail:
        "Réalisé avec TypeScript, React, PostgreSQL et Express chez PlayCurious.",
      url: "https://github.com/play-curious/RedMetrics2/",
      families: [
        "Site web",
        "TypeScript",
        "React",
        "Open Source",
        "PlayCurious",
      ],
      effect: createEffect<[GameCardInfo<true>]>({
        basePrice: 2,
        description: "Joue une carte gratuitement",
        hint: "Tu dois avoir une carte avec un coût dans la main",
        condition: (state, card) =>
          state.revivedHand.some(
            (c) => c.name !== card.name && c.effect.cost.value > 0,
          ),
        select: (state, card, testedCard) =>
          card.name !== testedCard.name &&
          testedCard.effect.cost.value > 0 &&
          (!testedCard.effect.condition ||
            testedCard.effect.condition(state, testedCard)),
        onPlayed: async (state, _, reason, selected) => {
          await state.playCard(selected, {
            free: true,
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
      }),
    },
    {
      name: "WakFight",
      image: "wak-fight.png",
      description: "RPG fighting Discord bot",
      detail: "Mon premier bot Discord RPG basé sur l'univers de Wakfu.",
      url: "https://discord.gg/yJCK2kH",
      families: ["Bot Discord", "Open Source", "Jeu vidéo"],
      effect: createEffect({
        basePrice: 2,
        description: "La prochaine carte jouée coûte la moitié de son prix",
        hint: "N'agit pas sur les cartes gratuites",
        onPlayed: async (state, card) => {
          await state.addGlobalCardModifier(
            "next card half cost",
            [],
            cardInfoToIndice(card),
          )
        },
      }),
    },
    {
      name: "Boat Quest",
      image: "edenred.png",
      description: "2D game about ocean cleaning",
      detail:
        "Réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious pour EdenRed.",
      url: "https://playcurious.games/our-games/edenred-boat-quest/",
      families: ["Jeu vidéo", "TypeScript", "PlayCurious"],
      effect: createEffect({
        hint: "Tu dois avoir une carte avec un coût dans la main",
        description: "Détruit une carte et gagne son coût en @reputation",
        select: (_, card, testedCard) =>
          testedCard.name !== card.name && testedCard.effect.cost.value > 0,
        onPlayed: async (state, _, reason, selected) => {
          await state.removeCard(selected.name)

          await state.addReputation(costToEnergy(selected.effect.cost), {
            skipGameOverPause: true,
            reason,
          })
        },
        ephemeral: true,
      }),
    },
    {
      name: "Survival RPG",
      image: "survival-rpg.png",
      description: "Hardcore RPG Discord bot",
      detail: "Un bot Discord RPG hardcore en rogue-like.",
      url: "https://discord.gg/7N5pJEY",
      families: ["Bot Discord", "Jeu vidéo"],
      effect: createEffect({
        skipEnergyGain: true,
        description: "Défausse une carte et gagne son coût en @energy",
        select: (_, card, testedCard) =>
          testedCard.name !== card.name && testedCard.effect.cost.value > 0,
        onPlayed: async (state, _, reason, selected) => {
          await state.discardCard({
            filter: (card) => card.name === selected.name,
            reason,
          })

          await state.addEnergy(costToEnergy(selected.effect.cost), {
            skipGameOverPause: true,
            reason,
          })
        },
      }),
    },
    {
      name: "Windows.js",
      image: "windows.png",
      description: "JavaScript fun UI library",
      detail:
        "Librairie JavaScript pour créer des fenêtres d'OS dans le navigateur.",
      url: "https://ghomkrosmonaute.github.io/Windows.js/",
      families: ["Outil", "Open Source"],
      effect: createEffect({
        basePrice: 5,
        skipEnergyGain: true,
        dynamicEffect: {
          cost: 1,
          min: 5,
          max: (state) => Math.floor(state.energyMax / 2),
        },
        costType: "money",
        description: "Gagne $n @energy$s",
      }),
    },
    {
      name: "Just a Forum",
      image: "just-a-forum.png",
      description: "A recursive forum",
      detail:
        "Un forum a posts récursifs réalisé avec TypeScript, EJS, Enmap et Express.",
      url: "https://github.com/GhomKrosmonaute/just-a-forum.git",
      families: ["Site web", "TypeScript", "Open Source"],
      effect: createEffect({
        skipEnergyGain: true,
        costType: "money",
        dynamicEffect: {
          cost: 1,
          max: (state) => Math.floor(state.energyMax / 2),
        },
        description: `Si la @reputation est inférieur à ${Math.floor(MAX_REPUTATION / 2)}, gagne $n @energy$s`,
        condition: (state) => state.reputation < Math.floor(MAX_REPUTATION / 2),
        async onPlayed(state, _, reason) {
          await state.addEnergy(this.value!, {
            skipGameOverPause: true,
            reason,
          })
        },
      }),
    },
  ] as Omit<ActionCardInfo, "type" | "state" | "localAdvantage">[]
).map<ActionCardInfo>((action) => ({
  ...action,
  type: "action",
  state: null,
  localAdvantage: null,
  image: `images/projects/${action.image}`,
}))

export default actions
