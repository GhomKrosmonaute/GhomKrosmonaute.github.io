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
    <div className={cn("scale-75", props.className)} style={props.style}>
      <img
        src={props.image}
        alt={`${props.name} background image`}
        title={props.name}
        className="pointer-events-auto"
        style={{ scale: props.iconScale }}
      />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 font-bold text-3xl text-white pointer-events-none",
          props.textColor,
        )}
        style={{
          transform: "translateZ(5px) translate(-50%, -45%)",
        }}
      >
        {props.value}
      </div>
    </div>
  );
};
