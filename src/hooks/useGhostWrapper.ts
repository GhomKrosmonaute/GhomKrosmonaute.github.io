import React from "react"
import { getAbsoluteBoundingRect, transferDOMRect } from "@/utils.ts"

export const useGhostWrapper = (ref: React.RefObject<HTMLElement>) => {
  const wrapper = React.useRef<HTMLDivElement>(null)

  // gives the tutorial wrapper the position and the client boundaries of the hand wrapper
  React.useEffect(() => {
    if (ref.current && wrapper.current) {
      const handRect = getAbsoluteBoundingRect(ref.current)
      transferDOMRect(handRect, wrapper.current)
    }
  })

  return wrapper
}
