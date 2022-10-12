import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > table");
const preview = document.querySelector(".next > table");
const scoreBoard = document.querySelector(".score");
const info = document.querySelector(".info");
const gameText = document.querySelector(".game-text");
const startButton = document.querySelector(".game-text > button");
const textArea = document.querySelector(".game-text > span");
const tempLog = document.querySelector("#templog");

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

// VARIABLES
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
let nextItemType;
let block_types = [...BLOCK_BAGS];
let startX;
let startY;
let deltaX;
let deltaY;
let clockTouch = null;

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

// MAIN
// init();
// setInterval(moveBlock, duration, "top", 1);

// FUNCTIONS

function init() {
  gameText.classList.add("hidden");
  info.classList.remove("hidden");
  playground.innerHTML = "";
  tempMovingItem = { ...movingItem };
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  for (let i = 0; i < PREVIEW_ROWS; i++) {
    prependNewLinePreview();
  }
  // renderBlocks();
  const nextIndex = Math.floor(Math.random() * block_types.length);
  nextItemType = block_types[nextIndex];
  block_types.splice(nextIndex, 1);
  generateNewBlock();
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
      scoreBoard.innerText = `${SCORE_TEXT} : ${score}`;
    }
  });

  generateNewBlock();
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  const type = nextItemType;
  const nextIndex = Math.floor(Math.random() * block_types.length);
  nextItemType = block_types[nextIndex];
  movingItem.type = type;
  nextItem.type = nextItemType;
  block_types.splice(nextIndex, 1);
  if (block_types.length === 0) {
    block_types = [...BLOCK_BAGS];
  }
  // console.log(block_types);

  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderPreview();
  renderBlocks();
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
  textArea.innerHTML = `GAME OVER!<br>${SCORE_TEXT} : ${score}`;
  startButton.innerText = "Retry";
  gameText.classList.remove("hidden");
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
