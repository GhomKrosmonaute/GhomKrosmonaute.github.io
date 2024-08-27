import { INFINITE_DRAW_COST, MAX_HAND_SIZE } from "@/game-constants.ts";

import { cn } from "@/utils.ts";
import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";

import { ValueIcon } from "@/components/game/ValueIcon.tsx";

import { useCardGame, isGameOver, wait } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import { bank } from "@/sound.ts";

import upgrades from "@/data/upgrades.ts";

export const GameActions = (props: { show: boolean }) => {
  const game = useCardGame();
  const animation = useQualitySettings((state) => state.animations);

  const disabled =
    game.energy + game.reputation < INFINITE_DRAW_COST ||
    game.hand.length >= MAX_HAND_SIZE ||
    game.deck.length === 0 ||
    game.isOperationInProgress;

  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0",
        {
          "transition-opacity duration-500 ease-in-out": animation,
          "opacity-100": props.show,
        },
      )}
    >
      <Card className="space-y-4">
        <div className="text-3xl">Game Actions</div>
        <Button
          className={cn("flex justify-start gap-2", { grayscale: disabled })}
          onClick={async () => {
            game.setOperationInProgress("infinity-draw", true);
            bank.play.play();
            await game.addEnergy(-INFINITE_DRAW_COST, {
              skipGameOverPause: true,
            });
            await game.draw(1, { skipGameOverPause: true });
            await game.triggerUpgradeEvent("eachDay", {
              skipGameOverPause: true,
            });
            if (isGameOver(game)) await wait(2000);
            game.setOperationInProgress("infinity-draw", false);
          }}
          disabled={disabled}
          size="cta"
        >
          <ValueIcon
            value={INFINITE_DRAW_COST}
            type="energy"
            isCost
            className="w-8"
          />{" "}
          Piocher une carte
        </Button>
        {process.env.NODE_ENV === "development" && (
          <>
            <Button
              disabled={game.isOperationInProgress}
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
                }
              }}
            >
              Toutes les améliorations
            </Button>
            <Button
              disabled={game.isOperationInProgress || game.hand.length === 0}
              onClick={() => game.removeCard(game.hand[0]?.name)}
            >
              Supprime la première carte
            </Button>
            <div className="flex">
              <Button
                className="text-green-500"
                onClick={() => game.win()}
                disabled={game.isOperationInProgress}
              >
                Win
              </Button>
              <Button
                className="text-red-500"
                onClick={() => game.gameOver("reputation")}
                disabled={game.isOperationInProgress}
              >
                Lose
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
