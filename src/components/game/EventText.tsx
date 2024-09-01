import { TriggerEventName } from "@/game-typings.ts";
import { formatText } from "@/game-utils.ts";
import events from "@/data/events.ts";
import { cn } from "@/utils.ts";

export const EventText = (props: {
  eventName: TriggerEventName;
  className?: string;
}) => {
  const event = events[props.eventName];

  return (
    <div className={cn("flex items-center gap-1", props.className)}>
      <event.icon className="w-6 h-6" />
      <span
        className="font-zain"
        dangerouslySetInnerHTML={{
          __html: formatText(event.name),
        }}
      />
    </div>
  );
};
