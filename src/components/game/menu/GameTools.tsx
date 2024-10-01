import React from "react"

import { Label } from "@/components/ui/label.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Money, Tag } from "@/components/game/Texts.tsx"

import {
  ENERGY_TO_DAYS,
  ENERGY_TO_MONEY,
  REPUTATION_TO_ENERGY,
} from "@/game-constants.ts"
import { BentoCard } from "@/components/BentoCard.tsx"

export const GameTools = () => {
  const [value, setValue] = React.useState(0)

  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">Taux de conversion</h2>
      <BentoCard>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-right">
                <Label htmlFor="energy-input">
                  En <Tag name="energy" /> :
                </Label>
              </th>
              <th>
                <Input
                  id="energy-input"
                  min={0}
                  type="number"
                  value={value}
                  onChange={(e) => setValue(+e.target.value)}
                  placeholder="Entre une valeur en énergie"
                  className="w-fit h-6 pb-0 pt-1 px-1"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-right">En dollars :</td>
              <td>
                <Money M$={value * ENERGY_TO_MONEY} />
              </td>
            </tr>
            <tr>
              <td className="text-right">
                En <Tag name="reputation" /> :
              </td>
              <td>{(value / REPUTATION_TO_ENERGY).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="text-right">
                En <Tag name="day" /> :
              </td>
              <td>
                {value * ENERGY_TO_DAYS > 1
                  ? `${Math.floor(value * ENERGY_TO_DAYS)} jours`
                  : " "}
                {(value * ENERGY_TO_DAYS) % 1 > 0 && value * ENERGY_TO_DAYS > 1
                  ? " et "
                  : " "}
                {Math.floor(((value * ENERGY_TO_DAYS) % 1) * 24)} heures et{" "}
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
