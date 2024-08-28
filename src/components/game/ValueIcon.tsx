import React from "react";
import { cn } from "@/utils.ts";

type ValueColor = `bg-${string}` & string;

export const ValueIcon = (
  props: React.ComponentProps<"div"> & {
    value: number | React.ReactNode;
    colors: ValueColor | [ValueColor, ValueColor];
    isCost?: boolean;
    miniature?: boolean;
  },
) => {
  if (props.isCost && props.value === 0) return null;

  return (
    <div
      {...props}
      className={cn(
        "relative",
        {
          "w-8 h-8": props.miniature,
          "w-10 h-10": !props.miniature,
        },
        props.className,
      )}
    >
      <div
        className={cn(
          "absolute rounded-full aspect-square w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          typeof props.colors === "string"
            ? props.colors
            : cn(
                "w-1/2 -translate-x-full rotate-[22.5deg] rounded-r-none rounded-l-full",
                props.colors[0],
              ),
        )}
      />
      {Array.isArray(props.colors) && (
        <div
          className={cn(
            "absolute rounded-r-full aspect-square w-1/2 h-full top-1/2 left-1/2 translate-x-full -translate-y-1/2 rotate-[22.5deg]",
            props.colors[1],
          )}
        />
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {props.miniature && typeof props.value === "number"
          ? props.value > 0
            ? "+"
            : ""
          : ""}
        {props.value}
      </div>
    </div>
  );

  // return (
  //   <div
  //     className={cn(
  //       "relative",
  //       { "w-8 h-8": props.miniature },
  //       props.className,
  //     )}
  //     style={props.style}
  //   >
  //     {props.type === "energy" ? (
  //       !props.isCost || energy >= props.value ? (
  //         <img
  //           src="images/energy-background.png"
  //           alt={`Energie background image`}
  //           title={props.isCost ? "Coût en énergie" : "Energie"}
  //           className="pointer-events-auto"
  //           style={{ scale: props.iconScale }}
  //         />
  //       ) : energy > 0 ? (
  //         <img
  //           src="images/enerputation-background.png"
  //           alt={`Energie background image`}
  //           title={props.isCost ? "Coût en énergie" : "Energie"}
  //           className="pointer-events-auto"
  //           style={{ scale: props.iconScale }}
  //         />
  //       ) : (
  //         <img
  //           src="images/reputation-background.png"
  //           alt={`Reputation background image`}
  //           title="Coût en réputation"
  //           className="pointer-events-auto"
  //           style={{ scale: props.iconScale }}
  //         />
  //       )
  //     ) : (
  //       <img
  //         src="images/reputation-background.png"
  //         alt={`Reputation background image`}
  //         title="Réputation"
  //         className="pointer-events-auto"
  //         style={{ scale: props.iconScale }}
  //       />
  //     )}
  //
  //     <div
  //       className={cn(
  //         "absolute top-1/2 left-1/2 font-bold text-[1.8em] text-white pointer-events-none box-content",
  //         { "text-md": props.miniature },
  //         props.textColor,
  //       )}
  //       style={{
  //         transform: "translateX(-50%) translateY(-50%) translateZ(5px)",
  //       }}
  //     >
  //       {props.miniature ? (props.value > 0 ? "+" : "") : ""}
  //       {props.value}
  //     </div>
  //   </div>
  // );
};
