import React from "react";

import { GameCard } from "../components/game/GameCard.tsx";

import { cn } from "@/utils.ts";

import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { HUD } from "@/components/game/HUD.tsx";

export const Game = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  const cardGame = useCardGame();
  const navigate = useNavigate();
  const setCardGameVisibility = useGlobalState(
    (state) => state.setCardGameVisibility,
  );
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");

  setCardGameVisibility(!!props.show);

  React.useEffect(() => {
    if (!largeScreen) navigate("/");
  }, [largeScreen, navigate]);

  return (
    <>
      <div
        className={cn(
          "absolute w-full transition-[left] ease-in-out duration-500 pointer-events-none",
          props.show ? "left-0" : "-left-full",
        )}
      >
        <HUD />
      </div>
      <div
        className={cn(
          "absolute flex items-center -translate-x-1/2",
          "left-[50vw] transition-[bottom] ease-in-out duration-1000",
          props.show ? "bottom-[-50px]" : "-bottom-full",
        )}
      >
        {cardGame.hand
          .sort((a, b) => {
            // trier par type de carte (action ou support) puis par type de prix (énergie ou $) puis par prix
            const typeA = a.effect.type === "action" ? 1 : 0;
            const typeB = b.effect.type === "action" ? 1 : 0;
            const priceA = typeof a.effect.cost === "string" ? 1 : 0;
            const priceB = typeof b.effect.cost === "string" ? 1 : 0;
            const costA = Number(a.effect.cost);
            const costB = Number(b.effect.cost);
            return typeA - typeB || priceA - priceB || costA - costB;
          })
          .map((card, index) => (
            <GameCard key={index} card={card} position={index} />
          ))}
      </div>
    </>
  );
};
