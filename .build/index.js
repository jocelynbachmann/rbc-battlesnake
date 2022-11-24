var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var import_server = __toModule(require("./server"));
var import_astar_typescript = __toModule(require("astar-typescript"));
function createArrayRepresentation(gameState) {
  let array = [];
  const width = gameState.board.width - 1;
  const height = gameState.board.height - 1;
  for (let y = height; y >= 0; y--) {
    let row = [];
    for (let x = 0; x <= width; x++) {
      let boardNode;
      for (let snake of gameState.board.snakes) {
        for (let snakePart of snake.body) {
          if (snakePart.x === x && snakePart.y === y || snake.head.x === x && snake.head.y === y) {
            boardNode = 1;
            break;
          } else {
            boardNode = 0;
          }
        }
        break;
      }
      row.push(boardNode);
    }
    array.push(row);
  }
  return array;
}
function getClosestFood(gameState) {
  let foodArray = gameState.board.food;
  const head = gameState.you.head;
  let query = [];
  for (let f = 0; f < foodArray.length; f++) {
    var closest = foodArray.reduce((prev, curr) => {
      if (Math.abs(curr.x - head.x) < Math.abs(prev.x - head.x) === true && Math.abs(curr.y - head.y) < Math.abs(prev.y - head.y) === true) {
        return curr;
      } else {
        return prev;
      }
    });
    query.push(closest);
    let a = foodArray.find((food) => {
      return food.x === closest.x && food.y === closest.y;
    });
    foodArray.splice(foodArray.indexOf(a), 1);
  }
  console.log("--HEAD LOCATION--");
  console.log(`x: ${gameState.you.head.x}, y: ${gameState.you.head.y}`);
  console.log("--FOOD IN BOARD--");
  console.log(gameState.board.food);
  console.log("--FOOD ARRAY LENGTH--");
  console.log(gameState.board.food.length);
  console.log("--QUERY--");
  console.log(query);
  return query;
}
function translateCoordsToDirections(gameState, coordArray) {
  const directions = { up: "up", down: "down", left: "left", right: "right" };
  let translatedArray = [];
  let xRef = gameState.you.head.x;
  let yRef = gameState.you.head.y;
  const wallDetection = gameState.you.head.x >= 0 && gameState.you.head.x < gameState.board.width - 1 && gameState.you.head.y >= 0 && gameState.you.head.y < gameState.board.height - 1;
  console.log("b4 for loop t");
  for (let coordIndex = 0; coordIndex < coordArray.length; coordIndex++) {
    let coord = coordArray[coordIndex];
    console.log(translatedArray.length);
    if (coord[0] < xRef && wallDetection) {
      console.log("left");
      translatedArray.push(directions.left);
    } else if (coord[0] > xRef && wallDetection) {
      console.log("right");
      translatedArray.push(directions.right);
    } else if (coord[1] > yRef && wallDetection) {
      console.log("up");
      translatedArray.push(directions.up);
    } else if (coord[1] < yRef && wallDetection) {
      console.log("down");
      translatedArray.push(directions.down);
    } else {
    }
    xRef = coord[0];
    yRef = coord[1];
  }
  console.log("--- T ARRAYYYYYYY INSIDE--");
  console.log(translatedArray);
  return translatedArray;
}
function createTranslatedArray(gameState, aStarInstance) {
  const foodBoard = getClosestFood(gameState);
  console.log("--CLOSEST F--");
  console.log(foodBoard);
  let astartranslatedpath = [];
  var startTime = performance.now();
  let help = aStarInstance.findPath(gameState.you.head, foodBoard[0]);
  var endTime = performance.now();
  console.log(`Call to HELP F took ${endTime - startTime} milliseconds`);
  console.log("--HELP F--");
  console.log(help);
  return translateCoordsToDirections(gameState, help);
}
function info() {
  console.log("INFO");
  return {
    apiversion: "1",
    author: "Caraxes",
    color: "#800000",
    head: "evil",
    tail: "hook"
  };
}
function start(gameState) {
  console.log("GAME START");
}
function end(gameState) {
  console.log("GAME OVER\n");
}
function move(gameState) {
  let aStarInstance;
  let arrayRepresentation = createArrayRepresentation(gameState);
  aStarInstance = new import_astar_typescript.AStarFinder({
    grid: {
      matrix: arrayRepresentation
    },
    diagonalAllowed: false,
    includeStartNode: false,
    weight: 0
  });
  let astartranslatedpath = createTranslatedArray(gameState, aStarInstance);
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];
  const boardWidth = gameState.board.width - 1;
  const boardHeight = gameState.board.height - 1;
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true
  };
  if (myNeck.x < myHead.x) {
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    isMoveSafe.up = false;
  }
  if (isMoveSafe.left || isMoveSafe.right) {
    switch (myHead.x) {
      case 0: {
        isMoveSafe.left = false;
        break;
      }
      case boardWidth: {
        isMoveSafe.right = false;
        break;
      }
    }
  }
  if (isMoveSafe.down || isMoveSafe.up) {
    switch (myHead.y) {
      case 0: {
        isMoveSafe.down = false;
        break;
      }
      case boardHeight: {
        isMoveSafe.up = false;
        break;
      }
    }
  }
  const containsCoordExcludingTail = (snake, coord) => {
    const tail = snake[snake.length - 1];
    for (var c of snake) {
      if (c.x === coord.x && c.y === coord.y && (c.x !== tail.x || c.y !== tail.y))
        return true;
    }
    return false;
  };
  let myBody = gameState.you.body;
  const leftMove = { x: myHead.x - 1, y: myHead.y };
  const rightMove = { x: myHead.x + 1, y: myHead.y };
  const upMove = { x: myHead.x, y: myHead.y + 1 };
  const downMove = { x: myHead.x, y: myHead.y - 1 };
  if (isMoveSafe.down && containsCoordExcludingTail(myBody, downMove))
    isMoveSafe.down = false;
  if (isMoveSafe.up && containsCoordExcludingTail(myBody, upMove))
    isMoveSafe.up = false;
  if (isMoveSafe.left && containsCoordExcludingTail(myBody, leftMove))
    isMoveSafe.left = false;
  if (isMoveSafe.right && containsCoordExcludingTail(myBody, rightMove))
    isMoveSafe.right = false;
  const opponents = gameState.board.snakes;
  opponents.forEach((opponent) => {
    const opponentBody = opponent.body;
    if (isMoveSafe.down && containsCoordExcludingTail(opponentBody, downMove))
      isMoveSafe.down = false;
    if (isMoveSafe.up && containsCoordExcludingTail(opponentBody, upMove))
      isMoveSafe.up = false;
    if (isMoveSafe.left && containsCoordExcludingTail(opponentBody, leftMove))
      isMoveSafe.left = false;
    if (isMoveSafe.right && containsCoordExcludingTail(opponentBody, rightMove))
      isMoveSafe.right = false;
  });
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
  console.log("-- T PATH --");
  console.log(astartranslatedpath);
  console.log("TURN " + gameState.turn + " ++++++++++++++++++++++++++++++");
  let movevar = astartranslatedpath[0];
  console.log("MOVEVAR");
  console.log(movevar);
  return { move: movevar };
}
(0, import_server.default)({
  info,
  start,
  move,
  end
});
//# sourceMappingURL=index.js.map
