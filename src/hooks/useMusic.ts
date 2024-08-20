import React from "react";
import { bank } from "@/sound.ts";

export const useMusic = (): [muted: boolean, toggle: () => void] => {
  const [muted, setMuted] = React.useState(bank.music.mute());

  // Play bank sound while the component is mounted and props.show is true
  React.useEffect(() => {
    if (bank.music.playing()) bank.music.fade(0, 0.7, 1000);
    else bank.music.play();

    return () => {
      bank.music.fade(0.7, 0, 1000);
    };
  }, []);

  return [
    muted,
    () => {
      bank.music.mute(!muted);
      setMuted(!muted);
    },
  ];
};
