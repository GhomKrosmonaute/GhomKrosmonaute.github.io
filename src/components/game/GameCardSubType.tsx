import { cn } from "@/utils.ts"
import { Tag } from "@/components/game/Texts.tsx"
import { GameCardInfo } from "@/game-typings.ts"
import { resolveSubTypes } from "@/game-safe-utils.tsx"
import { useSettings } from "@/hooks/useSettings.ts"

export const GameCardSubType = (props: { card: GameCardInfo<true> }) => {
  const settings = useSettings()
  const subTypes = resolveSubTypes(props.card.effect)

  if (subTypes.length === 0) return null

  return (
    <div
      className={cn("text-center text-2xl font-bold", {
        "text-muted-foreground/50": settings.quality.transparency,
        "text-muted-foreground": !settings.quality.transparency,
      })}
    >
      {subTypes.map((type) => (
        <Tag name={type} key={type} />
      ))}
    </div>
  )
}
