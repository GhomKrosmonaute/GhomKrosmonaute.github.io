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

import { settings } from "@/game-settings.ts";
import { GAME_ADVANTAGE } from "@/game-constants.ts";

export const Settings = (props: { show: boolean }) => {
  const score = useCardGame((state) => state.score);
  const toggleSettings = useGlobalState((state) => state.toggleSettings);

  const [difficulty, setDifficulty] = React.useState(settings.difficulty);

  const apply = React.useCallback(() => {
    // Apply settings
    localStorage.setItem("settings", JSON.stringify({ difficulty }));

    if (difficulty !== settings.difficulty) window.location.reload();
    else toggleSettings();
  }, [difficulty, toggleSettings]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-40 bg-background/80",
        "flex items-center justify-center opacity-0 pointer-events-none",
        "transition-opacity duration-500 ease-in-out",
        { "opacity-100 pointer-events-auto": props.show },
      )}
    >
      <Card className="space-y-4">
        <div className="text-3xl">Settings</div>
        <div className="grid *:space-y-4">
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
                  {key}
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>

        {score > 0 && difficulty !== settings.difficulty ? (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button>Appliquer</Button>
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
          <Button onClick={apply}>Appliquer</Button>
        )}
      </Card>
    </div>
  );
};
