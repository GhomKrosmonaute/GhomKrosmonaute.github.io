import { Heading } from "@/components/Heading.tsx";
import { Socials } from "@/components/Socials.tsx";
import { Card } from "@/components/Card.tsx";
import { Slogan } from "@/components/Slogan.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useModal } from "@/hooks/useModal.ts";

export const Home = () => {
  const { setModal } = useModal();

  return (
    <Card>
      <Heading />
      <Socials />
      <Slogan />

      <div className="flex justify-center mt-6 w-full gap-8">
        <Button onClick={() => setModal("tarifs")}>Tarifs</Button>
        <Button onClick={() => setModal("contact")} variant="cta" size="cta">
          Contact
        </Button>
      </div>
    </Card>
  );
};
