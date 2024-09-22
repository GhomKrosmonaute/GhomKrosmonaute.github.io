import { Cost } from "@/game-typings.ts"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { energyCostColor, getUsableCost } from "@/game-safe-utils.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"
import { useSettings } from "@/hooks/useSettings.ts"

export const GameCost = (props: { cost: Cost; miniature?: boolean }) => {
  const game = useCardGame()
  const settings = useSettings()

  if (props.cost.type === "money") {
    return (
      <GameMoneyIcon
        isCost
        miniature={props.miniature}
        value={getUsableCost(props.cost, game)}
        style={{
          transform: `${settings.quality.perspective ? "translateZ(10px)" : ""} rotate(-10deg)`,
          transformStyle: settings.quality.perspective ? "preserve-3d" : "flat",
        }}
      />
    )
  }

  return (
    <GameValueIcon
      isCost
      miniature={props.miniature}
      value={getUsableCost(props.cost, game)}
      colors={energyCostColor(game, props.cost.value)}
      style={{
        transform: settings.quality.perspective ? "translateZ(5px)" : "none",
        transformStyle: settings.quality.perspective ? "preserve-3d" : "flat",
      }}
    />
  )
}
