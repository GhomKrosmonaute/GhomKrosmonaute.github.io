import React from "react"

import { useCardGame } from "@/hooks/useCardGame.ts"
import { useKonamiCode } from "@/hooks/useKonamiCode.ts"
import { useGlobalState } from "@/hooks/useGlobalState.ts"

import steps from "@/data/tutorial.tsx"

import { CrashReportProvider } from "@/components/game/CrashReportProvider.tsx"
import { TutorialProvider } from "@/components/game/TutorialProvider.tsx"
import { EventNotifier } from "@/components/game/EventNotifier.tsx"
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

export const Game = () => {
  useKonamiCode()

  const [debug, throwError] = useCardGame((state) => [
    state.debug,
    state.throwError,
  ])

  const [show, showSettings, showRules] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.settingsVisible,
    state.rulesVisible,
  ])

  const handleError = React.useCallback(
    (event: ErrorEvent | PromiseRejectionEvent) => {
      if ("error" in event) throwError(event.error)
      else throwError(event.reason)
    },
    [throwError],
  )

  React.useEffect(() => {
    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleError)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleError)
    }
  }, [])

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
        <GameTutorial show={show} />
        <EventNotifier show={show} />

        {(process.env.NODE_ENV === "development" || debug) && <GameDebug />}
      </CrashReportProvider>
    </TutorialProvider>
  )
}
