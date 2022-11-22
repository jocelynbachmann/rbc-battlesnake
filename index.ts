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

import { forEachChild, getTypeParameterOwner, isConditionalExpression } from 'typescript';
import runServer from './server';
import { GameState, InfoResponse, MoveResponse, Coord, Battlesnake } from './types';

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data

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

let previousGameState: GameState;

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState: GameState): MoveResponse {

  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  let boardWidth = gameState.board.width;
  let boardHeight = gameState.board.height;

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
      case boardWidth - 1: {
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
      case boardHeight - 1: {
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
  const leftMove = { x: myHead.x - 1, y: myHead.y};
  const rightMove = { x: myHead.x + 1, y: myHead.y};
  const upMove = { x: myHead.x, y: myHead.y + 1};
  const downMove = { x: myHead.x, y: myHead.y - 1};

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
  console.log(safeMoves)
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
  // food = gameState.board.food;

  console.log(`MOVE ${gameState.turn}: ${nextMove}`)

  previousGameState = gameState;
  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end
});
