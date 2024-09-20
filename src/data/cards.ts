import React from "react"
import ReactDOMServer from "react-dom/server"

import projects from "@/data/actions.ts"
import technos from "@/data/techno.ts"

import { map, formatText, formatUpgradeText } from "@/game-utils.ts"

import type { GameCardInfo } from "@/game-typings.ts"

import { EventText } from "@/components/game/EventText.tsx"

import effects from "@/data/effects.ts"
import generateUpgrades from "@/data/upgrades.ts"
import type { GameState, GlobalGameState } from "@/hooks/useCardGame.ts"

/**
 * @param fakeState
 */
export default function generateCards(
  fakeState: GameState & GlobalGameState,
): GameCardInfo[] {
  const upgrades = generateUpgrades()

  const supportEffects = effects.filter(
    (effect) => effect(0, fakeState, undefined).type === "support",
  )
  const actionEffects = effects.filter(
    (effect) => effect(0, fakeState, undefined).type === "action",
  )

  if (import.meta.env.DEV) {
    console[supportEffects.length > technos.length ? "error" : "log"](
      "supports",
      Math.floor((supportEffects.length / technos.length) * 100),
      "%",
    )

    console[actionEffects.length > projects.length ? "error" : "log"](
      "actions",
      Math.floor((actionEffects.length / projects.length) * 100),
      "%",
    )
  }

  const supports: GameCardInfo[] = technos.map((techno, i) => {
    const mapping = map(i, 0, technos.length, 0, supportEffects.length, true)
    const effect = supportEffects[Math.floor(mapping)]

    return {
      ...techno,
      type: "support" as const,
      image: `images/techno/${techno.image}`,
      effect,
      state: null,
      localAdvantage: null,
    }
  })

  const actions: GameCardInfo[] = projects.map((project, i) => {
    const mapping = map(i, 0, projects.length, 0, actionEffects.length, true)
    const effect = actionEffects[Math.floor(mapping)]

    return {
      ...project,
      type: "action" as const,
      image: `images/projects/${project.image}`,
      effect,
      state: null,
      localAdvantage: null,
    }
  })

  const upgradeActions: GameCardInfo[] = upgrades.map((upgrade) => {
    return {
      type: "action",
      name: upgrade.name,
      image: `images/upgrades/${upgrade.image}`,
      effect: () => ({
        index: -1,
        upgrade: true,
        ephemeral: upgrade.max === 1,
        description: `${formatText(`@upgrade <br/> ${formatUpgradeText(upgrade.description, 1)}`)} <br/> ${ReactDOMServer.renderToString(
          React.createElement(EventText, {
            eventName: upgrade.eventName,
            className: "mx-auto w-fit mt-2",
          }),
        ).replace(/"/g, "'")}`,
        onPlayed: async (state) => await state.upgrade(upgrade.name),
        type: "action",
        cost: upgrade.cost,
        waitBeforePlay: false,
      }),
      state: null,
      localAdvantage: null,
    }
  })

  return [...supports, ...actions, ...upgradeActions]
}
