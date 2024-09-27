import { TriggerEventName } from "@/game-typings.ts"
import events from "@/data/events.tsx"
import { cn } from "@/utils.ts"

export const EventText = (props: {
  eventName: TriggerEventName
  className?: string
}) => {
  const event = events[props.eventName]

  return (
    <div className={cn("inline-flex items-center gap-1", props.className)}>
      <event.icon className="w-4 h-4" />
      <span className="font-zain test-sm">{event.name}</span>
    </div>
  )
}
