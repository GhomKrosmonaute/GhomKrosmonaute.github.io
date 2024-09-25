import React from "react"

import "./GameCard.css"

import BrokenCard from "@/assets/icons/game/broken-card.svg"

import {
  ActionCardInfo,
  compactGameCardInfo,
  GameCardInfo,
  SupportCardInfo,
} from "@/game-typings"

import { useCardGame } from "@/hooks/useCardGame.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import { cn } from "@/utils.ts"

import { Tilt, TiltFoil } from "@/components/game/Tilt.tsx"
import { BorderLight } from "@/components/ui/border-light.tsx"
import upgrades from "@/data/upgrades.ts"
import {
  canBeBuy,
  formatText,
  getRarityName,
  isActionCardInfo,
  resolveSubTypes,
} from "@/game-safe-utils.ts"
import { GameCost } from "@/components/game/GameCost.tsx"
import { GameAdvantageBadge } from "@/components/game/GameAdvantageBadge.tsx"
// import { GameCardPopover } from "@/components/game/GameCardPopover.tsx"

export const GameCard = (
  props: React.PropsWithoutRef<{
    card: GameCardInfo<true>
    position?: number
    isChoice?: boolean
    isPlaying?: boolean
    withoutDetail?: boolean
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
    return {
      ...state,
      canBeBuy: canBeBuy(props.card, state),
      canTriggerEffect:
        !props.card.effect.condition ||
        props.card.effect.condition(state, props.card),
      selectionInProgress: state.operationInProgress.some((op) =>
        op.startsWith("selectCard"),
      ),
    }
  })

  const positionFromCenter =
    typeof props.position === "number"
      ? props.position - (game.hand.length - 1) / 2
      : 0

  const notAllowed = props.isChoice
    ? game.operationInProgress.filter((o) => o !== "choices").length > 0
    : game.operationInProgress.length > 0

  const rarityName = getRarityName(props.card.rarity)

  return (
    <div
      key={props.card.name + props.card.rarity}
      className={cn(
        "game-card",
        "relative w-[210px] h-[293px]",
        "-mx-3.5 z-10 hover:z-30 cursor-pointer select-none",
        {
          // "z-20": props.card.state === "highlighted",
          "cursor-not-allowed":
            (game.selectionInProgress && props.card.state !== "selected") ||
            (!game.selectionInProgress &&
              (notAllowed ||
                props.isPlaying ||
                (!props.isChoice && game.choiceOptions.length > 0))),
          [cn("transition-transform", props.card.state)]: quality.animation,
          [cn({
            "-translate-y-14": props.card.state === "selected",
            "hover:-translate-y-14": props.card.state !== "removing",
            grayscale:
              (game.selectionInProgress && props.card.state !== "selected") ||
              (!game.selectionInProgress &&
                (game.choiceOptions.length > 0 ||
                  game.isGameOver ||
                  !game.canBeBuy ||
                  !game.canTriggerEffect)),
            // "translate-y-8": !canTriggerEffect || !haveEnoughResources,
          })]: !props.isChoice && !props.isPlaying && !props.withoutDetail,
        },
      )}
      onClick={async () => {
        if (props.withoutDetail) return
        if (props.isPlaying) return

        if (!props.isChoice) {
          if (game.selectionInProgress) {
            game.selectCard(props.card.name)
          } else if (
            game.choiceOptions.length === 0 &&
            !notAllowed &&
            !game.isGameOver
          ) {
            await game.playCard(props.card, {
              reason: compactGameCardInfo(props.card),
            })
          }
        } else {
          if (game.choiceOptions.length > 0 && !notAllowed) {
            await game.pickOption(props.card)
          }
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()

        if (props.withoutDetail) return

        game.setCardDetail(compactGameCardInfo(props.card))
      }}
      style={{
        marginBottom: `${20 - Math.abs(positionFromCenter) * 5}px`, // temporaire, peut causer des problèmes
        rotate: `${positionFromCenter * 2}deg`,
        transitionDuration: quality.animation ? "0.3s" : "0",
        transitionTimingFunction: quality.animation ? "ease-in-out" : "linear",
        scale: props.card.state === "highlighted" ? "1.1" : "1",
      }}
    >
      {props.card.state === "removing" && quality.animation ? (
        <div className="relative">
          <BrokenCard
            className={cn(
              "absolute",
              Math.random() < 0.5 ? "scale-x-[-1]" : "",
              {
                "text-card/60": quality.transparency,
                "text-card": !quality.transparency,
                [cn({
                  "stroke-common": rarityName === "common",
                  "stroke-rare": rarityName === "rare",
                  "stroke-epic": rarityName === "epic",
                  "stroke-legendary": rarityName === "legendary",
                  "stroke-cosmic": rarityName === "cosmic",
                  "stroke-singularity": rarityName === "singularity",
                })]: !props.card.effect.token,
              },
            )}
            style={{
              maskClip: "fill-box",
            }}
          />
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
              })]: props.card.type === "support",
              // "shadow-action": props.card.effect.type === "action",
              "transition-shadow duration-200 ease-in-out hover:shadow-glow-20 shadow-primary":
                quality.shadows,
              [cn("ring-2", {
                "ring-common shadow-common": rarityName === "common",
                "ring-rare shadow-rare": rarityName === "rare",
                "ring-epic shadow-epic": rarityName === "epic",
                "ring-legendary shadow-legendary": rarityName === "legendary",
                "ring-cosmic shadow-cosmic": rarityName === "cosmic",
                "ring-singularity shadow-singularity":
                  rarityName === "singularity",
              })]: !props.card.effect.token,
            },
          )}
        >
          {/*<GameCardPopover card={props.card} justFamily>*/}
          <>
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
                  "bg-action": props.card.type === "action",
                  "bg-support": props.card.type === "support",
                  "bg-upgrade": props.card.effect.upgrade,
                },
              )}
              style={{
                transformStyle: quality.perspective ? "preserve-3d" : "flat",
              }}
            >
              <div
                className="font-changa shrink-0 relative"
                style={{
                  transform: `${quality.perspective ? "translateZ(5px)" : ""} translateX(${props.card.effect.cost.type === "money" ? "-15px" : "-8px"})`,
                  transformStyle: quality.perspective ? "preserve-3d" : "flat",
                }}
              >
                <GameCost cost={props.card.effect.cost} />
              </div>
              <h2
                className={cn(
                  "absolute left-0 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis shrink-0 flex-grow text-xl font-changa",
                  {
                    [cn({
                      "left-3 text-lg":
                        props.card.effect.cost.type === "money" &&
                        props.card.name.length > 7,
                      "left-7":
                        props.card.effect.cost.type === "money" &&
                        props.card.effect.cost.value > 99,
                      "text-md": props.card.name.length > 11,
                    })]: props.card.effect.cost.value > 0,
                    "text-action-foreground": props.card.type === "action",
                    "text-support-foreground": props.card.type === "support",
                    "text-upgrade-foreground": props.card.effect.upgrade,
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
                {!props.card.effect.token && (
                  /* Rarity indicator */
                  <GameAdvantageBadge advantage={props.card.rarity} />
                )}

                {props.card.effect.upgrade && (
                  /* Upgrade max indicator */
                  <div className="bg-upgrade">
                    {(() => {
                      const raw = upgrades.find(
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
                props.card.type === "action" && {
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
                className="py-[12px] px-[10px] text-center"
                style={{
                  transform: quality.perspective ? "translateZ(10px)" : "none",
                  transformStyle: quality.perspective ? "preserve-3d" : "flat",
                }}
                dangerouslySetInnerHTML={{
                  __html: props.card.effect.description,
                }}
              />

              {(props.card.effect.ephemeral ||
                props.card.effect.recyclage ||
                props.card.effect.token) && (
                <div
                  className={cn("text-center text-2xl font-bold", {
                    "text-muted-foreground/50": quality.transparency,
                    "text-muted-foreground": !quality.transparency,
                  })}
                  dangerouslySetInnerHTML={{
                    __html: formatText(
                      resolveSubTypes(props.card.effect)
                        .map((type) => `@${type}`)
                        .join("<br>"),
                    ),
                  }}
                />
              )}
            </div>

            <BorderLight
              groupName="game-card"
              appearOnHover
              disappearOnCorners
            />
            <BorderLight
              groupName="game-card"
              appearOnHover
              disappearOnCorners
              opposed
            />

            <TiltFoil />
          </>
          {/*</GameCardPopover>*/}
        </Tilt>
      )}
    </div>
  )
}

const GameCardProject = (
  props: React.PropsWithoutRef<{ card: ActionCardInfo<true> }>,
) => {
  const { shadows, perspective } = useSettings((state) => ({
    shadows: state.quality.shadows,
    perspective: state.quality.perspective,
  }))

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
        className="flex justify-center items-center mt-7 mb-3"
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
