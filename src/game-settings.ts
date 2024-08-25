import { GAME_ADVANTAGE } from "@/game-constants.ts";

export const settings: {
  difficulty: keyof typeof GAME_ADVANTAGE;
} = JSON.parse(
  localStorage.getItem("settings") ?? '{ "difficulty": "normal" }',
);
