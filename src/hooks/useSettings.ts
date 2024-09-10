import { create } from "zustand";

import {
  settings,
  QualityOptions,
  Settings,
  Difficulty,
} from "@/game-settings.ts";

export const useSettings = create<
  Settings & {
    updateQuality: (quality: Partial<QualityOptions>) => void;
    updateTheme: (theme: string) => void;
    updateDifficulty: (difficulty: Difficulty) => void;
    updateTutorial: (tutorial: boolean) => void;
  }
>((set) => ({
  ...settings,
  updateQuality: (quality) =>
    set((state) => ({
      quality: { ...state.quality, ...quality },
    })),
  updateTheme: (theme) => set({ theme }),
  updateDifficulty: (difficulty) => set({ difficulty }),
  updateTutorial: (tutorial) => set({ tutorial }),
}));

useSettings.subscribe((state) => {
  localStorage.setItem("settings", JSON.stringify(state));
});
