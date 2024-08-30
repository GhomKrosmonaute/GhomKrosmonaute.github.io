import React from "react";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

import { settings } from "@/game-settings.ts";
import { formatText, rankColor } from "@/game-utils.ts";

import scores from "@/data/scores.json";
import helpers from "@/data/helpers.json";

import { Button } from "@/components/ui/button.tsx";
import { Stats } from "@/components/game/GameStats.tsx";
import { Tilt } from "@/components/game/Tilt.tsx";
import { cn } from "@/utils.ts";

import { confettiFireworks } from "@/components/ui/confetti";
import { bank } from "@/sound.ts";

export const GameOver = (props: { show: boolean }) => {
  const quality = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.animations,
    transparency: state.transparency,
  }));

  const [setVisible, toggleSettings] = useGlobalState((state) => [
    state.setCardGameVisibility,
    state.toggleSettings,
  ]);

  const game = useCardGame((state) => ({
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    reason: state.reason,
    score: state.score,
    reset: state.reset,
    continue: state.enableInfinityMode,
  }));

  const rank = scores
    .sort((a, b) => b.score - a.score)
    .findIndex(({ score }) => game.score >= score);

  React.useEffect(() => {
    if (game.isGameOver && game.isWon && quality.animation && props.show) {
      bank.victory.play();
      confettiFireworks();
    }
  }, [game.isGameOver, game.isWon, quality.animation, props.show]);

  return (
    <div className={props.show ? "block" : "hidden"}>
      {game.isGameOver && (
        <div
          className={cn(
            "absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center z-30 pointer-events-auto",
            {
              "bg-background/90": quality.transparency,
              "bg-background": !quality.transparency,
            },
          )}
        >
          <div className="flex flex-col items-center justify-center gap-10">
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
                  className={cn("p-5 space-y-2 rounded-2xl bg-card shadow-md", {
                    "shadow-foreground/20":
                      quality.shadows && quality.transparency,

                    "bg-card/50": quality.transparency,
                    "bg-card": !quality.transparency,
                  })}
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
                      <p className="text-2xl whitespace-nowrap">
                        <a
                          href="https://www.linkedin.com/in/camille-abella-a99950176/"
                          target="_blank"
                          className="text-primary font-changa hover:underline"
                        >
                          Contactez-moi
                        </a>{" "}
                        pour <br /> soumettre votre score !
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl whitespace-nowrap">
                      Vous n'êtes pas classé, <br /> votre score est trop
                      faible. <br /> Essayez{" "}
                      {settings.difficulty === "noob" ||
                      settings.difficulty === "easy" ? (
                        <>
                          une difficulté plus élevée ! <br />
                          <span
                            className="text-primary font-changa cursor-pointer hover:underline"
                            onClick={toggleSettings}
                          >
                            Paramètres de difficulté
                          </span>
                        </>
                      ) : (
                        "de nouveau !"
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-2xl group/helpers">
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
                      key={i}
                      className={cn("transform hover:scale-110", {
                        "transition-transform duration-500 ease-in-out":
                          quality.animation,
                      })}
                    >
                      <p
                        className={cn("hover:text-foreground", {
                          [cn("animate-trigger", {
                            "delay-0": i === 0,
                            "delay-100": i === 1,
                            "delay-200": i === 2,
                            "delay-300": i === 3,
                            "delay-500": i === 4,
                            "delay-700": i === 5,
                          })]: quality.animation,
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
              <Button onClick={() => setVisible(false)} variant={"default"}>
                Quitter
              </Button>
              <Button
                onClick={() => game.reset()}
                variant={game.isWon ? "default" : "cta"}
                size={game.isWon ? "default" : "cta"}
              >
                {!game.isWon ? "Recommencer" : "Nouvelle partie"}
              </Button>
              {game.isWon && (
                <Button
                  onClick={() => game.continue()}
                  variant="cta"
                  size="cta"
                >
                  Mode infini
                </Button>
              )}
            </div>

            {game.isWon && (
              <div
                className={cn({
                  "animate-bounce w-full hover:duration-500": quality.animation,
                })}
              >
                <a
                  href="https://buymeacoffee.com/ghom"
                  target="_blank"
                  className={cn(
                    "text-xl block mx-auto w-[300px] text-center border-2 border-upgrade rounded-xl py-3",
                    {
                      "transition-colors duration-500 ease-in-out":
                        quality.animation,
                      "bg-card/50 hover:bg-card": quality.transparency,
                      "bg-card": !quality.transparency,
                    },
                  )}
                >
                  Buy me a coffee ☕️
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
