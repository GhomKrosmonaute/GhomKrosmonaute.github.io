import React from "react"
import { cn } from "@/utils.ts"
import { BorderLight } from "@/components/ui/border-light.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { omit } from "@/game-safe-utils.tsx"

export const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    React.PropsWithChildren<{
      borderLightAppearOnHover?: boolean
    }>
>((props, ref) => {
  const quality = useSettings((state) => ({
    transparency: state.quality.transparency,
    cardBlur: state.quality.blur,
  }))

  return (
    <div
      {...omit(props, "borderLightAppearOnHover")}
      ref={ref}
      className={cn(
        {
          "bg-background/70": quality.transparency,
          "bg-background": !quality.transparency,
          "backdrop-blur-xl": quality.cardBlur && quality.transparency,
        },
        "border-b-secondary-foreground border-r-primary px-3 md:p-10 rounded-md overflow-hidden border-2",
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
  )
})
