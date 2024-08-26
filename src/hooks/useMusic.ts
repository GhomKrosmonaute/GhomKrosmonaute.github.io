import React from "react";
import { music, musicId } from "@/sound.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

export const useMusic = (): [muted: boolean, toggle: () => void] => {
  const isGameVisible = useGlobalState((state) => state.isCardGameVisible);
  const [muted, setMuted] = React.useState(
    localStorage.getItem("muted") === "true",
  );

  React.useEffect(() => {
    music.mute(muted, musicId);
    localStorage.setItem("muted", JSON.stringify(muted));
  }, [muted]);

  React.useEffect(() => {
    if (isGameVisible) {
      music.play(musicId);
      music.fade(0, 0.5, 1000, musicId);
    } else music.fade(0.5, 0, 1000, musicId);
  }, [isGameVisible]);

  return [muted, () => setMuted(!muted)];
};
