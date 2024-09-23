import { ActionCardFamily } from "@/game-typings.ts"

export const GameFamilyBadge = (props: { family: ActionCardFamily }) => {
  return (
    <span className="text-lg text-action-foreground font-bold bg-action/30 ring-1 ring-action px-2 rounded-sm flex leading-3 pt-1">
      # {props.family}
    </span>
  )
}
