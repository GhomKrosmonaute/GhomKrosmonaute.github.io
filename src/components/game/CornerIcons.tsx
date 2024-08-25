import { useMusic } from "@/hooks/useMusic.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { Button } from "@/components/ui/button.tsx";

import Sound from "@/assets/icons/sound.svg";
import Muted from "@/assets/icons/muted.svg";
import Settings from "@/assets/icons/settings.svg";
import { cn } from "@/utils.ts";

export const CornerIcons = (props: { show: boolean }) => {
  const [muted, toggleMusic] = useMusic();
  const toggleSettings = useGlobalState((state) => state.toggleSettings);

  return (
    <div
      className={cn(
        "absolute top-4 right-16 z-50 flex gap-2",
        "transition-all duration-500 ease-in-out",
        "translate-x-full opacity-0 pointer-events-none",
        {
          "translate-x-0 opacity-100 pointer-events-auto": props.show,
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
