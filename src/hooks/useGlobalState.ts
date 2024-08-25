import { create } from "zustand";

type State = {
  isCardGameVisible: boolean;
  splineLoaded: boolean;
  settingsVisible: boolean;
  setCardGameVisibility: (visible: boolean) => void;
  setSplineLoaded: (loaded: boolean) => void;
  toggleSettings: () => void;
};

export const useGlobalState = create<State>((set) => ({
  isCardGameVisible: false,
  splineLoaded: false,
  settingsVisible: false,
  setCardGameVisibility: (visible) => set({ isCardGameVisible: visible }),
  setSplineLoaded: (loaded) => set({ splineLoaded: loaded }),
  toggleSettings: () =>
    set((state) => ({ settingsVisible: !state.settingsVisible })),
}));
