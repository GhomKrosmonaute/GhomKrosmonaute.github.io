import React, { useMemo } from "react";

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
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

import { Difficulty, QualityOptions, settings } from "@/game-settings.ts";
import { GAME_ADVANTAGE } from "@/game-constants.ts";

import Warning from "@/assets/icons/warning.svg";

const translations: Record<keyof QualityOptions | Difficulty, string> = {
  noob: "Débutant",
  easy: "Facile",
  normal: "Normal",
  hard: "Difficile",
  veteran: "Vétéran",
  shadows: "Ombres",
  transparency: "Transparence",
  borderLights: "Lumières de bordure",
  godRays: "Rayons lumineux",
  blur: "Flou de transparence",
  tilt: "Inclinaisons",
  foil: "Reflets et textures",
  animations: "Animations",
  perspective: "Profondeur",
};

export const Settings = (props: { show: boolean }) => {
  const score = useCardGame((state) => state.score);
  const toggleSettings = useGlobalState((state) => state.toggleSettings);
  const quality = useQualitySettings();

  const [difficulty, setDifficulty] = React.useState(settings.difficulty);

  const unsaved = useMemo(
    () => difficulty !== settings.difficulty,
    [difficulty],
  );

  const needReload = useMemo(
    () =>
      quality.animations !== settings.quality.animations ||
      difficulty !== settings.difficulty,
    [quality, difficulty],
  );
  const apply = React.useCallback(() => {
    // Apply settings
    localStorage.setItem(
      "settings",
      JSON.stringify({
        difficulty,
        quality: JSON.parse(
          localStorage.getItem("settings") ?? JSON.stringify(settings),
        ).quality,
      }),
    );

    if (needReload) window.location.reload();
    else toggleSettings();
  }, [difficulty, needReload, toggleSettings]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-30",
        "flex items-center justify-center pointer-events-none",
        {
          "transition-opacity duration-500 ease-in-out": quality.animations,
          "opacity-0 bg-background/80": quality.transparency,
          hidden: !quality.transparency,
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
        <div className="text-3xl">Settings</div>
        <div className="flex gap-5 *:space-y-4 *:border *:rounded-xl *:py-4 *:px-6">
          <div>
            <div className="text-2xl">Difficulté</div>
            <RadioGroup
              className="space-y-0 gap-0"
              defaultValue={difficulty}
              onValueChange={(d) => {
                setDifficulty(d as keyof typeof GAME_ADVANTAGE);
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
                      quality[key as keyof QualityOptions] as boolean
                    }
                    onCheckedChange={(value) =>
                      quality.update({ [key]: value })
                    }
                  />
                  {translations[key as keyof QualityOptions]}
                </Label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          {score > 0 && needReload ? (
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  variant={unsaved ? "cta" : "default"}
                  disabled={!unsaved}
                  size="cta"
                >
                  Appliquer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-fit">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl">
                    Une partie est en cours !
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va réinitialiser votre partie. <br />
                    Êtes-vous sûr de vouloir continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={apply}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant={unsaved ? "cta" : "default"}
              disabled={!unsaved}
              size="cta"
              onClick={apply}
            >
              Appliquer
            </Button>
          )}

          {needReload && (
            <div className="flex-grow border rounded-xl flex items-center gap-3 pl-3">
              <Warning className="w-5" /> Un rechargement peut être nécessaire.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
