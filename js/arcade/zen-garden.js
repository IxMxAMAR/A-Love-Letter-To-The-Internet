import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'zen-garden';
const root = document.getElementById('game-root');

root.innerHTML = `
  <div class="game-hud">
    <div class="game-hud__score">Stones <strong id="hud-stones">0</strong></div>
    <div class="game-hud__highscore">Best <strong id="hud-best">${(state.get('games.highScores') || {})['zen-garden'] || 0}</strong></div>
  </div>
  <div class="game-canvas-wrap"><canvas id="zen-canvas"></canvas></div>
  <div class="zg-controls">
    <button id="zg-clear">Clear</button>
    <button id="zg-tool-stone" class="active">🪨 Stone</button>
    <button id="zg-tool-sand">🌀 Sand</button>
    <button id="zg-end">End</button>
  </div>
  <p class="game-controls">Click to place a stone. Drag to draw sand ripples. Press <kbd>Esc</kbd> to clear.</p>
  <a href="../arcade.html" class="game-back">← Back to arcade</a>
`;

const styleTag = document.createElement('style');
styleTag.textContent = `
.zg-controls { display: flex; gap: 8px; padding: 12px; background: oklch(0.18 0.02 280); border-radius: 8px; }
.zg-controls button { padding: 8px 12px; border-radius: 6px; cursor: pointer; background: oklch(0.22 0.04 280); color: white; border: 1px solid oklch(1 0 0 / 0.1); }
.zg-controls button.active { background: oklch(0.65 0.22 290); }
`;
document.head.appendChild(styleTag);

const canvas = document.getElementById('zen-canvas');
canvas.width = 600; canvas.height = 400;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#d4c5a0'; ctx.fillRect(0, 0, canvas.width, canvas.height);

const overlay = createOverlay(canvas.parentElement);
let stones = []; let tool = 'stone'; let dragging = false;

function drawAll() {
  ctx.fillStyle = '#d4c5a0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw sand ripples
  if (drawAll._ripples) {
    drawAll._ripples.forEach(r => {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      r.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }
  // Draw stones with shadow
  stones.forEach(s => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(s.x + 4, s.y + 4, s.r, s.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
    // sand ring around stone
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r + i * 6, 0, Math.PI * 2); ctx.stroke();
    }
  });
}
drawAll._ripples = [];
drawAll();

function getCoords(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * canvas.width, y: ((e.clientY - r.top) / r.height) * canvas.height };
}

canvas.addEventListener('mousedown', (e) => {
  const { x, y } = getCoords(e);
  if (tool === 'stone') {
    stones.push({ x, y, r: 12 + Math.random() * 12, color: `oklch(${0.4 + Math.random() * 0.3} 0.05 ${(Math.random() * 60) | 0})` });
    document.getElementById('hud-stones').textContent = stones.length;
    playSound('pop');
    drawAll();
  } else {
    drawAll._ripples.push({ points: [{ x, y }] });
    dragging = true;
  }
});
canvas.addEventListener('mousemove', (e) => {
  if (!dragging || tool !== 'sand') return;
  const { x, y } = getCoords(e);
  drawAll._ripples[drawAll._ripples.length - 1].points.push({ x, y });
  drawAll();
});
addEventListener('mouseup', () => { dragging = false; });

document.getElementById('zg-tool-stone').addEventListener('click', () => {
  tool = 'stone';
  document.getElementById('zg-tool-stone').classList.add('active');
  document.getElementById('zg-tool-sand').classList.remove('active');
});
document.getElementById('zg-tool-sand').addEventListener('click', () => {
  tool = 'sand';
  document.getElementById('zg-tool-sand').classList.add('active');
  document.getElementById('zg-tool-stone').classList.remove('active');
});
document.getElementById('zg-clear').addEventListener('click', () => { stones = []; drawAll._ripples = []; document.getElementById('hud-stones').textContent = '0'; drawAll(); });
document.getElementById('zg-end').addEventListener('click', () => {
  setHighScore(GAME_ID, stones.length);
  recordPlay(GAME_ID, { score: stones.length });
  overlay.show(`<div><h2>Garden Tended</h2><p>${stones.length} stone${stones.length === 1 ? '' : 's'} placed.</p><div class="game-overlay__buttons"><button id="restart">Begin again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); stones = []; drawAll._ripples = []; document.getElementById('hud-stones').textContent = '0'; drawAll(); });
});

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (stones.length === 0 && drawAll._ripples.length === 0) return;
    if (!confirm('Clear the garden?')) return;
    stones = []; drawAll._ripples = []; document.getElementById('hud-stones').textContent = '0'; drawAll();
  }
});
