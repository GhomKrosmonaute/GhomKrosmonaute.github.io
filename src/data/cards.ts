import React from "react"
import ReactDOMServer from "react-dom/server"

import actions from "@/data/actions.ts"
import supports from "@/data/supports.ts"
import upgrades from "@/data/upgrades.ts"

import { formatText, formatUpgradeText } from "@/game-safe-utils.ts"

import type { GameCardInfo } from "@/game-typings.ts"

import { EventText } from "@/components/game/EventText.tsx"

const upgradeCards = upgrades.map<GameCardInfo>((upgrade) => {
  return {
    type: "action",
    name: upgrade.name,
    image: `images/upgrades/${upgrade.image}`,
    families: [],
    effect: () => ({
      description: `${formatText(`@upgrade <hr/> ${formatUpgradeText(upgrade.description, 1)}`)} <hr/> ${ReactDOMServer.renderToString(
        React.createElement(EventText, {
          eventName: upgrade.eventName,
          className: "mx-auto w-fit mt-2",
        }),
      ).replace(/"/g, "'")}`,
      onPlayed: async (state) => await state.upgrade(upgrade.name),
      type: "action",
      cost: upgrade.cost,
      waitBeforePlay: false,
      upgrade: true,
    }),
    state: null,
    localAdvantage: null,
  }
})

const cards = [...supports, ...actions, ...upgradeCards]

export default cards
