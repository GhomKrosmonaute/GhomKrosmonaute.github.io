import { BentoCard } from "@/components/BentoCard.tsx"
import { MinimalistGameCardDetail } from "@/components/game/GameDetail.tsx"
import { GameMetricsChart } from "@/components/game/GameMetricsChart.tsx"
import { HelpPopoverTrigger } from "@/components/game/HelpPopoverTrigger.tsx"
import { Badge, BadgeList, Money } from "@/components/game/Texts.tsx"
import achievements from "@/data/achievements.tsx"
import cards from "@/data/cards.tsx"
import { GameCardInfo } from "@/game-typings.ts"
import { reviveCard } from "@/game-utils.ts"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { t } from "@/i18n"

export const Statistics = () => {
  const stats = useCardGame()

  return (
    <div
      className="space-y-4 max-h-[550px] overflow-y-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      <h2 className="text-3xl text-center">
        {t("Statistiques", "Statistics")}
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <BentoCard>
          <h3 className="font-changa">{t("Général", "General")}</h3>
          <table>
            <tbody>
              <tr>
                <td>{t("Score moyen", "Average score")}</td>
                <td className="font-changa text-upgrade">
                  {Math.floor(stats.scoreAverage).toLocaleString()} pts
                </td>
              </tr>
              <tr>
                <td>{t("Argent total", "Total money")}</td>
                <td>
                  <Money M$={stats.totalMoney} />
                </td>
              </tr>
              <tr>
                <td>{t("Parties gagnées", "Won games")}</td>
                <td>{stats.wonGames}</td>
              </tr>
              <tr>
                <td>{t("Parties jouées", "Played games")}</td>
                <td>{stats.playedGames}</td>
              </tr>
              <tr>
                <td>{t("Cartes découvertes", "Discovered cards")}</td>
                <td>
                  {stats.discoveries.length} / {cards.length}
                </td>
              </tr>
              <tr>
                <td>{t("Succès dévérouillés", "Unlocked achievements")}</td>
                <td>
                  {stats.achievements.length} / {achievements.length}
                </td>
              </tr>
            </tbody>
          </table>
        </BentoCard>

        <BentoCard className="col-span-3">
          <h3 className="font-changa">
            {t("Cartes découvertes", "Discovered cards")}
          </h3>
          <BadgeList>
            {stats.discoveries.length > 0
              ? stats.discoveries.map((discovery, i) => {
                  let card: GameCardInfo<true>

                  try {
                    card = reviveCard(discovery, stats)
                  } catch {
                    return null
                  }

                  return (
                    <HelpPopoverTrigger
                      key={i}
                      popover={<MinimalistGameCardDetail card={card} />}
                    >
                      <li>
                        <Badge>{discovery}</Badge>
                      </li>
                    </HelpPopoverTrigger>
                  )
                })
              : t("Aucune découverte", "No discovery")}
          </BadgeList>
        </BentoCard>
      </div>

      <BentoCard>
        <h3 className="font-changa">
          {t("Succès dévérouillés", "Unlocked achievements")}
        </h3>
        <BadgeList>
          {stats.achievements.length > 0
            ? stats.achievements.map((id, i) => {
                const existing = achievements.find((a) => a.id === id)

                if (!existing)
                  return (
                    <li>
                      <Badge
                        className="cursor-not-allowed"
                        title={t(
                          "Ce succès n'existe plus",
                          "This achievment is no longer available",
                        )}
                      >
                        {id}
                      </Badge>
                    </li>
                  )

                return (
                  <HelpPopoverTrigger
                    key={i}
                    popover={
                      <>
                        <h2 className="mb-2">{existing.name}</h2>
                        <p>{existing.description}</p>
                      </>
                    }
                  >
                    <li>
                      <Badge>{existing.name}</Badge>
                    </li>
                  </HelpPopoverTrigger>
                )
              })
            : t("Aucun succès", "No achievement")}
        </BadgeList>
      </BentoCard>

      <BentoCard>
        <h3 className="font-changa">{t("Graphiques", "Charts")}</h3>
        {stats.metrics.length >= 10 ? (
          <GameMetricsChart />
        ) : (
          <p className="text-muted-foreground">
            {t(
              "Un graphique sera généré après 10 jours passés en jeu.",
              "A chart will be generated after 10 days spent in the game.",
            )}
          </p>
        )}
      </BentoCard>
    </div>
  )
}
