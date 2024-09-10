import { Button } from "@/components/ui/button.tsx";

import { cn } from "@/utils.ts";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { useSettings } from "@/hooks/useSettings.ts";

export const GameControl = (props: { show: boolean; delay: boolean }) => {
  const animation = useSettings((state) => state.quality.animations);
  const reset = useCardGame((state) => state.reset);
  const exit = useGlobalState(
    (state) => () => state.setCardGameVisibility(false),
  );

  return (
    <div
      className={cn("absolute bottom-0 left-1/2 -translate-x-1/2", {
        "transition-[bottom] duration-500 ease-in-out": animation,
        "-bottom-12": props.show,
        "delay-500": props.delay && animation,
      })}
    >
      <div className="flex gap-2">
        <Button onClick={() => exit()} variant="default">
          Revenir à l'accueil
        </Button>
        <Button onClick={() => reset()} variant="default">
          Recommencer
        </Button>
      </div>
    </div>
  );
};
