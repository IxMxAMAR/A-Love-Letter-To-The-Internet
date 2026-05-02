import { createHUD, setHudScore, setHudLives, setHudHigh, setHighScore, recordPlay, createOverlay, gameLoop, createInput, playSound } from './shared.js';

const GAME_ID = 'breakout';
const root = document.getElementById('game-root');

root.appendChild(createHUD({ gameId: GAME_ID, lives: true }));
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
controls.innerHTML = 'Move with <kbd>←</kbd><kbd>→</kbd> or mouse. <kbd>Space</kbd> to launch.';
root.appendChild(controls);

let paddle, ball, bricks, score, lives, level, launched, allLevelsCleared;
const PW = 80, PH = 10;
const BRICK_COLS = 8;
const BRICK_W = canvas.width / BRICK_COLS;
const BRICK_H = 18;
const COLORS = ['#ef4444','#f97316','#fbbf24','#34d399','#06b6d4'];

function resetLevel(lvl) {
  level = lvl;
  paddle = { x: canvas.width/2 - PW/2, y: canvas.height - 24, w: PW, h: PH };
  const speed = 200 + lvl * 40;
  ball = { x: paddle.x + paddle.w/2, y: paddle.y - 8, vx: 0, vy: 0, r: 6, speed };
  launched = false;
  bricks = [];
  const rows = 4 + lvl;
  for (let r = 0; r < rows; r++) for (let c = 0; c < BRICK_COLS; c++) {
    bricks.push({ x: c * BRICK_W + 2, y: 30 + r * BRICK_H, w: BRICK_W - 4, h: BRICK_H - 2, alive: true, color: COLORS[r % COLORS.length] });
  }
}

function reset() {
  score = 0; lives = 3; allLevelsCleared = false;
  setHudScore(0); setHudLives(3);
  resetLevel(1);
}

const input = createInput();
canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, x - paddle.w/2));
});
addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea,[contenteditable]')) return;
  if ((e.code === 'Space' || e.key === ' ') && !launched) {
    e.preventDefault();
    ball.vx = (Math.random() - 0.5) * ball.speed;
    ball.vy = -ball.speed;
    launched = true;
  }
});

function step(dt) {
  if (input.isDown('ArrowLeft', 'a', 'A')) paddle.x -= 320 * dt;
  if (input.isDown('ArrowRight', 'd', 'D')) paddle.x += 320 * dt;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));

  if (!launched) {
    ball.x = paddle.x + paddle.w/2;
    ball.y = paddle.y - ball.r - 1;
    draw(); return;
  }
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; playSound('click'); }
  if (ball.x + ball.r > canvas.width) { ball.x = canvas.width - ball.r; ball.vx *= -1; playSound('click'); }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; playSound('click'); }

  if (ball.y - ball.r > canvas.height) {
    lives--; setHudLives(lives);
    playSound('error');
    if (lives <= 0) return gameOver(false);
    launched = false;
    return;
  }

  // paddle bounce
  if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.vy > 0) {
    ball.vy *= -1;
    const offset = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
    ball.vx = offset * ball.speed;
    playSound('pop');
  }

  // brick collisions
  for (const b of bricks) {
    if (!b.alive) continue;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      b.alive = false;
      score += 10; setHudScore(score);
      // bounce direction
      const overlapX = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
      const overlapY = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
      if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
      playSound('pop');
      break;
    }
  }

  if (bricks.every(b => !b.alive)) {
    if (level < 3) { resetLevel(level + 1); }
    else { allLevelsCleared = true; gameOver(true); }
  }
  draw();
}

function gameOver(won) {
  const newHigh = setHighScore(GAME_ID, score);
  if (newHigh) setHudHigh(score);
  recordPlay(GAME_ID, { allLevels: !!won, score });
  overlay.show(`<div><h2>${won ? 'All Levels Cleared!' : 'Game Over'}</h2><p>Score: ${score}</p>${newHigh ? '<p>🏆 New high score!</p>' : ''}<div class="game-overlay__buttons"><button id="restart">Play again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); reset(); loop.resume(); });
  loop.pause();
}

function draw() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  bricks.forEach(b => {
    if (!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px monospace';
  ctx.fillText(`Level ${level}`, 8, 16);
}

reset();
const loop = gameLoop(step);
