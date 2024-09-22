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
      getRarityName(props.advantage),
      getRarityName(props.advantage, true),
    ]
  }, [props.advantage])

  return (
    <div
      className={cn("z-10", props.orphan && "rounded-lg px-1")}
      style={{
        color: `hsl(var(--${name}-foreground))`,
        backgroundColor: `hsl(var(--${name}))`,
      }}
    >
      {full}
    </div>
  )
}
