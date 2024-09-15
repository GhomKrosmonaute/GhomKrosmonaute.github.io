import React from "react"

import "./GameCard.css"

import BrokenCard from "@/assets/icons/game/broken-card.svg"
import QuoteLeft from "@/assets/icons/quote-left.svg"
import QuoteRight from "@/assets/icons/quote-right.svg"

import type {
  ActionCardInfo,
  GameCardInfo,
  SupportCardInfo,
} from "@/game-typings"

import { useCardGame } from "@/hooks/useCardGame.ts"

import {
  cardInfoToIndice,
  energyCostColor,
  isActionCardInfo,
  parseCost,
} from "@/game-utils.ts"

import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import { Tilt, TiltFoil } from "@/components/game/Tilt.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { BorderLight } from "@/components/ui/border-light.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { cn } from "@/utils.ts"
import { LOCAL_ADVANTAGE } from "@/game-constants.ts"

export const GameCard = (
  props: React.PropsWithoutRef<{
    card: GameCardInfo<true>
    position?: number
    isChoice?: boolean
    isPlaying?: boolean
  }>,
) => {
  const quality = useSettings((state) => ({
    blur: state.quality.blur,
    shadows: state.quality.shadows,
    perspective: state.quality.perspective,
    animation: state.quality.animations,
    transparency: state.quality.transparency,
    tilt: state.quality.tilt,
  }))

  const game = useCardGame((state) => {
    const parsedCost = parseCost(state, props.card, [])
    const energyColor = energyCostColor(state, parsedCost.cost)

    return {
      rawUpgrades: state.rawUpgrades,
      handSize: state.hand.length,
      operationInProgress: state.operationInProgress,
      play: state.playCard,
      pick: state.pickCard,
      isGameOver: state.isGameOver,
      parsedCost,
      energyColor,
      choiceOptions: state.choiceOptions,
      canTriggerEffect:
        !props.card.effect.condition ||
        props.card.effect.condition(state, props.card),
    }
  })

  const positionFromCenter =
    typeof props.position === "number"
      ? props.position - (game.handSize - 1) / 2
      : 0

  const notAllowed = props.isChoice
    ? game.operationInProgress.filter((o) => o !== "choices").length > 0
    : game.operationInProgress.length > 0

  let rarityName: keyof typeof LOCAL_ADVANTAGE = "legendary"

  for (const [key, advantage] of Object.entries(LOCAL_ADVANTAGE)) {
    if (advantage === props.card.localAdvantage) {
      rarityName = key as keyof typeof LOCAL_ADVANTAGE
      break
    }
  }

  return (
    <div
      key={props.card.name}
      className={cn(
        "game-card",
        "relative w-[210px] h-[293px]",
        "-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",
        {
          "cursor-not-allowed":
            notAllowed ||
            props.isPlaying ||
            (!props.isChoice && game.choiceOptions.length > 0),
          [cn("transition-transform", props.card.state)]: quality.animation,
          [cn({
            "-translate-y-14": props.card.state === "selected",
            "hover:-translate-y-14": props.card.state !== "removing",
            grayscale:
              game.choiceOptions.length > 0 ||
              game.isGameOver ||
              !game.parsedCost.canBeBuy ||
              !game.canTriggerEffect,
            // "translate-y-8": !canTriggerEffect || !haveEnoughResources,
          })]: !props.isChoice && !props.isPlaying,
        },
      )}
      onClick={async () => {
        if (props.isPlaying) return

        if (!props.isChoice) {
          if (
            game.choiceOptions.length === 0 &&
            !notAllowed &&
            !game.isGameOver
          ) {
            await game.play(props.card, {
              reason: cardInfoToIndice(props.card),
            })
          }
        } else {
          if (game.choiceOptions.length > 0 && !notAllowed) {
            await game.pick(props.card)
          }
        }
      }}
      onContextMenu={(e) => {
        if (isActionCardInfo(props.card) && props.card.url) {
          e.preventDefault()
          // open new tab with project url
          window.open(props.card.url, "_blank")
        }
      }}
      style={{
        marginBottom: `${20 - Math.abs(positionFromCenter) * 5}px`, // temporaire, peut causer des problèmes
        rotate: `${positionFromCenter * 2}deg`,
        transitionDuration: quality.animation ? "0.3s" : "0",
        transitionTimingFunction: quality.animation ? "ease-in-out" : "linear",
      }}
    >
      {props.card.state === "removing" && quality.animation ? (
        <div className="relative">
          {Math.random() < 0.5 ? (
            <BrokenCard
              className={cn("absolute scale-x-[-1]", {
                "text-card/60": quality.transparency,
                "text-card": !quality.transparency,
              })}
              style={{
                maskClip: "fill-box",
              }}
            />
          ) : (
            <BrokenCard
              className={cn("absolute", {
                "text-card/60": quality.transparency,
                "text-card": !quality.transparency,
              })}
              style={{
                maskClip: "fill-box",
              }}
            />
          )}
        </div>
      ) : props.card.state === "removed" ? (
        <></>
      ) : (
        <Tilt
          scale={1.1}
          className={cn(
            "group/game-card",
            "flex flex-col w-full h-full rounded-xl",
            "*:shrink-0",
            {
              [cn({
                "bg-card/60": quality.transparency,
                "bg-card": !quality.transparency,
              })]: props.card.effect.type === "support",
              // "shadow-action": props.card.effect.type === "action",
              "transition-shadow duration-200 ease-in-out hover:shadow-glow-20 shadow-primary":
                quality.shadows,
              "shadow-glow-20 shadow-primary": props.card.state === "selected",
            },
          )}
        >
          {/* Action details popover */}
          {isActionCardInfo(props.card) && props.card.detail && (
            <div
              className={cn(
                "absolute pointer-events-none left-1/2 -top-[10px] -translate-x-1/2 -translate-y-full rounded-2xl bg-card",
                "p-2 w-max max-w-full gap-1",
                {
                  "shadow shadow-action": quality.shadows,
                  "transition-opacity duration-200 ease-in-out delay-1000":
                    quality.animation,
                  "opacity-0 group-hover/game-card:opacity-100 flex":
                    quality.transparency,
                  "hidden group-hover/game-card:flex": !quality.transparency,
                },
              )}
            >
              <QuoteLeft className="w-10" />
              <div className="flex-grow text-sm text-left">
                {props.card.detail}
              </div>
              <QuoteRight className="w-10 self-end" />
            </div>
          )}

          {/* Background */}
          {quality.perspective && quality.tilt && (
            <div
              className={cn("absolute w-full h-full rounded-xl", {
                "bg-card/60": quality.transparency,
                "bg-card": !quality.transparency,
                // "backdrop-blur-sm": blur && transparency,
              })}
              style={{
                transform: "translateZ(-20px)",
              }}
            />
          )}

          {/* Header */}
          <div
            className={cn(
              "relative flex justify-start items-center h-10 rounded-t-xl",
              {
                "bg-action": props.card.effect.type === "action",
                [cn({
                  "bg-support/50": quality.transparency,
                  "bg-support": !quality.transparency,
                })]: props.card.effect.type === "support",
              },
            )}
            style={{
              transformStyle: quality.perspective ? "preserve-3d" : "flat",
            }}
          >
            <div
              className="font-changa shrink-0 relative"
              style={{
                transform: `${quality.perspective ? "translateZ(5px)" : ""} translateX(${game.parsedCost.needs === "money" ? "-15px" : "-8px"})`,
                transformStyle: quality.perspective ? "preserve-3d" : "flat",
              }}
            >
              {game.parsedCost.needs === "energy" ? (
                <GameValueIcon
                  isCost
                  value={game.parsedCost.cost}
                  colors={game.energyColor}
                  style={{
                    transform: quality.perspective ? "translateZ(5px)" : "none",
                    transformStyle: quality.perspective
                      ? "preserve-3d"
                      : "flat",
                  }}
                />
              ) : (
                <GameMoneyIcon
                  value={String(game.parsedCost.cost)}
                  style={{
                    transform: `${quality.perspective ? "translateZ(10px)" : ""} rotate(-10deg)`,
                    transformStyle: quality.perspective
                      ? "preserve-3d"
                      : "flat",
                  }}
                />
              )}
            </div>
            <h2
              className={cn(
                "absolute left-0 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis shrink-0 flex-grow text-xl font-changa",
                {
                  [cn({
                    "left-3 text-lg":
                      game.parsedCost.needs === "money" &&
                      props.card.name.length > 7,
                    "left-7":
                      game.parsedCost.needs === "money" &&
                      game.parsedCost.cost > 99,
                    "text-md": props.card.name.length > 11,
                  })]: game.parsedCost.cost > 0,
                  "text-action-foreground": props.card.effect.type === "action",
                  "text-support-foreground":
                    props.card.effect.type === "support",
                },
              )}
              style={{
                transform: quality.perspective ? "translateZ(5px)" : "none",
              }}
            >
              {props.card.name}
            </h2>

            <div
              className={cn(
                "absolute bottom-0 left-0 translate-y-full flex",
                "*:px-2 *:py-0 *:rounded-br-md *:text-sm *:font-mono",
                {
                  "transition-opacity duration-1000 group-hover/game-card:opacity-0":
                    quality.transparency && quality.animation,
                },
              )}
            >
              {/* Rarity indicator */}
              <div
                className="z-10"
                style={{
                  color: `hsl(var(--${rarityName}-foreground))`,
                  backgroundColor: `hsl(var(--${rarityName}))`,
                }}
              >
                {rarityName}
                {props.card.localAdvantage > LOCAL_ADVANTAGE.legendary
                  ? "+".repeat(
                      LOCAL_ADVANTAGE.legendary - props.card.localAdvantage,
                    )
                  : ""}
              </div>

              {/* Upgrade max indicator */}
              {props.card.effect.upgrade && (
                <div className="bg-upgrade -ml-1">
                  {(() => {
                    const raw = game.rawUpgrades.find(
                      (raw) => raw.name === props.card.name,
                    )!
                    return raw.max === undefined
                      ? "cumul infini: ∞"
                      : `cumul max: ${raw.max}`
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          {isActionCardInfo(props.card) ? (
            <GameCardProject card={props.card} />
          ) : (
            <GameCardTechno card={props.card} />
          )}

          {/* Body / Description */}
          <div
            className={cn(
              "flex-grow rounded-b-xl",
              props.card.effect.type === "action" && {
                // "backdrop-blur-sm": blur && transparency,
                "bg-card/60": quality.transparency,
                "bg-card": !quality.transparency,
              },
            )}
            style={{
              transformStyle: quality.perspective ? "preserve-3d" : "flat",
            }}
          >
            <div
              className="py-[10px] px-[15px] text-center"
              style={{
                transform: quality.perspective ? "translateZ(10px)" : "none",
                transformStyle: quality.perspective ? "preserve-3d" : "flat",
              }}
              dangerouslySetInnerHTML={{
                __html: props.card.effect.description,
              }}
            />

            {(props.card.effect.ephemeral || props.card.effect.recycle) && (
              <div
                className={cn("text-center h-full text-2xl font-bold", {
                  "text-muted-foreground/30": quality.transparency,
                  "text-muted-foreground": !quality.transparency,
                })}
              >
                {props.card.effect.ephemeral ? "Éphémère" : "Recyclage"}
              </div>
            )}
          </div>

          <BorderLight groupName="game-card" appearOnHover disappearOnCorners />
          <BorderLight
            groupName="game-card"
            appearOnHover
            disappearOnCorners
            opposed
          />

          <TiltFoil />
        </Tilt>
      )}
    </div>
  )
}

const GameCardProject = (
  props: React.PropsWithoutRef<{ card: ActionCardInfo<true> }>,
) => {
  const { shadows, perspective, transparency, animation } = useSettings(
    (state) => ({
      shadows: state.quality.shadows,
      perspective: state.quality.perspective,
      transparency: state.quality.transparency,
      animation: state.quality.animations,
    }),
  )

  return (
    <div
      className="group/image relative"
      style={{
        transformStyle: perspective ? "preserve-3d" : "flat",
      }}
    >
      <div
        className={cn(
          { "inset-shadow": shadows },
          "relative flex justify-center items-center",
        )}
        style={{
          transformStyle: perspective ? "preserve-3d" : "flat",
        }}
      >
        <img
          src={props.card.image}
          alt={`Illustration du projet "${props.card.name}"`}
          className="w-full aspect-video object-cover"
          style={{
            transform: perspective ? "translateZ(-15px)" : "none",
          }}
        />
      </div>

      {props.card.description && (
        <div
          className={cn(
            "bottom-0 absolute w-full h-1/3 flex justify-center items-center",
            {
              "transition-opacity duration-1000": animation,
              "group-hover/image:opacity-0 bg-background/50": transparency,
            },
          )}
          style={{
            transform: perspective ? "translateZ(-5px)" : "none",
          }}
        >
          <p className="text-sm text-center">"{props.card.description}"</p>
        </div>
      )}
    </div>
  )
}

const spinners = ["React", "Knex"]

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: SupportCardInfo<true> }>,
) => {
  const { perspective, animation } = useSettings((state) => ({
    perspective: state.quality.perspective,
    animation: state.quality.animations,
  }))

  return (
    <>
      <div
        className="flex justify-center items-center mt-4"
        style={{
          transform: perspective ? "translateZ(15px)" : "none",
        }}
      >
        <img
          src={props.card.image}
          alt={`Logo de la techno "${props.card.name}"`}
          className={cn("w-2/3 object-contain aspect-video", {
            "group-hover/game-card:animate-spin-forward":
              animation && spinners.includes(props.card.name),
          })}
        />
      </div>
    </>
  )
}
