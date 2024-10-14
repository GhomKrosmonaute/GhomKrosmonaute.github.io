import React from "react"
import { GameCard } from "@/components/game/GameCard.tsx"
import { GameState, useCardGame } from "@/hooks/useCardGame.tsx"
import { GAME_CARD_SIZE } from "@/game-constants.ts"
import { cn } from "@/utils.ts"
import { getRarityName } from "@/game-safe-utils.tsx"
import { useHover } from "@/hooks/useHover.ts"

export const GameCardStack = (props: {
  name: string
  revivedKey: keyof GameState & `revived${string}`
  zIndex?: number
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const isHover = useHover(ref)
  const cards = useCardGame((state) => state[props.revivedKey])
  const isShuffling = useCardGame((state) =>
    state.operationInProgress.includes(
      `shuffleStack ${props.revivedKey.replace("revived", "").toLowerCase()}`,
    ),
  )

  const cardThickness = isHover ? 1.5 : 1

  return (
    <div ref={ref} className="space-y-2" style={{ zIndex: props.zIndex ?? 1 }}>
      <div
        className={cn(
          GAME_CARD_SIZE,
          "relative overflow-visible border-2 border-dotted border-foreground",
        )}
      >
        {cards.map((card, i, all) => {
          return (
            <div
              key={card.name}
              className={cn(
                GAME_CARD_SIZE,
                "absolute top-1/2 left-1/2 flex justify-center items-center transition-transform",
                (isShuffling || i < all.length - 2) && "border-l bg-card",
              )}
              style={{
                transform: `translateY(calc(-50% - ${i * cardThickness}px)) translateX(calc(-50% + ${i * cardThickness}px)) ${
                  isShuffling ? `rotate(${i % 2 ? -10 : 10}deg)` : ""
                }`,
                borderColor: `hsl(var(--${getRarityName(card.rarity)}))`,
              }}
            >
              {!isShuffling && i >= all.length - 2 && (
                <div style={{ transform: "translateY(10px)" }}>
                  <GameCard card={card} isStack={props.revivedKey} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="text-center font-changa">
        {props.name} ({cards.length})
      </div>
    </div>
  )
}
