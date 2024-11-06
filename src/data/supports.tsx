import React from "react"

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

import { Bracket, Family, Muted, Tag } from "@/components/game/Texts.tsx"
import {
  computeEffectDescription,
  computeEffectOnPlayed,
  createEffect,
  fakeMegaState,
  resolveCost,
  smartClamp,
  tags,
} from "@/game-safe-utils.tsx"

import { t } from "@/i18n"

const reusable = {
  drawSpecific: (options: {
    label: React.ReactNode | ((plural: boolean) => React.ReactNode)
    filter: (card: GameCardInfo<true>) => boolean
    ephemeral?: boolean
  }) => {
    return (advantage = 0, state = fakeMegaState) => {
      const basePrice = ACTIONS_COST.drawSpecific
      const baseEffect = 1
      const price = smartClamp(basePrice - advantage)

      const possibleDraw = Math.min(
        Math.floor(MAX_HAND_SIZE / 2),
        state.revivedDraw.filter(options.filter).length,
      )

      const drawSpecific =
        possibleDraw > 0
          ? smartClamp(
              baseEffect +
                Math.floor(Math.abs(price.rest) / ACTIONS_COST.drawSpecific),
              baseEffect,
              possibleDraw,
            )
          : {
              value: 0,
              rest: Math.abs(price.rest),
              plural: false,
            }

      const energy = smartClamp(
        (possibleDraw > 0 ? 0 : 1) + drawSpecific.rest,
        possibleDraw > 0 ? 0 : 1,
        Math.floor(state.energyMax / 2),
      )

      const money = energy.rest * ENERGY_TO_MONEY

      return {
        hint: t(
          <>
            La pioche doit contenir au moins une carte {options.label} pour
            déclencher l'effet de pioche.
          </>,
          <>
            The draw pile must contain at least one {options.label} card to
            trigger the draw effect.
          </>,
        ),
        description: (
          <>
            {drawSpecific.value <= 0 ? (
              <Muted>
                <Tag name="draw" />{" "}
                {drawSpecific.value > 0 ? drawSpecific.value : baseEffect}{" "}
                {t("carte", "card")}
                {drawSpecific.plural && "s"}{" "}
                {typeof options.label === "function"
                  ? options.label(drawSpecific.plural)
                  : options.label}
              </Muted>
            ) : (
              <>
                <Tag name="draw" />{" "}
                {drawSpecific.value > 0 ? drawSpecific.value : baseEffect}{" "}
                {t("carte", "card")}
                {drawSpecific.plural && "s"}{" "}
                {typeof options.label === "function"
                  ? options.label(drawSpecific.plural)
                  : options.label}
              </>
            )}
            {computeEffectDescription({
              energy,
              money,
            })}
          </>
        ),
        onPlayed: async (state, _, reason) => {
          if (possibleDraw > 0)
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
        cost: resolveCost(price.value),
        needsPlayZone: true,
        tags: ["draw", options.ephemeral ? "ephemeral" : null].filter(
          (tag) => !!tag,
        ) as (keyof typeof tags)[],
      }
    }
  },
  recycleSpecific: (options: {
    label: React.ReactNode | ((plural: boolean) => React.ReactNode)
    filter: (card: GameCardInfo<true>) => boolean
    hint?: string
  }) => {
    return (advantage = 0, state = fakeMegaState) => {
      const basePrice = ACTIONS_COST.drawSpecific
      const baseEffect = 1
      const price = smartClamp(basePrice - advantage)

      const possibleRecycle = Math.min(
        state.revivedDiscard.length,
        state.revivedDiscard.filter(options.filter).length,
      )

      const recycleSpecific =
        possibleRecycle > 0
          ? smartClamp(
              baseEffect +
                Math.floor(Math.abs(price.rest) / ACTIONS_COST.recycleSpecific),
              baseEffect,
              possibleRecycle,
            )
          : {
              value: 0,
              rest: Math.abs(price.rest),
              plural: false,
            }

      const energy = smartClamp(
        (possibleRecycle > 0 ? 0 : baseEffect) + recycleSpecific.rest,
        possibleRecycle > 0 ? 0 : baseEffect,
        Math.floor(state.energyMax / 2),
      )

      const money = energy.rest * ENERGY_TO_MONEY

      return {
        hint: t(
          <>
            La défausse doit contenir au moins une carte {options.label} pour
            déclencher l'effet <Tag name="recycle" />
            {options.hint && " et " + options.hint.toLowerCase()}.
          </>,
          <>
            The discard pile must contain at least one card {options.label} to
            trigger the effect <Tag name="recycle" />
            {options.hint && " and " + options.hint.toLowerCase()}.
          </>,
        ),
        description: (
          <>
            {recycleSpecific.value > 0 ? (
              <>
                <Tag name="recycle" />{" "}
                {recycleSpecific.value > 0 ? recycleSpecific.value : baseEffect}{" "}
                {t("carte", "card")}
                {recycleSpecific.plural && "s"}{" "}
                {typeof options.label === "function"
                  ? options.label(recycleSpecific.plural)
                  : options.label}
              </>
            ) : (
              <Muted>
                <Tag name="recycle" />{" "}
                {recycleSpecific.value > 0 ? recycleSpecific.value : baseEffect}{" "}
                {t("carte", "card")}
                {recycleSpecific.plural && "s"}{" "}
                {typeof options.label === "function"
                  ? options.label(recycleSpecific.plural)
                  : options.label}
              </Muted>
            )}
            {computeEffectDescription({
              energy,
              money,
            })}
          </>
        ),
        condition: (state) => state.revivedDiscard.some(options.filter),
        onPlayed: async (state, _, reason) => {
          if (recycleSpecific.value > 0)
            await state.recycleCard({
              count: recycleSpecific.value,
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
        cost: resolveCost(price.value),
        tags: ["recycle"],
        needsPlayZone: true,
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
        label: t(
          <>
            coûtant de{" "}
            <span className="whitespace-nowrap">
              l'
              <Tag name="energy" />
            </span>
          </>,
          <>
            Costing <Tag name="energy" />
          </>,
        ),
        filter: (card) =>
          card.effect.cost.value > 0 && card.effect.cost.type === "energy",
      }),
    },
    {
      name: "TypeScript",
      image: "ts.png",
      effect: reusable.drawSpecific({
        label: <Family name="TypeScript" />,
        filter: (card) =>
          !card.effect.tags.includes("upgrade") &&
          card.type === "action" &&
          card.families.includes("TypeScript"),
      }),
    },
    {
      name: "JavaScript",
      image: "js.png",
      effect: reusable.drawSpecific({
        label: <Tag name="support" />,
        filter: (card) => card.type === "support",
      }),
    },
    {
      name: "React",
      image: "react.webp",
      effect: reusable.drawSpecific({
        label: (
          <>
            <Family name="React" /> {t("ou", "or")} <Family name="Site web" />
          </>
        ),
        filter: (card) =>
          !card.effect.tags.includes("upgrade") &&
          card.type === "action" &&
          (card.families.includes("React") ||
            card.families.includes("Site web")),
      }),
    },
    {
      name: "Tailwind CSS",
      image: "tailwind.png",
      effect: createEffect({
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.draw,
          min: 2,
          max: Math.floor(MAX_HAND_SIZE / 2),
        },
        description: ({ value, plural }) =>
          t(
            <>
              <Tag name="discard" /> les cartes <Tag name="action" /> en main{" "}
              <Bracket>min 1</Bracket> puis <Tag name="draw" />{" "}
              <span className="whitespace-nowrap">
                {value} carte
                {plural && "s"}
              </span>
            </>,
            <>
              <Tag name="discard" /> the <Tag name="action" /> cards in your
              hand <Bracket>min 1</Bracket> then <Tag name="draw" />{" "}
              <span className="whitespace-nowrap">
                {value} card
                {plural && "s"}
              </span>
            </>,
          ),
        condition: (state) =>
          state.revivedHand.some((card) => card.type === "action"),
        async onPlayed(state, _, reason) {
          await state.discardCard({
            filter: (card) => card.type === "action",
            reason,
          })

          await state.drawCard(this.value, {
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        tags: ["discard", "draw"],
      }),
    },
    {
      name: "NodeJS",
      image: "node.png",
      effect: reusable.drawSpecific({
        label: (
          <>
            {t("qui", "that")} <Tag name="recycle" />
          </>
        ),
        filter: (card) => card.effect.tags.includes("recycle"),
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
        hint: t(
          <>
            La pioche doit contenir au moins une carte <Tag name="action" />
          </>,
          <>
            The draw pile must contain at least one <Tag name="action" /> card
          </>,
        ),
        description: ({ value, plural }) =>
          t(
            <>
              <Tag name="draw" /> {value} carte{plural && "s"}{" "}
              <Tag name="action" /> si tu n'as pas de carte{" "}
              <Tag name="action" /> en main
            </>,
            <>
              <Tag name="draw" /> {value} card{plural && "s"}{" "}
              <Tag name="action" /> if you do not have an <Tag name="action" />{" "}
              card in your hand
            </>,
          ),
        condition: (state) =>
          !state.revivedHand.some((card) => card.type === "action") &&
          state.revivedDraw.some((card) => card.type === "action"),
        async onPlayed(state, _, reason) {
          await state.drawCard(this.value, {
            filter: (card) => card.type === "action",
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        tags: ["draw"],
      }),
    },
    {
      name: "Vercel",
      image: "vercel.png",
      effect: reusable.drawSpecific({
        label: <Tag name="action" />,
        filter: (card) => card.type === "action",
      }),
    },
    {
      name: "PostgreSQL",
      image: "pgsql.png",
      effect: reusable.drawSpecific({
        label: <Tag name="upgrade" />,
        filter: (card) => card.effect.tags.includes("upgrade"),
        ephemeral: true,
      }),
    },
    {
      name: "Docker",
      image: "docker.webp",
      effect: reusable.drawSpecific({
        label: (plural) => t(<>gratuite{plural && "s"}</>, "free"),
        filter: (card) => card.effect.cost.value <= 0,
      }),
    },
    {
      name: "PixiJS",
      image: "pixi.png",
      effect: reusable.drawSpecific({
        label: <Family name="Jeu vidéo" />,
        filter: (card) =>
          !card.effect.tags.includes("upgrade") &&
          card.type === "action" &&
          card.families.includes("Jeu vidéo"),
      }),
    },
    {
      name: "Three.js",
      image: "three.png",
      effect: reusable.recycleSpecific({
        label: <Family name="Jeu vidéo" />,
        filter: (card) =>
          !card.effect.tags.includes("upgrade") &&
          card.type === "action" &&
          card.families.includes("Jeu vidéo"),
      }),
    },
    {
      name: "Gulp",
      image: "gulp.webp",
      effect: reusable.recycleSpecific({
        label: (plural) => (
          <>
            {t("qui", "that")} <Tag name="draw" plural={plural} />
          </>
        ),
        filter: (card) => card.effect.tags.includes("draw"),
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
        description: ({ value, plural }) => (
          <>
            <Tag name="draw" /> {value}{" "}
            {t(
              <>carte{plural && "s"} dans la défausse</>,
              <>card{plural && "s"} in the discard pile</>,
            )}
          </>
        ),
        condition: (state) => state.discard.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(this.value!, {
            fromDiscardPile: true,
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
        tags: ["recyclage", "draw", "recycle"],
      }),
    },
    {
      name: "Git",
      image: "git.png",
      effect: createEffect({
        basePrice: 10,
        skipEnergyGain: true,
        description: (
          <>
            <Tag name="recycle" />{" "}
            {t(
              "toutes les cartes de la défausse",
              "all the cards in the discard pile",
            )}
          </>
        ),
        condition: (state) => state.discard.length > 0,
        async onPlayed(state, _, reason) {
          await state.recycleCard({ reason })
        },
        needsPlayZone: true,
      }),
    },
    {
      name: "Jest",
      image: "jest.png",
      effect: createEffect({
        basePrice: 1,
        description: (
          <>
            <Tag name="draw" /> {t("une carte", "a card")}
          </>
        ),
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(1, { reason })
        },
        waitBeforePlay: true,
        tags: ["draw"],
      }),
    },
    {
      name: "ESLint",
      image: "eslint.png",
      effect: createEffect({
        skipEnergyGain: true,
        dynamicEffect: {
          cost: ACTIONS_COST.draw,
          min: Math.floor(MAX_HAND_SIZE / 2),
          max: MAX_HAND_SIZE,
        },
        hint: t(
          "La pioche doit contenir au moins une carte",
          "The draw pile must contain at least one card",
        ),
        description: ({ value, plural }) =>
          t(
            <>
              <Tag name="discard" /> toutes les cartes en main et{" "}
              <Tag name="draw" /> {value} carte{plural && "s"}
            </>,
            <>
              <Tag name="discard" /> all your cards and <Tag name="draw" />{" "}
              {value} card{plural && "s"}
            </>,
          ),
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.discardCard({ reason })

          await state.drawCard(this.value!, {
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
        tags: ["discard", "draw"],
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
          min: 5,
          max: MAX_HAND_SIZE,
        },
        description: ({ value, plural }) =>
          t(
            <>
              <Tag name="giveBack" /> ta main puis <br />
              <Tag name="draw" /> {value} carte{plural && "s"}
            </>,
            <>
              <Tag name="giveBack" /> your hand then <br />
              <Tag name="draw" /> {value} card{plural && "s"}
            </>,
          ),
        async onPlayed(state, _, reason) {
          await state.discardCard({ toDraw: true, reason })

          await state.drawCard(this.value, {
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
        tags: ["giveBack", "draw"],
      }),
    },
    {
      name: "Processing",
      image: "processing.webp",
      effect: createEffect({
        basePrice: 1,
        description: (
          <>
            <Tag name="draw" /> {t("une carte", "a card")}
          </>
        ),
        condition: (state) => state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(1, { reason, skipGameOverPause: true })
        },
        waitBeforePlay: true,
        costType: "money",
        tags: ["draw"],
      }),
    },
    {
      name: "p5.js",
      image: "p5.png",
      effect: createEffect({
        basePrice: 2,
        description: (
          <>
            <Tag name="recycle" /> {t("une carte aléatoire", "a random card")}
          </>
        ),
        condition: (state) => state.discard.length >= 1,
        async onPlayed(state, _, reason) {
          await state.recycleCard({
            count: 1,
            shuffleBefore: true,
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
        costType: "money",
        tags: ["recycle", "recyclage"],
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
        description: ({ value, plural }) =>
          t(
            <>
              <Tag name="draw" /> {value} carte{plural && "s"} si tu as moins de
              5 cartes en main
            </>,
            <>
              <Tag name="draw" /> {value} card{plural && "s"} if you have less
              than 5 cards in your hand
            </>,
          ),
        condition: (state) => state.hand.length < 5 && state.draw.length >= 1,
        async onPlayed(state, _, reason) {
          await state.drawCard(this.value, {
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        tags: ["draw"],
      }),
    },
    {
      name: "Windows",
      image: "windows.png",
      effect: reusable.recycleSpecific({
        label: <Tag name="action" />,
        filter: (card) => card.type === "action",
      }),
    },
    {
      name: "Linux",
      image: "linux.png",
      effect: reusable.recycleSpecific({
        label: <Tag name="support" />,
        filter: (card) => card.type === "support",
      }),
    },
    {
      name: "MacOS",
      image: "macos.png",
      effect: reusable.recycleSpecific({
        label: (plural) => t(<>gratuite{plural && "s"}</>, "free"),
        filter: (card) => card.effect.cost.value <= 0,
      }),
    },
    {
      name: "Jetbrains",
      image: "jetbrains.webp",
      effect: reusable.recycleSpecific({
        label: (plural) => (
          <>
            {t("qui", "that")} <Tag name="recycle" plural={plural} />
          </>
        ),
        filter: (card) => card.effect.tags.includes("recycle"),
      }),
    },
    {
      name: "Ruby",
      image: "ruby.png",
      effect: createEffect({
        basePrice: 10,
        hint: t(
          <>
            La pioche doit contenir au moins une carte <Tag name="upgrade" />
          </>,
          <>
            The draw pile must contain at least one <Tag name="upgrade" /> card
          </>,
        ),
        description: t(
          <>
            <Tag name="draw" /> une carte <Tag name="upgrade" /> si ta{" "}
            <Tag name="reputation" /> est au max
          </>,
          <>
            <Tag name="draw" /> a <Tag name="upgrade" /> card if your{" "}
            <Tag name="reputation" /> is at max
          </>,
        ),
        condition: (state) =>
          state.reputation === MAX_REPUTATION &&
          state.revivedDraw.some((c) => c.effect.tags.includes("upgrade")),
        async onPlayed(state, _, reason) {
          await state.drawCard(1, {
            filter: (card) => Boolean(card.effect.tags.includes("upgrade")),
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        costType: "money",
        tags: ["draw"],
      }),
    },
    {
      name: "ESBuild",
      image: "esbuild.png",
      effect: createEffect({
        basePrice: 10,
        hint: t(
          <>
            La pioche doit contenir au moins une carte <Tag name="upgrade" />
          </>,
          <>
            The draw must contain at least one <Tag name="upgrade" /> card
          </>,
        ),
        description: t(
          <>
            Si la <Tag name="reputation" /> est inférieur{" "}
            <span className="whitespace-nowrap">
              à {Math.floor(MAX_REPUTATION / 2)},
            </span>{" "}
            <Tag name="draw" /> une carte <Tag name="upgrade" />
          </>,
          <>
            If your <Tag name="reputation" /> is less than{" "}
            <span className="whitespace-nowrap">
              {Math.floor(MAX_REPUTATION / 2)},
            </span>{" "}
            <Tag name="draw" /> a <Tag name="upgrade" /> card
          </>,
        ),
        condition: (state) =>
          state.reputation < Math.floor(MAX_REPUTATION / 2) &&
          state.revivedDraw.some((c) => c.effect.tags.includes("upgrade")),
        async onPlayed(state, _, reason) {
          await state.drawCard(1, {
            filter: (card) => Boolean(card.effect.tags.includes("upgrade")),
            skipGameOverPause: true,
            reason,
          })
        },
        waitBeforePlay: true,
        costType: "money",
      }),
    },
    {
      name: "PlayCurious",
      image: "play-curious.png",
      effect: createEffect({
        basePrice:
          ACTIONS_COST.discardAll -
          ACTIONS_COST.condition +
          ACTIONS_COST.drawSpecific * 2,
        hint: t(
          <>
            Ta main doit contenir au moins une autre carte et la pioche doit
            contenir au moins une carte <Family name="PlayCurious" />
          </>,
          <>
            Your hand must contain at least one other card and the draw pile
            must contain at least one <Family name="PlayCurious" /> card
          </>,
        ),
        description: t(
          <>
            <Tag name="discard" /> ta main sauf les cartes{" "}
            <Family name="TypeScript" /> puis
            <Tag name="draw" /> 2 cartes <Family name="PlayCurious" />
          </>,
          <>
            <Tag name="discard" /> your hand except <Family name="TypeScript" />
            then <Tag name="draw" /> 2 <Family name="PlayCurious" /> cards
          </>,
        ),
        condition: (state, card) =>
          state.revivedDraw.some(
            (card) =>
              card.type === "action" && card.families.includes("PlayCurious"),
          ) && state.hand.filter((c) => c.name !== card.name).length > 0,
        async onPlayed(state, _, reason) {
          await state.discardCard({
            filter: (card) =>
              card.type !== "action" || !card.families.includes("TypeScript"),
            reason,
          })

          await state.drawCard(2, {
            filter: (card) =>
              card.type === "action" && card.families.includes("PlayCurious"),
            skipGameOverPause: true,
            reason,
          })
        },
        needsPlayZone: true,
        tags: ["discard", "draw"],
      }),
    },
  ] satisfies Omit<SupportCardInfo, "type">[]
).map<SupportCardInfo>((support) => ({
  ...support,
  type: "support",
  image: `images/supports/${support.image}`,
}))

export default supports
