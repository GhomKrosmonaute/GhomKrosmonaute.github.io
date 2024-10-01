import React from "react"

import { FPS } from "@/components/game/FPS.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx"

import { useCardGame } from "@/hooks/useCardGame.tsx"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import type {
  Difficulty,
  QualityOptions,
  QualityPresetName,
} from "@/game-typings.ts"
import { qualityPresets, settings, translations } from "@/game-settings.ts"
import { GAME_ADVANTAGE } from "@/game-constants.ts"
import { Speed } from "@/game-enums.ts"

import Warning from "@/assets/icons/warning.svg"
import Muted from "@/assets/icons/muted.svg"
import Sound from "@/assets/icons/sound.svg"

import themes from "@/data/themes.json"
import { BentoCard } from "@/components/BentoCard.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import { omit } from "@/game-safe-utils.tsx"
import { cn } from "@/utils.ts"

export const Settings = (props: { show: boolean }) => {
  const [score, difficulty] = useCardGame((state) => [
    state.score,
    state.difficulty,
  ])

  const { toggleSettings, toggleMuted, muted } = useGlobalState((state) => ({
    toggleSettings: state.toggleSettings,
    toggleMuted: state.toggleMusicMuted,
    muted: state.musicMuted,
  }))

  const settingsCache = useSettings()

  const [hasChangedDifficulty, needReload] = React.useMemo(() => {
    return [
      difficulty !== settingsCache.difficulty,
      settingsCache.quality.animations !== settings.quality.animations,
    ]
  }, [difficulty, settingsCache.quality.animations, settingsCache.difficulty])

  const apply = React.useCallback(() => {
    if (needReload) {
      window.location.search = "?game"
    } else toggleSettings()
  }, [needReload, toggleSettings])

  return (
    <div className="space-y-4">
      <div className="relative flex justify-between items-baseline">
        <h2 className="text-3xl absolute top-0 left-0 w-full text-center mt-1">
          Settings
        </h2>
        {props.show && <FPS className="text-2xl font-mono ml-2" />}
        <div className="flex gap-2">
          <Button onClick={toggleMuted} variant="icon" size="icon">
            {muted ? <Muted /> : <Sound />}
          </Button>
        </div>
      </div>
      <div className="flex gap-5">
        <BentoCard>
          <h3>Difficulté</h3>
          <RadioGroup
            className="space-y-0 gap-0"
            value={settingsCache.difficulty}
            onValueChange={(d) => {
              settingsCache.updateDifficulty(d as keyof typeof GAME_ADVANTAGE)
            }}
          >
            {Object.keys(GAME_ADVANTAGE).map((key) => (
              <Label className="flex items-center gap-2 py-2" key={key}>
                <RadioGroupItem value={key} />
                {translations[key as Difficulty]}
              </Label>
            ))}
          </RadioGroup>
        </BentoCard>

        <BentoCard className="relative">
          <h3>Qualité</h3>
          <Select
            defaultValue={settingsCache.quality.preset}
            onValueChange={(preset: QualityPresetName) => {
              settingsCache.updateQuality({
                preset,
                ...(preset === "custom"
                  ? {}
                  : Object.fromEntries(
                      Object.entries(omit(settingsCache.quality, "preset")).map(
                        ([key]) => {
                          return [
                            key,
                            qualityPresets[preset].includes(key as any),
                          ]
                        },
                      ),
                    )),
              })
            }}
          >
            <SelectTrigger className="w-36 text-xl absolute right-2 -top-2">
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">{translations.custom}</SelectItem>
              {Object.entries(qualityPresets).map(([key]) => (
                <SelectItem key={key} value={key}>
                  {translations[key as QualityPresetName]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 grid-rows-5">
            {Object.keys(omit(settings.quality, "preset")).map((key) => (
              <Label
                className={cn(
                  "flex items-center gap-2 py-2 select-none odd:pr-5",
                  settingsCache.quality.preset !== "custom" &&
                    "cursor-not-allowed",
                )}
                key={key}
              >
                <Checkbox
                  disabled={settingsCache.quality.preset !== "custom"}
                  defaultChecked={
                    settingsCache.quality[
                      key as keyof Omit<QualityOptions, "preset">
                    ] as boolean
                  }
                  checked={
                    settingsCache.quality[
                      key as keyof Omit<QualityOptions, "preset">
                    ] as boolean
                  }
                  onCheckedChange={(value) =>
                    settingsCache.updateQuality({ [key]: value })
                  }
                />
                {translations[key as keyof Omit<QualityOptions, "preset">]}
              </Label>
            ))}
          </div>
        </BentoCard>

        <BentoCard>
          <h3>Thême</h3>
          <RadioGroup
            className="space-y-0 gap-0"
            defaultValue={settings.theme}
            onValueChange={(theme) => {
              const root = document.body //document.getElementsByTagName("html")[0];

              const oldTheme = Array.from(root.classList.values()).find((c) =>
                c.startsWith("theme-"),
              )

              if (oldTheme) root.classList.remove(oldTheme)

              root.classList.add(`theme-${theme}`)

              settingsCache.updateTheme(theme)
            }}
          >
            {themes.map((theme) => (
              <Label className="flex items-center gap-2 py-2" key={theme[0]}>
                <RadioGroupItem value={theme[0] as string} />
                {theme[0]}
              </Label>
            ))}
          </RadioGroup>
        </BentoCard>

        <BentoCard>
          <h3>Vitesse</h3>
          <RadioGroup
            className="space-y-0 gap-0"
            value={settingsCache.speed}
            onValueChange={(speed) => settingsCache.updateSpeed(speed as Speed)}
          >
            {Object.values(Speed).map((key) => (
              <Label className="flex items-center gap-2 py-2" key={key}>
                <RadioGroupItem value={key} />
                {translations[key as keyof typeof translations]}
              </Label>
            ))}
          </RadioGroup>
        </BentoCard>
      </div>

      <div className="flex gap-5">
        {hasChangedDifficulty && (
          <Button
            variant="default"
            onClick={() => {
              settingsCache.updateDifficulty(settings.difficulty)
              toggleSettings()
            }}
          >
            Annuler
          </Button>
        )}
        {score > 0 && hasChangedDifficulty ? (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button
                variant={hasChangedDifficulty ? "cta" : "default"}
                disabled={!hasChangedDifficulty}
              >
                Appliquer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-fit">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl">
                  Une partie est en cours !
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xl leading-5">
                  Le nouveau mode de difficulté sera <br />
                  appliqué à la prochaine partie.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={apply}>Continuer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant={needReload ? "cta" : "default"} onClick={apply}>
            Appliquer
          </Button>
        )}

        {(needReload || hasChangedDifficulty) && (
          <div className="flex-grow border rounded-lg flex items-center gap-3 px-3">
            <Warning className="w-5" />{" "}
            {needReload
              ? "Un rechargement peut être nécessaire."
              : "Le mode de difficulté sera appliqué à la prochaine partie."}
          </div>
        )}
      </div>
    </div>
  )
}
