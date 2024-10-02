import React from "react"

import { cn } from "@/utils.ts"
import { translations } from "@/game-settings.ts"
import {
  ADVANTAGE_THRESHOLD,
  MAX_REPUTATION,
  MONEY_TO_REACH,
} from "@/game-constants.ts"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"

import Day from "@/assets/icons/game/day.svg"
import Infinity from "@/assets/icons/game/infinity.svg"
import Money from "@/assets/icons/game/money.svg"
import Score from "@/assets/icons/game/score.svg"
import Settings from "@/assets/icons/settings.svg"
import Sprint from "@/assets/icons/game/sprint.svg"
import Energy from "@/assets/icons/game/energy.svg"
import Reputation from "@/assets/icons/game/reputation.svg"
import Inflation from "@/assets/icons/game/inflation.svg"
import Cross from "@/assets/icons/cross.svg"

import { Separator } from "@/components/ui/separator.tsx"
import { GameGauge } from "@/components/game/GameGauge.tsx"
import { MiniatureImage } from "@/components/game/GameMiniature.tsx"

import { Money as Dollars, Tag } from "@/components/game/Texts.tsx"
import { Input } from "@/components/ui/input.tsx"
import { CollectionCounter } from "@/components/game/CollectionCounter.tsx"
import {
  extractTextFromReactNode,
  getRevivedDeck,
  tags,
} from "@/game-safe-utils.tsx"
import { HelpPopoverTrigger } from "@/components/game/HelpPopoverTrigger.tsx"
import { MinimalistGameCardDetail } from "@/components/game/GameDetail.tsx"
import { compactGameCardInfo } from "@/game-typings.ts"

export const Stat = ({
  name,
  Icon,
  value,
  ...props
}: {
  name: string
  Icon: React.FunctionComponent<React.ComponentProps<"div">>
  value?: React.ReactNode
} & React.ComponentProps<"div">) => {
  return (
    <div {...props} className={cn("flex items-center gap-1", props.className)}>
      <Icon className="h-full aspect-square w-fit self-center justify-self-start" />
      <span className="inline-flex items-baseline whitespace-nowrap gap-1">
        <span>
          {name}
          {value != void 0 ? " :" : ""}
        </span>{" "}
        {value}
      </span>
    </div>
  )
}

export const Stats = (props: { className?: string; forHUD?: boolean }) => {
  const game = useCardGame()

  const settings = useSettings((state) => ({
    shadows: state.quality.shadows,
    animation: state.quality.animations,
    transparency: state.quality.transparency,
  }))

  const [search, setSearch] = React.useState("")

  return (
    <>
      {props.forHUD && (
        <>
          <div className="grid grid-cols-3 w-full gap-x-2 *:grid *:grid-cols-subgrid *:col-span-3 *:*:col-span-2">
            <div id="energy">
              <GameGauge
                title="Energie"
                value={game.energy}
                max={game.energyMax}
                color="bg-energy"
              />
              <div className="last:col-span-1 flex items-center">
                <Stat Icon={Energy} name="Energie" className="h-5" />
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
                <Stat Icon={Reputation} name="Réputation" className="h-5" />
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
          <div id="deck" className="space-y-2">
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher dans le deck..."
                className="flex-grow"
              />
              {search.length > 0 && (
                <Cross
                  onClick={() => setSearch("")}
                  className="cursor-pointer w-3 h-3 absolute top-1/2 right-4 -translate-y-1/2"
                />
              )}
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex justify-end col-span-2">
                {getRevivedDeck(game)
                  .filter(
                    (c) =>
                      !search ||
                      c.type.includes(search.toLowerCase()) ||
                      c.name.toLowerCase().includes(search.toLowerCase()) ||
                      c.effect.tags.some(
                        (t) =>
                          t.includes(search.toLowerCase()) ||
                          tags[t]?.name
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      ) ||
                      (c.type === "action" &&
                        c.families.some((f) =>
                          f.toLowerCase().includes(search.toLowerCase()),
                        )) ||
                      extractTextFromReactNode(c.effect.description)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .toSorted((a, b) => {
                    if (a.type === b.type)
                      return a.effect.tags.includes("upgrade") ? 1 : -1
                    return b.type > a.type ? 1 : -1
                  })
                  .map((c, i) => (
                    <HelpPopoverTrigger
                      popover={<MinimalistGameCardDetail card={c} />}
                      key={i}
                    >
                      <div
                        className="h-6 hover:shrink-0 pointer-events-auto cursor-help"
                        onClick={() => {
                          game.setDetail(compactGameCardInfo(c))
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          game.setDetail(compactGameCardInfo(c))
                        }}
                      >
                        <MiniatureImage
                          item={c}
                          className={cn(
                            "ring-0 rounded-none object-contain border-b-2",
                            {
                              "border-action": c.type === "action",
                              "border-support": c.type === "support",
                              "border-upgrade":
                                c.effect.tags.includes("upgrade"),
                            },
                          )}
                        />
                      </div>
                    </HelpPopoverTrigger>
                  ))}
              </div>
              <CollectionCounter collection="deck" />
            </div>
          </div>
          <Separator />
        </>
      )}
      <div
        className={cn(
          "flex flex-col gap-y-2 items-start *:flex *:items-center *:gap-2 *:h-20 text-6xl text-left rounded-xl p-2",
          settings.transparency ? "bg-card/60" : "bg-card",
          props.className,
        )}
      >
        <Stat
          id="money"
          Icon={Money}
          name="Dollars"
          value={
            <span>
              <Dollars M$={game.money} />{" "}
              {props.forHUD && (
                <>
                  sur <Dollars M$={MONEY_TO_REACH} />
                </>
              )}
            </span>
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
        {game.inflation > 0 && (
          <Stat
            Icon={Inflation}
            name="Inflation"
            value={
              <span className="text-inflation font-changa">
                -{Math.floor(game.inflation / ADVANTAGE_THRESHOLD)}{" "}
                <Tag name="level" plural={game.inflation >= 4} />
              </span>
            }
          />
        )}
        {!props.forHUD && (
          <Stat Icon={Day} name="Jour" value={Math.floor(game.day)} />
        )}
        <Stat
          Icon={Settings}
          name="Mode"
          value={
            <span className="capitalize">
              {translations[game.difficulty]}
              {game.debug && " [debug]"}
            </span>
          }
        />
        {game.infinityMode && (
          <Stat Icon={Infinity} name="Mode infini" value="Activé" />
        )}
      </div>
    </>
  )
}
