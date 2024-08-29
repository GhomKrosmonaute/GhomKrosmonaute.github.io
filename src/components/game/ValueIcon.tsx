import { useQualitySettings } from "@/hooks/useQualitySettings";
import { cn } from "@/utils.ts";
import React from "react";
import { ColorClass } from "@/game-typings.ts";

const foregrounds = [
  "text-energy-foreground",
  "text-reputation-foreground",
  "text-day-foreground",
  "text-upgrade-foreground",
];

export const ValueIcon = ({
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
  const quality = useQualitySettings(({ perspective, shadows }) => ({
    perspective,
    shadows,
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
        foregrounds.find((fg) =>
          fg.includes(
            (typeof colors === "string" ? colors : colors[0])!.replace(
              "bg-",
              "",
            ),
          ),
        ),
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
        className="absolute top-1/2 left-1/2 font-changa"
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
