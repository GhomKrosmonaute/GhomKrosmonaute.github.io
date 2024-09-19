import React from "react"
import ReactDOMServer from "react-dom/server"

import projects from "@/data/projects.json"
import technos from "@/data/techno.json"

import { map, formatText, formatUpgradeText } from "@/game-utils.ts"

import type { GameCardInfo } from "@/game-typings.ts"

import { EventText } from "@/components/game/EventText.tsx"

import effects from "@/data/effects.ts"
import generateUpgrades from "@/data/upgrades.ts"
import type { GameState, GlobalGameState } from "@/hooks/useCardGame.ts"

/**
 * @param advantage is only transmitted to generateUpgrades
 * @param fakeState
 */
export default function generateCards(
  advantage: number,
  fakeState: GameState & GlobalGameState,
): GameCardInfo[] {
  const upgrades = generateUpgrades(advantage)

  const supportEffects = effects.filter(
    (effect) => effect(0, fakeState).type === "support",
  )
  const actionEffects = effects.filter(
    (effect) => effect(0, fakeState).type === "action",
  )

  console[supportEffects.length > technos.length ? "error" : "log"](
    "loaded",
    supportEffects.length,
    "supports /",
    technos.length,
    "technos",
  )
  console[actionEffects.length > projects.length ? "error" : "log"](
    "loaded",
    actionEffects.length,
    "actions /",
    projects.length,
    "projects",
  )

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
