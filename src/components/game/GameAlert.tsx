import Warning from "@/assets/icons/Warning.svg"
import { Tag } from "@/components/game/Texts.tsx"
import { MAX_HAND_SIZE } from "@/game-constants.ts"
import { getDeck } from "@/game-safe-utils.tsx"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { t } from "@/i18n"
import { cn } from "@/utils.ts"

export const GameAlert = (props: { show?: boolean }) => {
  const quality = useSettings((state) => ({
    animations: state.quality.animations,
    transparency: state.quality.transparency,
  }))

  const game = useCardGame((state) => ({
    handOverflow: state.hand.length >= MAX_HAND_SIZE,
    almostEmptyDraw:
      state.draw.length < 4 &&
      state.draw.length > 0 &&
      getDeck(state).length > MAX_HAND_SIZE,
    emptyDraw: state.draw.length === 0,
    almostEmptyReputation: state.reputation <= 5,
  }))

  if (!props.show) return null

  return (
    <div
      className={cn(
        "absolute right-0 -translate-x-8 top-[60%] rotate-3 pointer-events-none -translate-y-1/2",
        {
          "animate-pulse duration-700":
            quality.animations && quality.transparency,
        },
      )}
    >
      <div
        className={cn(
          "text-3xl flex flex-col gap-2",
          "*:flex *:items-center *:gap-2",
          {
            "transition-[right] ease-in-out duration-1000": quality.animations,
            [cn("opacity-0", { "opacity-100": props.show })]:
              quality.transparency,
            [cn("hidden", { flex: props.show })]: !quality.transparency,
          },
        )}
      >
        {game.handOverflow && (
          <div>
            <Warning className="w-10" />{" "}
            {t("Ta main est pleine !", "Your hand is full!")}
          </div>
        )}
        {game.almostEmptyDraw && (
          <div>
            <Warning className="w-10" />{" "}
            {t(
              "Ta pioche est presque vide !",
              "Your draw pile is almost empty!",
            )}
          </div>
        )}
        {game.emptyDraw && (
          <div>
            <Warning className="w-10" />{" "}
            {t("Ta pioche est vide !", "Your draw pile is empty!")}
          </div>
        )}
        {game.almostEmptyReputation && (
          <div>
            <Warning className="w-10" />{" "}
            {t(
              <>
                Ta <Tag name="reputation" /> est basse !
              </>,
              <>
                Your <Tag name="reputation" /> is low!
              </>,
            )}
            !
          </div>
        )}
      </div>
    </div>
  )
}
