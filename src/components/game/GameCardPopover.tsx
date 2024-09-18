import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx"
import React from "react"
import type { GameCardInfo } from "@/game-typings.ts"
import { energyCostColor } from "@/game-utils.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"

export const GameCardPopover = (
  props: React.PropsWithChildren<{
    card: GameCardInfo<true>
  }>,
) => {
  const energy = useCardGame((state) => state.energy)

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{props.children}</HoverCardTrigger>
      <HoverCardContent className="pointer-events-none">
        <div className="flex mb-2 gap-2">
          {props.card.effect.cost.type === "energy" ? (
            <GameValueIcon
              value={props.card.effect.cost.value}
              colors={energyCostColor({ energy }, props.card.effect.cost.value)}
              isCost
              miniature
              className="w-5 h-5"
            />
          ) : (
            <GameMoneyIcon value={props.card.effect.cost.value} miniature />
          )}
          <h2>{props.card.name}</h2>
        </div>
        <p
          dangerouslySetInnerHTML={{ __html: props.card.effect.description }}
        />
      </HoverCardContent>
    </HoverCard>
  )
}
