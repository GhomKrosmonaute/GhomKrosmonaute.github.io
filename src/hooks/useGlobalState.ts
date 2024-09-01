import { create } from "zustand";

type State = {
  musicMuted: boolean;
  musicVolume: number;
  isCardGameVisible: boolean;
  splineLoaded: boolean;
  rulesVisible: boolean;
  settingsVisible: boolean;
  setCardGameVisibility: (visible: boolean) => void;
  setSplineLoaded: (loaded: boolean) => void;
  toggleRules: () => void;
  toggleSettings: () => void;
  toggleMusicMuted: () => void;
  setMusicVolume: (cb: (currentVolume: number) => number) => void;
};

export const useGlobalState = create<State>((set) => ({
  musicMuted: localStorage.getItem("muted") === "true",
  musicVolume: 0,
  isCardGameVisible: false,
  rulesVisible: false,
  splineLoaded: false,
  settingsVisible: false,
  setCardGameVisibility: (visible) => set({ isCardGameVisible: visible }),
  setSplineLoaded: (loaded) => set({ splineLoaded: loaded }),
  toggleSettings: () =>
    set((state) => ({ settingsVisible: !state.settingsVisible })),
  toggleMusicMuted: () =>
    set((state) => {
      localStorage.setItem("muted", JSON.stringify(!state.musicMuted));
      return { musicMuted: !state.musicMuted };
    }),
  setMusicVolume: (volume) =>
    set((state) => ({ musicVolume: volume(state.musicVolume) })),
  toggleRules: () => set((state) => ({ rulesVisible: !state.rulesVisible })),
}));
