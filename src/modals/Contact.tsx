import { useModal } from "../hooks/useModal.ts";
import { Card } from "../components/Card.tsx";
import { IoMail, IoLogoLinkedin } from "react-icons/io5";

export const Contact = () => {
  const { setModal } = useModal();

  return (
    <Card onClose={() => setModal(false)}>
      <h1>Contact</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <a href="mailto: camille.abella@proton.me" target="_blank">
          <code style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <IoMail />
            camille.abella@proton.me
          </code>
        </a>
        <a
          href="https://www.linkedin.com/in/camille-abella-a99950176/"
          target="_blank"
        >
          <code style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <IoLogoLinkedin />
            LinkedIn: Camille ABELLA
          </code>
        </a>
      </div>
    </Card>
  );
};
