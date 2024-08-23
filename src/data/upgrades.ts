import type { Upgrade } from "@/hooks/useCardGame.ts";

type RawUpgrade = Pick<
  Upgrade,
  "name" | "description" | "image" | "onTrigger" | "cost"
> & {
  max?: number;
  cumulable?: boolean;
};

const upgrades: RawUpgrade[] = [
  {
    name: "Starbucks",
    description: "Rend @cumul @energy@s par jour",
    image: "starbucks.png",
    onTrigger: async (state, upgrade) => {
      await state.addEnergy(upgrade.cumul);
    },
    cumulable: true,
    max: 3,
    cost: "100",
  },
  {
    name: "Méditation",
    description: "Pioche @cumul carte@s par jour",
    image: "meditation.png",
    onTrigger: async (state, upgrade) => {
      await state.draw(upgrade.cumul);
    },
    cumulable: true,
    max: 3,
    cost: "100",
  },
  {
    name: "Bourse",
    description: "Gagne @cumul0% de votre capital par jour",
    image: "bourse.png",
    onTrigger: async (state, upgrade) => {
      await state.addMoney(Math.ceil((upgrade.cumul / 100) * state.money));
    },
    cumulable: true,
    cost: "150",
  },
  {
    name: "Recyclage",
    description:
      "Place @cumul carte@s aléatoire@s de la défausse dans le deck par jour",
    image: "recyclage.png",
    onTrigger: async (state, upgrade) => {
      await state.recycle(upgrade.cumul);
    },
    cumulable: true,
    max: 3,
    cost: "50",
  },
  {
    name: "I.A",
    description: "Gagne @cumulM$ fois le nombre de carte en défausse par jour",
    image: "ia.png",
    onTrigger: async (state, upgrade) => {
      await state.addMoney(upgrade.cumul * state.discard.length);
    },
    cumulable: true,
    cost: "50",
  },
  {
    name: "Sport",
    description: "Gagne @cumul @reputation@s par jour",
    image: "sport.png",
    onTrigger: async (state, upgrade) => {
      await state.addReputation(upgrade.cumul, { skipGameOverCheck: true });
    },
    cumulable: true,
    max: 2,
    cost: 12,
  },
  {
    name: "PC Puissant",
    description: "Gagne @cumulM$ fois le nombre d'@energy par jour",
    image: "pc-puissant.png",
    onTrigger: async (state, upgrade) => {
      await state.addMoney(upgrade.cumul * state.energy);
    },
    cumulable: true,
    max: 2,
    cost: 12,
  },
  {
    name: "Stagiaire",
    description: "Gagne @cumulM$ fois le nombre de cartes en main par jour",
    image: "stagiaire.png",
    onTrigger: async (state, upgrade) => {
      await state.addMoney(upgrade.cumul * state.hand.length);
    },
    cumulable: true,
    max: 5,
    cost: "100",
  },
];

export default upgrades;
