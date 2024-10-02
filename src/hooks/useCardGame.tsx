import { bank } from "@/sound.ts"
import { create } from "zustand"

import cards from "@/data/cards.tsx"
import upgrades from "@/data/upgrades.tsx"
import achievements from "@/data/achievements.tsx"
import cardModifiers from "@/data/cardModifiers.ts"

import {
  GameLog,
  GameResource,
  GameCardInfo,
  MethodWhoLog,
  UpgradeCompact,
  GameCardCompact,
  GameOverReason,
  TriggerEventName,
  ScreenMessageOptions,
  GameMethodOptions,
  CardModifierCompact,
  MethodWhoCheckIfGameOver,
  GameModifierLog,
  compactUpgrade,
  compactGameCardInfo,
  isGameResource,
  ChoiceOptions,
  CoinFlipOptions,
  GameDetailData,
} from "@/game-typings"

import {
  MAX_ENERGY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  ENERGY_TO_DAYS,
  ENERGY_TO_MONEY,
  RARITIES,
  REPUTATION_TO_ENERGY,
  INITIAL_CHOICE_COUNT,
  INITIAL_CHOICE_OPTION_COUNT,
  ADVANTAGE_THRESHOLD,
} from "@/game-constants.ts"

import {
  isGameOver,
  reviveCard,
  reviveUpgrade,
  willBeRemoved,
  generateChoiceOptions,
  revivedState,
  toSortedCards,
} from "@/game-utils.ts"

import { metadata } from "@/game-metadata.ts"
import { Difficulty } from "@/game-typings.ts"
import { difficultyIndex, settings } from "@/game-settings.ts"
import {
  generateRandomRarity,
  updateGameAutoSpeed,
  handleErrorsAsync,
  fetchSettings,
  handleErrors,
  isNewSprint,
  isGameWon,
  parseSave,
  getDeck,
  shuffle,
  wait,
  excludeCard,
  updateCardState,
  canBeBuy,
  getUsableCost,
  costToEnergy,
  save,
  updateUpgradeState,
  waitFor,
  getRevivedDeck,
  getGameSpeed,
  map,
  dropToStack,
} from "@/game-safe-utils.tsx"
import { Tag } from "@/components/game/Texts.tsx"

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
  detail: GameDetailData
  setDetail: (card: GameDetailData) => void
  inflation: number
  coinFlips: number
  recycledCards: number
  discardedCards: number
  skippedChoices: number
  increments: (key: keyof GameState, count?: number) => Promise<void>
  incrementsInflation: () => void
  selectedCard: string | null
  difficulty: Difficulty
  error: Error | null
  handleError: <T>(error: T) => T
  choiceOptionCount: number
  choiceOptions: ChoiceOptions[]
  logs: GameLog[]
  screenMessageQueue: ScreenMessageOptions[]
  operationInProgress: string[]
  setOperationInProgress: (operation: string, value: boolean) => void
  reason: GameOverReason
  isWon: boolean
  isGameOver: boolean
  infinityMode: boolean
  requestedCancel: boolean
  playZone: GameCardCompact[]
  draw: GameCardCompact[]
  hand: GameCardCompact[]
  discard: GameCardCompact[]
  revivedDraw: GameCardInfo<true>[]
  revivedHand: GameCardInfo<true>[]
  revivedDiscard: GameCardInfo<true>[]
  upgrades: UpgradeCompact[]
  globalCardModifiers: CardModifierCompact<any>[]
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
  coinFlip: (
    options: CoinFlipOptions<true> &
      MethodWhoLog & { card: GameCardInfo<true> },
  ) => Promise<void>
  advanceTime: (energy: number) => Promise<void>
  addLog: (log: GameLog) => void
  addScreenMessage: (message: Omit<ScreenMessageOptions, "id">) => Promise<void>
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
    reason: GameModifierLog["reason"],
  ) => Promise<void>
  transformCardsAnimation: (
    names: string[],
    onMiddle: (cards: GameCardInfo<true>[]) => unknown,
  ) => Promise<void>
  shuffleStack: (stack: "draw" | "discard") => Promise<void>
  riseToTheStackSurface: (
    stack: "draw" | "discard",
    filter: (card: GameCardInfo<true>) => boolean,
  ) => Promise<void>
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
  recycleCard: (
    options: GameMethodOptions & {
      count?: number
      filter?: (card: GameCardInfo<true>) => boolean
      shuffleBefore?: boolean
    },
  ) => Promise<void>
  playCard: (
    card: GameCardInfo<true>,
    options: GameMethodOptions & { free?: boolean },
  ) => Promise<void>
  selectCard: (name: string) => void
  waitCardSelection: <T extends GameCardCompact | GameCardInfo<true>>(options: {
    from: T[]
    timeout?: number
  }) => Promise<GameCardInfo<true> | null>
  skip: (options: MethodWhoLog) => Promise<void>
  pickOption: (
    option: GameCardInfo<true> | GameResource,
    resolvedOptions: (GameCardInfo<true> | GameResource)[],
  ) => Promise<void>
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

        state.addDiscovery(...getDeck(state).map((c) => c.name))
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

        await getState().addScreenMessage({
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
    return parseSave(save)
  }

  localStorage.setItem("metadata", JSON.stringify(metadata))

  const startingDeck: string[] = ["Prettier", "Knex", "Jest", "Processing"]

  // startingDeck = shuffle(startingDeck, 3)

  const startingChoices: ChoiceOptions[] = []

  for (let i = 0; i < INITIAL_CHOICE_COUNT; i++) {
    const current = shuffle(
      cards.filter(
        (c) =>
          startingChoices.every((choice) =>
            choice
              .options()
              .every((o) => (o as GameCardCompact).name !== c.name),
          ) &&
          startingDeck.every((name) => name !== c.name) &&
          !c.effect().tags.includes("upgrade"),
      ),
      5,
    )
      .slice(0, INITIAL_CHOICE_OPTION_COUNT)
      .map((c) => ({
        name: c.name,
        state: "idle" as const,
        initialRarity: generateRandomRarity(),
      }))

    startingChoices.push({
      header: "Choisis une carte",
      options: () => current,
    })
  }

  return {
    detail: null,
    selectedCard: null,
    coinFlips: 0,
    recycledCards: 0,
    discardedCards: 0,
    skippedChoices: 0,
    difficulty,
    error: null,
    choiceOptions: startingChoices,
    choiceOptionCount: INITIAL_CHOICE_OPTION_COUNT,
    logs: [],
    screenMessageQueue: [],
    operationInProgress: ["choices"],
    score: 0,
    reason: null,
    isWon: false,
    isGameOver: false,
    infinityMode: false,
    requestedCancel: false,
    draw: startingDeck.slice(MAX_HAND_SIZE - 2).map((name) => ({
      name,
      state: "idle",
      initialRarity: RARITIES.common,
    })),
    hand: startingDeck.slice(0, MAX_HAND_SIZE - 2).map((name) => ({
      name,
      state: "idle",
      initialRarity: RARITIES.common,
    })),
    revivedHand: [],
    revivedDraw: [],
    revivedDiscard: [],
    playZone: [],
    discard: [],
    upgrades: [],
    globalCardModifiers: [
      {
        name: "upgrade cost threshold",
        params: [],
        reason: {
          name: "Promotion temporaire",
          body: "Promotion temporaire",
        },
      },
      {
        name: "all card inflation",
        params: [],
        reason: {
          name: "Inflation",
          body: <Tag name="inflation" />,
        },
      },
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
    setDetail: (card) => {
      set({ detail: card })
    },

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

        set((state) => ({
          choiceOptions: state.choiceOptions.slice(1),
        }))

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
      const newInflation = state.inflation + ADVANTAGE_THRESHOLD

      set({ inflation: newInflation })
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
        const resultName = result ? "head" : "tail"

        const message = options[resultName].message

        await Promise.all([
          await state.addScreenMessage({
            message,
            className: "bg-background text-foreground",
          }),
          await options[resultName].onTrigger(
            state,
            options.card,
            options.reason,
          ),
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

        const upgradeCompletion = state.upgrades.length / upgrades.length
        const cardCompletion = getDeck(state).length / cards.length
        const energyToDays = map(
          0.5 * cardCompletion + 0.5 * upgradeCompletion,
          0,
          1,
          ENERGY_TO_DAYS,
          ENERGY_TO_DAYS * 0.3,
        )

        const addedTime = Math.max(energyToDays, energy * energyToDays)

        if (addedTime < energyToDays) {
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

          await state.addScreenMessage({
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
                    header: "Choisis une carte",
                    filter: (c) => !c.effect().tags.includes("upgrade"),
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
                  noResource: true,
                  header: (
                    <>
                      Choisis une carte <Tag name="action" />
                    </>
                  ),
                  filter: (c) =>
                    !c.effect().tags.includes("upgrade") && c.type === "action",
                }),
                generateChoiceOptions(fullState, {
                  noResource: true,
                  header: (
                    <>
                      Choisis une carte <Tag name="upgrade" />
                    </>
                  ),
                  filter: (c) => Boolean(c.effect().tags.includes("upgrade")),
                }),
              ],
            }))

            if (newMonth) {
              await state.addScreenMessage({
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

    addScreenMessage: async (message) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        const firstMessage = state.screenMessageQueue.length === 0

        if (firstMessage) state.setOperationInProgress("screenMessage", true)

        set({
          screenMessageQueue: [
            ...state.screenMessageQueue,
            { ...message, id: Math.random() },
          ],
        })

        await waitFor(() => getState().screenMessageQueue.length === 0)

        if (firstMessage) state.setOperationInProgress("screenMessage", false)
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
          const upgrade = reviveUpgrade(indice)

          upgradesPoints +=
            (upgrade.cost.type === "money"
              ? upgrade.cost.value / ENERGY_TO_MONEY
              : upgrade.cost.value) * upgrade.cumul
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

        const rawUpgrade = upgrades.find((a) => a.name === name)!

        // on joue le son de la banque
        bank.upgrade.play()

        // si l'upgrade est déjà découverte, on augmente son cumul
        if (state.upgrades.find((u) => u.name === name)) {
          set((state) => {
            return {
              upgrades: state.upgrades.map((u) => {
                if (u.name === name) {
                  return {
                    ...u,
                    cumul: u.cumul + 1,
                  }
                }
                return u
              }),
            }
          })
        } else {
          // sinon, on l'ajoute à la liste des upgrades
          set((state) => {
            return {
              upgrades: [
                ...state.upgrades,
                { name: rawUpgrade.name, cumul: 1, state: "appear" },
              ],
            }
          })
        }

        await wait()

        // on remet l'upgrade en idle
        set((state) => {
          return {
            upgrades: updateUpgradeState(state.upgrades, name, "idle"),
          }
        })

        if (rawUpgrade.eventName === "onUpgradeThis") {
          await state.triggerUpgrade(name, {})
        }

        await state.checkAchievements()

        state.setOperationInProgress(`upgrade ${name}`, false)
      })
    },

    triggerUpgrade: async (name, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()
        const compact = state.upgrades.find((u) => u.name === name)!
        const upgrade = reviveUpgrade(compact)

        if (!upgrade.condition || upgrade.condition(getState(), upgrade)) {
          state.setOperationInProgress(`triggerUpgrade ${name}`, true)

          // mettre l'activité en triggered
          set({
            upgrades: updateUpgradeState(state.upgrades, name, "triggered"),
          })

          await wait()

          await upgrade.onTrigger(
            getState(),
            upgrade,
            options?.reason ?? compact,
          )

          // on remote l'upgrade en idle
          set((state) => ({
            upgrades: updateUpgradeState(state.upgrades, name, "idle"),
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
          .map((indice) => reviveUpgrade(indice))
          .filter((upgrade) => upgrade.eventName === event)

        for (const upgrade of upgrades) {
          await state.triggerUpgrade(upgrade.name, {
            reason: compactUpgrade(upgrade),
          })
        }

        state.setOperationInProgress(`triggerUpgradeEvent ${event}`, false)
      })
    },

    addGlobalCardModifier: async (name, params, reason) => {
      await handleErrorsAsync(getState, async () => {
        bank.powerUp.play()

        const indice: CardModifierCompact<any> = { name, params, reason }

        set((state) => {
          return {
            globalCardModifiers: [...state.globalCardModifiers, indice],
          }
        })

        await wait()
      })
    },

    transformCardsAnimation: async (names, onMiddle) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress("transformCards", true)

        const speed = getGameSpeed()

        const cards = getRevivedDeck(state).filter((c) =>
          names.includes(c.name),
        )

        set((state) => ({
          hand: updateCardState(state.hand, names, "transforming"),
          draw: updateCardState(state.draw, names, "transforming"),
          discard: updateCardState(state.discard, names, "transforming"),
        }))

        await wait(speed / 2)

        await onMiddle(cards)

        await wait(speed / 2)

        set((state) => ({
          hand: updateCardState(state.hand, names, "idle"),
          draw: updateCardState(state.draw, names, "idle"),
          discard: updateCardState(state.discard, names, "idle"),
        }))

        state.setOperationInProgress("transformCards", false)
      })
    },

    shuffleStack: async (stack) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`shuffleStack ${stack}`, true)

        bank.shuffle.play()

        const speed = getGameSpeed() / 2

        await wait(speed)

        set((state) => {
          const revivedStack =
            stack === "draw" ? "revivedDraw" : "revivedDiscard"
          const shuffled = shuffle(state[revivedStack], 3)

          return {
            [stack]: shuffled.map((c) => compactGameCardInfo(c)),
            [revivedStack]: shuffled,
          }
        })

        await wait(speed)

        state.setOperationInProgress(`shuffleStack ${stack}`, false)
      })
    },

    riseToTheStackSurface: async (stack, filter) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`shuffleStack ${stack}`, true)

        bank.shuffle.play()

        const speed = getGameSpeed() / 2

        await wait(speed)

        set((state) => {
          const stackCards = state[stack].map((c) =>
            reviveCard(c, state as GameState & GlobalGameState),
          )

          const cards = stackCards.filter(filter)
          const otherCards = stackCards.filter((c) => !filter(c))

          const sorted = [...cards, ...otherCards]

          return {
            [stack]: sorted.map((c) => compactGameCardInfo(c)),
            [stack === "draw" ? "revivedDraw" : "revivedDiscard"]: sorted,
          }
        })

        await wait(speed)

        state.setOperationInProgress(`shuffleStack ${stack}`, false)
      })
    },

    drawCard: async (count = 1, options) => {
      await handleErrorsAsync(getState, async () => {
        let state = getState()

        const fromKey = options?.fromDiscardPile ? "discard" : "draw"

        const drawn = state[fromKey]
          .toReversed()
          .filter((c) => {
            if (!options.filter) return true
            const card = reviveCard(c, state)
            return options.filter(card)
          })
          .slice(
            0,
            Math.min(
              count,
              MAX_HAND_SIZE - state.hand.length,
              state[fromKey].length,
            ),
          )

        if (drawn.length === 0) return

        state.setOperationInProgress("draw", true)

        if (options.filter)
          await state.riseToTheStackSurface(fromKey, options.filter)

        const doTheDraw = async (card: GameCardCompact) => {
          // on active l'animation de pioche de la carte sur le tas de départ
          set((state) => ({
            [fromKey]: updateCardState(state[fromKey], card.name, "playing"),
          }))

          await wait()

          // on retire la carte du tas de départ et on la place dans la main avec l'animation de pioche
          set((state) => ({
            [fromKey]: excludeCard(state[fromKey], card.name),
            hand: toSortedCards(
              dropToStack(state.hand, updateCardState([card], "landing"), true),
              state as GameState & GlobalGameState,
            ).map((c) => compactGameCardInfo(c)),
          }))

          if (fromKey === "draw") bank.draw.play()
          else bank.recycle.play()

          await wait()

          // on passe la carte en idle
          set((state) => ({
            hand: updateCardState(state.hand, card.name, "idle"),
          }))
        }

        if (drawn.length > 3) {
          const speed = getGameSpeed()

          await Promise.all(
            drawn.map(async (card, index) => {
              await wait((speed / 2) * index + index)
              await doTheDraw(card)
            }),
          )
        } else {
          for (const card of drawn) {
            await doTheDraw(card)
          }
        }

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

        const hand = state.hand.filter(
          (c) => !options?.filter || options.filter(reviveCard(c, state)),
        )

        const discarded = options?.random
          ? [hand[Math.floor(Math.random() * state.hand.length)]]
          : hand

        const doTheDiscard = async (card: GameCardCompact) => {
          // on active l'animation de retrait de la carte
          set((state) => ({
            hand: updateCardState(state.hand, card.name, "discarding"),
          }))

          // on attend la fin de l'animation
          await wait()

          set((state) => ({
            hand: excludeCard(state.hand, card.name),
            [toKey]: dropToStack(
              state[toKey],
              updateCardState([card], "landing"),
              true,
            ),
          }))

          await wait()

          set((state) => ({
            [toKey]: updateCardState(state[toKey], card.name, "idle"),
          }))
        }

        if (discarded.length === state.hand.length) {
          const speed = getGameSpeed()

          await Promise.all(
            discarded.map(async (card, index) => {
              await wait((speed / 2) * index + index)
              await doTheDiscard(card)
            }),
          )
        } else {
          // on anime le landing de chaque carte sur la pile de destination une par une
          for (const card of discarded) {
            await doTheDiscard(card)
          }
        }

        if (toKey === "draw") await state.shuffleStack("draw")

        await state.increments("discardedCards", discarded.length)

        state.setOperationInProgress("discard", false)
      })
    },

    removeCard: async (name) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(`removeCard ${name}`, true)

        if (state.hand.some((c) => c.name === name)) {
          // on active l'animation de suppression de la carte
          set({
            hand: updateCardState(state.hand, name, "removing"),
            discard: updateCardState(state.discard, name, "removing"),
            draw: updateCardState(state.draw, name, "removing"),
          })

          bank.remove.play()

          // on attend la fin de l'animation
          await wait()

          // on remet la carte en idle
          set({
            hand: updateCardState(state.hand, name, "idle"),
            discard: updateCardState(state.discard, name, "idle"),
            draw: updateCardState(state.draw, name, "idle"),
          })
        }

        // on retire la carte de la main, du deck et de la défausse

        const from = ["discard", "draw", "hand"] as const

        set((state) => ({
          ...from.reduce((acc, key) => {
            return {
              ...acc,
              [key]: state[key].filter((c) => c.name !== name),
            }
          }, {} as Partial<GameState>),
        }))

        state.setOperationInProgress(`removeCard ${name}`, false)
      })
    },

    /**
     * Place des cartes de la défausse dans le deck
     */
    recycleCard: async (options) => {
      await handleErrorsAsync(getState, async () => {
        if (options.count === undefined) options.count = Infinity
        if (options.count <= 0) return

        let state = getState()

        if (state.discard.length === 0) return

        state.setOperationInProgress("recycle", true)

        if (state.discard.length > 1) {
          if (options.filter) {
            await state.riseToTheStackSurface("discard", options.filter)
            state = getState()
          } else if (options.shuffleBefore) {
            await state.shuffleStack("discard")
            state = getState()
          }
        }

        const recycled = state.discard
          .toReversed()
          .filter(
            (c) => !options.filter || options.filter(reviveCard(c, state)),
          )
          .slice(0, options.count)

        const doTheRecycle = async (card: GameCardCompact) => {
          // on joue le son de la banque
          bank.recycle.play()

          // animation de playing
          set((state) => ({
            discard: updateCardState(state.discard, card.name, "playing"),
          }))

          await wait()

          // animation de landing + déplacement sur la pioche
          set((state) => ({
            discard: excludeCard(state.discard, card.name),
            draw: dropToStack(
              state.draw,
              [{ ...card, state: "landing" }],
              true,
            ),
          }))

          await wait()

          // idle
          set((state) => ({
            draw: updateCardState(state.draw, card.name, "idle"),
          }))
        }

        if (recycled.length > 3) {
          const speed = getGameSpeed()

          await Promise.all(
            recycled.map(async (card, index) => {
              await wait((speed / 2) * index + index)
              await doTheRecycle(card)
            }),
          )
        } else {
          for (const card of recycled) {
            await doTheRecycle(card)
          }
        }

        await state.increments("recycledCards", recycled.length)

        state.setOperationInProgress("recycle", false)
      })
    },

    selectCard: (cardName) => {
      set({ selectedCard: cardName })
    },

    waitCardSelection: async (options) => {
      const fromNames = options.from.map((t) =>
        Array.isArray(t) ? t[0] : t.name,
      )

      set((state) => ({
        requestedCancel: false,
        selectedCard: null,
        hand: updateCardState(state.hand, fromNames, "selected"),
      }))

      const state = getState()

      state.setOperationInProgress("selectCard", true)

      let interval: NodeJS.Timeout

      const card = await new Promise<GameCardInfo<true> | null>((resolve) => {
        const finish = () => {
          set((state) => ({
            hand: updateCardState(state.hand, fromNames, "idle"),
          }))
        }

        const done = (cardName: string) => {
          resolve(reviveCard(cardName, state))
          clearInterval(interval)
          set({ selectedCard: null })
          finish()
        }

        const cancel = () => {
          resolve(null)
          clearInterval(interval)
          set({ requestedCancel: false })
          finish()
        }

        interval = setInterval(() => {
          const state = getState()

          if (state.requestedCancel) return cancel()

          if (state.selectedCard) {
            if (
              options.from.some(
                (t) =>
                  (Array.isArray(t) ? t[0] : t.name) === state.selectedCard,
              )
            ) {
              done(state.selectedCard)
            } else {
              cancel()
            }
          }
        }, 100)

        setTimeout(() => {
          cancel()
        }, options.timeout ?? 10_000)
      })

      await wait()

      state.setOperationInProgress("selectCard", false)

      return card
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

        if (free || card.effect.cost.value <= 0 || canBeBuy(card, state)) {
          state.setOperationInProgress(`play ${card.name}`, true)
        } else {
          await cantPlay()

          return
        }

        // si il y a un prePlay, on vérifie si le joueur cancel ou pas son action et on récupère la data.
        let prePlayData: any[] = []

        if (card.effect.prePlay || card.effect.needsPlayZone) {
          // on active l'animation de la carte en la déplaçant dans la playZone si besoin
          // animation de la carte vers la playZone
          set((state) => ({
            hand: updateCardState(state.hand, card.name, "playing"),
          }))

          await wait()

          // on change l'animation de la carte et on la place dans la playZone
          set((state) => ({
            playZone: updateCardState(
              [...state.playZone, compactGameCardInfo(card)],
              card.name,
              "landing",
            ),
            hand: excludeCard(state.hand, card.name),
          }))

          await wait()

          // on retire l'animation
          set((state) => ({
            playZone: updateCardState(state.playZone, card.name, "idle"),
          }))

          if (card.effect.prePlay) {
            const result = await card.effect.prePlay(state, card)

            if (result === "cancel") {
              // discarding from playZone
              set((state) => ({
                playZone: updateCardState(
                  state.playZone,
                  card.name,
                  "discarding",
                ),
              }))

              await wait()

              // landing on hand
              set((state) => ({
                playZone: excludeCard(state.playZone, card.name),
                hand: updateCardState(
                  [...state.hand, compactGameCardInfo(card)],
                  card.name,
                  "landing",
                ),
              }))

              await wait()

              // idle
              set((state) => ({
                hand: updateCardState(state.hand, card.name, "idle"),
              }))

              state.setOperationInProgress(`play ${card.name}`, false)

              return
            } else {
              prePlayData = result
            }
          }
        }

        // on paye le coût de la carte
        if (!free) {
          const usableCost = getUsableCost(card.effect.cost, state)

          await (card.effect.cost.type === "money"
            ? state.addMoney(-usableCost, {
                skipGameOverPause: true,
                reason,
              })
            : state.addEnergy(-usableCost, {
                skipGameOverPause: true,
                reason,
              }))
        }

        // on joue le son de la banque
        bank.play.play()

        // on retire les modifiers en "once" qui ont été utilisés
        reviveCard(compactGameCardInfo(card), state, { clean: true })

        const removing = willBeRemoved(getState(), card)
        const recyclage = card.effect.tags.includes("recyclage")

        const afterPlayingState = removing ? "removing" : "playing"

        if (!card.effect.needsPlayZone && !card.effect.prePlay) {
          set((state) => ({
            hand: updateCardState(state.hand, card.name, afterPlayingState),
          }))
        }

        const cleanupAndFinish = async () => {
          if (recyclage) bank.recycle.play()
          if (removing) bank.remove.play()

          if (card.effect.needsPlayZone) {
            set((state) => ({
              playZone: updateCardState(
                state.playZone,
                card.name,
                afterPlayingState,
              ),
            }))

            await wait()
          }

          // la carte va dans la défausse et on retire la carte de la main ou de la playZone
          set((state) => ({
            discard:
              removing || recyclage
                ? state.discard
                : dropToStack(
                    state.discard,
                    [compactGameCardInfo(card, "landing")],
                    true,
                  ),
            draw: recyclage
              ? dropToStack(
                  state.draw,
                  [compactGameCardInfo(card, "landing")],
                  true,
                )
              : state.draw,
            hand: excludeCard(state.hand, card.name),
            playZone: excludeCard(state.playZone, card.name),
          }))

          await wait()

          // on passe les cartes en idle
          set((state) => ({
            discard: updateCardState(state.discard, card.name, "idle"),
            draw: updateCardState(state.draw, card.name, "idle"),
          }))

          const state = getState()

          if (
            (recyclage || card.effect.tags.includes("recycle")) &&
            state.draw.length > 1
          ) {
            await state.shuffleStack("draw")
          }

          if (!removing && !recyclage && state.discard.length > 1) {
            await state.shuffleStack("discard")
          }
        }

        const triggerCardEffect = async () => {
          // on applique l'effet de la carte (toujours via eval)
          await card.effect.onPlayed(getState(), card, reason, ...prePlayData)
        }

        if (card.effect.waitBeforePlay) {
          await wait()
          await cleanupAndFinish()
          await triggerCardEffect()
        } else if (card.effect.needsPlayZone || card.effect.prePlay) {
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
          getUsableCost(
            {
              type: "energy",
              value: costToEnergy(card.effect.cost),
            },
            state,
          ),
        )

        if (!options?.skipGameOverPause && isGameOver(getState())) {
          await wait(2000)
        }

        state.setOperationInProgress(`play ${card.name}`, false)
      })
    },

    pickOption: async (option, resolvedOptions) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState()

        state.setOperationInProgress(
          `pick ${isGameResource(option) ? option.id : option.name}`,
          true,
        )

        const choice = state.choiceOptions[0]

        // on joue le son de la banque
        bank.gain.play()

        // on active les animations
        set({
          choiceOptions: [
            {
              ...choice,
              options: () =>
                resolvedOptions.map((c) => {
                  return (isGameResource(c) ? c.id : c.name) ===
                    (isGameResource(option) ? option.id : option.name)
                    ? { ...c, state: "playing" }
                    : { ...c, state: "discarding" }
                }),
            },
            ...state.choiceOptions.slice(1),
          ],
        })

        if (isGameResource(option)) {
          switch (option.type) {
            case "money":
              await state.addMoney(option.value, {
                reason: "Ressource",
                skipGameOverPause: true,
              })
              break
            case "reputation":
              await state.addReputation(option.value, {
                reason: "Ressource",
                skipGameOverPause: true,
              })
              break
            case "energy":
              await state.addEnergy(option.value, {
                reason: "Ressource",
                skipGameOverPause: true,
              })
              break
          }

          // on attend la fin de l'animation "played"

          await wait()

          set((state) => ({
            choiceOptions: [
              {
                ...choice,
                options: () => updateCardState(resolvedOptions, null),
              },
              ...state.choiceOptions.slice(1),
            ],
          }))

          // on retire un groupe de choix

          set((state) => ({
            choiceOptions: state.choiceOptions.slice(1),
          }))
        } else {
          // on attend la fin de l'animation "played"

          await wait()

          set((state) => ({
            choiceOptions: [
              {
                ...choice,
                options: () => updateCardState(resolvedOptions, null),
              },
              ...state.choiceOptions.slice(1),
            ],
          }))

          // on retire un groupe de choix et on ajoute la carte à la main ou la pioche

          set((state) => {
            const to = state.hand.length < MAX_HAND_SIZE ? "hand" : "draw"

            const picked =
              to === "draw"
                ? dropToStack(
                    state.draw,
                    [compactGameCardInfo(option, "landing")],
                    true,
                  )
                : toSortedCards(
                    [
                      ...state.hand,
                      compactGameCardInfo(
                        option,
                        "landing",
                      ) satisfies GameCardCompact,
                    ],
                    state as GameState & GlobalGameState,
                  ).map((c) => compactGameCardInfo(c))

            return {
              choiceOptions: state.choiceOptions.slice(1),
              [to]: picked,
            }
          })

          await wait()

          // on passe les cartes en idle
          set((state) => ({
            hand: updateCardState(state.hand, option.name, "idle"),
            draw: updateCardState(state.draw, option.name, "idle"),
          }))

          state.checkDiscoveries()
        }

        state.setOperationInProgress(
          `pick ${isGameResource(option) ? option.id : option.name}`,
          false,
        )
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

      const state = getState()

      set(revivedState(state))
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

export type GameMethods = ReturnType<typeof generateGameMethods>

export const useCardGame = create<GameState & GlobalGameState>(
  (set, getState) => {
    const state = {
      ...generateGameState(),
      ...generateGameMethods(set, getState),
      ...generateGlobalGameState(),
      ...generateGlobalGameMethods(set, getState),
    }

    state.discoveries = Array.from(
      new Set([...state.discoveries, ...getDeck(state).map((c) => c.name)]),
    )

    return { ...state, ...revivedState(state) }
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

      // si aucune opération n'est en cours
      if (
        state.operationInProgress.join(",") !==
          prevState.operationInProgress.join("") &&
        state.operationInProgress.length === 0
      ) {
        state.dangerouslyUpdate(revivedState(state, true))

        if (isGameWon(state)) {
          await state.addAchievement("Première victoire")
        }

        state.checkDiscoveries()

        await state.checkAchievements()

        updateGameAutoSpeed(state, upgrades)

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

        save(state)

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

        // si la main change, on met a jour les revived cards
      } else if (
        state.hand.map((c) => c.name + c.state).join(",") !==
          prevState.hand.map((c) => c.name + c.state).join(",") ||
        state.draw.map((c) => c.name + c.state).join(",") !==
          prevState.draw.map((c) => c.name + c.state).join(",") ||
        state.discard.map((c) => c.name + c.state).join(",") !==
          prevState.discard.map((c) => c.name + c.state).join(",") ||
        state.inflation !== prevState.inflation ||
        state.globalCardModifiers.map((m) => m.name).join(",") !==
          prevState.globalCardModifiers.map((m) => m.name).join(",")
      ) {
        state.dangerouslyUpdate(revivedState(state))
      }
    },
  )
})
