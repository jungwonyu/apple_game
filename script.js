import * as CONFIG from './common/config.js';
import { get, gets, shuffle, BGM } from './common/base.js';

const firstDiv = get('div');
const intro = get('.js-intro');

const main = get('.js-main');
const itemBox = get('.js-itemBox');
const timer = get('.js-timer');
const guideBox = get('.js-guideBox');
const outro = get('.js-outro');

const startBtn = get('.js-startBtn');
const resetBtns = gets('.js-resetBtn');
const graymodeBtn = get('.js-graymodeBtn'); 
const mainScore = get('.js-main .score');
const outroScore = get('.js-outro .score');

class SumTenPuzzle {
  constructor() {
    this.bgm = new BGM('bgm');
    this.timerInterval = null;
    this.time = 2;
    this.selectedList = [];
    this.items = [];
    this.score = 0;
    this.init();
  }

  init() {
    this.bgm.stop();
    this.bgm.button.addEventListener('click', () => this.setBgm());
    startBtn.addEventListener('click', () => this.startGame());
    graymodeBtn.addEventListener('click', () => this.setGrayMode());
    resetBtns.forEach((resetBtn) => resetBtn.addEventListener('click', () => this.reset()));
    main.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    main.addEventListener('touchstart', (event) => this.handleMouseDown(event.touches[0]));
  }

  beforeStart() {
    firstDiv.classList.add(CONFIG.CLA_IS_PLAYING);
    intro.classList.remove(CONFIG.CLA_ON);
    main.classList.add(CONFIG.CLA_ON);
    this.createItems();
  }

  reset() {
    clearInterval(this.timerInterval);
    timer.style.height = `0%`;
    this.bgm.stop();
    firstDiv.classList.remove(CONFIG.CLA_IS_GRAY_MODE, CONFIG.CLA_IS_END);
    intro.classList.add(CONFIG.CLA_ON);
    main.classList.remove(CONFIG.CLA_ON);
    outro.classList.remove(CONFIG.CLA_ON);
    graymodeBtn.classList.remove(CONFIG.CLA_OFF);
    this.score = 0;
    mainScore.innerText = this.score;
    outroScore.innerText = this.score;
    this.selectedList = [];
    for (const item of this.items) item.remove();
    this.items = [];
  }

  startGame() {
    this.beforeStart();
    this.bgm.play();
    this.setTimer();
  }

  endGame() {
    outro.classList.add(CONFIG.CLA_ON);
    firstDiv.classList.remove(CONFIG.CLA_IS_PLAYING);
    firstDiv.classList.add(CONFIG.CLA_IS_END);
    outroScore.innerText = this.score;
  }

  createItems() {
    const numbers = Array.from({ length: 170 }, (_, i) => (i % 9) + 1);
    shuffle(numbers);
    numbers.forEach((num) => {
      const li = document.createElement('li');
      li.classList.add('item');
      itemBox.appendChild(li);
      li.innerText = num;
    });
    this.items.push(...gets('.item'));
  }

  handleMouseDown(event) {
    main.startDrag = { x: event.clientX, y: event.clientY };

    this.initGuideBox();

    const move = (event) => this.handleMouseMove(event);
    const touchMove = (event) => this.handleMouseMove(event.touches[0]);
    const up = () => this.handleMouseUp(move, up);
    const touchEnd = () => this.handleMouseUp(touchMove, touchEnd);

    main.addEventListener('mousemove', move);
    main.addEventListener('touchmove', touchMove);
    main.addEventListener('mouseup', up);
    main.addEventListener('touchend', touchEnd);
    main.addEventListener('mouseleave', up);
  }

  handleMouseMove(event) {
    const topBoundary = Math.min(event.clientY, main.startDrag.y);
    const bottomBoundary = Math.max(event.clientY, main.startDrag.y);
    const leftBoundary = Math.min(event.clientX, main.startDrag.x);
    const rightBoundary = Math.max(event.clientX, main.startDrag.x);
    const width = rightBoundary - leftBoundary;
    const height = bottomBoundary - topBoundary;

    guideBox.style.width = `${width}px`;
    guideBox.style.height = `${height}px`;
    guideBox.style.transform = `translate3d(${leftBoundary}px, ${topBoundary}px, 0)`;

    const selectedItems = gets('.item:not(.off)', itemBox).filter((item) => {
      const itemRect = item.getBoundingClientRect();
      const guideBoxRect = guideBox.getBoundingClientRect();
      const isOverlapping = !(
        itemRect.right < guideBoxRect.left || itemRect.left > guideBoxRect.right ||
        itemRect.bottom < guideBoxRect.top ||itemRect.top > guideBoxRect.bottom
      );
      return isOverlapping;
    });

    this.selectedList = selectedItems;
    guideBox.style.backgroundColor = this.isTen() ? CONFIG.COLOR_SUCCESS : CONFIG.COLOR_FAIL;
  }

  async handleMouseUp(move, up) {
    main.removeEventListener('mousemove', move);
    main.removeEventListener('touchmove', move);
    main.removeEventListener('mouseup', up);
    main.removeEventListener('touchend', up);
    main.removeEventListener('mouseleave', up);
    main.removeEventListener('touchcancel', up);
    await new Promise((resolve) => setTimeout(resolve, 0));
    this.isTen() && this.setScore();
    this.initGuideBox();
  }

  initGuideBox() {
    guideBox.style.width = `0px`;
    guideBox.style.height = `0px`;
    guideBox.style.top = `0px`;
    guideBox.style.left = `0px`;
  }

  isTen() {
    const sum = this.selectedList.reduce((acc, item) => {
      const num = parseInt(item.innerText);
      return acc + num;
    }, 0);

    return sum === 10;
  }

  setTimer() {
    let time = 0;
    this.timerInterval = setInterval(() => {
      time += 0.1;
      timer.style.height = `${(time * 100) / (this.time * 60)}%`;
      if (time >= (this.time * 60)) {
        clearInterval(this.timerInterval);
        this.bgm.stop();
        this.endGame();
      }
    }, 100);
  }

  setScore() {
    for (const item of this.selectedList) {
      item.classList.add(CONFIG.CLA_ANI);
      item.addEventListener('animationend', () => item.classList.add(CONFIG.CLA_OFF));
    }
    this.score += Number(this.selectedList.length);
    mainScore.innerText = this.score;
    this.selectedList = [];
  }

  setBgm() {
    this.bgm.isPaused ? this.bgm.play() : this.bgm.pause();
  }

  setGrayMode() {
    if (firstDiv.matches(`.${CONFIG.CLA_IS_GRAY_MODE}`)) {
      firstDiv.classList.remove(CONFIG.CLA_IS_GRAY_MODE);
      graymodeBtn.classList.remove(CONFIG.CLA_OFF);
    } else {
      firstDiv.classList.add(CONFIG.CLA_IS_GRAY_MODE);
      graymodeBtn.classList.add(CONFIG.CLA_OFF);
    }
  }
}

// 실행
document.addEventListener("DOMContentLoaded", () => new SumTenPuzzle());