import React from "react"
import { cn } from "@/utils.ts"
import { useSettings } from "@/hooks/useSettings.ts"

export const BentoCard = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const settings = useSettings()

  return (
    <div
      {...props}
      className={cn(
        "space-y-4 border rounded-xl py-4 px-6",
        {
          "bg-card/50": settings.quality.transparency,
          "bg-card": !settings.quality.transparency,
        },
        className,
      )}
    />
  )
}
