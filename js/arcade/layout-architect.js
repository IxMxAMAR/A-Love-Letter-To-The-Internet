import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'layout-architect';
const root = document.getElementById('game-root');

const LEVELS = [
  // Each level: { name, items: int (number of colored boxes), target: {display, flexDirection, justifyContent, alignItems, flexWrap, gap} }
  { name: 'Row centered',     items: 3, target: { display:'flex', flexDirection:'row',           justifyContent:'center',        alignItems:'center', flexWrap:'nowrap', gap: 8  } },
  { name: 'Column right',     items: 3, target: { display:'flex', flexDirection:'column',        justifyContent:'flex-start',    alignItems:'flex-end', flexWrap:'nowrap', gap: 4 } },
  { name: 'Spaced row',       items: 4, target: { display:'flex', flexDirection:'row',           justifyContent:'space-between', alignItems:'center', flexWrap:'nowrap', gap: 0 } },
  { name: 'Wrap grid',        items: 6, target: { display:'flex', flexDirection:'row',           justifyContent:'flex-start',    alignItems:'flex-start', flexWrap:'wrap', gap: 12 } },
  { name: 'Reverse stack',    items: 3, target: { display:'flex', flexDirection:'column-reverse',justifyContent:'flex-start',    alignItems:'center', flexWrap:'nowrap', gap: 0 } },
  { name: 'Around row',       items: 4, target: { display:'flex', flexDirection:'row',           justifyContent:'space-around',  alignItems:'center', flexWrap:'nowrap', gap: 0 } },
  { name: 'Centered column',  items: 5, target: { display:'flex', flexDirection:'column',        justifyContent:'center',        alignItems:'center', flexWrap:'nowrap', gap: 8 } },
  { name: 'Wrapped reverse',  items: 8, target: { display:'flex', flexDirection:'row-reverse',   justifyContent:'flex-start',    alignItems:'center', flexWrap:'wrap', gap: 8 } },
];

let levelIdx = 0;
let levelStars = []; // per-level star count
let current = { display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'flex-start', flexWrap:'nowrap', gap: 0 };

function buildUI() {
  root.innerHTML = `
    <div class="game-hud">
      <div class="game-hud__score">Level <strong id="hud-level">1</strong>/${LEVELS.length}</div>
      <div class="game-hud__highscore">Stars <strong id="hud-stars">0</strong></div>
    </div>
    <div class="la-stage">
      <h3 id="la-name"></h3>
      <div class="la-row">
        <div class="la-frame">
          <h4>Target</h4>
          <div class="la-target" id="la-target"></div>
        </div>
        <div class="la-frame">
          <h4>Yours</h4>
          <div class="la-current" id="la-current"></div>
        </div>
      </div>
      <div class="la-controls">
        <label>display
          <select id="ctl-display"><option>flex</option><option>grid</option><option>block</option><option>inline-block</option></select>
        </label>
        <label>flex-direction
          <select id="ctl-fd"><option>row</option><option>row-reverse</option><option>column</option><option>column-reverse</option></select>
        </label>
        <label>justify-content
          <select id="ctl-jc"><option>flex-start</option><option>flex-end</option><option>center</option><option>space-between</option><option>space-around</option><option>space-evenly</option></select>
        </label>
        <label>align-items
          <select id="ctl-ai"><option>flex-start</option><option>flex-end</option><option>center</option><option>stretch</option><option>baseline</option></select>
        </label>
        <label>flex-wrap
          <select id="ctl-fw"><option>nowrap</option><option>wrap</option><option>wrap-reverse</option></select>
        </label>
        <label>gap
          <input type="range" id="ctl-gap" min="0" max="24" value="0"><span class="ctl-val" data-for="ctl-gap">0</span>px
        </label>
      </div>
      <div class="la-actions">
        <button id="la-test" class="ripple">Match!</button>
        <button id="la-skip">Skip</button>
      </div>
      <div id="la-feedback" class="la-feedback"></div>
    </div>
  `;
}
buildUI();

const styleTag = document.createElement('style');
styleTag.textContent = `
.la-stage { padding: 16px; display: grid; gap: 12px; }
.la-stage h3 { margin: 0; color: oklch(0.85 0.18 290); }
.la-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.la-frame h4 { margin: 0 0 8px; font-size: 0.85rem; opacity: 0.7; }
.la-target, .la-current { padding: 16px; min-height: 120px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; }
.la-target .la-item, .la-current .la-item { width: 56px; height: 56px; border-radius: 4px; }
.la-controls { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 12px; background: oklch(0.18 0.02 280); border-radius: 8px; }
.la-controls label { display: grid; grid-template-columns: 110px 1fr auto; gap: 8px; align-items: center; font-size: 0.85rem; }
.la-controls select, .la-controls input { padding: 4px 8px; background: oklch(0.22 0.04 280); color: white; border: 1px solid oklch(1 0 0 / 0.1); border-radius: 4px; }
.ctl-val { font-family: var(--font-code, monospace); font-size: 0.8rem; color: oklch(0.7 0.18 290); min-width: 24px; text-align: right; }
.la-actions { display: flex; gap: 8px; }
.la-actions button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.la-feedback { padding: 8px; min-height: 32px; }
.la-feedback.ok { color: oklch(0.7 0.2 150); }
.la-feedback.bad { color: oklch(0.7 0.22 30); }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

const COLORS = ['#a78bfa','#f472b6','#34d399','#fbbf24','#06b6d4','#f97316','#ef4444','#a78bfa'];

function applyStyle(container, style, count) {
  container.style.display = style.display;
  container.style.flexDirection = style.flexDirection;
  container.style.justifyContent = style.justifyContent;
  container.style.alignItems = style.alignItems;
  container.style.flexWrap = style.flexWrap;
  container.style.gap = (style.gap || 0) + 'px';
  container.style.width = '100%';
  container.style.minHeight = '120px';
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'la-item';
    d.style.background = COLORS[i % COLORS.length];
    container.appendChild(d);
  }
}

function loadLevel() {
  const lvl = LEVELS[levelIdx];
  document.getElementById('hud-level').textContent = levelIdx + 1;
  document.getElementById('la-name').textContent = lvl.name;
  applyStyle(document.getElementById('la-target'), lvl.target, lvl.items);
  // Reset current to defaults
  current = { display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'flex-start', flexWrap:'nowrap', gap: 0 };
  document.getElementById('ctl-display').value = current.display;
  document.getElementById('ctl-fd').value = current.flexDirection;
  document.getElementById('ctl-jc').value = current.justifyContent;
  document.getElementById('ctl-ai').value = current.alignItems;
  document.getElementById('ctl-fw').value = current.flexWrap;
  document.getElementById('ctl-gap').value = current.gap;
  document.querySelector('.ctl-val[data-for="ctl-gap"]').textContent = current.gap;
  applyStyle(document.getElementById('la-current'), current, lvl.items);
  document.getElementById('la-feedback').textContent = '';
}

['ctl-display','ctl-fd','ctl-jc','ctl-ai','ctl-fw'].forEach(id => {
  const map = { 'ctl-display':'display','ctl-fd':'flexDirection','ctl-jc':'justifyContent','ctl-ai':'alignItems','ctl-fw':'flexWrap' };
  document.getElementById(id).addEventListener('change', (e) => {
    current[map[id]] = e.target.value;
    applyStyle(document.getElementById('la-current'), current, LEVELS[levelIdx].items);
  });
});
document.getElementById('ctl-gap').addEventListener('input', (e) => {
  current.gap = Number(e.target.value);
  document.querySelector('.ctl-val[data-for="ctl-gap"]').textContent = current.gap;
  applyStyle(document.getElementById('la-current'), current, LEVELS[levelIdx].items);
});

function score() {
  const t = LEVELS[levelIdx].target;
  let exact = 0;
  const keys = ['display','flexDirection','justifyContent','alignItems','flexWrap'];
  keys.forEach(k => { if (current[k] === t[k]) exact++; });
  // Gap: tolerate ±2
  const gapClose = Math.abs(current.gap - t.gap) <= 2 ? 1 : 0;
  exact += gapClose;
  const total = keys.length + 1;
  const pct = exact / total;
  if (pct === 1) return 3;
  if (pct >= 0.75) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

function setFeedback(kind, text) {
  const fb = document.getElementById('la-feedback');
  fb.className = `la-feedback ${kind}`;
  fb.textContent = text;
}

function nextLevel(stars) {
  levelStars[levelIdx] = stars;
  document.getElementById('hud-stars').textContent = levelStars.reduce((a, b) => a + b, 0);
  levelIdx++;
  if (levelIdx >= LEVELS.length) {
    const totalStars = levelStars.reduce((a, b) => a + b, 0);
    const allThreeStar = levelStars.every(s => s === 3);
    setHighScore(GAME_ID, totalStars * 100);
    if (totalStars > 0) recordPlay(GAME_ID, { allThreeStar, score: totalStars });
    overlay.show(`<div><h2>Architecture Complete</h2><p>Stars: ${totalStars}/${LEVELS.length * 3}</p>${allThreeStar ? '<p>🌟 Perfect run!</p>' : ''}<div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
    document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; levelStars = []; document.getElementById('hud-stars').textContent = '0'; loadLevel(); });
    return;
  }
  loadLevel();
}

document.getElementById('la-test').addEventListener('click', () => {
  const stars = score();
  if (stars >= 1) {
    playSound('chime');
    setFeedback('ok', `${'⭐'.repeat(stars)} ${stars}/3 — next level…`);
    setTimeout(() => nextLevel(stars), 800);
  } else {
    playSound('error');
    setFeedback('bad', 'Not close enough — try adjusting more controls.');
  }
});
document.getElementById('la-skip').addEventListener('click', () => { playSound('click'); nextLevel(0); });

loadLevel();
