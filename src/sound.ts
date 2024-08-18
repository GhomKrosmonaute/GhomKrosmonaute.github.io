import { Howl } from "howler";

export const bank = {
  unauthorized: new Howl({
    src: ["unauthorized.mp3"],
    volume: 0.4,
    preload: true,
  }),
  play: new Howl({
    src: ["play.mp3"],
    volume: 1,
    preload: true,
  }),
  drop: new Howl({
    src: ["drop.mp3"],
    volume: 0.4,
    preload: true,
  }),
  draw: new Howl({
    src: ["draw.mp3"],
    preload: true,
  }),
  win: 1,
  lose: 1,
  attack: 1,
  defend: 1,
  gain: new Howl({
    src: ["gain.mp3"],
    volume: 0.4,
    preload: true,
  }),
};
