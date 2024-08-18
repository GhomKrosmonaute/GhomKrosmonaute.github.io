import React from "react";
import { GameCard } from "../components/GameCard.tsx";
import { useCardGame } from "../hooks/useCardGame.ts";

export const Game = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  const cardGame = useCardGame();

  return (
    <>
      <div
        style={{
          pointerEvents: "none",
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
        Total: {cardGame.hand.length + cardGame.deck.length} <br />
        Debug:{" "}
        <ul style={{ fontSize: "16px" }}>
          {cardGame.hand.map((card) => (
            <li>
              {card.effect.type} {card.effect.cost} {card.effect.description}
            </li>
          ))}
        </ul>
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
