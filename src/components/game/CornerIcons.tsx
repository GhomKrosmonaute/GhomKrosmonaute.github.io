import { useMusic } from "@/hooks/useMusic.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { Button } from "@/components/ui/button.tsx";

import Sound from "@/assets/icons/sound.svg";
import Muted from "@/assets/icons/muted.svg";
import Settings from "@/assets/icons/settings.svg";
import { cn } from "@/utils.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const CornerIcons = (props: { show: boolean }) => {
  const [muted, toggleMusic] = useMusic();
  const [animation, transparency] = useQualitySettings((state) => [
    state.animations,
    state.transparency,
  ]);

  const toggleSettings = useGlobalState((state) => state.toggleSettings);

  return (
    <div
      className={cn(
        "absolute top-4 right-16 z-50 gap-2",
        "translate-x-full pointer-events-none",
        {
          hidden: transparency,
          "opacity-0": !transparency,
          "transition-all duration-500 ease-in-out": animation,
          "translate-x-0 opacity-100 flex pointer-events-auto": props.show,
        },
      )}
    >
      <Button onClick={toggleSettings} variant="icon" size="icon">
        <Settings />
      </Button>
      <Button onClick={toggleMusic} variant="icon" size="icon">
        {muted ? <Muted /> : <Sound />}
      </Button>
    </div>
  );
};
