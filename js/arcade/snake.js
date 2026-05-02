import { createHUD, setHudScore, setHudHigh, getHighScore, setHighScore, recordPlay, createOverlay, gameLoop, createInput, playSound } from './shared.js';

const GAME_ID = 'snake';
const root = document.getElementById('game-root');

// Build chrome
root.appendChild(createHUD({ gameId: GAME_ID }));
const wrap = document.createElement('div');
wrap.className = 'game-canvas-wrap';
const canvas = document.createElement('canvas');
canvas.width = 480; canvas.height = 360;
wrap.appendChild(canvas);
root.appendChild(wrap);

const overlay = createOverlay(wrap);
const ctx = canvas.getContext('2d');

const controls = document.createElement('div');
controls.className = 'game-controls';
controls.innerHTML = 'Use <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> or <kbd>WASD</kbd>. <kbd>P</kbd> to pause.';
root.appendChild(controls);

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

let snake, dir, nextDir, food, score, alive, tickAcc, tickRate;

function reset() {
  snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  placeFood();
  score = 0; setHudScore(0);
  alive = true;
  tickAcc = 0;
  tickRate = 0.12; // seconds per cell move
  if (typeof loop !== 'undefined') loop.resume();
}

function placeFood() {
  while (true) {
    const f = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) { food = f; return; }
  }
}

function step(dt) {
  if (!alive) return;
  tickAcc += dt;
  if (tickAcc < tickRate) { draw(); return; }
  tickAcc -= tickRate;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return die();
  if (snake.some(s => s.x === head.x && s.y === head.y)) return die();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10; setHudScore(score);
    placeFood(); playSound('pop');
    tickRate = Math.max(0.05, tickRate * 0.97);
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#a78bfa';
  snake.forEach((s, i) => {
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  });
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
}

function die() {
  alive = false;
  playSound('error');
  const newHigh = setHighScore(GAME_ID, score);
  if (newHigh) setHudHigh(score);
  recordPlay(GAME_ID);
  loop.pause();
  overlay.show(`<div><h2>Game Over</h2><p>Score: ${score}</p>${newHigh ? '<p>🏆 New high score!</p>' : ''}<div class="game-overlay__buttons"><button id="restart">Play again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); reset(); });
}

const input = createInput();
addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea,[contenteditable]')) return;
  let nd = null;
  if (input.isDown('ArrowUp', 'w', 'W')) nd = { x: 0, y: -1 };
  if (input.isDown('ArrowDown', 's', 'S')) nd = { x: 0, y: 1 };
  if (input.isDown('ArrowLeft', 'a', 'A')) nd = { x: -1, y: 0 };
  if (input.isDown('ArrowRight', 'd', 'D')) nd = { x: 1, y: 0 };
  if (nd && (nd.x !== -dir.x || nd.y !== -dir.y)) nextDir = nd;
  if (e.key === 'p' || e.key === 'P') {
    if (loop.isRunning()) loop.pause(); else loop.resume();
  }
});

reset();
const loop = gameLoop(step);
