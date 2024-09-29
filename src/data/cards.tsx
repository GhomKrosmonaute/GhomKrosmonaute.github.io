import events from "@/data/events.tsx"
import actions from "@/data/actions.tsx"
import supports from "@/data/supports.tsx"
import upgrades from "@/data/upgrades.tsx"

import type { GameCardInfo } from "@/game-typings.ts"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import { HelpPopoverTrigger } from "@/components/game/HelpPopoverTrigger.tsx"

const upgradeCards = upgrades.map<GameCardInfo>((upgrade) => {
  const event = events[upgrade.eventName]

  return {
    type: "action",
    name: upgrade.name,
    image: `images/upgrades/${upgrade.image}`,
    families: [],
    effect: () => ({
      description: (
        <div className="flex gap-2 items-center justify-center">
          <HelpPopoverTrigger popover={event.name}>
            <GameValueIcon
              value={<event.icon className="h-5" />}
              colors={"colors" in event ? event.colors : "bg-background"}
              miniature
              className="block h-6 w-6"
            />
          </HelpPopoverTrigger>
          <span className="text-left">{upgrade.description(1)}</span>
        </div>
      ),
      onPlayed: async (state) => await state.upgrade(upgrade.name),
      type: "action",
      cost: upgrade.cost,
      waitBeforePlay: false,
      tags: ["upgrade", "token"],
    }),
  }
})

const cards = [...supports, ...actions, ...upgradeCards]

export default cards
