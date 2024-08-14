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

export const GameCard = (
  props: React.PropsWithoutRef<{ card: GameCardInfo; position: number }>,
) => {
  const handSize = useCardGame((state) => state.hand.length);

  const positionFromCenter = props.position - (handSize - 1) / 2;

  return (
    <div
      className="game-card"
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
        <h2>{props.card.name}</h2>#{positionFromCenter}
        {isProjectCardInfo(props.card) ? (
          <GameCardProject card={props.card} />
        ) : (
          <GameCardTechno card={props.card} />
        )}
        <div className="light" />
        <div className="light opposed" />
      </Tilt>
    </div>
  );
};

const GameCardProject = (
  props: React.PropsWithoutRef<{ card: ProjectCardInfo }>,
) => {
  return (
    <>
      <p>{props.card.description}</p>
    </>
  );
};

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: TechnoCardInfo }>,
) => {
  return (
    <>
      <p>{props.card.effect.type}</p>
    </>
  );
};
