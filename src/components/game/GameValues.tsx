import React from "react";

import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

import { GameControl } from "@/components/game/GameControl.tsx";
import { GameLogs } from "@/components/game/GameLogs.tsx";
import { Stats } from "@/components/game/Stat.tsx";
import { Card } from "@/components/Card.tsx";

import { cn } from "@/utils.ts";

export const GameValues = (props: { show: boolean }) => {
  const { shadows, animation } = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.animations,
  }));

  const [delayControl, setDelayControl] = React.useState(true);
  const [delayDiv, setDelayDiv] = React.useState(false);

  // use an effect for delay the transmission of "props.show" to the "GameControl"
  // component but only if it's true, otherwise it's the parent div that will be delayed

  React.useEffect(() => {
    if (props.show) {
      setDelayDiv(true);
      setDelayControl(false);
    } else {
      setDelayControl(true);
      setDelayDiv(false);
    }
  }, [props.show]);

  return (
    <div
      className={cn("absolute top-20 left-3 -translate-x-[110%]", {
        "transition-transform duration-500 ease-in-out": animation,
        "delay-500": delayDiv && animation,
        "translate-x-0": props.show,
      })}
    >
      <div
        className={cn(
          "absolute bg-upgrade w-10 h-4 left-0 top-5 -translate-x-full",
          { "shadow shadow-black/50": shadows },
        )}
      />
      <div
        className={cn(
          "absolute bg-upgrade w-10 h-4 left-0 bottom-5 -translate-x-full",
          { "shadow shadow-black/50": shadows },
        )}
      />

      <GameControl show={props.show} delay={delayControl} />
      <GameLogs show={props.show} />

      <Card className="space-y-2 w-[400px]">
        <Stats className="*:h-6 text-lg" forHUD />
      </Card>
    </div>
  );
};
