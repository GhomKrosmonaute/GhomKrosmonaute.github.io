import React from "react"
import { create } from "zustand"
import { useHover } from "@/hooks/useHover.ts"

interface HelpPopoverState {
  subject: React.ReactNode | null
  setSubject: (subject: React.ReactNode) => void
}

export const useHelpPopoverPrivate = create<HelpPopoverState>((set) => ({
  subject: null,
  setSubject: (subject) => set({ subject }),
}))

export const useHelpPopover = (
  ref: React.RefObject<HTMLElement>,
  subject: React.ReactNode,
) => {
  const isHovered = useHover(ref)
  const { setSubject } = useHelpPopoverPrivate()

  React.useEffect(() => {
    setSubject(isHovered ? subject : null)
  }, [isHovered])
}
