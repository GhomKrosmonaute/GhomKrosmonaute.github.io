import React from "react";
import { cn } from "@/utils.ts";
import { useCardGame } from "@/hooks/useCardGame.ts";

export const ValueIcon = (props: {
  value: number;
  type: "energy" | "reputation";
  iconScale?: number | string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
  isCost?: boolean;
  miniature?: boolean;
}) => {
  const energy = useCardGame((state) => state.energy);

  if (props.isCost && props.value === 0) return <></>;

  return (
    <div
      className={cn(
        "relative",
        { "w-8 h-8": props.miniature },
        props.className,
      )}
      style={props.style}
    >
      {props.type === "energy" ? (
        !props.isCost || energy >= props.value ? (
          <img
            src="images/energy-background.png"
            alt={`Energie background image`}
            title={props.isCost ? "Coût en énergie" : "Energie"}
            className="pointer-events-auto"
            style={{ scale: props.iconScale }}
          />
        ) : energy > 0 ? (
          <img
            src="images/enerputation-background.png"
            alt={`Energie background image`}
            title={props.isCost ? "Coût en énergie" : "Energie"}
            className="pointer-events-auto"
            style={{ scale: props.iconScale }}
          />
        ) : (
          <img
            src="images/reputation-background.png"
            alt={`Reputation background image`}
            title="Coût en réputation"
            className="pointer-events-auto"
            style={{ scale: props.iconScale }}
          />
        )
      ) : (
        <img
          src="images/reputation-background.png"
          alt={`Reputation background image`}
          title="Réputation"
          className="pointer-events-auto"
          style={{ scale: props.iconScale }}
        />
      )}

      <div
        className={cn(
          "absolute top-1/2 left-1/2 font-bold text-[1.8em] text-white pointer-events-none box-content",
          { "text-md": props.miniature },
          props.textColor,
        )}
        style={{
          transform: "translateX(-50%) translateY(-50%) translateZ(5px)",
        }}
      >
        {props.miniature ? (props.value > 0 ? "+" : "") : ""}
        {props.value}
      </div>
    </div>
  );
};
