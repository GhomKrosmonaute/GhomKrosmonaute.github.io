import React from "react";
import { cn } from "@/utils";
import { useSettings } from "@/hooks/useSettings.ts";

const groupHover = [
  "group-hover/card:opacity-100",
  "md:group-hover/card:opacity-100",
  "group-hover/button:opacity-100",
  "md:group-hover/button:opacity-100",
  "group-hover/game-card:opacity-100",
  "md:group-hover/game-card:opacity-100",
];

export interface BorderLightProps {
  groupName?: string;
  opposed?: boolean;
  fast?: boolean;
  appearOnHover?: boolean;
  disappearOnCorners?: boolean;
}

export const BorderLight = (
  props: React.ComponentProps<"div"> & BorderLightProps,
) => {
  const shadows = useSettings((state) => state.shadows);
  const activated = useSettings(
    (state) => state.borderLights && state.transparency && state.animations,
  );

  const currentGroup = props.groupName
    ? groupHover.filter((x) => x.includes(props.groupName!))
    : [];

  if (!activated || !shadows) return <></>;

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        { "shadow-glow-10": shadows },
        "w-1/5 min-w-5 h-1 rounded-[50%] opacity-100",
        {
          [`md:opacity-0 ${currentGroup[0]}`]:
            !props.opposed && props.appearOnHover,
          [`md:transition-opacity md:opacity-0 ${currentGroup[1]}`]:
            props.appearOnHover,
        },
        {
          "bg-primary shadow-primary": !props.opposed,
          "bg-primary-foreground shadow-primary-foreground": props.opposed,
        },
        !props.disappearOnCorners
          ? {
              "animate-border-light": !props.opposed && !props.fast,
              "animate-border-light-opposed": props.opposed && !props.fast,
              "animate-border-light-fast": !props.opposed && props.fast,
              "animate-border-light-opposed-fast": props.opposed && props.fast,
            }
          : {
              "animate-border-light-disappear": !props.opposed && !props.fast,
              "animate-border-light-opposed-disappear":
                props.opposed && !props.fast,
              "animate-border-light-fast-disappear":
                !props.opposed && props.fast,
              "animate-border-light-opposed-fast-disappear":
                props.opposed && props.fast,
            },
        props.className,
      )}
      style={{
        offsetPath: "padding-box",
        offsetDistance: props.opposed ? "50%" : "0%",
        transitionDuration: "1s",
      }}
    />
  );
};
