import { create } from "zustand"

import { Speed } from "@/game-enums.ts"
import { settings, updateGameSpeed } from "@/game-settings.ts"
import type { Difficulty, QualityOptions, Settings } from "@/game-typings.ts"

export const useSettings = create<
  Settings & {
    updateQuality: (quality: Partial<QualityOptions>) => void
    updateTheme: (theme: string) => void
    updateDifficulty: (difficulty: Difficulty) => void
    updateTutorial: (tutorial: boolean) => void
    updateSpeed: (speed: Speed) => void
    toggleLanguage: () => void
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
  updateSpeed: (speed) => {
    set({ speed })

    // change the css variable --game-speed from the root element
    updateGameSpeed(speed)
  },
  toggleLanguage: () =>
    set((state) => ({
      language: state.language === "fr" ? "en" : "fr",
    })),
}))

useSettings.subscribe((state) => {
  localStorage.setItem("settings", JSON.stringify(state))
})
