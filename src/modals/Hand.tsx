import React from "react";
import { GameCard } from "../components/GameCard.tsx";
import { useCardGame } from "../hooks/useCardGame.ts";

export const Hand = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  const cardGame = useCardGame();

  console.log(cardGame.hand.map((card) => card.state));

  return (
    <>
      <div
        style={{
          position: "absolute",
          fontSize: "24px",
          fontFamily: "monospace",
          top: 0,
          left: 0,
          zIndex: 10,
          display: props.show ? "block" : "none",
        }}
      >
        Street Cred: {cardGame.streetCred} <br />
        Energy: {cardGame.energy} <br />
        Main: {cardGame.hand.length} <br />
        Deck: {cardGame.deck.length} <br />
      </div>
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
    </>
  );
};
