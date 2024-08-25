import { formatText, rankColor, useCardGame } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

import scores from "@/data/scores.json";
import helpers from "@/data/helpers.json";

import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { Stats } from "@/components/game/Stat.tsx";
import { Tilt } from "@/components/game/Tilt.tsx";
import { cn } from "@/utils.ts";

export const GameOver = (props: { show: boolean }) => {
  const { shadows, transparency, animation } = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.cardAnimation,
    transparency: state.transparency,
  }));
  const setVisible = useGlobalState((state) => state.setCardGameVisibility);

  const game = useCardGame((state) => ({
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    reason: state.reason,
    score: state.score,
    reset: state.reset,
  }));

  const rank = scores
    .sort((a, b) => b.score - a.score)
    .findIndex(({ score }) => game.score >= score);

  return (
    <div className={cn("absolute w-full", props.show ? "block" : "hidden")}>
      {game.isGameOver && (
        <div
          className={cn(
            "absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center z-40 pointer-events-auto",
            {
              "bg-background/90": transparency,
              "bg-background": !transparency,
            },
          )}
        >
          <div className="flex flex-col items-center justify-center gap-7">
            <Tilt className="flex flex-col select-none" max={10} reverse>
              <div className="font-amsterdam capitalize text-9xl w-fit">
                Game Over
              </div>

              <div className="*:text-7xl *:whitespace-nowrap *:font-amsterdam text-center">
                {game.isWon && (
                  <div className="text-green-500">Vous avez gagné !</div>
                )}
                {!game.isWon && (
                  <div className="text-red-500">Vous avez perdu !</div>
                )}
              </div>
            </Tilt>

            {game.reason && (
              <p className="text-4xl">
                {
                  {
                    reputation:
                      "Vous avez utilisé toute votre jauge de réputation...",
                    mill: "Vous n'avez plus de carte...",
                    "soft-lock": "Votre main est injouable...",
                  }[game.reason]
                }
              </p>
            )}

            {/* win Stats / lose conseils */}
            {game.isWon ? (
              <div className="grid grid-cols-2 gap-4">
                <Stats className="*:h-10 text-3xl" />
                <div
                  className={cn(
                    "p-5 space-y-2 rounded-2xl bg-background shadow-md",
                    {
                      "shadow-foreground/20": shadows && transparency,
                    },
                  )}
                >
                  {rank >= 0 ? (
                    <>
                      <div className="text-3xl">
                        Rank:{" "}
                        <span
                          className={cn(
                            "font-changa text-4xl",
                            rankColor(rank),
                          )}
                        >
                          # {rank + 1}
                        </span>
                      </div>
                      <p className="text-lg">
                        <a
                          href="https://www.linkedin.com/in/camille-abella-a99950176/"
                          target="_blank"
                          className="text-upgrade font-changa hover:underline"
                        >
                          Contactez-moi
                        </a>{" "}
                        pour <br /> soumettre votre score !
                      </p>
                    </>
                  ) : (
                    <div className="text-lg">
                      Vous n'êtes pas classé, <br /> votre score est trop
                      faible. <br /> essayez de nouveau !
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-lg group/helpers">
                {helpers
                  .filter((helper) => {
                    switch (game.reason) {
                      case "reputation":
                        return (
                          helper.includes("@reputation") ||
                          helper.includes("gagnez la partie")
                        );
                      case "mill":
                        return (
                          helper.includes("plus jouer") ||
                          helper.includes("défausse") ||
                          helper.includes("limitée") ||
                          helper.includes("gagnez la partie")
                        );
                      case "soft-lock":
                        return (
                          helper.includes("plus jouer") ||
                          helper.includes("progressivement") ||
                          helper.includes("cartes à jouer") ||
                          helper.includes("gagnez la partie")
                        );
                      default:
                        return false;
                    }
                  })
                  .map((helper, i) => (
                    <div
                      className={cn("transform hover:scale-110", {
                        "transition-transform duration-500 ease-in-out":
                          animation,
                      })}
                    >
                      <p
                        key={i}
                        className={cn("hover:text-foreground", {
                          [cn("animate-trigger", {
                            "delay-0": i === 0,
                            "delay-100": i === 1,
                            "delay-200": i === 2,
                            "delay-300": i === 3,
                            "delay-500": i === 4,
                            "delay-700": i === 5,
                          })]: animation,
                        })}
                        dangerouslySetInnerHTML={{
                          __html: formatText(helper),
                        }}
                      />
                    </div>
                  ))}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setVisible(false)}
                variant={game.isWon && rank !== -1 ? "opaque" : "default"}
              >
                Quitter
              </Button>
              <Button
                onClick={() => game.reset()}
                variant={
                  game.isWon ? (rank === -1 ? "opaque" : "default") : "cta"
                }
                size={game.isWon ? "default" : "cta"}
              >
                Recommencer
              </Button>
              {game.isWon && (
                <div className={cn({ "animate-bounce": animation })}>
                  <a
                    href="https://buymeacoffee.com/ghom"
                    target="_blank"
                    className={buttonVariants({
                      variant: "cta",
                      size: "cta",
                    })}
                  >
                    Buy me a coffee ☕️
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
