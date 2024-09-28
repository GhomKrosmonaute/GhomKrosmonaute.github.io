import { TriggerEventName } from "@/game-typings.ts"
import events from "@/data/events.tsx"
import { cn } from "@/utils.ts"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"

export const EventText = (props: {
  eventName: TriggerEventName
  className?: string
}) => {
  const event = events[props.eventName]

  return (
    <div className={cn("inline-flex items-center gap-1", props.className)}>
      <GameValueIcon
        value={<event.icon className="h-5" />}
        colors={"colors" in event ? event.colors : "bg-background"}
        miniature
        className="block h-6 w-6"
      />
      <span className="font-zain test-sm">{event.name}</span>
    </div>
  )
}
