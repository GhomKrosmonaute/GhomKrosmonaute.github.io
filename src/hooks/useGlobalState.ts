import { create } from "zustand";

type State = {
  isCardGameVisible: boolean;
  setCardGameVisibility: (visible: boolean) => void;
  splineLoaded: boolean;
  setSplineLoaded: (loaded: boolean) => void;
};

export const useGlobalState = create<State>((set) => ({
  isCardGameVisible: false,
  setCardGameVisibility: (visible) => set({ isCardGameVisible: visible }),
  splineLoaded: false,
  setSplineLoaded: (loaded) => set({ splineLoaded: loaded }),
}));
