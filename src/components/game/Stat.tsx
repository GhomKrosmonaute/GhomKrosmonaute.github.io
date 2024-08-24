import React from "react";

import Money from "@/assets/icons/money.svg";
import { cn } from "@/utils.ts";
import {
  formatText,
  MONEY_TO_REACH,
  useCardGame,
} from "@/hooks/useCardGame.ts";
import Score from "@/assets/icons/score.svg";
import Day from "@/assets/icons/day.svg";
import Deck from "@/assets/icons/deck.svg";
import Discard from "@/assets/icons/discard.svg";

export const Stat = (props: {
  name: string;
  icon: React.FunctionComponent<React.ComponentProps<"div">>;
  value: React.ReactNode;
}) => {
  return (
    <div>
      <props.icon className="h-full self-center" />
      <span className="inline-block whitespace-nowrap">
        <span>{props.name}</span>: {props.value}
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
  }));

  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-start *:flex *:items-baseline *:gap-2 *:h-20 text-6xl text-left",
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
    </div>
  );
};
