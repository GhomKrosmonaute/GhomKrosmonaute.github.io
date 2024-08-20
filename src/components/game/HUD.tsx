import { Gauge } from "@/components/game/Gauge.tsx";
import { useCardGame } from "@/hooks/useCardGame.ts";

export const HUD = () => {
  const energy = useCardGame((state) => state.energy);
  const streetCred = useCardGame((state) => state.streetCred);

  return (
    <div className="w-full max-w-md ml-10 mt-4">
      <Gauge
        name="Energie / Points d'action"
        image="images/energy-background.png"
        value={energy}
        max={20}
      />
      <Gauge
        name="Street cred de Ghom"
        image="images/street-cred.png"
        value={streetCred}
        max={10}
        iconScale="0.3"
        textColor="text-transparent"
        barColor="bg-red-500"
      />
    </div>
  );
};
