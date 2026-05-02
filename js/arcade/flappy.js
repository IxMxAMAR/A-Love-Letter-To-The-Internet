import { createHUD, setHudScore, setHudHigh, getHighScore, setHighScore, recordPlay, createOverlay, gameLoop, playSound } from './shared.js';

const GAME_ID = 'flappy';
const root = document.getElementById('game-root');

root.appendChild(createHUD({ gameId: GAME_ID }));
const wrap = document.createElement('div');
wrap.className = 'game-canvas-wrap';
const canvas = document.createElement('canvas');
canvas.width = 480; canvas.height = 480;
wrap.appendChild(canvas);
root.appendChild(wrap);
const overlay = createOverlay(wrap);
const ctx = canvas.getContext('2d');

const controls = document.createElement('div');
controls.className = 'game-controls';
controls.innerHTML = 'Press <kbd>Space</kbd> or click to flap. Avoid pipes.';
root.appendChild(controls);

let bird, pipes, score, alive, spawnAcc;
const G = 1500, FLAP = -440, PIPE_SPEED = 180, GAP = 130, PIPE_W = 60, SPAWN_INT = 1.6;

function reset() {
  bird = { x: 80, y: canvas.height/2, vy: 0 };
  pipes = [];
  score = 0; setHudScore(0);
  alive = true;
  spawnAcc = 0;
}

function flap() {
  if (!alive) return;
  bird.vy = FLAP;
  playSound('pop');
}

addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.target.closest('input,textarea,[contenteditable]')) { e.preventDefault(); flap(); } });
canvas.addEventListener('click', flap);

function step(dt) {
  if (!alive) return;
  bird.vy += G * dt;
  bird.y += bird.vy * dt;
  if (bird.y < 0 || bird.y > canvas.height) return die();

  spawnAcc += dt;
  if (spawnAcc > SPAWN_INT) { spawnAcc = 0; const gap_y = 60 + Math.random() * (canvas.height - 120 - GAP); pipes.push({ x: canvas.width, gap_y, passed: false }); }
  pipes.forEach(p => p.x -= PIPE_SPEED * dt);
  pipes = pipes.filter(p => p.x > -PIPE_W);

  // collisions
  pipes.forEach(p => {
    if (bird.x + 18 > p.x && bird.x - 18 < p.x + PIPE_W) {
      if (bird.y - 18 < p.gap_y || bird.y + 18 > p.gap_y + GAP) return die();
    }
    if (!p.passed && p.x + PIPE_W < bird.x) { p.passed = true; score++; setHudScore(score); playSound('chime'); }
  });

  draw();
}

function die() {
  alive = false;
  playSound('error');
  const newHigh = setHighScore(GAME_ID, score);
  if (newHigh) setHudHigh(score);
  recordPlay(GAME_ID);
  overlay.show(`<div><h2>Game Over</h2><p>Score: ${score}</p>${newHigh ? '<p>🏆 New high score!</p>' : ''}<div class="game-overlay__buttons"><button id="restart">Play again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); reset(); });
}

function draw() {
  ctx.fillStyle = 'oklch(0.4 0.18 200)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // pipes
  ctx.fillStyle = '#34d399';
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, PIPE_W, p.gap_y);
    ctx.fillRect(p.x, p.gap_y + GAP, PIPE_W, canvas.height - p.gap_y - GAP);
  });
  // bird
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, 16, 0, Math.PI * 2);
  ctx.fill();
}

reset();
const loop = gameLoop(step);
