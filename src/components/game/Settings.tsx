import React from "react";

import { cn } from "@/utils.ts";
import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
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
} from "@/components/ui/alert-dialog.tsx";

import { useCardGame } from "@/hooks/useCardGame.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { useSettings } from "@/hooks/useSettings.ts";

import {
  Difficulty,
  QualityOptions,
  settings,
  translations,
} from "@/game-settings.ts";
import { GAME_ADVANTAGE } from "@/game-constants.ts";

import Warning from "@/assets/icons/warning.svg";

import themes from "@/data/themes.json";

import { FPS } from "@/components/game/FPS.tsx";

export const Settings = (props: { show: boolean }) => {
  const [score, difficulty] = useCardGame((state) => [
    state.score,
    state.difficulty,
  ]);
  const toggleSettings = useGlobalState((state) => state.toggleSettings);
  const settingsCache = useSettings();

  const [hasChangedDifficulty, needReload] = React.useMemo(() => {
    return [
      difficulty !== settingsCache.difficulty,
      settingsCache.quality.animations !== settings.quality.animations,
    ];
  }, [difficulty, settingsCache.quality.animations, settingsCache.difficulty]);

  const apply = React.useCallback(() => {
    if (needReload) {
      window.location.search = "?game";
    } else toggleSettings();
  }, [needReload, toggleSettings]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-30",
        "flex items-center justify-center pointer-events-none",
        {
          "transition-opacity duration-500 ease-in-out":
            settingsCache.quality.animations,
          "opacity-0 bg-background/80": settingsCache.quality.transparency,
          hidden: !settingsCache.quality.transparency,
          "opacity-100 flex pointer-events-auto": props.show,
        },
      )}
    >
      <div
        onClick={toggleSettings}
        className={cn("absolute w-full h-full left-0 top-0", {
          "pointer-events-auto": props.show,
          "pointer-events-none": !props.show,
        })}
      />

      <Card className="space-y-4 z-40">
        <div className="flex justify-between items-baseline">
          <h2 className="text-3xl">Settings</h2>
          {props.show && <FPS className="text-2xl font-mono" />}
        </div>
        <div
          className={cn(
            "flex gap-5 *:space-y-4 *:border *:rounded-xl *:py-4 *:px-6",
            {
              "*:bg-card/30": settingsCache.quality.transparency,
              "*:bg-card": !settingsCache.quality.transparency,
            },
          )}
        >
          <div>
            <div className="text-2xl">Difficulté</div>
            <RadioGroup
              className="space-y-0 gap-0"
              value={settingsCache.difficulty}
              onValueChange={(d) => {
                settingsCache.updateDifficulty(
                  d as keyof typeof GAME_ADVANTAGE,
                );
              }}
            >
              {Object.keys(GAME_ADVANTAGE).map((key) => (
                <Label className="flex items-center gap-2 py-2" key={key}>
                  <RadioGroupItem value={key} />
                  {translations[key as Difficulty]}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <div className="text-2xl">Qualité</div>
            <div className="grid grid-cols-2 grid-rows-5">
              {Object.keys(settings.quality).map((key) => (
                <Label
                  className="flex items-center gap-2 py-2 select-none odd:pr-5"
                  key={key}
                >
                  <Checkbox
                    defaultChecked={
                      settingsCache.quality[
                        key as keyof QualityOptions
                      ] as boolean
                    }
                    onCheckedChange={(value) =>
                      settingsCache.updateQuality({ [key]: value })
                    }
                  />
                  {translations[key as keyof QualityOptions]}
                </Label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-2xl">Thême (WIP)</div>
            <RadioGroup
              className="space-y-0 gap-0"
              defaultValue={settings.theme}
              onValueChange={(theme) => {
                const root = document.body; //document.getElementsByTagName("html")[0];

                const oldTheme = Array.from(root.classList.values()).find((c) =>
                  c.startsWith("theme-"),
                );

                if (oldTheme) root.classList.remove(oldTheme);

                root.classList.add(`theme-${theme}`);

                settingsCache.updateTheme(theme);
              }}
            >
              {themes.map((theme) => (
                <Label className="flex items-center gap-2 py-2" key={theme[0]}>
                  <RadioGroupItem value={theme[0] as string} />
                  {theme[0]}
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-5">
          {hasChangedDifficulty && (
            <Button
              variant="default"
              onClick={() => {
                settingsCache.updateDifficulty(settings.difficulty);
                toggleSettings();
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
                  <AlertDialogAction onClick={apply}>
                    Continuer
                  </AlertDialogAction>
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
      </Card>
    </div>
  );
};
