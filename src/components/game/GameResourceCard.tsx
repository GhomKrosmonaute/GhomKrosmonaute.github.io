import React from "react"

import "./GameCard.css"

import BrokenCard from "@/assets/icons/game/broken-card.svg"

import { GameResource } from "@/game-typings"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { cn } from "@/utils.ts"

import { Money, Tag } from "@/components/game/Texts.tsx"
import { Tilt, TiltFoil } from "@/components/game/Tilt.tsx"
import { BorderLight } from "@/components/ui/border-light.tsx"
import { t } from "@/i18n"

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

  return (
    <div
      key={props.resource.id}
      className={cn(
        "game-card",
        "relative w-[210px] h-[293px]",
        "-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",
        {
          [cn("transition-transform", props.resource.state)]: quality.animation,
        },
      )}
      onClick={async () => {
        await game.pickOption(props.resource)
      }}
      style={{
        transitionDuration: quality.animation ? "0.3s" : "0",
        transitionTimingFunction: quality.animation ? "ease-in-out" : "linear",
      }}
    >
      {props.resource.state === "removing" && quality.animation ? (
        <div className="relative">
          <BrokenCard
            className={cn(
              "absolute",
              Math.random() < 0.5 ? "scale-x-[-1]" : "",
              {
                "text-card/60": quality.transparency,
                "text-card": !quality.transparency,
              },
              {
                "stroke-energy": props.resource.type === "energy",
                "stroke-money": props.resource.type === "money",
                "stroke-reputation": props.resource.type === "reputation",
              },
            )}
            style={{
              maskClip: "fill-box",
            }}
          />
        </div>
      ) : props.resource.state === "removed" ? (
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
              "shadow-glow-20 shadow-primary":
                props.resource.state === "selected",
            },
            "ring-2",
            {
              "ring-money/50": props.resource.type === "money",
              "ring-energy/50": props.resource.type === "energy",
              "ring-reputation/50": props.resource.type === "reputation",
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
            >
              {props.resource.type === "money" ? (
                <Money M$={props.resource.value} />
              ) : (
                <>
                  {props.resource.value}{" "}
                  <Tag
                    name={props.resource.type}
                    plural={props.resource.value > 1}
                  />
                </>
              )}
            </div>

            <div
              className={cn("text-center h-full text-2xl font-bold", {
                "text-muted-foreground/30": quality.transparency,
                "text-muted-foreground": !quality.transparency,
              })}
            >
              {t("Instantané", "Instantaneous")}
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
