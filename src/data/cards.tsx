import events from "@/data/events.tsx"
import actions from "@/data/actions.tsx"
import supports from "@/data/supports.tsx"
import upgrades from "@/data/upgrades.tsx"

import type { GameCardInfo } from "@/game-typings.ts"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"

const upgradeCards = upgrades.map<GameCardInfo>((upgrade) => {
  const event = events[upgrade.eventName]

  return {
    type: "action",
    name: upgrade.name,
    image: `images/upgrades/${upgrade.image}`,
    families: [],
    effect: () => ({
      description: (
        <div className="flex gap-2 items-center">
          <HoverCard openDelay={1000} closeDelay={0}>
            <HoverCardTrigger asChild>
              <GameValueIcon
                value={<event.icon className="h-5" />}
                colors={"colors" in event ? event.colors : "bg-background"}
                miniature
                className="block h-6 w-6"
              />
            </HoverCardTrigger>
            <HoverCardContent className="pointer-events-none">
              {event.name}
            </HoverCardContent>
          </HoverCard>
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
