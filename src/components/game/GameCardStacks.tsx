import { cn } from "@/utils.ts"
import { GameCardStack } from "@/components/game/GameCardStack.tsx"

export const GameCardStacks = (props: { show: boolean }) => {
  return (
    <div
      className={cn(
        "flex gap-10 transition-opacity duration-200 opacity-0",
        "fixed top-36 right-20",
        props?.show && "opacity-100",
      )}
    >
      <GameCardStack name="Pioche" compactKey="draw" revivedKey="revivedDraw" />
      <GameCardStack
        name="Défausse"
        compactKey="discard"
        revivedKey="revivedDiscard"
      />
    </div>
  )
}
