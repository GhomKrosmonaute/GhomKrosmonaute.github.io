import { Gauge } from "@/components/game/Gauge.tsx";
import { useCardGame } from "@/hooks/useCardGame.ts";

import Discard from "@/assets/icons/discard.svg";
import Deck from "@/assets/icons/deck.svg";

export const HUD = () => {
  const energy = useCardGame((state) => state.energy);
  const streetCred = useCardGame((state) => state.streetCred);
  const deckLength = useCardGame((state) => state.deck.length);
  const discardLength = useCardGame((state) => state.discard.length);

  return (
    <div className="w-min ml-10 mt-4 space-y-4">
      <code>Card game v0.1-alpha [WIP]</code>
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
      <div className="*:flex *:items-center *:gap-2">
        <div>
          <Deck className="w-6" /> Deck: {deckLength}
        </div>
        <div>
          <Discard className="w-6" /> Défausse: {discardLength}
        </div>
      </div>
    </div>
  );
};
