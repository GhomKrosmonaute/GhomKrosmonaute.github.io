import React from "react";
import { cn } from "@/utils.ts";

export const MoneyIcon = (
  props: React.PropsWithChildren<{
    value: string;
    className?: string;
    style?: React.CSSProperties;
  }>,
) => {
  if (props.value === "0") return <></>;

  return (
    <div
      className={cn(
        "text-2xl font-bold border border-white px-1 bg-money text-money-foreground",
        props.className,
      )}
      style={props.style}
    >
      <div
        style={{
          transform: "translateZ(5px)",
        }}
      >
        {props.value}M$
      </div>
    </div>
  );
};
