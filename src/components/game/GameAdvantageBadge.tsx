import React from "react"
import { cn } from "@/utils.ts"
import { GameCardInfo } from "@/game-typings.ts"
import { getRarityName } from "@/game-safe-utils.ts"

export const GameAdvantageBadge = (props: {
  advantage: GameCardInfo<true>["localAdvantage"]
  orphan?: boolean
}) => {
  const [name, full] = React.useMemo(() => {
    return [
      getRarityName(props.advantage.current),
      getRarityName(props.advantage.current, true),
    ]
  }, [props.advantage])

  return (
    <span
      className={cn(
        "inline-block z-10 w-fit",
        props.orphan && "rounded-lg px-1",
      )}
      style={{
        color: `hsl(var(--${name}-foreground))`,
        backgroundColor: `hsl(var(--${name}))`,
      }}
    >
      {full}
    </span>
  )
}
