import { createHUD, setHudScore, setHudHigh, getHighScore, setHighScore, recordPlay, createOverlay, gameLoop, createInput, playSound } from './shared.js';

const GAME_ID = 'pong';
const root = document.getElementById('game-root');

const hud = document.createElement('div');
hud.className = 'game-hud';
hud.innerHTML = `<div class="game-hud__score">You <strong id="hud-player">0</strong></div><div class="game-hud__highscore">CPU <strong id="hud-cpu">0</strong></div>`;
root.appendChild(hud);

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
controls.innerHTML = 'Use <kbd>↑</kbd><kbd>↓</kbd> or <kbd>W</kbd><kbd>S</kbd>. First to 5 wins.';
root.appendChild(controls);

let p1, p2, ball, p1Score, p2Score;
const PH = 60, PW = 8, BALL_SIZE = 8;
const PADDLE_SPEED = 280;

function reset() {
  p1 = { x: 12, y: canvas.height/2 - PH/2 };
  p2 = { x: canvas.width - 20, y: canvas.height/2 - PH/2 };
  ball = { x: canvas.width/2, y: canvas.height/2, vx: 200 * (Math.random() < 0.5 ? -1 : 1), vy: (Math.random() - 0.5) * 200 };
  p1Score = p2Score = 0;
  document.getElementById('hud-player').textContent = '0';
  document.getElementById('hud-cpu').textContent = '0';
}

const input = createInput();

function step(dt) {
  if (input.isDown('ArrowUp', 'w', 'W')) p1.y -= PADDLE_SPEED * dt;
  if (input.isDown('ArrowDown', 's', 'S')) p1.y += PADDLE_SPEED * dt;
  p1.y = Math.max(0, Math.min(canvas.height - PH, p1.y));

  // AI
  const targetY = ball.y - PH/2;
  const dy = targetY - p2.y;
  p2.y += Math.max(-PADDLE_SPEED * 0.7, Math.min(PADDLE_SPEED * 0.7, dy)) * dt;
  p2.y = Math.max(0, Math.min(canvas.height - PH, p2.y));

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.y < 0 || ball.y + BALL_SIZE > canvas.height) { ball.vy *= -1; playSound('click'); }

  // paddle collide
  if (ball.x < p1.x + PW && ball.y + BALL_SIZE > p1.y && ball.y < p1.y + PH && ball.vx < 0) {
    ball.vx *= -1.05; ball.vy += (ball.y - (p1.y + PH/2)) * 6; playSound('pop');
  }
  if (ball.x + BALL_SIZE > p2.x && ball.y + BALL_SIZE > p2.y && ball.y < p2.y + PH && ball.vx > 0) {
    ball.vx *= -1.05; ball.vy += (ball.y - (p2.y + PH/2)) * 6; playSound('pop');
  }

  if (ball.x < 0) { p2Score++; document.getElementById('hud-cpu').textContent = p2Score; resetBall(-1); playSound('error'); checkWin(); }
  if (ball.x > canvas.width) { p1Score++; document.getElementById('hud-player').textContent = p1Score; resetBall(1); playSound('chime'); checkWin(); }
  draw();
}

function resetBall(dir) {
  ball.x = canvas.width/2; ball.y = canvas.height/2;
  ball.vx = 200 * dir; ball.vy = (Math.random() - 0.5) * 200;
}

function checkWin() {
  if (p1Score >= 5 || p2Score >= 5) {
    const won = p1Score > p2Score;
    if (won) { setHighScore(GAME_ID, p1Score * 100); recordPlay(GAME_ID); }
    overlay.show(`<div><h2>${won ? 'You Win!' : 'CPU Wins'}</h2><p>Final: ${p1Score} - ${p2Score}</p><div class="game-overlay__buttons"><button id="restart">Play again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
    document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); reset(); });
    loop.pause();
  }
}

function draw() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(p1.x, p1.y, PW, PH);
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(p2.x, p2.y, PW, PH);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

reset();
const loop = gameLoop(step);
