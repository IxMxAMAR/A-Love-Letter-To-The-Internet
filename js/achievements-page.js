/**
 * achievements-page.js — Achievements Page renderer (Layer 2 / Task 6)
 *
 * Reads from achievements.js engine + state. Renders completion ring,
 * category grids, and a shareable PNG card.
 */

import { ACHIEVEMENTS, achievements } from './achievements.js';
import { state } from './state.js';

/* ── Progress ring ───────────────────────────────────────────── */
const progress = achievements.getProgress();
const ring = document.getElementById('ach-ring');
const pctEl = document.getElementById('ach-pct');
const statsEl = document.getElementById('ach-stats');

const pct = progress.total > 0
  ? Math.round((progress.unlocked / progress.total) * 100)
  : 0;

if (ring) {
  // conic-gradient driven by completion %.
  // At 0% the masked ring still shows the full neutral track.
  ring.style.background = `conic-gradient(
    oklch(0.65 0.22 290) 0%,
    oklch(0.7 0.18 200) ${Math.max(pct, 0.5)}%,
    oklch(0.2 0.02 280) ${Math.max(pct, 0.5)}% 100%
  )`;
}
if (pctEl) pctEl.textContent = `${pct}%`;
if (statsEl) statsEl.textContent = `${progress.unlocked} / ${progress.total} unlocked`;

/* ── Category grids ──────────────────────────────────────────── */
const u = state.get('achievements.unlocked') || {};
const byCat = {};
ACHIEVEMENTS.forEach(a => {
  byCat[a.category] = byCat[a.category] || [];
  byCat[a.category].push(a);
});

const wrap = document.getElementById('ach-categories');
if (wrap) {
  wrap.innerHTML = Object.entries(byCat).map(([cat, list]) => {
    const unlocked = list.filter(a => u[a.id]).length;
    return `
      <article class="ach-cat">
        <h2>${escapeHtml(cat)} <small>${unlocked} / ${list.length}</small></h2>
        <div class="ach-grid">
          ${list.map(a => {
            const t = u[a.id];
            const isUnlocked = !!t;
            const dateStr = isUnlocked ? new Date(t).toLocaleDateString() : 'Locked';
            return `
              <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${escapeHtml(dateStr)}">
                <div class="ach-icon">${isUnlocked ? '🏆' : '🔒'}</div>
                <div class="ach-title">${escapeHtml(a.title)}</div>
                <div class="ach-desc">${escapeHtml(a.desc)}</div>
                ${isUnlocked ? `<div class="ach-date">Unlocked ${escapeHtml(dateStr)}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </article>
    `;
  }).join('');
}

/* ── Export Achievement Card ─────────────────────────────────── */
document.getElementById('export-card')?.addEventListener('click', exportCard);

function exportCard() {
  const W = 800, H = 500;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0e1020');
  bg.addColorStop(1, '#1a1d35');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle border glow
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Title
  ctx.fillStyle = '#a78bfa';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillText('A Love Letter to the Web', 40, 60);

  // Subtitle
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText('Achievement Card', 40, 90);

  // Progress headline
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText(`${progress.unlocked} / ${progress.total} unlocked (${pct}%)`, 40, 150);

  // Progress bar track
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  roundRect(ctx, 40, 170, W - 80, 14, 7);
  ctx.fill();

  // Progress bar fill
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  grad.addColorStop(0, '#a78bfa');
  grad.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = grad;
  const fillWidth = Math.max(2, Math.round((W - 80) * (pct / 100)));
  roundRect(ctx, 40, 170, fillWidth, 14, 7);
  ctx.fill();

  // Categories list
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '600 18px Inter, sans-serif';
  ctx.fillText('Categories', 40, 230);

  ctx.font = '15px "JetBrains Mono", monospace';
  let y = 260;
  const cats = Object.entries(progress.byCategory || {});
  cats.forEach(([cat, info]) => {
    const line = `${cat.padEnd(14, ' ')}  ${info.unlocked} / ${info.total}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.fillText(line, 60, y);

    // Mini bar
    const barX = 360, barW = 360, barH = 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, barX, y - 10, barW, barH, 4);
    ctx.fill();
    const ratio = info.total > 0 ? info.unlocked / info.total : 0;
    ctx.fillStyle = '#a78bfa';
    roundRect(ctx, barX, y - 10, Math.max(2, Math.round(barW * ratio)), barH, 4);
    ctx.fill();

    y += 30;
  });

  // Date stamp
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText(stamp, 40, H - 30);

  // URL right-aligned
  const url = 'github.com/IxMxAMAR/HTML';
  ctx.textAlign = 'right';
  ctx.fillText(url, W - 40, H - 30);
  ctx.textAlign = 'left';

  // Trigger download
  const link = document.createElement('a');
  link.download = `achievements-${stamp}.png`;
  link.href = c.toDataURL('image/png');
  link.click();

  // Tell the engine the user exported (lab:export trigger has its own card,
  // but a generic gimmick:trigger keeps things consistent)
  state.emit('gimmick:trigger', { name: 'achievement-export' });
}

/* ── Helpers ─────────────────────────────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y,     x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x,     y + h, rr);
  ctx.arcTo(x,     y + h, x,     y,     rr);
  ctx.arcTo(x,     y,     x + w, y,     rr);
  ctx.closePath();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
