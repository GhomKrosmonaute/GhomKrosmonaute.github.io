import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx"
import React from "react"
import type { GameCardInfo } from "@/game-typings.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import {
  energyCostColor,
  getUsableCost,
  isActionCardInfo,
} from "@/game-safe-utils.ts"
import { GameFamilyBadge } from "@/components/game/GameFamilyBadge.tsx"

export const GameCardPopover = (
  props: React.PropsWithChildren<{
    card: GameCardInfo<true>
    justFamily?: boolean
  }>,
) => {
  const state = useCardGame()

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{props.children}</HoverCardTrigger>
      <HoverCardContent className="pointer-events-none">
        {!props.justFamily && (
          <>
            <div className="flex mb-2 gap-2">
              {props.card.effect.cost.type === "energy" ? (
                <GameValueIcon
                  value={getUsableCost(props.card.effect.cost, state)}
                  colors={energyCostColor(state, props.card.effect.cost.value)}
                  isCost
                  miniature
                  className="w-5 h-5"
                />
              ) : (
                <GameMoneyIcon
                  value={getUsableCost(props.card.effect.cost, state)}
                  isCost
                  miniature
                />
              )}
              <h2>{props.card.name}</h2>
            </div>
            <p
              dangerouslySetInnerHTML={{
                __html: props.card.effect.description,
              }}
            />
          </>
        )}
        {isActionCardInfo(props.card) && props.card.families.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {props.card.families.map((family) => (
              <GameFamilyBadge family={family} key={family} />
            ))}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
