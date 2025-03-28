import React from "react"

import { INFINITE_DRAW_COST, MAX_HAND_SIZE } from "@/game-constants.ts"

import {
  isGameOver,
  resolveChoiceOptions,
  reviveCard,
  toSortedCards,
} from "@/game-utils"
import { bank } from "@/sound.ts"
import { cn } from "@/utils.ts"

import { GameCard } from "@/components/game/GameCard.tsx"
import { GameResourceCard } from "@/components/game/GameResourceCard.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { Button } from "@/components/ui/button.tsx"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"

import {
  choiceOptionsHeaders,
  energyCostColor,
  isNewSprint,
  wait,
} from "@/game-safe-utils.tsx"
import {
  ChoiceOptions,
  isChoiceOptionsResolved,
  isGameResource,
} from "@/game-typings.ts"
import { t } from "@/i18n"

export const GameActions = (props: { show: boolean }) => {
  const game = useCardGame()
  const animation = useSettings((state) => state.quality.animations)

  const newSprint = isNewSprint(game.day)

  const [resolvedOptions, resolvedHeader] = React.useMemo(() => {
    if (!game.choiceOptions[0]) return [[], ""]

    if (!isChoiceOptionsResolved(game.choiceOptions[0])) {
      game.choiceOptions[0] = resolveChoiceOptions(game, game.choiceOptions[0])
    }

    const choice = game.choiceOptions[0] as ChoiceOptions<true>

    return [
      toSortedCards(choice.options, game),
      // @ts-expect-error le slice extrait les paramètres de la fonction
      choiceOptionsHeaders[choice.header[0]](...choice.header.slice(1)),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.choiceOptions[0]])

  const runningOps =
    game.operationInProgress.filter((o) => o !== "choices").length > 0

  const drawButtonDisabled =
    game.energy + game.reputation < INFINITE_DRAW_COST ||
    game.hand.length >= MAX_HAND_SIZE ||
    game.draw.length === 0 ||
    runningOps

  React.useEffect(() => {
    if (
      game.choiceOptions.length === 0 &&
      game.operationInProgress.includes("choices")
    ) {
      game.setOperationInProgress("choices", false)
    }

    if (
      game.choiceOptions.length > 0 &&
      !game.operationInProgress.includes("choices")
    ) {
      game.setOperationInProgress("choices", true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.choiceOptions.length, game.operationInProgress])

  return (
    <div
      id="actions"
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none",
        {
          "transition-opacity duration-500 ease-in-out": animation,
          "opacity-100 pointer-events-auto": props.show,
        },
      )}
    >
      <div className="space-y-4 group/actions bg-background/80 p-2 rounded-xl relative">
        <h2
          className={cn(
            "text-3xl ml-2 select-none",
            game.choiceOptions.length > 0 && resolvedOptions.length < 4
              ? "text-left"
              : "text-center",
          )}
        >
          {game.playZone.length > 0
            ? game.operationInProgress.includes("selectCard")
              ? t(
                  "Clique sur une carte de la main",
                  "Click on a card from your hand",
                )
              : game.playZone[game.playZone.length - 1].name // Affiche le titre de la dernière carte ajoutée à la playZone
            : game.choiceOptions.length > 0
              ? resolvedHeader
              : "Actions"}
        </h2>
        {game.playZone.length > 0 ? (
          <div className="flex justify-center">
            {game.playZone.map((indice, i) => (
              <GameCard key={i} card={reviveCard(indice, game)} isPlaying />
            ))}
          </div>
        ) : game.choiceOptions.length === 0 ? (
          <Button
            className={cn("flex justify-start gap-2", {
              grayscale: drawButtonDisabled,
            })}
            onClick={async () => {
              game.setOperationInProgress("infinity-draw", true)

              bank.play.play()

              await game.addEnergy(-INFINITE_DRAW_COST, {
                skipGameOverPause: true,
                reason: "Bouton pioche",
              })

              await game.drawCard(1, {
                skipGameOverPause: true,
                reason: "Bouton pioche",
              })

              await game.advanceTime(INFINITE_DRAW_COST)

              if (isGameOver(game)) await wait(2000)

              game.setOperationInProgress("infinity-draw", false)
            }}
            disabled={drawButtonDisabled}
            size="cta"
          >
            <GameValueIcon
              value={INFINITE_DRAW_COST}
              isCost
              className="w-8 h-8"
              colors={energyCostColor(game, INFINITE_DRAW_COST)}
            />{" "}
            {t("Piocher une carte", "Draw a card")}
          </Button>
        ) : (
          <>
            <Button
              className="flex gap-3 absolute right-2 -top-2"
              disabled={runningOps}
              onClick={async () => {
                await game.skipChoiceOptions({ reason: "Bouton passer" })
              }}
            >
              <GameValueIcon
                value={newSprint && game.choiceOptions.length === 1 ? 10 : 5}
                symbol
                miniature
                colors="bg-energy"
              />
              {t("Passer", "Skip")}
            </Button>
            {(() => {
              if (resolvedOptions.length === 0) {
                game.nextChoiceOptions()
              }

              return (
                <div
                  className={cn("flex justify-center", {
                    "grid grid-cols-3": resolvedOptions.length < 3,
                  })}
                >
                  <div
                    className={cn({
                      hidden: resolvedOptions.length !== 1,
                    })}
                  />
                  {resolvedOptions.map((option, i) =>
                    isGameResource(option) ? (
                      <GameResourceCard key={i} resource={option} />
                    ) : (
                      <GameCard key={i} card={option} isChoice />
                    ),
                  )}
                </div>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
