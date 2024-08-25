import { GAME_ADVANTAGE } from "@/game-constants.ts";

export type Difficulty = keyof typeof GAME_ADVANTAGE;
export interface QualityOptions {
  shadows: boolean; // ajoute les ombres
  transparency: boolean; // backgrounds transparents
  borderLights: boolean; // ajoute les lumières sur les bords
  godRays: boolean; // ajoute les god rays
  cardBlur: boolean; // background blur sur toutes les cartes du site
  cardTilt: boolean; // utilise Tilt ou non (agis sur cardFoil et cardPerspective)
  cardFoil: boolean; // montre le reflet et la texture des cartes ou non
  cardAnimation: boolean; // utilise les keyframes ou non
  cardPerspective: boolean; // transformStyle: "preserve-3d" | "flat"
}

export const defaultSettings: Settings = {
  difficulty: "normal",
  quality: {
    shadows: true,
    transparency: true,
    borderLights: true,
    godRays: true,
    cardBlur: true,
    cardTilt: true,
    cardFoil: true,
    cardAnimation: true,
    cardPerspective: true,
  },
};

interface Settings {
  difficulty: Difficulty;
  quality: QualityOptions;
}

export const settings: Settings = JSON.parse(
  localStorage.getItem("settings") ?? JSON.stringify(defaultSettings),
);
