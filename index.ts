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

import runServer from './server';
import { GameState, InfoResponse, MoveResponse, Coord } from './types';

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data

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

  // Logic for not turning into itself
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

  // Logic that keeps it from moving out of bounds
  switch (myHead.x) {

    // If x is 0, head is on the left side of the board
    case 0: {
      isMoveSafe.left = false;
      break;
    }

    // If x is 10, head is on the r side of the board
    case boardWidth - 1: {
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
    case boardHeight - 1: {
      isMoveSafe.up = false;
      break;
    }
  }

  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
  // let myBody = gameState.you.body;

  // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
  // opponents = gameState.board.snakes;

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
  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end
});
