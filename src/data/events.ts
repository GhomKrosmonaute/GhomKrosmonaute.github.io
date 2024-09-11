import type { TriggerEvent } from "@/game-typings.ts"

import Day from "@/assets/icons/game/day.svg"
import Play from "@/assets/icons/game/play.svg"
import Sprint from "@/assets/icons/game/sprint.svg"
import Draw from "@/assets/icons/game/draw.svg"
import Down from "@/assets/icons/game/down.svg"
import Cross from "@/assets/icons/cross.svg"
import Upgrade from "@/assets/icons/game/upgrade.svg"

const events = {
  daily: {
    name: "Tous les @days",
    icon: Day,
    colors: "bg-day",
  },
  weekly: {
    name: "Toutes les fins de @sprint",
    icon: Sprint,
    colors: "bg-upgrade",
  },
  onPlay: {
    name: "À chaque carte jouée",
    icon: Play,
  },
  onDraw: {
    name: "À chaque pioche",
    icon: Draw,
  },
  onEmptyHand: {
    name: "Quand ta main est vide",
    icon: Cross,
  },
  onReputationDeclines: {
    name: "Quand la @reputation diminue",
    icon: Down,
    colors: "bg-reputation",
  },
  onUpgradeThis: {
    name: "Quand tu obtiens cette amélioration",
    icon: Upgrade,
    colors: "bg-upgrade",
  },
} satisfies Record<string, TriggerEvent>

export default events
