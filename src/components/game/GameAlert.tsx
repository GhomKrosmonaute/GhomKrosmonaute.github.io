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
    handOverflow: state.hand.length >= MAX_HAND_SIZE,
  }));

  if (!props.show) return null;

  return (
    <div
      className={cn(
        "absolute right-0 -translate-x-8 top-[60%] rotate-3 pointer-events-none",
        {
          "animate-pulse duration-700":
            quality.animations && quality.transparency,
        },
      )}
    >
      <div
        className={cn("text-3xl flex items-center gap-2", {
          "transition-[right] ease-in-out duration-1000": quality.animations,
          [cn("opacity-0", { "opacity-100": props.show })]:
            quality.transparency,
          [cn("hidden", { flex: props.show })]: !quality.transparency,
        })}
      >
        {game.handOverflow && (
          <>
            <Warning className="w-10" /> Votre main est pleine !
          </>
        )}
      </div>
    </div>
  );
};
