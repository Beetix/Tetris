"use strict";

// --- Board configuration ---
const COLS = 10;
const ROWS = 20;
const CELL = 30; // pixels

// Canvas setup
const canvas = document.getElementById("board");
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
const ctx = canvas.getContext("2d");

// Board data model: ROWS x COLS grid, 0 = empty, otherwise a color string
const board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

// --- Tetromino definitions ---
// Each shape is a square matrix used for rotation; 1 = filled.
const TETROMINOES = {
  I: { color: "#31c7ef", matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { color: "#f7d308", matrix: [[1,1],[1,1]] },
  T: { color: "#ad4d9c", matrix: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { color: "#42b642", matrix: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { color: "#ef2029", matrix: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { color: "#5a65ad", matrix: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { color: "#ef7921", matrix: [[0,0,1],[1,1,1],[0,0,0]] },
};

// --- 7-bag randomizer ---
let bag = [];

function refillBag() {
  bag = Object.keys(TETROMINOES);
  // Fisher-Yates shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

function nextType() {
  if (bag.length === 0) refillBag();
  return bag.pop();
}

// --- Active piece ---
let piece = null;

function spawn() {
  const type = nextType();
  const def = TETROMINOES[type];
  // Deep copy the matrix so rotations don't mutate the definition
  const matrix = def.matrix.map((row) => row.slice());
  piece = {
    type,
    color: def.color,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0,
  };
}

// --- Rendering ---
function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
}

function drawGrid() {
  ctx.strokeStyle = "#1b1d28";
  ctx.lineWidth = 1;
  for (let x = 1; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, canvas.height);
    ctx.stroke();
  }
  for (let y = 1; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(canvas.width, y * CELL);
    ctx.stroke();
  }
}

function render() {
  // Background
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  // Settled cells
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawCell(x, y, board[y][x]);
      }
    }
  }

  // Active piece
  if (piece) {
    for (let py = 0; py < piece.matrix.length; py++) {
      for (let px = 0; px < piece.matrix[py].length; px++) {
        if (piece.matrix[py][px]) {
          drawCell(piece.x + px, piece.y + py, piece.color);
        }
      }
    }
  }
}

// --- Game loop ---
function loop() {
  render();
  requestAnimationFrame(loop);
}

spawn();
requestAnimationFrame(loop);
