import React from "react";
import { Progress } from "@/components/ui/progress.tsx";
import { ValueIcon } from "@/components/game/ValueIcon.tsx";

export const Gauge = (props: {
  className?: string;
  value: number;
  display?: (fraction: number) => React.ReactNode;
  max: number;
  color?: `bg-${string}` & string;
  title: string;
  increaseOnly?: boolean;
}) => {
  return (
    <div className="flex items-center h-7 w-full">
      <ValueIcon
        title={props.title}
        value={
          props.display ? props.display(props.value / props.max) : props.value
        }
        colors={props.color ?? "bg-primary"}
        className="absolute -translate-x-1/2 z-50 scale-50"
      />
      <Progress
        barColor={props.color}
        className={props.className}
        value={(props.value / props.max) * 100}
        increaseOnly={props.increaseOnly}
      />
    </div>
  );
};
