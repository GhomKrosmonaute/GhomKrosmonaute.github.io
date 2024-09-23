import QuoteLeft from "@/assets/icons/quote-left.svg"
import QuoteRight from "@/assets/icons/quote-right.svg"

import {
  ActionCardInfo,
  GameCardInfo,
  SupportCardInfo,
} from "@/game-typings.ts"

import { LOCAL_ADVANTAGE } from "@/game-constants.ts"

import { useCardGame } from "@/hooks/useCardGame.ts"
import { cn } from "@/utils.ts"
import { Card } from "@/components/Card.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { GameCard } from "@/components/game/GameCard.tsx"
import { getGlobalCardModifierLogs, reviveCard } from "@/game-utils.ts"
import { GameCost } from "@/components/game/GameCost.tsx"
import { GameAdvantageBadge } from "@/components/game/GameAdvantageBadge.tsx"
import { ArrowRight, Link } from "lucide-react"
import { GameMiniature } from "@/components/game/GameMiniature.tsx"
import { GameFamilyBadge } from "@/components/game/GameFamilyBadge.tsx"
import { calculateLocalAdvantage } from "@/game-safe-utils.ts"

export const GameCardDetail = (props: { show: boolean }) => {
  const state = useCardGame()
  const settings = useSettings()

  const card = state.cardDetail ? reviveCard(state.cardDetail, state) : null
  const modifiers = state.cardDetail
    ? getGlobalCardModifierLogs(state, state.cardDetail)
    : []

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
          {card.effect.hint && (
            <div
              className="text-2xl"
              dangerouslySetInnerHTML={{
                __html: card.effect.hint,
              }}
            />
          )}
          <div className="flex">
            {Object.entries(LOCAL_ADVANTAGE)
              .sort(([, a], [, b]) => a - b)
              .map(([rarity, level]) => {
                const advantage = calculateLocalAdvantage(
                  {
                    initial: level,
                    current: level,
                  },
                  state,
                )

                return (
                  <div
                    key={rarity}
                    // className={
                    //   rarityName === rarity || rarityName === null
                    //     ? ""
                    //     : "grayscale-75"
                    // }
                  >
                    <GameCard
                      withoutDetail
                      card={reviveCard(
                        [
                          card.name,
                          "idle",
                          {
                            initial: advantage,
                            current: advantage,
                          },
                        ],
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
          <div className="flex gap-5 *:p-5 *:space-y-4 *:border *:rounded-lg">
            {modifiers.length > 0 && (
              <div className="shrink-0 flex flex-col">
                <h2 className="text-2xl text-center">Modificateurs actifs</h2>
                <div className="max-h-[300px] overflow-y-scroll flex-grow">
                  <table>
                    <tbody>
                      {modifiers.map((modifier, index) => (
                        <tr key={index}>
                          <th className="whitespace-nowrap">
                            {typeof modifier.reason === "string" ? (
                              modifier.reason
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
                              <td>
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
            {card.type === "action" && (
              <div>
                <ActionCardDetail card={card as ActionCardInfo<true>} />
              </div>
            )}
            <div className="shrink-0">
              <h2 className="text-center text-2xl">Ta carte</h2>
              <GameCard card={card} withoutDetail />
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

export const SupportCardDetail = (props: { card: SupportCardInfo<true> }) => {
  return <div>{props.card.effect.description}</div>
}

export const ActionCardDetail = (props: { card: ActionCardInfo<true> }) => {
  return (
    <>
      {props.card.detail ? (
        <div className="p-2 gap-1 flex h-fit">
          <QuoteLeft className="w-6 self-start" />
          <div className="flex-grow text-xl text-left px-2">
            <a
              className="flex gap-3 items-baseline flex-wrap"
              href={props.card.url}
              target="_blank"
            >
              <h2 className="inline text-2xl whitespace-nowrap">
                Projet "{props.card.name}"
              </h2>
              <Link className="inline self-center" />
              {props.card.description && (
                <span className="text-lg italic text-muted-foreground whitespace-nowrap">
                  ({props.card.description})
                </span>
              )}
            </a>
            {props.card.detail}
          </div>
          <QuoteRight className="w-6 self-end" />
        </div>
      ) : (
        <>
          {props.card.url && (
            <a className="flex gap-3" href={props.card.url} target="_blank">
              <Link className="inline" />
              <h2 className="inline">Projet {props.card.name}</h2>
            </a>
          )}
        </>
      )}

      {props.card.families.length > 0 && (
        <>
          <h2 className="text-2xl">Familles</h2>
          <div className="flex flex-wrap gap-2">
            {props.card.families.map((family) => (
              <GameFamilyBadge family={family} key={family} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
