import React from "react";
import { useTutorialPrivate } from "@/hooks/useTutorial.ts";

interface TutorialProps extends React.HTMLAttributes<HTMLDivElement> {
  location?: "left" | "right";
  highlight?: boolean;
}

export const Tutorial = ({ location, highlight, ...rest }: TutorialProps) => {
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
    const position: React.CSSProperties | null = positionContext;

    // if (!position) throw Error("Not position exists");

    let tempPosition: React.CSSProperties = { ...position };

    if (location === "right") {
      let leftPosition = position?.left || "0px";
      let width = position?.width || "0px";

      if (typeof leftPosition === "number") {
        leftPosition = leftPosition + "px";
      }
      if (typeof width === "number") {
        width = width + "px";
      }

      tempPosition = {
        ...position,
        left: `calc(${leftPosition} + ${width})`,
      };
    }

    if (location === "left") {
      const refPosition = ref.current?.getBoundingClientRect();
      let leftPosition = position?.left || "0px";
      let width = refPosition?.width || "0px";

      if (typeof leftPosition === "number") {
        leftPosition = leftPosition + "px";
      }
      if (typeof width === "number") {
        width = width + "px";
      }

      tempPosition = {
        ...position,
        left: `calc(${leftPosition} - ${width})`,
      };
    }

    setRenderPosition(tempPosition);
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
        overflow: "hidden",
        top: renderPosition?.top,
        left: renderPosition?.left,
        fontSize: "1.5rem",
        ...rest.style,
      }}
    />
  );
};
