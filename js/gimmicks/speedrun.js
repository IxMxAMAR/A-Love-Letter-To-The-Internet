/**
 * speedrun.js - Speed Run Timer (Layer 2 / Task 11)
 * "A Love Letter to the Web"
 * Activated by ?speedrun=true URL parameter.
 *
 * v2 categories:
 *   - any%      : main pages (index/hub/playground/components)
 *   - all-zones : hub + 8 zones
 *   - 100%      : every page including new arcade/lab/achievements/glossary/changelog
 */

import { state } from '../state.js';

const ZONES = [
  'zones/scroll-animations.html',
  'zones/popover-dialog.html',
  'zones/css-art.html',
  'zones/container-queries.html',
  'zones/view-transitions.html',
  'zones/houdini.html',
  'zones/has-selector.html',
  'zones/cascade-layers.html',
];

const CATEGORIES = {
  'any%':      { label: 'Any%',      pages: ['index.html', 'hub.html', 'playground.html', 'components.html'] },
  'all-zones': { label: 'All Zones', pages: ['hub.html', ...ZONES] },
  '100%':      { label: '100%',      pages: ['index.html', 'hub.html', 'playground.html', 'components.html', 'arcade.html', 'lab.html', 'achievements.html', 'glossary.html', 'changelog.html', ...ZONES] },
};

// Read selected category (sticky across pages via sessionStorage)
function getCategory() {
  return sessionStorage.getItem('speedrunCategory') || 'any%';
}
function setCategory(c) {
  sessionStorage.setItem('speedrunCategory', c);
  try { state.set('speedrun.current', { category: c, startedAt: Date.now() }); } catch {}
}

// Active list of pages for the chosen category
function getSpeedrunPages() {
  const cat = getCategory();
  return (CATEGORIES[cat] || CATEGORIES['any%']).pages;
}

const SPEEDRUN_PAGES = getSpeedrunPages();

// Normalize current page path relative to site root
function getCurrentPageKey() {
  // location.pathname never includes query/hash, but strip trailing slashes
  const path = location.pathname.replace(/\/+$/, '');
  const parts = path.split('/');
  const last = parts[parts.length - 1] || 'index.html';
  if (parts.includes('zones')) {
    return 'zones/' + last;
  }
  return last || 'index.html';
}

function safeParseJSON(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Init session
if (!sessionStorage.getItem('speedrunStart')) {
  sessionStorage.setItem('speedrunStart', String(Date.now()));
  sessionStorage.setItem('speedrunVisited', JSON.stringify([]));
}

// Record this page
const currentPage = getCurrentPageKey();
const visited = safeParseJSON(sessionStorage.getItem('speedrunVisited'), []);
if (!visited.includes(currentPage)) {
  visited.push(currentPage);
  sessionStorage.setItem('speedrunVisited', JSON.stringify(visited));
}

// Build timer UI
const timerEl = document.createElement('div');
timerEl.id = 'speedrun-timer';
timerEl.style.cssText = [
  'position:fixed',
  'top:12px',
  'right:12px',
  'z-index:99999',
  'padding:10px 16px',
  'background:oklch(10% 0.02 265 / 0.92)',
  'border:2px solid oklch(60% 0.18 265)',
  'border-radius:8px',
  'font-family:monospace',
  'font-size:13px',
  'color:oklch(90% 0.05 265)',
  'backdrop-filter:blur(8px)',
  'box-shadow:0 2px 16px oklch(0% 0 0 / 0.4)',
  'user-select:none',
  'min-width:160px',
  'text-align:center',
  'transition:border-color 0.4s',
].join(';');

document.body.appendChild(timerEl);

const startTime = parseInt(sessionStorage.getItem('speedrunStart'), 10);
let done = false;

// Rebuild category selector overlay (small badge near the timer)
const catBar = document.createElement('div');
catBar.id = 'speedrun-cat';
catBar.style.cssText = [
  'position:fixed',
  'top:62px',
  'right:12px',
  'z-index:99999',
  'padding:6px 10px',
  'background:oklch(10% 0.02 265 / 0.92)',
  'border:1px solid oklch(60% 0.18 265 / 0.5)',
  'border-radius:6px',
  'font-family:monospace',
  'font-size:11px',
  'color:oklch(85% 0.05 265)',
  'backdrop-filter:blur(8px)',
  'display:flex',
  'gap:6px',
  'align-items:center',
].join(';');
catBar.innerHTML = '<span style="opacity:0.7;">Cat:</span>'
  + '<select id="speedrun-cat-select" style="background:transparent;color:inherit;border:1px solid oklch(60% 0.18 265 / 0.5);border-radius:4px;padding:2px 4px;font-family:inherit;font-size:11px;">'
  + Object.keys(CATEGORIES).map(k => `<option value="${k}">${CATEGORIES[k].label}</option>`).join('')
  + '</select>';
document.body.appendChild(catBar);
const catSelect = catBar.querySelector('#speedrun-cat-select');
catSelect.value = getCategory();
catSelect.addEventListener('change', () => {
  setCategory(catSelect.value);
  // Reset session-state pages list to match new category
  sessionStorage.setItem('speedrunVisited', JSON.stringify(visited.filter(p => getSpeedrunPages().includes(p))));
});
// Persist initial category in state on first run
try { if (!state.get('speedrun.current')) state.set('speedrun.current', { category: getCategory(), startedAt: startTime }); } catch {}

function formatTime(ms) {
  const clamped = Math.max(0, ms);
  const s = Math.floor(clamped / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((clamped % 1000) / 10); // centiseconds (hundredths)
  return (m > 0 ? m + ':' : '') + String(sec).padStart(2, '0') + '.' + String(cs).padStart(2, '0');
}

function checkComplete() {
  const v = safeParseJSON(sessionStorage.getItem('speedrunVisited'), []);
  return getSpeedrunPages().every(p => v.includes(p));
}

function renderTimer() {
  const v = safeParseJSON(sessionStorage.getItem('speedrunVisited'), []);
  const elapsed = Date.now() - startTime;
  const count = v.length;
  const pages = getSpeedrunPages();
  const total = pages.length;
  const cat = getCategory();

  if (checkComplete() && !done) {
    done = true;
    timerEl.style.borderColor = 'oklch(70% 0.2 145)';
    timerEl.style.color = 'oklch(85% 0.15 145)';
    timerEl.innerHTML = '&#127942; ' + (CATEGORIES[cat]?.label || cat) + ' complete!<br><strong>' + formatTime(elapsed) + '</strong>';

    // Persist best time per category and emit completion event for achievements
    try {
      const best = state.get('speedrun.best') || {};
      if (!best[cat] || elapsed < best[cat]) {
        best[cat] = elapsed;
        state.set('speedrun.best', best);
      }
      state.set('speedrun.current', null);
      state.emit('speedrun:complete', { timeMs: elapsed, category: cat });
    } catch {}

    sessionStorage.removeItem('speedrunStart');
    sessionStorage.removeItem('speedrunVisited');
    return; // stop loop
  }

  if (!done) {
    // Show current page split (visited count) and best comparison
    let bestStr = '';
    try {
      const best = state.get('speedrun.best') || {};
      if (best[cat]) bestStr = ' · best ' + formatTime(best[cat]);
    } catch {}
    timerEl.innerHTML = '&#9654; ' + (CATEGORIES[cat]?.label || 'Speedrun') + '<br>'
      + '<strong>' + formatTime(elapsed) + '</strong><br>'
      + '<span style="font-size:11px;opacity:0.7;">' + count + ' / ' + total + ' pages' + bestStr + '</span>';
    requestAnimationFrame(renderTimer);
  }
}

requestAnimationFrame(renderTimer);

// Propagate ?speedrun=true to same-origin links only
function tagSpeedrunLink(a) {
  try {
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    url.searchParams.set('speedrun', 'true');
    a.href = url.toString();
  } catch (e) { /* ignore invalid URLs (javascript:, mailto:, etc.) */ }
}

document.querySelectorAll('a[href]').forEach(tagSpeedrunLink);

// Also intercept future DOM mutations so dynamically added links are covered
const linkObserver = new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      const links = node.tagName === 'A' ? [node] : [...node.querySelectorAll('a[href]')];
      links.forEach(tagSpeedrunLink);
    });
  });
});
linkObserver.observe(document.body, { childList: true, subtree: true });
