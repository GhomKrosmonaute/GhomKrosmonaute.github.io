import { Heading } from "../components/Heading.tsx";
import { Socials } from "../components/Socials.tsx";
import { Card } from "../components/Card.tsx";
import { useModal } from "../hooks/useModal.ts";
import { Slogan } from "../components/Slogan.tsx";
import { useMediaQuery } from "usehooks-ts";

export const Home = () => {
  const { setModal, modal } = useModal();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");

  return (
    <Card
      style={{
        transition: "transform 1s ease-in-out",
        transform: modal === "game" ? "translate(-50%, -100%)" : undefined,
      }}
    >
      <Heading />
      <Socials />
      <Slogan />

      <div
        style={{
          minWidth: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
          gap: "2rem",
        }}
      >
        {largeScreen && (
          <button
            className="button"
            onClick={() => setModal(modal === "game" ? false : "game")}
          >
            {modal === "game" ? "Stop" : "Jouer"}
            <div className="light" />
          </button>
        )}
        <button className="button" onClick={() => setModal("tarifs")}>
          Tarifs
          <div className="light" />
        </button>
        <button className="button cta" onClick={() => setModal("contact")}>
          Contact
          <div className="light" />
        </button>
      </div>
    </Card>
  );
};
