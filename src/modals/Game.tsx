import { cn } from "@/utils.ts";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

import { GameValues } from "@/components/game/GameValues.tsx";
import { Helpers } from "@/components/game/Helpers.tsx";
import { Upgrades } from "@/components/game/Upgrades.tsx";
import { GameOver } from "@/components/game/GameOver.tsx";
import { GameCard } from "@/components/game/GameCard.tsx";
import { Scoreboard } from "@/components/game/Scoreboard.tsx";
import { GameActions } from "@/components/game/GameActions.tsx";
import { GameDebug } from "@/components/game/GameDebug.tsx";
import { CornerIcons } from "@/components/game/CornerIcons.tsx";
import { Settings } from "@/components/game/Settings.tsx";

export const Game = () => {
  const quality = useQualitySettings((state) => ({
    animations: state.animations,
  }));
  const cardGame = useCardGame();
  const [show, showSettings] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.settingsVisible,
  ]);

  return (
    <>
      <Helpers show={show} />
      <Upgrades show={show} />
      <Scoreboard show={show} />
      <GameValues show={show} />
      <GameOver show={show} />
      <GameActions show={show} />
      <CornerIcons show={show} />
      <Settings show={show && showSettings} />

      {process.env.NODE_ENV === "development" && <GameDebug />}

      <div
        className={cn(
          "absolute flex items-center -translate-x-1/2 max-w-[100vw] left-[50vw]",
          {
            " transition-[bottom] ease-in-out duration-1000":
              quality.animations,
          },
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
