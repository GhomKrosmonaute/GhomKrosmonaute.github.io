import type {
  EffectBuilder,
  GameCardInfo,
  SupportCardInfo,
} from "@/game-typings.ts"

import {
  ACTIONS_COST,
  ENERGY_TO_MONEY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
} from "@/game-constants.ts"

import {
  computeEffectDescription,
  computeEffectOnPlayed,
  createEffect,
  resolveCost,
  formatText,
  smartClamp,
  fakeMegaState,
} from "@/game-safe-utils.ts"

const reusable = {
  drawSpecific: (options: {
    label: string
    filter: (card: GameCardInfo<true>) => boolean
    ephemeral?: boolean
  }) => {
    return (advantage = 0, state = fakeMegaState) => {
      const drawSpecific = smartClamp(
        1 + Math.floor(advantage / ACTIONS_COST.drawSpecific),
        1,
        Math.min(
          Math.floor(MAX_HAND_SIZE / 2),
          state.revivedDraw.filter(options.filter).length,
        ),
      )
      const energy = smartClamp(drawSpecific.rest, 0, state.energyMax)
      const money = energy.rest * ENERGY_TO_MONEY

      return {
        description: formatText(
          `${drawSpecific.value > 0 ? `Pioche ${drawSpecific.value} carte${drawSpecific.s} ${options.label}` : ""}${computeEffectDescription(
            {
              nothingBefore: drawSpecific.value <= 0,
              energy,
              money,
            },
          )}`,
        ),
        onPlayed: async (state, _, reason) => {
          await state.drawCard(drawSpecific.value, {
            filter: options.filter,
            skipGameOverPause: true,
            reason,
          })

          await computeEffectOnPlayed({
            state,
            energy,
            money,
            reason,
          })
        },
        condition: (state) => state.revivedDraw.some(options.filter),
        cost: resolveCost(ACTIONS_COST.drawSpecific),
      }
    }
  },
  recycleSpecific: (options: {
    label: string
    filter: (card: GameCardInfo<true>) => boolean
  }) => {
    return (advantage = 0, state = fakeMegaState) => {
      const basePrice = ACTIONS_COST.drawSpecific
      const price = smartClamp(basePrice - advantage)
      const recycleSpecific = smartClamp(
        1 + Math.floor(Math.abs(price.rest) / ACTIONS_COST.recycleSpecific),
        1,
        Math.min(
          state.revivedDiscard.length,
          state.revivedDiscard.filter(options.filter).length,
        ),
      )
      console.log(recycleSpecific.rest)
      const energy = smartClamp(recycleSpecific.rest, 0, state.energyMax)
      const money = energy.rest * ENERGY_TO_MONEY

      return {
        description: formatText(
          `${recycleSpecific.value > 0 ? `Recycle ${recycleSpecific.value} carte${recycleSpecific.s} ${options.label}` : ""}${computeEffectDescription(
            {
              nothingBefore: recycleSpecific.value <= 0,
              energy,
              money,
            },
          )}`,
        ),
        onPlayed: async (state, _, reason) => {
          if (recycleSpecific.value > 0)
            await state.recycleCard(recycleSpecific.value, {
              filter: options.filter,
              reason,
            })

          await computeEffectOnPlayed({
            state,
            energy,
            money,
            reason,
          })
        },
        condition: (state) => state.revivedDiscard.some(options.filter),
        cost: resolveCost(price.value),
      }
    }
  },
} satisfies Record<string, (...params: any[]) => EffectBuilder<any[]>>

const supports: SupportCardInfo[] = (
  [
    {
      name: "EJS",
      image: "ejs.png",
      effect: reusable.drawSpecific({
        label: "coûtant de l'@energy",
        filter: (card) =>
          card.effect.cost.value > 0 && card.effect.cost.type === "energy",
      }),
    },
    {
      name: "TypeScript",
      image: "ts.png",
      effect: reusable.drawSpecific({
        label: "#TypeScript",
        filter: (card) =>
          card.type === "action" && card.families.includes("TypeScript"),
      }),
    },
    {
      name: "JavaScript",
      image: "js.png",
      effect: reusable.drawSpecific({
        label: "@support",
        filter: (card) => card.type === "support",
      }),
    },
    {
      name: "React",
      image: "react.webp",
      effect: reusable.drawSpecific({
        label: "#React",
        filter: (card) =>
          card.type === "action" && card.families.includes("React"),
      }),
    },
    {
      name: "Tailwind CSS",
      image: "tailwind.png",
      effect: createEffect({
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.draw,
          min: 3,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        description: `Défausse les cartes @action en main(min 1) et pioche @n carte@s`,
        condition: (state) =>
          state.revivedHand.some((card) => card.type === "action"),
        async onPlayed(state, _, reason) {
          await state.discardCard({
            filter: (card) => card.type === "action",
            reason,
          })

          await state.drawCard(this.value!, {
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
      }),
    },
    {
      name: "NodeJS",
      image: "node.png",
      effect: reusable.drawSpecific({
        label: "Recyclage",
        filter: (card) => Boolean(card.effect.recycle),
      }),
    },
    {
      name: "Next.js",
      image: "nextjs.webp",
      effect: createEffect({
        basePrice: ACTIONS_COST.drawSpecific + ACTIONS_COST.condition,
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.drawSpecific,
          min: 1,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        hint: formatText("La pioche doit contenir au moins une carte @action"),
        description:
          "Pioche @n carte@s @action si tu n'as pas de carte @action en main",
        condition: (state) =>
          !state.revivedHand.some((card) => card.type === "action") &&
          state.revivedDraw.some((card) => card.type === "action"),
        async onPlayed(state, _, reason) {
          await state.drawCard(this.value!, {
            filter: (card) => card.type === "action",
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
      }),
    },
    {
      name: "Vercel",
      image: "vercel.png",
      effect: reusable.drawSpecific({
        label: "@action",
        filter: (card) => card.type === "action",
      }),
    },
    {
      name: "PostgreSQL",
      image: "pgsql.png",
      effect: reusable.drawSpecific({
        label: "@upgrade",
        filter: (card) => Boolean(card.effect.upgrade),
        ephemeral: true,
      }),
    },
    {
      name: "Docker",
      image: "docker.webp",
      effect: reusable.drawSpecific({
        label: "gratuite",
        filter: (card) => card.effect.cost.value <= 0,
      }),
    },
    {
      name: "PixiJS",
      image: "pixi.png",
      effect: reusable.drawSpecific({
        label: "#Jeu vidéo",
        filter: (card) =>
          card.type === "action" && card.families.includes("Jeu vidéo"),
      }),
    },
    {
      name: "Three.js",
      image: "three.png",
      effect: reusable.recycleSpecific({
        label: "#Jeu vidéo",
        filter: (card) =>
          card.type === "action" && card.families.includes("Jeu vidéo"),
      }),
    },
    {
      name: "Gulp",
      image: "gulp.webp",
      effect: reusable.recycleSpecific({
        label: "qui pioche",
        filter: (card) =>
          /pioche \d+ carte/.test(card.effect.description.toLowerCase()),
      }),
    },
    {
      name: "Knex",
      image: "knex.png",
      effect: createEffect({
        basePrice: 2,
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.drawSpecific,
          min: 1,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        description: "Pioche @n carte@s dans la défausse",
        condition: (state) => state.discard.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(this.value!, {
            fromDiscardPile: true,
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        recycle: true,
      }),
    },
    {
      name: "Git",
      image: "git.png",
      effect: createEffect({
        basePrice: 10,
        skipEnergyGain: true,
        description: "@recycle toutes les cartes de la défausse",
        condition: (state) => state.discard.length > 0,
        async onPlayed(state, _, reason) {
          await state.recycleCard(state.discard.length, { reason })
        },
        needsPlayZone: true,
      }),
    },
    {
      name: "Jest",
      image: "jest.png",
      effect: createEffect({
        basePrice: 1,
        description: "Pioche une carte",
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(1, { reason })
        },
        waitBeforePlay: true,
      }),
    },
    {
      name: "ESLint",
      image: "eslint.png",
      effect: createEffect({
        basePrice: 1,
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.draw,
          min: 1,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        hint: "La pioche doit contenir au moins 1 carte",
        description: "Défausse toutes les cartes en main et pioche @n carte@s",
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.discardCard({ reason })

          await state.drawCard(this.value!, {
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
      }),
    },
    {
      name: "Prettier",
      image: "prettier.png",
      effect: createEffect({
        basePrice: 5,
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.draw,
          min: 1,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        description: "Mélange la main dans la pioche puis pioche @n carte@s",
        async onPlayed(state, _, reason) {
          await state.discardCard({ toDraw: true, reason })

          await state.drawCard(this.value!, {
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
      }),
    },
    {
      name: "Processing",
      image: "processing.webp",
      effect: createEffect({
        basePrice: 1,
        description: "Pioche une carte",
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(1, { reason })
        },
        waitBeforePlay: true,
        costType: "money",
      }),
    },
    {
      name: "p5.js",
      image: "p5.png",
      effect: createEffect({
        basePrice: 2,
        description: "Recycle une carte aléatoire",
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(1, { reason })
        },
        waitBeforePlay: true,
        costType: "money",
        recycle: true,
      }),
    },
    {
      name: "Strapi",
      image: "strapi.png",
      effect: createEffect({
        basePrice: ACTIONS_COST.draw * 2 + ACTIONS_COST.condition,
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.draw,
          min: 2,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        description: "Pioche @n carte@s si tu as moins de 5 cartes en main",
        condition: (state) => state.hand.length < 5 && state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(this.value!, {
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
      }),
    },
    {
      name: "Windows",
      image: "windows.png",
      effect: reusable.recycleSpecific({
        label: "@action",
        filter: (card) => card.type === "action",
      }),
    },
    {
      name: "Linux",
      image: "linux.png",
      effect: reusable.recycleSpecific({
        label: "@support",
        filter: (card) => card.type === "support",
      }),
    },
    {
      name: "MacOS",
      image: "macos.png",
      effect: reusable.recycleSpecific({
        label: "gratuite",
        filter: (card) => card.effect.cost.value <= 0,
      }),
    },
    {
      name: "Jetbrains",
      image: "jetbrains.webp",
      effect: reusable.recycleSpecific({
        label: "qui recycle",
        filter: (card) =>
          card.effect.description.toLowerCase().includes("recycle"),
      }),
    },
    {
      name: "Ruby",
      image: "ruby.png",
      effect: createEffect({
        basePrice: 10,
        hint: "La pioche doit contenir au moins une carte @upgrade",
        description: "Pioche une carte @upgrade si ta @reputation est au max",
        condition: (state) => state.revivedDraw.some((c) => c.effect.upgrade),
        async onPlayed(state, _, reason) {
          await state.drawCard(1, {
            filter: (card) => Boolean(card.effect.upgrade),
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        costType: "money",
      }),
    },
    {
      name: "ESBuild",
      image: "esbuild.png",
      effect: createEffect({
        basePrice: 10,
        hint: "La pioche doit contenir au moins une carte @upgrade",
        description: `Si la @reputation est inférieur à ${Math.floor(MAX_REPUTATION / 2)}, pioche une carte @upgrade`,
        condition: (state) => state.revivedDraw.some((c) => c.effect.upgrade),
        async onPlayed(state, _, reason) {
          await state.drawCard(1, {
            filter: (card) => Boolean(card.effect.upgrade),
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        costType: "money",
      }),
    },
  ] satisfies Omit<SupportCardInfo, "type" | "state" | "localAdvantage">[]
).map<SupportCardInfo>((support) => ({
  ...support,
  state: null,
  localAdvantage: null,
  type: "support",
  image: `images/techno/${support.image}`,
}))

export default supports
