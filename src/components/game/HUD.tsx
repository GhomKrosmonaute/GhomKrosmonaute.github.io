import { Gauge } from "@/components/game/Gauge.tsx";
import { useCardGame } from "@/hooks/useCardGame.ts";

export const HUD = () => {
  const energy = useCardGame((state) => state.energy);

  return (
    <div className="absolute w-full max-w-md">
      <Gauge
        name="Energie / Points d'action"
        image="images/energy-background.png"
        value={energy}
        max={20}
      />
    </div>
  );
};
