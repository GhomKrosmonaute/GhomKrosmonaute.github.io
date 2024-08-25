import { useCardGame } from "@/hooks/useCardGame.ts";
import { Card } from "@/components/Card.tsx";

export const GameDebug = () => {
  const game = useCardGame();

  return (
    <Card className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
      <div>Upgrades: {game.upgrades.length}</div>
      <div>
        Operation in progress:
        <ul>
          {Object.entries(game.operationInProgress)
            .filter((entry) => entry[1])
            .map((entry, i) => (
              <li key={i}>{entry[0]}</li>
            ))}
        </ul>
      </div>
    </Card>
  );
};
