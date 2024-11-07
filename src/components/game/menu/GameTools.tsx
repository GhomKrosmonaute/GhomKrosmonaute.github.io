import React from "react"

import { Money, Tag } from "@/components/game/Texts.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"

import { BentoCard } from "@/components/BentoCard.tsx"
import {
  ENERGY_TO_DAYS,
  ENERGY_TO_MONEY,
  REPUTATION_TO_ENERGY,
} from "@/game-constants.ts"
import { t } from "@/i18n"

export const GameTools = () => {
  const [value, setValue] = React.useState(0)

  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">
        {t("Taux de conversion", "Conversion rate")}
      </h2>
      <BentoCard>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-right">
                <Label htmlFor="energy-input">
                  {t("En", "From")} <Tag name="energy" /> :
                </Label>
              </th>
              <th>
                <Input
                  id="energy-input"
                  min={0}
                  type="number"
                  value={value}
                  onChange={(e) => setValue(+e.target.value)}
                  placeholder={t(
                    "Entre une valeur en énergie",
                    "Enter an energy value",
                  )}
                  className="w-fit h-6 pb-0 pt-1 px-1"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-right">
                {t("En dollars :", "To dollars :")}
              </td>
              <td>
                <Money M$={value * ENERGY_TO_MONEY} />
              </td>
            </tr>
            <tr>
              <td className="text-right">
                {t("En", "To")} <Tag name="reputation" /> :
              </td>
              <td>{(value / REPUTATION_TO_ENERGY).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="text-right">
                {t("En", "To")} <Tag name="day" /> :
              </td>
              <td>
                {value * ENERGY_TO_DAYS > 1
                  ? `${Math.floor(value * ENERGY_TO_DAYS)} ${t("jours", "days")}`
                  : " "}
                {(value * ENERGY_TO_DAYS) % 1 > 0 && value * ENERGY_TO_DAYS > 1
                  ? t(" et ", " and ")
                  : " "}
                {Math.floor(((value * ENERGY_TO_DAYS) % 1) * 24)}{" "}
                {t("heures et", "hour and")}{" "}
                {Math.floor(((((value * ENERGY_TO_DAYS) % 1) * 24) % 1) * 60)}{" "}
                minutes
              </td>
            </tr>
          </tbody>
        </table>
      </BentoCard>
    </div>
  )
}
