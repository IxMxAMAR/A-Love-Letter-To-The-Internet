/**
 * arcade.js — Arcade Hub (Layer 2 / Task 4)
 *
 * Renders 15 game cards, filter tabs, and a top-5 leaderboard
 * sourced from state.get('games.highScores').
 */
import { state } from './state.js';

const GAMES = [
  { id: 'snake',             title: 'CSS Snake',             cat: 'retro'  },
  { id: 'breakout',          title: 'Breakout (The Cascade)', cat: 'retro' },
  { id: 'pong',              title: 'Pong (Specificity Wars)', cat: 'retro' },
  { id: 'asteroids',         title: 'Asteroids (!important)', cat: 'retro' },
  { id: 'flappy',            title: 'Flappy Div',            cat: 'retro'  },
  { id: 'selector-duel',     title: 'Selector Duel',         cat: 'puzzle' },
  { id: 'layout-architect',  title: 'Layout Architect',      cat: 'puzzle' },
  { id: 'animation-timeline',title: 'Animation Timeline',    cat: 'puzzle' },
  { id: 'cascade-puzzle',    title: 'Cascade Puzzle',        cat: 'puzzle' },
  { id: 'has-detective',     title: ':has() Detective',      cat: 'puzzle' },
  { id: 'roulette',          title: 'CSS Art Roulette',      cat: 'wild'   },
  { id: 'type-racer',        title: 'Type Racer',            cat: 'wild'   },
  { id: 'zen-garden',        title: 'Zen Garden',            cat: 'wild'   },
  { id: 'debug',             title: 'Debug Game',            cat: 'wild'   },
  { id: 'boss-rush',         title: 'Boss Rush',             cat: 'wild'   },
];

const grid = document.getElementById('arcade-grid');
const lb = document.getElementById('leaderboard-list');
const filters = document.querySelectorAll('.arcade-filter');
const resetBtn = document.getElementById('reset-scores');

/** Lookup table: game id → friendly title (for leaderboard rows). */
const TITLE_BY_ID = Object.fromEntries(GAMES.map(g => [g.id, g.title]));

/* ── Card grid render ───────────────────────────────────────── */
function renderCards(filter = 'all') {
  if (!grid) return;
  const scores = state.get('games.highScores') || {};
  grid.innerHTML = GAMES
    .filter(g => filter === 'all' || g.cat === filter)
    .map(g => `
      <a class="arcade-card arcade-card--${g.cat}" href="arcade/${g.id}.html" data-game="${g.id}">
        <span class="arcade-card__cat">${g.cat}</span>
        <span class="arcade-card__title">${g.title}</span>
        <span class="arcade-card__score">${scores[g.id] != null ? `Best: ${scores[g.id]}` : '—'}</span>
        <span class="arcade-card__cta" aria-hidden="true">Play →</span>
      </a>`)
    .join('');
}

/* ── Filter tabs ────────────────────────────────────────────── */
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    renderCards(btn.dataset.cat);
  });
});

/* ── Leaderboard (top 5 by score, with friendly title) ─────── */
function renderLeaderboard() {
  if (!lb) return;
  const scores = state.get('games.highScores') || {};
  const entries = Object.entries(scores)
    .filter(([, s]) => typeof s === 'number')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (entries.length === 0) {
    lb.innerHTML = '<li class="empty">No scores yet</li>';
    return;
  }
  lb.innerHTML = entries
    .map(([id, s]) => `<li><span>${TITLE_BY_ID[id] || id}</span><strong>${s}</strong></li>`)
    .join('');
}

/* ── Reset scores ───────────────────────────────────────────── */
resetBtn?.addEventListener('click', () => {
  if (!confirm('Reset all high scores? This cannot be undone.')) return;
  state.set('games.highScores', {});
  renderCards(document.querySelector('.arcade-filter.active')?.dataset.cat || 'all');
  renderLeaderboard();
});

/* ── Initial paint ──────────────────────────────────────────── */
renderCards();
renderLeaderboard();

/* ── Reactive: re-render when high scores change ────────────── */
state.subscribe('games.highScores', () => {
  renderCards(document.querySelector('.arcade-filter.active')?.dataset.cat || 'all');
  renderLeaderboard();
});
