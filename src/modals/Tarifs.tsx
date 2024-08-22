import { useNavigate } from "react-router-dom";

import { Modal } from "@/components/Modal.tsx";
import { Products } from "../components/Products.tsx";
import { Hosting } from "../components/Hosting.tsx";
import { Button } from "@/components/ui/button.tsx";

import tarifs from "../data/tarifs.json";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

export const Tarifs = () => {
  const navigate = useNavigate();
  const setCardGameVisibility = useGlobalState(
    (state) => state.setCardGameVisibility,
  );

  setCardGameVisibility(false);

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
          <h2 className="text-2xl">Pour plus d'informations</h2>
          <Button onClick={() => navigate("/contact")} variant="cta" size="cta">
            Contactez-moi !
          </Button>
          <p className="italic text-muted-foreground">
            Les tarifs peuvent être redéfinis en fonction de la complexité du
            projet.
          </p>
        </div>
      </div>
    </Modal>
  );
};
