import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import Settings from "@/assets/icons/settings.svg"
import Question from "@/assets/icons/question.svg"
import Github from "@/assets/icons/social/github.svg"

import socials from "@/data/socials.json"

import { cn } from "@/utils.ts"

import { Button, buttonVariants } from "@/components/ui/button.tsx"
import { BuyMeACoffee } from "@/components/ui/buy-me-a-coffe.tsx"

const github = socials.find((s) => s.name === "Github")!

export const CornerIcons = (props: { show: boolean }) => {
  const enableTutorial = useGlobalState(
    (state) => () => state.setTutorial(true),
  )

  const [animation, transparency] = useSettings((state) => [
    state.quality.animations,
    state.quality.transparency,
  ])

  const toggleSettings = useGlobalState((state) => state.toggleSettings)

  return (
    <div
      id="corner-icons"
      className={cn(
        "absolute flex top-4 right-4 z-50 gap-2",
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
        title="Lancer le tutoriel"
      >
        <Question />
      </Button>
      <Button
        onClick={toggleSettings}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
        title="Ouvrir les paramètres"
      >
        <Settings />
      </Button>
      <div className="w-10 h-10 " />
    </div>
  )
}
