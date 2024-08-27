import React from "react";
import { cn } from "@/utils.ts";

export const MoneyIcon = (
  props: React.PropsWithChildren<{
    value: string;
    className?: string;
    style?: React.CSSProperties;
    miniature?: boolean;
  }>,
) => {
  if (props.value === "0") return <></>;

  return (
    <div
      className={cn(
        "text-2xl font-bold border border-white px-1 bg-money text-money-foreground w-fit",
        { "text-md": props.miniature },
        props.className,
      )}
      style={props.style}
    >
      <div
        style={{
          transform: !props.miniature ? "translateZ(5px)" : "none",
        }}
      >
        {props.miniature
          ? `${Number(props.value) > 0 ? "+" : ""}${props.value}`
          : props.value}
        M$
      </div>
    </div>
  );
};
