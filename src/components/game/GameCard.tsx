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
import { Tilt } from "@/components/game/Tilt.tsx";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { ValueIcon } from "@/components/game/ValueIcon.tsx";
import { MoneyIcon } from "@/components/game/MoneyIcon.tsx";

export const GameCard = (
  props: React.PropsWithoutRef<{ card: GameCardInfo; position: number }>,
) => {
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
          state.upgrades.some((upgrade) => upgrade.state !== "idle")),
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
        "transition-transform hover:-translate-y-14",
        "-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",
        props.card.state,
        {
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
        transitionDuration: "0.3s",
        transitionTimingFunction: "ease-in-out",
      }}
    >
      <Tilt
        scale={1.1}
        className={cn(
          "group/game-card transition-shadow duration-200 ease-in-out",
          "hover:shadow-glow-20",
          "flex flex-col w-full h-full rounded-md",
          "rounded-md *:shrink-0",
          {
            "bg-card shadow-primary": props.card.effect.type === "support",
            "shadow-action": props.card.effect.type === "action",
          },
        )}
      >
        {isActionCardInfo(props.card) && props.card.detail && (
          <div
            className={cn(
              "absolute pointer-events-none left-1/2 -top-[10px] -translate-x-1/2 -translate-y-full rounded-2xl bg-card",
              "p-2 w-max max-w-full shadow shadow-action",
              "transition-opacity duration-200 ease-in-out delay-1000 opacity-0 group-hover/game-card:opacity-100",
              "flex gap-1",
            )}
          >
            <QuoteLeft className="w-10" />
            <div className="flex-grow text-sm text-left">
              {props.card.detail}
            </div>
            <QuoteRight className="w-10 self-end" />
          </div>
        )}

        <div
          className={cn("flex justify-start items-center h-10 rounded-t-md", {
            "bg-action": props.card.effect.type === "action",
            "bg-support": props.card.effect.type === "support",
          })}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="font-changa shrink-0 relative"
            style={{
              transform: "translateZ(5px) translateX(-15px)",
              transformStyle: "preserve-3d",
            }}
          >
            {parsedCost.needs === "energy" ? (
              <ValueIcon
                isCost
                type="energy"
                value={parsedCost.cost}
                iconScale="0.75"
                style={{
                  transform: "translateZ(5px)",
                  transformStyle: "preserve-3d",
                }}
              />
            ) : (
              <MoneyIcon
                value={String(parsedCost.cost)}
                style={{
                  transform: "translateZ(10px) rotate(-10deg)",
                  transformStyle: "preserve-3d",
                }}
              />
            )}
          </div>
          <h2
            className={cn(
              "whitespace-nowrap overflow-hidden text-ellipsis shrink-0 flex-grow",
              {
                "text-sm": props.card.name.length > 20,
                "text-primary-foreground": props.card.effect.type === "action",
              },
            )}
            style={{
              transform: "translateZ(5px)",
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
          className="bg-card flex-grow rounded-b-md"
          style={{ transformStyle: "preserve-3d" }}
        >
          <p
            className="py-[10px] px-[15px] text-center"
            style={{
              transform: "translateZ(10px)",
              transformStyle: "preserve-3d",
            }}
            dangerouslySetInnerHTML={{ __html: props.card.effect.description }}
          />

          {props.card.effect.ephemeral && (
            <div className="text-center h-full text-2xl text-muted-foreground/30 font-bold">
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
      </Tilt>
    </div>
  );
};

const GameCardProject = (
  props: React.PropsWithoutRef<{ card: ActionCardInfo }>,
) => {
  return (
    <div
      className="group/image"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className={cn(
          "inset-shadow",
          "relative flex justify-center items-center",
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <img
          src={props.card.image}
          alt={`Illustration du projet "${props.card.name}"`}
          className="w-full aspect-video object-cover"
          style={{
            transform: "translateZ(-15px)",
          }}
        />
      </div>

      {props.card.description && (
        <div
          className={cn(
            "transition-opacity duration-1000 group-hover/image:opacity-0",
            "absolute bottom-0 w-full h-1/3 bg-background/50",
            "flex justify-center items-center",
          )}
          style={{
            transform: "translateZ(-5px)",
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
  return (
    <>
      <div
        className="flex justify-center items-center mt-4"
        style={{
          transform: "translateZ(20px)",
        }}
      >
        <img
          src={props.card.logo}
          alt={`Logo de la techno "${props.card.name}"`}
          className={cn("w-2/3 object-contain aspect-square", {
            "group-hover/game-card:animate-spin-forward": spinners.includes(
              props.card.name,
            ),
          })}
        />
      </div>
    </>
  );
};
