import React from "react"
import { create } from "zustand"
import { useHover } from "@/hooks/useHover.ts"

interface HelpPopoverState {
  subjects: React.ReactNode[]
  addSubject: (subject: React.ReactNode) => void
  removeSubject: (subject: React.ReactNode) => void
  clear: () => void
}

export const useHelpPopoverPrivate = create<HelpPopoverState>((set) => ({
  subjects: [],
  addSubject: (subject) =>
    set((state) => ({ subjects: [subject, ...state.subjects] })),
  removeSubject: (subject) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s !== subject),
    })),
  clear: () => set({ subjects: [] }),
}))

export const useHelpPopover = (
  target: React.RefObject<HTMLElement>,
  subject: React.ReactNode,
) => {
  const isHovered = useHover(target)

  const { addSubject, removeSubject } = useHelpPopoverPrivate()

  React.useEffect(() => {
    if (isHovered) addSubject(subject)
    else removeSubject(subject)
  }, [isHovered])
}
