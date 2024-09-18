import { cn } from "@/utils"
import { useCardGame } from "@/hooks/useCardGame"
import { useSettings } from "@/hooks/useSettings.ts"
import { GameCard } from "@/components/game/GameCard"
import { getSortedHand } from "@/game-utils.ts"

export const GameHand = (props: { show: boolean }) => {
  const quality = useSettings(({ quality: { animations } }) => ({
    animations,
  }))
  const game = useCardGame()

  return (
    <div
      id="hand"
      className={cn(
        "absolute flex items-center -translate-x-1/2 max-w-[100vw] left-[50vw]",
        {
          " transition-[bottom] ease-in-out duration-1000": quality.animations,
        },
        props.show ? "bottom-[-50px]" : "-bottom-full",
      )}
    >
      {getSortedHand(game.hand, game).map((card, index) => (
        <GameCard key={index} card={card} position={index} />
      ))}
    </div>
  )
}
