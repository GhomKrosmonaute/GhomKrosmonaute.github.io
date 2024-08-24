import { cn } from "@/utils.ts";
import scores from "@/data/scores.json";
import Trophy from "@/assets/icons/trophy.svg";
import { rankColor } from "@/hooks/useCardGame.ts";
import { Card } from "@/components/Card.tsx";

export const Scoreboard = (props: { show: boolean }) => {
  return (
    <div
      className={cn(
        "absolute right-3 top-16",
        "w-fit translate-x-[110%] transition-transform duration-500 ease-in-out",
        {
          "translate-x-0": props.show,
        },
      )}
    >
      <div className="absolute bg-upgrade shadow shadow-black/50 w-10 h-4 right-0 top-5 translate-x-full" />
      <div className="absolute bg-upgrade shadow shadow-black/50 w-10 h-4 right-0 bottom-5 translate-x-full" />
      <Card>
        <div className="space-y-3 pointer-events-auto flex flex-col items-center">
          <div className="text-3xl">Scoreboard</div>
          <table>
            <tbody>
              {scores
                .sort((a, b) => b.score - a.score)
                .map((score, i) => (
                  <tr
                    key={i}
                    className={cn("*:whitespace-nowrap", rankColor(i))}
                  >
                    <td>
                      {i < 3 ? (
                        <Trophy className={cn("w-4", rankColor(i))} />
                      ) : (
                        ""
                      )}
                    </td>
                    <th># {i + 1}</th>
                    <th className="text-left">{score.name}</th>
                    <td>{score.score.toLocaleString()} pts</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="text-muted-foreground text-sm bg-muted py-1 px-2 rounded-md whitespace-nowrap">
            Si vous avez un meilleur score, vous pouvez me le <br />
            soumettre en me contactant sur Discord ou LinkedIn !
          </p>
        </div>
      </Card>
    </div>
  );
};
