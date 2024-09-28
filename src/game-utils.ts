import type { GameState, GlobalGameState } from "@/hooks/useCardGame.tsx"

import {
  Upgrade,
  GameResource,
  CardModifier,
  GameCardInfo,
  UpgradeCompact,
  GameOverReason,
  GameCardCompact,
  CardModifierCompact,
  ChoiceOptionsGeneratorOptions,
  GameModifierLog,
  GameResolvable,
  isGameResource,
  isGameCardInfo,
  ChoiceOptions,
} from "@/game-typings"

import { MAX_HAND_SIZE, RARITIES, INFINITE_DRAW_COST } from "@/game-constants"

import cards from "@/data/cards.tsx"
import upgrades from "@/data/upgrades.tsx"
import cardModifiers from "@/data/cardModifiers.ts"

import {
  generateRandomAdvantage,
  generateRandomResource,
  canBeBuy,
  shuffle,
  calculateRarityAdvantage,
} from "@/game-safe-utils.tsx"

export function generateChoiceOptions(
  state: GameState & GlobalGameState,
  options?: ChoiceOptionsGeneratorOptions,
): ChoiceOptions {
  state.setOperationInProgress("choices", true)

  const _cards: (GameCardInfo | GameResource)[] = cards.filter(
    (card) =>
      // (state.choiceOptions.length === 0 ||
      //   state.choiceOptions.every(
      //     (choice) =>
      //       choice.options.length === 0 ||
      //       choice.options.every(
      //         (i) => !isGameResource(i) && i.name !== card.name,
      //       ),
      //   )) &&
      (state.draw.length === 0 ||
        state.draw.every((c) => c.name !== card.name)) &&
      (state.discard.length === 0 ||
        state.discard.every((c) => c.name !== card.name)) &&
      (state.hand.length === 0 ||
        state.hand.every((c) => c.name !== card.name)) &&
      (!options?.exclude ||
        options?.exclude?.every((name) => name !== card.name)) &&
      (!options?.filter || options?.filter?.(card, state)) &&
      (!card.effect().tags.includes("upgrade") ||
        state.upgrades.length === 0 ||
        state.upgrades.every((u) => {
          const up = reviveUpgrade(u)
          return up.name !== card.name || up.cumul < up.max
        })),
  )

  if (_cards.length < state.choiceOptionCount) {
    while (_cards.length < state.choiceOptionCount) {
      _cards.push(generateRandomResource(state))
    }
  } else if (!options?.noResource) {
    const length = _cards.length
    for (let i = 0; i < Math.ceil(length / 10); i++) {
      _cards.push(generateRandomResource(state))
    }
  }

  return {
    header: options?.header ?? "Choisis une carte",
    options: shuffle(_cards, 3)
      .slice(0, state.choiceOptionCount)
      .map((option) => {
        if (isGameResource(option)) return option

        return {
          name: option.name,
          state: "landing",
          initialRarity: generateRandomAdvantage(),
        } as GameCardCompact
      }),
  }
}

export function isGameOver(
  state: GameState & GlobalGameState,
): GameOverReason | false {
  if (state.reputation === 0) return "reputation"
  if (state.draw.length === 0 && state.hand.length === 0) return "mill"
  if (
    state.hand.every((c) => {
      const card = reviveCard(c, state)

      // on vérifie si la condition s'il y en
      if (card.effect.condition && !card.effect.condition(state, card))
        return true

      // on vérifie si on a assez de resources
      return !canBeBuy(card, state)
    }) &&
    (state.reputation + state.energy < INFINITE_DRAW_COST ||
      state.hand.length >= MAX_HAND_SIZE ||
      state.draw.length === 0)
  )
    return state.draw.length === 0 ? "mill-lock" : "soft-lock"

  return false
}

export function getGlobalCardModifierLogs(
  state: GameState & GlobalGameState,
  indice: GameCardCompact,
): GameModifierLog[] {
  let card = reviveCard(indice, state, { withoutModifiers: true })

  const modifiers = state.globalCardModifiers
    .map((i) => [i, reviveCardModifier(i)] as const)
    .toSorted(([, a], [, b]) => {
      return a.index - b.index
    })

  const logs: GameModifierLog[] = []

  for (const [indice, modifier] of modifiers) {
    if (modifier.condition && !modifier.condition(card, state)) continue

    const before = card

    card = modifier.use(card, state, resolveCard(card.name))

    const levelChange = card.rarity !== before.rarity
    const costChange = card.effect.cost.value !== before.effect.cost.value
    const costTypeChange = card.effect.cost.type !== before.effect.cost.type

    if (levelChange)
      logs.push({
        reason: indice.reason,
        type: "localAdvantage",
        before: before.rarity,
        after: card.rarity,
      })

    if (costChange || costTypeChange)
      logs.push({
        reason: indice.reason,
        type: "cost",
        before: before.effect.cost,
        after: card.effect.cost,
      })
  }

  return logs
}

export function applyGlobalCardModifiers(
  state: GameState & GlobalGameState,
  card: GameCardInfo<true>,
  clean = false,
): GameCardInfo<true> {
  const modifiers = state.globalCardModifiers
    .map((i) => [i, reviveCardModifier(i)] as const)
    .toSorted(([, a], [, b]) => {
      return a.index - b.index
    })

  for (const [indice, modifier] of modifiers) {
    if (modifier.condition && !modifier.condition(card, state)) continue

    card = modifier.use(card, state, resolveCard(card.name))

    if (clean && modifier.once)
      state.dangerouslyUpdate({
        globalCardModifiers: state.globalCardModifiers.filter(
          (m) => m !== indice,
        ),
      })
  }

  return card
}

export function willBeRemoved(state: GameState, card: GameCardInfo<true>) {
  if (card.effect.tags.includes("ephemeral")) return true

  if (card.effect.tags.includes("upgrade")) {
    const rawUpgrade = upgrades.find((u) => u.name === card.name)!

    if (rawUpgrade.max) {
      if (rawUpgrade.max === 1) return true

      const indice = state.upgrades.find((u) => u.name === card.name)

      if (!indice) return false

      const upgrade = reviveUpgrade(indice)

      return upgrade.cumul >= upgrade.max - 1
    }
  }

  return false
}

export function toSortedCards<T extends GameCardCompact>(
  cards: T[],
  state: GameState & GlobalGameState,
): GameCardInfo<true>[]
export function toSortedCards<T extends GameResolvable>(
  cards: T[],
  state: GameState & GlobalGameState,
): (GameCardInfo<true> | GameResource)[]
export function toSortedCards<T extends GameResolvable>(
  cards: T[],
  state: GameState & GlobalGameState,
): (GameCardInfo<true> | GameResource)[] {
  return cards
    .map((i) =>
      isGameResource(i) ? i : reviveCard(i as GameCardCompact, state),
    )
    .toSorted((a, b) => {
      // trier par type de carte (action ou support) puis par type de prix (énergie ou $) puis par prix puis par description de l'effet
      if (isGameResource(a) && isGameResource(b)) {
        const indexes = [
          "energy",
          "money",
          "reputation",
        ] as GameResource["type"][]
        const typeA = indexes.indexOf(a.type)
        const typeB = indexes.indexOf(b.type)
        const valueA = a.value
        const valueB = b.value
        return typeA - typeB || valueA - valueB
      }

      if (!isGameResource(a) && isGameResource(b)) return -1
      if (isGameResource(a) && !isGameResource(b)) return 1

      if (isGameCardInfo(a) && isGameCardInfo(b)) {
        const typeA = a.type === "action" ? 1 : 0
        const typeB = b.type === "action" ? 1 : 0
        const priceA = a.effect.cost.type === "money" ? 1 : 0
        const priceB = b.effect.cost.type === "money" ? 1 : 0
        const costA = a.effect.cost.value
        const costB = b.effect.cost.value
        const effect = a.effect.tags
          .join(",")
          .localeCompare(b.effect.tags.join(","))
        return typeA - typeB || priceA - priceB || costA - costB || effect
      }

      return 0
    })
}

export function revivedState(
  state: GameState & GlobalGameState,
): Pick<GameState, "revivedHand" | "revivedDraw" | "revivedDiscard"> {
  return {
    revivedHand: toSortedCards(state.hand, state),
    revivedDraw: state.draw.map((i) => reviveCard(i, state)),
    revivedDiscard: state.discard.map((i) => reviveCard(i, state)),
  }
}

// /**
//  * Convert a list of actions to a human-readable text
//  * @param actions
//  */
// export function actionsToText(actions): string {}

export function reviveCardModifier<Name extends keyof typeof cardModifiers>(
  indice: CardModifierCompact<Name>,
): CardModifier {
  // @ts-expect-error no need to spread
  return cardModifiers[indice.name](...indice.params)
}

export function resolveCard(indice: GameCardCompact | string): GameCardInfo {
  const card = cards.find(
    (c) => c.name === (typeof indice === "string" ? indice : indice.name),
  )

  if (!card) throw new Error(`Card ${indice} not found`)

  return card
}

export function reviveUpgrade(indice: UpgradeCompact | string): Upgrade {
  const raw = upgrades.find(
    (u) => u.name === (typeof indice === "string" ? indice : indice.name),
  )

  if (!raw) throw new Error(`Upgrade ${indice} not found`)

  return {
    ...raw,
    type: "upgrade",
    state: typeof indice !== "string" ? indice.state : "appear",
    cumul: typeof indice !== "string" ? indice.cumul : 1,
    max: raw.max ?? Infinity,
  }
}

export function reviveCard(
  compact: GameCardCompact | string,
  state: GameState & GlobalGameState,
  options?: {
    clean?: boolean
    withoutModifiers?: boolean
  },
): GameCardInfo<true> {
  const card = resolveCard(compact)

  const initialRarity =
    typeof compact !== "string" ? compact.initialRarity : RARITIES.common

  const output: Omit<GameCardInfo<true>, "effect"> = {
    ...card,
    type: card.type,
    state: typeof compact !== "string" ? compact.state : null,
    initialRarity,
    rarity: initialRarity,
  }

  const final = {
    ...output,
    effect: card.effect(
      calculateRarityAdvantage(initialRarity, state),
      state,
      output,
    ),
  } as GameCardInfo<true>

  return options?.withoutModifiers
    ? final
    : applyGlobalCardModifiers(state, final, options?.clean)
}
