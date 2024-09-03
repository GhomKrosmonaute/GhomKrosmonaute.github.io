import Trophy from "@/assets/icons/game/trophy.svg";
import { Card } from "@/components/Card.tsx";
import scores from "@/data/scores.json";
import { rankColor } from "@/game-utils.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";
import { cn } from "@/utils.ts";

export const Scoreboard = (props: { show: boolean }) => {
  const { shadows, animation, transparency } = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.animations,
    transparency: state.transparency,
  }));

  return (
    <div
      className={cn("absolute right-3 top-16 w-fit translate-x-[110%]", {
        "transition-transform duration-500 ease-in-out": animation,
        "translate-x-0": props.show,
      })}
    >
      <div
        className={cn(
          "absolute bg-upgrade w-10 h-4 right-0 top-5 translate-x-full",
          {
            "shadow shadow-black/50": shadows,
          },
        )}
      />
      <div
        className={cn(
          "absolute bg-upgrade w-10 h-4 right-0 bottom-5 translate-x-full",
          {
            "shadow shadow-black/50": shadows,
          },
        )}
      />
      <Card>
        <div className="space-y-3 pointer-events-auto flex flex-col items-center">
          <h2 className="text-3xl">Scoreboard</h2>
          <div
            className={cn("rounded-xl p-5", {
              "bg-card/40": transparency,
              "bg-card": !transparency,
            })}
          >
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Mode</th>
                </tr>
              </thead>
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
                      <th className="text-left drop-shadow-md shadow-black">
                        {score.name}
                      </th>
                      <td>{score.score.toLocaleString()} pts</td>
                      <td>{score.mode}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground text-lg leading-5 bg-muted py-1 px-2 rounded-md whitespace-nowrap">
            Si tu as un meilleur score, tu peux me le <br />
            soumettre en me contactant sur Discord ou LinkedIn !
          </p>
        </div>
      </Card>
    </div>
  );
};
