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
    max: 3,
    cost: "100",
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
    cost: "100",
  },
  {
    name: "Bourse",
    description: "Gagne @cumul0% de votre capital par jour",
    image: "bourse.png",
    onTrigger: async (state, activity) => {
      await state.addMoney(Math.ceil((activity.cumul / 100) * state.money));
    },
    cumulable: true,
    cost: "150",
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
    cost: "50",
  },
  {
    name: "I.A",
    description: "Gagne @cumulM$ fois le nombre de carte en défausse par jour",
    image: "ia.png",
    onTrigger: async (state, activity) => {
      await state.addMoney(activity.cumul * state.discard.length);
    },
    cumulable: true,
    cost: "50",
  },
  {
    name: "Sport",
    description: "Gagne @cumul @reputation@s par jour",
    image: "sport.png",
    onTrigger: async (state, activity) => {
      await state.addReputation(activity.cumul, { skipGameOverCheck: true });
    },
    cumulable: true,
    max: 2,
    cost: 12,
  },
  {
    name: "PC Puissant",
    description: "Gagne @cumulM$ fois le nombre d'@energy par jour",
    image: "pc-puissant.png",
    onTrigger: async (state, activity) => {
      await state.addMoney(activity.cumul * state.energy);
    },
    cumulable: true,
    max: 2,
    cost: 12,
  },
  {
    name: "Stagiaire",
    description: "Gagne @cumulM$ fois le nombre de cartes en main par jour",
    image: "stagiaire.png",
    onTrigger: async (state, activity) => {
      await state.addMoney(activity.cumul * state.hand.length);
    },
    cumulable: true,
    max: 5,
    cost: "100",
  },
];

export default activities;
