import { useCardGame } from "@/hooks/useCardGame.ts";
import { MAX_ENERGY, MAX_REPUTATION } from "@/game-constants.ts";

import { Button } from "@/components/ui/button.tsx";
import { Scoreboard } from "@/components/game/Scoreboard.tsx";
import { Helpers } from "@/components/game/Helpers.tsx";
import { Upgrades } from "@/components/game/Upgrades.tsx";
import { Gauge } from "@/components/game/Gauge.tsx";
import { Stats } from "@/components/game/Stat.tsx";

export const HUD = () => {
  const game = useCardGame((state) => ({
    energy: state.energy,
    reputation: state.reputation,
    reset: state.reset,
  }));

  return (
    <div className="w-[300px] ml-10 mt-4 space-y-2">
      <code>CardGame v1-stable [WIP]</code>
      <Gauge type="energy" value={game.energy} max={MAX_ENERGY} />
      <Gauge
        type="reputation"
        value={game.reputation}
        max={MAX_REPUTATION}
        barColor="bg-pink-500"
      />

      <Stats className="*:h-6 text-lg" verbose />

      <Upgrades />

      <Button onClick={() => game.reset()} variant="default" size="cta">
        Recommencer
      </Button>

      <Helpers />

      <Scoreboard />
    </div>
  );
};
