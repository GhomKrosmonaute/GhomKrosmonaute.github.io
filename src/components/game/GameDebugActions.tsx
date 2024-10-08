import { ADVANTAGE_THRESHOLD, ENERGY_TO_DAYS } from "@/game-constants.ts"

import { useCardGame } from "@/hooks/useCardGame.tsx"

import { Button } from "@/components/ui/button.tsx"
import upgrades from "@/data/upgrades.tsx"
import { generateRandomRarity, wait } from "@/game-safe-utils.tsx"
import cards from "@/data/cards.tsx"
import { reviveCard } from "@/game-utils.ts"

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
          game.addScreenMessage({
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
        onClick={async () => {
          const week = 7
          const energy = Math.round(week / ENERGY_TO_DAYS)
          await game.advanceTime(energy)
        }}
      >
        Ajouter une semaine
      </Button>
      <Button
        size="cta"
        disabled={runningOps}
        className="text-upgrade"
        onClick={async () => {
          game.setOperationInProgress("get all upgrades", true)

          game.upgrades = []

          for (const raw of upgrades) {
            await Promise.all(
              new Array(raw.max ?? 10).fill(0).map(async (_, i) => {
                await wait(100 * i)
                await game.upgrade(raw.name)
              }),
            )

            await game.removeCard(raw.name)
          }

          game.setOperationInProgress("get all upgrades", false)
        }}
      >
        Toutes les améliorations
      </Button>
      <Button
        size="cta"
        onClick={async () => {
          game.choiceOptions = []
          game.operationInProgress = []
          game.setOperationInProgress("get all cards", true)

          for (const card of cards) {
            if (game.hand.some((c) => c.name === card.name)) continue
            if (game.draw.some((c) => c.name === card.name)) continue
            if (game.playZone.some((c) => c.name === card.name)) continue
            if (game.discard.some((c) => c.name === card.name)) continue

            game.draw.push(
              reviveCard(
                {
                  name: card.name,
                  state: "idle",
                  initialRarity: generateRandomRarity(),
                },
                game,
              ),
            )
          }

          game.setOperationInProgress("get all cards", false)
        }}
      >
        Toutes les cartes
      </Button>
      <Button
        size="cta"
        onClick={() => game.dangerouslyUpdate({ inflation: 0 })}
      >
        Annuler l'inflation
      </Button>
      <Button size="cta" onClick={() => game.incrementsInflation()}>
        Augmenter l'inflation
      </Button>
      <Button
        size="cta"
        onClick={async () => {
          const targets = cards
            .filter((c) => !c.effect().tags.includes("token"))
            .map((c) => c.name)

          await game.transformCardsAnimation(targets, () =>
            game.addGlobalCardModifier(
              "level up cards",
              [targets, ADVANTAGE_THRESHOLD],
              "Level up button",
            ),
          )
        }}
      >
        Level up cards
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
