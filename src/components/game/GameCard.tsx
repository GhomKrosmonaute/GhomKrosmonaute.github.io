import React from "react";

import "./GameCard.css";

import QuoteLeft from "@/assets/icons/quote-left.svg";
import QuoteRight from "@/assets/icons/quote-right.svg";

import {
  GameCardInfo,
  ActionCardInfo,
  SupportCardInfo,
  useCardGame,
  isActionCardInfo,
  parseCost,
} from "@/hooks/useCardGame.ts";

import { cn } from "@/utils.ts";
import { Tilt, TiltFoil } from "@/components/game/Tilt.tsx";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { ValueIcon } from "@/components/game/ValueIcon.tsx";
import { MoneyIcon } from "@/components/game/MoneyIcon.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const GameCard = (
  props: React.PropsWithoutRef<{ card: GameCardInfo; position: number }>,
) => {
  const { shadows, perspective, animation, transparency, tilt } =
    useQualitySettings((state) => ({
      blur: state.blur,
      shadows: state.shadows,
      perspective: state.perspective,
      animation: state.animations,
      transparency: state.transparency,
      tilt: state.tilt,
    }));

  const {
    handSize,
    isAnyCardAnimated,
    isGameOver,
    play,
    canTriggerEffect,
    parsedCost,
  } = useCardGame((state) => {
    const parsedCost = parseCost(state, props.card);

    return {
      handSize: state.hand.length,
      isAnyCardAnimated:
        state.hand.some((card) => card.state !== "idle") ||
        (state.upgrades.length > 0 &&
          state.upgrades.some((upgrade) => upgrade.state !== "idle")) ||
        Object.values(state.operationInProgress).some((o) => o),
      play: state.play,
      isGameOver: state.isGameOver,
      parsedCost,
      canTriggerEffect:
        !props.card.effect.condition ||
        props.card.effect.condition(state, props.card),
    };
  });

  const positionFromCenter = props.position - (handSize - 1) / 2;

  return (
    <div
      className={cn(
        "game-card",
        "relative w-[calc(630px/3)] h-[calc(880px/3)]",
        "hover:-translate-y-14",
        "-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",
        {
          [cn("transition-transform", props.card.state)]: animation,
          grayscale: isGameOver || !parsedCost.canBeBuy || !canTriggerEffect,
          "cursor-not-allowed": isAnyCardAnimated,
          // "translate-y-8": !canTriggerEffect || !haveEnoughResources,
        },
      )}
      onClick={async () => {
        if (!isAnyCardAnimated && !isGameOver) {
          await play(props.card);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();

        if (isActionCardInfo(props.card) && props.card.url) {
          // open new tab with project url
          window.open(props.card.url, "_blank");
        }
      }}
      style={{
        marginBottom: `${20 - Math.abs(positionFromCenter) * 5}px`, // temporaire, peut causer des problèmes
        rotate: `${positionFromCenter * 2}deg`,
        transitionDuration: animation ? "0.3s" : "0",
        transitionTimingFunction: animation ? "ease-in-out" : "linear",
      }}
    >
      <Tilt
        scale={1.1}
        className={cn(
          "group/game-card",
          {
            "transition-shadow duration-200 ease-in-out hover:shadow-glow-20 shadow-primary":
              shadows,
          },
          "flex flex-col w-full h-full rounded-xl",
          "*:shrink-0",
          {
            [cn({
              "bg-card/60": transparency,
              "bg-card": !transparency,
            })]: props.card.effect.type === "support",
            // "shadow-action": props.card.effect.type === "action",
          },
        )}
      >
        {isActionCardInfo(props.card) && props.card.detail && (
          <div
            className={cn(
              "absolute pointer-events-none left-1/2 -top-[10px] -translate-x-1/2 -translate-y-full rounded-2xl bg-card",
              "p-2 w-max max-w-full gap-1",
              {
                "shadow shadow-action": shadows,
                "transition-opacity duration-200 ease-in-out delay-1000":
                  animation,
                "opacity-0 group-hover/game-card:opacity-100 flex":
                  transparency,
                "hidden group-hover/game-card:flex": !transparency,
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

        {perspective && tilt && (
          <div
            className={cn("absolute w-full h-full rounded-xl", {
              "bg-card/60": transparency,
              "bg-card": !transparency,
              // "backdrop-blur-sm": blur && transparency,
            })}
            style={{
              transform: "translateZ(-20px)",
            }}
          />
        )}

        <div
          className={cn(
            "relative flex justify-start items-center h-10 rounded-t-xl",
            {
              "bg-action": props.card.effect.type === "action",
              [cn({
                "bg-support/50": transparency,
                "bg-support": !transparency,
              })]: props.card.effect.type === "support",
            },
          )}
          style={{
            transformStyle: perspective ? "preserve-3d" : "flat",
          }}
        >
          <div
            className="font-changa shrink-0 relative"
            style={{
              transform: `${perspective ? "translateZ(5px)" : ""} translateX(-15px)`,
              transformStyle: perspective ? "preserve-3d" : "flat",
            }}
          >
            {parsedCost.needs === "energy" ? (
              <ValueIcon
                isCost
                type="energy"
                value={parsedCost.cost}
                iconScale="0.75"
                style={{
                  transform: perspective ? "translateZ(5px)" : "none",
                  transformStyle: perspective ? "preserve-3d" : "flat",
                }}
              />
            ) : (
              <MoneyIcon
                value={String(parsedCost.cost)}
                style={{
                  transform: `${perspective ? "translateZ(10px)" : ""} rotate(-10deg)`,
                  transformStyle: perspective ? "preserve-3d" : "flat",
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
                    parsedCost.needs === "money" && props.card.name.length > 7,
                  "left-7":
                    parsedCost.needs === "money" && parsedCost.cost > 99,
                  "text-md": props.card.name.length > 11,
                })]: parsedCost.cost > 0,
                "text-action-foreground": props.card.effect.type === "action",
                "text-support-foreground": props.card.effect.type === "support",
              },
            )}
            style={{
              transform: perspective ? "translateZ(5px)" : "none",
            }}
          >
            {props.card.name}
          </h2>
        </div>

        {isActionCardInfo(props.card) ? (
          <GameCardProject card={props.card} />
        ) : (
          <GameCardTechno card={props.card} />
        )}

        <div
          className={cn(
            "flex-grow rounded-b-xl",
            props.card.effect.type === "action" && {
              // "backdrop-blur-sm": blur && transparency,
              "bg-card/60": transparency,
              "bg-card": !transparency,
            },
          )}
          style={{ transformStyle: perspective ? "preserve-3d" : "flat" }}
        >
          <p
            className="py-[10px] px-[15px] text-center"
            style={{
              transform: perspective ? "translateZ(10px)" : "none",
              transformStyle: perspective ? "preserve-3d" : "flat",
            }}
            dangerouslySetInnerHTML={{
              __html: props.card.effect.description,
            }}
          />

          {props.card.effect.ephemeral && (
            <div
              className={cn("text-center h-full text-2xl font-bold", {
                "text-muted-foreground/30": transparency,
                "text-muted-foreground": !transparency,
              })}
            >
              Éphémère
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
    </div>
  );
};

const GameCardProject = (
  props: React.PropsWithoutRef<{ card: ActionCardInfo }>,
) => {
  const { shadows, perspective, transparency, animation } = useQualitySettings(
    (state) => ({
      shadows: state.shadows,
      perspective: state.perspective,
      transparency: state.transparency,
      animation: state.animations,
    }),
  );

  return (
    <div
      className="group/image relative pointer-events-auto"
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
  );
};

const spinners = ["React", "Knex"];

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: SupportCardInfo }>,
) => {
  const { perspective, animation } = useQualitySettings((state) => ({
    perspective: state.perspective,
    animation: state.animations,
  }));

  return (
    <>
      <div
        className="flex justify-center items-center mt-4"
        style={{
          transform: perspective ? "translateZ(15px)" : "none",
        }}
      >
        <img
          src={props.card.logo}
          alt={`Logo de la techno "${props.card.name}"`}
          className={cn("w-2/3 object-contain aspect-video", {
            "group-hover/game-card:animate-spin-forward":
              animation && spinners.includes(props.card.name),
          })}
        />
      </div>
    </>
  );
};
