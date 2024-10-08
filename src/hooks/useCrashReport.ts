import React from "react"
import type { GlobalGameState, GameState } from "@/hooks/useCardGame.tsx"

export const CrashReportContext = React.createContext<{
  resetCrashReport: () => void
  addCrashReport: (error: Error, state: GameState & GlobalGameState) => void
  crashReport: Error | null
  gameState: (GameState & GlobalGameState) | null
  gameStringState: string | null
} | null>(null)

export function useCrashReport() {
  const context = React.useContext(CrashReportContext)
  if (!context) {
    throw new Error("useCrashReport must be used within a CrashReportProvider")
  }
  return context
}
