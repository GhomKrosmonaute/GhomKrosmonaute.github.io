import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { useSettings } from "@/hooks/useSettings.ts";

import Sound from "@/assets/icons/sound.svg";
import Muted from "@/assets/icons/muted.svg";
import Rules from "@/assets/icons/rules.svg";
import Settings from "@/assets/icons/settings.svg";
import Question from "@/assets/icons/question.svg";

import { cn } from "@/utils.ts";

import { Button } from "@/components/ui/button.tsx";

export const CornerIcons = (props: { show: boolean }) => {
  const enableTutorial = useGlobalState(
    (state) => () => state.setTutorial(true),
  );

  const [animation, transparency] = useSettings((state) => [
    state.quality.animations,
    state.quality.transparency,
  ]);

  const { toggleRules, toggleSettings, toggleMuted, muted } = useGlobalState(
    (state) => ({
      toggleSettings: state.toggleSettings,
      toggleMuted: state.toggleMusicMuted,
      toggleRules: state.toggleRules,
      muted: state.musicMuted,
    }),
  );

  return (
    <div
      id="corner-icons"
      className={cn(
        "absolute flex top-4 right-4 z-50 gap-2",
        "translate-x-full pointer-events-none",
        {
          hidden: !transparency,
          "opacity-0": transparency,
          "transition-all duration-500 ease-in-out": animation,
          "translate-x-0 opacity-100": props.show,
        },
      )}
    >
      <Button
        onClick={toggleRules}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
      >
        <Rules />
      </Button>
      <Button
        onClick={enableTutorial}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
      >
        <Question />
      </Button>
      <Button
        onClick={toggleSettings}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
      >
        <Settings />
      </Button>
      <Button
        onClick={toggleMuted}
        variant="icon"
        size="icon"
        className="pointer-events-auto"
      >
        {muted ? <Muted /> : <Sound />}
      </Button>
      <div className="w-10 h-10 " />
    </div>
  );
};
