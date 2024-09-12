import { useNavigate } from "react-router-dom"

import { Modal } from "@/components/Modal.tsx"
import { Products } from "../components/Products.tsx"
import { Hosting } from "../components/Hosting.tsx"
import { Button } from "@/components/ui/button.tsx"

import tarifs from "../data/tarifs.json"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import React from "react"

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
        <h1 className="text-center text-4xl">Tarifs</h1>

        <p className="text-center text-2xl">
          <span title="Tarif journalier moyen">TJM</span>{" "}
          <code>{tarifs.tjm}€</code> négociables{" "}
          <span className="md">
            (<code>~{Math.floor(tarifs.tjm / 8)}€</code>/h)
          </span>
        </p>

        <Products />
        <Hosting />

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl hidden xs:block">Pour plus d'informations</h2>
          <h2 className="text-2xl xs:hidden">Intéressé ?</h2>
          <Button
            onClick={() => navigate("/contact")}
            variant="cta"
            size="cta"
            className="w-full"
          >
            Contactez-moi !
          </Button>
          <p className="italic text-muted-foreground max-w-xl">
            Les tarifs exposés sont approximatifs et peuvent être redéfinis en
            fonction de la complexité du projet lors du chiffrage du cahier des
            charges.
          </p>
        </div>
      </div>
    </Modal>
  )
}
