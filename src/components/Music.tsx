import { useMusic } from "@/hooks/useMusic.ts";
import { Button } from "@/components/ui/button.tsx";

import Sound from "@/assets/icons/sound.svg";
import Muted from "@/assets/icons/muted.svg";

export const Music = () => {
  const [muted, toggle] = useMusic();

  return (
    <>
      <Button
        onClick={toggle}
        variant="icon"
        size="icon"
        className="absolute top-0 right-12 m-4"
      >
        {muted ? <Muted /> : <Sound />}
      </Button>
    </>
  );
};
