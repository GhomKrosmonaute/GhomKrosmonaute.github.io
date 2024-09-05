import { create } from "zustand";

import { settings, QualityOptions } from "@/game-settings.ts";

export const useSettings = create<
  QualityOptions & {
    theme: string;
    update: (quality: Partial<QualityOptions & { theme: string }>) => void;
  }
>((set) => ({
  ...settings.quality,
  theme: settings.theme,
  update: (quality) => set((state) => ({ ...state, ...quality })),
}));

useSettings.subscribe((state) => {
  localStorage.setItem(
    "settings",
    JSON.stringify({
      ...JSON.parse(
        localStorage.getItem("settings") ?? JSON.stringify(settings),
      ),
      theme: state.theme,
      quality: state,
    }),
  );
});
