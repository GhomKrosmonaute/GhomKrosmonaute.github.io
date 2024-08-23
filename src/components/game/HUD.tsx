import React from "react";
import { useNavigate } from "react-router-dom";

import {
  useCardGame,
  MAX_ENERGY,
  MONEY_TO_REACH,
  MAX_REPUTATION,
  formatText,
  formatUpgradeText,
} from "@/hooks/useCardGame.ts";

import helpers from "@/data/helpers.json";

import Question from "@/assets/icons/question.svg";
import Discard from "@/assets/icons/discard.svg";
import Score from "@/assets/icons/score.svg";
import Money from "@/assets/icons/money.svg";
import Deck from "@/assets/icons/deck.svg";
import Day from "@/assets/icons/day.svg";

import { cn } from "@/utils.ts";

import { Gauge } from "@/components/game/Gauge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Scoreboard } from "@/components/game/Scoreboard.tsx";

export const HUD = () => {
  const game = useCardGame();
  const navigate = useNavigate();
  const [helpIndex, setHelpIndex] = React.useState<number>(0);
  const [helpOpened, openHelp] = React.useState<boolean>(false);

  return (
    <div className="w-[300px] ml-10 mt-4 space-y-2">
      <code>CardGame v1-stable [WIP]</code>
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
          <Score className="w-6" /> Score:{" "}
          <span className="text-upgrade font-changa">
            {game.score.toLocaleString("fr")} pts
          </span>
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
        {game.upgrades.map((upgrade, index) => (
          <div key={index} className="group/upgrade shrink-0">
            <img
              src={`images/upgrades/${upgrade.image}`}
              alt={upgrade.name}
              className={cn(
                "block object-cover w-16 h-16 aspect-square rounded-full pointer-events-auto cursor-pointer mx-auto ring-upgrade ring-4",
                {
                  // "": upgrade.state === "idle",
                  // "animate-appear": upgrade.state === "appear",
                  "animate-trigger": upgrade.state === "triggered",
                },
              )}
            />

            <div className="h-6 relative">
              <div className="relative">
                {upgrade.max !== Infinity && (
                  <Progress
                    className="absolute -translate-y-2 w-full"
                    barColor="bg-upgrade"
                    value={(upgrade.cumul / upgrade.max) * 100}
                  />
                )}
                <div className="absolute text-center font-changa left-0 -translate-y-3 aspect-square h-6 rounded-full bg-upgrade shadow shadow-black">
                  {upgrade.cumul}
                </div>
              </div>
            </div>

            <div className="hidden group-hover/upgrade:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-3">
              <h3 className="text-lg">
                {upgrade.name}{" "}
                <span className="text-upgrade font-changa">
                  {upgrade.cumul}{" "}
                  {upgrade.max !== Infinity ? `/ ${upgrade.max}` : ""}
                </span>
              </h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: formatText(
                    formatUpgradeText(upgrade.description, upgrade.cumul),
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
              <span className="text-upgrade">{game.day}</span> jours avec{" "}
              <span className="inline-block bg-money text-white px-1">
                {game.money}M$
              </span>{" "}
              et <span className="text-reputation">{game.reputation}</span>{" "}
              points de réputation ! <br />
              <span className="block text-4xl mt-5">
                Score:{" "}
                <span className="text-upgrade font-changa">
                  {game.score.toLocaleString("fr")} pts
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

      <Scoreboard />
    </div>
  );
};
