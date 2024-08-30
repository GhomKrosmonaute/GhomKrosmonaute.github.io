import React from "react";
import { cn } from "@/utils.ts";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const Card = ({
  borderLightAppearOnHover,
  ...props
}: React.PropsWithChildren<
  React.ComponentProps<"div"> & { borderLightAppearOnHover?: boolean }
>) => {
  const quality = useQualitySettings((state) => ({
    transparency: state.transparency,
    cardBlur: state.blur,
  }));

  return (
    <div
      {...props}
      className={cn(
        {
          "bg-background/70": quality.transparency,
          "bg-background": !quality.transparency,
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
        appearOnHover={borderLightAppearOnHover}
      />
      <BorderLight
        className="hidden md:mdh:block"
        groupName="card"
        appearOnHover={borderLightAppearOnHover}
        opposed
      />
    </div>
  );
};
