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
import Sprint from "@/assets/icons/game/sprint.svg";
import Draw from "@/assets/icons/game/draw.svg";

import { GameGauge } from "@/components/game/GameGauge.tsx";
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
import { Separator } from "@/components/ui/separator.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const Stat = ({
  name,
  Icon,
  value,
  ...props
}: {
  name: string;
  Icon: React.FunctionComponent<React.ComponentProps<"div">>;
  value: React.ReactNode;
} & React.ComponentProps<"div">) => {
  return (
    <div {...props} className={cn("flex items-center gap-1", props.className)}>
      <Icon className="h-full aspect-square w-fit self-center justify-self-start" />
      <span className="inline-flex items-baseline whitespace-nowrap gap-1">
        <span>{name} :</span> {value}
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
    draw: state.draw,
    hand: state.hand,
    discard: state.discard,
    infinity: state.infinityMode,
    day: state.day,
    dayFull: state.dayFull,
  }));

  const quality = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.animations,
    transparency: state.transparency,
  }));

  return (
    <>
      {props.forHUD && (
        <>
          <div className="grid grid-cols-3 w-full gap-x-2 *:grid *:grid-cols-subgrid *:col-span-3 *:*:col-span-2">
            <div id="energy">
              <GameGauge
                title="Energie"
                value={game.energy}
                max={MAX_ENERGY}
                color="bg-energy"
              />
              <div className="capitalize last:col-span-1 flex items-center">
                énergie
              </div>
            </div>
            <div id="reputation">
              <GameGauge
                title="Réputation"
                value={game.reputation}
                max={MAX_REPUTATION}
                color="bg-reputation"
              />
              <div className="last:col-span-1 flex items-center">
                Réputation
              </div>
            </div>
            <div id="day">
              <GameGauge
                title="Journée"
                display={(f) => (Math.floor(f * 24) % 24) + "h"}
                value={
                  game.dayFull === null ? game.day % 1 : game.dayFull ? 1 : 0
                }
                max={1}
                color="bg-day"
                increaseOnly
              />
              <div className="last:col-span-1 flex items-center">
                <Stat
                  Icon={Day}
                  name="Jour"
                  value={Math.floor(game.day)}
                  className="h-5"
                />
              </div>
            </div>
            <div id="sprint">
              <GameGauge
                title="Sprint"
                display={(f) => Math.floor(f * 7) + "j"}
                value={Math.floor(game.day % 7)}
                max={7}
                color="bg-upgrade"
                increaseOnly
              />
              <div className="last:col-span-1 flex items-center">
                <Stat
                  Icon={Sprint}
                  name="Sprint"
                  value={Math.floor(game.day / 7)}
                  className="h-5"
                />
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-3 w-full gap-x-2" id="deck">
            {(["deck", "draw", "discard"] as const).map((collection) => (
              <div
                className="grid grid-cols-subgrid col-span-3 space-y-1"
                key={collection}
              >
                <div className="flex justify-end col-span-2">
                  {(collection === "deck"
                    ? [...game.draw, ...game.discard, ...game.hand]
                    : game[collection]
                  )
                    .toSorted((a, b) => {
                      if (a.type === b.type) return a.effect.upgrade ? 1 : -1;
                      return b.type > a.type ? 1 : -1;
                    })
                    .map((c, i) => (
                      <HoverCard key={i} openDelay={0} closeDelay={0}>
                        <HoverCardTrigger asChild>
                          <div className="h-6 hover:shrink-0 pointer-events-auto">
                            <MiniatureImage
                              item={c}
                              className={cn(
                                "ring-0 rounded-none object-contain border-b-2",
                                {
                                  "border-action": c.type === "action",
                                  "border-support": c.type === "support",
                                  "border-upgrade": c.effect.upgrade,
                                },
                              )}
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
                <Stat
                  Icon={
                    collection === "deck"
                      ? Deck
                      : collection === "draw"
                        ? Draw
                        : Discard
                  }
                  name={
                    collection === "deck"
                      ? "Deck"
                      : collection === "draw"
                        ? "Pioche"
                        : "Défausse"
                  }
                  value={
                    collection === "deck"
                      ? game.draw.length +
                        game.discard.length +
                        game.hand.length
                      : game[collection].length
                  }
                  className="h-5"
                />
              </div>
            ))}
          </div>
          <Separator />
        </>
      )}
      <div
        className={cn(
          "flex flex-col gap-y-2 items-start *:flex *:items-center *:gap-2 *:h-20 text-6xl text-left rounded-xl p-2",
          quality.transparency ? "bg-card/60" : "bg-card",
          props.className,
        )}
      >
        <Stat
          id="money"
          Icon={Money}
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
          Icon={Score}
          name="Score"
          value={
            <span className="text-upgrade font-changa">
              {game.score.toLocaleString("fr")} pts
            </span>
          }
        />
        {!props.forHUD && (
          <Stat Icon={Day} name="Jour" value={Math.floor(game.day)} />
        )}
        <Stat
          Icon={Settings}
          name="Mode"
          value={
            <span className="capitalize">
              {translations[settings.difficulty]}
            </span>
          }
        />
        {game.infinity && (
          <Stat Icon={Infinity} name="Mode infini" value="Activé" />
        )}
      </div>
    </>
  );
};
