import React from "react"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useCardGame } from "@/hooks/useCardGame.tsx"

export const useGameWatching = () => {
  const show = useGlobalState((state) => state.isCardGameVisible)
  const isOperationInProgress = useCardGame(
    (state) => state.operationInProgress.length > 0,
  )

  const checkAchievements = useCardGame((state) => state.checkAchievements)
  const checkDiscoveries = useCardGame((state) => state.checkDiscoveries)

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (show && !isOperationInProgress) {
        checkDiscoveries()
        checkAchievements().then()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [show, isOperationInProgress, checkAchievements])
}
