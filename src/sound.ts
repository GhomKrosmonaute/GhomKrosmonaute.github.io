import { Howl } from "howler"

export const bank = {
  error: new Howl({
    src: ["sounds/error.mp3"],
    volume: 0.8,
    preload: true,
  }),
  unauthorized: new Howl({
    src: ["sounds/unauthorized.mp3"],
    volume: 0.4,
    preload: true,
  }),
  coinFlip: new Howl({
    src: ["sounds/coin-flip.mp3"],
    volume: 0.7,
    preload: true,
  }),
  achievement: new Howl({
    src: ["sounds/achievement.mp3"],
    volume: 0.7,
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
  remove: new Howl({
    src: ["sounds/remove.mp3"],
    volume: 0.7,
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
  bell: new Howl({
    src: ["sounds/bell.mp3"],
    volume: 0.5,
    preload: true,
  }),
  shuffle: new Howl({
    src: ["sounds/shuffle.mp3"],
    volume: 0.5,
    preload: true,
  }),
  bubble: new Howl({
    src: ["sounds/bubble.mp3"],
    volume: 0.5,
    preload: true,
  }),
  coins: new Howl({
    src: ["sounds/coins.mp3"],
    volume: 0.5,
    preload: true,
  }),
}
