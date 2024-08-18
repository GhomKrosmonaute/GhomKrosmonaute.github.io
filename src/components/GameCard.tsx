import { Tilt } from "./Tilt.tsx";

import "./GameCard.css";
import React from "react";
import {
  GameCardInfo,
  ProjectCardInfo,
  TechnoCardInfo,
  useCardGame,
  isProjectCardInfo,
} from "../hooks/useCardGame.ts";
import { cn } from "@/utils.ts";
import { BorderLight } from "@/components/ui/border-light.tsx";

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
        if (!isAnyCardAnimated) play(props.card);
      }}
      style={{
        marginBottom: `${20 - Math.abs(positionFromCenter) * 5}px`, // temporaire, peut causer des problèmes
        rotate: `${positionFromCenter * 2}deg`,
        transitionDuration: "0.3s",
        transitionTimingFunction: "ease-in-out",
      }}
    >
      <Tilt
        className={cn(
          "group/game-card transition-shadow duration-200 ease-in-out",
          "shadow-primary hover:shadow-glow-20",
          "flex flex-col w-full h-full rounded-md",
          "rounded-md *:shrink-0",
          { "bg-card": props.card.effect.type === "support" },
        )}
        options={{ reverse: true, max: 30, scale: "1.1", perspective: 1000 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={cn(
            "flex justify-between items-center px-5 h-10 rounded-t-md",
            {
              "bg-primary": props.card.effect.type === "action",
              "bg-secondary/50": props.card.effect.type === "support",
            },
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <h2
            className={cn("whitespace-nowrap overflow-hidden text-ellipsis", {
              "text-sm": props.card.name.length > 20,
            })}
            style={{
              transform: "translateZ(5px)",
            }}
          >
            {props.card.name}
          </h2>
          <div
            className="font-changa"
            style={{
              transform: "translateZ(5px)",
            }}
          >
            {props.card.effect.cost}
          </div>
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
          src={props.card.image}
          alt={`Illustration du projet "${props.card.name}"`}
          className="block"
          style={{
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            transform: "translateZ(-15px)",
          }}
        />
      </div>

      <div
        className="transition-opacity duration-500 group-hover/image:opacity-0"
        style={{
          position: "absolute",
          width: "100%",
          height: "33%",
          bottom: 0,
          // backgroundImage:
          //   "linear-gradient(transparent, hsla(var(--background)))",
          backgroundColor: "hsla(var(--background) / 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: "translateZ(-5px)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            textAlign: "center",
            margin: 0,
            padding: 0,
          }}
        >
          "{props.card.description}"
        </p>
      </div>
    </div>
  );
};

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: TechnoCardInfo }>,
) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "15px",
          transform: "translateZ(20px)",
        }}
      >
        <img
          src={props.card.logo}
          alt={`Logo de la techno "${props.card.name}"`}
          style={{
            width: "60%",
            objectFit: "contain",
            aspectRatio: "1/1",
          }}
        />
      </div>
    </>
  );
};
