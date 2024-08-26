import React from "react";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { Card } from "@/components/Card.tsx";
import { cn } from "@/utils.ts";

export const GameDebug = () => {
  const game = useCardGame();
  const [logs, setLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    setLogs((logs) =>
      [
        ...logs,
        `${game.isGameOver} : ${game.isWon} | ${Object.entries(
          game.operationInProgress,
        )
          .filter((entry) => entry[1])
          .map((entry) => entry[0])
          .join(" | ")}`,
      ].slice(-30),
    );
  }, [game]);

  return (
    <Card
      className={cn(
        "group/debug absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2",
        { "left-0 translate-x-0 z-50": game.isGameOver },
      )}
    >
      <div
        className={
          Object.values(game.operationInProgress).some((value) => value)
            ? "bg-red-500"
            : "bg-green-500"
        }
      >
        Operation in progress:
        <ul>
          {Object.entries(game.operationInProgress)
            .filter((entry) => entry[1])
            .map((entry, i) => (
              <li key={i}>{entry[0]}</li>
            ))}
        </ul>
      </div>

      <div className="group-hover/debug:block hidden">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-nowrap text-sm">
            {log}
          </div>
        ))}
      </div>
    </Card>
  );
};
