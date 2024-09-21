import type { GameState, GlobalGameState } from "@/hooks/useCardGame"

import type {
  Upgrade,
  GameResource,
  CardModifier,
  GameCardInfo,
  UpgradeIndice,
  GameOverReason,
  GameCardIndice,
  CardModifierIndice,
  ChoiceOptionsGeneratorOptions,
} from "@/game-typings"

import {
  MAX_HAND_SIZE,
  GAME_ADVANTAGE,
  LOCAL_ADVANTAGE,
  INFINITE_DRAW_COST,
} from "@/game-constants"

import cards from "@/data/cards.ts"
import upgrades from "@/data/upgrades.ts"
import cardModifiers from "@/data/cardModifiers.ts"

import {
  generateRandomAdvantage,
  generateRandomResource,
  isGameResource,
  canBeBuy,
  shuffle,
} from "@/game-safe-utils.ts"

export function generateChoiceOptions(
  state: GameState & GlobalGameState,
  options?: ChoiceOptionsGeneratorOptions,
): (GameCardIndice | GameResource)[] {
  state.setOperationInProgress("choices", true)

  const _cards: (GameCardInfo | GameResource)[] = cards.filter(
    (card) =>
      (state.choiceOptions.length === 0 ||
        state.choiceOptions.every(
          (o) =>
            o.length === 0 ||
            o.every((i) => !isGameResource(i) && i[0] !== card.name),
        )) &&
      (state.draw.length === 0 ||
        state.draw.every(([name]) => name !== card.name)) &&
      (state.discard.length === 0 ||
        state.discard.every(([name]) => name !== card.name)) &&
      (state.hand.length === 0 ||
        state.hand.every(([name]) => name !== card.name)) &&
      (!options?.exclude ||
        options?.exclude?.every((name) => name !== card.name)) &&
      (!options?.filter || options?.filter?.(card, state)) &&
      (!card.effect().upgrade ||
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

  return shuffle(_cards, 3)
    .slice(0, state.choiceOptionCount)
    .map((option) =>
      isGameResource(option)
        ? option
        : [option.name, "drawing", generateRandomAdvantage()],
    )
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

export function applyGlobalCardModifiers(
  state: GameState,
  card: GameCardInfo<true>,
  clean = false,
): GameCardInfo<true> {
  const modifiers = state.globalCardModifiers.toSorted((a, b) => {
    return a[2] - b[2]
  })

  for (const indice of modifiers) {
    const modifier = reviveCardModifier(indice)

    if (modifier.condition && !modifier.condition(card, state)) continue

    card = modifier.use(card, state)

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
  if (card.effect.ephemeral) return true

  if (card.effect.upgrade) {
    const rawUpgrade = upgrades.find((u) => u.name === card.name)!

    if (rawUpgrade.max) {
      if (rawUpgrade.max === 1) return true

      const indice = state.upgrades.find((u) => u[0] === card.name)

      if (!indice) return false

      const upgrade = reviveUpgrade(indice)

      return upgrade.cumul >= upgrade.max - 1
    }
  }

  return false
}

export function getSortedHand(
  hand: GameCardIndice[],
  state: GameState & GlobalGameState,
) {
  return hand
    .map((i) => reviveCard(i, state))
    .toSorted((a, b) => {
      // trier par type de carte (action ou support) puis par type de prix (énergie ou $) puis par prix puis par description de l'effet
      const typeA = a.type === "action" ? 1 : 0
      const typeB = b.type === "action" ? 1 : 0
      const priceA = a.effect.cost.type === "money" ? 1 : 0
      const priceB = b.effect.cost.type === "money" ? 1 : 0
      const costA = a.effect.cost.value
      const costB = b.effect.cost.value
      const effect = a.effect.description.localeCompare(b.effect.description)
      return typeA - typeB || priceA - priceB || costA - costB || effect
    })
}

// /**
//  * Convert a list of actions to a human-readable text
//  * @param actions
//  */
// export function actionsToText(actions): string {}

export function reviveCardModifier(indice: CardModifierIndice): CardModifier {
  // @ts-expect-error C'est normal
  return cardModifiers[indice[0]](...indice[1])
}

export function resolveCard(indice: GameCardIndice | string): GameCardInfo {
  const card = cards.find((c) =>
    typeof indice === "string" ? c.name === indice : c.name === indice[0],
  )

  if (!card) throw new Error(`Card ${indice} not found`)

  return card
}

export function reviveUpgrade(indice: UpgradeIndice | string): Upgrade {
  const raw = upgrades.find((u) =>
    typeof indice === "string" ? u.name === indice : u.name === indice[0],
  )

  if (!raw) throw new Error(`Upgrade ${indice} not found`)

  return {
    ...raw,
    type: "upgrade",
    state: typeof indice !== "string" ? indice[2] : "appear",
    cumul: typeof indice !== "string" ? indice[1] : 1,
    max: raw.max ?? Infinity,
  }
}

export function reviveCard(
  indice: GameCardIndice | string,
  state: GameState & GlobalGameState,
  clean?: boolean,
): GameCardInfo<true> {
  const card = cards.find((c) =>
    typeof indice === "string" ? c.name === indice : c.name === indice[0],
  )

  if (!card) throw new Error(`Card ${indice} not found`)

  const localAdvantage =
    typeof indice !== "string" ? indice[2] : LOCAL_ADVANTAGE.common

  const output: Omit<GameCardInfo<true>, "effect"> = {
    ...card,
    type: card.type,
    state: typeof indice !== "string" ? indice[1] : null,
    localAdvantage,
  }

  return applyGlobalCardModifiers(
    state,
    {
      ...output,
      effect: card.effect(
        GAME_ADVANTAGE[state.difficulty] + localAdvantage - state.inflation,
        state,
        output,
      ),
    } as GameCardInfo<true>,
    clean,
  )
}
