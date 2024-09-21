import React from "react"

import "./GameCard.css"

import BrokenCard from "@/assets/icons/game/broken-card.svg"

import type { GameResource } from "@/game-typings"

import { useCardGame } from "@/hooks/useCardGame.ts"
import { useSettings } from "@/hooks/useSettings.ts"
import { formatText } from "@/game-safe-utils.ts"
import { cn } from "@/utils.ts"

import { Tilt, TiltFoil } from "@/components/game/Tilt.tsx"
import { BorderLight } from "@/components/ui/border-light.tsx"

export const GameResourceCard = (
  props: React.PropsWithoutRef<{
    resource: GameResource
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

  const game = useCardGame((state) => ({
    pickOption: state.pickOption,
  }))

  const resource = {
    id: props.resource[0],
    state: props.resource[1],
    value: props.resource[2],
    type: props.resource[3],
  }

  return (
    <div
      key={resource.id}
      className={cn(
        "game-card",
        "relative w-[210px] h-[293px]",
        "-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",
        { [cn("transition-transform", resource.state)]: quality.animation },
      )}
      onClick={async () => {
        await game.pickOption(props.resource)
      }}
      style={{
        transitionDuration: quality.animation ? "0.3s" : "0",
        transitionTimingFunction: quality.animation ? "ease-in-out" : "linear",
      }}
    >
      {resource.state === "removing" && quality.animation ? (
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
      ) : resource.state === "removed" ? (
        <></>
      ) : (
        <Tilt
          scale={1.1}
          className={cn(
            "group/game-card",
            "flex flex-col w-full h-full rounded-xl justify-center",
            "*:shrink-0",
            {
              "bg-card/60": quality.transparency,
              "bg-card": !quality.transparency,
              "transition-shadow duration-200 ease-in-out hover:shadow-glow-20 shadow-primary":
                quality.shadows,
              "shadow-glow-20 shadow-primary": resource.state === "selected",
            },
            "ring-2",
            {
              "ring-money/50": resource.type === "money",
              "ring-energy/50": resource.type === "energy",
              "ring-reputation/50": resource.type === "reputation",
            },
          )}
        >
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

          {/* Body / Description */}
          <div
            style={{
              transformStyle: quality.perspective ? "preserve-3d" : "flat",
            }}
          >
            <div
              className="py-[10px] text-center font-changa text-2xl"
              style={{
                transform: quality.perspective ? "translateZ(10px)" : "none",
                transformStyle: quality.perspective ? "preserve-3d" : "flat",
              }}
              dangerouslySetInnerHTML={{
                __html: formatText(
                  resource.type === "money"
                    ? `${resource.value}M$`
                    : `${resource.value} @${resource.type}`,
                ),
              }}
            />

            <div
              className={cn("text-center h-full text-2xl font-bold", {
                "text-muted-foreground/30": quality.transparency,
                "text-muted-foreground": !quality.transparency,
              })}
            >
              Instantané
            </div>
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
