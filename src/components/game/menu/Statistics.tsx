import { Badge, BadgeList, Money } from "@/components/game/Texts.tsx"
import cards from "@/data/cards.tsx"
import achievements from "@/data/achievements.tsx"
import { HelpPopoverTrigger } from "@/components/game/HelpPopoverTrigger.tsx"
import { MinimalistGameCardDetail } from "@/components/game/GameDetail.tsx"
import { reviveCard } from "@/game-utils.ts"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { BentoCard } from "@/components/BentoCard.tsx"
import { GameCardInfo } from "@/game-typings.ts"

export const Statistics = () => {
  const stats = useCardGame()

  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">Statistiques</h2>

      <div className="grid grid-cols-4 gap-4">
        <BentoCard>
          <h3 className="font-changa">Général</h3>
          <table>
            <tbody>
              <tr>
                <td>Score moyen</td>
                <td className="font-changa text-upgrade">
                  {Math.floor(stats.scoreAverage).toLocaleString()} pts
                </td>
              </tr>
              <tr>
                <td>Argent total</td>
                <td>
                  <Money M$={stats.totalMoney} />
                </td>
              </tr>
              <tr>
                <td>Parties gagnées</td>
                <td>{stats.wonGames}</td>
              </tr>
              <tr>
                <td>Parties jouées</td>
                <td>{stats.playedGames}</td>
              </tr>
              <tr>
                <td>Cartes découvertes</td>
                <td>
                  {stats.discoveries.length} / {cards.length}
                </td>
              </tr>
              <tr>
                <td>Succès obtenus</td>
                <td>
                  {stats.achievements.length} / {achievements.length}
                </td>
              </tr>
            </tbody>
          </table>
        </BentoCard>

        <BentoCard className="col-span-3">
          <h3 className="font-changa">Cartes découvertes</h3>
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
              : "Aucune découverte"}
          </BadgeList>
        </BentoCard>
      </div>

      <BentoCard>
        <h3 className="font-changa">Succès</h3>
        <ul className="flex flex-wrap gap-x-2">
          {stats.achievements.length > 0
            ? stats.achievements.map((achievement, i) => (
                <HelpPopoverTrigger
                  key={i}
                  popover={
                    <>
                      <h2 className="mb-2">{achievement}</h2>
                      <p>
                        {achievements.find((a) => a.name === achievement)
                          ?.description ?? "Ce succès n'existe plus."}
                      </p>
                    </>
                  }
                >
                  <li>
                    <Badge>{achievement}</Badge>
                  </li>
                </HelpPopoverTrigger>
              ))
            : "Aucun succès"}
        </ul>
      </BentoCard>
    </div>
  )
}
