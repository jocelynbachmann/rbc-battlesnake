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
    if (query.find((coord) => coord.x === closest.x && coord.y === closest.y) === void 0) {
      query.push(closest);
    }
    let a = foodArray.find((food) => {
      return food.x === closest.x && food.y === closest.y;
    });
    if (a !== void 0) {
      foodArray.splice(foodArray.indexOf(a), 1);
    }
  }
  return query;
}
function translateCoordToDirection(gameState, coord) {
  const directions = { up: "up", down: "down", left: "left", right: "right" };
  if (coord[0] < gameState.you.head.x) {
    return directions.left;
  } else if (coord[0] > gameState.you.head.x) {
    return directions.right;
  } else if (coord[1] > gameState.you.head.y) {
    return directions.up;
  } else if (coord[1] < gameState.you.head.y) {
    return directions.down;
  } else {
    throw new Error("Error, the snake tried to move in an unorthodox manner.");
  }
}
function info() {
  console.log("INFO");
  return {
    apiversion: "1",
    author: "",
    color: "#888888",
    head: "default",
    tail: "default"
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
    diagonalAllowed: false
  });
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];
  const boardWidth = gameState.board.width - 1;
  const boardHeight = gameState.board.height - 1;
  let foodBoard = getClosestFood(gameState);
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
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
  let astartranslatedpath = [];
  let help = aStarInstance.findPath(gameState.you.head, foodBoard[0]);
  help.shift();
  help.map((pathfindingCoord) => {
    astartranslatedpath.push(translateCoordToDirection(gameState, pathfindingCoord));
  });
  return { move: astartranslatedpath[0] };
}
(0, import_server.default)({
  info,
  start,
  move,
  end
});
//# sourceMappingURL=index.js.map
