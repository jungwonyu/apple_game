// get a single DOM element
export const get = (target, parent = document) => parent.querySelector(target);

// get multiple DOM elements
export const gets = (target, parent = document) => [...parent.querySelectorAll(target)];

// shuffle an array using the Fisher-Yates algorithm
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// manage BGM
export class BGM {
  constructor(name) {
    this.audio = new Audio(`../assets/mp3/${name}.mp3`);
    this.audio.loop = true;
    this.button = get(`.js-${name}Btn`);
    this.isPaused = true;
    this.init();
  }

  init() {
    this.audio.load();
    this.button.classList.add('off');
  }

  play() {
    this.audio.play();
    this.isPaused = false;
    this.button.classList.remove('off');
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPaused = true;
    this.button.classList.add('off');
  }

  pause() {
    this.audio.pause();
    this.isPaused = true;
    this.button.classList.add('off');
  }
}