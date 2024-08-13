import { Heading } from "../components/Heading.tsx";
import { Socials } from "../components/Socials.tsx";
import { Card } from "../components/Card.tsx";
import { useModal } from "../hooks/useModal.ts";
import { Slogan } from "../components/Slogan.tsx";

export const Home = () => {
  const { setModal } = useModal();

  return (
    <Card>
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
