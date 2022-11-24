// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data

import runServer from './server';
import { GameState, InfoResponse, MoveResponse, Coord, CoordNode, Board, Battlesnake } from './types';
import { AStarFinder } from "astar-typescript";

// Creates a binary array representation of the board
function createArrayRepresentation(gameState: GameState): number[][] {
  let array: number[][] = [];
  const width = gameState.board.width - 1; //10
  const height = gameState.board.height - 1; //10
  for (let y = height; y >= 0; y--) {
    let row: number[] = [];
    for (let x = 0; x <= width; x++) {
      let boardNode;
      for (let snake of gameState.board.snakes) {
        for (let snakePart of snake.body) {
          if (snakePart.x === x && snakePart.y === y ||
            snake.head.x === x && snake.head.y === y) {
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

// Returns a query with the closest food to the player's head (ordered from closest to furthest)
function getClosestFood(gameState: GameState): Coord[] {
  let foodArray: Coord[] = gameState.board.food;
  const head = gameState.you.head;
  let query: Coord[] = [];
  for (let f = 0; f < foodArray.length; f++) {
    var closest = foodArray.reduce((prev, curr): Coord => {
      if (Math.abs(curr.x - head.x) < Math.abs(prev.x - head.x) === true &&
        Math.abs(curr.y - head.y) < Math.abs(prev.y - head.y) === true) {
        return curr;
      } else {
        return prev;
      }
    });
    query.push(closest);
    let a = foodArray.find((food) => { return food.x === closest.x && food.y === closest.y; })
    foodArray.splice(foodArray.indexOf(a), 1)
  }
  return query;
}

// Translates an array of coordinates to direction strings (used for pathfinding)
function translateCoordsToDirections(gameState: GameState, coordArray: number[][]): string[] {
  const directions = { up: 'up', down: 'down', left: 'left', right: 'right' };
  let translatedArray: string[] = [];
  let xRef = gameState.you.head.x;
  let yRef = gameState.you.head.y;

  const wallDetection = gameState.you.head.x >= 0 &&
    gameState.you.head.x < gameState.board.width - 1 &&
    gameState.you.head.y >= 0 &&
    gameState.you.head.y < gameState.board.height - 1;

  for (let coordIndex = 0; coordIndex < coordArray.length; coordIndex++) {
    let coord = coordArray[coordIndex];
    console.log(translatedArray.length)

    if (coord[0] < xRef && wallDetection) {
      console.log("left")
      translatedArray.push(directions.left);
    }
    else if (coord[0] > xRef && wallDetection) {
      console.log("right")
      translatedArray.push(directions.right);
    }
    else if (coord[1] > yRef && wallDetection) {
      console.log("up")
      translatedArray.push(directions.up);
    }
    else if (coord[1] < yRef && wallDetection) {
      console.log("down")
      translatedArray.push(directions.down);
    }

    xRef = coord[0];
    yRef = coord[1];
  }

  return translatedArray;
}

// A* function for translating pathfinding
function createTranslatedArray(gameState: GameState, aStarInstance: AStarFinder): string[] {
  const foodBoard = getClosestFood(gameState);

  let astartranslatedpath: string[] = [];

  //var startTime = performance.now()
  let help = aStarInstance.findPath(gameState.you.head, foodBoard[0]);
  //var endTime = performance.now()
  //console.log(`Call to HELP F took ${endTime - startTime} milliseconds`)

  return translateCoordsToDirections(gameState, help);
}

// Snake metadata
function info(): InfoResponse {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "Caraxes",
    color: "#800000",
    head: "evil",
    tail: "hook",
  };
}

// start is called when your Battlesnake begins a game
function start(gameState: GameState): void {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState: GameState): void {
  console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState: GameState): MoveResponse {

  /* A* code
   * 
   * A* instance (pathfinder)
   * let aStarInstance: AStarFinder;
   * let arrayRepresentation: number[][] = createArrayRepresentation(gameState);
   * aStarInstance = new AStarFinder({
   *  grid: {
   *    matrix: arrayRepresentation
   *  },
   *  diagonalAllowed: false,
   *  includeStartNode: false,
   *  weight: 0,
   *});
   *  let astartranslatedpath = createTranslatedArray(gameState, aStarInstance)
   */

  // Head and neck references
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  // CAUTION I made it so this is 0-indexed (just so it's easier to correlate data structures and stuff)
  const boardWidth = gameState.board.width - 1;
  const boardHeight = gameState.board.height - 1;

  let isMoveSafe: { [key: string]: boolean; } = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  // DON'T GO BACKWARDS
  if (myNeck.x < myHead.x) {
    // Neck is left of head, don't move left
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    // Neck is right of head, don't move right
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    // Neck is below head, don't move down
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // DON'T MOVE OUT OF BOUNDS
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

  // DON'T COLLIDE WITH BODY
  const containsCoordExcludingTail = (snake: Coord[], coord: Coord) => {
    const tail = snake[snake.length - 1];
    for (var c of snake) {
      if (c.x === coord.x && c.y === coord.y && (c.x !== tail.x || c.y !== tail.y)) return true;
    }
    return false;
  }

  let myBody = gameState.you.body;
  const leftMove = { x: myHead.x - 1, y: myHead.y };
  const rightMove = { x: myHead.x + 1, y: myHead.y };
  const upMove = { x: myHead.x, y: myHead.y + 1 };
  const downMove = { x: myHead.x, y: myHead.y - 1 };

  if (isMoveSafe.down && containsCoordExcludingTail(myBody, downMove)) isMoveSafe.down = false;
  if (isMoveSafe.up && containsCoordExcludingTail(myBody, upMove)) isMoveSafe.up = false;
  if (isMoveSafe.left && containsCoordExcludingTail(myBody, leftMove)) isMoveSafe.left = false;
  if (isMoveSafe.right && containsCoordExcludingTail(myBody, rightMove)) isMoveSafe.right = false;


  // DON'T COLLIDE WITH OTHER SNAKES
  const opponents = gameState.board.snakes;
  opponents.forEach((opponent: Battlesnake) => {
    const opponentBody = opponent.body;
    if (isMoveSafe.down && containsCoordExcludingTail(opponentBody, downMove)) isMoveSafe.down = false;
    if (isMoveSafe.up && containsCoordExcludingTail(opponentBody, upMove)) isMoveSafe.up = false;
    if (isMoveSafe.left && containsCoordExcludingTail(opponentBody, leftMove)) isMoveSafe.left = false;
    if (isMoveSafe.right && containsCoordExcludingTail(opponentBody, rightMove)) isMoveSafe.right = false;
  })

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end
});

// TODO: Step 2 - Prevent your Battlesnake from colliding with itself
// let myBody = gameState.you.body;

// TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
// opponents = gameState.board.snakes;

// TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
// food = gameState.board.food;