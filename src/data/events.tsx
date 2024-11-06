import type { TriggerEvent } from "@/game-typings.ts"

import Cross from "@/assets/icons/cross.svg"
import Day from "@/assets/icons/game/day.svg"
import Down from "@/assets/icons/game/down.svg"
import Draw from "@/assets/icons/game/draw.svg"
import Play from "@/assets/icons/game/play.svg"
import Sprint from "@/assets/icons/game/sprint.svg"
import Upgrade from "@/assets/icons/game/upgrade.svg"
import { Tag } from "@/components/game/Texts.tsx"

import { t } from "@/i18n"

const events = {
  daily: {
    name: (
      <>
        {t(
          <>
            Tous les <Tag name="day" plural />
          </>,
          <>
            Every <Tag name="day" plural />
          </>,
        )}
      </>
    ),
    icon: Day,
    colors: "bg-day",
  },
  weekly: {
    name: (
      <>
        {t(
          <>
            Toutes les fins de <Tag name="sprint" />
          </>,
          <>
            Every end of <Tag name="sprint" />
          </>,
        )}
      </>
    ),
    icon: Sprint,
    colors: "bg-upgrade",
  },
  monthly: {
    name: (
      <>
        {t(
          <>
            Tous les <Tag name="inflation">Mois</Tag>
          </>,
          <>
            Every <Tag name="inflation">Month</Tag>
          </>,
        )}
      </>
    ),
    icon: Sprint,
    colors: "bg-inflation",
  },
  onPlay: {
    name: t("À chaque carte jouée", "Every card played"),
    icon: Play,
  },
  onDraw: {
    name: (
      <>
        {t(
          <>
            À chaque <Tag name="draw" />
          </>,
          <>
            Every <Tag name="draw" />
          </>,
        )}
      </>
    ),
    icon: Draw,
  },
  onEmptyHand: {
    name: t("Quand ta main est vide", "When your hand is empty"),
    icon: Cross,
  },
  onReputationDeclines: {
    name: (
      <>
        {t(
          <>
            Quand la <Tag name="reputation" /> diminue
          </>,
          <>
            When the <Tag name="reputation" /> decreases
          </>,
        )}
      </>
    ),
    icon: Down,
    colors: "bg-reputation",
  },
  onUpgradeThis: {
    name: t(
      "Chaque fois que tu joues la carte de cette amélioration",
      "Each time you play the card of this upgrade",
    ),
    icon: Upgrade,
    colors: "bg-upgrade",
  },
} satisfies Record<string, TriggerEvent>

export default events
