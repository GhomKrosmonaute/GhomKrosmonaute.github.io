import React from "react";
import Cross from "@/assets/icons/cross.svg";

import { cn } from "@/utils.ts";
import { useMediaQuery } from "usehooks-ts";
import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const CenterCard = (
  props: React.PropsWithChildren<{
    onClose?: () => unknown;
    className?: string;
    style?: React.CSSProperties;
    big?: boolean;
  }>,
) => {
  const matches = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const { shadows } = useQualitySettings((state) => ({
    shadows: state.shadows,
  }));

  return (
    <>
      <div
        className={cn(
          "group/card absolute pointer-events-none md:pointer-events-auto",
          "left-0 top-0 w-full h-full md:w-auto md:h-auto",
          "md:left-1/2 mdh:md:top-1/2 md:-translate-x-1/2 mdh:md:-translate-y-1/2",
          "md:w-max md:min-w-min md:max-w-[100vw] md:max-h-[100svh]",
          "2xl:left-[70vw]",
          "mdh:flex justify-center items-center",
          props.className,
        )}
        style={props.style}
      >
        <Card
          className={cn(
            "rounded-none overflow-scroll border-none",
            "md:h-auto md:rounded-md md:border-2 md:overflow-hidden",
            " md:transition md:ease-in-out md:duration-500",
            {
              "md:shadow-spotlight md:hover:shadow-glow-150 md:hover:shadow-primary":
                shadows,
            },
            " md:hover:border-b-primary md:hover:backdrop-blur-md",
            // set inclination
            {
              "rotate-2 scale-95 hover:rotate-0 hover:scale-100": matches,
            },
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          borderLightAppearOnHover
        >
          {props.onClose && matches && (
            <Button
              className="reverse absolute top-0 right-0 m-4"
              variant="icon"
              size="sm"
              autoFocus
              onKeyDown={(e) => e.key === "Escape" && props.onClose?.()}
              onClick={props.onClose}
            >
              <Cross />
            </Button>
          )}

          {props.children}
        </Card>
      </div>
    </>
  );
};
