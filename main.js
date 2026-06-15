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

// --- Collision / validity ---
// Returns true if `matrix` placed at (offX, offY) fits within the board
// and does not overlap any settled cell.
function isValid(matrix, offX, offY) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (!matrix[y][x]) continue;
      const bx = offX + x;
      const by = offY + y;
      if (bx < 0 || bx >= COLS || by >= ROWS) return false;
      if (by >= 0 && board[by][bx]) return false;
    }
  }
  return true;
}

// Rotate a square matrix clockwise (transpose + reverse each row).
function rotateCW(matrix) {
  const size = matrix.length;
  const result = matrix.map((row) => row.slice());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      result[x][size - 1 - y] = matrix[y][x];
    }
  }
  return result;
}

// --- Controls ---
function move(dx) {
  if (isValid(piece.matrix, piece.x + dx, piece.y)) {
    piece.x += dx;
  }
}

// Remove all completed rows and shift everything above down.
function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(new Array(COLS).fill(0));
      y++; // re-check the same row index after the shift
    }
  }
}

// Write the active piece into the board grid.
function lockPiece() {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x]) {
        board[piece.y + y][piece.x + x] = piece.color;
      }
    }
  }
  clearLines();
  spawn();
}

// Move the piece down one row, or lock it if it can't move.
function drop() {
  if (isValid(piece.matrix, piece.x, piece.y + 1)) {
    piece.y += 1;
  } else {
    lockPiece();
  }
}

function softDrop() {
  drop();
}

function rotate() {
  const rotated = rotateCW(piece.matrix);
  // Wall kick: try in place, then nudge left/right to fit
  for (const dx of [0, -1, 1, -2, 2]) {
    if (isValid(rotated, piece.x + dx, piece.y)) {
      piece.matrix = rotated;
      piece.x += dx;
      return;
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (!piece) return;
  switch (e.key) {
    case "ArrowLeft":
      move(-1);
      break;
    case "ArrowRight":
      move(1);
      break;
    case "ArrowDown":
      softDrop();
      break;
    case "ArrowUp":
    case "x":
    case "X":
      rotate();
      break;
    default:
      return;
  }
  e.preventDefault();
});

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
