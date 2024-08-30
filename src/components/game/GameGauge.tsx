import { GameValueIcon } from "@/components/game/GameValueIcon.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { cn } from "@/utils";
import React from "react";

export const GameGauge = ({
  iconClassName,
  barClassName,
  value,
  display,
  max,
  color,
  title,
  increaseOnly,
  ...props
}: React.ComponentProps<"div"> & {
  iconClassName?: string;
  barClassName?: string;
  value: number;
  display?: (fraction: number) => React.ReactNode;
  max: number;
  color?: `bg-${string}` & string;
  title: string;
  increaseOnly?: boolean;
}) => {
  return (
    <div
      {...props}
      className={cn("flex items-center h-7 w-full", props.className)}
    >
      <GameValueIcon
        title={title}
        value={display ? display(value / max) : value}
        miniature
        colors={color ?? "bg-primary"}
        className={cn("absolute z-50", iconClassName)}
      />
      <Progress
        barColor={color}
        className={barClassName}
        value={(value / max) * 100}
        increaseOnly={increaseOnly}
      />
    </div>
  );
};
