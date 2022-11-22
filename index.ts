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
import { GameState, InfoResponse, MoveResponse, Coord, CoordNode, Board } from './types';
import { AStarFinder } from "astar-typescript";

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

function getClosestFood(gameState: GameState): Coord[] {
  let foodArray: Coord[] = gameState.board.food;
  const head = gameState.you.head;
  let query: Coord[] = [];
  for (let f = 0; f < foodArray.length; f++) {

    // returns closest food (on the specified array) to head
    var closest = foodArray.reduce((prev, curr): Coord => {
      if (Math.abs(curr.x - head.x) < Math.abs(prev.x - head.x) === true &&
        Math.abs(curr.y - head.y) < Math.abs(prev.y - head.y) === true) {
        return curr;
      } else {
        return prev;
      }
      //const xResult = Math.abs(curr.x - head.x) < Math.abs(prev.x - head.x) ? curr : prev;
      //const yResult = Math.abs(curr.y - head.y) < Math.abs(prev.y - head.y) ? curr : prev;
      //return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    });

    // If not already in the query, add it
    if (query.find((coord) => coord.x === closest.x && coord.y === closest.y) === undefined) {
      query.push(closest);
    }

    let a = foodArray.find((food) => { return food.x === closest.x && food.y === closest.y; })
    if (a !== undefined) {
      foodArray.splice(foodArray.indexOf(a), 1)
    }
  }
  return query;
}

function translateCoordToDirection(gameState: GameState, coord: number[]): string {
  const directions = { up: 'up', down: 'down', left: 'left', right: 'right' };
  if (coord[0] < gameState.you.head.x) {
    return directions.left;
  }
  else if (coord[0] > gameState.you.head.x) {
    return directions.right;
  }
  else if (coord[1] > gameState.you.head.y) {
    return directions.up;
  }
  else if (coord[1] < gameState.you.head.y) {
    return directions.down;
  }
  else {
    throw new Error('Error, the snake tried to move in an unorthodox manner.');
  }
}

// Snake metadata
function info(): InfoResponse {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "",       // TODO: Your Battlesnake Username
    color: "#888888", // TODO: Choose color
    head: "default",  // TODO: Choose head
    tail: "default",  // TODO: Choose tail
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

  // A* instance (pathfinder)
  let aStarInstance: AStarFinder;
  let arrayRepresentation: number[][] = createArrayRepresentation(gameState);
  aStarInstance = new AStarFinder({
    grid: {
      matrix: arrayRepresentation
    },
    diagonalAllowed: false
  });

  // Head and neck references
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  // CAUTION I made it so this is 0-indexed (just so it's easier to correlate data structures and stuff)
  const boardWidth = gameState.board.width - 1;
  const boardHeight = gameState.board.height - 1;

  let foodBoard = getClosestFood(gameState);

  let isMoveSafe: { [key: string]: boolean; } = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  // Logic for not turning into itself
  if (myNeck.x < myHead.x) {

    // Neck is left of head, don't move left
    isMoveSafe.left = false;
  }
  else if (myNeck.x > myHead.x) {

    // Neck is right of head, don't move right
    isMoveSafe.right = false;
  }
  else if (myNeck.y < myHead.y) {

    // Neck is below head, don't move down
    isMoveSafe.down = false;
  }
  else if (myNeck.y > myHead.y) {

    // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // Logic that keeps it from moving out of bounds
  switch (myHead.x) {

    // If x is 0, head is on the left side of the board
    case 0: {
      isMoveSafe.left = false;
      break;
    }

    // If x is 10, head is on the r side of the board
    case boardWidth: {
      isMoveSafe.right = false;
      break;
    }
  }
  switch (myHead.y) {

    // If y is 0, head is on the bottom of the board
    case 0: {
      isMoveSafe.down = false;
      break;
    }

    // If y is 10, head is on the top of the board
    case boardHeight: {
      isMoveSafe.up = false;
      break;
    }
  }

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  // the snake currently just follows the nearest food source, it's NOT using safeMoves implementation (but it's flexible, so we should be able to adapt just fine)
  let astartranslatedpath: string[] = [];
  let help = aStarInstance.findPath(gameState.you.head, foodBoard[0]);
  help.shift();
  help.map((pathfindingCoord) => {
    astartranslatedpath.push(translateCoordToDirection(gameState, pathfindingCoord))
  });
  return { move: astartranslatedpath[0] };
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