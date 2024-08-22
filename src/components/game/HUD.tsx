import React from "react";
import { useNavigate } from "react-router-dom";

import {
  useCardGame,
  MAX_ENERGY,
  MONEY_TO_REACH,
  MAX_REPUTATION,
  formatText,
} from "@/hooks/useCardGame.ts";

import helpers from "@/data/helpers.json";

import Question from "@/assets/icons/question.svg";
import Discard from "@/assets/icons/discard.svg";
import Deck from "@/assets/icons/deck.svg";
import Money from "@/assets/icons/money.svg";
import Day from "@/assets/icons/day.svg";

import { Gauge } from "@/components/game/Gauge.tsx";
import { Button } from "@/components/ui/button.tsx";

import { cn } from "@/utils.ts";
import { Progress } from "@/components/ui/progress.tsx";

export const HUD = () => {
  const game = useCardGame();
  const navigate = useNavigate();
  const [helpIndex, setHelpIndex] = React.useState<number>(0);
  const [helpOpened, openHelp] = React.useState<boolean>(false);

  return (
    <div className="w-[300px] ml-10 mt-4 space-y-2">
      <code>CardGame v0.6-beta [WIP]</code>
      <Gauge
        name="Energie / Points d'action"
        image="images/energy-background.png"
        value={game.energy}
        max={MAX_ENERGY}
      />
      <Gauge
        name="Réputation"
        image="images/reputation-background.png"
        value={game.reputation}
        max={MAX_REPUTATION}
        barColor="bg-pink-500"
      />

      <div className="*:flex *:items-center *:gap-2 *:whitespace-nowrap space-y-2">
        <div>
          <Money className="w-6" />{" "}
          <span
            dangerouslySetInnerHTML={{
              __html: formatText(
                `Argent: ${game.money}M$ sur ${MONEY_TO_REACH}M$`,
              ),
            }}
          />
        </div>
        <div>
          <Day className="w-6" /> Jour: {game.day}
        </div>
        <div>
          <Deck className="w-6" /> Deck: {game.deck.length}
        </div>
        <div>
          <Discard className="w-6" /> Défausse: {game.discard.length}
        </div>
      </div>

      <div className="grid grid-cols-3 p-2 gap-5 relative shrink-0 w-max">
        {game.activities.map((activity, index) => (
          <div key={index} className="group/activity shrink-0">
            <img
              src={`images/activities/${activity.image}`}
              alt={activity.name}
              className={cn(
                "block object-cover w-16 h-16 aspect-square rounded-full pointer-events-auto opacity-0 cursor-pointer mx-auto ring-activity ring-4",
                {
                  "opacity-100": activity.state === "idle",
                  "animate-appear": activity.state === "appear",
                  "opacity-100 animate-trigger": activity.state === "triggered",
                },
              )}
            />

            <div className="h-6 relative">
              <div className="relative">
                {activity.max && (
                  <Progress
                    className="absolute -translate-y-2 w-full"
                    barColor="bg-activity"
                    value={(activity.cumul / activity.max) * 100}
                  />
                )}
                <div className="absolute text-center font-changa left-0 -translate-y-3 aspect-square h-6 rounded-full bg-activity shadow shadow-black">
                  {activity.cumul}
                </div>
              </div>
            </div>

            <div className="hidden group-hover/activity:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <h3 className="text-lg">
                {activity.name}{" "}
                <span className="text-activity font-changa">
                  {activity.cumul} {activity.max ? `/ ${activity.max}` : ""}
                </span>
              </h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: formatText(
                    activity.description
                      .replace(
                        /@cumul/g,
                        `<span style="color: #f59e0b">${activity.cumul}</span>`,
                      )
                      .replace(/@s/g, activity.cumul > 1 ? "s" : ""),
                  ),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {game.isGameOver && (
        <div className="absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center gap-7 bg-background/90 z-50 pointer-events-auto">
          <div className="*:text-6xl *:whitespace-nowrap">
            {game.isWon && (
              <h1 className="text-green-500">Vous avez gagné !</h1>
            )}
            {!game.isWon && <h1 className="text-red-500">Vous avez perdu !</h1>}
          </div>

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

          {game.isWon && (
            <p className="text-center text-2xl">
              Vous avez gagné en{" "}
              <span className="text-activity">{game.day}</span> jours avec{" "}
              <span className="inline-block bg-money text-white px-1">
                {game.money}M$
              </span>{" "}
              et <span className="text-reputation">{game.reputation}</span>{" "}
              points de réputation ! <br />
              <span className="block text-4xl mt-5">
                Score:{" "}
                <span className="text-activity font-changa">
                  {
                    // Plus la partie dure longtemps, plus le score diminue.
                    // Moins tu perds de réputation, plus le score est élevé.
                    // Plus tu as d'argent en fin de partie, plus le score est élevé.
                    // Chaque cumul d'activité augmente le score.
                    // L'énergie restante augmente légèrement le score.
                    // Calcul :
                    Math.max(
                      0,
                      game.reputation * 50 +
                        game.money * 100 +
                        game.activities.reduce(
                          (acc, activity) => acc + activity.cumul,
                          0,
                        ) *
                          10 +
                        game.energy * 10 -
                        game.day * 10,
                    ).toLocaleString()
                  }{" "}
                  pts
                </span>
              </span>
            </p>
          )}

          <div className="flex gap-4">
            <Button onClick={() => navigate("/")}>Quitter</Button>
            <Button onClick={() => game.reset()} variant="cta" size="cta">
              Recommencer
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center justify-start">
        <Button
          onClick={() => {
            game.reset();
          }}
          variant="default"
          size="cta"
        >
          Recommencer
        </Button>

        <div
          className="flex items-center gap-2 pointer-events-auto"
          onMouseEnter={() => setHelpIndex((helpIndex + 1) % helpers.length)}
        >
          <Question
            className="h-6 cursor-pointer"
            onClick={() => openHelp(!helpOpened)}
          />
          {helpOpened && (
            <span
              className="whitespace-nowrap"
              dangerouslySetInnerHTML={{
                __html: formatText(helpers[helpIndex]),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
