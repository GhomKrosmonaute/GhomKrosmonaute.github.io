import { GameCard } from "@/components/game/GameCard.tsx"
import { GameState, useCardGame } from "@/hooks/useCardGame.tsx"
import { GAME_CARD_SIZE } from "@/game-constants.ts"
import { cn } from "@/utils.ts"
import { getRarityName } from "@/game-safe-utils.tsx"

const cardThickness = 2

export const GameCardStack = (props: {
  name: string
  revivedKey: keyof GameState & `revived${string}`
}) => {
  const cards = useCardGame((state) => state[props.revivedKey])

  return (
    <div className="space-y-4">
      <div className={cn(GAME_CARD_SIZE, "relative overflow-visible")}>
        {cards.map((card, i, all) => {
          return (
            <div
              key={i}
              className={cn(
                GAME_CARD_SIZE,
                "bg-card/50 absolute top-0 left-0",
                i < all.length - 2 && "border-l",
              )}
              style={{
                transform: `translateY(-${i * cardThickness}px) translateX(${i * cardThickness}px)`,
                borderColor: `hsl(var(--${getRarityName(card.initialRarity)}))`,
              }}
            >
              {i >= all.length - 2 && (
                <div className="translate-x-[15px] -translate-y-[1px]">
                  <GameCard card={card} isStack />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="text-center">
        {props.name} ({cards.length})
      </div>
    </div>
  )
}
