import { ValueIcon } from "@/components/game/ValueIcon.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { cn } from "@/utils";
import React from "react";

export const Gauge = (
  props: React.ComponentProps<"div"> & {
    iconClassName?: string;
    barClassName?: string;
    value: number;
    display?: (fraction: number) => React.ReactNode;
    max: number;
    color?: `bg-${string}` & string;
    title: string;
    increaseOnly?: boolean;
  },
) => {
  return (
    <div className={cn("flex items-center h-7 w-full", props.className)}>
      <ValueIcon
        title={props.title}
        value={
          props.display ? props.display(props.value / props.max) : props.value
        }
        miniature
        colors={props.color ?? "bg-primary"}
        className={cn("absolute z-50", props.iconClassName)}
      />
      <Progress
        barColor={props.color}
        className={props.barClassName}
        value={(props.value / props.max) * 100}
        increaseOnly={props.increaseOnly}
      />
    </div>
  );
};
