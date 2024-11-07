import { GameCardStack } from "@/components/game/GameCardStack.tsx"
import { t } from "@/i18n"
import { cn } from "@/utils.ts"

export const GameCardStacks = (props: { show: boolean }) => {
  return (
    <div
      id="card-stacks"
      className={cn(
        "flex gap-10 transition-opacity duration-1000 opacity-0 pointer-events-none",
        "fixed top-36 right-20",
        props?.show && "opacity-100 pointer-events-auto",
      )}
    >
      <GameCardStack
        name={t("Pioche", "Draw pile")}
        revivedKey="revivedDraw"
        zIndex={2}
      />
      <GameCardStack
        name={t("Défausse", "Discard pile")}
        revivedKey="revivedDiscard"
      />
    </div>
  )
}
