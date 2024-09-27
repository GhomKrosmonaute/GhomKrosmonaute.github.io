import React from "react"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useKonamiCode } from "@/hooks/useKonamiCode.ts"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useGameWatching } from "@/hooks/useGameWatching.ts"

import steps from "@/data/tutorial.tsx"

import { CrashReportProvider } from "@/components/game/CrashReportProvider.tsx"
import { TutorialProvider } from "@/components/game/TutorialProvider.tsx"
import { ScreenMessages } from "@/components/game/ScreenMessages.tsx"
import { GameTutorial } from "@/components/game/GameTutorial.tsx"
import { GameUpgrades } from "@/components/game/GameUpgrades.tsx"
import { CornerIcons } from "@/components/game/CornerIcons.tsx"
import { GameActions } from "@/components/game/GameActions.tsx"
import { GameHelpers } from "@/components/game/GameHelpers.tsx"
import { GameValues } from "@/components/game/GameValues.tsx"
import { Scoreboard } from "@/components/game/Scoreboard.tsx"
import { GameAlert } from "@/components/game/GameAlert.tsx"
import { GameDebug } from "@/components/game/GameDebug.tsx"
import { GameMusic } from "@/components/game/GameMusic.tsx"
import { GameRules } from "@/components/game/GameRules.tsx"
import { GameOver } from "@/components/game/GameOver.tsx"
import { Settings } from "@/components/game/Settings.tsx"
import { GameHand } from "@/components/game/GameHand.tsx"

import "@/game-automatisms.ts"
import { GameCardDetail } from "@/components/game/GameCardDetail.tsx"

export const Game = () => {
  useKonamiCode()
  useGameWatching()

  const [debug, handleError] = useCardGame((state) => [
    state.debug,
    state.handleError,
  ])

  const [show, showSettings, showRules] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.settingsVisible,
    state.rulesVisible,
  ])

  const handleErrorEvent = React.useCallback(
    (event: ErrorEvent | PromiseRejectionEvent) => {
      if ("error" in event) handleError(event.error)
      else handleError(event.reason)
    },
    [handleError],
  )

  React.useEffect(() => {
    window.addEventListener("error", handleErrorEvent)
    window.addEventListener("unhandledrejection", handleErrorEvent)

    return () => {
      window.removeEventListener("error", handleErrorEvent)
      window.removeEventListener("unhandledrejection", handleErrorEvent)
    }
  }, [handleErrorEvent])

  return (
    <TutorialProvider
      steps={steps}
      opaqueStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
    >
      <CrashReportProvider>
        <GameMusic />
        <GameHelpers show={show} />
        <GameAlert show={show} />
        <Scoreboard show={show} />
        <GameValues show={show} />
        <GameOver show={show} />
        <GameActions show={show} />
        <GameUpgrades show={show} />
        <CornerIcons show={show} />
        <Settings show={show && showSettings} />
        <GameRules show={show && showRules} />
        <GameHand show={show} />
        <GameCardDetail show={show} />
        <GameTutorial show={show} />
        <ScreenMessages show={show} />

        {(import.meta.env.DEV || debug) && <GameDebug />}
      </CrashReportProvider>
    </TutorialProvider>
  )
}
