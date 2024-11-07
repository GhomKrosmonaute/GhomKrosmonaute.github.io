import { t } from "@/i18n"

export const Heading = () => {
  return (
    <div className="flex flex-col md:flex-row gap-2 mx-auto max-w-fit whitespace-nowrap">
      <h1 className="text-7xl xs:text-8xl md:text-7xl mx-auto">GHOM</h1>
      <div className="flex md:grid grid-rows-2 sm:*:text-center gap-2 md:gap-0 mx-auto sm:mx-0">
        <div className="text-4xl md:text-5xl md:translate-y-3">
          {t("Développeur", "Developer")}
        </div>
        <div className="text-4xl">
          Web <span className="hidden xs:inline">Freelance</span>
        </div>
      </div>
    </div>
  )
}
