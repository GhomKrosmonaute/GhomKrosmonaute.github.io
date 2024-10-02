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
    <div
      className={cn(
        "inline-flex justify-center items-center gap-1 mx-auto",
        props.className,
      )}
    >
      <EventIcon name={props.eventName} />
      <span className="font-zain test-sm">{event.name}</span>
    </div>
  )
}

export const EventIcon = (props: {
  name: TriggerEventName
  className?: string
  backgroundClassName?: string
}) => {
  const event = events[props.name]

  return (
    <GameValueIcon
      value={<event.icon className={cn("h-5", props.className)} />}
      colors={"colors" in event ? event.colors : "bg-background"}
      miniature
      className={cn("block h-6 w-6", props.backgroundClassName)}
    />
  )
}
