import React from "react"

export const useHover = (ref: React.RefObject<HTMLElement>) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  React.useEffect(() => {
    const el = ref?.current

    if (el) {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [ref])

  return isHovered
}
