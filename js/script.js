import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > table");
const preview = document.querySelector(".next > table");
const score_Board = document.querySelector(".score");
const hiscore_Local_Board = document.querySelector(".localhiscore");
const info = document.querySelector(".info");
const gameText = document.querySelector(".game-text");
const startButton = document.querySelector(".game-text > button");
const textArea = document.querySelector(".game-text > span");
const holdView = document.querySelector(".hold > table");
const holdArea = document.querySelector(".hold");

// CONSTATNS
const GAME_ROWS = 20;
const GAME_COLS = 10;
const PREVIEW_ROWS = 4;
const PREVIEW_COLS = 4;
const SWIPE_MIN = 40;
const SWIPE_IGNORE = 10;
const DTOUCH_DURATION = 200;
const BLOCK_BAGS = ["I", "O", "T", "S", "Z", "J", "L"];
const SCORE_TEXT = "점수";
const HISCORE_LOCAL_TEXT = "여기서 최고 점수";
const HISCORE_GLOBAL_TEXT = "서버 최고 점수";
const KEY_HISCORE_LOCAL = "HIGHSCORE_LOCAL";
const KEY_HISCORE_GLOBAL = "HIGHSCORE_GLOBAL";

// VARIABLES
let score = 0;
let hiscore_local = 0;
let hiscore_global = 0;
let duration = 5000;
let downInterval;
let tempMovingItem;
let nextItemType;
let block_types = [...BLOCK_BAGS];
let startX;
let startY;
let deltaX;
let deltaY;
let clockTouch = null;
let holdCount = 0;

const movingItem = {
  type: "L",
  direction: 0,
  top: 0,
  left: 3,
};
const nextItem = {
  type: "L",
  direction: 0,
  top: 0,
  left: 0,
};
const holdItem = {
  type: undefined,
  direction: 0,
  top: 0,
  left: 0,
};

// MAIN
// init();
// setInterval(moveBlock, duration, "top", 1);

// FUNCTIONS

function init() {
  gameText.classList.add("hidden");
  info.classList.remove("hidden");
  playground.innerHTML = "";
  preview.innerHTML = "";
  holdView.innerHTML = "";
  tempMovingItem = { ...movingItem };
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  for (let i = 0; i < PREVIEW_ROWS; i++) {
    prependNewLinePreview();
    prependNewLineHold();
  }
  // renderBlocks();
  const nextIndex = Math.floor(Math.random() * block_types.length);
  nextItemType = block_types[nextIndex];
  block_types.splice(nextIndex, 1);
  holdItem.type = undefined;
  generateNewBlock();
  if (localStorage.getItem(KEY_HISCORE_LOCAL) !== null) {
    hiscore_local = localStorage.getItem(KEY_HISCORE_LOCAL);
    hiscore_Local_Board.innerText = `${HISCORE_LOCAL_TEXT} : ${hiscore_local}`;
  }
}

function prependNewLine() {
  const tr = document.createElement("tr");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("td");
    tr.prepend(matrix);
  }
  playground.prepend(tr);
}

function prependNewLinePreview() {
  const tr = document.createElement("tr");
  for (let j = 0; j < PREVIEW_COLS; j++) {
    const matrix = document.createElement("td");
    tr.prepend(matrix);
  }
  preview.prepend(tr);
}
function prependNewLineHold() {
  const tr = document.createElement("tr");
  for (let j = 0; j < PREVIEW_COLS; j++) {
    const matrix = document.createElement("td");
    tr.prepend(matrix);
  }
  holdView.prepend(tr);
}

function renderPreview() {
  const { type, direction, top, left } = nextItem;
  const previewBlocks = document.querySelectorAll(".preview");
  previewBlocks.forEach((item) => {
    // console.log(item);
    item.className = "";
  });

  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = preview.childNodes[y]
      ? preview.childNodes[y].childNodes[x]
      : null;
    if (isEmpty(target)) {
      target.classList.add(type, "preview");
    } else {
    }
  });
}

function renderHold() {
  const { type, direction, top, left } = holdItem;
  const holdBlocks = document.querySelectorAll(".held");
  holdBlocks.forEach((item) => {
    // console.log(item);
    item.className = "";
  });
  if (type !== undefined) {
    BLOCKS[type][direction].some((block) => {
      const x = block[0] + left;
      const y = block[1] + top;
      const target = holdView.childNodes[y]
        ? holdView.childNodes[y].childNodes[x]
        : null;
      if (isEmpty(target)) {
        target.classList.add(type, "held");
      } else {
      }
    });
  }
}

function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;
  // console.log("type : ",type);
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((item) => {
    // console.log(item);
    item.classList.remove(type, "moving");
  });

  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[x]
      : null;
    if (isEmpty(target)) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameOverText();
      }
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}

function seizeBlock() {
  holdCount = 0;
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((item) => {
    // console.log(item);
    item.classList.remove("moving");
    item.classList.add("seized");
  });
  checkMatch();
}

function checkMatch() {
  const cNodes = playground.childNodes;
  cNodes.forEach((row) => {
    let matched = true;
    row.childNodes.forEach((td) => {
      // console.log(td.className);
      // console.log(matched);
      if (!td.classList.contains("seized")) {
        matched = false;
      }
    });
    if (matched && row.childNodes.length !== 0) {
      // console.log(matched);
      row.remove();
      prependNewLine();
      score++;
      score_Board.innerText = `${SCORE_TEXT} : ${score}`;
    }
  });

  generateNewBlock();
}

function generateNewBlock(newType) {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  if (newType !== undefined) {
    const type = newType;
  } else {
    const type = nextItemType;
    const nextIndex = Math.floor(Math.random() * block_types.length);
    nextItemType = block_types[nextIndex];
    movingItem.type = type;
    nextItem.type = nextItemType;
    block_types.splice(nextIndex, 1);
    if (block_types.length === 0) {
      block_types = [...BLOCK_BAGS];
    }
  }
  // console.log(block_types);

  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderPreview();
  renderHold();
  renderBlocks();
}

function hold() {
  if (holdCount === 0) {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
      moveBlock("top", 1);
    }, duration);
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach((item) => {
      // console.log(item);
      item.classList.remove(type, "moving");
    });

    const newType = holdItem.type;
    holdItem.type = movingItem.type;
    if (newType === undefined) {
      generateNewBlock();
    } else {
      movingItem.type = newType;
      // console.log(newType);
      generateNewBlock(newType);
    }
    holdCount++;
  }
}

function isEmpty(target) {
  let result;
  if (!target || target.classList.contains("seized")) {
    result = false;
  } else {
    result = true;
  }
  return result;
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

function changeDirection() {
  let direction = tempMovingItem.direction;

  direction += 1;
  direction %= 4;

  tempMovingItem.direction = direction;
  renderBlocks();
}

function hardDrop() {
  clearInterval(downInterval);

  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

function showGameOverText() {
  textArea.innerHTML = `GAME OVER!<br>${SCORE_TEXT} : ${score}<br>${HISCORE_LOCAL_TEXT} : ${hiscore_local}`;
  startButton.innerText = "Retry";
  gameText.classList.remove("hidden");
  if (score > parseInt(hiscore_local)) {
    textArea.innerHTML = `GAME OVER!<br>최고 점수!<br>${SCORE_TEXT} : ${score}<br>${HISCORE_LOCAL_TEXT} : ${hiscore_local}`;
    localStorage.setItem(KEY_HISCORE_LOCAL, score);
  }
}

//event handling
document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowDown":
      // console.log("down");
      moveBlock("top", 1);
      break;

    case "ArrowUp":
      // console.log("up");
      changeDirection();
      break;

    case "ArrowLeft":
      // console.log("left");
      moveBlock("left", -1);
      break;

    case "ArrowRight":
      // console.log("right");
      moveBlock("left", 1);
      break;

    case "Space":
      // console.log("space");
      hardDrop();
      break;

    case "ShiftLeft":
      hold();
      break;

    default:
      break;
  }
  // console.log(e);
});

const handlerTouch = {
  start: (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
    // console.log("start");
    // console.log(event);
    const now = new Date().getTime();
    if (clockTouch === null) {
      clockTouch = now;
    } else {
      const deltaT = now - clockTouch;
      if (deltaT < DTOUCH_DURATION) {
        hardDrop();
      }
      clockTouch = now;
    }
  },
  end: (event) => {
    // console.log("end");
    // console.log(event);
  },
  move: (event) => {
    deltaX = event.changedTouches[0].clientX - startX;
    deltaY = event.changedTouches[0].clientY - startY;

    // console.log(deltaX,deltaY);
    if (Math.abs(deltaX) > SWIPE_MIN) {
      if (deltaX > 0) {
        moveBlock("left", 1);
      } else {
        moveBlock("left", -1);
      }

      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    }
    if (Math.abs(deltaY) > SWIPE_MIN) {
      if (deltaY > 0) {
        moveBlock("top", 1);
      } else {
        changeDirection();
      }

      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    }
    // console.log("moving");
    // console.dir(event);
  },
};
document.addEventListener("touchstart", handlerTouch.start);
document.addEventListener("touchend", handlerTouch.end);
document.addEventListener("touchmove", handlerTouch.move);
startButton.addEventListener("click", init);
holdArea.addEventListener("click", hold);
