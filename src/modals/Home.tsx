import { Heading } from "../components/Heading.tsx";
import { Socials } from "../components/Socials.tsx";
import { Card } from "../components/Card.tsx";
import { useModal } from "../hooks/useModal.ts";

export const Home = () => {
  const { setModal } = useModal();

  return (
    <Card>
      <Heading />
      <Socials />

      <p style={{ textAlign: "center", letterSpacing: "0.15rem" }}>
        Une qualité <span className="changa">maximale</span> pour un prix{" "}
        <span className="changa">minimal</span>
      </p>

      <div
        style={{
          minWidth: "100%",
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: "2rem",
        }}
      >
        <a
          className="button"
          href="https://github.com/GhomKrosmonaute"
          target="_blank"
        >
          Projets
        </a>
        <button className="button cta" onClick={() => setModal("contact")}>
          Contact
        </button>
        <button className="button" onClick={() => setModal("tarifs")}>
          Tarifs
        </button>
      </div>
    </Card>
  );
};
