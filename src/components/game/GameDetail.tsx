import React from "react"

import { ArrowRight, Link } from "lucide-react"

import QuoteLeft from "@/assets/icons/quote-left.svg"
import QuoteRight from "@/assets/icons/quote-right.svg"

import {
  tags,
  getRarityName,
  resolveSubTypes,
  calculateRarityAdvantage,
  isActionCardInfo,
} from "@/game-safe-utils.tsx"
import {
  getGlobalCardModifierLogs,
  reviveCard,
  reviveUpgrade,
} from "@/game-utils.ts"
import {
  ActionCardInfo,
  compactGameCardInfo,
  GameCardInfo,
  isGameCardCompact,
  Upgrade,
} from "@/game-typings.ts"
import { GAME_CARD_SIZE, RARITIES } from "@/game-constants.ts"
import { cn } from "@/utils.ts"

import { GameState, useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"

import { Card } from "@/components/Card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { GameCard } from "@/components/game/GameCard.tsx"
import { GameCost } from "@/components/game/GameCost.tsx"
import { GameMiniature } from "@/components/game/GameMiniature.tsx"
import { Family, Tag, RarityBadge } from "@/components/game/Texts.tsx"
import { GameCardSubType } from "@/components/game/GameCardSubType.tsx"
import { BentoCard } from "@/components/BentoCard.tsx"
import events from "@/data/events.tsx"
import { EventIcon } from "@/components/game/EventText.tsx"
import ScrollItem from "@/components/ScrollItem.tsx"

export const GameDetail = (props: { show: boolean }) => {
  const settings = useSettings()
  const getState = useCardGame((state) => () => state)
  const [detail, setDetail] = useCardGame((state) => [
    state.detail,
    state.setDetail,
  ])

  return (
    <div
      className={cn(
        "absolute inset-0 z-30",
        "flex items-center justify-center pointer-events-none",
        {
          "transition-opacity duration-500 ease-in-out":
            settings.quality.animations,
          "opacity-0 bg-background/80": settings.quality.transparency,
          hidden: !settings.quality.transparency,
          "opacity-100 flex pointer-events-auto": detail && props.show,
        },
      )}
    >
      <div
        onClick={() => setDetail(null)}
        className={cn(
          "absolute inset-0",
          detail && props.show ? "pointer-events-auto" : "pointer-events-none",
        )}
      />
      {detail && (
        <Card className="space-y-4 z-30 w-fit h-fit flex flex-col items-center">
          {typeof detail === "string" ? (
            <GameStackDetail stack={detail} />
          ) : isGameCardCompact(detail) ? (
            <GameCardDetail card={reviveCard(detail, getState())} />
          ) : (
            <GameUpgradeDetail upgrade={reviveUpgrade(detail)} />
          )}
        </Card>
      )}
    </div>
  )
}

export const GameStackDetail = (props: {
  stack: keyof GameState & `revived${string}`
}) => {
  const scrollBox = React.useRef<HTMLDivElement>(null)

  const cards = useCardGame((state) => state[props.stack])

  const name = {
    revivedDraw: "Pioche",
    revivedDiscard: "Défausse",
    revivedHand: "Main",
  }[props.stack]

  return (
    <>
      <h1 className="text-3xl">Pile de {name}</h1>
      <div className="flex ">
        <BentoCard>
          <div
            ref={scrollBox}
            className="grid grid-cols-4 gap-x-10 px-10 max-w-[1000px] max-h-[600px] overflow-y-scroll"
          >
            {cards.map((card) => (
              <ScrollItem
                key={card.name}
                scrollBox={scrollBox}
                child={<GameCard card={card} isStack={props.stack} />}
                placeholder={<div className={GAME_CARD_SIZE} />}
              />
            ))}
          </div>
        </BentoCard>
      </div>
    </>
  )
}

export const GameCardDetail = (props: { card: GameCardInfo<true> }) => {
  const getState = useCardGame((state) => () => state)

  const colRef = React.useRef<HTMLDivElement>(null)

  const [sortBy, setSortBy] = React.useState<
    "tri par ordre d'exécution" | "tri par raison" | "tri par type"
  >("tri par ordre d'exécution")

  const modifiers = getGlobalCardModifierLogs(
    getState(),
    compactGameCardInfo(props.card),
  )
  const rarityName = getRarityName(props.card.rarity, true)
  const cardSubTypes = resolveSubTypes(props.card.effect)

  const colBeGrid = React.useMemo(() => {
    return (colRef.current?.children.length ?? 0) > 3
  }, [colRef])

  return (
    <>
      <h1 className="text-3xl">A propos de "{props.card.name}"</h1>
      {!props.card.effect.tags.includes("token") && (
        <div className="flex">
          {Object.entries(RARITIES)
            .sort(([, a], [, b]) => a - b)
            .map(([rarity, level]) => {
              const state = getState()
              const advantage = calculateRarityAdvantage(level, state)

              return (
                <div key={rarity}>
                  <GameCard
                    withoutDetail
                    card={reviveCard(
                      {
                        name: props.card.name,
                        state:
                          rarityName === rarity && modifiers.length === 0
                            ? "highlighted"
                            : "idle",
                        initialRarity: advantage,
                      },
                      state,
                      {
                        withoutModifiers: true,
                      },
                    )}
                  />
                </div>
              )
            })}
        </div>
      )}
      <div className="flex gap-5">
        {modifiers.length > 0 && (
          <BentoCard className="shrink-0 flex flex-col relative">
            <Button
              className="absolute top-0 right-0"
              onClick={() => {
                if (sortBy === "tri par ordre d'exécution") {
                  setSortBy("tri par raison")
                } else if (sortBy === "tri par raison") {
                  setSortBy("tri par type")
                } else {
                  setSortBy("tri par ordre d'exécution")
                }
              }}
            >
              {sortBy}
            </Button>
            <h2 className="text-2xl">Modificateurs actifs</h2>
            <div className="max-h-[300px] overflow-y-scroll flex-grow">
              <table>
                <tbody>
                  {modifiers
                    .sort((a, b) => {
                      if (sortBy === "tri par type") {
                        return a.type.localeCompare(b.type)
                      }

                      if (sortBy === "tri par raison") {
                        return (
                          typeof a.reason === "object"
                            ? a.reason.name
                            : a.reason
                        ).localeCompare(
                          typeof b.reason === "object"
                            ? b.reason.name
                            : b.reason,
                        )
                      }

                      return 0
                    })
                    .map((modifier, index) => (
                      <tr key={index} className="odd:bg-muted/50">
                        <th>#{index + 1}</th>
                        <th className="whitespace-nowrap">
                          {typeof modifier.reason === "string" ? (
                            <span>{modifier.reason}</span>
                          ) : (
                            <GameMiniature item={modifier.reason} />
                          )}
                        </th>
                        {modifier.type === "localAdvantage" ? (
                          <>
                            <td className="text-right">
                              <RarityBadge advantage={modifier.before} orphan />
                            </td>
                            <td>
                              <ArrowRight className="w-4" />
                            </td>
                            <td>
                              <RarityBadge advantage={modifier.after} orphan />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="text-right">
                              <GameCost cost={modifier.before} miniature />
                            </td>
                            <td>
                              <ArrowRight className="w-4" />
                            </td>
                            <td>
                              <GameCost cost={modifier.after} miniature />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </BentoCard>
        )}

        {(props.card.effect.tags.includes("token") || modifiers.length > 0) && (
          <BentoCard className="shrink-0">
            <h2 className="text-center text-2xl">Ta carte</h2>
            <GameCard card={props.card} withoutDetail />
          </BentoCard>
        )}

        <div
          ref={colRef}
          className={cn("flex flex-col gap-5", {
            "grid grid-cols-2": colBeGrid,
          })}
        >
          <BentoCard>
            <h2 className="text-2xl">
              Type <Tag name={props.card.type} />
            </h2>
            {cardSubTypes &&
              cardSubTypes.length > 0 &&
              cardSubTypes.map((type) => (
                <div key={type}>
                  <Tag name={type} className="text-2xl" /> -{" "}
                  {tags[type].description}
                </div>
              ))}
          </BentoCard>

          {props.card.effect.hint && (
            <BentoCard>
              <h2 className="text-2xl">A savoir</h2>
              <p className="text-2xl">{props.card.effect.hint}</p>
            </BentoCard>
          )}

          {props.card.type === "action" && (
            <ActionCardDetail card={props.card} />
          )}
        </div>
      </div>
    </>
  )
}

export const GameUpgradeDetail = (props: { upgrade: Upgrade }) => {
  const getState = useCardGame((state) => () => state)

  return (
    <>
      <h1 className="text-3xl">A propos de "{props.upgrade.name}"</h1>
      <div className="flex gap-5">
        <BentoCard>
          <h2 className="text-2xl">Carte associée</h2>
          <GameCard
            card={reviveCard(props.upgrade.name, getState())}
            withoutDetail
          />
        </BentoCard>
        <div className="flex flex-col gap-5">
          <BentoCard>
            <div className="flex justify-between gap-5">
              <div>
                <h2 className="text-2xl">Déclencheur</h2>
                <p className="text-2xl">
                  {events[props.upgrade.eventName].name}
                </p>
              </div>
              <div>
                <EventIcon
                  name={props.upgrade.eventName}
                  className="w-16 h-16"
                  backgroundClassName="w-[70px] h-[70px]"
                />
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <h2 className="text-2xl">Effet{props.upgrade.max > 1 && "s"}</h2>
            <div className="max-h-[200px] overflow-y-scroll">
              <table>
                <tbody>
                  {new Array(props.upgrade.max)
                    .fill(null)
                    .slice(
                      0,
                      props.upgrade.max === Infinity ? 5 : props.upgrade.max,
                    )
                    .map((_, index) => (
                      <tr key={index}>
                        <th>
                          <Tag name="upgrade">x{index + 1}</Tag>
                        </th>
                        <td>{props.upgrade.description(index + 1)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </BentoCard>
        </div>
      </div>
    </>
  )
}

/** (modificateurs en cours, familles, niveau local - inflation = niveau effectif) */
export const MinimalistGameCardDetail = (props: {
  card: GameCardInfo<true>
}) => {
  return (
    <>
      <div className="flex mb-2 gap-2">
        <GameCost cost={props.card.effect.cost} miniature />
        <h2>{props.card.name}</h2>
      </div>
      <p>{props.card.effect.description}</p>
      <GameCardSubType card={props.card} />
      {isActionCardInfo(props.card) && props.card.families.length > 0 && (
        <>
          <hr />
          <div className="flex flex-wrap gap-2">
            {props.card.families.map((family) => (
              <Family name={family} key={family} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

export const ActionCardDetail = (props: { card: ActionCardInfo<true> }) => {
  return (
    <>
      {props.card.families.length > 0 && (
        <BentoCard>
          <h2 className="text-2xl">Familles</h2>
          <div className="flex flex-wrap gap-2">
            {props.card.families.map((family) => (
              <Family name={family} key={family} />
            ))}
          </div>
        </BentoCard>
      )}

      {!props.card.effect.tags.includes("upgrade") && (
        <BentoCard>
          <a
            className={cn(
              "flex gap-3 items-baseline flex-wrap",
              !props.card.url && "cursor-default",
            )}
            href={props.card.url}
            target="_blank"
          >
            <h2 className="inline text-2xl whitespace-nowrap">
              Projet "{props.card.name}"
            </h2>
            {props.card.url && <Link className="inline self-center" />}
            {props.card.description && (
              <span className="text-lg italic text-muted-foreground whitespace-nowrap">
                ({props.card.description})
              </span>
            )}
          </a>
          {props.card.detail && (
            <div className="flex-grow text-xl text-left max-w-lg relative ml-5">
              {props.card.detail}
              <span className="inline-block w-0 overflow-visible">
                <QuoteRight className="w-5 h-5 inline-block translate-x-2 translate-y-1/2" />
              </span>
              <QuoteLeft className="w-5 h-5 absolute -left-2 top-0 -translate-x-full" />
            </div>
          )}
        </BentoCard>
      )}
    </>
  )
}
