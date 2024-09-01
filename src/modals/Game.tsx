import { TutorialProvider } from "@/components/game/TutorialProvider";

import { useGlobalState } from "@/hooks/useGlobalState.ts";

import steps from "@/data/tutorial.tsx";

import { CornerIcons } from "@/components/game/CornerIcons.tsx";
import { GameActions } from "@/components/game/GameActions.tsx";
import { GameAlert } from "@/components/game/GameAlert.tsx";
import { GameDebug } from "@/components/game/GameDebug.tsx";
import { GameHand } from "@/components/game/GameHand";
import { GameOver } from "@/components/game/GameOver.tsx";
import { GameValues } from "@/components/game/GameValues.tsx";
import { GameHelpers } from "@/components/game/GameHelpers.tsx";
import { GameTutorial } from "@/components/game/GameTutorial.tsx";
import { Scoreboard } from "@/components/game/Scoreboard.tsx";
import { Settings } from "@/components/game/Settings.tsx";
import { GameUpgrades } from "@/components/game/GameUpgrades.tsx";
import { GameMusic } from "@/components/game/GameMusic.tsx";
import { EventNotifier } from "@/components/game/EventNotifier.tsx";
import { GameRules } from "@/components/game/GameRules.tsx";

export const Game = () => {
  const [show, showSettings, showRules] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.settingsVisible,
    state.rulesVisible,
  ]);

  return (
    <TutorialProvider
      steps={steps}
      opaqueStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
    >
      <GameMusic />
      <GameHelpers show={show} />
      <GameAlert show={show} />
      <Scoreboard show={show} />
      <GameValues show={show} />
      <GameOver show={show} />
      <GameActions show={show} />
      <GameUpgrades show={show} />
      <CornerIcons show={show} />
      <Settings show={show && showSettings} />
      <GameRules show={show && showRules} />
      <GameHand show={show} />
      <GameTutorial show={show} />
      <EventNotifier show={show} />

      {process.env.NODE_ENV === "development" && <GameDebug />}
    </TutorialProvider>
  );
};
