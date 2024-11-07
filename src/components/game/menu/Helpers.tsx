import { BentoCard } from "@/components/BentoCard.tsx"
import helpers from "@/data/helpers.tsx"
import { t } from "@/i18n"

export const Helpers = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">{t("Aide", "Helpers")}</h2>
      <BentoCard>
        <div className="max-h-[60vh] overflow-y-scroll gap-y-1 gap-x-4 xl:grid grid-cols-2">
          {Object.values(helpers).map((helper, i) => (
            <div key={i} className="whitespace-nowrap">
              {helper}
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  )
}
