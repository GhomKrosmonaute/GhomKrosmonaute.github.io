import { INFINITE_DRAW_COST, MAX_HAND_SIZE } from "@/game-constants.ts";

import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { energyCostColor, formatText, isGameOver, wait } from "@/game-utils";
import { cn } from "@/utils.ts";

import { GameValueIcon } from "@/components/game/GameValueIcon.tsx";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import { bank } from "@/sound.ts";

import { GameCard } from "@/components/game/GameCard.tsx";

export const GameActions = (props: { show: boolean }) => {
  const game = useCardGame();
  const animation = useQualitySettings((state) => state.animations);

  const runningOps = game.operationInProgress.length > 0;
  const newSprint = Math.floor(game.day) % 7 === 0;

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
        <h2 className="text-3xl text-center">
          {game.choiceOptions.length > 0 ? (
            <>
              Choisis une carte{" "}
              {newSprint && game.choiceOptions.length <= 2 && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatText(
                      game.choiceOptions.length === 1 ? "@upgrade" : "@action",
                    ),
                  }}
                />
              )}{" "}
              {game.choiceOptions.length > 1 &&
                !newSprint &&
                `(${game.choiceOptions.length} restantes)`}
            </>
          ) : (
            "Actions"
          )}
        </h2>
        {game.choiceOptions.length === 0 ? (
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
        ) : (
          <div className="flex">
            {/*{JSON.stringify(game.choiceOptions[0])}*/}
            {game.choiceOptions[0].map((option, i) => (
              <GameCard key={i} card={option} isChoice />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
