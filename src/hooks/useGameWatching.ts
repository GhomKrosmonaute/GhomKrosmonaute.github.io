import React from "react"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"

export const useGameWatching = () => {
  const show = useGlobalState((state) => state.isCardGameVisible)
  const isOperationInProgress = useCardGame(
    (state) => state.operationInProgress.length > 0,
  )

  const checkAchievements = useCardGame((state) => state.checkAchievements)

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (show && !isOperationInProgress) {
        checkAchievements().then()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [show, isOperationInProgress, checkAchievements])
}
