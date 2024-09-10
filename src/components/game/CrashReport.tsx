import React from "react";

import ghom from "@/data/ghom.json";

import { CrashReportContext, useCrashReport } from "@/hooks/useCrashReport.ts";
import {
  GlobalGameState,
  GameState,
  useCardGame,
} from "@/hooks/useCardGame.ts";

import { cloneSomething } from "@/game-utils.ts";

import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { bank } from "@/sound.ts";

export const CrashReportProvider = ({ children }: React.PropsWithChildren) => {
  const [gameError, update, getState] = useCardGame((state) => [
    state.error,
    state.dangerouslyUpdate,
    () => state,
  ]);

  const [crashReport, setCrashReport] = React.useState<Error | null>(null);
  const [gameState, setGameState] = React.useState<
    (GameState & GlobalGameState) | null
  >(null);

  React.useEffect(() => {
    if (gameError) {
      addCrashReport(gameError, getState());
      update({ error: null });
    }
  }, [gameError]);

  const addCrashReport = React.useCallback(
    (error: Error, state: GameState & GlobalGameState) => {
      bank.error.play();
      navigator.clipboard
        .writeText(JSON.stringify({ ...state, cards: null }))
        .catch(() =>
          alert(
            "Impossible de copier le contenu de la sauvegarde dans votre presse-papier...",
          ),
        );
      setCrashReport(error);
      setGameState(cloneSomething(state));
      return error;
    },
    [],
  );

  return (
    <CrashReportContext.Provider
      value={{
        gameState,
        crashReport,
        addCrashReport,
        resetCrashReport: () => {
          setCrashReport(null);
          setGameState(null);
        },
      }}
    >
      {crashReport ? <CrashReport /> : children}
    </CrashReportContext.Provider>
  );
};

export const CrashReport = () => {
  const reset = useCardGame((state) => state.reset);
  const { resetCrashReport, crashReport, gameState } = useCrashReport();

  if (!crashReport || !gameState) return null;

  return (
    <div className="absolute inset-0 bg-background/50">
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="bg-background/90 ring ring-red-600 p-4 rounded-lg space-y-4 max-w-xl">
          <h1 className="text-3xl text-center">
            Une erreur à été interceptée !
          </h1>
          <p>
            Si tu le souhaites, tu peux envoyer le rapport d'erreur à Ghom pour
            qu'il puisse corriger le problème. Tu peux continuer ta partie, mais
            si tu rencontres des problèmes, il est conseillé de recharger la
            page. Si le bug persiste, il est possible que ta sauvegarde soit
            corrompue, dans ce cas tu devrais recommencer une nouvelle partie,
            désolé pour la gêne occasionnée.
          </p>
          <div className="grid grid-cols-2 gap-2 w-fit mx-auto">
            <Button
              onClick={() => {
                resetCrashReport();
                reset();
              }}
              size="cta"
              className="text-red-600"
            >
              Recommencer une partie
            </Button>
            <Button
              onClick={() => {
                resetCrashReport();
                window.location.reload();
              }}
              size="cta"
            >
              Rafraichir le navigateur
            </Button>
            <a
              href={`mailto:${ghom.email}?subject=${encodeURI(`Rapport d'erreur: ${crashReport.message}`)}&body=${encodeURI(
                `\n${crashReport.stack}\n\nGame state:\n< colle ici le contenu de ton presse-papier >`,
              )}`}
              className={buttonVariants({
                size: "cta",
                variant: "cta",
              })}
            >
              Envoyer le rapport
            </a>
            <Button onClick={() => resetCrashReport()} variant="cta" size="cta">
              Continuer la partie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
