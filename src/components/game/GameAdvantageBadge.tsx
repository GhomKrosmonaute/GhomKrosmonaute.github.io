import React from "react"
import { cn } from "@/utils.ts"
import { getRarityName, log } from "@/game-safe-utils.ts"

export const GameAdvantageBadge = (props: {
  advantage: number
  orphan?: boolean
}) => {
  const [, name, full] = React.useMemo(() => {
    return log("advantage", [
      props.advantage,
      getRarityName(props.advantage),
      getRarityName(props.advantage, true),
    ])
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
