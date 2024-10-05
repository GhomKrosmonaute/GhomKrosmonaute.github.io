import { cn } from "@/utils"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { GameCard } from "@/components/game/GameCard"

export const GameHand = (props: { show: boolean }) => {
  const hand = useCardGame((game) => game.revivedHand)
  const quality = useSettings(({ quality: { animations } }) => ({
    animations,
  }))

  return (
    <div
      id="hand"
      className={cn(
        "absolute left-[50vw]",
        {
          "transition-[bottom] ease-in-out duration-1000": quality.animations,
        },
        props.show ? "bottom-[250px]" : "-bottom-full",
      )}
    >
      {hand.map((card, index) => (
        <GameCard key={card.name} card={card} position={index} />
      ))}
    </div>
  )
}
