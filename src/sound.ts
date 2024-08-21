import { Howl } from "howler";

export const bank = {
  music: new Howl({
    src: ["sounds/music.mp3"],
    volume: 0.7,
    loop: true,
    preload: true,
    autoplay: true,
  }),
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
  discover: new Howl({
    src: ["sounds/discover.mp3"],
    volume: 0.2,
    preload: true,
  }),
  gain: new Howl({
    src: ["sounds/gain.mp3"],
    volume: 0.4,
    preload: true,
  }),
  loss: new Howl({
    src: ["sounds/loss.mp3"],
    volume: 1,
    preload: true,
  }),
  victory: new Howl({
    src: ["sounds/victory.wav"],
    volume: 1,
    preload: true,
  }),
  defeat: new Howl({
    src: ["sounds/defeat.wav"],
    volume: 1,
    preload: true,
  }),
};
