import type { TriggerEvent } from "@/game-typings.ts";

import Day from "@/assets/icons/game/day.svg";
import Play from "@/assets/icons/game/play.svg";

const events = {
  daily: {
    name: "Tous les @days",
    icon: Day,
    colors: "bg-day",
  },
  onPlay: {
    name: "À chaque carte jouée",
    icon: Play,
  },
  onDraw: {
    name: "À chaque pioche",
    icon: Play,
  },
  onEmptyHand: {
    name: "Quand votre main est vide",
    icon: Play,
  },
  onReputationDeclines: {
    name: "Quand la @reputation diminue",
    icon: Play,
    colors: "bg-reputation",
  },
} satisfies Record<string, TriggerEvent>;

export default events;
