import React from "react"

import { ArrowRight, Link } from "lucide-react"

import QuoteLeft from "@/assets/icons/quote-left.svg"
import QuoteRight from "@/assets/icons/quote-right.svg"

import {
  tags,
  getRarityName,
  resolveSubTypes,
  calculateRarityAdvantage,
  isReactNode,
  getNodeText,
} from "@/game-safe-utils.tsx"
import { getGlobalCardModifierLogs, reviveCard } from "@/game-utils.ts"
import { ActionCardInfo, GameCardInfo } from "@/game-typings.ts"
import { LOCAL_ADVANTAGE } from "@/game-constants.ts"
import { cn } from "@/utils.ts"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useSettings } from "@/hooks/useSettings.ts"

import { Card } from "@/components/Card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { GameCard } from "@/components/game/GameCard.tsx"
import { GameCost } from "@/components/game/GameCost.tsx"
import { GameMiniature } from "@/components/game/GameMiniature.tsx"
import { GameAdvantageBadge } from "@/components/game/GameAdvantageBadge.tsx"
import { Family, Tag } from "@/components/game/Texts.tsx"

export const GameCardDetail = (props: { show: boolean }) => {
  const state = useCardGame()
  const settings = useSettings()

  const colRef = React.useRef<HTMLDivElement>(null)

  const [sortBy, setSortBy] = React.useState<
    "tri par ordre d'exécution" | "tri par raison" | "tri par type"
  >("tri par ordre d'exécution")

  const card = state.cardDetail ? reviveCard(state.cardDetail, state) : null
  const modifiers = state.cardDetail
    ? getGlobalCardModifierLogs(state, state.cardDetail)
    : []
  const rarityName = card ? getRarityName(card.rarity, true) : null
  const cardSubTypes = card ? resolveSubTypes(card.effect) : null

  const colBeGrid = React.useMemo(() => {
    return (colRef.current?.children.length ?? 0) > 3
  }, [colRef])

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
          "opacity-100 flex pointer-events-auto": card && props.show,
        },
      )}
    >
      <div
        onClick={() => state.setCardDetail(null)}
        className={cn(
          "absolute inset-0",
          card && props.show ? "pointer-events-auto" : "pointer-events-none",
        )}
      />

      {card && (
        <Card className="space-y-4 z-30 w-fit h-fit flex flex-col items-center">
          <h1 className="text-3xl">A propos de "{card.name}"</h1>
          {!card.effect.tags.includes("token") && (
            <div className="flex">
              {Object.entries(LOCAL_ADVANTAGE)
                .sort(([, a], [, b]) => a - b)
                .map(([rarity, level]) => {
                  const advantage = calculateRarityAdvantage(level, state)

                  return (
                    <div key={rarity}>
                      <GameCard
                        withoutDetail
                        card={reviveCard(
                          {
                            name: card.name,
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
              <div className="shrink-0 flex flex-col p-5 space-y-2 border rounded-lg relative">
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
                              isReactNode(a.reason)
                                ? getNodeText(a.reason)
                                : a.reason.name
                            ).localeCompare(
                              isReactNode(b.reason)
                                ? getNodeText(b.reason)
                                : b.reason.name,
                            )
                          }

                          return 0
                        })
                        .map((modifier, index) => (
                          <tr key={index} className="odd:bg-muted/50">
                            <th>#{index + 1}</th>
                            <th className="whitespace-nowrap">
                              {isReactNode(modifier.reason) ? (
                                <span>{modifier.reason}</span>
                              ) : (
                                <GameMiniature item={modifier.reason} />
                              )}
                            </th>
                            {modifier.type === "localAdvantage" ? (
                              <>
                                <td className="text-right">
                                  <GameAdvantageBadge
                                    advantage={modifier.before}
                                    orphan
                                  />
                                </td>
                                <td>
                                  <ArrowRight className="w-4" />
                                </td>
                                <td>
                                  <GameAdvantageBadge
                                    advantage={modifier.after}
                                    orphan
                                  />
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
              </div>
            )}
            {(card.effect.tags.includes("token") || modifiers.length > 0) && (
              <div className="shrink-0 p-5 space-y-2 border rounded-lg">
                <h2 className="text-center text-2xl">Ta carte</h2>
                <GameCard card={card} withoutDetail />
              </div>
            )}

            <div
              ref={colRef}
              className={cn(
                "flex flex-col gap-5 *:p-5 *:space-y-2 *:border *:rounded-lg",
                {
                  "grid grid-cols-2": colBeGrid,
                },
              )}
            >
              <div>
                <h2 className="text-2xl">
                  Type <Tag name={card.type} />
                </h2>
                {cardSubTypes &&
                  cardSubTypes.length > 0 &&
                  cardSubTypes.map((type) => (
                    <div key={type}>
                      <Tag name={type} className="text-2xl" /> -{" "}
                      {tags[type].description}
                    </div>
                  ))}
              </div>

              {card.effect.hint && (
                <div>
                  <h2 className="text-2xl">A savoir</h2>
                  <p className="text-2xl">{card.effect.hint}</p>
                </div>
              )}

              {card.type === "action" && (
                <ActionCardDetail card={card as ActionCardInfo<true>} />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

/** (modificateurs en cours, familles, niveau local - inflation = niveau effectif) */
export const MinimalistGameCardDetail = (props: {
  card: GameCardInfo<true>
}) => {
  return <div>{props.card.effect.description}</div>
}

export const ActionCardDetail = (props: { card: ActionCardInfo<true> }) => {
  return (
    <>
      {props.card.families.length > 0 && (
        <div>
          <h2 className="text-2xl">Familles</h2>
          <div className="flex flex-wrap gap-2">
            {props.card.families.map((family) => (
              <Family name={family} key={family} />
            ))}
          </div>
        </div>
      )}

      <div>
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
      </div>
    </>
  )
}
