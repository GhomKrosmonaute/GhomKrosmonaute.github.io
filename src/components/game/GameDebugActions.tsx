import { Button } from "@/components/ui/button.tsx";
import { ENERGY_TO_DAYS } from "@/game-constants.ts";
import upgrades from "@/data/upgrades.ts";
import { wait } from "@/game-utils.ts";
import { useCardGame } from "@/hooks/useCardGame.ts";

export const GameDebugActions = () => {
  const game = useCardGame();

  const runningOps = game.operationInProgress.length > 0;

  return (
    <div className="group-hover/debug:block hidden space-y-4">
      <Button
        onClick={() =>
          game.addNotification(
            "<span style='font-size: 32px'>Test d'une notif</span><br/>Une notification",
            "bg-background text-foreground",
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
  );
};
