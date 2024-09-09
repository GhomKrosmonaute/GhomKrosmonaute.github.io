import React from "react";
import type { CardGame, CardGameState } from "@/hooks/useCardGame.ts";

export const CrashReportContext = React.createContext<{
  resetCrashReport: () => void;
  addCrashReport: (error: Error, state: CardGameState & CardGame) => Error;
  crashReport: Error | null;
  gameState: (CardGameState & CardGame) | null;
} | null>(null);

export function useCrashReport() {
  const context = React.useContext(CrashReportContext);
  if (!context) {
    throw new Error("useCrashReport must be used within a CrashReportProvider");
  }
  return context;
}
