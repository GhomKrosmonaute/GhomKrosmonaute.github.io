// hook who handle the konami code. Each key must be pressed in the right order in less than 1 second gap.

import React from "react"

import { useCardGame } from "@/hooks/useCardGame.ts"

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

export const useKonamiCode = () => {
  const [debug, setDebug] = useCardGame((state) => [
    state.debug,
    state.setDebug,
  ])

  const [index, setIndex] = React.useState(0)
  const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (timer) clearTimeout(timer)

      if (event.key === KONAMI_CODE[index]) {
        setIndex((index) => index + 1)
      } else {
        setIndex(0)
      }

      if (index === KONAMI_CODE.length - 1) {
        setIndex(0)
        setDebug(!debug)
      }

      setTimer(
        setTimeout(() => {
          setIndex(0)
        }, 1000),
      )
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [index, timer, debug, setDebug])
}
