import { useSettings } from "@/hooks/useSettings.ts";
import { cn } from "@/utils.ts";
import React from "react";
import { ColorClass } from "@/game-typings.ts";

const foregrounds: Record<ColorClass, string> = {
  "bg-energy": "text-energy-foreground",
  "bg-reputation": "text-reputation-foreground",
  "bg-day": "text-day-foreground",
  "bg-upgrade": "text-upgrade-foreground",
  "bg-action": "text-action-foreground",
  "bg-support": "text-support-foreground",
  "bg-background": "text-foreground",
};

export const GameValueIcon = ({
  isCost,
  miniature,
  colors,
  value,
  symbol,
  ...props
}: React.ComponentProps<"div"> & {
  value: number | React.ReactNode;
  colors: ColorClass | [ColorClass, ColorClass];
  isCost?: boolean;
  symbol?: boolean;
  miniature?: boolean;
}) => {
  const quality = useSettings((state) => ({
    perspective: state.quality.perspective,
    shadows: state.quality.shadows,
  }));

  if (isCost && value === 0) return null;

  return (
    <div
      {...props}
      className={cn(
        "relative aspect-square rounded-full text-changa",
        typeof colors === "string" ? colors : colors[0],
        {
          "w-8 h-8 text-sm": miniature,
          "w-10 h-10": !miniature,
          "shadow shadow-black": quality.shadows,
        },
        props.className,
      )}
      style={{
        transformStyle: quality.perspective ? "preserve-3d" : "flat",
        transform: quality.perspective ? "translateZ(5px)" : "",
        ...props.style,
      }}
    >
      {/* Second color */}
      {Array.isArray(colors) && (
        <div
          className={cn(
            "absolute w-1/2 h-full origin-right rotate-[-22.5deg] rounded-l-full",
            colors[1],
          )}
        />
      )}

      {/* Value */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 font-changa",
          foregrounds[typeof colors === "string" ? colors : colors[0]],
        )}
        style={{
          transform: `translate(-50%, -50%) ${quality.perspective ? "translateZ(5px)" : ""}`,
        }}
      >
        {miniature && symbol && typeof value === "number"
          ? value > 0
            ? "+"
            : ""
          : ""}
        {value}
      </div>
    </div>
  );
};
