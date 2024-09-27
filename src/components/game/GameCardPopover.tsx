import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx"
import React from "react"
import type { GameCardInfo } from "@/game-typings.ts"
import { isActionCardInfo } from "@/game-safe-utils.tsx"
import { GameCost } from "@/components/game/GameCost.tsx"
import { Family } from "@/components/game/Texts.tsx"

export const GameCardPopover = (
  props: React.PropsWithChildren<{
    card: GameCardInfo<true>
    justFamily?: boolean
  }>,
) => {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{props.children}</HoverCardTrigger>
      <HoverCardContent className="pointer-events-none">
        {!props.justFamily && (
          <>
            <div className="flex mb-2 gap-2">
              <GameCost cost={props.card.effect.cost} miniature />
              <h2>{props.card.name}</h2>
            </div>
            <p>{props.card.effect.description}</p>
          </>
        )}
        {isActionCardInfo(props.card) && props.card.families.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {props.card.families.map((family) => (
              <Family name={family} key={family} />
            ))}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
