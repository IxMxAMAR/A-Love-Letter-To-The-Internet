import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'roulette';
const root = document.getElementById('game-root');

root.innerHTML = `
  <div class="game-hud">
    <div class="game-hud__score">Spins left <strong id="hud-spins">5</strong></div>
    <div class="game-hud__highscore">Saved <strong id="hud-saved">0</strong></div>
  </div>
  <div class="rl-stage">
    <div class="rl-frame" id="rl-frame"><div class="rl-art" id="rl-art"></div></div>
    <div class="rl-actions">
      <button id="rl-spin" class="ripple">🎲 Spin</button>
      <button id="rl-save">💾 Save</button>
      <button id="rl-end">End</button>
    </div>
    <h4>Your gallery:</h4>
    <div class="rl-gallery" id="rl-gallery"></div>
  </div>
  <a href="../arcade.html" class="game-back">← Back to arcade</a>
`;

const styleTag = document.createElement('style');
styleTag.textContent = `
.rl-stage { padding: 16px; display: grid; gap: 12px; }
.rl-frame { padding: 24px; min-height: 240px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 12px; display: grid; place-items: center; }
.rl-art { width: 200px; height: 200px; transition: all 600ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.rl-actions { display: flex; gap: 8px; }
.rl-actions button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.rl-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; min-height: 80px; padding: 12px; background: oklch(0.05 0.01 280); border-radius: 8px; }
.rl-gallery .rl-thumb { aspect-ratio: 1; border-radius: 8px; }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);
let spins = 5; let saved = []; let current = null;

function rand(min, max) { return min + Math.random() * (max - min); }
function hex() { return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'); }

function spin() {
  if (spins <= 0) return;
  spins--;
  document.getElementById('hud-spins').textContent = spins;
  const types = ['linear-gradient', 'radial-gradient', 'conic-gradient'];
  const t = types[Math.floor(Math.random() * types.length)];
  const c1 = hex(), c2 = hex(), c3 = hex();
  const angle = rand(0, 360) | 0;
  const clipShapes = [
    'circle(50%)',
    'polygon(50% 0%, 0% 100%, 100% 100%)',
    'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    'none',
    'circle(40% at 70% 30%)',
  ];
  const clip = clipShapes[Math.floor(Math.random() * clipShapes.length)];
  const rotate = (rand(-30, 30)) | 0;
  const radius = (rand(0, 50)) | 0;
  const filter = Math.random() > 0.5 ? `hue-rotate(${(rand(0, 360))|0}deg) saturate(${(rand(80, 200))|0}%)` : 'none';
  const css = {
    background: t === 'linear-gradient' ? `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`
              : t === 'radial-gradient' ? `radial-gradient(circle, ${c1}, ${c2})`
              : `conic-gradient(from ${angle}deg, ${c1}, ${c2}, ${c3}, ${c1})`,
    'border-radius': radius + '%',
    'clip-path': clip,
    transform: `rotate(${rotate}deg)`,
    filter: filter,
  };
  current = css;
  applyToEl(document.getElementById('rl-art'), css);
  playSound('powerup');
  if (spins === 0) document.getElementById('rl-spin').disabled = true;
}

function applyToEl(el, css) {
  Object.entries(css).forEach(([k, v]) => el.style.setProperty(k, v));
}

function save() {
  if (!current) return;
  saved.push(current);
  document.getElementById('hud-saved').textContent = saved.length;
  const t = document.createElement('div'); t.className = 'rl-thumb';
  applyToEl(t, current);
  document.getElementById('rl-gallery').appendChild(t);
  playSound('chime');
}

function end() {
  setHighScore(GAME_ID, saved.length * 100);
  recordPlay(GAME_ID);
  try { state.emit('game:complete', { game: GAME_ID, score: saved.length }); } catch {}
  overlay.show(`<div><h2>Gallery Curated</h2><p>Saved ${saved.length} piece${saved.length === 1 ? '' : 's'}.</p><div class="game-overlay__buttons"><button id="restart">Spin again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); spins = 5; saved = []; current = null; document.getElementById('hud-spins').textContent = '5'; document.getElementById('hud-saved').textContent = '0'; document.getElementById('rl-gallery').innerHTML = ''; document.getElementById('rl-spin').disabled = false; document.getElementById('rl-art').removeAttribute('style'); });
}

document.getElementById('rl-spin').addEventListener('click', spin);
document.getElementById('rl-save').addEventListener('click', save);
document.getElementById('rl-end').addEventListener('click', end);
