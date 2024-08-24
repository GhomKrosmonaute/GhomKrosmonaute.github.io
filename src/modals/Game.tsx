import { cn } from "@/utils.ts";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

import { GameValues } from "@/components/game/GameValues.tsx";
import { Helpers } from "@/components/game/Helpers.tsx";
import { Upgrades } from "@/components/game/Upgrades.tsx";
import { GameOver } from "@/components/game/GameOver.tsx";
import { GameCard } from "@/components/game/GameCard.tsx";
import { Scoreboard } from "@/components/game/Scoreboard.tsx";

export const Game = () => {
  const cardGame = useCardGame();
  const show = useGlobalState((state) => state.isCardGameVisible);

  return (
    <>
      <Helpers show={show} />
      <Upgrades show={show} />
      <Scoreboard show={show} />
      <GameValues show={show} />
      <GameOver show={show} />

      <div
        className={cn(
          "absolute flex items-center -translate-x-1/2 max-w-[100vw]",
          "left-[50vw] transition-[bottom] ease-in-out duration-1000",
          show ? "bottom-[-50px]" : "-bottom-full",
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
