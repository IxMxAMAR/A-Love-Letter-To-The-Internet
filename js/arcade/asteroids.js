import { createHUD, setHudScore, setHudLives, setHudHigh, setHighScore, recordPlay, createOverlay, gameLoop, createInput, playSound } from './shared.js';

const GAME_ID = 'asteroids';
const root = document.getElementById('game-root');

root.appendChild(createHUD({ gameId: GAME_ID, lives: true }));
const wrap = document.createElement('div');
wrap.className = 'game-canvas-wrap';
const canvas = document.createElement('canvas');
canvas.width = 600; canvas.height = 450;
wrap.appendChild(canvas);
root.appendChild(wrap);
const overlay = createOverlay(wrap);
const ctx = canvas.getContext('2d');

const controls = document.createElement('div');
controls.className = 'game-controls';
controls.innerHTML = '<kbd>←</kbd><kbd>→</kbd> rotate, <kbd>↑</kbd> thrust, <kbd>Space</kbd> shoot.';
root.appendChild(controls);

let ship, asteroids, bullets, score, lives, alive;

function reset() {
  ship = { x: canvas.width/2, y: canvas.height/2, vx: 0, vy: 0, angle: 0, cooldown: 0, invuln: 1.5 };
  asteroids = [];
  for (let i = 0; i < 5; i++) spawnAsteroid('large');
  bullets = [];
  score = 0; lives = 3; alive = true;
  setHudScore(0); setHudLives(3);
}

function spawnAsteroid(size, x, y) {
  if (x === undefined) {
    x = Math.random() * canvas.width;
    y = Math.random() * canvas.height;
    while (Math.hypot(x - canvas.width/2, y - canvas.height/2) < 100) {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
    }
  }
  const r = size === 'large' ? 30 : size === 'medium' ? 18 : 10;
  const speed = size === 'large' ? 30 : size === 'medium' ? 50 : 80;
  const a = Math.random() * Math.PI * 2;
  asteroids.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r, size });
}

const input = createInput();
let lastShoot = 0;
addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.target.closest('input,textarea,[contenteditable]')) { e.preventDefault(); shoot(); }
});

function shoot() {
  if (!alive) return;
  if (ship.cooldown > 0) return;
  ship.cooldown = 0.18;
  bullets.push({
    x: ship.x + Math.cos(ship.angle) * 12,
    y: ship.y + Math.sin(ship.angle) * 12,
    vx: Math.cos(ship.angle) * 360, vy: Math.sin(ship.angle) * 360,
    life: 1.2,
  });
  playSound('laser');
}

function wrap2(o) {
  if (o.x < 0) o.x += canvas.width;
  if (o.x > canvas.width) o.x -= canvas.width;
  if (o.y < 0) o.y += canvas.height;
  if (o.y > canvas.height) o.y -= canvas.height;
}

function step(dt) {
  if (!alive) return;
  if (input.isDown('ArrowLeft', 'a', 'A')) ship.angle -= 3.6 * dt;
  if (input.isDown('ArrowRight', 'd', 'D')) ship.angle += 3.6 * dt;
  if (input.isDown('ArrowUp', 'w', 'W')) {
    ship.vx += Math.cos(ship.angle) * 200 * dt;
    ship.vy += Math.sin(ship.angle) * 200 * dt;
  }
  ship.vx *= 0.99; ship.vy *= 0.99;
  ship.x += ship.vx * dt; ship.y += ship.vy * dt;
  wrap2(ship);
  ship.cooldown = Math.max(0, ship.cooldown - dt);
  ship.invuln = Math.max(0, ship.invuln - dt);

  bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; wrap2(b); });
  bullets = bullets.filter(b => b.life > 0);

  asteroids.forEach(a => { a.x += a.vx * dt; a.y += a.vy * dt; wrap2(a); });

  // bullet-asteroid collision
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const b = bullets[bi]; const a = asteroids[ai];
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.r) {
        bullets.splice(bi, 1);
        asteroids.splice(ai, 1);
        playSound('explosion');
        if (a.size === 'large') { spawnAsteroid('medium', a.x, a.y); spawnAsteroid('medium', a.x, a.y); score += 100; }
        else if (a.size === 'medium') { spawnAsteroid('small', a.x, a.y); spawnAsteroid('small', a.x, a.y); score += 50; }
        else score += 25;
        setHudScore(score);
        if (asteroids.length === 0) { for (let i = 0; i < 6; i++) spawnAsteroid('large'); }
        break;
      }
    }
  }

  // ship-asteroid
  if (ship.invuln <= 0) {
    for (const a of asteroids) {
      if (Math.hypot(a.x - ship.x, a.y - ship.y) < a.r + 8) {
        lives--; setHudLives(lives);
        playSound('error');
        if (lives <= 0) return die();
        ship.x = canvas.width/2; ship.y = canvas.height/2; ship.vx = ship.vy = 0; ship.invuln = 2;
        break;
      }
    }
  }
  draw();
}

function die() {
  alive = false;
  const newHigh = setHighScore(GAME_ID, score);
  if (newHigh) setHudHigh(score);
  recordPlay(GAME_ID);
  overlay.show(`<div><h2>Game Over</h2><p>Score: ${score}</p>${newHigh ? '<p>🏆 New high score!</p>' : ''}<div class="game-overlay__buttons"><button id="restart">Play again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); reset(); });
}

function draw() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ship
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.strokeStyle = ship.invuln > 0 && Math.floor(performance.now() / 80) % 2 ? 'rgba(255,255,255,0.4)' : '#a78bfa';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, 8); ctx.lineTo(-4, 0); ctx.lineTo(-8, -8); ctx.closePath(); ctx.stroke();
  ctx.restore();
  // bullets
  ctx.fillStyle = '#fbbf24';
  bullets.forEach(b => { ctx.fillRect(b.x - 2, b.y - 2, 4, 4); });
  // asteroids
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 2;
  asteroids.forEach(a => { ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.stroke(); });
}

reset();
const loop = gameLoop(step);
