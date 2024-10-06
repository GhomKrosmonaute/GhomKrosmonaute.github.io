import React from "react"

export function useScroll(
  target: React.RefObject<Element | null | undefined>,
  callback: (coords: { scrollX: number; scrollY: number }) => void,
) {
  const getPositions = React.useCallback(() => {
    const el = target.current
    if (!el) return

    return {
      x: Math.round(el.scrollLeft / (el.scrollWidth - el.clientWidth)),
      y: Math.round(el.scrollTop / (el.scrollHeight - el.clientHeight)),
    }
  }, [target])

  React.useEffect(() => {
    const el = target.current
    if (!el) return

    const handleScroll = () => {
      const newScrollValues = getPositions()
      if (!newScrollValues) return

      const { x, y } = newScrollValues
      callback({ scrollX: x, scrollY: y })
    }

    el.addEventListener("scroll", handleScroll, {
      capture: false,
      passive: true,
    })

    return () => {
      el.removeEventListener("scroll", handleScroll)
    }
  }, [target, callback, getPositions])
}
