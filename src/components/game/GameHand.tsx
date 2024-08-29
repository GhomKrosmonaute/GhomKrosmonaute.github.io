import { cn } from "@/utils";
import { useCardGame } from "@/hooks/useCardGame";
import { useQualitySettings } from "@/hooks/useQualitySettings";
import { GameCard } from "@/components/game/GameCard";

export const GameHand = (props: { show: boolean }) => {
  const quality = useQualitySettings(({ animations }) => ({ animations }));
  const game = useCardGame(({ hand }) => ({ hand }));

  return (
    <div
      className={cn(
        "absolute flex items-center -translate-x-1/2 max-w-[100vw] left-[50vw]",
        {
          " transition-[bottom] ease-in-out duration-1000": quality.animations,
        },
        props.show ? "bottom-[-50px]" : "-bottom-full",
      )}
    >
      {game.hand
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
  );
};
