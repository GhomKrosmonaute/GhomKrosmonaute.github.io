import React from "react";
import { useTutorialPrivate } from "@/hooks/useTutorial.ts";
import { PADDING } from "@/components/game/TutorialOpaque.tsx";
import { Position } from "@/components/game/TutorialProvider.tsx";

interface TutorialProps extends React.HTMLAttributes<HTMLDivElement> {
  location?: "left" | "right" | "center" | "top" | "bottom";
  highlight?: boolean;
}

export const Tutorial = ({
  location,
  highlight,
  children,
  style,
  ...rest
}: TutorialProps) => {
  const {
    position: positionContext,
    isLoading,
    setLoading,
    setHighlight,
  } = useTutorialPrivate();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const [renderPosition, setRenderPosition] =
    React.useState<React.CSSProperties | null>(null);

  React.useEffect(() => {
    setHighlight(!!highlight);
  }, [highlight]);

  React.useEffect(() => {
    const position: Position | null = positionContext;

    const temp: React.CSSProperties = {};

    switch (location) {
      case "right":
      case "left":
      case "top":
      case "bottom":
        if (!position) throw Error("Not position exists");
    }

    switch (location) {
      case "right":
      case "left":
        temp.top = position!.top - PADDING + "px";
        if (location === "left") {
          temp.left = position!.left - PADDING + "px";
          temp.transform = "translate(-100%, 0)";
        } else temp.left = position!.right + PADDING + "px";
        break;
      case "top":
      case "bottom":
        temp.left = position!.left + position!.width / 2 + "px";
        if (location === "top") {
          temp.top = position!.top - PADDING + "px";
          temp.transform = "translate(-50%, -100%)";
        } else {
          temp.top = position!.bottom + PADDING + "px";
          temp.transform = "translate(-50%, 0)";
        }
        break;
      case "center":
        temp.left = "50%";
        temp.top = "50%";
        temp.transform = "translate(-50%, -50%)";
        break;
    }

    console.log(temp, position);

    setRenderPosition(temp);
    setLoading(false);
  }, [positionContext, isLoading]);

  if (isLoading) return null;

  return (
    <div
      {...rest}
      ref={ref}
      className="space-y-4 leading-6 *:whitespace-nowrap"
      style={{
        position: "fixed",
        visibility: "visible",
        zIndex: "10010",
        borderRadius: "3px",
        fontSize: "1.5rem",
        ...renderPosition,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
