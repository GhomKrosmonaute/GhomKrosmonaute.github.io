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

export const GameRules = (props: { show: boolean }) => {
  const close = useGlobalState((state) => state.toggleRules);
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
        <div className="grid grid-cols-2 gap-4 *:bg-card *:p-5 *:rounded-xl *:space-y-2">
          <div>
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
          <div>
            <h2 className="text-3xl">Taux de conversion</h2>
            <Label>
              Énergie
              <Input
                min={0}
                type="number"
                value={value}
                onChange={(e) => setValue(+e.target.value)}
                placeholder="Entrez une valeur en énergie"
              />
            </Label>
            <table>
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>En Dollars</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: formatText(`${value * ENERGY_TO_MONEY}M$`),
                    }}
                  ></td>
                </tr>
                <tr>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: formatText("En @reputation"),
                    }}
                  ></td>
                  <td>{(value / REPUTATION_TO_ENERGY).toFixed(2)}</td>
                </tr>
                <tr>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: formatText("En @day"),
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
                    {Math.floor(((value * ENERGY_TO_DAYS) % 1) * 24)} heures et{" "}
                    {Math.floor(
                      ((((value * ENERGY_TO_DAYS) % 1) * 24) % 1) * 60,
                    )}{" "}
                    minutes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
