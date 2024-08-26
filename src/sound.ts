import { Howl } from "howler";

export const music = new Howl({
  src: ["sounds/music.mp3"],
  volume: 0.5,
  loop: true,
});

export const musicId = music.play();

music.stop(musicId);

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
  upgrade: new Howl({
    src: ["sounds/upgrade.mp3"],
    volume: 0.2,
    preload: true,
  }),
  recycle: new Howl({
    src: ["sounds/recycle.mp3"],
    volume: 0.4,
    preload: true,
  }),
  cashing: new Howl({
    src: ["sounds/cashing.mp3"],
    volume: 0.7,
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
  powerUp: new Howl({
    src: ["sounds/power-up.mp3"],
    volume: 0.5,
    preload: true,
  }),
  victory: new Howl({
    src: ["sounds/victory.wav"],
    volume: 0.6,
    preload: true,
  }),
  defeat: new Howl({
    src: ["sounds/defeat.wav"],
    volume: 0.3,
    preload: true,
  }),
};
