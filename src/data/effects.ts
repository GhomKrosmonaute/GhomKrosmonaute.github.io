import type { Effect } from "@/game-typings";

import {
  ENERGY_TO_MONEY,
  GAME_ADVANTAGE,
  MAX_HAND_SIZE,
  REPUTATION_TO_ENERGY,
} from "@/game-constants.ts";

import { settings } from "@/game-settings.ts";

const advantage = GAME_ADVANTAGE[settings.difficulty];

const effects: Effect[] = (
  [
    {
      description: `Gagne ${(2 + advantage) * ENERGY_TO_MONEY}M$`,
      onPlayed: async (state, _, reason) =>
        await state.addMoney((2 + advantage) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        }),
      type: "action",
      cost: 2,
    },
    {
      description: `Gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`,
      onPlayed: async (state, _, reason) =>
        await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        }),
      type: "action",
      cost: 4,
    },
    {
      description: `Le matin, gagne ${advantage * ENERGY_TO_MONEY}M$. L'après-midi, gagne ${advantage} @energy${advantage > 1 ? "s" : ""}`,
      onPlayed: async (state, _, reason) => {
        if (state.day % 1 < 0.5) {
          await state.addMoney(advantage * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          });
        } else {
          await state.addEnergy(advantage, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      type: "action",
      cost: 0,
    },
    {
      description: `Gagne ${(2 + advantage) * ENERGY_TO_MONEY}M$ fois le nombre de cartes @action en main en comptant celle-ci`,
      onPlayed: async (state, _, reason) => {
        await state.addMoney(
          (2 + advantage) *
            ENERGY_TO_MONEY *
            state.hand.filter((card) => card.effect.type === "action").length,
          { skipGameOverPause: true, reason },
        );
      },
      type: "action",
      cost: 4,
    },
    {
      description: `Si le dark mode est activé, gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`,
      onPlayed: async (state, _, reason) =>
        await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        }),
      condition: () => localStorage.getItem("theme") === "dark",
      type: "action",
      cost: 3,
    },
    {
      description: `Si la @reputation est inférieur à 5, gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`,
      onPlayed: async (state, _, reason) =>
        await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        }),
      condition: (state) => state.reputation < 5,
      type: "action",
      cost: 2,
    },
    {
      description: `Joue gratuitement la carte la plus à droite de ta main${
        advantage > 4
          ? ` et gagne ${advantage - 4} @energy${advantage - 4 > 1 ? "s" : ""}`
          : ""
      }`,
      onPlayed: async (state, _, reason) => {
        await state.playCard(state.hand[state.hand.length - 1], {
          free: true,
          skipGameOverPause: true,
          reason,
        });

        if (advantage > 4) {
          await state.addEnergy(advantage - 4, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      condition: (state, card) => {
        const target = state.hand[state.hand.length - 1];

        return (
          target &&
          target.name !== card.name &&
          (!target.effect.condition ||
            target.effect.condition(state, state.hand[state.hand.length - 1]))
        );
      },
      type: "action",
      cost: Math.max(0, 4 - advantage), // ~ middle cost
      waitBeforePlay: true,
    },
    {
      description:
        "Défausse la carte la plus à droite de ta main, gagne son coût en @energy", // <template></template>
      // template: (state, _, cond) => {
      //   if (!cond) return "";
      //
      //   const target = state.hand[state.hand.length - 1];
      //   const cost =
      //     typeof target.effect.cost === "string"
      //       ? Math.ceil(Number(target.effect.cost) / ENERGY_TO_MONEY)
      //       : target.effect.cost;
      //
      //   return `(${cost} @energy${cost > 1 ? "s" : ""})`;
      // },
      onPlayed: async (state, _, reason) => {
        const target = state.hand[state.hand.length - 1];
        await state.discardCard({
          filter: (card) => card.name === target.name,
          reason,
        });
        const cost =
          typeof target.effect.cost === "string"
            ? Math.ceil(Number(target.effect.cost) / ENERGY_TO_MONEY)
            : target.effect.cost;
        await state.addEnergy(cost, { skipGameOverPause: true, reason });
      },
      condition: (state, card) =>
        state.hand.length >= 1 &&
        state.hand.indexOf(card) !== state.hand.length - 1,
      type: "action",
      cost: 0,
    },
    {
      description: `Pioche ${1 + advantage} carte${advantage > 0 ? "s" : ""}`,
      onPlayed: async (state, _, reason) =>
        await state.drawCard(1 + advantage, {
          skipGameOverPause: true,
          reason,
        }),
      condition: (state) => state.draw.length >= 1,
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Pioche ${advantage > 2 ? 2 + (advantage - 2) : 2} cartes`,
      onPlayed: async (state, _, reason) =>
        await state.drawCard(advantage > 2 ? 2 + (advantage - 2) : 2, {
          skipGameOverPause: true,
          reason,
        }),
      condition: (state) => state.draw.length >= 1,
      type: "support",
      cost: Math.max(0, 2 - advantage),
      waitBeforePlay: true,
    },
    {
      description: `Si tu as moins de 5 cartes en main, pioche ${2 + advantage} cartes`,
      onPlayed: async (state, _, reason) =>
        await state.drawCard(2 + advantage, {
          skipGameOverPause: true,
          reason,
        }),
      condition: (state) => state.hand.length < 5 && state.draw.length >= 1,
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Pioche ${advantage >= 4 ? 1 + Math.floor((advantage - 2) / 2) : 1} carte${advantage >= 4 ? "s" : ""} @action${
        advantage >= 2 && advantage % 2 !== 0
          ? ` et gagne ${advantage % 2} @energy${advantage % 2 > 0 ? "s" : ""}`
          : ""
      }`,
      onPlayed: async (state, _, reason) => {
        await state.drawCard(
          advantage >= 2 ? 1 + Math.floor((advantage - 2) / 2) : 1,
          {
            filter: (card) => card.effect.type === "action",
            skipGameOverPause: true,
            reason,
          },
        );

        if (advantage >= 2 && advantage % 2 !== 0) {
          await state.addEnergy(advantage % 2, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      condition: (state) =>
        state.draw.some((card) => card.effect.type === "action"),
      type: "support",
      cost: Math.max(0, 2 - advantage),
      waitBeforePlay: true,
    },
    {
      description: `Si tu n'as pas de carte @action en main, pioche ${1 + Math.floor(advantage / 2)} carte${advantage >= 2 ? "s" : ""} @action${
        advantage % 2 !== 0
          ? ` et gagne ${(advantage % 2) * ENERGY_TO_MONEY}M$`
          : ""
      }`,
      onPlayed: async (state, _, reason) => {
        await state.drawCard(1, {
          filter: (card) => card.effect.type === "action",
          skipGameOverPause: true,
          reason,
        });

        if (advantage % 2 !== 0) {
          await state.addMoney((advantage % 2) * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      condition: (state) =>
        state.hand.every((card) => card.effect.type !== "action") &&
        state.draw.some((card) => card.effect.type === "action"),
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Défausse une carte aléatoire, pioche ${advantage >= 1 ? 2 : "une"} carte${advantage > 1 ? "s" : ""} et gagne ${(2 + advantage - 1) * ENERGY_TO_MONEY}M$`, // -2 +1 +2 = +1
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ random: true, reason });
        await state.drawCard(advantage >= 1 ? 2 : 1, {
          skipGameOverPause: true,
          reason,
        });
        await state.addMoney((2 + advantage - 1) * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        });
      },
      condition: (state) => state.hand.length >= 2 && state.draw.length >= 1,
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Renvoie une carte aléatoire dans la pioche, pioche ${advantage >= 1 ? 1 + advantage : "une"} carte${advantage >= 1 ? "s" : ""}`,
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ toDraw: true, random: true, reason });
        await state.drawCard(advantage >= 1 ? 1 + advantage : 1, {
          skipGameOverPause: true,
          reason,
        });
      },
      condition: (state) => state.hand.length >= 2,
      type: "support",
      cost: 0,
      waitBeforePlay: true,
    },
    {
      description: `Défausse les cartes en main, pioche ${5 + advantage} cartes`,
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ reason });
        await state.drawCard(5 + advantage, {
          skipGameOverPause: true,
          reason,
        });
      },
      condition: (state) => state.draw.length >= 1,
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Renvoie toutes les cartes en main dans la pioche, pioche ${
        advantage > 5 ? 5 + (advantage - 5) : 5
      } cartes`,
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ toDraw: true, reason });
        await state.drawCard(advantage > 5 ? 5 + (advantage - 5) : 5, {
          skipGameOverPause: true,
          reason,
        });
      },
      type: "support",
      cost: Math.max(0, 5 - advantage),
      waitBeforePlay: true,
    },
    {
      description: `Pioche autant de carte que d'@upgrades découvertes${
        advantage > 3 ? ` et gagne ${(advantage - 3) * ENERGY_TO_MONEY}M$` : ""
      }`,
      onPlayed: async (state, _, reason) => {
        await state.drawCard(state.upgrades.length, {
          skipGameOverPause: true,
          reason,
        });

        if (advantage > 3) {
          await state.addMoney((advantage - 3) * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      condition: (state) => state.upgrades.length > 0 && state.draw.length >= 1,
      type: "support",
      cost: Math.max(0, 3 - advantage),
      waitBeforePlay: true,
    },
    {
      description: `Défausse les cartes @support en main(min 1), pioche 2 cartes @action${
        advantage > 0 ? ` et gagne ${advantage * ENERGY_TO_MONEY}M$` : ""
      }`, // -3 + 4 = +1
      onPlayed: async (state, _, reason) => {
        await state.discardCard({
          filter: (card) => card.effect.type === "support",
          reason,
        });
        await state.drawCard(2, {
          filter: (card) => card.effect.type === "action",
          skipGameOverPause: true,
          reason,
        });

        if (advantage > 0) {
          await state.addMoney(advantage * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      condition: (state) =>
        state.hand.filter((card) => card.effect.type === "support").length > 1,
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Défausse les cartes @action en main(min 1), pioche ${3 + advantage} cartes`,
      onPlayed: async (state, _, reason) => {
        await state.discardCard({
          filter: (card) => card.effect.type === "action",
          reason,
        });
        await state.drawCard(3 + advantage, {
          skipGameOverPause: true,
          reason,
        });
      },
      condition: (state) =>
        state.hand.some((card) => card.effect.type === "action"),
      type: "support",
      cost: 0,
      waitBeforePlay: true,
    },
    {
      description: "Recycle toutes les cartes de la défausse",
      onPlayed: async (state, _, reason) => {
        await state.recycleCard(state.discard.length, { reason });
      },
      condition: (state) => state.discard.length > 0,
      type: "support",
      cost: Math.max(0, 10 - advantage),
      waitBeforePlay: true,
    },
    {
      description: `Recycle ${1 + advantage} carte${advantage > 0 ? "s" : ""} aléatoire${advantage > 0 ? "s" : ""} de la défausse`,
      onPlayed: async (state, _, reason) => {
        await state.recycleCard(1 + advantage, { reason });
      },
      condition: (state) => state.discard.length > 0,
      type: "support",
      cost: 1,
      waitBeforePlay: true,
    },
    {
      description: `Pioche 2 cartes qui coûtent de l'@energy${
        advantage > 4
          ? ` et gagne ${advantage - 4} @energy${advantage - 4 > 1 ? "s" : ""}`
          : ""
      }`,
      onPlayed: async (state, _, reason) => {
        await state.drawCard(2, {
          filter: (c) => typeof c.effect.cost === "number",
          skipGameOverPause: true,
          reason,
        });

        if (advantage > 4) {
          await state.addEnergy(advantage - 4, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      condition: (state) =>
        state.draw.some((c) => typeof c.effect.cost === "number"),
      type: "support",
      cost: Math.max(0, 4 - advantage),
      waitBeforePlay: true,
    },
    {
      description: `La prochaine carte jouée coûte la moitié de son prix${
        advantage > 3
          ? `, gagne ${advantage - 3} @energy${advantage - 3 > 1 ? "s" : ""}`
          : ""
      }`, // 4 (middle effect) - 1 (easy condition) = 3
      onPlayed: async (state, _, reason) => {
        state.addCardModifier("next card half cost", []);

        if (advantage > 3) {
          await state.addEnergy(advantage - 3, {
            skipGameOverPause: true,
            reason,
          });
        }
      },
      type: "support",
      cost: Math.max(0, 3 - advantage),
    },
    {
      description:
        "La prochaine carte qui coûte de l'argent coûte maintenant de l'@energy",
      onPlayed: async (state) => {
        state.addCardModifier("next money card cost energy", []);
      },
      type: "support",
      cost: 0,
    },
    {
      description: `Baisse le prix de toutes les cartes en main de ${
        1 + advantage
      } @energys ou de ${(1 + advantage) * ENERGY_TO_MONEY}M$`,
      onPlayed: async (state, card) => {
        const handCardNames = state.hand
          .filter((c) => c.name !== card.name && Number(card.effect.cost) > 0)
          .map((c) => c.name);

        state.addCardModifier("lowers price of hand cards", [
          handCardNames,
          1 + advantage,
        ]);
      },
      condition: (state) =>
        state.hand.some((card) => Number(card.effect.cost) > 0),
      type: "support",
      cost: Math.max(0, MAX_HAND_SIZE - advantage),
      ephemeral: true,
    },
    {
      description: `${advantage > 4 ? `Ajoute ${advantage - 4} @energy${advantage > 5 ? "s" : ""}` : "D"}ouble l'@energy`, // as middle effect
      onPlayed: async (state, _, reason) => {
        if (advantage > 4) {
          await state.addEnergy(advantage - 4, {
            skipGameOverPause: true,
            reason,
          });
        }

        await state.addEnergy(state.energy, {
          skipGameOverPause: true,
          reason,
        });
      },
      type: "action",
      cost: String(Math.max(0, 4 - advantage) * ENERGY_TO_MONEY),
    },
    {
      description: `Ajoute ${4 + advantage} @energys`,
      onPlayed: async (state, _, reason) =>
        await state.addEnergy(4 + advantage, {
          skipGameOverPause: true,
          reason,
        }),
      type: "action",
      cost: String(4 * ENERGY_TO_MONEY),
    },
    {
      description: `Si la @reputation est inférieur à 5, ajoute ${
        advantage > 3 ? 5 + advantage - 3 : 5
      } @energys`, // -2 + 5 = +3
      onPlayed: async (state, _, reason) =>
        await state.addEnergy(advantage > 3 ? 5 + advantage - 3 : 5, {
          skipGameOverPause: true,
          reason,
        }),
      condition: (state) => state.reputation < 5,
      type: "action",
      cost: String(Math.max(0, 3 - advantage) * ENERGY_TO_MONEY),
    },
    {
      description: "Remplis la jauge de @reputation", // middle score of reputation = 5 (parce qu'elle n'est jamais vide)
      onPlayed: async (state, _, reason) =>
        await state.addReputation(10, { skipGameOverPause: true, reason }),
      type: "action",
      cost: String(
        Math.max(0, 5 * REPUTATION_TO_ENERGY - advantage) * ENERGY_TO_MONEY,
      ),
      ephemeral: true,
    },
  ] satisfies Omit<Effect, "index">[]
).map((effect, index) => ({
  ...effect,
  index,
}));

export default effects;
