import { Tilt } from "./Tilt.tsx";

import "./GameCard.css";
import React from "react";
import { GameCardInfo, useCardGame } from "../hooks/useCardGame.ts";

export const GameCard = (
  props: React.PropsWithoutRef<{ card: GameCardInfo; position: number }>,
) => {
  const handSize = useCardGame((state) => state.hand.length);

  return (
    <div className="game-card">
      <Tilt
        className="card without-shadow"
        options={{ reverse: true, max: 30, scale: "1.1" }}
        style={{
          width: "100%",
          height: "100%",
          rotate: `${(props.position - handSize / 2) * 2}deg`,
        }}
      >
        <h2>{props.card.name}</h2>
        <div className="light" />
        <div className="light opposed" />
      </Tilt>
    </div>
  );
};
