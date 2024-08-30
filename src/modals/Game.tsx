import { useGlobalState } from "@/hooks/useGlobalState.ts";

import { CornerIcons } from "@/components/game/CornerIcons.tsx";
import { GameActions } from "@/components/game/GameActions.tsx";
import { GameAlert } from "@/components/game/GameAlert.tsx";
import { GameDebug } from "@/components/game/GameDebug.tsx";
import { GameHand } from "@/components/game/GameHand";
import { GameOver } from "@/components/game/GameOver.tsx";
import { GameValues } from "@/components/game/GameValues.tsx";
import { Helpers } from "@/components/game/Helpers.tsx";
import { HighLightMask } from "@/components/game/HighLightMask";
import { Scoreboard } from "@/components/game/Scoreboard.tsx";
import { Settings } from "@/components/game/Settings.tsx";
import { Upgrades } from "@/components/game/Upgrades.tsx";
import { GameMusic } from "@/components/game/GameMusic.tsx";

export const Game = () => {
  const [show, showSettings] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.settingsVisible,
  ]);

  return (
    <>
      <GameMusic />
      <Helpers show={show} />
      <GameAlert show={show} />
      <Scoreboard show={show} />
      <GameValues show={show} />
      <GameOver show={show} />
      <GameActions show={show} />
      <Upgrades show={show} />
      <CornerIcons show={show} />
      <Settings show={show && showSettings} />
      <GameHand show={show} />
      <HighLightMask show={show} />

      {process.env.NODE_ENV === "development" && <GameDebug />}
    </>
  );
};
