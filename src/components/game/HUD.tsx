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

export const HUD = () => {
  const game = useCardGame();
  const navigate = useNavigate();
  const [helpIndex, setHelpIndex] = React.useState<number>(0);
  const [helpOpened, openHelp] = React.useState<boolean>(false);

  return (
    <div className="w-min ml-10 mt-4 space-y-2">
      <code>CardGame v0.5-beta [WIP]</code>
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

      <div className="*:flex *:items-center *:gap-2 space-y-2">
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

      <div className="flex flex-wrap p-2 gap-4">
        {game.activities.map((activity, index) => (
          <div key={index} className="text-sm">
            <img
              src={`images/activities/${activity.image}`}
              alt={activity.name}
              className={cn(
                "object-cover w-16 h-16 rounded-full pointer-events-auto opacity-0 cursor-pointer",
                {
                  "opacity-100": activity.state === "idle",
                  "animate-appear": activity.state === "appear",
                  "opacity-100 animate-trigger": activity.state === "triggered",
                },
              )}
              title={`${activity.name} - ${activity.description}`}
            />
          </div>
        ))}
      </div>

      {game.isGameOver && (
        <div className="absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center gap-4 bg-background/90 z-50 pointer-events-auto">
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
                  "missing-resource":
                    "Vous n'avez plus assez de resource pour jouer vos cartes...",
                }[game.reason]
              }
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
        <Question
          className="h-6 cursor-pointer pointer-events-auto"
          title={helpers[helpIndex]}
          onClick={() => openHelp(!helpOpened)}
          onMouseEnter={() =>
            setHelpIndex(Math.floor(Math.random() * helpers.length))
          }
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
  );
};
