import { useModal } from "../hooks/useModal.ts";
import { Card } from "../components/Card.tsx";
import tarifs from "../data/tarifs.json";
import { Products } from "../components/Products.tsx";
import { Hosting } from "../components/Hosting.tsx";
import { Button } from "@/components/ui/button.tsx";

export const Tarifs = () => {
  const { setModal } = useModal();

  return (
    <Card onClose={() => setModal(false)} className="big">
      <h1 style={{ textAlign: "center" }}>Tarifs</h1>

      <p style={{ textAlign: "center", fontSize: "1.5em" }}>
        <span title="Tarif journalier moyen">TJM</span>{" "}
        <code>{tarifs.tjm}€</code> négociables{" "}
        <span className="md">
          (<code>~{Math.floor(tarifs.tjm / 8)}€</code>/h)
        </span>
      </p>

      <Products />
      <Hosting />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Pour plus d'informations</h2>
        <Button onClick={() => setModal("contact")} variant="cta" size="cta">
          Contactez-moi !
        </Button>
        <p
          style={{
            fontStyle: "italic",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Les tarifs peuvent être redéfinis en fonction de la complexité du
          projet.
        </p>
      </div>
    </Card>
  );
};
