import { CenterCard } from "@/components/CenterCard.tsx"
import { Heading } from "@/components/Heading.tsx"
import { Slogan } from "@/components/Slogan.tsx"
import { Socials } from "@/components/Socials.tsx"
import { Button } from "@/components/ui/button.tsx"

import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"
import { t } from "@/i18n"
import { useNavigate } from "react-router-dom"
import { useMediaQuery } from "usehooks-ts"

export const Home = () => {
  const navigate = useNavigate()
  const animation = useSettings((state) => state.quality.animations)
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)")
  const [isCardGameVisible, setCardGameVisibility] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.setCardGameVisibility,
  ])

  return (
    <CenterCard
      style={{
        pointerEvents: isCardGameVisible ? "none" : undefined,
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

      <div className="grid grid-cols-3 xs:flex xs:justify-center mt-6 w-full gap-4">
        {largeScreen && (
          <Button
            onClick={() => setCardGameVisibility(!isCardGameVisible)}
            onKeyDown={(e) =>
              e.key === "Escape" && setCardGameVisibility(false)
            }
          >
            {t("Jouer", "Play")}
          </Button>
        )}
        <Button onClick={() => navigate("/pricing")}>Tarifs</Button>
        <Button
          className="col-span-2"
          onClick={() => navigate("/contact")}
          variant="cta"
          size="cta"
        >
          Contact
        </Button>
      </div>
    </CenterCard>
  )
}
