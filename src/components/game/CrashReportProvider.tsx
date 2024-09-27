import React from "react"

import ghom from "@/data/ghom.json"

import { CrashReportContext, useCrashReport } from "@/hooks/useCrashReport.ts"
import {
  GlobalGameState,
  GameState,
  useCardGame,
} from "@/hooks/useCardGame.tsx"

import { Button } from "@/components/ui/button.tsx"
import { bank } from "@/sound.ts"
import { omit, stringifyClone, wait } from "@/game-safe-utils.tsx"

export const CrashReportProvider = ({ children }: React.PropsWithChildren) => {
  const [gameError, update, getState] = useCardGame((state) => [
    state.error,
    state.dangerouslyUpdate,
    () => state,
  ])

  const [crashReport, setCrashReport] = React.useState<Error | null>(null)
  const [gameState, setGameState] = React.useState<
    (GameState & GlobalGameState) | null
  >(null)
  const [gameStringState, setGameStringState] = React.useState<string | null>(
    null,
  )

  React.useEffect(() => {
    if (gameError) {
      addCrashReport(gameError, getState())
    }
  }, [gameError])

  const addCrashReport = React.useCallback(
    (error: Error, state: GameState & GlobalGameState) => {
      bank.error.play()

      setCrashReport(error)
      setGameState(stringifyClone(state))

      console.error(error)

      const gameStringState = JSON.stringify(
        omit(state, "revivedHand", "revivedDraw", "revivedDiscard"),
      )

      wait(500).then(() =>
        navigator.clipboard
          .writeText(gameStringState)
          .catch(() => {
            setGameStringState(gameStringState)
          })
          .then(() => alert("L'état du jeu a été copié dans le presse-papier")),
      )
    },
    [],
  )

  return (
    <CrashReportContext.Provider
      value={{
        gameState,
        crashReport,
        addCrashReport,
        gameStringState,
        resetCrashReport: () => {
          setCrashReport(null)
          setGameState(null)
          update({ error: null })
        },
      }}
    >
      {crashReport ? <CrashReport /> : children}
    </CrashReportContext.Provider>
  )
}

export const CrashReport = () => {
  const reset = useCardGame((state) => state.reset)
  const { resetCrashReport, crashReport, gameState, gameStringState } =
    useCrashReport()

  const [gameStringStateModalOpened, setGameStringStateModalOpened] =
    React.useState(false)

  const [pastedGameString, setPastedGameString] = React.useState(false)

  if (!crashReport || !gameState) return null

  return (
    <div className="absolute inset-0 bg-background/50 flex justify-center items-center">
      <div className="bg-background/90 ring ring-red-600 p-4 rounded-lg space-y-4 max-w-xl">
        <h1 className="text-3xl text-center">Une erreur à été interceptée !</h1>
        <p>
          Si tu le souhaites, tu peux envoyer le rapport d'erreur à Ghom pour
          qu'il puisse corriger le problème. Tu peux continuer ta partie, mais
          si tu rencontres des problèmes, il est conseillé de recharger la page.
          Si le bug persiste, il est possible que ta sauvegarde soit corrompue,
          dans ce cas tu devrais recommencer une nouvelle partie, désolé pour la
          gêne occasionnée.
        </p>
        <div className="grid grid-cols-2 gap-2 w-fit mx-auto">
          <Button
            onClick={() => {
              resetCrashReport()
              reset()
            }}
            size="cta"
            className="text-red-600"
          >
            Recommencer une partie
          </Button>
          <Button
            onClick={() => {
              resetCrashReport()
              window.location.reload()
            }}
            size="cta"
          >
            Rafraichir le navigateur
          </Button>
          <Button
            onClick={() => {
              if (!gameStringState || pastedGameString) {
                window.open(
                  `mailto:${ghom.email}?subject=${encodeURI(
                    `Rapport d'erreur: ${crashReport.message}`,
                  )}&body=${encodeURI(
                    `\n${crashReport.stack}\n\nGame state:\n< colle ici le contenu de ton presse-papier >`,
                  )}`,
                )
              } else setGameStringStateModalOpened(true)
            }}
            variant="cta"
            size="cta"
          >
            Envoyer le rapport
          </Button>
          <Button onClick={() => resetCrashReport()} variant="cta" size="cta">
            Continuer la partie
          </Button>
        </div>
      </div>
      {gameStringStateModalOpened && (
        <div className="absolute left-1/2 top-1/2 bg-background ring ring-red-600 p-4 rounded-lg max-w-xl space-y-4 -translate-y-1/2 -translate-x-1/2">
          <h1 className="text-3xl text-center">Avant d'envoyer le rapport</h1>
          <p className="text-xl leading-5">
            Merci de copier ta sauvegarde dans le presse-papier afin de me la
            transmettre lors de ton rapport.
          </p>
          <h2 className="text-2xl">Sauvegarde</h2>
          <code className="text-sm whitespace-normal overflow-scroll w-full h-52">
            {gameStringState}
          </code>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setGameStringStateModalOpened(false)}>
              Retour
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard
                  .writeText(gameStringState!)
                  .then(() => {
                    alert("La sauvegarde a été copiée dans le presse-papier")
                    setGameStringStateModalOpened(false)
                    setPastedGameString(true)
                  })
                  .catch(() => {
                    alert(
                      "Impossible de copier la sauvegarde...\nEssaye de la copier à la main, merci d'avance !",
                    )
                  })
              }}
              variant="cta"
              size="cta"
            >
              Copier la sauvegarde
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
