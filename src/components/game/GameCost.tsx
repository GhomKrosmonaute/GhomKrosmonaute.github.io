import { Cost } from "@/game-typings.ts"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { energyCostColor, getUsableCost } from "@/game-safe-utils.tsx"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { cn } from "@/utils.ts"

export const GameCost = (props: { cost: Cost; miniature?: boolean }) => {
  const game = useCardGame()
  const settings = useSettings()

  const cost = getUsableCost(props.cost, game)

  if (cost <= 0) {
    return (
      <div
        className={cn(
          "flex gap-1 bg-pink-500 text-white pl-2 pr-3 py-1 rounded-sm rounded-r-xl text-md font-changa h-6",
          {
            "inline-flex px-1 py-0 rounded-sm h-5 w-fit": props.miniature,
          },
        )}
        style={{
          transform: `${settings.quality.perspective ? "translateZ(10px)" : ""} ${
            props.miniature
              ? ""
              : "translateX(-16px) translateY(4px) rotateX(10deg) rotateY(10deg) rotateZ(-10deg)"
          }`,
          transformStyle: settings.quality.perspective ? "preserve-3d" : "flat",
        }}
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
