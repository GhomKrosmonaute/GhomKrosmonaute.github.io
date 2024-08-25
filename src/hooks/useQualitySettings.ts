import { create } from "zustand";

import { settings, QualityOptions } from "@/game-settings.ts";

export const useQualitySettings = create<
  QualityOptions & {
    update: (quality: Partial<QualityOptions>) => void;
  }
>((set) => ({
  ...settings.quality,
  update: (quality) => set((state) => ({ ...state, ...quality })),
}));

useQualitySettings.subscribe((state) => {
  localStorage.setItem(
    "settings",
    JSON.stringify({
      ...JSON.parse(
        localStorage.getItem("settings") ?? JSON.stringify(settings),
      ),
      quality: state,
    }),
  );
});
