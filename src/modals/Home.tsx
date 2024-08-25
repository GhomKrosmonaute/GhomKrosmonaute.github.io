import { Heading } from "@/components/Heading.tsx";
import { Socials } from "@/components/Socials.tsx";
import { Slogan } from "@/components/Slogan.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CenterCard } from "@/components/CenterCard.tsx";

import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const Home = () => {
  const navigate = useNavigate();
  const animation = useQualitySettings((state) => state.cardAnimation);
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const [isCardGameVisible, setCardGameVisibility] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.setCardGameVisibility,
  ]);

  return (
    <CenterCard
      style={{
        opacity: isCardGameVisible ? 0 : 1,
        transition: animation
          ? "opacity 0.5s ease-in-out, transform 0.5s ease-in-out"
          : "none",
        transform: isCardGameVisible
          ? "translate(0%, -150%) scale(0.7)"
          : undefined,
      }}
    >
      <Heading />
      <Socials />
      <Slogan />

      <div className="flex justify-center mt-6 w-full gap-8 md:gap-5 flex-wrap">
        {largeScreen && (
          <Button
            onClick={() => setCardGameVisibility(!isCardGameVisible)}
            onKeyDown={(e) =>
              e.key === "Escape" && setCardGameVisibility(false)
            }
          >
            Jouer
          </Button>
        )}
        <Button onClick={() => navigate("/pricing")}>Tarifs</Button>
        <Button onClick={() => navigate("/contact")} variant="cta" size="cta">
          Contact
        </Button>
      </div>
    </CenterCard>
  );
};
