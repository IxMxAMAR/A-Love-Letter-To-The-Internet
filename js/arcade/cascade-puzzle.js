import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'cascade-puzzle';
const root = document.getElementById('game-root');

// Level format: rules in display order (initial), the desired correctOrder, and a small DOM snippet to render.
// The "target" preview is rendered with rules in correctOrder; the "current" preview is rendered with the user's current order.
const LEVELS = [
  {
    rules: [
      '.box { background: red; }',
      '.box { background: green; }',
      '.box { background: rgb(167, 139, 250); }',
      '.box { background: blue; }',
    ],
    correctOrder: [0, 1, 3, 2],
    domHtml: '<div class="box">Box</div>',
    hint: 'Make the box purple (#a78bfa). Equal specificity — last rule wins.',
  },
  {
    rules: [
      'p { color: red; }',
      'p { color: orange; }',
      'p { color: blue; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<p>Hello</p>',
    hint: 'Make the text orange. Same specificity — order matters!',
  },
  {
    rules: [
      'p { font-weight: 400; }',
      'p { font-weight: 700; }',
    ],
    correctOrder: [0, 1],
    domHtml: '<p>Bold me</p>',
    hint: 'Make text bold. Last rule wins.',
  },
  {
    rules: [
      '.box { border-radius: 0; }',
      '.box { border-radius: 50%; }',
      '.box { border-radius: 8px; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<div class="box cp-fill-purple" style="width:60px;height:60px">.</div>',
    hint: 'Make the box a circle.',
  },
  {
    rules: [
      'div { opacity: 1; }',
      'div { opacity: 0.5; }',
      'div { opacity: 0.2; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<div class="cp-fill-purple" style="width:80px;height:40px">.</div>',
    hint: 'Make it half-transparent.',
  },
  {
    rules: [
      '.x { transform: translateY(0); }',
      '.x { transform: translateY(-10px); }',
    ],
    correctOrder: [0, 1],
    domHtml: '<div class="x cp-fill-green" style="width:60px;height:60px">.</div>',
    hint: 'Lift the box up 10px.',
  },
  {
    rules: [
      'span { text-decoration: none; }',
      'span { text-decoration: line-through; }',
    ],
    correctOrder: [0, 1],
    domHtml: '<span>strike me</span>',
    hint: 'Strike through the text.',
  },
  {
    rules: [
      '.b { padding: 8px; }',
      '.b { padding: 32px; }',
      '.b { padding: 16px; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<div class="b cp-fill-pink cp-inline">.</div>',
    hint: 'Make padding 32px (the largest).',
  },
  {
    rules: [
      '.box { background: #34d399; }',
      '.box { background: #f472b6; }',
      '.box { background: #fbbf24; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<div class="box" style="width:60px;height:60px">.</div>',
    hint: 'Make the box pink.',
  },
  {
    rules: [
      '.r { rotate: 0deg; }',
      '.r { rotate: 90deg; }',
      '.r { rotate: 45deg; }',
    ],
    correctOrder: [0, 1, 2],
    domHtml: '<div class="r cp-fill-cyan" style="width:40px;height:40px">.</div>',
    hint: 'Rotate 45° (final value).',
  },
  {
    rules: [
      '.x { border: 1px solid white; }',
      '.x { border: 4px solid white; }',
      '.x { border: 2px solid white; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<div class="x cp-fill-purple" style="width:40px;height:40px">.</div>',
    hint: 'Make the border 4px.',
  },
  {
    rules: [
      'p { font-size: 12px; }',
      'p { font-size: 24px; }',
      'p { font-size: 18px; }',
    ],
    correctOrder: [0, 2, 1],
    domHtml: '<p>scaled text</p>',
    hint: 'Make text 24px.',
  },
];

let levelIdx = 0;
let solved = 0;
state.set('cascade-puzzle.totalLevels', LEVELS.length);

function buildUI() {
  root.innerHTML = `
    <div class="game-hud">
      <div class="game-hud__score">Level <strong id="hud-level">1</strong>/${LEVELS.length}</div>
      <div class="game-hud__highscore">Solved <strong id="hud-solved">0</strong></div>
    </div>
    <div class="cp-stage">
      <div class="cp-hint" id="cp-hint"></div>
      <div class="cp-preview-row">
        <div class="cp-target">
          <h4>Target</h4>
          <div class="cp-target-frame" id="cp-target"></div>
        </div>
        <div class="cp-current">
          <h4>Current</h4>
          <div class="cp-current-frame" id="cp-current"></div>
        </div>
      </div>
      <h4 class="cp-instructions">Drag rules to reorder. Last matching rule with equal specificity wins.</h4>
      <ul class="cp-rules" id="cp-rules"></ul>
      <div class="cp-actions">
        <button id="cp-test" class="ripple">Test</button>
        <button id="cp-skip">Skip</button>
      </div>
      <div id="cp-feedback" class="cp-feedback"></div>
    </div>
  `;
}
buildUI();

const styleTag = document.createElement('style');
styleTag.textContent = `
.cp-stage { padding: 16px; display: grid; gap: 12px; }
.cp-hint { font-size: 1.05rem; color: oklch(0.85 0.18 290); padding: 8px 12px; background: oklch(0.18 0.02 280); border-radius: 8px; }
.cp-preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cp-target h4, .cp-current h4 { margin: 0 0 8px; font-size: 0.85rem; opacity: 0.7; }
.cp-target-frame, .cp-current-frame { padding: 16px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; min-height: 120px; display: grid; place-items: center; color: white; }
.cp-instructions { margin: 0; font-size: 0.85rem; opacity: 0.75; font-weight: 400; }
.cp-rules { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.cp-rules li { padding: 8px 12px; background: oklch(0.22 0.04 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 6px; font-family: var(--font-code, monospace); font-size: 0.85rem; cursor: grab; color: white; }
.cp-rules li:active { cursor: grabbing; }
.cp-rules li.dragging { opacity: 0.5; }
.cp-actions { display: flex; gap: 8px; }
.cp-actions button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.cp-feedback { padding: 8px; min-height: 32px; }
.cp-feedback.ok { color: oklch(0.7 0.2 150); }
.cp-feedback.bad { color: oklch(0.7 0.22 30); }
.cp-fill-purple { background: #a78bfa; }
.cp-fill-green { background: #34d399; }
.cp-fill-pink { background: #f472b6; }
.cp-fill-cyan { background: #06b6d4; }
.cp-inline { display: inline-block; min-width: 40px; min-height: 40px; }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

// Keep per-frame style elements managed in <head>, scoped via a unique id on the container.
function ensureScopeStyle(containerId) {
  let style = document.getElementById(`cp-style-${containerId}`);
  if (!style) {
    style = document.createElement('style');
    style.id = `cp-style-${containerId}`;
    document.head.appendChild(style);
  }
  return style;
}

// Scope a single CSS rule like "selector { body }" by prefixing the selector list with `#containerId`.
function scopeRule(rule, containerId) {
  const m = rule.match(/^\s*([^{]+)\{([^}]*)\}\s*$/);
  if (!m) return '';
  const selectors = m[1].split(',').map(s => `#${containerId} ${s.trim()}`).join(', ');
  return `${selectors} { ${m[2].trim()} }`;
}

function renderPreview(containerId, domHtml, rules, order) {
  const c = document.getElementById(containerId);
  c.innerHTML = domHtml;
  const cssText = order.map(i => scopeRule(rules[i], containerId)).join('\n');
  ensureScopeStyle(containerId).textContent = cssText;
}

function loadLevel() {
  const lvl = LEVELS[levelIdx];
  document.getElementById('hud-level').textContent = levelIdx + 1;
  document.getElementById('cp-hint').textContent = lvl.hint;

  // Target preview: render with rules in correctOrder
  renderPreview('cp-target', lvl.domHtml, lvl.rules, lvl.correctOrder);
  // Current preview: rules in initial display order (0..n-1)
  renderPreview('cp-current', lvl.domHtml, lvl.rules, lvl.rules.map((_, i) => i));

  const rulesEl = document.getElementById('cp-rules');
  rulesEl.innerHTML = '';
  lvl.rules.forEach((r, i) => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.idx = i;
    li.textContent = r;
    rulesEl.appendChild(li);
  });
  attachDragHandlers(rulesEl);

  const fb = document.getElementById('cp-feedback');
  fb.textContent = '';
  fb.className = 'cp-feedback';
}

function attachDragHandlers(ul) {
  let dragging;
  ul.addEventListener('dragstart', (e) => {
    dragging = e.target.closest('li'); if (!dragging) return;
    dragging.classList.add('dragging');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  });
  ul.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragging) return;
    const after = [...ul.children].find(c => !c.classList.contains('dragging') && e.clientY < c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2);
    if (after) ul.insertBefore(dragging, after); else ul.appendChild(dragging);
  });
  ul.addEventListener('dragend', () => { dragging?.classList.remove('dragging'); dragging = null; });
}

function testOrder() {
  const lvl = LEVELS[levelIdx];
  const order = [...document.getElementById('cp-rules').children].map(li => Number(li.dataset.idx));
  renderPreview('cp-current', lvl.domHtml, lvl.rules, order);
  setTimeout(() => {
    const target = document.querySelector('#cp-target');
    const current = document.querySelector('#cp-current');
    const tEls = target.querySelectorAll('*');
    const cEls = current.querySelectorAll('*');
    if (tEls.length !== cEls.length) return setFeedback('bad', 'DOM mismatch — should not happen.');
    let same = true;
    const props = ['color', 'background-color', 'font-weight', 'font-size', 'border-radius', 'opacity', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'transform', 'rotate', 'text-decoration-line', 'border-top-width'];
    for (let i = 0; i < tEls.length; i++) {
      const ts = getComputedStyle(tEls[i]);
      const cs = getComputedStyle(cEls[i]);
      for (const prop of props) {
        if (ts[prop] !== cs[prop]) { same = false; break; }
      }
      if (!same) break;
    }
    if (same) {
      solved++;
      document.getElementById('hud-solved').textContent = solved;
      playSound('chime');
      setFeedback('ok', 'Cascade matched! Next level…');
      setTimeout(nextLevel, 700);
    } else {
      playSound('error');
      setFeedback('bad', 'Not quite — try a different order.');
    }
  }, 50);
}

function setFeedback(kind, text) {
  const fb = document.getElementById('cp-feedback');
  fb.className = `cp-feedback ${kind}`;
  fb.textContent = text;
}

function nextLevel() {
  levelIdx++;
  if (levelIdx >= LEVELS.length) {
    setHighScore(GAME_ID, solved * 100);
    recordPlay(GAME_ID, { allLevels: solved === LEVELS.length, score: solved });
    overlay.show(`<div><h2>Cascade Mastered!</h2><p>Solved: ${solved}/${LEVELS.length}</p><div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
    document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; solved = 0; document.getElementById('hud-solved').textContent = '0'; loadLevel(); });
    return;
  }
  loadLevel();
}

document.getElementById('cp-test').addEventListener('click', testOrder);
document.getElementById('cp-skip').addEventListener('click', () => { playSound('click'); nextLevel(); });

loadLevel();
