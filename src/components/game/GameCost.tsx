import { Cost } from "@/game-typings.ts"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { energyCostColor, getUsableCost } from "@/game-safe-utils.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"
import { useSettings } from "@/hooks/useSettings.ts"
import { cn } from "@/utils.ts"

export const GameCost = (props: { cost: Cost; miniature?: boolean }) => {
  const game = useCardGame()
  const settings = useSettings()

  const cost = getUsableCost(props.cost, game)

  if (cost === 0) {
    return (
      <div
        className={cn(
          "flex gap-1 bg-pink-500 pl-2 pr-3 py-1 rounded-sm rounded-r-xl -rotate-12 -translate-x-2 translate-y-1 text-md font-changa h-6",
          {
            "inline-flex rotate-0 px-1 py-0 rounded-sm h-5 w-fit translate-x-0 translate-y-0":
              props.miniature,
          },
        )}
      >
        <span>Free</span>
        {!props.miniature && (
          <span className="inline-block translate-x-full">·</span>
        )}
      </div>
    )
  }

  if (props.cost.type === "money") {
    return (
      <GameMoneyIcon
        isCost
        miniature={props.miniature}
        value={cost}
        style={{
          display: props.miniature ? "inline-block" : "block",
          transform: `${settings.quality.perspective ? "translateZ(10px)" : ""} ${props.miniature ? "" : "rotate(-10deg)"}`,
          transformStyle: settings.quality.perspective ? "preserve-3d" : "flat",
        }}
      />
    )
  }

  return (
    <GameValueIcon
      isCost
      miniature={props.miniature}
      value={cost}
      colors={energyCostColor(game, props.cost.value)}
      style={{
        display: props.miniature ? "inline-block" : "block",
        transform: settings.quality.perspective ? "translateZ(5px)" : "none",
        transformStyle: settings.quality.perspective ? "preserve-3d" : "flat",
      }}
      className={props.miniature ? "w-5 h-5" : ""}
    />
  )
}
