import type { TriggerEvent } from "@/game-typings.ts"

import Day from "@/assets/icons/game/day.svg"
import Play from "@/assets/icons/game/play.svg"
import Sprint from "@/assets/icons/game/sprint.svg"
import Draw from "@/assets/icons/game/draw.svg"
import Down from "@/assets/icons/game/down.svg"
import Cross from "@/assets/icons/cross.svg"
import Upgrade from "@/assets/icons/game/upgrade.svg"
import { Tag } from "@/components/game/Texts.tsx"

const events = {
  daily: {
    name: (
      <>
        Tous les <Tag name="day" plural />
      </>
    ),
    icon: Day,
    colors: "bg-day",
  },
  weekly: {
    name: (
      <>
        Toutes les fins de <Tag name="sprint" />
      </>
    ),
    icon: Sprint,
    colors: "bg-upgrade",
  },
  monthly: {
    name: (
      <>
        Tous les <Tag name="inflation">Mois</Tag>
      </>
    ),
    icon: Sprint,
    colors: "bg-inflation",
  },
  onPlay: {
    name: "À chaque carte jouée",
    icon: Play,
  },
  onDraw: {
    name: (
      <>
        À chaque <Tag name="draw" />
      </>
    ),
    icon: Draw,
  },
  onEmptyHand: {
    name: "Quand ta main est vide",
    icon: Cross,
  },
  onReputationDeclines: {
    name: (
      <>
        Quand la <Tag name="reputation" /> diminue
      </>
    ),
    icon: Down,
    colors: "bg-reputation",
  },
  onUpgradeThis: {
    name: "Chaque fois que tu joues la carte de cette amélioration",
    icon: Upgrade,
    colors: "bg-upgrade",
  },
} satisfies Record<string, TriggerEvent>

export default events
