import { GAME_ADVANTAGE } from "@/game-constants.ts"
import { Speed } from "@/game-enums.ts"
import type { Difficulty, QualityOptions, Settings } from "@/game-typings.ts"

export const difficultyIndex = Object.entries(GAME_ADVANTAGE).reduce(
  (acc, entry, index) => ({ ...acc, [entry[0]]: index + 1 }),
  {} as Record<Difficulty, number>,
)

export const qualityPresets = {
  low: ["tilt", "foil", "animations", "perspective"],
  medium: [
    "tilt",
    "foil",
    "animations",
    "perspective",
    "borderLights",
    "transparency",
    "shadows",
  ],
  high: [
    "tilt",
    "foil",
    "animations",
    "perspective",
    "borderLights",
    "transparency",
    "shadows",
    "godRays",
    "blur",
  ],
} satisfies Record<string, (keyof Omit<QualityOptions, "preset">)[]>

export const defaultSettings: Settings = {
  language: navigator.language,
  difficulty: "normal",
  tutorial: true,
  theme: "default",
  speed: Speed.Auto,
  quality: {
    shadows: true,
    transparency: true,
    borderLights: true,
    godRays: true,
    blur: true,
    tilt: true,
    foil: true,
    animations: true,
    perspective: true,
    preset: "high",
  },
}

export function updateGameSpeed(speed: Speed) {
  document.documentElement.style.setProperty(
    "--game-speed",
    speed === Speed.Auto
      ? "var(--game-auto-speed)"
      : `${
          (
            {
              [Speed.Slow]: 1000,
              [Speed.Normal]: 500,
              [Speed.Fast]: 250,
              [Speed.Extreme]: 100,
            } as Record<Speed, number>
          )[speed]
        }ms`,
  )
}

function getKeysRecursively(obj: object, keys: string[] = []): string[] {
  for (const key in obj) {
    if (typeof obj[key as keyof typeof obj] === "object") {
      getKeysRecursively(obj[key as keyof typeof obj], keys)
    } else {
      keys.push(key)
    }
  }
  return keys
}

const saved = JSON.parse(localStorage.getItem("settings") ?? "{}")
const savedKeys = getKeysRecursively(saved)
const defaultKeys = getKeysRecursively(defaultSettings)

// si une sauvegarde existe, si elle possède les mêmes clés que les settings par défaut, on la charge
// sinon on charge les settings par défaut
export const settings: Settings = JSON.parse(
  localStorage.getItem("settings")
    ? savedKeys.every((key) => defaultKeys.includes(key)) &&
      defaultKeys.every((key) => savedKeys.includes(key))
      ? localStorage.getItem("settings")!
      : JSON.stringify(defaultSettings)
    : JSON.stringify(defaultSettings),
)

if (settings.theme !== "default") {
  const root = document.body //document.getElementsByTagName("html")[0];
  root.classList.add(`theme-${settings.theme}`)
}

if (settings.speed !== Speed.Auto) {
  updateGameSpeed(settings.speed)
}
