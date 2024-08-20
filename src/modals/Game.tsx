import React from "react";

import { GameCard } from "../components/game/GameCard.tsx";

import { cn } from "@/utils.ts";

import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { HUD } from "@/components/game/HUD.tsx";

export const Game = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  const cardGame = useCardGame();
  const navigate = useNavigate();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");

  React.useEffect(() => {
    if (!largeScreen) navigate("/");
  }, [largeScreen, navigate]);

  return (
    <>
      <HUD />
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
