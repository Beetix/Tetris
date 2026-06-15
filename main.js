"use strict";

// Canvas setup
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// Clear the canvas with the background color
function clear() {
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

clear();
