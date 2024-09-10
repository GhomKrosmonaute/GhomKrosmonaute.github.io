import React from "react";
import { cn } from "@/utils.ts";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { useSettings } from "@/hooks/useSettings.ts";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    React.PropsWithChildren<{
      borderLightAppearOnHover?: boolean;
    }>
>(({ borderLightAppearOnHover, ...props }, ref) => {
  const quality = useSettings((state) => ({
    transparency: state.quality.transparency,
    cardBlur: state.quality.blur,
  }));

  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        {
          "bg-background/70": quality.transparency,
          "bg-background": !quality.transparency,
          "backdrop-blur-xl": quality.cardBlur && quality.transparency,
        },
        "border-b-secondary-foreground border-r-primary p-10 rounded-md overflow-hidden border-2",
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
});
