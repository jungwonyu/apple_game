document.addEventListener("DOMContentLoaded", () => {
  const get = (target, parent = document) => parent.querySelector(target);
  const gets = (target, parent = document) => [...parent.querySelectorAll(target)];

  const CLA_ON = 'on';
  const CLA_OFF = 'off';
  const CLA_IS_DARKMODE = 'is_darkmode';
  const CLA_IS_PLAYING = 'is_playing';
  const CLA_IS_END = 'is_end';

  const firstDiv = get('div');
  const intro = get('.js-intro');

  const main = get('.js-main');
  const itemBox = get('.js-itemBox');
  const timer = get('.js-timer');
  const guideBox = get('.js-guideBox');
  const outro = get('.js-outro');

  const startBtn = get('.js-startBtn');
  const resetBtns = gets('.js-resetBtn');
  const bgmBtn = get('.js-bgmBtn');
  const graymodeBtn = get('.js-graymodeBtn'); 

  const bgm = new Audio('./asset/mp3/bgm.mp3');
  bgm.loop = true;

  let timerInterval;
  let dragging = false;
  bgm.stop = () => {
    bgm.pause();
    bgm.currentTime = 0;
  }

  // 버튼
  startBtn.addEventListener('click', start);
  for (const resetBtn of resetBtns) resetBtn.addEventListener('click', reset);
  bgmBtn.addEventListener('click', setBgm);
  graymodeBtn.addEventListener('click', setDarkmode);

  // 사과
  main.addEventListener('mousedown', (event) => {
    main.startDrag = {
      x: event.x,
      y: event.y,
    }

    guideBox.style.top = `${main.startDrag.y}px`;
    guideBox.style.left = `${main.startDrag.x}px`;

    const move = (event) => {
      const calcWidth = Math.abs(event.clientX - main.startDrag.x);
      const calcHeight = Math.abs(event.clientY - main.startDrag.y);
      // const calcTop = 
      // const calcLeft = 

      guideBox.style.width = `${calcWidth}px`
      guideBox.style.height = `${calcHeight}px`;
      // guideBox.style.top = `${calcTop}px`
      // guideBox.style.left = `${calcLeft}px`;
    };

    const up = () => {
      main.removeEventListener('mousemove', move);
      main.removeEventListener('mouseup', up);

      guideBox.style.width = `0px`
      guideBox.style.height = `0px`;
      guideBox.style.top = `0px`;
      guideBox.style.left = `0px`;
    };

    main.addEventListener('mousemove', move); 
    main.addEventListener('mouseup', up);
    main.addEventListener('mouseleave', up);
  });

  function startGame() {
    createItem();
    setTimer();
  }

  function endGame() {
    outro.classList.add(CLA_ON);
    firstDiv.classList.remove(CLA_IS_PLAYING);
    firstDiv.classList.add(CLA_IS_END);
  }

  function createItem() {
    for (let i = 0; i < 170; i++) {
      const li = document.createElement('li');
      li.classList.add('item');
      itemBox.appendChild(li);
      const num = Math.floor(Math.random() * 9) + 1;
      li.innerText = num;
    }
  }

  function setTimer() {
    let time = 0;
    timerInterval = setInterval(() => {
      time += 0.1; // 0.1초씩 증가
      timer.style.height = `${(time) * 100 / 120}%`;
      if (time >= 120) {
        clearInterval(timerInterval);
        bgm.stop();
        endGame();
      }
    }, 100); // 0.1초마다 interval 설정
  }

  function start() {
    firstDiv.classList.add(CLA_IS_PLAYING);
    intro.classList.remove(CLA_ON);
    main.classList.add(CLA_ON);
    bgm.play();
    startGame();
  }

  function reset() {
    clearInterval(timerInterval);
    timer.style.height = `0%`;
    bgm.stop();
    firstDiv.classList.remove(CLA_IS_DARKMODE, CLA_IS_END);
    bgmBtn.classList.remove(CLA_OFF);
    graymodeBtn.classList.remove(CLA_OFF);
    main.classList.remove(CLA_ON);
    outro.classList.remove(CLA_ON);
    intro.classList.add(CLA_ON);
    gets('li').forEach((el) => el.remove());
  }

  function setBgm() {
    if (bgm.paused) {
      bgm.play();
      bgmBtn.classList.remove(CLA_OFF);
    } else {
      bgm.pause();
      bgmBtn.classList.add(CLA_OFF);
    }
  }

  function setDarkmode() {
    if (firstDiv.matches(`.${CLA_IS_DARKMODE}`)) {
      firstDiv.classList.remove(CLA_IS_DARKMODE);
      graymodeBtn.classList.remove(CLA_OFF);
    } else {
      firstDiv.classList.add(CLA_IS_DARKMODE);
      graymodeBtn.classList.add(CLA_OFF);
    }
  }
});
