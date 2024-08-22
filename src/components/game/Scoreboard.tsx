import React from "react";

import scores from "@/data/scores.json";
import { cn } from "@/utils.ts";

export const Scoreboard: React.FC = () => {
  return (
    <div className="pt-5 space-y-3 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity duration-500">
      <div className="text-2xl">Scoreboard</div>
      <table>
        <tbody>
          {scores
            .sort((a, b) => b.score - a.score)
            .map((score, i) => (
              <tr
                key={i}
                className={cn({
                  "text-activity": i === 0,
                  "text-zinc-400": i === 1,
                  "text-orange-600": i === 2,
                })}
              >
                <th># {i + 1}</th>
                <th className="text-left">{score.name}</th>
                <td>{score.score.toLocaleString()} pts</td>
              </tr>
            ))}
        </tbody>
      </table>
      <p className="text-muted-foreground text-sm bg-muted py-1 px-2 rounded-md">
        Si vous avez un meilleur score, vous pouvez me le soumettre en me
        contactant sur Discord ou LinkedIn !
      </p>
    </div>
  );
};
