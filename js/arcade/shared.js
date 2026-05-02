import { state } from '../state.js';
import { audio } from '../audio.js';

export function setHighScore(gameId, score) {
  const scores = state.get('games.highScores') || {};
  if ((scores[gameId] || 0) < score) {
    scores[gameId] = score;
    state.set('games.highScores', scores);
    state.emit('game:score', { game: gameId, score });
    return true;
  }
  return false;
}

export function getHighScore(gameId) {
  const scores = state.get('games.highScores') || {};
  return scores[gameId] || 0;
}

export function recordPlay(gameId, extra = {}) {
  const played = state.get('games.played') || {};
  played[gameId] = (played[gameId] || 0) + 1;
  state.set('games.played', played);
  state.emit('game:complete', { game: gameId, ...extra });
}

export function createHUD(opts = {}) {
  const { score = true, lives = false, highScore = true, gameId = '' } = opts;
  const hud = document.createElement('div');
  hud.className = 'game-hud';
  if (score) hud.innerHTML += `<div class="game-hud__score">Score <strong id="hud-score">0</strong></div>`;
  if (lives) hud.innerHTML += `<div class="game-hud__lives">Lives <strong id="hud-lives">3</strong></div>`;
  if (highScore) hud.innerHTML += `<div class="game-hud__highscore">Best <strong id="hud-highscore">${getHighScore(gameId)}</strong></div>`;
  return hud;
}

export function setHudScore(score) {
  const el = document.getElementById('hud-score'); if (el) el.textContent = score;
}
export function setHudLives(lives) {
  const el = document.getElementById('hud-lives'); if (el) el.textContent = lives;
}
export function setHudHigh(score) {
  const el = document.getElementById('hud-highscore'); if (el) el.textContent = score;
}

export function createOverlay(parent) {
  const ov = document.createElement('div');
  ov.className = 'game-overlay';
  parent.appendChild(ov);
  return {
    show(html) { ov.innerHTML = html; ov.classList.add('visible'); },
    hide() { ov.classList.remove('visible'); },
    el: ov,
  };
}

export function gameLoop(stepFn) {
  let last = performance.now();
  let running = true;
  let rafId = 0;
  function tick(now) {
    if (!running) return;
    const dt = Math.min(50, now - last);
    last = now;
    stepFn(dt / 1000);
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
  return {
    stop() { running = false; if (rafId) cancelAnimationFrame(rafId); },
    pause() { running = false; if (rafId) cancelAnimationFrame(rafId); },
    resume() { if (running) return; running = true; last = performance.now(); rafId = requestAnimationFrame(tick); },
    isRunning() { return running; },
  };
}

export function createInput() {
  const keys = new Set();
  const onDown = (e) => keys.add(e.key);
  const onUp = (e) => keys.delete(e.key);
  addEventListener('keydown', onDown);
  addEventListener('keyup', onUp);
  return {
    isDown(...names) { return names.some(n => keys.has(n)); },
    destroy() { removeEventListener('keydown', onDown); removeEventListener('keyup', onUp); },
  };
}

export function playSound(name) {
  try { audio.play(name); } catch {}
}

export { state };
