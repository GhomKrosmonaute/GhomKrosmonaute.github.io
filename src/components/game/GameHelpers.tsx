import React from "react"

import _helpers from "@/data/helpers.tsx"

import { useSettings } from "@/hooks/useSettings.ts"

import Question from "@/assets/icons/question.svg"

import { useHover } from "usehooks-ts"
import { cn } from "@/utils.ts"

const helpers = Object.values(_helpers)

export const GameHelpers = (props: { show: boolean }) => {
  const ref = React.useRef<HTMLDivElement>(null)

  const isHovered = useHover(ref)

  const { animation, shadow, transparency } = useSettings((state) => ({
    animation: state.quality.animations,
    transparency: state.quality.transparency,
    shadow: state.quality.shadows,
  }))

  const [helpIndex, setHelpIndex] = React.useState<number>(0)

  // Change the helper index all 5 seconds, but only if the helper is not hovered
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) setHelpIndex((helpIndex + 1) % helpers.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [helpIndex, isHovered])

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-0 left-0 -translate-y-full -translate-x-full max-w-fit",
        "rounded-br-3xl border-8 border-upgrade border-t-0 border-l-0 p-4",
        {
          "bg-card/50": transparency,
          "bg-card": !transparency,
          "shadow shadow-black/50": shadow && transparency,
          "transition-transform duration-500 ease-in-out": animation,
          "translate-x-0 translate-y-0 cursor-pointer": props.show,
        },
      )}
      onClick={() => setHelpIndex((helpIndex + 1) % helpers.length)}
    >
      <div className="flex gap-2 items-center justify-start select-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Question className="h-6 cursor-pointer" />
          <span className="whitespace-nowrap">{helpers[helpIndex]}</span>
        </div>
      </div>
    </div>
  )
}
