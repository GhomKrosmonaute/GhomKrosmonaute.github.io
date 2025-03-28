import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import Question from "@/assets/icons/question.svg"
import Settings from "@/assets/icons/settings.svg"
import Github from "@/assets/icons/social/github.svg"

import socials from "@/data/socials.json"

import { cn } from "@/utils.ts"

import { Button, buttonVariants } from "@/components/ui/button.tsx"
import { BuyMeACoffee } from "@/components/ui/buy-me-a-coffe.tsx"
import { useTutorial } from "@/hooks/useTutorial.ts"
import { t } from "@/i18n"

const github = socials.find((s) => s.name === "Github")!

export const CornerIcons = (props: { show: boolean }) => {
  const { start } = useTutorial()

  const enableTutorial = useGlobalState((state) => () => {
    state.setTutorial(true)
    start()
  })

  const [animation, transparency] = useSettings((state) => [
    state.quality.animations,
    state.quality.transparency,
  ])

  const toggleSettings = useGlobalState((state) => state.toggleSettings)

  return (
    <div
      id="corner-icons"
      className={cn(
        "absolute flex top-4 right-4 z-30 gap-2",
        "translate-x-1/2 pointer-events-none",
        {
          hidden: !transparency,
          "opacity-0": transparency,
          "transition-all duration-500 ease-in-out": animation,
          "translate-x-0 opacity-100 flex": props.show,
        },
      )}
    >
      <BuyMeACoffee />
      <a
        href={github.url}
        target="_blank"
        className={buttonVariants({ variant: "icon" })}
      >
        <Github className="w-5 mr-2" /> Github
      </a>
      <Button
        onClick={enableTutorial}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
        title={t("Lancer le tutoriel", "Launch the tutorial")}
      >
        <Question />
      </Button>
      <Button
        onClick={toggleSettings}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
        title={t("Ouvrir les paramètres", "Open the settings")}
      >
        <Settings />
      </Button>
      <div className="w-10 h-10 " />
    </div>
  )
}
