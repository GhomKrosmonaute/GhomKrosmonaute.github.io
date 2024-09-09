import { bank } from "@/sound.ts";
import { create } from "zustand";

import cards from "@/data/cards.ts";
import upgrades from "@/data/upgrades";
import achievements from "@/data/achievements.ts";
import cardModifiers from "@/data/cardModifiers";

import type {
  CardModifierIndice,
  GameCardInfo,
  GameLog,
  GameMethodOptions,
  GameOverReason,
  MethodWhoCheckIfGameOver,
  MethodWhoLog,
  TriggerEventName,
  Upgrade,
} from "@/game-typings";

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
} from "@/game-constants.ts";

import {
  generateChoiceOptions,
  isGameOver,
  parseCost,
  parseSave,
  reviveCardModifier,
  shuffle,
  wait,
  willBeRemoved,
  handleErrors,
  handleErrorsAsync,
} from "@/game-utils.ts";

import { metadata } from "@/game-metadata.ts";
import { difficultyIndex, settings } from "@/game-settings.ts";

export interface CardGame {
  scoreAverage: number;
  totalMoney: number;
  wonGames: number;
  playedGames: number;
  discoveries: string[];
  achievements: string[];
  addDiscovery: (...names: string[]) => void;
  addAchievement: (name: string) => Promise<void>;
  addWonGame: () => void;
  addPlayedGame: () => void;
  checkAchievements: () => Promise<void>;
  checkDiscoveries: () => void;
}

export interface CardGameState {
  error: Error | null;
  throwError: (error: Error) => never;
  choiceOptionCount: number;
  choiceOptions: GameCardInfo[][];
  logs: GameLog[];
  notification: [text: string, className: string][];
  operationInProgress: string[];
  setOperationInProgress: (operation: string, value: boolean) => void;
  reason: GameOverReason;
  isWon: boolean;
  isGameOver: boolean;
  infinityMode: boolean;
  draw: GameCardInfo[];
  hand: GameCardInfo[];
  discard: GameCardInfo[];
  upgrades: Upgrade[];
  cardModifiers: CardModifierIndice[];
  score: number;
  day: number;
  dayFull: boolean | null;
  sprintFull: boolean | null;
  /**
   * Entre 0 et 23
   */
  energy: number;
  energyMax: number;
  reputation: number;
  money: number;
  coinFlip: (options: {
    onHead: (state: CardGameState) => Promise<void>;
    onTail: (state: CardGameState) => Promise<void>;
  }) => Promise<void>;
  advanceTime: (energy: number) => Promise<void>;
  addLog: (log: GameLog) => void;
  addNotification: (notification: string, className: string) => Promise<void>;
  dangerouslyUpdate: (partial: Partial<CardGameState>) => void;
  updateScore: () => void;
  addEnergy: (count: number, options: GameMethodOptions) => Promise<void>;
  addMaxEnergy: (count: number, options: GameMethodOptions) => Promise<void>;
  addReputation: (count: number, options: GameMethodOptions) => Promise<void>;
  addMoney: (count: number, options: GameMethodOptions) => Promise<void>;
  upgrade: (name: string) => Promise<void>;
  triggerUpgrade: (
    name: string,
    options: MethodWhoCheckIfGameOver & Partial<MethodWhoLog>,
  ) => Promise<void>;
  triggerEvent: (event: TriggerEventName) => Promise<void>;
  addCardModifier: <CardModifierName extends keyof typeof cardModifiers>(
    name: CardModifierName,
    params: Parameters<(typeof cardModifiers)[CardModifierName]>,
    options?: { before?: boolean },
  ) => unknown;
  drawCard: (
    count: number,
    options: GameMethodOptions &
      Partial<{
        fromDiscardPile: boolean;
        filter: (card: GameCardInfo) => boolean;
      }>,
  ) => Promise<void>;
  discardCard: (options: {
    toDraw?: boolean;
    random?: boolean;
    reason: GameLog["reason"];
    filter?: (card: GameCardInfo) => boolean;
  }) => Promise<void>;
  removeCard: (name: string) => Promise<void>;
  recycleCard: (count: number, options: GameMethodOptions) => Promise<void>;
  playCard: (
    card: GameCardInfo,
    options: GameMethodOptions & { free?: boolean },
  ) => Promise<void>;
  pickCard: (card: GameCardInfo) => Promise<void>;
  win: () => void;
  defeat: (reason: GameOverReason) => void;
  reset: () => void;
  enableInfinityMode: () => void;
}

function generateCardGameStats(): Omit<
  CardGame,
  keyof ReturnType<typeof cardGameStatsMethods>
> {
  const save = localStorage.getItem("card-game-stats");

  if (save) {
    return JSON.parse(save);
  } else {
    return {
      scoreAverage: 0,
      totalMoney: 0,
      wonGames: 0,
      playedGames: 0,
      discoveries: [],
      achievements: [],
    };
  }
}

function cardGameStatsMethods(
  set: (
    partial:
      | CardGame
      | Partial<CardGame>
      | ((state: CardGame) => CardGame | Partial<CardGame>),
    replace?: boolean | undefined,
  ) => void,
  getState: () => CardGame & CardGameState,
) {
  const updateLocalStorage = () => {
    const state = getState();
    localStorage.setItem(
      "card-game-stats",
      JSON.stringify({
        wonGames: state.wonGames,
        achievements: state.achievements,
        playedGames: state.playedGames,
        discoveries: state.discoveries,
        scoreAverage: state.scoreAverage,
        totalMoney: state.totalMoney,
      } satisfies Omit<
        CardGame,
        keyof ReturnType<typeof cardGameStatsMethods>
      >),
    );
  };

  return {
    checkAchievements: async () => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        for (const achievement of achievements) {
          if (state.achievements.includes(achievement.name)) continue;

          if (achievement.unlockCondition(getState())) {
            await state.addAchievement(achievement.name);
          }
        }
      });
    },

    checkDiscoveries: () => {
      handleErrors(getState, () => {
        const state = getState();

        state.addDiscovery(
          ...state.hand.map((c) => c.name),
          ...state.draw.map((c) => c.name),
          ...state.discard.map((c) => c.name),
        );
      });
    },

    addDiscovery: (...names) => {
      handleErrors(getState, () => {
        set((state) => {
          return {
            discoveries: Array.from(new Set([...state.discoveries, ...names])),
          };
        });

        updateLocalStorage();
      });
    },

    addAchievement: async (name) => {
      await handleErrorsAsync(getState, async () => {
        set((state) => {
          return {
            achievements: [...state.achievements, name],
          };
        });

        bank.achievement.play();

        await getState().addNotification(
          `<span style="font-size: 32px">Succès dévérouillé</span><br/>${name}`,
          "bg-primary text-primary-foreground text-center",
        );

        updateLocalStorage();
      });
    },

    addWonGame: () => {
      handleErrors(getState, () => {
        const state = getState();

        set({
          wonGames: state.wonGames + 1,
          scoreAverage:
            state.scoreAverage +
            (state.score - state.scoreAverage) / (state.wonGames + 1),
          totalMoney: state.totalMoney + state.money,
          playedGames: state.playedGames + 1,
        });

        updateLocalStorage();
      });
    },

    addPlayedGame: () => {
      handleErrors(getState, () => {
        const state = getState();

        set({
          playedGames: state.playedGames + 1,
          totalMoney: state.totalMoney + state.money,
        });

        updateLocalStorage();
      });
    },
  } satisfies Partial<CardGame>;
}

function generateInitialState(): Omit<
  CardGameState,
  keyof ReturnType<typeof cardGameMethods>
> {
  const saveMetadata = localStorage.getItem("metadata");
  const save = localStorage.getItem("save");

  if (save && JSON.stringify(metadata) === saveMetadata) {
    return parseSave(save);
  }

  localStorage.setItem("metadata", JSON.stringify(metadata));

  let startingDeck: GameCardInfo[] = [];

  startingDeck.push(
    cards.find((c) => c.effect.description.startsWith("Renvoie tout"))!,
  );

  startingDeck.push(
    ...cards
      .filter(
        (c) =>
          startingDeck.every((_c) => _c.name !== c.name) &&
          c.effect.description.startsWith("Pioche"),
      )
      .slice(0, 4),
  );

  startingDeck.push(
    ...cards.filter(
      (c) =>
        startingDeck.every((_c) => _c.name !== c.name) &&
        c.effect.description.startsWith("Recycle"),
    ),
  );

  startingDeck.push(
    ...cards.filter(
      (c) =>
        startingDeck.every((_c) => _c.name !== c.name) &&
        !c.effect.upgrade &&
        c.effect.description.toLowerCase().includes("gagne") &&
        c.effect.description.toLowerCase().includes("énergie"),
    ),
  );

  startingDeck = shuffle(startingDeck, 3).map(
    (c) => ({ ...c, state: "drawing" }) as GameCardInfo,
  );

  const startingChoices: GameCardInfo[][] = [];

  for (let i = 0; i < INITIAL_CHOICE_COUNT; i++) {
    startingChoices.push(
      shuffle(
        cards.filter(
          (c) =>
            startingChoices.every((o) => o.every((_c) => _c.name !== c.name)) &&
            startingDeck.every((_c) => _c.name !== c.name) &&
            !c.effect.upgrade,
        ),
        5,
      )
        .slice(0, INITIAL_CHOICE_OPTION_COUNT)
        .map((c) => ({ ...c, state: "drawing" })),
    );
  }

  return {
    error: null,
    choiceOptions: startingChoices,
    choiceOptionCount: INITIAL_CHOICE_OPTION_COUNT,
    logs: [],
    notification: [],
    operationInProgress: [],
    score: 0,
    reason: null,
    isWon: false,
    isGameOver: false,
    infinityMode: false,
    draw: startingDeck.slice(MAX_HAND_SIZE - 2),
    hand: startingDeck.slice(0, MAX_HAND_SIZE - 2),
    discard: [],
    upgrades: [],
    cardModifiers: [["upgrade cost threshold", []]],
    day: 0,
    dayFull: false,
    sprintFull: false,
    energy: MAX_ENERGY,
    energyMax: MAX_ENERGY,
    reputation: MAX_REPUTATION,
    money: 0,
  };
}

function cardGameMethods(
  set: (
    partial:
      | CardGameState
      | Partial<CardGameState>
      | ((state: CardGameState) => CardGameState | Partial<CardGameState>),
    replace?: boolean | undefined,
  ) => void,
  getState: () => CardGameState & CardGame,
) {
  return {
    throwError: (error: Error) => {
      set({ error });
      throw error;
    },

    coinFlip: async (options) => {
      await handleErrorsAsync(getState, async () => {
        bank.coinFlip.play();

        const state = getState();

        state.setOperationInProgress("coinFlip", true);

        const result = Math.random() > 0.5;

        await Promise.all([
          await state.addNotification(
            result ? "Face" : "Pile",
            "bg-background text-foreground",
          ),
          await options[result ? "onHead" : "onTail"](state),
        ]);

        state.setOperationInProgress("coinFlip", false);
      });
    },

    advanceTime: async (energy: number) => {
      await handleErrorsAsync(getState, async () => {
        if (energy < 0) return;

        const state = getState();

        state.setOperationInProgress("advanceTime", true);

        const addedTime = Math.max(ENERGY_TO_DAYS, energy * ENERGY_TO_DAYS);

        if (addedTime < ENERGY_TO_DAYS) {
          state.throwError(
            new Error(`Not enough energy to advance time: ${energy}`),
          );
        }

        let currentDay = Math.floor(state.day);
        const afterTime = state.day + addedTime;
        const afterDay = Math.floor(afterTime);

        for (currentDay; currentDay < afterDay; currentDay++) {
          const newSprint = currentDay !== 0 && (currentDay + 1) % 7 === 0;

          // debugger;

          set({
            day: currentDay + 1,
            dayFull: true,
            sprintFull: newSprint,
          });

          // on joue le son de la banque
          bank.bell.play();
          if (newSprint) bank.upgrade.play();

          await state.addNotification(
            newSprint
              ? `Sprint ${Math.floor((currentDay + 1) / 7)}`
              : `Jour ${currentDay + 1}`,
            newSprint
              ? "bg-upgrade text-upgrade-foreground"
              : "bg-day text-day-foreground",
          );

          await state.triggerEvent("daily");

          set((state) => ({
            dayFull: false,
            choiceOptions: newSprint
              ? state.choiceOptions
              : [
                  ...state.choiceOptions,
                  generateChoiceOptions(getState(), {
                    filter: (c) => !c.effect.upgrade,
                  }),
                ],
          }));

          if (newSprint) {
            await state.triggerEvent("weekly");

            const fullState = getState();

            set((state) => ({
              sprintFull: false,
              choiceOptions: [
                ...state.choiceOptions,
                generateChoiceOptions(fullState, {
                  filter: (c) => !c.effect.upgrade && c.type === "action",
                }),
                generateChoiceOptions(fullState, {
                  filter: (c) => !!c.effect.upgrade,
                }),
              ],
            }));
          }

          await wait(1000);
        }

        set({ day: afterTime, dayFull: null, sprintFull: null });

        state.setOperationInProgress("advanceTime", false);
      });
    },

    addLog: (log) => {
      set((state) => ({
        logs: [...state.logs, log],
      }));
    },

    addNotification: async (text, className) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        if (state.notification.length > 0) {
          return state.throwError(
            new Error(
              `Trying to add a notification while one is already displayed: ${text} ${className}`,
            ),
          );
        }

        set((state) => ({
          notification: [[text, className] as const, ...state.notification],
        }));

        await wait(2000);

        set((state) => ({
          notification: state.notification.slice(1),
        }));
      });
    },

    dangerouslyUpdate: (partial: Partial<CardGameState>) => set(partial),

    setOperationInProgress: (operation: string, value: boolean) => {
      handleErrors(getState, () => {
        set((state) => ({
          operationInProgress: value
            ? [...state.operationInProgress, operation]
            : state.operationInProgress.filter((op) => op !== operation),
        }));
      });
    },

    updateScore: () => {
      handleErrors(getState, () => {
        const state = getState();

        // Coefficients de pondération pour chaque élément
        const energyWeight = 1;
        const reputationWeight = REPUTATION_TO_ENERGY;
        const moneyWeight = 1 / ENERGY_TO_MONEY;

        // Calcul des points pour chaque élément
        const energyPoints = state.energy * energyWeight;
        const reputationPoints = state.reputation * reputationWeight;
        const moneyPoints = state.money * moneyWeight;

        // Calcul des points pour les améliorations
        let upgradesPoints = 0;
        state.upgrades.forEach((upgrade) => {
          upgradesPoints +=
            (typeof upgrade.cost === "string"
              ? Number(upgrade.cost) / ENERGY_TO_MONEY
              : upgrade.cost) * upgrade.cumul;
        });

        // Calcul du multiplicateur en fonction des jours
        let daysMultiplier = 1;
        if (state.day <= 28) {
          daysMultiplier = 2;
        } else if (state.day <= 56) {
          daysMultiplier = 1.5;
        }

        // Calcul du multiplicateur en fonction de la difficulté
        const difficultyMultiplier =
          1 + (difficultyIndex[settings.difficulty] - 3) * 0.2; // Diff. 3 = x1, diff. 4 = x1.2, diff. 2 = x0.8, etc.

        // Calcul du score total
        const baseScore =
          energyPoints + reputationPoints + moneyPoints + upgradesPoints;
        const finalScore = baseScore * daysMultiplier * difficultyMultiplier;

        const completion = state.money / MONEY_TO_REACH;

        set({
          score: Math.round(finalScore * completion * 10),
        });
      });
    },

    addEnergy: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        state.setOperationInProgress("energy", true);

        if (count > 0) {
          const addedEnergy = Math.min(count, state.energyMax - state.energy);

          if (addedEnergy > 0) {
            state.addLog({
              value: addedEnergy,
              type: "energy",
              reason: options.reason,
            });
          }

          set((state) => {
            return {
              energy: Math.max(
                0,
                Math.min(state.energyMax, state.energy + count),
              ),
            };
          });

          bank.gain.play();

          await wait();
        } else if (count < 0) {
          const state = getState();

          // on retire toute l'énergie et on puise dans la réputation pour le reste
          const missingEnergy = Math.abs(count) - state.energy;
          const consumedEnergy = Math.min(Math.abs(count), state.energy);

          if (consumedEnergy > 0) {
            state.addLog({
              value: -consumedEnergy,
              type: "energy",
              reason: options.reason,
            });
          }

          if (missingEnergy > 0) {
            set({ energy: 0 });

            await state.addReputation(-missingEnergy, options);
          } else {
            set((state) => {
              return {
                energy: state.energy + count,
              };
            });
          }
        }

        state.setOperationInProgress("energy", false);
      });
    },

    addMaxEnergy: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        if (count === 0) return;

        const state = getState();

        state.setOperationInProgress("maxEnergy", true);

        set((state) => {
          return {
            energyMax: Math.max(0, state.energyMax + count),
          };
        });

        if (count > 0) {
          bank.powerUp.play();

          await wait();

          await state.addEnergy(count, options);
        } else {
          bank.loss.play();

          await wait();

          if (state.energy > state.energyMax) {
            await state.addEnergy(state.energyMax - state.energy, options);
          }
        }

        state.setOperationInProgress("maxEnergy", false);
      });
    },

    addReputation: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        state.setOperationInProgress("reputation", true);

        // on joue le son de la banque
        if (count === 10) bank.powerUp.play();
        else if (count > 0) bank.gain.play();
        else bank.loss.play();

        if (count !== 0) {
          state.addLog({
            value: count,
            type: "reputation",
            reason: options.reason,
          });
        }

        set((state) => {
          return {
            reputation: Math.max(
              0,
              Math.min(MAX_REPUTATION, state.reputation + count),
            ),
          };
        });

        await wait();

        if (count < 0) await state.triggerEvent("onReputationDeclines");

        if (!options?.skipGameOverPause && isGameOver(state)) {
          await wait(2000);
        }

        state.setOperationInProgress("reputation", false);
      });
    },

    addMoney: async (count, options) => {
      await handleErrorsAsync(getState, async () => {
        let state = getState();

        state.setOperationInProgress("money", true);

        if (count !== 0) {
          state.addLog({
            value: count,
            type: "money",
            reason: options?.reason,
          });
        }

        if (count > 0) {
          bank.cashing.play();

          await wait();
        }

        set((state) => {
          const money = state.money + count;

          return { money };
        });

        state = getState();

        if (!options?.skipGameOverPause && state.money >= MONEY_TO_REACH) {
          await wait(2000);
        }

        state.setOperationInProgress("money", false);
      });
    },

    upgrade: async (name) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        state.setOperationInProgress(`upgrade ${name}`, true);

        const rawUpgrade = upgrades.find((a) => a.name === name)!;

        // on joue le son de la banque
        bank.upgrade.play();

        // si l'activité est déjà découverte, on augmente son cumul
        if (state.upgrades.find((a) => a.name === name)) {
          set((state) => {
            return {
              upgrades: state.upgrades.map((a) => {
                if (a.name === name) {
                  return { ...a, cumul: a.cumul + 1 };
                }
                return a;
              }),
            };
          });
        } else {
          set((state) => {
            return {
              upgrades: [
                ...state.upgrades,
                {
                  ...rawUpgrade,
                  type: "upgrade",
                  state: "appear",
                  cumul: 1,
                  max: rawUpgrade.max ?? Infinity,
                },
              ],
            };
          });
        }

        await wait();

        // remet l'activité en idle
        set((state) => {
          return {
            upgrades: state.upgrades.map((a) => {
              if (a.name === name) {
                return { ...a, state: "idle" };
              }
              return a;
            }),
          };
        });

        if (rawUpgrade.eventName === "onUpgradeThis") {
          const upgrade = state.upgrades.find((a) => a.name === name)!;
          await state.triggerUpgrade(name, { reason: upgrade });
        }

        state.setOperationInProgress(`upgrade ${name}`, false);
      });
    },

    triggerUpgrade: async (name, options) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();
        const upgrade = state.upgrades.find((a) => a.name === name)!;

        if (!upgrade.condition || upgrade.condition(getState(), upgrade)) {
          state.setOperationInProgress(`triggerUpgrade ${name}`, true);

          // mettre l'activité en triggered
          set({
            upgrades: state.upgrades.map((a) => {
              if (a.name === upgrade.name) {
                return { ...a, state: "triggered" };
              }
              return a;
            }),
          });

          await wait();

          await upgrade.onTrigger(
            getState(),
            upgrade,
            options?.reason ?? upgrade,
          );

          // remettre l'activité en idle
          set((state) => ({
            upgrades: state.upgrades.map((a) => {
              if (a.name === upgrade.name) {
                return { ...a, state: "idle" };
              }
              return a;
            }),
          }));

          state.setOperationInProgress(`triggerUpgrade ${name}`, false);
        }
      });
    },

    triggerEvent: async (event) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        state.setOperationInProgress(`triggerUpgradeEvent ${event}`, true);

        const upgrades = state.upgrades.filter(
          (upgrade) => upgrade.eventName === event,
        );

        for (const upgrade of upgrades) {
          await state.triggerUpgrade(upgrade.name, {
            reason: upgrade,
          });
        }

        state.setOperationInProgress(`triggerUpgradeEvent ${event}`, false);
      });
    },

    addCardModifier: async (name, params, options) => {
      await handleErrorsAsync(getState, async () => {
        bank.powerUp.play();

        const indice = [name, params] as unknown as CardModifierIndice;

        set((state) => {
          return {
            cardModifiers: options?.before
              ? [indice, ...state.cardModifiers]
              : [...state.cardModifiers, indice],
          };
        });
      });
    },

    drawCard: async (count = 1, options) => {
      await handleErrorsAsync(getState, async () => {
        let state = getState();

        state.setOperationInProgress("draw", true);

        const fromKey = options?.fromDiscardPile ? "discard" : "draw";

        const hand = state.hand.slice();
        const discard = state.discard.slice();

        const from = state[fromKey].slice().filter((c) => {
          if (options?.filter) return options.filter(c);
          return true;
        });

        const drawn: string[] = [];

        let handAdded = false;

        for (let i = 0; i < count; i++) {
          if (from.length === 0) {
            break;
          }

          const card = from.pop()!;

          card.state = "drawing";

          drawn.push(card.name);

          if (hand.length < MAX_HAND_SIZE) {
            hand.push(card);
            handAdded = true;
          }
        }

        if (handAdded) {
          if (fromKey === "draw") bank.draw.play();
          else bank.recycle.play();
        }

        set({
          hand,
          discard,
          [fromKey]: shuffle(
            state[fromKey].filter((c) => !drawn.includes(c.name)),
            2,
          ),
        });

        await wait();

        // on passe la main en idle
        set((state) => ({
          hand: state.hand.map((c) => {
            return { ...c, state: "idle" };
          }),
        }));

        await state.triggerEvent("onDraw");

        state = getState();

        if (!options?.skipGameOverPause && isGameOver(state)) {
          await wait(2000);
        }

        state.setOperationInProgress("draw", false);
      });
    },

    discardCard: async (options) => {
      await handleErrorsAsync(getState, async () => {
        const toKey = options?.toDraw ? "draw" : "discard";

        // on joue le son de la banque
        bank.drop.play();

        const state = getState();

        state.setOperationInProgress("discard", true);

        const hand = state.hand
          .slice()
          .filter(
            (c) =>
              c.state !== "playing" && (!options?.filter || options.filter(c)),
          );

        const dropped = options?.random
          ? [hand[Math.floor(Math.random() * state.hand.length)]]
          : hand;

        // on active l'animation de retrait des cartes
        set({
          hand: state.hand.map((c) => {
            if (dropped.some((d) => d.name === c.name)) {
              return { ...c, state: "discarding" };
            }
            return c;
          }),
        });

        // on attend la fin de l'animation
        await wait();

        // les cartes retournent dans le deck et on vide la main
        set((state) => ({
          [toKey]: shuffle(
            [
              ...state.hand
                .filter((c) => dropped.some((d) => d.name === c.name))
                .map((c) => ({ ...c, state: null })),
              ...state[toKey],
            ],
            2,
          ),
          hand: state.hand.filter(
            (c) => !dropped.some((d) => d.name === c.name),
          ),
        }));

        state.setOperationInProgress("discard", false);
      });
    },

    removeCard: async (name) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        state.setOperationInProgress(`removeCard ${name}`, true);

        if (state.hand.some((c) => c.name === name)) {
          // on active l'animation de suppression de la carte
          set({
            hand: state.hand.map((c) => {
              if (c.name === name) {
                return { ...c, state: "removing" };
              }
              return c;
            }),
          });

          bank.remove.play();

          // on attend la fin de l'animation
          await wait(1000);
        }

        // on retire la carte de la main, du deck et de la défausse

        const from = ["discard", "draw", "hand"] as const;

        set((state) => ({
          ...from.reduce((acc, key) => {
            return {
              ...acc,
              [key]: state[key].filter((c) => c.name !== name),
            };
          }, {} as Partial<CardGameState>),
        }));

        state.setOperationInProgress(`removeCard ${name}`, false);
      });
    },

    /**
     * Place des cartes de la défausse dans le deck
     */
    recycleCard: async (count = 1) => {
      await handleErrorsAsync(getState, async () => {
        if (count <= 0) return;

        const state = getState();

        if (state.discard.length === 0) return;

        state.setOperationInProgress("recycle", true);

        // on joue le son de la banque
        bank.recycle.play();

        const from = state.discard.slice();
        const to = state.draw.slice();

        const recycled: string[] = [];

        for (let i = 0; i < count; i++) {
          if (from.length === 0) {
            break;
          }

          const card = from.pop()!;

          recycled.push(card.name);
          to.push(card);
        }

        await wait();

        set({
          draw: shuffle(to),
          discard: state.discard.filter((c) => !recycled.includes(c.name)),
        });

        state.setOperationInProgress("recycle", false);
      });
    },

    playCard: async (card, options) => {
      await handleErrorsAsync(getState, async () => {
        const free = !!options?.free;

        let state = getState();

        const reason = options?.reason ?? card;

        const cantPlay = async () => {
          // jouer le son de la banque
          bank.unauthorized.play();

          // activer l'animation can't play
          set({
            hand: state.hand.map((c) => {
              if (c.name === card.name) {
                return { ...c, state: "unauthorized" };
              }
              return c;
            }),
          });

          // on attend la fin de l'animation
          await wait();

          // on remet la carte en idle
          set({
            hand: state.hand.map((c) => {
              if (c.name === card.name) {
                return { ...c, state: "idle" };
              }
              return c;
            }),
          });
        };

        // on vérifie la condition s'il y en a une (eval(effect.condition))
        if (card.effect.condition && !card.effect.condition(state, card)) {
          await cantPlay();

          return;
        }

        const { needs, cost, appliedModifiers } = parseCost(state, card, []);

        if (
          free ||
          Number(card.effect.cost) === 0 ||
          (needs === "money"
            ? state.money >= cost
            : state.reputation + state.energy >= cost)
        ) {
          state.setOperationInProgress(`play ${card.name}`, true);

          set((state) => ({
            hand: state.hand.map((c) => {
              if (c.name === card.name) {
                return { ...c, state: "selected" };
              }
              return c;
            }),
          }));

          if (!free) {
            await (needs === "money"
              ? state.addMoney(-cost, { skipGameOverPause: true, reason })
              : state.addEnergy(-cost, { skipGameOverPause: true, reason }));
          }
        } else {
          await cantPlay();

          return;
        }

        // on joue le son de la banque
        bank.play.play();

        const removing = willBeRemoved(getState(), card);

        if (removing) {
          wait(200).then(() => bank.remove.play());
        }

        const cardManagement = async () => {
          // on active l'animation de retrait de la carte
          set((state) => ({
            hand: state.hand.map((c) => {
              if (c.name === card.name) {
                return {
                  ...c,
                  state: removing ? "removing" : "playing",
                };
              }
              return c;
            }),
          }));

          // on attend la fin de l'animation
          await wait(removing ? 1000 : undefined);

          // la carte va dans la défausse et on retire la carte de la main
          set((state) => ({
            discard: removing
              ? state.discard
              : shuffle([{ ...card, state: null }, ...state.discard], 3),
            hand: state.hand.filter((c) => c.name !== card.name),
            cardModifiers: state.cardModifiers.filter((indice) => {
              const modifier = reviveCardModifier(indice);

              return (
                // s'il n'est pas unique
                !modifier.once ||
                // sinon s'il a été appliqué
                !appliedModifiers.some(
                  (m) => m.toString() === indice.toString(),
                )
              );
            }),
          }));
        };

        const effectManagement = async () => {
          // on applique l'effet de la carte (toujours via eval)
          await card.effect.onPlayed(getState(), card, reason);
        };

        if (card.effect.waitBeforePlay) {
          await cardManagement();
          await effectManagement();
        } else {
          await Promise.all([cardManagement(), effectManagement()]);
        }

        await state.triggerEvent("onPlay");

        // on vérifie si la main est vide
        // si la main est vide, on pioche

        state = getState();

        if (state.hand.length === 0) {
          await state.triggerEvent("onEmptyHand");
          await state.drawCard(1, { reason });
        }

        await state.advanceTime(
          needs === "money" ? cost / ENERGY_TO_MONEY : cost,
        );

        if (!options?.skipGameOverPause && isGameOver(getState())) {
          await wait(2000);
        }

        state.setOperationInProgress(`play ${card.name}`, false);
      });
    },

    pickCard: async (card) => {
      await handleErrorsAsync(getState, async () => {
        const state = getState();

        state.setOperationInProgress(`pick ${card.name}`, true);

        // on joue le son de la banque
        bank.gain.play();
        if (state.choiceOptions[0].length > 1) bank.remove.play();

        // on active les animations
        set({
          choiceOptions: state.choiceOptions.map((options) => {
            return options.map((c) => {
              if (c.name === card.name) {
                return { ...c, state: "playing" };
              }
              return { ...c, state: "removing" };
            });
          }),
        });

        await Promise.all([
          (async () => {
            // on attend la fin de l'animation "played"

            await wait();

            // on retire l'animation de "played" et on ajoute la carte à la pioche

            set((state) => ({
              choiceOptions: state.choiceOptions.map((options) => {
                return options.map((c) => {
                  if (c.name === card.name) return { ...c, state: "removed" };
                  else return c;
                });
              }),
            }));
          })(),
          (async () => {
            // on attend la fin de l'animation "removed"

            await wait(1000);

            // on retire l'animation de "removed"

            set((state) => ({
              choiceOptions: state.choiceOptions.map((options) => {
                return options.map((c) => {
                  return { ...c, state: null };
                });
              }),
            }));
          })(),
        ]);

        // on retire un groupe de choix

        set((state) => {
          return {
            choiceOptions: state.choiceOptions.slice(1),
            draw: shuffle([...state.draw, { ...card, state: null }], 3),
          };
        });

        state.setOperationInProgress(`pick ${card.name}`, false);
      });
    },

    win: () => {
      set({ isGameOver: true, isWon: true });
    },

    defeat: (reason) => {
      bank.defeat.play();

      set({
        isGameOver: true,
        isWon: false,
        reason,
      });
    },

    reset: () => {
      localStorage.removeItem("metadata");
      localStorage.removeItem("save");

      set(generateInitialState());
    },

    enableInfinityMode: () => {
      set({
        infinityMode: true,
        isGameOver: false,
        isWon: false,
      });
    },
  } satisfies Partial<CardGameState>;
}

export const useCardGame = create<CardGameState & CardGame>(
  (set, getState) => ({
    ...generateCardGameStats(),
    ...generateInitialState(),
    ...cardGameMethods(set, getState),
    ...cardGameStatsMethods(set, getState),
  }),
);

useCardGame.subscribe(async (state, prevState) => {
  // on met à jour le score
  if (
    state.reputation !== prevState.reputation ||
    state.money !== prevState.money ||
    state.upgrades !== prevState.upgrades ||
    state.energy !== prevState.energy ||
    state.day !== prevState.day
  )
    state.updateScore();

  localStorage.setItem(
    "save",
    JSON.stringify(
      {
        error: state.error,
        choiceOptions: state.choiceOptions,
        choiceOptionCount: state.choiceOptionCount,
        draw: state.draw,
        hand: state.hand,
        discard: state.discard,
        upgrades: state.upgrades,
        cardModifiers: state.cardModifiers,
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
      } satisfies Omit<CardGameState, keyof ReturnType<typeof cardGameMethods>>,
      (key, value) => {
        if (typeof value === "function" && !(key in state)) return undefined;
        return value;
      },
    ),
  );

  // si aucune opération n'est en cours
  if (
    state.operationInProgress.join(",") !==
      prevState.operationInProgress.join("") &&
    state.operationInProgress.length === 0 &&
    state.choiceOptions.length === 0
  ) {
    // on vérifie les achievements
    await state.checkAchievements();
    state.checkDiscoveries();

    // on vérifie si le jeu est fini
    if (!state.infinityMode && !state.isWon && state.money >= MONEY_TO_REACH) {
      state.win();
      state.addWonGame();
    } else if (!state.isGameOver) {
      const reason = isGameOver(state);

      if (reason) {
        state.defeat(reason);
        state.addPlayedGame();
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
});
