import { useNavigate } from "react-router-dom"

import { Modal } from "@/components/Modal.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Hosting } from "../components/Hosting.tsx"
import { Products } from "../components/Products.tsx"

import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { t } from "@/i18n.ts"
import React from "react"
import tarifs from "../data/tarifs.json"

export const Tarifs = () => {
  const navigate = useNavigate()
  const [isCardGameVisible, setCardGameVisibility] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.setCardGameVisibility,
  ])

  React.useEffect(() => {
    if (isCardGameVisible) setCardGameVisibility(false)
  }, [isCardGameVisible])

  return (
    <Modal modalName="/pricing" big>
      <div className="space-y-4">
        <h1 className="text-center text-4xl">{t("Tarifs", "Pricing")}</h1>

        <p className="text-center text-2xl">
          <span title="Tarif journalier moyen">TJM</span>{" "}
          <code>{tarifs.tjm}€</code> {t("négociables", "")}{" "}
          <span className="md">
            (<code>~{Math.floor(tarifs.tjm / 8)}€</code>/h)
          </span>
        </p>

        <Products />
        <Hosting />

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl hidden xs:block">
            {t("Pour plus d'informations", "For more information")}
          </h2>
          <h2 className="text-2xl xs:hidden">
            {t("Intéressé ?", "Interested ?")}
          </h2>
          <Button
            onClick={() => navigate("/contact")}
            variant="cta"
            size="cta"
            className="w-full"
          >
            {t("Contactez-moi !", "Contact me!")}
          </Button>
          <p className="italic text-muted-foreground max-w-xl">
            {t(
              <>
                Les tarifs exposés sont approximatifs et peuvent être redéfinis
                en fonction de la complexité du projet lors du chiffrage du
                cahier des charges.
              </>,
              <>
                The prices exposed are approximate and may be adjusted in
                function of the complexity of the project during the billing
                process.
              </>,
            )}
          </p>
        </div>
      </div>
    </Modal>
  )
}
