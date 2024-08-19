import { Howl } from "howler";

export const bank = {
  unauthorized: new Howl({
    src: ["sounds/unauthorized.mp3"],
    volume: 0.4,
    preload: true,
  }),
  play: new Howl({
    src: ["sounds/play.mp3"],
    volume: 1,
    preload: true,
  }),
  drop: new Howl({
    src: ["sounds/drop.mp3"],
    volume: 0.4,
    preload: true,
  }),
  draw: new Howl({
    src: ["sounds/draw.mp3"],
    preload: true,
  }),
  win: 1,
  lose: 1,
  attack: 1,
  defend: 1,
  gain: new Howl({
    src: ["sounds/gain.mp3"],
    volume: 0.4,
    preload: true,
  }),
};
