import React from "react"

import {
  ActionCardInfo,
  ChoiceOptionFilter,
  ChoiceOptionHeaderId,
  CoinFlipOptions,
  compactGameCardInfo,
  EffectBuilder,
  GameCardInfo,
} from "@/game-typings.ts"

import {
  ACTIONS_COST,
  ADVANTAGE_THRESHOLD,
  ENERGY_TO_MONEY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  REPUTATION_TO_ENERGY,
} from "@/game-constants.ts"

import {
  computeEffectDescription,
  costToEnergy,
  createEffect,
  formatCoinFlipText,
  resolveCost,
  shuffle,
  smartClamp,
  wait,
} from "@/game-safe-utils.tsx"

import { Family, Money, Tag } from "@/components/game/Texts.tsx"
import { bank } from "@/sound.ts"

import { t } from "@/i18n"

const reusable = {
  levelUpLabel: (
    label: React.ReactNode,
    filter: (card: GameCardInfo) => boolean,
  ) =>
    createEffect({
      basePrice: ACTIONS_COST.levelUpLabel,
      description: t(
        <>
          Augmente d'un <Tag name="level" /> toutes les cartes {label}
        </>,
        <>
          Increases a <Tag name="level" /> of all cards {label}
        </>,
      ),
      hint: t(
        "Agis aussi sur les cartes non-obtenues",
        "Also affects unacquired cards",
      ),
      async onPlayed(state, card) {
        const cards = await import("@/data/cards.tsx").then(
          (module) => module.default,
        )

        const targets = cards
          .filter((c) => !c.effect().tags.includes("token"))
          .filter(filter)
          .map((card) => card.name)

        await state.transformCardsAnimation(targets, async () => {
          await state.addGlobalCardModifier(
            "level up cards",
            [targets, ADVANTAGE_THRESHOLD],
            compactGameCardInfo(card),
          )
        })
      },
      tags: ["ephemeral", "level"],
      needsPlayZone: true,
    }),
  choseSpecific: (
    header: ChoiceOptionHeaderId,
    label: React.ReactNode,
    filter: ChoiceOptionFilter[],
  ) =>
    createEffect({
      basePrice: ACTIONS_COST.choseSpecific,
      description: t(
        <>
          <Tag name="pick" /> une carte {label}
        </>,
        <>
          <Tag name="pick" /> a card {label}
        </>,
      ),
      onPlayed: async (state) => {
        bank.powerUp.play()

        const { createChoiceOptions } = await import("@/game-utils.ts")

        state.dangerouslyUpdate({
          choiceOptions: [
            ...state.choiceOptions,
            createChoiceOptions(state, {
              header,
              filter,
              noResource: true,
            }),
          ] as any,
        })

        await wait()
      },
      tags: ["ephemeral", "pick"],
    }),
  coinFlip: (options: CoinFlipOptions<false>) => {
    return (advantage = 0) => {
      const [heads, tails] = [options.head(advantage), options.tail(advantage)]

      return {
        description: formatCoinFlipText({
          heads: heads.message,
          tails: tails.message,
        }),
        onPlayed: async (state, card, reason) =>
          await state.coinFlip({
            head: heads,
            tail: tails,
            card,
            reason,
          }),
        type: "action",
        cost: resolveCost(3),
        needsPlayZone: true,
        tags: ["coinFlip"],
      }
    }
  },
} satisfies Record<string, (...params: any[]) => EffectBuilder<any[]>>

const actions: ActionCardInfo[] = (
  [
    {
      name: "Bot.ts",
      image: "bot.ts.png",
      description: "TypeScript framework for building Discord bots",
      detail: t(
        "Inclus un CLI pour générer des bots et des fichiers de bot. Actuellement mon projet le plus important.",
        "Includes a CLI to generate bots and bot files. Currently my most important project.",
      ),
      url: "https://ghom.gitbook.io/bot.ts",
      families: ["TypeScript", "Outil", "Open Source"],
      effect: reusable.levelUpLabel(
        <Family name="Bot Discord" />,
        (card) =>
          card.type === "action" && card.families.includes("Bot Discord"),
      ),
    },
    {
      name: "CRISPR-Crunch",
      image: "crispr-crunch.png",
      description: "Puzzle game about gene editing",
      detail: t(
        "Un jeu de puzzle sur l'édition de gènes réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious.",
        "A puzzle game about gene editing made with TypeScript, PixiJS, and Booyah with the PlayCurious team.",
      ),
      url: "https://playcurious.games/our-games/crispr-crunch",
      families: ["Jeu vidéo", "TypeScript", "PlayCurious"],
      effect: reusable.coinFlip({
        head: (advantage) => ({
          message: (
            <>
              {t("Gagne", "Wins")}{" "}
              <Money M$={(4 + advantage) * ENERGY_TO_MONEY} />
            </>
          ),
          onTrigger: async (state, _, reason) => {
            await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
              skipGameOverPause: true,
              reason,
            })
          },
        }),
        tail: (advantage) => {
          const energyGain = smartClamp(4 + advantage, 4, MAX_HAND_SIZE)
          const moneyGain = energyGain.rest * ENERGY_TO_MONEY

          return {
            message: computeEffectDescription({
              nothingBefore: true,
              money: moneyGain,
              energy: energyGain,
            }),
            onTrigger: async (state, _, reason) => {
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
          }
        },
      }),
    },
    {
      name: "Portfolio",
      image: "portfolio.png",
      description: "My personal portfolio with a card game",
      detail: t(
        "Mon portfolio réalisé avec TypeScript, React, Vite, Tailwind CSS, Zustand et beaucoup de passion",
        "My portfolio made with TypeScript, React, Vite, Tailwind CSS, Zustand, and a lot of passion",
      ),
      families: ["Site web", "TypeScript", "React", "Open Source", "Jeu vidéo"],
      effect: (advantage = 0) => {
        const basePrice = 4
        const baseMoneyGain = 5

        const price = smartClamp(basePrice - advantage)
        const moneyGain = baseMoneyGain + Math.abs(price.rest) * ENERGY_TO_MONEY

        return {
          description: t(
            <>
              Gagne <Money M$={moneyGain} /> par carte <Tag name="action" /> en
              main en comptant celle-ci
            </>,
            <>
              Earns <Money M$={moneyGain} /> per <Tag name="action" /> card in
              hand including this one
            </>,
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
          tags: [],
        }
      },
    },
    {
      name: "Les Labs JS",
      image: "labs-js.gif",
      description: "A Discord server for JavaScript developers I own",
      detail: t(
        "Le meilleur endroit pour apprendre et partager sur l'écosystème JavaScript",
        "The best place to learn and share about the JavaScript ecosystem",
      ),
      url: "https://discord.gg/3vC2XWK",
      families: ["Serveur Discord"],
      effect: reusable.choseSpecific(
        ["family", "Bot Discord"],
        <Family name="Bot Discord" />,
        ["#Bot Discord"],
      ),
    },
    {
      name: "Les Labs PHP",
      image: "labs-php.gif",
      description: "A Discord server for PHP developers",
      detail: t(
        "Le meilleur endroit pour apprendre et partager sur l'écosystème PHP",
        "The best place to learn and share about the PHP ecosystem",
      ),
      url: "https://discord.gg/bepg8DsUHj",
      families: ["Serveur Discord"],
      effect: reusable.levelUpLabel(
        <Tag name="support" />,
        (card) => card.type === "support",
      ),
    },
    {
      name: "Les Labs Python",
      image: "labs-py.gif",
      description: "A Discord server for Python developers",
      detail: t(
        "Le meilleur endroit pour apprendre et partager sur l'écosystème Python",
        "The best place to learn and share about the Python ecosystem",
      ),
      url: "https://discord.gg/AqfmMqjfMz",
      families: ["Serveur Discord"],
      effect: createEffect({
        basePrice: 2 * Math.floor(MAX_HAND_SIZE / 2),
        description: t(
          <>
            Gagne <Money M$={2 * ENERGY_TO_MONEY} /> par cumul{" "}
            <span className="whitespace-nowrap">
              d'
              <Tag name="upgrade" plural />
            </span>{" "}
            possédées
          </>,
          <>
            Earns <Money M$={2 * ENERGY_TO_MONEY} /> per owned{" "}
            <span className="whitespace-nowrap">
              <Tag name="upgrade" plural />
            </span>
          </>,
        ),
        hint: t(
          <>
            Tu dois posséder des <Tag name="upgrade" plural />
          </>,
          <>
            You must have some <Tag name="upgrade" plural />
          </>,
        ),
        condition: (state) => state.upgrades.length > 0,
        onPlayed: async (state, _, reason) => {
          const cumul = state.upgrades.reduce((prev, u) => prev + u.cumul, 0)

          await state.addMoney(cumul * 2 * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          })
        },
      }),
    },
    {
      name: "Les Labs Java",
      image: "labs-java.gif",
      description: "A Discord server for Java developers",
      detail: t(
        "Le meilleur endroit pour apprendre et partager sur l'écosystème Java",
        "The best place to learn and share about the Java ecosystem",
      ),
      url: "https://discord.gg/wd5eCj7",
      families: ["Serveur Discord"],
      effect: createEffect({
        basePrice: ACTIONS_COST.condition + ACTIONS_COST.levelUp * 2,
        hint: t(
          <>
            Vous devez avoir au moins une carte qui n'est pas un{" "}
            <Tag name="token" /> en main
          </>,
          <>
            You must have at least one card in hand that is not a{" "}
            <Tag name="token" />
          </>,
        ),
        description: t(
          <>
            Augmente de 2 <Tag name="level" plural /> une carte en main
            aléatoire
          </>,
          <>
            Increases by 2 <Tag name="level" plural /> a random card in hand
          </>,
        ),
        condition: (state, card) =>
          state.revivedHand.filter(
            (c) => !c.effect.tags.includes("token") && c.name !== card.name,
          ).length > 0,
        async onPlayed(state, card) {
          const target = shuffle(
            state.revivedHand
              .filter((c) => !c.effect.tags.includes("token"))
              .filter((c) => c.name !== card.name),
            3,
          )[0]

          if (!target) throw new Error("No target found")

          await state.transformCardsAnimation([target.name], async () => {
            await state.addGlobalCardModifier(
              "level up cards",
              [[target.name], ADVANTAGE_THRESHOLD * 2],
              compactGameCardInfo(card),
            )
          })
        },
        tags: ["level"],
        needsPlayZone: true,
      }),
    },
    {
      name: "Les Labs Ruby",
      image: "labs-ruby.gif",
      description: "A Discord server for Ruby developers",
      detail: t(
        "Le meilleur endroit pour apprendre et partager sur l'écosystème Ruby",
        "The best place to learn and share about the Ruby ecosystem",
      ),
      url: "https://discord.gg/4P7XcmbDnt",
      families: ["Serveur Discord"],
      effect: createEffect({
        basePrice: 20,
        dynamicEffect: { cost: 1 / ENERGY_TO_MONEY, min: 20 },
        description: ({ value }) => (
          <>
            {t("Gagne", "Gain")} <Money M$={value * ENERGY_TO_MONEY} />
          </>
        ),
        async onPlayed(state, _, reason) {
          await state.addMoney(this.value * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          })
        },
      }),
    },
    {
      name: "Lab Tools",
      image: "lab-tools.png",
      description: "The tools bot of Labs Discord servers",
      detail: t(
        "Un bot Discord pour gérer Les Laboratoires sur Discord réalisé avec Bot.ts en TypeScript",
        "A Discord bot to manage the Laboratories on Discord made with Bot.ts in TypeScript",
      ),
      url: "https://github.com/Les-Laboratoires/lab-tools",
      families: ["Bot Discord", "TypeScript", "Open Source"],
      effect: reusable.levelUpLabel(
        <Family name="Serveur Discord" />,
        (card) =>
          card.type === "action" && card.families.includes("Serveur Discord"),
      ),
    },
    {
      name: "Unicorn Trap",
      image: "unicorn-trap.png",
      description: "Discord bot for managing role colors",
      detail: t(
        "Un bot Discord pour gérer les couleurs de rôles réalisé avec Bot.ts en TypeScript",
        "A Discord bot to manage role colors made with Bot.ts in TypeScript",
      ),
      url: "https://github.com/GhomKrosmonaute/unicorn-trap",
      families: ["Bot Discord", "TypeScript", "Open Source"],
      effect: createEffect<[selected: GameCardInfo<true>], never>({
        basePrice: ACTIONS_COST.levelDown * 2 + 20,
        description: t(
          <>
            Diminue de 2 <Tag name="level" plural /> une carte, puis gagne{" "}
            <Money M$={20 * ENERGY_TO_MONEY} />
          </>,
          <>
            Decrease a card by 2 <Tag name="level" plural />, then gain{" "}
            <Money M$={20 * ENERGY_TO_MONEY} />
          </>,
        ),
        select: (_, card, testedCard) =>
          card.name !== testedCard.name &&
          !testedCard.effect.tags.includes("token"),
        async onPlayed(state, card, reason, selected) {
          await state.transformCardsAnimation([selected.name], () =>
            state.addGlobalCardModifier(
              "level up cards",
              [[selected.name], -ADVANTAGE_THRESHOLD * 2],
              compactGameCardInfo(card),
            ),
          )

          await state.addMoney(20 * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
        tags: ["token", "level"],
      }),
    },
    {
      name: "DJS Bot",
      image: "djs-bot.png",
      description: "Discord bot for browse Discord.js documentation",
      detail: t(
        "Un bot Discord pour rechercher dans la documentation technique de Discord.js réalisé avec Bot.ts en TypeScript",
        "A Discord bot to search in the technical documentation of Discord.js made with Bot.ts in TypeScript",
      ),
      url: "https://github.com/GhomKrosmonaute/djs-docs-bot.git",
      families: ["Bot Discord", "TypeScript", "Open Source"],
      effect: createEffect({
        basePrice: 10,
        description: t(
          <>
            Gagne <Money M$={10 * ENERGY_TO_MONEY} /> par carte{" "}
            <Family name="Bot Discord" /> en main en comptant celle-ci
          </>,
          <>
            Earns <Money M$={10 * ENERGY_TO_MONEY} /> per{" "}
            <Family name="Bot Discord" /> card in hand including this one
          </>,
        ),
        condition: (state) =>
          state.revivedHand.some(
            (c) => c.type === "action" && c.families.includes("Bot Discord"),
          ),
        onPlayed: async (state, _, reason) => {
          await state.addMoney(
            10 *
              state.revivedHand.filter(
                (card) =>
                  card.type === "action" &&
                  card.families.includes("Bot Discord"),
              ).length *
              ENERGY_TO_MONEY,
            { skipGameOverPause: true, reason },
          )
        },
      }),
    },
    {
      name: "Glink",
      image: "glink.png",
      description: "Discord bot for connect channels together",
      detail: t(
        "Un bot Discord pour connecter des salons entre eux réalisé avec Bot.ts en TypeScript",
        "A Discord bot to connect channels together made with Bot.ts in TypeScript",
      ),
      url: "https://github.com/GhomKrosmonaute/glink",
      families: ["Bot Discord", "TypeScript", "Open Source"],
      effect: createEffect({
        hint: t(
          <>
            Ta <Tag name="reputation" /> doit être supérieur ou égale à{" "}
            {MAX_REPUTATION - 2}
          </>,
          <>
            Your <Tag name="reputation" /> must be greater than or equal to{" "}
            {MAX_REPUTATION - 2}
          </>,
        ),
        description: t(
          <>
            Consomme la <Tag name="reputation" /> de {MAX_REPUTATION - 2} et
            remplis la jauge d'
            <Tag name="energy" />
          </>,
          <>
            Consumes <Tag name="reputation" /> of {MAX_REPUTATION - 2} and fills
            the <Tag name="energy" /> gauge
          </>,
        ),
        condition: (state) =>
          state.reputation >= Math.floor(MAX_REPUTATION - 2),
        onPlayed: async (state, _, reason) => {
          await state.addReputation(-Math.floor(MAX_REPUTATION - 2), {
            skipGameOverPause: true,
            reason,
          })

          await state.addEnergy(state.energyMax, {
            skipGameOverPause: true,
            reason,
          })
        },
        skipEnergyGain: true,
        costType: "money",
        tags: ["ephemeral"],
      }),
    },
    {
      name: "2D Shooter",
      image: "shooter.png",
      description: "My first game in TypeScript",
      detail: t(
        "Un simple jeu de tir 2D avec un vaisseau spatial et des ennemis réalisé avec p5.js en TypeScript",
        "A simple 2D shooting game with a spaceship and enemies made with p5.js in TypeScript",
      ),
      url: "https://github.com/GhomKrosmonaute/TypedShooterGame",
      families: ["Jeu vidéo", "TypeScript"],
      effect: reusable.choseSpecific(
        ["family", "PlayCurious"],
        <Family name="PlayCurious" />,
        ["#PlayCurious"],
      ),
    },
    {
      name: "Gario",
      image: "gario.png",
      description: "A 2D platformer game for showcase",
      detail: t(
        "Un simple jeu de plateforme 2D avec un système de checkpoint réalisé avec p5.js en TypeScript",
        "A simple 2D platformer game with a checkpoint system made with p5.js in TypeScript",
      ),
      url: "https://github.com/GhomKrosmonaute/Gario",
      families: ["Jeu vidéo", "TypeScript"],
      effect: reusable.levelUpLabel(
        <Family name="Jeu vidéo" />,
        (card) => card.type === "action" && card.families.includes("Jeu vidéo"),
      ),
    },
    {
      name: "Booyah",
      image: "booyah.png",
      description: "A TypeScript game engine",
      detail: t(
        "Un moteur de jeu puissant utilisant des machines à états réalisé en TypeScript par Jesse Himmelstein et amélioré par Ghom",
        "A powerful game engine using state machines made in TypeScript by Jesse Himmelstein and improved by Ghom",
      ),
      url: "https://github.com/GhomKrosmonaute/Booyah",
      families: ["Outil", "TypeScript", "Open Source", "PlayCurious"],
      effect: createEffect({
        basePrice: MAX_HAND_SIZE,
        dynamicEffect: { cost: 1, max: 5 },
        hint: t(
          "Ta main doit contenir d'autres cartes",
          "Your hand must contain other cards",
        ),
        description: ({ value, plural }) => (
          <>
            {t(
              "Baisse le prix des cartes en main de",
              "Lowers the price of the cards in your hand of",
            )}{" "}
            {value} <Tag name="energy" plural={plural} /> {t("ou de", "or")}{" "}
            <Money M$={value * ENERGY_TO_MONEY} />
          </>
        ),
        condition: (state, card) =>
          state.hand.filter((c) => c.name !== card.name).length > 0,
        async onPlayed(state, card) {
          const handCardNames = state.revivedHand
            .filter((c) => c.name !== card.name)
            .map((c) => c.name)

          await state.transformCardsAnimation(handCardNames, () =>
            state.addGlobalCardModifier(
              "lowers price of hand cards",
              [handCardNames, this.value],
              compactGameCardInfo(card),
            ),
          )
        },
        needsPlayZone: true,
        tags: ["ephemeral"],
      }),
    },
    {
      name: "Nano",
      image: "nano.png",
      description: "TypeScript library for building modular Discord bots",
      detail: t(
        "Cette lib sert à construire des bots Discord avec une architecture modulaire et flexible",
        "This lib is used to build Discord bots with a modular and flexible architecture",
      ),
      url: "https://github.com/NanoWorkspace",
      families: ["TypeScript", "Outil", "Open Source"],
      effect: createEffect({
        basePrice: ACTIONS_COST.levelUp * MAX_HAND_SIZE,
        costType: "money",
        hint: t(
          <>
            Vous devez avoir au moins une carte qui n'est pas un{" "}
            <Tag name="token" /> en main
          </>,
          <>
            You must have at least one card that is not a <Tag name="token" />{" "}
            in hand
          </>,
        ),
        description: t(
          <>
            Augmente d'un <Tag name="level" /> les cartes en main
          </>,
          <>
            Increases the <Tag name="level" /> of the cards in hand
          </>,
        ),
        condition: (state, card) =>
          state.revivedHand.filter(
            (c) => !c.effect.tags.includes("token") && c.name !== card.name,
          ).length > 0,
        async onPlayed(state, card) {
          const targets = state.revivedHand
            .filter((c) => !c.effect.tags.includes("token"))
            .map((card) => card.name)

          await state.transformCardsAnimation(targets, () =>
            state.addGlobalCardModifier(
              "level up cards",
              [targets, ADVANTAGE_THRESHOLD],
              compactGameCardInfo(card),
            ),
          )
        },
        tags: ["ephemeral", "level"],
        needsPlayZone: true,
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
      effect: reusable.choseSpecific(
        ["tag", "recycle", "qui"],
        <>
          {t("qui", "that")} <Tag name="recycle" />
          {t("", "s")}
        </>,
        ["@recycle"],
      ),
    },
    {
      name: "Vitrine",
      image: "photographer.gif",
      description: "A website for a photographer",
      detail: t(
        "Rélisé avec Next.js, TypeScript, React et Tailwind CSS. Optimisé pour le référencement et les performances. Inclus un CMS.",
        "Built with Next.js, TypeScript, React, and Tailwind CSS. Optimized for SEO and performance. Includes a CMS.",
      ),
      families: ["Site web", "TypeScript", "React", "React"],
      effect: createEffect({
        basePrice: Math.floor(MAX_REPUTATION / 2) * REPUTATION_TO_ENERGY,
        description: (
          <>
            {t("Remplis la jauge de ", "Fill the gauge of ")}
            <Tag name="reputation" />
          </>
        ),
        onPlayed: async (state, _, reason) => {
          await state.addReputation(10, { skipGameOverPause: true, reason })
        },
        costType: "money",
        tags: ["ephemeral"],
      }),
    },
    {
      name: "RedMetrics",
      image: "red-metrics.png",
      description: "Open source web metrics tool",
      detail: t(
        "Réalisé avec TypeScript, React, PostgreSQL et Express chez PlayCurious.",
        "Made with TypeScript, React, PostgreSQL, and Express at PlayCurious.",
      ),
      url: "https://github.com/play-curious/RedMetrics2/",
      families: [
        "Site web",
        "TypeScript",
        "React",
        "Open Source",
        "PlayCurious",
      ],
      effect: createEffect<[GameCardInfo<true>], never>({
        basePrice: 2,
        description: t("Joue une carte gratuitement", "Play a card for free"),
        hint: t(
          "Tu dois avoir une carte avec un coût dans la main",
          "You must have a card with a cost in hand",
        ),
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
      detail: t(
        "Mon premier bot Discord de type Gacha RPG basé sur l'univers de Wakfu.",
        "My first Discord bot of Gacha RPG type based on the world of Wakfu.",
      ),
      url: "https://discord.gg/yJCK2kH",
      families: ["Bot Discord", "Open Source", "Jeu vidéo"],
      effect: createEffect({
        basePrice: 2,
        description: t(
          "La prochaine carte jouée coûte la moitié de son prix",
          "The next card played costs half its price",
        ),
        hint: t(
          "N'agit pas sur les cartes gratuites",
          "Does not affect free cards",
        ),
        onPlayed: async (state, card) => {
          await state.transformCardsAnimation(
            state.revivedHand
              .filter((c) => c.effect.cost.value > 1)
              .map((c) => c.name),
            () =>
              state.addGlobalCardModifier(
                "next card half cost",
                [],
                compactGameCardInfo(card),
              ),
          )
        },
        needsPlayZone: true,
      }),
    },
    {
      name: "Boat Quest",
      image: "edenred.png",
      description: "2D game about ocean cleaning",
      detail: t(
        "Réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious pour EdenRed.",
        "Made with TypeScript, PixiJS, and Booyah with the PlayCurious team for EdenRed.",
      ),
      url: "https://playcurious.games/our-games/edenred-boat-quest/",
      families: ["Jeu vidéo", "TypeScript", "PlayCurious"],
      effect: createEffect({
        hint: t(
          "Tu dois avoir une carte avec un coût positif dans la main",
          "You must have a card with a positive cost in hand",
        ),
        description: (
          <>
            <Tag name="destroy" />{" "}
            {t("une carte et gagne son coût en", "a card and gain its cost in")}{" "}
            <Tag name="reputation" />
          </>
        ),
        select: (_, card, testedCard) =>
          testedCard.name !== card.name && testedCard.effect.cost.value > 0,
        onPlayed: async (state, _, reason, selected) => {
          await state.removeCard(selected.name)

          await state.addReputation(costToEnergy(selected.effect.cost), {
            skipGameOverPause: true,
            reason,
          })
        },
        tags: ["ephemeral"],
      }),
    },
    {
      name: "Survival RPG",
      image: "survival-rpg.png",
      description: "Hardcore RPG Discord bot",
      detail: t(
        "Un bot Discord RPG hardcore en rogue-like.",
        "A hardcore rogue-like Discord RPG bot.",
      ),
      url: "https://discord.gg/7N5pJEY",
      families: ["Bot Discord", "Jeu vidéo"],
      effect: createEffect({
        skipEnergyGain: true,
        description: () => (
          <>
            {t(
              "Défausse une carte et gagne son coût en",
              "Discard a card and gain its cost in",
            )}{" "}
            <Tag name="energy" />
          </>
        ),
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
      detail: t(
        "Librairie JavaScript pour créer des fenêtres d'OS dans le navigateur.",
        "JavaScript library to create OS windows in the browser.",
      ),
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
        description: ({ value, plural }) => (
          <>
            {t("Gagne", "Gain")} {value} <Tag name="energy" plural={plural} />
          </>
        ),
        async onPlayed(state, _, reason) {
          await state.addEnergy(this.value, {
            skipGameOverPause: true,
            reason,
          })
        },
        costType: "money",
      }),
    },
    {
      name: "Just a Forum",
      image: "just-a-forum.png",
      description: "A recursive forum",
      detail: t(
        "Un forum a posts récursifs réalisé avec TypeScript, EJS, Enmap et Express.",
        "A recursive forum made with TypeScript, EJS, Enmap, and Express.",
      ),
      url: "https://github.com/GhomKrosmonaute/just-a-forum.git",
      families: ["Site web", "TypeScript", "Open Source"],
      effect: createEffect({
        skipEnergyGain: true,
        costType: "money",
        dynamicEffect: {
          cost: 1,
          min: 5,
          max: (state) => Math.floor(state.energyMax / 2),
        },
        description: ({ value, plural }) => (
          <>
            {t(
              <>
                Si la <Tag name="reputation" /> est inférieur à{" "}
                {Math.floor(MAX_REPUTATION / 2)}, gagne {value}{" "}
                <Tag name="energy" plural={plural} />
              </>,
              <>
                If the <Tag name="reputation" /> is less than{" "}
                {Math.floor(MAX_REPUTATION / 2)}, gain {value}{" "}
                <Tag name="energy" plural={plural} />
              </>,
            )}
          </>
        ),
        condition: (state) => state.reputation < Math.floor(MAX_REPUTATION / 2),
        async onPlayed(state, _, reason) {
          await state.addEnergy(this.value, {
            skipGameOverPause: true,
            reason,
          })
        },
      }),
    },
  ] as Omit<ActionCardInfo, "type">[]
).map<ActionCardInfo>((action) => ({
  ...action,
  type: "action",
  image: `images/actions/${action.image}`,
}))

export default actions
