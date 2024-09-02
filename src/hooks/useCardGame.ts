import React from "react";
import ReactDOMServer from "react-dom/server";

import { bank } from "@/sound.ts";
import { create } from "zustand";

import cardModifiers from "@/data/cardModifiers";
import projects from "@/data/projects.json";
import technos from "@/data/techno.json";
import upgrades from "@/data/upgrades";

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
  ENERGY_TO_DAYS,
  ENERGY_TO_MONEY,
  MAX_ENERGY,
  MAX_HAND_SIZE,
  MAX_REPUTATION,
  MONEY_TO_REACH,
  REPUTATION_TO_ENERGY,
} from "@/game-constants.ts";

import {
  actionEffects,
  formatText,
  formatUpgradeText,
  isGameOver,
  map,
  parseCost,
  parseSave,
  reviveCardModifier,
  shuffle,
  supportEffects,
  wait,
  willBeRemoved,
} from "@/game-utils.ts";

import { metadata } from "@/game-metadata.ts";
import { difficultyIndex, settings } from "@/game-settings.ts";
import { EventText } from "@/components/game/EventText.tsx";

export interface CardGameState {
  logs: GameLog[];
  notification: [text: string, className: string] | null;
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
  reputation: number;
  money: number;
  advanceTime: (energy: number) => Promise<void>;
  addLog: (log: GameLog) => void;
  addNotification: (notification: string, className: string) => void;
  dangerouslyUpdate: (partial: Partial<CardGameState>) => void;
  updateScore: () => void;
  addEnergy: (count: number, options: GameMethodOptions) => Promise<void>;
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
  win: () => void;
  defeat: (reason: GameOverReason) => void;
  reset: () => void;
  enableInfinityMode: () => void;
}

function generateInitialState(): Omit<
  CardGameState,
  keyof ReturnType<typeof cardGameMethods>
> {
  const saveMetadata = localStorage.getItem("card-game-metadata");
  const saveDifficulty =
    localStorage.getItem("card-game-difficulty") ?? "normal";
  const save = localStorage.getItem("card-game");

  if (
    save &&
    JSON.stringify(metadata) === saveMetadata &&
    settings.difficulty === saveDifficulty
  ) {
    return parseSave(save);
  }

  localStorage.setItem("card-game-metadata", JSON.stringify(metadata));
  localStorage.setItem("card-game-difficulty", settings.difficulty);

  const supports = technos.map((techno, i) => {
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
    } satisfies GameCardInfo;
  });

  const actions = projects.map((project, i) => {
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
    } satisfies GameCardInfo;
  });

  const upgradeActions = upgrades.map((upgrade) => {
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
    } satisfies GameCardInfo;
  });

  const deck = shuffle([...supports, ...actions, ...upgradeActions], 3);

  return {
    logs: [],
    notification: null,
    operationInProgress: [],
    score: 0,
    reason: null,
    isWon: false,
    isGameOver: false,
    infinityMode: false,
    draw: deck.slice(7),
    hand: deck.slice(0, 7),
    discard: [],
    upgrades: [],
    cardModifiers: [["upgrade cost threshold", []]],
    day: 1,
    dayFull: false,
    sprintFull: false,
    energy: MAX_ENERGY,
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
  getState: () => CardGameState,
) {
  return {
    advanceTime: async (energy: number) => {
      const debugFloat = (float: number) => {
        return parseFloat(float.toFixed(2));
      };

      if (energy < 0) return;

      const state = getState();

      state.setOperationInProgress("advanceTime", true);

      const addedDays = debugFloat(
        Math.max(ENERGY_TO_DAYS, energy * ENERGY_TO_DAYS),
      );

      if (addedDays < ENERGY_TO_DAYS) {
        throw new Error("Not enough energy to advance time");
      }

      let previousFullDay = Math.floor(state.day);

      const after = debugFloat(state.day + addedDays);

      for (
        let day = state.day;
        day < after;
        day = debugFloat(day + ENERGY_TO_DAYS)
      ) {
        if (previousFullDay !== Math.floor(day)) {
          previousFullDay = Math.floor(day);

          set({ day: debugFloat(day), dayFull: true });

          // on joue le son de la banque
          bank.bell.play();

          state.addNotification(
            `Jour ${Math.floor(day)}`,
            "via-day text-day-foreground",
          );

          await wait(1000);

          await state.triggerEvent("daily");

          set({ dayFull: false });

          await wait(1000);
        }
      }

      set({ day: after, dayFull: null });

      state.setOperationInProgress("advanceTime", false);
    },

    addLog: (log) => {
      set((state) => ({
        logs: [...state.logs, log],
      }));
    },

    addNotification: async (text, className) => {
      set({ notification: [text, className] });

      await wait(2000);

      set({ notification: null });
    },

    dangerouslyUpdate: (partial: Partial<CardGameState>) => set(partial),

    setOperationInProgress: (operation: string, value: boolean) => {
      set((state) => ({
        operationInProgress: value
          ? [...state.operationInProgress, operation]
          : state.operationInProgress.filter((op) => op !== operation),
      }));
    },

    updateScore: () => {
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

      set({
        score: Math.round(finalScore),
      });
    },

    addEnergy: async (count, options) => {
      const state = getState();

      state.setOperationInProgress("energy", true);

      if (count > 0) {
        const addedEnergy = Math.min(count, MAX_ENERGY - state.energy);

        if (addedEnergy > 0) {
          bank.gain.play();

          state.addLog({
            value: addedEnergy,
            type: "energy",
            reason: options.reason,
          });

          await wait();
        }

        set((state) => {
          return {
            energy: Math.max(0, Math.min(MAX_ENERGY, state.energy + count)),
          };
        });
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
    },

    addReputation: async (count, options) => {
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
    },

    addMoney: async (count, options) => {
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
    },

    upgrade: async (name) => {
      const state = getState();

      state.setOperationInProgress(`upgrade ${name}`, true);

      const rawUpgrades = upgrades.find((a) => a.name === name)!;

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
                ...rawUpgrades,
                type: "upgrade",
                state: "appear",
                cumul: 1,
                max: rawUpgrades.max ?? Infinity,
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

      state.setOperationInProgress(`upgrade ${name}`, false);
    },

    triggerUpgrade: async (name, options) => {
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
    },

    triggerEvent: async (event) => {
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
    },

    addCardModifier: async (name, params, options) => {
      bank.powerUp.play();

      const indice = [name, params] as unknown as CardModifierIndice;

      set((state) => {
        return {
          cardModifiers: options?.before
            ? [indice, ...state.cardModifiers]
            : [...state.cardModifiers, indice],
        };
      });
    },

    drawCard: async (count = 1, options) => {
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
      let discardAdded = false;

      for (let i = 0; i < count; i++) {
        if (from.length === 0) {
          break;
        }

        const card = from.pop()!;

        card.state = "drawn";

        drawn.push(card.name);

        if (hand.length >= MAX_HAND_SIZE) {
          discard.push(card);
          discardAdded = true;
        } else {
          hand.push(card);
          handAdded = true;
        }
      }

      if (handAdded) bank.draw.play();
      else if (discardAdded) bank.drop.play();

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
    },

    discardCard: async (options) => {
      const toKey = options?.toDraw ? "draw" : "discard";

      // on joue le son de la banque
      bank.drop.play();

      const state = getState();

      state.setOperationInProgress("discard", true);

      const hand = state.hand
        .slice()
        .filter(
          (c) =>
            c.state !== "played" && (!options?.filter || options.filter(c)),
        );

      const dropped = options?.random
        ? [hand[Math.floor(Math.random() * state.hand.length)]]
        : hand;

      // on active l'animation de retrait des cartes
      set({
        hand: state.hand.map((c) => {
          if (dropped.some((d) => d.name === c.name)) {
            return { ...c, state: "dropped" };
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
        hand: state.hand.filter((c) => !dropped.some((d) => d.name === c.name)),
      }));

      state.setOperationInProgress("discard", false);
    },

    removeCard: async (name) => {
      const state = getState();

      state.setOperationInProgress(`removeCard ${name}`, true);

      if (state.hand.some((c) => c.name === name)) {
        // on active l'animation de suppression de la carte
        set({
          hand: state.hand.map((c) => {
            if (c.name === name) {
              return { ...c, state: "removed" };
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
    },

    /**
     * Place des cartes de la défausse dans le deck
     */
    recycleCard: async (count = 1) => {
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
    },

    playCard: async (card, options) => {
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
          await Promise.all([
            state.advanceTime(
              needs === "money" ? cost / ENERGY_TO_MONEY : cost,
            ),
            needs === "money"
              ? state.addMoney(-cost, { skipGameOverPause: true, reason })
              : state.addEnergy(-cost, { skipGameOverPause: true, reason }),
          ]);
        }
      } else {
        await cantPlay();

        return;
      }

      // on joue le son de la banque
      bank.play.play();

      const removing = willBeRemoved(state, card);

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
                state: removing ? "removed" : "played",
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
              !appliedModifiers.some((m) => m.toString() === indice.toString())
            );
          }),
        }));
      };

      const effectManagement = async () => {
        // si il ne s'agit que de pioche une carte, on attend avant de piocher
        if (card.effect.waitBeforePlay) await wait();

        // on applique l'effet de la carte (toujours via eval)
        await card.effect.onPlayed(state, card, reason);
      };

      await Promise.all([cardManagement(), effectManagement()]);

      await state.triggerEvent("onPlay");

      // on vérifie si la main est vide
      // si la main est vide, on pioche

      state = getState();

      if (state.hand.length === 0) {
        await state.triggerEvent("onEmptyHand");
        await state.drawCard(1, { reason });
      }

      if (!options?.skipGameOverPause && isGameOver(getState())) {
        await wait(2000);
      }

      state.setOperationInProgress(`play ${card.name}`, false);
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
      localStorage.removeItem("card-game-metadata");
      localStorage.removeItem("card-game-difficulty");
      localStorage.removeItem("card-game");

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

export const useCardGame = create<CardGameState>((set, getState) => ({
  ...generateInitialState(),
  ...cardGameMethods(set, getState),
}));

useCardGame.subscribe((state, prevState) => {
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
    "card-game",
    JSON.stringify(state, (key, value) => {
      if (typeof value === "function" && !(key in state)) return undefined;
      return value;
    }),
  );

  // si aucune opération n'est en cours
  if (
    state.operationInProgress.join(",") !==
      prevState.operationInProgress.join("") &&
    state.operationInProgress.length === 0
  ) {
    // on vérifie si le jeu est fini
    if (!state.infinityMode && !state.isWon && state.money >= MONEY_TO_REACH)
      state.win();
    else if (!state.isGameOver) {
      const reason = isGameOver(state);

      if (reason) state.defeat(reason);
    }

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
