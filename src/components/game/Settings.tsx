import React from "react";

import { cn } from "@/utils.ts";
import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
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

import { settings } from "@/game-settings.ts";
import { GAME_ADVANTAGE } from "@/game-constants.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";

const translations = {
  noob: "Débutant",
  easy: "Facile",
  normal: "Normal",
  hard: "Difficile",
  veteran: "Vétéran",
  shadows: "Ombres",
  transparency: "Transparence",
  borderLights: "Lumières de bordure",
  godRays: "Rayons lumineux",
  cardBlur: "Flou de transparence",
  cardTilt: "Inclinaisons",
  cardFoil: "Reflets et textures",
  cardAnimation: "Animations",
  cardPerspective: "Profondeur",
};

export const Settings = (props: { show: boolean }) => {
  const score = useCardGame((state) => state.score);
  const toggleSettings = useGlobalState((state) => state.toggleSettings);
  const quality = useQualitySettings();

  const [difficulty, setDifficulty] = React.useState(settings.difficulty);

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

    if (difficulty !== settings.difficulty) window.location.reload();
    else toggleSettings();
  }, [difficulty, toggleSettings]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-40",
        "flex items-center justify-center pointer-events-none",
        {
          "transition-opacity duration-500 ease-in-out": quality.cardAnimation,
          "opacity-0 bg-background/80": quality.transparency,
          hidden: !quality.transparency,
          "opacity-100 flex pointer-events-auto": props.show,
        },
      )}
    >
      <Card className="space-y-4">
        <div className="text-3xl">Settings</div>
        <div className="flex gap-10 *:space-y-4 *:border *:rounded-xl *:py-4 *:px-6">
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
                  {translations[key as keyof typeof GAME_ADVANTAGE]}
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
                      quality[key as keyof typeof quality] as boolean
                    }
                    onCheckedChange={(value) =>
                      quality.update({ [key]: value })
                    }
                  />
                  {translations[key as keyof typeof translations]}
                </Label>
              ))}
            </div>
          </div>
        </div>

        {score > 0 && difficulty !== settings.difficulty ? (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="cta" size="cta">
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
                <AlertDialogAction onClick={apply}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="cta" size="cta" onClick={apply}>
            Appliquer
          </Button>
        )}
      </Card>
    </div>
  );
};
