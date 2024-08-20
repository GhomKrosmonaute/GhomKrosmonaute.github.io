import React from "react";

import { GameCard } from "../components/GameCard.tsx";

import { cn } from "@/utils.ts";

import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { useCardGame } from "@/hooks/useCardGame.ts";

export const Game = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  const cardGame = useCardGame();
  const navigate = useNavigate();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");

  React.useEffect(() => {
    if (!largeScreen) navigate("/");
  }, [largeScreen, navigate]);

  return (
    <>
      {/*<div*/}
      {/*  style={{*/}
      {/*    pointerEvents: "none",*/}
      {/*    position: "absolute",*/}
      {/*    fontSize: "24px",*/}
      {/*    fontFamily: "monospace",*/}
      {/*    top: 0,*/}
      {/*    left: 0,*/}
      {/*    zIndex: 10,*/}
      {/*    display: props.show ? "block" : "none",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Street Cred: {cardGame.streetCred} <br />*/}
      {/*  Energy: {cardGame.energy} <br />*/}
      {/*  Main: {cardGame.hand.length} <br />*/}
      {/*  Deck: {cardGame.deck.length} <br />*/}
      {/*  Total: {cardGame.hand.length + cardGame.deck.length} <br />*/}
      {/*  Debug:{" "}*/}
      {/*  <ul style={{ fontSize: "16px" }}>*/}
      {/*    {cardGame.hand.map((card, i) => (*/}
      {/*      <li key={i}>*/}
      {/*        {card.effect.type} {card.effect.cost} {card.effect.description}*/}
      {/*      </li>*/}
      {/*    ))}*/}
      {/*  </ul>*/}
      {/*</div>*/}
      <div
        className={cn(
          "absolute flex items-center -translate-x-1/2",
          "left-[50vw] transition-[bottom] ease-in-out duration-1000",
          props.show ? "bottom-[-50px]" : "-bottom-full",
        )}
      >
        {cardGame.hand.map((card, index) => (
          <GameCard key={index} card={card} position={index} />
        ))}
      </div>
    </>
  );
};
