import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { formatText, rankColor, useCardGame } from "@/hooks/useCardGame.ts";
import { useNavigate } from "react-router-dom";

import scores from "@/data/scores.json";
import helpers from "@/data/helpers.json";

import { Stats } from "@/components/game/Stat.tsx";
import { Tilt } from "@/components/game/Tilt.tsx";
import { cn } from "@/utils.ts";

export const GameOver = () => {
  const navigate = useNavigate();
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
    <>
      {game.isGameOver && (
        <div className="absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center bg-background/90 z-50 pointer-events-auto">
          <div className="flex flex-col items-center justify-center gap-7">
            <Tilt className="flex flex-col" max={10} reverse>
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
                <div className="p-5 space-y-2 rounded-2xl bg-background shadow-md shadow-foreground/20">
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
                    <div className="transition-transform duration-500 ease-in-out transform hover:scale-110">
                      <p
                        key={i}
                        className={cn("animate-trigger hover:text-foreground", {
                          "delay-0": i === 0,
                          "delay-100": i === 1,
                          "delay-200": i === 2,
                          "delay-300": i === 3,
                          "delay-400": i === 4,
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
                onClick={() => navigate("/")}
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
                <div className="animate-bounce">
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
    </>
  );
};
