import React from "react"

import ghom from "@/data/ghom.json"

import {
  GameState,
  GlobalGameState,
  useCardGame,
} from "@/hooks/useCardGame.tsx"
import { CrashReportContext, useCrashReport } from "@/hooks/useCrashReport.ts"

import { Button } from "@/components/ui/button.tsx"
import { omit, stringifyClone, wait } from "@/game-safe-utils.tsx"
import { t } from "@/i18n"
import { bank } from "@/sound.ts"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <h1 className="text-3xl text-center">
          {t("Une erreur à été interceptée !", "An error has been caught!")}
        </h1>
        {t(
          <p>
            Si tu le souhaites, tu peux envoyer le rapport d'erreur à Ghom pour
            qu'il puisse corriger le problème. Tu peux continuer ta partie, mais
            si tu rencontres des problèmes, il est conseillé de recharger la
            page. Si le bug persiste, il est possible que ta sauvegarde soit
            corrompue, dans ce cas tu devrais recommencer une nouvelle partie,
            désolé pour la gêne occasionnée.
          </p>,
          <p>
            If you want, you can send the error report to Ghom to help him fix
            the problem. You can continue your game, but if you encounter
            problems, it is recommended to refresh the page. If the bug
            persists, it is possible that your savegame is corrupted, in this
            case you should restart a new game, sorry for the inconvenience
            caused.
          </p>,
        )}
        <div className="grid grid-cols-2 gap-2 w-fit mx-auto">
          <Button
            onClick={() => {
              resetCrashReport()
              reset()
            }}
            size="cta"
            className="text-red-600"
          >
            {t("Recommencer une partie", "Restart the game")}
          </Button>
          <Button
            onClick={() => {
              resetCrashReport()
              window.location.reload()
            }}
            size="cta"
          >
            {t("Rafraichir le navigateur", "Refresh the browser")}
          </Button>
          <Button
            onClick={() => {
              if (!gameStringState || pastedGameString) {
                window.open(
                  `mailto:${ghom.email}?subject=${encodeURI(
                    `${t("Rapport d'erreur", "Error report")}: ${crashReport.message}`,
                  )}&body=${encodeURI(
                    `\n${crashReport.stack}\n\nGame state:\n< ${t(
                      "colle ici le contenu de ton presse-papier",
                      "paste here the content of your clipboard",
                    )} >`,
                  )}`,
                )
              } else setGameStringStateModalOpened(true)
            }}
            variant="cta"
            size="cta"
          >
            {t("Envoyer le rapport", "Send the report")}
          </Button>
          <Button onClick={() => resetCrashReport()} variant="cta" size="cta">
            {t("Continuer la partie", "Continue the game")}
          </Button>
        </div>
      </div>
      {gameStringStateModalOpened && (
        <div className="absolute left-1/2 top-1/2 bg-background ring ring-red-600 p-4 rounded-lg max-w-xl space-y-4 -translate-y-1/2 -translate-x-1/2">
          <h1 className="text-3xl text-center">
            {t("Avant d'envoyer le rapport", "Before sending the report")}
          </h1>
          <p className="text-xl leading-5">
            {t(
              <>
                Merci de copier ta sauvegarde dans le presse-papier afin de me
                la transmettre lors de ton rapport.
              </>,
              <>
                Thank you to copy your savegame into the clipboard so I can send
                it along with your report.
              </>,
            )}
          </p>
          <h2 className="text-2xl">{t("Sauvegarde", "Savegame")}</h2>
          <code className="text-sm whitespace-normal overflow-scroll w-full h-52">
            {gameStringState}
          </code>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setGameStringStateModalOpened(false)}>
              {t("Retour", "Back")}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard
                  .writeText(gameStringState!)
                  .then(() => {
                    alert(
                      t(
                        "La sauvegarde a été copiée dans le presse-papier",
                        "The savegame has been copied to the clipboard",
                      ),
                    )
                    setGameStringStateModalOpened(false)
                    setPastedGameString(true)
                  })
                  .catch(() => {
                    alert(
                      t(
                        "Impossible de copier la sauvegarde...\nEssaye de la copier à la main, merci d'avance !",
                        "Unable to copy the savegame...\nTry copying it manually, thanks for your patience!",
                      ),
                    )
                  })
              }}
              variant="cta"
              size="cta"
            >
              {t("Copier la sauvegarde", "Copy the savegame")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
