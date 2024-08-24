import { useCardGame } from "@/hooks/useCardGame.ts";

import { MAX_ENERGY, MAX_REPUTATION } from "@/game-constants.ts";

import { Gauge } from "@/components/game/Gauge.tsx";
import { Stats } from "@/components/game/Stat.tsx";
import { Card } from "@/components/Card.tsx";
import { GameControl } from "@/components/game/GameControl.tsx";
import React from "react";
import { cn } from "@/utils.ts";

export const GameValues = (props: { show: boolean }) => {
  const [delayControl, setDelayControl] = React.useState(true);
  const [delayDiv, setDelayDiv] = React.useState(false);

  const game = useCardGame((state) => ({
    energy: state.energy,
    reputation: state.reputation,
    reset: state.reset,
  }));

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
      className={cn(
        "absolute top-20 left-3 -translate-x-[110%] transition-transform duration-500 ease-in-out",
        {
          "delay-500": delayDiv,
          "translate-x-0": props.show,
        },
      )}
    >
      <div className="absolute bg-upgrade shadow shadow-black/50 w-10 h-4 left-0 top-5 -translate-x-full" />
      <div className="absolute bg-upgrade shadow shadow-black/50 w-10 h-4 left-0 bottom-5 -translate-x-full" />

      <GameControl show={props.show} delay={delayControl} />
      <Card className="space-y-2">
        <div className="text-3xl text-center">Game values</div>
        <Gauge type="energy" value={game.energy} max={MAX_ENERGY} />
        <Gauge
          type="reputation"
          value={game.reputation}
          max={MAX_REPUTATION}
          barColor="bg-pink-500"
        />

        <Stats className="*:h-6 text-lg" verbose />
      </Card>
    </div>
  );
};
