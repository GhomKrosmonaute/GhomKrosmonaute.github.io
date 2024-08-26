import { cn } from "@/utils.ts";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { MAX_HAND_SIZE } from "@/game-constants.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import Warning from "@/assets/icons/Warning.svg";

export const GameAlert = (props: { show?: boolean }) => {
  const quality = useQualitySettings((state) => ({
    animations: state.animations,
    transparency: state.transparency,
  }));

  const game = useCardGame((state) => ({
    handOverflow: state.hand.length > MAX_HAND_SIZE,
  }));

  return (
    <div
      className={cn(
        "absolute right-10 -translate-x-1/2 top-1/2 rotate-3 z-30",
        {
          "animate-pulse duration-700":
            quality.animations && quality.transparency,
        },
      )}
    >
      <div
        className={cn("text-3xl flex items-center gap-2 pointer-events-none", {
          "transition-[right] ease-in-out duration-1000": quality.animations,
          [cn("opacity-0", { "opacity-100": props.show })]:
            quality.transparency,
          [cn("hidden", { flex: props.show })]: !quality.transparency,
        })}
      >
        {game.handOverflow && (
          <>
            <Warning className="w-10" /> La main est pleine !
          </>
        )}
      </div>
    </div>
  );
};
