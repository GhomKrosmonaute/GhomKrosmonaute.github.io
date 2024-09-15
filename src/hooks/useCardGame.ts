import { bank } from "@/sound.ts"
import { create } from "zustand"

import achievements from "@/data/achievements.ts"
import cardModifiers from "@/data/cardModifiers"
import generateCards from "@/data/cards.ts"
import generateUpgrades from "@/data/upgrades.ts"

import type {
  CardModifierIndice,
  GameCardIndice,
  GameCardInfo,
  GameLog,
  GameMethodOptions,
  GameOverReason,
  MethodWhoCheckIfGameOver,
  MethodWhoLog,
  TriggerEventName,
  UpgradeIndice,
  GameNotification,
  RawUpgrade,
} from "@/game-typings"

import {
  MAX_ENERGY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  ENERGY_TO_DAYS,
  ENERGY_TO_MONEY,
  REPUTATION_TO_ENERGY,
  INITIAL_CHOICE_COUNT,
  INITIAL_CHOICE_OPTION_COUNT,
  GAME_ADVANTAGE,
  LOCAL_ADVANTAGE,
} from "@/game-constants.ts"

import {
  getDeck,
  generateChoiceOptions,
  isGameOver,
  parseCost,
  parseSave,
  shuffle,
  wait,
  willBeRemoved,
  handleErrors,
  handleErrorsAsync,
  reviveCard,
  reviveUpgrade,
  reviveCardModifier,
  fetchSettings,
  isGameWon,
  isNewSprint,
  updateGameAutoSpeed,
  getGameSpeed,
  GlobalCardModifierIndex,
  generateRandomAdvantage,
  excludeCard,
  updateCardState,
  cardInfoToIndice,
  includeCard,
  upgradeToIndice,
} from "@/game-utils.ts"

import { metadata } from "@/game-metadata.ts"
import { Difficulty, difficultyIndex, settings } from "@/game-settings.ts"

export interface GlobalGameState {
  debug: boolean
  scoreAverage: number
  totalMoney: number
  wonGames: number
  playedGames: number
  discoveries: string[]
  achievements: string[]
  addDiscovery: (...names: string[]) => void
  addAchievement: (name: string) => Promise<void>
  addWonGame: () => void
  addPlayedGame: () => void
  checkAchievements: () => Promise<void>
  checkDiscoveries: () => void
  setDebug: (value: boolean) => void
}

export interface GameState {
  inflation: number
  coinFlips: number
  recycledCards: number
  discardedCards: number
  skippedChoices: number
  increments: (key: keyof GameState, count?: number) => Promise<void>
  incrementsInflation: () => void
  rawUpgrades: RawUpgrade[]
  cards: GameCardInfo[]
  difficulty: Difficulty
  error: Error | null
  handleError: <T>(error: T) => T
  choiceOptionCount: number
  choiceOptions: GameCardIndice[][]
  logs: GameLog[]
  notification: GameNotification[]
  operationInProgress: string[]
  setOperationInProgress: (operation: string, value: boolean) => void
  reason: GameOverReason
  isWon: boolean
  isGameOver: boolean
  infinityMode: boolean
  playZone: GameCardIndice[]
  draw: GameCardIndice[]
  discard: GameCardIndice[]
  hand: GameCardIndice[]
  upgrades: UpgradeIndice[]
  globalCardModifiers: CardModifierIndice[]
  score: number
  day: number
  dayFull: boolean | null
  sprintFull: boolean | null
  /**
   * Entre 0 et 23
   */
  energy: number
  energyMax: number
  reputation: number
  money: number
  coinFlip: (options: {
    onHead: (state: GameState) => Promise<void>
    onTail: (state: GameState) => Promise<void>
  }) => Promise<void>
  advanceTime: (energy: number) => Promise<void>
  addLog: (log: GameLog) => void
  addNotification: (options: GameNotification) => Promise<void>
  dangerouslyUpdate: (partial: Partial<GameState>) => void
  updateScore: () => void
  addEnergy: (count: number, options: GameMethodOptions) => Promise<void>
  addMaxEnergy: (count: number, options: GameMethodOptions) => Promise<void>
  addReputation: (count: number, options: GameMethodOptions) => Promise<void>
  addMoney: (count: number, options: GameMethodOptions) => Promise<void>
  upgrade: (name: string) => Promise<void>
  triggerUpgrade: (
    name: string,
    options: MethodWhoCheckIfGameOver & Partial<MethodWhoLog>,
  ) => Promise<void>
  triggerEvent: (event: TriggerEventName) => Promise<void>
  addGlobalCardModifier: <CardModifierName extends keyof typeof cardModifiers>(
    name: CardModifierName,
    params: Parameters<(typeof cardModifiers)[CardModifierName]>,
    index: number,
  ) => unknown
  drawCard: (
    count: number,
    options: GameMethodOptions &
      Partial<{
        fromDiscardPile: boolean
        filter: (card: GameCardInfo<true>) => boolean
      }>,
  ) => Promise<void>
  discardCard: (options: {
    toDraw?: boolean
    random?: boolean
    reason: GameLog["reason"]
    filter?: (card: GameCardInfo<true>) => boolean
  }) => Promise<void>
  removeCard: (name: string) => Promise<void>
  recycleCard: (count: number, options: GameMethodOptions) => Promise<void>
  playCard: (
    card: GameCardInfo<true>,
    options: GameMethodOptions & { free?: boolean },
  ) => Promise<void>
  skip: (options: MethodWhoLog) => Promise<void>
  pickCard: (card: GameCardInfo<true>) => Promise<void>
  win: () => void
  defeat: (reason: GameOverReason) => void
  reset: () => void
  enableInfinityMode: () => void
}

function generateGlobalGameState(): Omit<
  GlobalGameState,
  keyof ReturnType<typeof generateGlobalGameMethods>
> {
  const save = localStorage.getItem("globals")

  if (save) {
    return JSON.parse(save)
  } else {
    return {
      debug: import.meta.env.DEV,
      scoreAverage: 0,
      totalMoney: 0,
      wonGames: 0,
      playedGames: 0,
      discoveries: [],
      achievements: [],
    }
  }
}

function generateGlobalGameMethods(
  set: (
    partial:
      | GlobalGameState
      | Partial<GlobalGameState>
      | ((
          state: GlobalGameState,
        ) => GlobalGameState | Partial<GlobalGameState>),
    replace?: boolean | undefined,
  ) => void,
  getState: () => GlobalGameState & GameState,
) {
  const updateLocalStorage = () => {
    const state = getState()
    localStorage.setItem(
      "globals",
      JSON.stringify({
        debug: state.debug,
        wonGames: state.wonGames,
        achievements: state.achievements,
        playedGames: state.playedGames,
        discoveries: state.discoveries,
        scoreAverage: state.scoreAverage,
        totalMoney: state.totalMoney,
      } satisfies Omit<
        GlobalGameState,
        keyof ReturnType<typeof generateGlobalGameMethods>
      >),
    )
  }

  return {
    setDebug: (value) => {
      set({ debug: value })
      updateLocalStorage()
    },

    checkAchievements: async () => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        for (const achievement of achievements) {
          if (state.achievements.includes(achievement.name)) continue

          if (achievement.unlockCondition(getState())) {
            state.setOperationInProgress("checkAchievements", true)

            await state.addAchievement(achievement.name)
          }
        }

        state.setOperationInProgress("checkAchievements", false)
      })
    },

    checkDiscoveries: () => {
      handleErrors(getState, () => {
        const state = getState()

        state.addDiscovery(...getDeck(state).map(([name]) => name))
      })
    },

    addDiscovery: (...names) => {
      handleErrors(getState, () => {
        set((state) => {
          return {
            discoveries: Array.from(new Set([...state.discoveries, ...names])),
          }
        })

        updateLocalStorage()
      })
    },

    addAchievement: async (name) => {
      await handleErrorsAsync(getState, async () => {
        set((state) => {
          return {
            achievements: Array.from(new Set([...state.achievements, name])),
          }
        })

        bank.achievement.play()

        await getState().addNotification({
          header: "Succès déverrouillé",
          message: name,
          className: "bg-primary text-primary-foreground text-center",
        })

        updateLocalStorage()
      })
    },

    addWonGame: () => {
      handleErrors(getState, () => {
        const state = getState()

        set({
          wonGames: state.wonGames + 1,
          scoreAverage:
            state.scoreAverage +
            (state.score - state.scoreAverage) / (state.wonGames + 1),
          totalMoney: state.totalMoney + state.money,
          playedGames: state.playedGames + 1,
        })

        updateLocalStorage()
      })
    },

    addPlayedGame: () => {
      handleErrors(getState, () => {
        const state = getState()

        set({
          playedGames: state.playedGames + 1,
          totalMoney: state.totalMoney + state.money,
        })

        updateLocalStorage()
      })
    },
  } satisfies Partial<GlobalGameState>
}

function generateGameState(): Omit<
  GameState,
  keyof ReturnType<typeof generateGameMethods>
> {
  const difficulty = fetchSettings().difficulty
  const saveMetadata = localStorage.getItem("metadata")
  const save = localStorage.getItem("save")

  if (save && JSON.stringify(metadata) === saveMetadata) {
    return parseSave(save, difficulty)
  }

  localStorage.setItem("metadata", JSON.stringify(metadata))

  const advantage = GAME_ADVANTAGE[difficulty]

  const cards = generateCards(advantage)
  const rawUpgrades = generateUpgrades(advantage)

  const startingDeck: string[] = []

  startingDeck.push(
    cards.find((c) => c.effect(0).description.startsWith("Renvoie tout"))!.name,
  )

  startingDeck.push(
    ...cards
      .filter(
        (c) =>
          startingDeck.every((name) => name !== c.name) &&
          c.effect(0).description.startsWith("Pioche"),
      )
      .slice(0, 2)
      .map((c) => c.name),
  )

  startingDeck.push(
    ...cards
      .filter(
        (c) =>
          startingDeck.every((name) => name !== c.name) &&
          c.effect(0).description.startsWith("Recycle"),
      )
      .map((c) => c.name),
  )

  startingDeck.push(
    ...cards
      .filter(
        (c) =>
          startingDeck.every((name) => name !== c.name) &&
          !c.effect(0).upgrade &&
          c.effect(0).description.toLowerCase().includes("gagne") &&
          c.effect(0).description.toLowerCase().includes("énergie"),
      )
      .map((c) => c.name),
  )

  // startingDeck = shuffle(startingDeck, 3)

  const startingChoices: GameCardIndice[][] = []

  for (let i = 0; i < INITIAL_CHOICE_COUNT; i++) {
    startingChoices.push(
      shuffle(
        cards.filter(
          (c) =>
            startingChoices.every((o) =>
              o.every(([name]) => name !== c.name),
            ) &&
            startingDeck.every((name) => name !== c.name) &&
            !c.effect(0).upgrade,
        ),
        5,
      )
        .slice(0, INITIAL_CHOICE_OPTION_COUNT)
        .map((c) => [c.name, "drawing", generateRandomAdvantage()]),
    )
  }

  return {
    coinFlips: 0,
    recycledCards: 0,
    discardedCards: 0,
    skippedChoices: 0,
    rawUpgrades,
    cards,
    difficulty,
    error: null,
    choiceOptions: startingChoices,
    choiceOptionCount: INITIAL_CHOICE_OPTION_COUNT,
    logs: [],
    notification: [],
    operationInProgress: ["choices"],
    score: 0,
    reason: null,
    isWon: false,
    isGameOver: false,
    infinityMode: false,
    draw: startingDeck
      .slice(MAX_HAND_SIZE - 2)
      .map((name) => [name, "idle", LOCAL_ADVANTAGE.common]),
    hand: startingDeck
      .slice(0, MAX_HAND_SIZE - 2)
      .map((name) => [name, "idle", LOCAL_ADVANTAGE.common]),
    playZone: [],
    discard: [],
    upgrades: [],
    globalCardModifiers: [
      ["upgrade cost threshold", [], GlobalCardModifierIndex.First],
      ["all card inflation", [], GlobalCardModifierIndex.Last],
    ],
    day: 0,
    dayFull: false,
    sprintFull: false,
    energy: MAX_ENERGY,
    energyMax: MAX_ENERGY,
    reputation: MAX_REPUTATION,
    money: 0,
    inflation: 0,
  }
}

function generateGameMethods(
  set: (
    partial:
      | GameState
      | Partial<GameState>
      | ((state: GameState) => GameState | Partial<GameState>),
    replace?: boolean | undefined,
  ) => void,
  getState: () => GameState & GlobalGameState,
) {
  return {
    skip: async (options) => {
      await handleErrorsAsync(getState, async () => {
        bank.play.play()

        const state = getState()

        await state.addEnergy(
          isNewSprint(state.day) && state.choiceOptions.length === 1 ? 10 : 5,
          {
            reason: options.reason,
            skipGameOverPause: true,
          },
        )

        set({
          choiceOptions: state.choiceOptions.slice(1),
        })

        await state.increments("skippedChoices")
      })
    },

    increments: async (key, count) => {
      const state = getState()

      if (typeof state[key] !== "number") return

      set({ [key]: state[key] + (count ?? 1) })

      await state.checkAchievements()
    },

    incrementsInflation: () => {
      const state = getState()
      const newInflation = state.inflation + 1

      if (state.inflation < GAME_ADVANTAGE[state.difficulty]) {
        const baseGameAdvantage = GAME_ADVANTAGE[state.difficulty]

        set({
          inflation: newInflation,
          cards: generateCards(baseGameAdvantage - newInflation),
          rawUpgrades: generateUpgrades(baseGameAdvantage - newInflation),
        })
      } else {
        set({ inflation: newInflation })
      }
    },

    handleError: (error) => {
      if (error instanceof Error) {
        set({ error })
      } else {
        set({ error: new Error(String(error)) })
      }

      return error
    },

    coinFlip: async (options) => {
      await handleErrorsAsync(getState, async () => {
        bank.coinFlip.play()

        const state = getState()

        state.setOperationInProgress("coinFlip", true)

        const result = Math.random() > 0.5
        const resultName = result ? "Face" : "Pile"

        const card = reviveCard(
          state.playZone[state.playZone.length - 1],
          state,
        )

        const message = card.effect.description
          .split("<br/>")
          .slice(1)
          .map((s) => s.trim())
          .find((line) => line.startsWith(resultName))

        await Promise.all([
          await state.addNotification({
            message: message?.replace(`${resultName}:`, "") ?? resultName,
            className: "bg-background text-foreground",
          }),
          await options[result ? "onHead" : "onTail"](state),
        ])

        await state.increments("coinFlips")

        state.setOperationInProgress("coinFlip", false)
      })
    },

    advanceTime: async (energy: number) => {
      await handleErrorsAsync(getState, async () => {
        if (energy < 0) return

        const state = getState()

        state.setOperationInProgress("advanceTime", true)

        const addedTime = Math.max(ENERGY_TO_DAYS, energy * ENERGY_TO_DAYS)

        if (addedTime < ENERGY_TO_DAYS) {
          throw state.handleError(
            new Error(`Not enough energy to advance time: ${energy}`),
          )
        }

        let currentDay = Math.floor(state.day)
        const afterTime = state.day + addedTime
        const afterDay = Math.floor(afterTime)

        for (currentDay; currentDay < afterDay; currentDay++) {
          const newSprint = currentDay !== 0 && (currentDay + 1) % 7 === 0
          const newMonth = newSprint && (currentDay + 1) % 28 === 0

          // debugger;

          set({
            day: currentDay + 1,
            dayFull: true,
            sprintFull: newSprint,
          })

          // on joue le son de la banque
          bank.bell.play()
          if (newSprint) bank.upgrade.play()

          await state.addNotification({
            message: newSprint
              ? `Sprint ${Math.floor((currentDay + 1) / 7)}`
              : `Jour ${currentDay + 1}`,
            className: newSprint
              ? "bg-upgrade text-upgrade-foreground"
              : "bg-day text-day-foreground",
          })

          await state.triggerEvent("daily")

          set((state) => ({
            dayFull: false,
            choiceOptions: newSprint
              ? state.choiceOptions
              : [
                  ...state.choiceOptions,
                  generateChoiceOptions(getState(), {
                    filter: (c) => !c.effect(0).upgrade,
                  }),
                ],
          }))

          if (newSprint) {
            await state.triggerEvent("weekly")

            const fullState = getState()

            set((state) => ({
              sprintFull: false,
              choiceOptions: [
                ...state.choiceOptions,
                generateChoiceOptions(fullState, {
                  filter: (c) => !c.effect(0).upgrade && c.type === "action",
                }),
                generateChoiceOptions(fullState, {
                  filter: (c) => Boolean(c.effect(0).upgrade),
                }),
              ],
            }))

            if (newMonth) {
              await state.addNotification({
                header: "L'inflation augmente",
                message: `Mois ${Math.floor((currentDay + 1) / 7)}`,
                className: "bg-inflation text-inflation-foreground",
              })

              state.incrementsInflation()

              await state.triggerEvent("monthly")
            }
          }

          await wait(1000)
        }

        set({ day: afterTime, dayFull: null, sprintFull: null })

        state.setOperationInProgress("advanceTime", false)
      })
    },

    addLog: (log) => {
      set((state) => ({
        logs: [...state.logs, log],
      }))
    },

    addNotification: async (notification) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        if (state.notification.length > 0) {
          throw state.handleError(
            new Error(
              `Trying to add a notification while one is already displayed: ${JSON.stringify(notification)}`,
            ),
          )
        }

        set((state) => ({
          notification: [notification, ...state.notification],
        }))

        await wait(2000)

        set((state) => ({
          notification: state.notification.slice(1),
        }))
      })
    },

    dangerouslyUpdate: (partial: Partial<GameState>) => set(partial),

    setOperationInProgress: (operation: string, value: boolean) => {
      handleErrors(getState, () => {
        set((state) => ({
          operationInProgress: value
            ? Array.from(new Set([...state.operationInProgress, operation]))
            : state.operationInProgress.filter((op) => op !== operation),
        }))
      })
    },

    updateScore: () => {
      handleErrors(getState, () => {
        const state = getState()

        // Coefficients de pondération pour chaque élément
        const energyWeight = 1
        const reputationWeight = REPUTATION_TO_ENERGY
        const moneyWeight = 1 / ENERGY_TO_MONEY

        // Calcul des points pour chaque élément
        const energyPoints = state.energy * energyWeight
        const reputationPoints = state.reputation * reputationWeight
        const moneyPoints = state.money * moneyWeight

        // Calcul des points pour les améliorations
        let upgradesPoints = 0
        state.upgrades.forEach((indice) => {
          const upgrade = reviveUpgrade(indice, state)

          upgradesPoints +=
            (typeof upgrade.cost === "string"
              ? Number(upgrade.cost) / ENERGY_TO_MONEY
              : upgrade.cost) * upgrade.cumul
        })

        // Calcul du multiplicateur en fonction des jours
        let daysMultiplier = 1
        if (state.day <= 28) {
          daysMultiplier = 2
        } else if (state.day <= 56) {
          daysMultiplier = 1.5
        }

        // Calcul du multiplicateur en fonction de la difficulté
        const difficultyMultiplier =
          1 + (difficultyIndex[settings.difficulty] - 3) * 0.2 // Diff. 3 = x1, diff. 4 = x1.2, diff. 2 = x0.8, etc.

        // Calcul du score total
        const baseScore =
          energyPoints + reputationPoints + moneyPoints + upgradesPoints
        const finalScore = baseScore * daysMultiplier * difficultyMultiplier

        const completion = state.money / MONEY_TO_REACH

        set({
          score: Math.round(finalScore * completion * 10),
        })
      })
    },

    addEnergy: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress("energy", true)

        if (count > 0) {
          const addedEnergy = Math.min(count, state.energyMax - state.energy)

          if (addedEnergy > 0) {
            state.addLog({
              value: addedEnergy,
              type: "energy",
              reason: options.reason,
            })
          }

          set((state) => {
            return {
              energy: Math.max(
                0,
                Math.min(state.energyMax, state.energy + count),
              ),
            }
          })

          bank.gain.play()

          await wait()
        } else if (count < 0) {
          const state = getState()

          // on retire toute l'énergie et on puise dans la réputation pour le reste
          const missingEnergy = Math.abs(count) - state.energy
          const consumedEnergy = Math.min(Math.abs(count), state.energy)

          if (consumedEnergy > 0) {
            state.addLog({
              value: -consumedEnergy,
              type: "energy",
              reason: options.reason,
            })
          }

          if (missingEnergy > 0) {
            set({ energy: 0 })

            await state.addReputation(-missingEnergy, options)
          } else {
            set((state) => {
              return {
                energy: state.energy + count,
              }
            })
          }
        }

        state.setOperationInProgress("energy", false)
      })
    },

    addMaxEnergy: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        if (count === 0) return

        const state = getState()

        state.setOperationInProgress("maxEnergy", true)

        set((state) => {
          return {
            energyMax: Math.max(0, state.energyMax + count),
          }
        })

        if (count > 0) {
          bank.powerUp.play()

          await wait()

          await state.addEnergy(count, options)
        } else {
          bank.loss.play()

          await wait()

          if (state.energy > state.energyMax) {
            await state.addEnergy(state.energyMax - state.energy, options)
          }
        }

        state.setOperationInProgress("maxEnergy", false)
      })
    },

    addReputation: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress("reputation", true)

        // on joue le son de la banque
        if (count === 10) bank.powerUp.play()
        else if (count > 0) bank.gain.play()
        else bank.loss.play()

        if (count !== 0) {
          state.addLog({
            value: count,
            type: "reputation",
            reason: options.reason,
          })
        }

        set((state) => {
          return {
            reputation: Math.max(
              0,
              Math.min(MAX_REPUTATION, state.reputation + count),
            ),
          }
        })

        await wait()

        if (count < 0) await state.triggerEvent("onReputationDeclines")

        if (!options?.skipGameOverPause && isGameOver(state)) {
          await wait(2000)
        }

        state.setOperationInProgress("reputation", false)
      })
    },

    addMoney: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        let state = getState()

        state.setOperationInProgress("money", true)

        if (count !== 0) {
          state.addLog({
            value: count,
            type: "money",
            reason: options?.reason,
          })
        }

        if (count > 0) {
          bank.cashing.play()

          await wait()
        }

        set((state) => {
          const money = state.money + count

          return { money }
        })

        state = getState()

        if (!options?.skipGameOverPause && state.money >= MONEY_TO_REACH) {
          await wait(2000)
        }

        state.setOperationInProgress("money", false)
      })
    },

    upgrade: async (name) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`upgrade ${name}`, true)

        const rawUpgrade = state.rawUpgrades.find((a) => a.name === name)!

        // on joue le son de la banque
        bank.upgrade.play()

        // si l'activité est déjà découverte, on augmente son cumul
        if (state.upgrades.find((a) => a[0] === name)) {
          set((state) => {
            return {
              upgrades: state.upgrades.map((a) => {
                if (a[0] === name) {
                  return [a[0], a[1] + 1, a[2]]
                }
                return a
              }),
            }
          })
        } else {
          set((state) => {
            return {
              upgrades: [...state.upgrades, [rawUpgrade.name, 1, "appear"]],
            }
          })
        }

        await wait()

        // remet l'activité en idle
        set((state) => {
          return {
            upgrades: state.upgrades.map((a) => {
              if (a[0] === name) {
                return [a[0], a[1], "idle"]
              }
              return a
            }),
          }
        })

        if (rawUpgrade.eventName === "onUpgradeThis") {
          await state.triggerUpgrade(name, {})
        }

        state.setOperationInProgress(`upgrade ${name}`, false)
      })
    },

    triggerUpgrade: async (name, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()
        const indice = state.upgrades.find((a) => a[0] === name)!
        const upgrade = reviveUpgrade(indice, state)

        if (!upgrade.condition || upgrade.condition(getState(), upgrade)) {
          state.setOperationInProgress(`triggerUpgrade ${name}`, true)

          // mettre l'activité en triggered
          set({
            upgrades: state.upgrades.map((a) => {
              if (a[0] === upgrade.name) {
                return [a[0], a[1], "triggered"]
              }
              return a
            }),
          })

          await wait()

          await upgrade.onTrigger(
            getState(),
            upgrade,
            options?.reason ?? indice,
          )

          // remettre l'activité en idle
          set((state) => ({
            upgrades: state.upgrades.map((a) => {
              if (a[0] === upgrade.name) {
                return [a[0], a[1], "idle"]
              }
              return a
            }),
          }))

          state.setOperationInProgress(`triggerUpgrade ${name}`, false)
        }
      })
    },

    triggerEvent: async (event) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`triggerUpgradeEvent ${event}`, true)

        const upgrades = state.upgrades
          .map((indice) => reviveUpgrade(indice, state))
          .filter((upgrade) => upgrade.eventName === event)

        for (const upgrade of upgrades) {
          await state.triggerUpgrade(upgrade.name, {
            reason: upgradeToIndice(upgrade),
          })
        }

        state.setOperationInProgress(`triggerUpgradeEvent ${event}`, false)
      })
    },

    addGlobalCardModifier: async (name, params, index) => {
      await handleErrorsAsync(getState, async () => {
        bank.powerUp.play()

        const indice = [name, params, index] as unknown as CardModifierIndice

        set((state) => {
          return {
            globalCardModifiers: [...state.globalCardModifiers, indice],
          }
        })
      })
    },

    drawCard: async (count = 1, options) => {
      await handleErrorsAsync(getState, async () => {
        let state = getState()

        state.setOperationInProgress("draw", true)

        const fromKey = options?.fromDiscardPile ? "discard" : "draw"

        const hand = state.hand.slice()

        const from = state[fromKey].slice().filter((c) => {
          const card = reviveCard(c, state)
          if (options?.filter) return options.filter(card)
          return true
        })

        const drawn: GameCardIndice[] = []

        let handAdded = false

        for (let i = 0; i < count; i++) {
          if (from.length === 0) {
            break
          }

          const cardIndice = from.pop()!

          cardIndice[1] = "drawing"

          drawn.push(cardIndice)

          if (hand.length < MAX_HAND_SIZE) {
            hand.push(cardIndice)
            handAdded = true
          }
        }

        if (handAdded) {
          if (fromKey === "draw") bank.draw.play()
          else bank.recycle.play()
        }

        set({
          hand,
          [fromKey]: shuffle(
            excludeCard(
              state[fromKey],
              drawn.map(([name]) => name),
            ),
            2,
          ),
        })

        await wait()

        // on passe la main en idle
        set((state) => ({
          hand: updateCardState(state.hand, "idle"),
        }))

        await state.triggerEvent("onDraw")

        state = getState()

        if (!options?.skipGameOverPause && isGameOver(state)) {
          await wait(2000)
        }

        state.setOperationInProgress("draw", false)
      })
    },

    discardCard: async (options) => {
      await handleErrorsAsync(getState, async () => {
        const toKey = options?.toDraw ? "draw" : "discard"

        // on joue le son de la banque
        bank.drop.play()

        const state = getState()

        state.setOperationInProgress("discard", true)

        const hand = state.hand
          .slice()
          .filter(
            (c) =>
              c[1] !== "playing" &&
              (!options?.filter || options.filter(reviveCard(c, state))),
          )

        const discarded = (
          options?.random
            ? [hand[Math.floor(Math.random() * state.hand.length)]]
            : hand
        ).map(([name]) => name)

        // on active l'animation de retrait des cartes
        set({
          hand: updateCardState(state.hand, discarded, "discarding"),
        })

        // on attend la fin de l'animation
        await wait()

        // les cartes retournent dans le deck et on vide la main
        set((state) => ({
          [toKey]: shuffle(
            [...includeCard(state.hand, discarded), ...state[toKey]],
            2,
          ),
          hand: excludeCard(state.hand, discarded),
        }))

        await state.increments("discardedCards", discarded.length)

        state.setOperationInProgress("discard", false)
      })
    },

    removeCard: async (name) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`removeCard ${name}`, true)

        if (state.hand.some((c) => c[0] === name)) {
          // on active l'animation de suppression de la carte
          set({
            hand: updateCardState(state.hand, name, "removing"),
          })

          bank.remove.play()

          // on attend la fin de l'animation
          await wait()
        }

        // on retire la carte de la main, du deck et de la défausse

        const from = ["discard", "draw", "hand"] as const

        set((state) => ({
          ...from.reduce((acc, key) => {
            return {
              ...acc,
              [key]: state[key].filter((c) => c[0] !== name),
            }
          }, {} as Partial<GameState>),
        }))

        state.setOperationInProgress(`removeCard ${name}`, false)
      })
    },

    /**
     * Place des cartes de la défausse dans le deck
     */
    recycleCard: async (count = 1) => {
      await handleErrorsAsync(getState, async () => {
        if (count <= 0) return

        const state = getState()

        if (state.discard.length === 0) return

        state.setOperationInProgress("recycle", true)

        // on joue le son de la banque
        bank.recycle.play()

        const discard = shuffle(state.discard, 2).slice()
        const draw = state.draw.slice()

        let recycled = 0

        for (let i = 0; i < count; i++) {
          if (discard.length === 0) {
            break
          }

          const card = discard.pop()!

          draw.push(card)

          recycled++
        }

        await wait()

        set({
          draw: shuffle(draw, 2),
          discard,
        })

        await state.increments("recycledCards", recycled)

        state.setOperationInProgress("recycle", false)
      })
    },

    playCard: async (card, options) => {
      await handleErrorsAsync(getState, async () => {
        const free = !!options?.free

        let state = getState()

        const reason = options?.reason ?? card

        const cantPlay = async () => {
          // jouer le son de la banque
          bank.unauthorized.play()

          // activer l'animation can't play
          set({
            hand: updateCardState(state.hand, card.name, "unauthorized"),
          })

          // on attend la fin de l'animation
          await wait()

          // on remet la carte en idle
          set({
            hand: updateCardState(state.hand, card.name, "idle"),
          })
        }

        // on vérifie la condition s'il y en a une (eval(effect.condition))
        if (card.effect.condition && !card.effect.condition(state, card)) {
          await cantPlay()

          return
        }

        const { needs, cost, appliedModifiers } = parseCost(state, card, [])

        if (
          free ||
          Number(card.effect.cost) === 0 ||
          (needs === "money"
            ? state.money >= cost
            : state.reputation + state.energy >= cost)
        ) {
          state.setOperationInProgress(`play ${card.name}`, true)

          set((state) => ({
            hand: updateCardState(state.hand, card.name, "selected"),
          }))

          if (!free) {
            await (needs === "money"
              ? state.addMoney(-cost, { skipGameOverPause: true, reason })
              : state.addEnergy(-cost, { skipGameOverPause: true, reason }))
          }
        } else {
          await cantPlay()

          return
        }

        // on joue le son de la banque
        bank.play.play()

        const removing = willBeRemoved(getState(), card)
        const recycling = card.effect.recycle

        if (removing) {
          wait(getGameSpeed() / 2).then(() => bank.remove.play())
        }

        const firstState = removing ? "removing" : "playing"

        // on active l'animation de la carte en la déplaçant dans la playZone si besoin
        if (card.effect.needsPlayZone) {
          set({
            playZone: [...state.playZone, cardInfoToIndice(card)],
            hand: excludeCard(state.hand, card.name),
          })
        } else {
          set((state) => ({
            hand: updateCardState(state.hand, card.name, firstState),
          }))
        }

        const cleanupAndFinish = async () => {
          if (recycling) bank.recycle.play()

          if (card.effect.needsPlayZone) {
            set((state) => ({
              playZone: updateCardState(state.playZone, card.name, firstState),
            }))

            await wait()
          }

          // la carte va dans la défausse et on retire la carte de la main ou de la playZone
          set((state) => ({
            discard:
              removing || recycling
                ? state.discard
                : shuffle([cardInfoToIndice(card), ...state.discard], 3),
            draw: recycling
              ? shuffle([cardInfoToIndice(card), ...state.draw], 3)
              : state.draw,
            hand: excludeCard(state.hand, card.name),
            playZone: excludeCard(state.playZone, card.name),
            globalCardModifiers: state.globalCardModifiers.filter((indice) => {
              const modifier = reviveCardModifier(indice)

              // on le garde si :
              return (
                // il n'est pas unique
                !modifier.once ||
                // il n'a pas été appliqué
                !appliedModifiers.some((m) => m === indice)
              )
            }),
          }))
        }

        const triggerCardEffect = async () => {
          // on applique l'effet de la carte (toujours via eval)
          await card.effect.onPlayed(getState(), card, reason)
        }

        if (card.effect.waitBeforePlay) {
          await wait()
          await cleanupAndFinish()
          await triggerCardEffect()
        } else if (card.effect.needsPlayZone) {
          await triggerCardEffect()
          await cleanupAndFinish()
        } else {
          await Promise.all([
            wait().then(() => cleanupAndFinish()),
            triggerCardEffect(),
          ])
        }

        await state.triggerEvent("onPlay")

        // on vérifie si la main est vide
        // si la main est vide, on pioche

        state = getState()

        if (state.hand.length === 0) {
          await state.triggerEvent("onEmptyHand")
          await state.drawCard(1, { reason })
        }

        await state.advanceTime(
          needs === "money" ? cost / ENERGY_TO_MONEY : cost,
        )

        if (!options?.skipGameOverPause && isGameOver(getState())) {
          await wait(2000)
        }

        state.setOperationInProgress(`play ${card.name}`, false)
      })
    },

    pickCard: async (card) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`pick ${card.name}`, true)

        // on joue le son de la banque
        bank.gain.play()
        if (state.choiceOptions[0].length > 1) bank.remove.play()

        // on active les animations
        set({
          choiceOptions: state.choiceOptions.map((options) => {
            return options.map((c) => {
              if (c[0] === card.name) {
                return [c[0], "playing", c[2]]
              }
              return [c[0], "removing", c[2]]
            })
          }),
        })

        await Promise.all([
          (async () => {
            // on attend la fin de l'animation "played"

            await wait()

            // on retire l'animation de "played" et on ajoute la carte à la pioche

            set((state) => ({
              choiceOptions: state.choiceOptions.map((options) => {
                return updateCardState(options, card.name, "removed")
              }),
            }))
          })(),
          (async () => {
            // on attend la fin de l'animation "removed"

            await wait()

            // on retire l'animation de "removed"

            set((state) => ({
              choiceOptions: state.choiceOptions.map((options) => {
                return updateCardState(options, null)
              }),
            }))
          })(),
        ])

        // on retire un groupe de choix et on ajoute la carte à la pioche

        set((state) => {
          const to = state.hand.length < MAX_HAND_SIZE ? "hand" : "draw"

          return {
            choiceOptions: state.choiceOptions.slice(1),
            [to]:
              to === "draw"
                ? shuffle([...state.draw, cardInfoToIndice(card)], 3)
                : [
                    ...state.hand,
                    cardInfoToIndice(card, "drawing") satisfies GameCardIndice,
                  ],
          }
        })

        await wait()

        // on passe les cartes en idle
        set((state) => ({
          hand: updateCardState(state.hand, "idle"),
        }))

        state.setOperationInProgress(`pick ${card.name}`, false)
      })
    },

    win: () => {
      set({ isGameOver: true, isWon: true })
    },

    defeat: (reason) => {
      bank.defeat.play()

      set({
        isGameOver: true,
        isWon: false,
        reason,
      })
    },

    reset: () => {
      localStorage.removeItem("metadata")
      localStorage.removeItem("save")

      set({
        ...generateGameState(),
        ...generateGlobalGameState(),
      })
    },

    enableInfinityMode: () => {
      set({
        infinityMode: true,
        isGameOver: false,
        isWon: false,
      })
    },
  } satisfies Partial<GameState>
}

export const useCardGame = create<GameState & GlobalGameState>(
  (set, getState) => {
    const state = {
      ...generateGameState(),
      ...generateGameMethods(set, getState),
      ...generateGlobalGameState(),
      ...generateGlobalGameMethods(set, getState),
    }

    state.discoveries = Array.from(
      new Set([...state.discoveries, ...getDeck(state).map(([name]) => name)]),
    )

    return state
  },
)

useCardGame.subscribe(async (state, prevState) => {
  await handleErrorsAsync(
    () => state,
    async () => {
      if (state.error) return

      // on met à jour le score
      if (
        state.reputation !== prevState.reputation ||
        state.money !== prevState.money ||
        state.upgrades !== prevState.upgrades ||
        state.energy !== prevState.energy ||
        state.day !== prevState.day
      )
        state.updateScore()

      localStorage.setItem(
        "save",
        JSON.stringify(
          {
            coinFlips: state.coinFlips,
            recycledCards: state.recycledCards,
            discardedCards: state.discardedCards,
            skippedChoices: state.skippedChoices,
            difficulty: state.difficulty,
            error: state.error,
            choiceOptions: state.choiceOptions,
            choiceOptionCount: state.choiceOptionCount,
            draw: state.draw,
            hand: state.hand,
            discard: state.discard,
            playZone: state.playZone,
            upgrades: state.upgrades,
            globalCardModifiers: state.globalCardModifiers,
            day: state.day,
            energy: state.energy,
            energyMax: state.energyMax,
            reputation: state.reputation,
            notification: state.notification,
            dayFull: state.dayFull,
            sprintFull: state.sprintFull,
            money: state.money,
            reason: state.reason,
            isWon: state.isWon,
            operationInProgress: state.operationInProgress,
            isGameOver: state.isGameOver,
            infinityMode: state.infinityMode,
            logs: state.logs,
            score: state.score,
            inflation: state.inflation,
          } satisfies Omit<
            GameState,
            | keyof ReturnType<typeof generateGameMethods>
            | "cards"
            | "rawUpgrades"
          >,
          (key, value) => {
            if (typeof value === "function" && !(key in state)) return undefined
            return value
          },
        ),
      )

      // si aucune opération n'est en cours
      if (
        state.operationInProgress.join(",") !==
          prevState.operationInProgress.join("") &&
        state.operationInProgress.length === 0
      ) {
        if (isGameWon(state)) {
          await state.addAchievement("Première victoire")
        }

        state.checkDiscoveries()

        await state.checkAchievements()

        updateGameAutoSpeed(state)

        // on vérifie si le jeu est fini
        if (isGameWon(state)) {
          state.win()
          state.addWonGame()
        } else if (!state.isGameOver) {
          const reason = isGameOver(state)

          if (reason) {
            state.defeat(reason)
            state.addPlayedGame()
          }
        }

        // todo: trouver un moyen de faire fonctionner les templates
        // const cardWithTemplate = state.hand.filter((card) => card.effect.template);
        // const changed: [string, string][] = [];
        //
        // for (const card of cardWithTemplate) {
        //   const template = card.effect.template!(
        //     state,
        //     card,
        //     !card.effect.condition || card.effect.condition(state, card),
        //   );
        //
        //   if (!card.effect.description.includes(`<template>${template}</template>`))
        //     changed.push([card.name, template]);
        // }
        //
        // if (changed.length > 0) {
        //   state.dangerouslyUpdate({
        //     hand: state.hand.map((card) => {
        //       const template = changed.find(([name]) => name === card.name)?.[1];
        //       if (template) {
        //         return {
        //           ...card,
        //           effect: {
        //             ...card.effect,
        //             description: card.effect.description.replace(
        //               /<template>.+?<\/template>/,
        //               `<template>${template}</template>`,
        //             ),
        //           },
        //         };
        //       }
        //       return card;
        //     }),
        //   });
        // }
      }
    },
  )
})
