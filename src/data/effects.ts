import type { Effect, EffectBuilder, GameCardInfo } from "@/game-typings"

import {
  ACTIONS_COST,
  MAX_HAND_SIZE,
  ENERGY_TO_MONEY,
  REPUTATION_TO_ENERGY,
  MAX_REPUTATION,
} from "@/game-constants.ts"

import {
  smartClamp,
  formatText,
  reviveCard,
  resolveCost,
  costToEnergy,
  formatCoinFlipText,
  GlobalCardModifierIndex,
} from "@/game-utils.ts"

const effects: EffectBuilder<any[]>[] = [
  (advantage: number) => ({
    description: formatText(`Gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`),
    onPlayed: async (state, _, reason) =>
      await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
        skipGameOverPause: true,
        reason,
      }),
    type: "action",
    cost: resolveCost(4),
  }),
  (advantage: number) => {
    const energyGain = smartClamp(4 + advantage, 4, MAX_HAND_SIZE)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatCoinFlipText({
        heads: `gagne ${(4 + advantage) * ENERGY_TO_MONEY}M$`,
        tails: `gagne ${energyGain.value} @energy${energyGain.s}${
          moneyGain > 0 ? ` et ${moneyGain}M$` : ""
        }`,
      }),
      onPlayed: async (state, _, reason) =>
        await state.coinFlip({
          onHead: async () =>
            await state.addMoney((4 + advantage) * ENERGY_TO_MONEY, {
              skipGameOverPause: true,
              reason,
            }),
          onTail: async () => {
            await state.addEnergy(energyGain.value, {
              skipGameOverPause: true,
              reason,
            })

            if (moneyGain > 0) {
              await state.addMoney(moneyGain, {
                skipGameOverPause: true,
                reason,
              })
            }
          },
        }),
      type: "action",
      cost: resolveCost(3),
      needsPlayZone: true,
    }
  },
  (advantage: number) => ({
    description: formatText(
      `Gagne ${(2 + advantage) * ENERGY_TO_MONEY}M$ par carte @action en main en comptant celle-ci`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.addMoney(
        (2 + advantage) *
          ENERGY_TO_MONEY *
          state.hand
            .map((c) => reviveCard(c, state))
            .filter((card) => card.effect.type === "action").length,
        { skipGameOverPause: true, reason },
      )
    },
    type: "action",
    cost: resolveCost(4),
  }),
  (advantage, state): Effect<[selected: GameCardInfo<true>]> => {
    const price = smartClamp(2 - advantage)
    const energyGain = smartClamp(Math.abs(price.rest), 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Joue gratuitement une carte sélectionnée de ta main${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      prePlay: async (state, card) => {
        const selected = await state.waitCardSelection({
          from: state.revivedHand.filter(
            (c) =>
              c.name !== card.name &&
              (!c.effect.condition || c.effect.condition(state, c)),
          ),
        })

        if (!selected) {
          return "cancel"
        } else {
          return [selected]
        }
      },
      onPlayed: async (state, _, reason, selected) => {
        await state.playCard(selected, {
          free: true,
          skipGameOverPause: true,
          reason,
        })

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      type: "action",
      cost: resolveCost(price.value), // ~ middle cost
      waitBeforePlay: true,
    }
  },
  (advantage): Effect<[selected: GameCardInfo<true>]> => {
    return {
      description: formatText(
        `Détruit une carte sélectionnée de ta main et gagne son coût en @reputation${
          advantage > 0 ? `<hr> Gagne ${advantage * ENERGY_TO_MONEY}M$` : ""
        }`,
      ),
      prePlay: async (state, card) => {
        const selected = await state.waitCardSelection({
          from: state.revivedHand.filter(
            (c) => c.name !== card.name && c && c.effect.cost.value > 0,
          ),
        })

        if (!selected) {
          return "cancel"
        } else {
          return [selected]
        }
      },
      onPlayed: async (state, _, reason, selected) => {
        await state.removeCard(selected.name)

        await state.addReputation(selected.effect.cost.value, {
          skipGameOverPause: true,
          reason,
        })

        if (advantage > 0) {
          await state.addMoney(advantage * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      type: "action",
      ephemeral: true,
      cost: resolveCost(0),
    }
  },
  (advantage): Effect<[selected: GameCardInfo<true>]> => {
    return {
      description: formatText(
        `Défausse une carte sélectionnée de ta main et gagne son coût en @energy${
          advantage > 0 ? `<hr> Gagne ${advantage * ENERGY_TO_MONEY}M$` : ""
        }`,
      ),
      prePlay: async (state, card) => {
        const selected = await state.waitCardSelection({
          from: state.revivedHand.filter(
            (c) => c.name !== card.name && c && c.effect.cost.value > 0,
          ),
        })

        if (!selected) {
          return "cancel"
        } else {
          return [selected]
        }
      },
      onPlayed: async (state, _, reason, selected) => {
        await state.discardCard({
          filter: (card) => card.name === selected.name,
          reason,
        })

        await state.addEnergy(costToEnergy(selected.effect.cost), {
          skipGameOverPause: true,
          reason,
        })

        if (advantage > 0) {
          await state.addMoney(advantage * ENERGY_TO_MONEY, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      type: "action",
      cost: resolveCost(0),
    }
  },
  (advantage, state) => {
    const price = smartClamp(2 - advantage)
    const drawCount = smartClamp(2 + Math.abs(price.rest), 2, MAX_HAND_SIZE)
    const energyGain = smartClamp(drawCount.rest, 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Pioche ${drawCount.value} cartes${
          energyGain.value > 0
            ? `${moneyGain > 0 ? "," : " et"} gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      condition: (state) => state.draw.length >= 1,
      type: "support",
      cost: resolveCost(price.value),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => {
    const drawCount = smartClamp(2 + advantage, 2, MAX_HAND_SIZE)
    const moneyCount = drawCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Si tu as moins de 5 cartes en main, pioche ${drawCount.value} cartes${
          moneyCount > 0 ? ` et gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyCount > 0) {
          await state.addMoney(moneyCount, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state) => state.hand.length < 5 && state.draw.length >= 1,
      type: "support",
      cost: resolveCost(1),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => {
    const price = smartClamp(2 - advantage)
    const drawSpecificCount = smartClamp(
      1 + Math.floor(Math.abs(price.rest) / ACTIONS_COST.drawSpecific),
      2,
      MAX_HAND_SIZE,
    )
    const moneyCount = drawSpecificCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Pioche ${drawSpecificCount.value} carte${drawSpecificCount.s} @action${
          moneyCount > 0 ? ` et gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.drawCard(drawSpecificCount.value, {
          filter: (card) => card.effect.type === "action",
          skipGameOverPause: true,
          reason,
        })

        if (moneyCount > 0) {
          await state.addMoney(moneyCount, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state) =>
        state.draw.some(
          (card) => reviveCard(card, state).effect.type === "action",
        ),
      type: "support",
      cost: resolveCost(price.value),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => {
    const drawSpecificCount = smartClamp(
      1 + Math.floor(advantage / ACTIONS_COST.drawSpecific),
      1,
      MAX_HAND_SIZE,
    )
    const moneyCount = drawSpecificCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Si tu n'as pas de carte @action en main, pioche ${drawSpecificCount.value} carte${drawSpecificCount.s} @action${
          moneyCount > 0 ? ` et gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.drawCard(drawSpecificCount.value, {
          filter: (card) => card.effect.type === "action",
          skipGameOverPause: true,
          reason,
        })

        if (moneyCount > 0) {
          await state.addMoney(moneyCount, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state) =>
        state.hand.every(
          (card) => reviveCard(card, state).effect.type !== "action",
        ) &&
        state.draw.some(
          (card) => reviveCard(card, state).effect.type === "action",
        ),
      type: "support",
      cost: resolveCost(1),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => {
    const drawCount = smartClamp(
      1 + Math.floor(advantage / 2),
      1,
      MAX_HAND_SIZE,
    )
    const moneyCount =
      (1 + Math.ceil(advantage / 2) + drawCount.rest) * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Défausse une carte aléatoire, pioche ${drawCount.value} carte${drawCount.s} et gagne ${moneyCount}M$`,
      ),
      onPlayed: async (state, card, reason) => {
        await state.discardCard({
          random: true,
          reason,
          filter: (c) => c.name !== card.name,
        })

        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        await state.addMoney(moneyCount, {
          skipGameOverPause: true,
          reason,
        })
      },
      condition: (state) => state.hand.length >= 2 && state.draw.length >= 1,
      type: "support",
      cost: resolveCost(1),
      needsPlayZone: true,
    }
  },
  (advantage, state) => {
    const drawCount = smartClamp(1 + advantage, 1, MAX_HAND_SIZE)
    const energyGain = smartClamp(drawCount.rest, 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Renvoie une carte aléatoire dans la pioche(min 1) puis pioche ${drawCount.value} carte${drawCount.s}${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ toDraw: true, random: true, reason })

        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      condition: (state) => state.hand.length >= 2,
      type: "support",
      cost: resolveCost(0),
      needsPlayZone: true,
    }
  },
  (advantage: number) => {
    const drawSpecificCount = smartClamp(
      1 + Math.floor(advantage / ACTIONS_COST.drawSpecific),
      1,
      MAX_HAND_SIZE,
    )
    const moneyCount = drawSpecificCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Pioche ${drawSpecificCount.value} carte${drawSpecificCount.s} dans la défausse${
          moneyCount > 0 ? ` et gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) =>
        await state.drawCard(1 + Math.floor(advantage / 2), {
          fromDiscardPile: true,
          skipGameOverPause: true,
          reason,
        }),
      condition: (state) => state.discard.length >= 1,
      type: "support",
      cost: resolveCost(2),
      waitBeforePlay: true,
    }
  },
  (advantage, state) => {
    const drawCount = smartClamp(5 + advantage, 5, MAX_HAND_SIZE)
    const energyGain = smartClamp(drawCount.rest, 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Défausse toutes les cartes en main et pioche ${drawCount.value} cartes${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ reason })

        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      condition: (state) => state.draw.length >= 1,
      type: "support",
      cost: resolveCost(1),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => {
    const price = smartClamp(5 - advantage)
    const drawCount = smartClamp(5 + Math.abs(price.rest), 5, MAX_HAND_SIZE)
    const moneyGain = drawCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Renvoie toutes les cartes en main dans la pioche puis pioche ${drawCount.value} cartes${
          moneyGain > 0 ? `<hr> Gagne ${moneyGain}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.discardCard({ toDraw: true, reason })

        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyGain > 0) {
          await state.addMoney(moneyGain, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      type: "support",
      cost: resolveCost(price.value),
      needsPlayZone: true,
    }
  },
  (advantage: number) => {
    const price = smartClamp(3 - advantage)
    const moneyGain = Math.abs(price.rest) * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Pioche autant de carte que d'@upgrades découvertes${
          moneyGain > 0 ? `<hr> Gagne ${moneyGain}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.drawCard(state.upgrades.length, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyGain > 0) {
          await state.addMoney(moneyGain, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state) => state.upgrades.length > 0 && state.draw.length >= 1,
      type: "support",
      cost: resolveCost(price.value),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => ({
    description: formatText(
      `Défausse les cartes @support en main(min 1) et pioche 2 cartes @action${
        advantage > 0 ? `<hr> Gagne ${advantage * ENERGY_TO_MONEY}M$` : ""
      }`,
    ),
    onPlayed: async (state, _, reason) => {
      await state.discardCard({
        filter: (card) => card.effect.type === "support",
        reason,
      })

      await state.drawCard(2, {
        filter: (card) => card.effect.type === "action",
        skipGameOverPause: true,
        reason,
      })

      if (advantage > 0) {
        await state.addMoney(advantage * ENERGY_TO_MONEY, {
          skipGameOverPause: true,
          reason,
        })
      }
    },
    condition: (state) =>
      state.hand
        .map((c) => reviveCard(c, state))
        .filter((card) => card.effect.type === "support").length > 1,
    type: "support",
    cost: resolveCost(1),
    waitBeforePlay: true,
  }),
  (advantage: number) => {
    const drawCount = smartClamp(3 + advantage, 3, MAX_HAND_SIZE)
    const moneyCount = drawCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Défausse les cartes @action en main(min 1) et pioche ${drawCount.value} cartes${
          moneyCount > 0 ? `<hr> Gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.discardCard({
          filter: (card) => card.effect.type === "action",
          reason,
        })

        await state.drawCard(drawCount.value, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyCount > 0) {
          await state.addMoney(moneyCount, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state) =>
        state.hand.some(
          (card) => reviveCard(card, state).effect.type === "action",
        ),
      type: "support",
      cost: resolveCost(0),
      waitBeforePlay: true,
    }
  },
  (advantage: number) => {
    const basePrice = 10
    const price = smartClamp(basePrice - advantage)
    const moneyCount = Math.abs(price.rest) * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Recycle toutes les cartes de la défausse${
          moneyCount > 0 ? `<hr> Gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.recycleCard(state.discard.length, { reason })
      },
      condition: (state) => state.discard.length > 0,
      type: "support",
      cost: resolveCost(price.value),
      needsPlayZone: true,
      recycle: true,
    }
  },
  (advantage: number) => {
    const recycleCount = smartClamp(1 + advantage, 1, 10)
    const moneyCount = recycleCount.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Recycle ${recycleCount.value} carte${recycleCount.s} aléatoire${recycleCount.s} de la défausse${
          moneyCount > 0 ? `<hr> Gagne ${moneyCount}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.recycleCard(1 + advantage, { reason })
      },
      condition: (state) => state.discard.length > 0,
      type: "support",
      cost: resolveCost(1),
      needsPlayZone: true,
    }
  },
  (advantage, state) => {
    const basePrice = 4
    const price = smartClamp(basePrice - advantage)
    const energyGain = smartClamp(Math.abs(price.rest), 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Pioche 2 cartes qui coûtent de l'@energy${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.drawCard(2, {
          filter: (c) => c.effect.cost.type === "energy",
          skipGameOverPause: true,
          reason,
        })

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      condition: (state) =>
        state.draw.some(
          (c) => reviveCard(c, state).effect.cost.type === "energy",
        ),
      type: "support",
      cost: resolveCost(price.value),
      waitBeforePlay: true,
    }
  },
  (advantage, state) => {
    const basePrice = 3
    const price = smartClamp(basePrice - advantage)
    const energyGain = smartClamp(Math.abs(price.rest), 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `La prochaine carte jouée coûte la moitié de son prix${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.addGlobalCardModifier(
          "next card half cost",
          [],
          GlobalCardModifierIndex.MultiplyOrDivide,
        )

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      type: "support",
      cost: resolveCost(price.value),
    }
  },
  (advantage, state) => {
    const energyGain = smartClamp(advantage, 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `La prochaine carte qui coûte de l'@energy coûte maintenant de l'argent${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.addGlobalCardModifier(
          "next energy card cost money",
          [],
          GlobalCardModifierIndex.Last,
        )

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      type: "support",
      cost: resolveCost(0),
    }
  },
  (advantage: number) => {
    const price = smartClamp(MAX_HAND_SIZE - advantage)
    const effect = smartClamp(1 + Math.abs(price.rest), 10)
    const moneyGain = effect.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Baisse le prix de toutes les cartes en main de ${
          effect.value
        } @energy${effect.s} ou de ${effect.value * ENERGY_TO_MONEY}M$${
          moneyGain > 0 ? `<hr> Gagne ${moneyGain}M$` : ""
        }`,
      ),
      onPlayed: async (state, card, reason) => {
        const handCardNames = state.hand
          .map((c) => reviveCard(c, state))
          .filter((c) => c.name !== card.name && card.effect.cost.value > 0)
          .map((c) => c.name)

        await state.addGlobalCardModifier(
          "lowers price of hand cards",
          [handCardNames, effect.value],
          GlobalCardModifierIndex.AddOrSubtract,
        )

        if (moneyGain > 0) {
          await state.addMoney(moneyGain, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state, card) =>
        state.hand.some(
          (c) =>
            c[0] !== card.name && reviveCard(c, state).effect.cost.value > 0,
        ),
      type: "support",
      cost: resolveCost(price.value),
      ephemeral: true,
      needsPlayZone: true,
    }
  },
  (advantage, state) => {
    const price = smartClamp(8 - advantage)
    const energyGain = smartClamp(Math.abs(price.rest), 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `${energyGain.value > 0 ? `Gagne ${energyGain.value} @energy${energyGain.s} puis d` : "D"}ouble l'@energy en réserve${
          moneyGain > 0 ? `<hr> Gagne ${moneyGain}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })
        }

        await state.addEnergy(state.energy, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyGain > 0) {
          await state.addMoney(moneyGain, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      type: "action",
      cost: resolveCost(String(price.value * ENERGY_TO_MONEY)),
    }
  },
  (advantage, state) => {
    const energyGain = smartClamp(4 + advantage, 4, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Gagne ${energyGain.value} @energys${
          moneyGain > 0 ? ` et ${moneyGain}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.addEnergy(energyGain.value, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyGain > 0) {
          await state.addMoney(moneyGain, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      type: "action",
      cost: resolveCost(String(4 * ENERGY_TO_MONEY)),
    }
  },
  (advantage, state) => {
    const basePrice = 3
    const baseEnergyGain = 5
    const price = smartClamp(basePrice - advantage)
    const energyGain = smartClamp(
      baseEnergyGain + Math.abs(price.rest),
      baseEnergyGain,
      state.energyMax,
    )
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Si la @reputation est inférieur à 5, gagne ${energyGain.value} @energys${
          moneyGain > 0 ? ` et ${moneyGain}M$` : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.addEnergy(energyGain.value, {
          skipGameOverPause: true,
          reason,
        })

        if (moneyGain > 0) {
          await state.addMoney(moneyGain, {
            skipGameOverPause: true,
            reason,
          })
        }
      },
      condition: (state) => state.reputation < 5,
      type: "action",
      cost: resolveCost(String(price.value * ENERGY_TO_MONEY)),
    }
  },
  (advantage, state) => {
    const basePrice = (MAX_REPUTATION / 2) * REPUTATION_TO_ENERGY
    const price = smartClamp(basePrice - advantage)
    const energyGain = smartClamp(Math.abs(price.rest), 0, state.energyMax)
    const moneyGain = energyGain.rest * ENERGY_TO_MONEY

    return {
      description: formatText(
        `Remplis la jauge de @reputation${
          energyGain.value > 0
            ? `<hr> Gagne ${energyGain.value} @energy${energyGain.s}${
                moneyGain > 0 ? ` et ${moneyGain}M$` : ""
              }`
            : ""
        }`,
      ),
      onPlayed: async (state, _, reason) => {
        await state.addReputation(10, { skipGameOverPause: true, reason })

        if (energyGain.value > 0) {
          await state.addEnergy(energyGain.value, {
            skipGameOverPause: true,
            reason,
          })

          if (moneyGain > 0) {
            await state.addMoney(moneyGain, {
              skipGameOverPause: true,
              reason,
            })
          }
        }
      },
      type: "action",
      cost: resolveCost(String(price.value * ENERGY_TO_MONEY)),
      ephemeral: true,
    }
  },
]

export default effects
