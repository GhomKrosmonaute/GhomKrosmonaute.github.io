import { Heading } from "@/components/Heading.tsx";
import { Socials } from "@/components/Socials.tsx";
import { Card } from "@/components/Card.tsx";
import { Slogan } from "@/components/Slogan.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useModal } from "@/hooks/useModal.ts";
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

      <div className="flex justify-center mt-6 w-full gap-8 md:gap-5">
        {largeScreen && (
          <Button
            autoFocus={modal === "game"}
            onClick={() => setModal(modal === "game" ? false : "game")}
            onKeyDown={(e) => e.key === "Escape" && setModal(false)}
          >
            {modal === "game" ? "Stop" : "Jouer"}
          </Button>
        )}
        <Button onClick={() => setModal("tarifs")}>Tarifs</Button>
        <Button
          onClick={() => setModal("contact")}
          variant="cta"
          size="cta"
          autoFocus={modal !== "game"}
        >
          Contact
        </Button>
      </div>
    </Card>
  );
};
