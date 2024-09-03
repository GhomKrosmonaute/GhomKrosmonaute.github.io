import React from "react";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { Card } from "@/components/Card.tsx";
import { cn } from "@/utils.ts";
import { GameDebugActions } from "@/components/game/GameDebugActions.tsx";

export const GameDebug = () => {
  const ops = useCardGame((state) => state.operationInProgress);

  const [logs, setLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    setLogs((logs) => [...logs, ops.join(" | ")].slice(-50));
  }, [ops]);

  return (
    <Card
      className={cn(
        "group/debug absolute bottom-0 left-0 opacity-50 hover:opacity-100 z-50",
      )}
    >
      <div className={ops.length > 0 ? "bg-red-500" : "bg-green-500"}>
        Operation in progress:
        <ul>
          {ops.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>

      <div className="group-hover/debug:block hidden">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-nowrap text-sm">
            - {log}
          </div>
        ))}
      </div>

      <GameDebugActions />
    </Card>
  );
};
