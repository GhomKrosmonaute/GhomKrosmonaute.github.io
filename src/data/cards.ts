import React from "react";
import ReactDOMServer from "react-dom/server";

import projects from "@/data/projects.json";
import upgrades from "@/data/upgrades.ts";
import technos from "@/data/techno.json";

import { map, formatText, formatUpgradeText } from "@/game-utils.ts";

import type { GameCardInfo } from "@/game-typings.ts";

import { EventText } from "@/components/game/EventText.tsx";
import effects from "@/data/effects.ts";

export const supportEffects = effects.filter(
  (effect) => effect.type === "support",
);
export const actionEffects = effects.filter(
  (effect) => effect.type === "action",
);

export const supports: GameCardInfo[] = technos.map((techno, i) => {
  const mapping = map(i, 0, technos.length, 0, supportEffects.length, true);
  const effect = supportEffects[Math.floor(mapping)];

  return {
    ...techno,
    type: "support" as const,
    image: `images/techno/${techno.image}`,
    state: "idle" as const,
    effect: {
      ...effect,
      description: formatText(effect.description),
    },
  };
});

export const actions: GameCardInfo[] = projects.map((project, i) => {
  const mapping = map(i, 0, projects.length, 0, actionEffects.length, true);
  const effect = actionEffects[Math.floor(mapping)];

  return {
    ...project,
    type: "action" as const,
    image: `images/projects/${project.image}`,
    state: "idle" as const,
    effect: {
      ...effect,
      description: formatText(effect.description),
    },
  };
});

export const upgradeActions: GameCardInfo[] = upgrades.map((upgrade) => {
  return {
    type: "action",
    name: upgrade.name,
    image: `images/upgrades/${upgrade.image}`,
    state: "idle",
    effect: {
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
    },
  };
});

export default [...supports, ...actions, ...upgradeActions];
