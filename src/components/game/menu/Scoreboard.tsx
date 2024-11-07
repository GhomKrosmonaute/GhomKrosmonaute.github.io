import Trophy from "@/assets/icons/game/trophy.svg"
import { BentoCard } from "@/components/BentoCard.tsx"
import scores from "@/data/scores.json"
import { rankColor } from "@/game-safe-utils.tsx"
import { t, translations } from "@/i18n"
import { cn } from "@/utils.ts"

export const Scoreboard = () => {
  return (
    <div className="space-y-2 pointer-events-auto flex flex-col items-center">
      <h2 className="text-3xl">Scoreboard</h2>
      <BentoCard>
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
                <tr key={i} className={cn("*:whitespace-nowrap", rankColor(i))}>
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
                  <td>
                    {translations[score.mode as keyof typeof translations]}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </BentoCard>

      <p className="text-muted-foreground text-lg leading-5 bg-muted py-1 px-2 rounded-md whitespace-nowrap">
        {t(
          <>
            Si tu as un meilleur score, tu peux me le soumettre <br />
            en me contactant sur
          </>,
          <>
            If you have a better score, you can submit it to me <br />
            by contacting me on
          </>,
        )}{" "}
        <a
          href="https://discord.gg/3vC2XWK"
          target="_blank"
          className="font-bold"
        >
          Discord
        </a>{" "}
        {t("ou", "or")}{" "}
        <a
          href="https://www.linkedin.com/in/camille-abella-a99950176/"
          target="_blank"
          className="font-bold"
        >
          LinkedIn
        </a>{" "}
        !
      </p>
    </div>
  )
}
