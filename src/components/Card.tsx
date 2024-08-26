import React from "react";
import { cn } from "@/utils.ts";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const Card = (
  props: React.PropsWithChildren<
    React.ComponentProps<"div"> & { borderLightAppearOnHover?: boolean }
  >,
) => {
  const quality = useQualitySettings((state) => ({
    transparency: state.transparency,
    cardBlur: state.blur,
  }));

  return (
    <div
      {...props}
      className={cn(
        {
          "bg-card/70": quality.transparency,
          "bg-card": !quality.transparency,
          "backdrop-blur-xl": quality.cardBlur && quality.transparency,
        },
        "border-b-secondary-foreground border-r-primary p-10 rounded-md overflow-hidden",
        "border-2",
        props.className,
      )}
    >
      {props.children}

      <BorderLight
        className="hidden md:mdh:block"
        groupName="card"
        appearOnHover={props.borderLightAppearOnHover}
      />
      <BorderLight
        className="hidden md:mdh:block"
        groupName="card"
        appearOnHover={props.borderLightAppearOnHover}
        opposed
      />
    </div>
  );
};
