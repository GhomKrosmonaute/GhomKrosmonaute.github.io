import React from "react";

import { cn } from "@/utils.ts";
import { formatText, useCardGame } from "@/hooks/useCardGame.ts";

import Day from "@/assets/icons/game/day.svg";
import Deck from "@/assets/icons/game/deck.svg";
import Money from "@/assets/icons/game/money.svg";
import Score from "@/assets/icons/game/score.svg";
import Discard from "@/assets/icons/game/discard.svg";
import Settings from "@/assets/icons/settings.svg";
import Infinity from "@/assets/icons/game/infinity.svg";

import {
  MAX_ENERGY,
  MAX_REPUTATION,
  MONEY_TO_REACH,
} from "@/game-constants.ts";
import { settings, translations } from "@/game-settings.ts";
import { Gauge } from "@/components/game/Gauge.tsx";

export const Stat = (props: {
  name: string;
  icon: React.FunctionComponent<React.ComponentProps<"div">>;
  value: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={props.className}>
      <props.icon className="h-full self-center" />
      <span className="inline-flex items-baseline whitespace-nowrap gap-2">
        <span>{props.name} :</span> {props.value}
      </span>
    </div>
  );
};

export const Stats = (props: { className?: string; forHUD?: boolean }) => {
  const game = useCardGame((state) => ({
    money: state.money,
    score: state.score,
    energy: state.energy,
    reputation: state.reputation,
    deck: state.deck,
    discard: state.discard,
    infinity: state.infinityMode,
    day: state.day,
    dayFull: state.dayFull,
  }));

  return (
    <>
      {props.forHUD && (
        <div className="grid grid-cols-3 w-full gap-x-2">
          <div className="col-span-2">
            <Gauge
              title="Energie"
              value={game.energy}
              max={MAX_ENERGY}
              color="bg-energy"
            />
            <Gauge
              title="Réputation"
              value={game.reputation}
              max={MAX_REPUTATION}
              color="bg-pink-500"
            />
            <Gauge
              title="Journée"
              display={(fraction) => `${Math.floor(fraction * 100)}%`}
              value={game.dayFull ? 10 : Math.floor((game.day % 1) * 10)}
              max={10}
              color="bg-green-500"
              increaseOnly
            />
            <Gauge
              title="Sprint"
              value={Math.floor(game.day % 7)}
              max={7}
              color="bg-upgrade"
              increaseOnly
            />
          </div>
          <div className="flex flex-col items-start gap-y-1 *:gap-2 *:h-6 *:flex *:items-center">
            <span>Energie</span>
            <span>Réputation</span>
            <Stat icon={Day} name="Jour" value={Math.floor(game.day)} />
            <Stat icon={Day} name="Sprint" value={Math.floor(game.day / 7)} />
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex flex-col gap-y-2 items-start *:flex *:items-center *:gap-2 *:h-20 text-6xl text-left",
          props.className,
        )}
      >
        <Stat
          icon={Money}
          name="Dollars"
          value={
            <span
              dangerouslySetInnerHTML={{
                __html: formatText(
                  `${game.money}M$ ${props.forHUD ? `sur ${MONEY_TO_REACH}M$` : ""}`,
                ),
              }}
            />
          }
        />
        <Stat
          icon={Score}
          name="Score"
          value={
            <span className="text-upgrade font-changa">
              {game.score.toLocaleString("fr")} pts
            </span>
          }
        />
        {!props.forHUD && (
          <Stat icon={Day} name="Jour" value={Math.floor(game.day)} />
        )}
        {props.forHUD && (
          <>
            <Stat icon={Deck} name="Deck" value={game.deck.length} />
            <Stat icon={Discard} name="Défausse" value={game.discard.length} />
          </>
        )}
        <Stat
          icon={Settings}
          name="Mode"
          value={
            <span className="capitalize">
              {translations[settings.difficulty]}
            </span>
          }
        />
        {game.infinity && (
          <Stat icon={Infinity} name="Mode infini" value="Activé" />
        )}
      </div>
    </>
  );
};
