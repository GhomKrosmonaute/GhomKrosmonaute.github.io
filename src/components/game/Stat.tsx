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

import { MONEY_TO_REACH } from "@/game-constants.ts";
import { settings, translations } from "@/game-settings.ts";

export const Stat = (props: {
  name: string;
  icon: React.FunctionComponent<React.ComponentProps<"div">>;
  value: React.ReactNode;
}) => {
  return (
    <div>
      <props.icon className="h-full self-center" />
      <span className="inline-flex items-baseline whitespace-nowrap gap-2">
        <span>{props.name} :</span> {props.value}
      </span>
    </div>
  );
};

export const Stats = (props: { className?: string; verbose?: boolean }) => {
  const game = useCardGame((state) => ({
    money: state.money,
    score: state.score,
    day: state.day,
    deck: state.deck,
    discard: state.discard,
    infinity: state.infinityMode,
  }));

  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-start *:flex *:items-center *:gap-2 *:h-20 text-6xl text-left",
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
                `${game.money}M$ ${props.verbose ? `sur ${MONEY_TO_REACH}M$` : ""}`,
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
      <Stat icon={Day} name="Jour" value={game.day} />
      {props.verbose && (
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
  );
};
