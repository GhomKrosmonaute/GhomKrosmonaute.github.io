import React from "react"

export const useCursor = () => {
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", onMouseMove)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return cursor
}
