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
import { clsx } from "clsx";

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
      className={clsx("game-card", props.card.state)}
      onClick={() => {
        if (!isAnyCardAnimated) play(props.card);
      }}
      style={{
        marginBottom: `${20 - Math.abs(positionFromCenter) * 5}px`, // temporaire, peut causer des problèmes
      }}
    >
      <Tilt
        className="card without-shadow"
        options={{ reverse: true, max: 30, scale: "1.1" }}
        style={{
          width: "100%",
          height: "100%",
          rotate: `${positionFromCenter * 2}deg`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, padding: 0, fontSize: "18px" }}>
            {props.card.name}
          </h2>
          <div>{props.card.effect.cost}</div>
        </div>
        {isProjectCardInfo(props.card) ? (
          <GameCardProject card={props.card} />
        ) : (
          <GameCardTechno card={props.card} />
        )}

        <p>{props.card.effect.description}</p>

        <div className="light" />
        <div className="light opposed" />
      </Tilt>
    </div>
  );
};

const GameCardProject = (
  props: React.PropsWithoutRef<{ card: ProjectCardInfo }>,
) => {
  return <></>;
};

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: TechnoCardInfo }>,
) => {
  return <></>;
};
