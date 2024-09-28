import React from "react"
import { cn } from "@/utils.ts"
import { useSettings } from "@/hooks/useSettings.ts"
import { useCursor } from "@/hooks/useCursor.ts"
import { useHelpPopoverPrivate } from "@/hooks/useHelpPopover.tsx"

export const HelpPopover = (props: { show: boolean }) => {
  const { subject } = useHelpPopoverPrivate()
  const settings = useSettings()
  const cursor = useCursor()
  const [lastSubject, setLastSubject] = React.useState<React.ReactNode | null>(
    null,
  )

  React.useEffect(() => {
    if (subject) {
      setLastSubject(subject)
    }
  }, [subject])

  return (
    <div
      className={cn(
        "pointer-events-none z-50 fixed bg-card p-2 rounded-md shadow-sm shadow-primary max-w-md",
        {
          [cn("transition-opacity", {
            "opacity-100 duration-75 ease-[cubic-bezier(0.4, 0, 1, 1)]":
              props.show && subject,
            "opacity-0 duration-1000 ease-[cubic-bezier(0.0, 0, 0.2, 1)]":
              !props.show || !subject,
          })]: settings.quality.transparency,
          [cn("hidden", {
            block: props.show && subject,
          })]: !settings.quality.transparency,
        },
      )}
      style={{
        top: cursor.y + 5,
        left: cursor.x + 5,
      }}
    >
      {lastSubject}
    </div>
  )
}
