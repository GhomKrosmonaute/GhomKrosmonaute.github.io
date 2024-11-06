import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import React from "react"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isOperationInProgress])
}
