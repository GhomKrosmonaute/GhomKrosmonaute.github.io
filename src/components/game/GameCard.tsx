import React from "react";

import {
  GameCardInfo,
  ProjectCardInfo,
  TechnoCardInfo,
  useCardGame,
  isProjectCardInfo,
} from "../../hooks/useCardGame.ts";
import { cn } from "@/utils.ts";
import { Tilt } from "./Tilt.tsx";
import { BorderLight } from "@/components/ui/border-light.tsx";

import "./GameCard.css";
import { ValueIcon } from "@/components/game/ValueIcon.tsx";

export const GameCard = (
  props: React.PropsWithoutRef<{ card: GameCardInfo; position: number }>,
) => {
  const handSize = useCardGame((state) => state.hand.length);
  const isAnyCardAnimated = useCardGame((state) =>
    state.hand.some((card) => card.state !== "idle"),
  );
  const play = useCardGame((state) => state.play);

  const positionFromCenter = props.position - (handSize - 1) / 2;

  return (
    <div
      className={cn(
        "game-card",
        "relative w-[calc(630px/3)] h-[calc(880px/3)]",
        "transition-transform hover:-translate-y-14",
        "-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",
        props.card.state,
      )}
      onClick={() => {
        if (!isAnyCardAnimated) {
          play(props.card);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();

        if (isProjectCardInfo(props.card) && props.card.url) {
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
          "shadow-primary hover:shadow-glow-20",
          "flex flex-col w-full h-full rounded-md",
          "rounded-md *:shrink-0",
          { "bg-card": props.card.effect.type === "support" },
        )}
      >
        {isProjectCardInfo(props.card) && props.card.detail && (
          <div
            className={cn(
              "absolute pointer-events-none left-1/2 -top-[10px] -translate-x-1/2 -translate-y-full rounded-2xl bg-card",
              "px-5 py-2 opacity-0 group-hover/game-card:animate-appear text-sm w-max max-w-full text-center shadow shadow-primary",
            )}
          >
            {props.card.detail}
          </div>
        )}

        <div
          className={cn("flex justify-start items-center h-10 rounded-t-md", {
            "bg-primary": props.card.effect.type === "action",
            "bg-secondary/50": props.card.effect.type === "support",
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
            <ValueIcon
              name="Energie / Points d'action"
              image="images/energy-background.png"
              value={props.card.effect.cost}
              style={{
                transform: "translateZ(5px)",
                transformStyle: "preserve-3d",
              }}
            />
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

        {isProjectCardInfo(props.card) ? (
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
            }}
          >
            {props.card.effect.description}
          </p>
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
  props: React.PropsWithoutRef<{ card: ProjectCardInfo }>,
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
          src={`images/projects/${props.card.image}`}
          alt={`Illustration du projet "${props.card.name}"`}
          className="w-full aspect-video object-cover"
          style={{
            transform: "translateZ(-15px)",
          }}
        />
      </div>

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
    </div>
  );
};

const spinners = ["React", "Knex"];

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: TechnoCardInfo }>,
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
          src={`images/techno/${props.card.logo}`}
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
