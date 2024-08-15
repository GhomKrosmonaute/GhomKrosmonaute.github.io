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
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        <div
          className="title"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            height: "40px",
          }}
        >
          <h2
            style={{
              margin: 0,
              padding: 0,
              fontSize: props.card.name.length <= 20 ? "18px" : "16px",
              whiteSpace: "nowrap",
              // add ... if the name is too long
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {props.card.name}
          </h2>
          <div className="cost">{props.card.effect.cost}</div>
        </div>

        {isProjectCardInfo(props.card) ? (
          <GameCardProject card={props.card} />
        ) : (
          <GameCardTechno card={props.card} />
        )}

        <p
          style={{
            padding: 0,
            margin: "0 20px 15px 20px",
            textAlign: "center",
          }}
        >
          {props.card.effect.description}
        </p>

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // inner shadow
          boxShadow: "inset 0 0 10px 0 rgba(0, 0, 0, 0.5)",
        }}
      >
        <img
          src={props.card.image}
          alt={`Illustration du projet "${props.card.name}"`}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            backgroundColor: "purple",
          }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          flex: 1,
          padding: "0 10px",
        }}
      >
        "{props.card.description}"
      </p>
    </>
  );
};

const GameCardTechno = (
  props: React.PropsWithoutRef<{ card: TechnoCardInfo }>,
) => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={props.card.logo}
        alt={`Logo de la techno "${props.card.name}"`}
        style={{
          width: "75%",
          objectFit: "contain",
          backgroundColor: "purple",
          aspectRatio: "1/1",
        }}
      />
    </div>
  );
};
