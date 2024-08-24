import React from "react";

import { GameCard } from "../components/game/GameCard.tsx";

import { cn } from "@/utils.ts";

import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { HUD } from "@/components/game/HUD.tsx";
import { GameOver } from "@/components/game/GameOver.tsx";

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
        <GameOver />
      </div>
      <div
        className={cn(
          "absolute flex items-center -translate-x-1/2 max-w-[100vw]",
          "left-[50vw] transition-[bottom] ease-in-out duration-1000",
          props.show ? "bottom-[-50px]" : "-bottom-full",
        )}
      >
        {cardGame.hand
          .sort((a, b) => {
            // trier par type de carte (action ou support) puis par type de prix (énergie ou $) puis par prix puis par description de l'effet
            const typeA = a.effect.type === "action" ? 1 : 0;
            const typeB = b.effect.type === "action" ? 1 : 0;
            const priceA = typeof a.effect.cost === "string" ? 1 : 0;
            const priceB = typeof b.effect.cost === "string" ? 1 : 0;
            const costA = Number(a.effect.cost);
            const costB = Number(b.effect.cost);
            const effect = a.effect.description.localeCompare(
              b.effect.description,
            );
            return typeA - typeB || priceA - priceB || costA - costB || effect;
          })
          .map((card, index) => (
            <GameCard key={index} card={card} position={index} />
          ))}
      </div>
    </>
  );
};
