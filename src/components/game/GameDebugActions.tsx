import { wait } from "@/game-utils.ts"
import { ENERGY_TO_DAYS } from "@/game-constants.ts"

import { useCardGame } from "@/hooks/useCardGame.ts"

import { Button } from "@/components/ui/button.tsx"

export const GameDebugActions = () => {
  const game = useCardGame()

  const runningOps = game.operationInProgress.length > 0

  return (
    <div className="group-hover/debug:grid hidden grid-cols-2 gap-1 *:mx-auto">
      <Button
        size="cta"
        onClick={() => {
          throw new Error("Test d'erreur")
        }}
      >
        Déclencher une erreur
      </Button>
      <Button
        size="cta"
        onClick={() =>
          game.addNotification({
            header: "Test de notif",
            message: "Une notification",
            className: "bg-background text-foreground",
          })
        }
      >
        Déclencher une notification
      </Button>
      <Button
        size="cta"
        disabled={runningOps}
        onClick={async () => {
          const day = 1
          const energy = Math.round(day / ENERGY_TO_DAYS)
          await game.advanceTime(energy)
        }}
      >
        Ajouter 1 jour
      </Button>
      <Button
        size="cta"
        disabled={runningOps}
        className="text-upgrade"
        onClick={async () => {
          game.upgrades = []

          for (const raw of game.rawUpgrades) {
            await Promise.all(
              new Array(raw.max ?? 10).fill(0).map(async (_, i) => {
                await wait(100 * i)
                await game.upgrade(raw.name)
              }),
            )

            await game.removeCard(raw.name)
          }
        }}
      >
        Toutes les améliorations
      </Button>
      <Button size="cta" onClick={() => game.incrementsInflation()}>
        Augmenter l'inflation
      </Button>
      <div className="flex">
        <Button
          className="text-green-500"
          onClick={() => game.win()}
          disabled={runningOps}
        >
          Win
        </Button>
        <Button
          className="text-red-500"
          onClick={() => game.defeat("reputation")}
          disabled={runningOps}
        >
          Lose
        </Button>
      </div>
    </div>
  )
}
