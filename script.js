document.addEventListener("DOMContentLoaded", () => {
  const get = (target, parent = document) => parent.querySelector(target);
  const gets = (target, parent = document) => [...parent.querySelectorAll(target)];

  const CLA_ON = 'on';
  const CLA_OFF = 'off';
  const CLA_ANI = 'ani';
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
  const mainScore = get('.js-main .score');
  const outroScore = get('.js-outro .score');

  const bgm = new Audio('./asset/mp3/bgm.mp3');
  bgm.loop = true;

  let timerInterval;
  let selectedList = [];
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
      const calcTop = Math.min(event.clientY, main.startDrag.y);
      const calcLeft = Math.min(event.clientX, main.startDrag.x);
      const calcRight = Math.max(event.clientX, main.startDrag.x);
      const calcBottom = Math.max(event.clientY, main.startDrag.y);
      guideBox.style.top = `${calcTop}px`;
      guideBox.style.left = `${calcLeft}px`;
      guideBox.style.width = `${calcRight - calcLeft}px`;
      guideBox.style.height = `${calcBottom - calcTop}px`;

      const items = gets('.item:not(.off)', itemBox);
      const selectedItems = items.filter((item) => {
        const itemRect = item.getBoundingClientRect();
        const guideBoxRect = guideBox.getBoundingClientRect();

        return !(
          itemRect.right < guideBoxRect.left ||
          itemRect.left > guideBoxRect.right ||
          itemRect.bottom < guideBoxRect.top ||
          itemRect.top > guideBoxRect.bottom
        );
        }
      );

      items.forEach((item) => item.classList.remove(CLA_ON));
      selectedItems.forEach((item) => item.classList.add(CLA_ON));

      const sum = selectedItems.reduce((acc, item) => {
        const num = parseInt(item.innerText);
        return acc + num;
      }, 0);

      if (sum === 10) {
        guideBox.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
      } else {
        guideBox.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
      }

      selectedList = selectedItems;
    };

    const up = () => {
      main.removeEventListener('mousemove', move);
      main.removeEventListener('mouseup', up);

      const items = gets('.item', itemBox);
      items.forEach((item) => {
        item.classList.remove(CLA_ON);
      });

      if (selectedList.length > 0) {
        const sum = selectedList.reduce((acc, item) => {
          const num = parseInt(item.innerText);
          return acc + num;
        }, 0);

        if (sum === 10) {
          selectedList.forEach(async (item) => {
            item.classList.add(CLA_ANI);
            await new Promise((resolve) => {
              item.addEventListener('animationend', () => {
                item.classList.add(CLA_OFF);
                resolve();
              }, { once: true });
            });
          });

          const length = selectedList.length;
          mainScore.innerText = parseInt(mainScore.innerText) + length;
          selectedList = [];
        } 
      }

      guideBox.style.width = `0px`
      guideBox.style.height = `0px`;
      guideBox.style.top = `0px`;
      guideBox.style.left = `0px`;
    };

    main.addEventListener('mousemove', move); 
    main.addEventListener('mouseup', up);
    main.addEventListener('mouseleave', up);
  });

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function startGame() {
    createItem();
    setTimer();
  }

  function endGame() {
    outro.classList.add(CLA_ON);
    firstDiv.classList.remove(CLA_IS_PLAYING);
    firstDiv.classList.add(CLA_IS_END);
    outroScore.innerText = mainScore.innerText;
  }

  function createItem() {
    const numbers = Array.from({ length: 170 }, (_, i) => (i % 9) + 1);
    
    shuffle(numbers);
    
    numbers.forEach((num) => {
      const li = document.createElement('li');
      li.classList.add('item');
      itemBox.appendChild(li);
      li.innerText = num;
    });    
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
    mainScore.innerText = 0;
    selectedList = [];
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