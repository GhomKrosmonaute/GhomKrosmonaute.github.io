import React from "react"
import { cn } from "@/utils.ts"

export const GameMoneyIcon = (
  props: React.PropsWithChildren<{
    value: number
    className?: string
    style?: React.CSSProperties
    miniature?: boolean
    symbol?: boolean
    isCost?: boolean
  }>,
) => {
  if (props.value <= 0 && props.isCost) return <></>

  return (
    <div
      className={cn(
        "text-2xl font-changa border border-white px-1 bg-money text-money-foreground w-fit",
        { "text-md": props.miniature },
        props.className,
      )}
      style={props.style}
    >
      <div
        style={{
          transform: !props.miniature ? "translateZ(5px)" : "none",
        }}
      >
        {props.symbol
          ? `${props.value > 0 ? "+" : ""}${props.value}`
          : props.value}
        M$
      </div>
    </div>
  )
}
