import { Heading } from "@/components/Heading.tsx";
import { Socials } from "@/components/Socials.tsx";
import { Slogan } from "@/components/Slogan.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/Card.tsx";

export const Home = (props: { inGame?: boolean }) => {
  const navigate = useNavigate();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");

  return (
    <Card
      style={{
        transition: "transform 1s ease-in-out",
        transform: props.inGame ? "translate(-50%, -100%)" : undefined,
      }}
    >
      <Heading />
      <Socials />
      <Slogan />

      <div className="flex justify-center mt-6 w-full gap-8 md:gap-5 flex-wrap">
        {largeScreen && (
          <Button
            onClick={() => navigate(props.inGame ? "/" : "/card-game")}
            onKeyDown={(e) => e.key === "Escape" && navigate("/")}
          >
            {props.inGame ? "Stop" : "Jouer"}
          </Button>
        )}
        <Button onClick={() => navigate("/pricing")}>Tarifs</Button>
        <Button onClick={() => navigate("/contact")} variant="cta" size="cta">
          Contact
        </Button>
      </div>
    </Card>
  );
};
