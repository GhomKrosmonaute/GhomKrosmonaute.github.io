import type {
  Difficulty,
  QualityOptions,
  QualityPresetName,
} from "@/game-typings"
import React from "react"
import type { Speed } from "./game-enums"
import { useSettings } from "./hooks/useSettings"

export function t<
  T1 extends string | React.ReactNode,
  T2 extends string | React.ReactNode,
>(fr: T1, en: T2): T1 | T2 {
  const settings = useSettings.getState()
  document.documentElement.lang = settings.language
  return settings.language.startsWith("fr") ? fr : en
}

export const translations: Record<
  | keyof Omit<QualityOptions, "preset">
  | Difficulty
  | Speed
  | (QualityPresetName & string),
  string
> = {
  noob: t("Débutant", "Noob"),
  easy: t("Facile", "Easy"),
  normal: "Normal",
  hard: t("Difficile", "Hard"),
  veteran: t("Vétéran", "Veteran"),
  shadows: t("Ombres", "Shadows"),
  transparency: t("Transparence", "Transparency"),
  borderLights: t("Lumières de bordure", "Border lights"),
  godRays: t("Rayons lumineux", "God rays"),
  blur: t("Flou de transparence", "Transparency blur"),
  tilt: t("Inclinaisons", "Card tilt"),
  foil: t("Reflets et textures", "Card foil"),
  animations: "Animations",
  perspective: t("Profondeur", "Card perspective"),
  auto: "Auto",
  slow: t("Lent", "Slow"),
  fast: t("Rapide", "Fast"),
  extreme: t("Extrême", "Extreme"),
  low: t("Faible", "Low"),
  medium: t("Moyenne", "Medium"),
  high: t("Maximale", "High"),
  custom: t("Personnalisée", "Custom"),
}
