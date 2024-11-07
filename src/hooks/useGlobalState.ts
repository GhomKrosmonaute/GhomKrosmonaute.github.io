import { defaultSettings, settings } from "@/game-settings.ts"
import { create } from "zustand"

type State = {
  tutorial: boolean
  musicMuted: boolean
  musicVolume: number
  isCardGameVisible: boolean
  splineLoaded: boolean
  settingsVisible: boolean
  setCardGameVisibility: (visible: boolean) => void
  setSplineLoaded: (loaded: boolean) => void
  toggleSettings: () => void
  toggleMusicMuted: () => void
  setMusicVolume: (cb: (currentVolume: number) => number) => void
  setTutorial: (enable: boolean) => void
}

export const useGlobalState = create<State>((set) => ({
  tutorial: settings.tutorial,
  musicMuted: localStorage.getItem("muted") === "true",
  musicVolume: 0,
  isCardGameVisible: new URLSearchParams(location.search).has("game"),
  splineLoaded: false,
  settingsVisible: false,
  setCardGameVisibility: (visible) => set({ isCardGameVisible: visible }),
  setSplineLoaded: (loaded) => set({ splineLoaded: loaded }),
  toggleSettings: () =>
    set((state) => ({ settingsVisible: !state.settingsVisible })),
  toggleMusicMuted: () =>
    set((state) => {
      localStorage.setItem("muted", JSON.stringify(!state.musicMuted))
      return { musicMuted: !state.musicMuted }
    }),
  setMusicVolume: (volume) =>
    set((state) => ({ musicVolume: volume(state.musicVolume) })),
  setTutorial: (enable) => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        ...(localStorage.getItem("settings")
          ? JSON.parse(localStorage.getItem("settings")!)
          : defaultSettings),
        tutorial: enable,
      }),
    )
    set({ tutorial: enable })
  },
}))
