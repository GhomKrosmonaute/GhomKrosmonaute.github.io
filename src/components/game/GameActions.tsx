import {
  ENERGY_TO_DAYS,
  INFINITE_DRAW_COST,
  MAX_HAND_SIZE,
} from "@/game-constants.ts";

import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { energyCostColor, isGameOver, wait } from "@/game-utils";
import { cn } from "@/utils.ts";

import { GameValueIcon } from "@/components/game/GameValueIcon.tsx";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import { bank } from "@/sound.ts";

import upgrades from "@/data/upgrades.ts";

export const GameActions = (props: { show: boolean }) => {
  const game = useCardGame();
  const animation = useQualitySettings((state) => state.animations);

  const runningOps = game.operationInProgress.length > 0;

  const disabled =
    game.energy + game.reputation < INFINITE_DRAW_COST ||
    game.hand.length >= MAX_HAND_SIZE ||
    game.draw.length === 0 ||
    runningOps;

  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0",
        {
          "transition-opacity duration-500 ease-in-out": animation,
          "opacity-100": props.show,
          "pointer-events-none": !props.show,
        },
      )}
    >
      <Card className="space-y-4 group/actions">
        <h2 className="text-3xl text-center">Actions</h2>
        <Button
          className={cn("flex justify-start gap-2", { grayscale: disabled })}
          onClick={async () => {
            game.setOperationInProgress("infinity-draw", true);

            bank.play.play();

            await game.addEnergy(-INFINITE_DRAW_COST, {
              skipGameOverPause: true,
              reason: "Bouton pioche",
            });

            await game.drawCard(1, {
              skipGameOverPause: true,
              reason: "Bouton pioche",
            });

            await game.advanceTime(INFINITE_DRAW_COST);

            if (isGameOver(game)) await wait(2000);

            game.setOperationInProgress("infinity-draw", false);
          }}
          disabled={disabled}
          size="cta"
        >
          <GameValueIcon
            value={INFINITE_DRAW_COST}
            isCost
            className="w-8 h-8"
            colors={energyCostColor(game, INFINITE_DRAW_COST)}
          />{" "}
          Piocher une carte
        </Button>
        {process.env.NODE_ENV === "development" && (
          <div className="hidden group-hover/actions:block space-y-4">
            <Button
              onClick={() =>
                game.addNotification(
                  "Une notification",
                  "via-background/50 text-foreground",
                )
              }
            >
              Déclencher une notification
            </Button>
            <Button
              disabled={runningOps}
              onClick={async () => {
                const day = 0.5;
                const energy = Math.round(day / ENERGY_TO_DAYS);
                await game.advanceTime(energy);
              }}
            >
              Ajouter 12h
            </Button>
            <Button
              disabled={runningOps}
              className="text-upgrade"
              onClick={async () => {
                game.upgrades = [];

                for (const raw of upgrades) {
                  await Promise.all(
                    new Array(raw.max ?? 10).fill(0).map(async (_, i) => {
                      await wait(100 * i);
                      await game.upgrade(raw.name);
                    }),
                  );

                  await game.removeCard(raw.name);
                }
              }}
            >
              Toutes les améliorations
            </Button>
            <Button
              disabled={runningOps || game.hand.length === 0}
              onClick={() => game.removeCard(game.hand[0]?.name)}
            >
              Supprime la première carte
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
        )}
      </Card>
    </div>
  );
};
