import React from "react";
import { cn } from "@/utils.ts";
import helpers from "@/data/helpers.json";
import { formatText } from "@/game-utils.ts";
import {
  ENERGY_TO_MONEY,
  REPUTATION_TO_ENERGY,
  ENERGY_TO_DAYS,
} from "@/game-constants.ts";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import Cross from "@/assets/icons/cross.svg";
import { useCardGame } from "@/hooks/useCardGame.ts";

export const GameRules = (props: { show: boolean }) => {
  const close = useGlobalState((state) => state.toggleRules);

  const stats = useCardGame((state) => ({
    scoreAverage: state.scoreAverage,
    totalMoney: state.totalMoney,
    wonGames: state.wonGames,
    playedGames: state.playedGames,
    discoveries: state.discoveries,
    achievements: state.achievements,
    addDiscovery: state.addDiscovery,
    addAchievement: state.addAchievement,
    addWonGame: state.addWonGame,
    addPlayedGame: state.addPlayedGame,
  }));

  const [value, setValue] = React.useState(0);

  return (
    <div
      onClick={(e) => {
        // it the target isn't the background, don't close the modal
        if (e.target !== e.currentTarget) return;
        close();
      }}
      className={cn(
        "absolute z-50 w-screen h-svh flex justify-center items-center",
        {
          "bg-background/80": true,
          hidden: !props.show,
        },
      )}
    >
      <div className="relative bg-background/80 space-y-4 p-10 rounded-xl pointer-events-auto">
        <Button
          onClick={close}
          variant="icon"
          size="sm"
          className="absolute top-5 right-5"
        >
          <Cross />
        </Button>

        <h1 className="text-5xl">Informations</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-5 rounded-xl space-y-2">
            <h2 className="text-3xl">Règles du jeu</h2>
            {helpers.map((helper, i) => (
              <div
                key={i}
                dangerouslySetInnerHTML={{
                  __html: formatText(helper),
                }}
              />
            ))}
          </div>
          <div className="grid grid-rows-3 gap-4 *:bg-card *:p-5 *:rounded-xl *:space-y-2">
            <div>
              <h2 className="text-3xl">Taux de conversion</h2>
              <Label>
                Énergie
                <Input
                  min={0}
                  type="number"
                  value={value}
                  onChange={(e) => setValue(+e.target.value)}
                  placeholder="Entre une valeur en énergie"
                />
              </Label>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-right">En Dollars :</td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: formatText(`${value * ENERGY_TO_MONEY}M$`),
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      className="text-right"
                      dangerouslySetInnerHTML={{
                        __html: formatText("En @reputation :"),
                      }}
                    ></td>
                    <td>{(value / REPUTATION_TO_ENERGY).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td
                      className="text-right"
                      dangerouslySetInnerHTML={{
                        __html: formatText("En @day :"),
                      }}
                    ></td>
                    <td>
                      {value * ENERGY_TO_DAYS > 1
                        ? `${Math.floor(value * ENERGY_TO_DAYS)} jours`
                        : ""}
                      {(value * ENERGY_TO_DAYS) % 1 > 0 &&
                      value * ENERGY_TO_DAYS > 1
                        ? " et "
                        : ""}
                      {Math.floor(((value * ENERGY_TO_DAYS) % 1) * 24)} heures
                      et{" "}
                      {Math.floor(
                        ((((value * ENERGY_TO_DAYS) % 1) * 24) % 1) * 60,
                      )}{" "}
                      minutes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="row-span-2 flex flex-col gap-5">
              <h2 className="text-3xl">Statistiques</h2>

              <div>
                <h3 className="font-changa">Général</h3>
                <table>
                  <tbody>
                    <tr>
                      <td>Score moyen</td>
                      <td className="font-changa text-upgrade">
                        {stats.scoreAverage} pts
                      </td>
                    </tr>
                    <tr>
                      <td>Argent total</td>
                      <td
                        dangerouslySetInnerHTML={{
                          __html: formatText(`${stats.totalMoney}M$`),
                        }}
                      ></td>
                    </tr>
                    <tr>
                      <td>Parties gagnées</td>
                      <td>{stats.wonGames}</td>
                    </tr>
                    <tr>
                      <td>Parties jouées</td>
                      <td>{stats.playedGames}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-changa">Cartes découvertes</h3>
                <ul>
                  {stats.discoveries.length > 0
                    ? stats.discoveries.map((discovery, i) => (
                        <li key={i}>{discovery}</li>
                      ))
                    : "Aucune découverte"}
                </ul>
              </div>

              <div>
                <h3 className="font-changa">Succès</h3>
                <ul>
                  {stats.achievements.length > 0
                    ? stats.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))
                    : "Aucun succès"}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
