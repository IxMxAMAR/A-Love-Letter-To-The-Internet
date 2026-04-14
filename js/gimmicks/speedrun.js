/**
 * speedrun.js - Speed Run Timer
 * "A Love Letter to the Web"
 * Activated by ?speedrun=true URL parameter
 */

// NOTE: Update this list when adding new pages to the site.
// Layer 2 expansion will add: arcade.html, lab.html, achievements.html, glossary.html, changelog.html
// Speedrun categories (any%, all-zones, 100%) will be added in Layer 2.
const SPEEDRUN_PAGES = [
  'index.html',
  'hub.html',
  'zones/scroll-animations.html',
  'zones/popover-dialog.html',
  'zones/css-art.html',
  'zones/container-queries.html',
  'zones/view-transitions.html',
  'zones/houdini.html',
  'zones/has-selector.html',
  'zones/cascade-layers.html',
  'playground.html',
  'components.html',
];

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
const total = SPEEDRUN_PAGES.length;
let done = false;

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
  return SPEEDRUN_PAGES.every(p => v.includes(p));
}

function renderTimer() {
  const v = safeParseJSON(sessionStorage.getItem('speedrunVisited'), []);
  const elapsed = Date.now() - startTime;
  const count = v.length;

  if (checkComplete() && !done) {
    done = true;
    timerEl.style.borderColor = 'oklch(70% 0.2 145)';
    timerEl.style.color = 'oklch(85% 0.15 145)';
    timerEl.innerHTML = '&#127942; Speedrun complete!<br><strong>' + formatTime(elapsed) + '</strong>';
    sessionStorage.removeItem('speedrunStart');
    sessionStorage.removeItem('speedrunVisited');
    return; // stop loop
  }

  if (!done) {
    timerEl.innerHTML = '&#9654; Speedrun<br>'
      + '<strong>' + formatTime(elapsed) + '</strong><br>'
      + '<span style="font-size:11px;opacity:0.7;">' + count + ' / ' + total + ' pages</span>';
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
