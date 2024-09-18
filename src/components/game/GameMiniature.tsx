import React from "react"
import { cn } from "@/utils.ts"

import type { GameLog, Upgrade, GameCardInfo } from "@/game-typings.ts"
import { isGameCardIndice, reviveCard, reviveUpgrade } from "@/game-utils.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"

export const GameMiniature = (props: { item: GameLog["reason"] }) => {
  const game = useCardGame()

  const revived = Array.isArray(props.item)
    ? isGameCardIndice(props.item)
      ? reviveCard(props.item, game)
      : reviveUpgrade(props.item, game)
    : props.item

  return (
    <span
      className={cn(
        "inline-flex items-center h-7 w-full rounded-full",
        typeof revived === "string"
          ? ""
          : {
              "bg-action text-action-foreground": revived.type === "action",
              "bg-support text-support-foreground": revived.type === "support",
              "bg-upgrade text-upgrade-foreground": revived.type === "upgrade",
            },
      )}
    >
      {typeof revived === "object" && <MiniatureImage item={revived} />}
      <div className="px-2">
        {typeof revived === "object" ? revived.name : revived}
      </div>
    </span>
  )
}

export const MiniatureImage = ({
  item,
  ...props
}: React.ComponentProps<"img"> & {
  item: Upgrade | GameCardInfo<true>
}) => {
  return (
    <img
      {...props}
      src={
        item.type === "upgrade" ? `images/upgrades/${item.image}` : item.image
      }
      alt={`miniature of ${item.name} ${item.type}`}
      className={cn(
        "aspect-square rounded-full h-full bg-background",
        {
          "object-cover": item.type === "upgrade" || item.type === "action",
          "object-contain": item.type === "support",
          "ring-upgrade shadow ring-4": item.type === "upgrade",
          "ring-action ring-4": item.type === "action",
          "ring-support ring-4": item.type === "support",
        },
        props.className,
      )}
    />
  )
}
