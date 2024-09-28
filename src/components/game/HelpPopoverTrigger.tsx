import React from "react"
import { useHelpPopover } from "@/hooks/useHelpPopover.tsx"

export const HelpPopoverTrigger = ({
  popover,
  ...props
}: Omit<React.ComponentProps<"div">, "ref"> & {
  popover: React.ReactNode
}) => {
  const ref = React.useRef<HTMLDivElement>(null)

  useHelpPopover(ref, popover)

  return (
    <div {...props} ref={ref}>
      {props.children}
    </div>
  )
}
