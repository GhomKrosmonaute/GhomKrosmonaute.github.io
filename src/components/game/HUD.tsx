import { Gauge } from "@/components/game/Gauge.tsx";

import {
  useCardGame,
  MAX_ENERGY,
  MONEY_TO_REACH,
  MAX_REPUTATION,
} from "@/hooks/useCardGame.ts";

import Discard from "@/assets/icons/discard.svg";
import Deck from "@/assets/icons/deck.svg";
import Money from "@/assets/icons/money.svg";
import Day from "@/assets/icons/day.svg";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/utils.ts";

export const HUD = () => {
  const day = useCardGame((state) => state.day);
  const reputation = useCardGame((state) => state.reputation);
  const energy = useCardGame((state) => state.energy);
  const money = useCardGame((state) => state.money);
  const activities = useCardGame((state) => state.activities);
  const deckLength = useCardGame((state) => state.deck.length);
  const discardLength = useCardGame((state) => state.discard.length);
  const won = useCardGame((state) => state.isGameOver && state.isWon);
  const lost = useCardGame((state) => state.isGameOver && !state.isWon);

  return (
    <div className="w-min ml-10 mt-4 space-y-2">
      <code>CardGame v0.5-beta [WIP]</code>
      <Gauge
        name="Energie / Points d'action"
        image="images/energy-background.png"
        value={energy}
        max={MAX_ENERGY}
      />
      <Gauge
        name="Réputation"
        image="images/reputation-background.png"
        value={reputation}
        max={MAX_REPUTATION}
        barColor="bg-pink-500"
      />

      <div className="*:flex *:items-center *:gap-2 space-y-2">
        <div>
          <Money className="w-6" /> Argent: {money}M$ / {MONEY_TO_REACH}M$
        </div>
        <div>
          <Day className="w-6" /> Jour: {day}
        </div>
        <div>
          <Deck className="w-6" /> Deck: {deckLength}
        </div>
        <div>
          <Discard className="w-6" /> Défausse: {discardLength}
        </div>
      </div>

      <div className="flex flex-wrap p-2 gap-4">
        {activities.map((activity, index) => (
          <div key={index} className="text-sm">
            <img
              src={`images/activities/${activity.image}`}
              alt={activity.name}
              className={cn(
                "object-cover w-16 h-16 rounded-full pointer-events-auto opacity-0",
                {
                  "opacity-100": activity.state === "idle",
                  "animate-appear": activity.state === "appear",
                  "animate-trigger": activity.state === "triggered",
                },
              )}
              title={`${activity.name} - ${activity.description}`}
            />
          </div>
        ))}
      </div>

      {(won || lost) && (
        <>
          {won && (
            <h1 className="text-4xl text-green-500">Vous avez gagné !</h1>
          )}
          {lost && <h1 className="text-4xl text-red-500">Vous avez perdu !</h1>}

          <Button
            onClick={() => {
              window.location.reload();
            }}
            variant="cta"
            size="cta"
          >
            Rejouer
          </Button>
        </>
      )}
    </div>
  );
};
