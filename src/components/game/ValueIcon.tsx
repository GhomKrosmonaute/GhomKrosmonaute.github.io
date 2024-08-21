import React from "react";
import { cn } from "@/utils.ts";

export const ValueIcon = (props: {
  value: number;
  name: string;
  image: string;
  iconScale?: number | string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div className={cn("relative", props.className)} style={props.style}>
      <img
        src={props.image}
        alt={`${props.name} background image`}
        title={props.name}
        className="pointer-events-auto"
        style={{ scale: props.iconScale }}
      />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 font-bold text-[1.8em] text-white pointer-events-none box-content",
          props.textColor,
        )}
        style={{
          transform: "translateX(-50%) translateY(-50%) translateZ(5px)",
        }}
      >
        {props.value}
      </div>
    </div>
  );
};
