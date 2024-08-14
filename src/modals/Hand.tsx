import React from "react";
import { GameCard } from "../components/GameCard.tsx";
import { useCardGame } from "../hooks/useCardGame.ts";

export const Hand = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  const cardGame = useCardGame();

  return (
    <div
      style={{
        position: "absolute",
        bottom: props.show ? -50 : "-100%",
        left: "50vw",
        transition: "bottom 1s ease-in-out",
        display: "flex",
        alignItems: "end",
        transform: "translateX(-50%)",
      }}
    >
      {cardGame.hand.map((card, index) => (
        <GameCard key={index} card={card} position={index} />
      ))}
    </div>
  );
};
