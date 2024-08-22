import type { Activity } from "@/hooks/useCardGame.ts";

type RawActivity = Pick<
  Activity,
  "name" | "description" | "image" | "onTrigger" | "cost"
> & {
  max?: number;
  cumulable?: boolean;
};

const activities: RawActivity[] = [
  {
    name: "Starbucks",
    description: "Rend @cumul @energy@s par jour",
    image: "starbucks.png",
    onTrigger: async (state, activity) => {
      await state.addEnergy(activity.cumul);
    },
    cumulable: true,
    cost: "20",
  },
  {
    name: "Méditation",
    description: "Pioche @cumul carte@s par jour",
    image: "meditation.png",
    onTrigger: async (state, activity) => {
      await state.draw(activity.cumul);
    },
    cumulable: true,
    max: 3,
    cost: "20",
  },
  {
    name: "Bourse",
    description: "Gagne @cumulM$ fois le nombre de cartes en main par jour",
    image: "bourse.png",
    onTrigger: async (state, activity) => {
      await state.addMoney(activity.cumul * state.hand.length);
    },
    cumulable: true,
    cost: "25",
  },
  {
    name: "Recyclage",
    description:
      "Place @cumul carte@s aléatoire@s de la défausse dans le deck par jour",
    image: "recyclage.png",
    onTrigger: async (state, activity) => {
      await state.recycle(activity.cumul);
    },
    cumulable: true,
    max: 3,
    cost: "20",
  },
  {
    name: "I.A",
    description: "Gagne @cumulM$ fois le nombre de carte en défausse par jour",
    image: "ia.png",
    onTrigger: async (state, activity) => {
      await state.addMoney(activity.cumul * state.discard.length);
    },
    cumulable: true,
    cost: "25",
  },
];

export default activities;
