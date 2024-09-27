import React from "react"
import ReactHowler from "react-howler"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useGlobalState } from "@/hooks/useGlobalState.ts"

const MAX_VOLUME = 0.4

export const GameMusic = () => {
  const isGameOver = useCardGame((state) => state.isGameOver)
  const musicVolume = useGlobalState((state) => state.musicVolume)
  const musicMuted = useGlobalState((state) => state.musicMuted)
  const setMusicVolume = useGlobalState((state) => state.setMusicVolume)
  const isCardGameVisible = useGlobalState((state) => state.isCardGameVisible)

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (isCardGameVisible && !isGameOver && musicVolume < MAX_VOLUME) {
      interval = setInterval(() => {
        setMusicVolume((v) => {
          if (v < MAX_VOLUME) {
            return Math.min(MAX_VOLUME, v + MAX_VOLUME / 10)
          } else {
            clearInterval(interval)
            return v
          }
        })
      }, 100)
    } else if ((!isCardGameVisible || isGameOver) && musicVolume > 0) {
      interval = setInterval(() => {
        setMusicVolume((v) => {
          if (v > 0) {
            return Math.max(0, v - MAX_VOLUME / 10)
          } else {
            clearInterval(interval)
            return v
          }
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isCardGameVisible, isGameOver])

  return (
    <ReactHowler
      src="sounds/music.mp3"
      volume={Math.min(MAX_VOLUME, musicVolume)}
      mute={musicMuted}
      loop
      playing
    />
  )
}
