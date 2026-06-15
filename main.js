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
}

// --- Game loop ---
function loop() {
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
