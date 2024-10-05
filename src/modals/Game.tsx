import React from "react"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useKonamiCode } from "@/hooks/useKonamiCode.ts"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useGameWatching } from "@/hooks/useGameWatching.ts"

import steps from "@/data/tutorial.tsx"

import { CrashReportProvider } from "@/components/game/CrashReportProvider.tsx"
import { TutorialProvider } from "@/components/game/TutorialProvider.tsx"
import { ScreenMessages } from "@/components/game/ScreenMessages.tsx"
import { GameCardStacks } from "@/components/game/GameCardStacks.tsx"
import { GameTutorial } from "@/components/game/GameTutorial.tsx"
import { GameUpgrades } from "@/components/game/GameUpgrades.tsx"
import { CornerIcons } from "@/components/game/CornerIcons.tsx"
import { GameActions } from "@/components/game/GameActions.tsx"
import { GameHelpers } from "@/components/game/GameHelpers.tsx"
import { HelpPopover } from "@/components/game/HelpPopover.tsx"
import { GameDetail } from "@/components/game/GameDetail.tsx"
import { GameAlert } from "@/components/game/GameAlert.tsx"
import { GameDebug } from "@/components/game/GameDebug.tsx"
import { GameMusic } from "@/components/game/GameMusic.tsx"
import { GameOver } from "@/components/game/GameOver.tsx"
import { GameHand } from "@/components/game/GameHand.tsx"
import { GameHUD } from "@/components/game/GameHUD.tsx"
import { Menu } from "@/components/game/menu/Menu.tsx"

import "@/game-automatisms.ts"

export const Game = () => {
  useKonamiCode()
  useGameWatching()

  const [debug, handleError] = useCardGame((state) => [
    state.debug,
    state.handleError,
  ])

  const [show, showSettings] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.settingsVisible,
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
        <GameHUD show={show} />
        <GameCardStacks show={show} />
        <GameActions show={show} />
        <GameUpgrades show={show} />
        <GameHand show={show} />
        <GameDetail show={show} />
        <ScreenMessages show={show} />
        <GameTutorial show={show} />
        <GameOver show={show} />
        <CornerIcons show={show} />
        <Menu show={show && showSettings} />
        <HelpPopover show={show} />

        {(import.meta.env.DEV || debug) && <GameDebug />}
      </CrashReportProvider>
    </TutorialProvider>
  )
}
