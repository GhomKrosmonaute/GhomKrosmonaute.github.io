import React from "react";

import { formatText } from "@/game-utils.ts";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { cn } from "@/utils.ts";

import Day from "@/assets/icons/game/day.svg";
import Deck from "@/assets/icons/game/deck.svg";
import Discard from "@/assets/icons/game/discard.svg";
import Infinity from "@/assets/icons/game/infinity.svg";
import Money from "@/assets/icons/game/money.svg";
import Score from "@/assets/icons/game/score.svg";
import Settings from "@/assets/icons/settings.svg";

import { Gauge } from "@/components/game/Gauge.tsx";
import {
  MAX_ENERGY,
  MAX_REPUTATION,
  MONEY_TO_REACH,
} from "@/game-constants.ts";
import { settings, translations } from "@/game-settings.ts";
import { MiniatureImage } from "@/components/game/GameMiniature.tsx";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx";

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
              color="bg-reputation"
            />
            <Gauge
              title="Journée"
              display={(f) => (Math.floor(f * 24) % 24) + "h"}
              value={
                game.dayFull === null ? game.day % 1 : game.dayFull ? 1 : 0
              }
              max={1}
              color="bg-day"
              increaseOnly
            />
            <Gauge
              title="Sprint"
              display={(f) => Math.floor(f * 7) + "j"}
              value={Math.floor(game.day % 7)}
              max={7}
              color="bg-upgrade"
              increaseOnly
            />
          </div>
          <div className="flex flex-col items-start gap-y-1 *:gap-2 *:h-6 *:flex *:items-center">
            <span className="capitalize">énergie</span>
            <span>Réputation</span>
            <Stat icon={Day} name="Jour" value={Math.floor(game.day)} />
            <Stat icon={Day} name="Sprint" value={Math.floor(game.day / 7)} />
          </div>
        </div>
      )}
      {props.forHUD && (
        <div className="grid grid-cols-3 w-full gap-x-2">
          <div className="col-span-2 space-y-1">
            {(["deck", "discard"] as const).map((collection) => (
              <div key={collection} className="flex justify-end">
                {game[collection]
                  .toSorted((a, b) => {
                    return b.type > a.type ? 1 : -1;
                  })
                  .map((c, i) => (
                    <HoverCard key={i} openDelay={0} closeDelay={0}>
                      <HoverCardTrigger asChild>
                        <div className="h-6 hover:shrink-0 pointer-events-auto">
                          <MiniatureImage
                            item={c}
                            className="ring-0 rounded-none"
                          />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="pointer-events-none"
                        dangerouslySetInnerHTML={{
                          __html: `<h2>${c.name}</h2><br />${c.effect.description}`,
                        }}
                      />
                    </HoverCard>
                  ))}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start gap-y-1 *:gap-2 *:h-6 *:flex *:items-center">
            <Stat icon={Deck} name="Pioche" value={game.deck.length} />
            <Stat icon={Discard} name="Défausse" value={game.discard.length} />
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
