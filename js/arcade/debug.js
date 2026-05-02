import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'debug';
const root = document.getElementById('game-root');

// Each level: HTML body + CSS rules array. The buggy line index is the answer.
const LEVELS = [
  { html: '<button class="btn">Click me</button>', css: ['.btn { padding: 10px; }', '.btn { color: red; }', '.btn { color color: blue; }', '.btn { background: white; }'], bug: 2, hint: 'Look for a duplicated property name' },
  { html: '<div class="card">Card</div>', css: ['.card { width: 200px; }', '.card { height: 100p; }', '.card { background: #a78bfa; }'], bug: 1, hint: 'Check the unit suffix' },
  { html: '<p class="text">Hi</p>', css: ['.text { font-size: 16; }', '.text { color: blue; }'], bug: 0, hint: 'Missing unit on font-size' },
  { html: '<div class="box">Hi</div>', css: ['.box { display: flex; }', '.box { justify-content: centerr; }', '.box { align-items: center; }'], bug: 1, hint: 'Typo in a value' },
  { html: '<a class="link">Link</a>', css: ['.link { color: ; }', '.link { text-decoration: none; }'], bug: 0, hint: 'Empty value' },
  { html: '<div class="x">x</div>', css: ['.x { background: rgb(255, 0); }', '.x { padding: 12px; }'], bug: 0, hint: 'rgb() needs three arguments' },
  { html: '<button class="btn">B</button>', css: ['.btn { border-radius: 8px }', '.btn { color: white; }'], bug: 0, hint: 'Missing semicolon' },
  { html: '<p>Hi</p>', css: ['p { font-weight: bolder; }', 'p { font-style: italics; }'], bug: 1, hint: 'Wrong keyword' },
  { html: '<div class="g">G</div>', css: ['.g { display: grid; }', '.g { grid-template-columns: 1fr 1fr 1fr; }', '.g { grid-template-rows: auto auto'], bug: 2, hint: 'Unclosed declaration' },
  { html: '<div class="card">.</div>', css: ['.card { border: 1px solid; }', '.card { box-shadow: 0 4px 8px rgba(0,0,0,.4); }', '.card { transform: translate(10); }'], bug: 2, hint: 'translate() needs units or two values' },
  { html: '<input class="i">', css: ['.i { width: 100%; }', '.i { padding: 10x; }'], bug: 1, hint: 'Invalid unit' },
  { html: '<div>Box</div>', css: ['div { background: linear-gradient(45, red, blue); }', 'div { padding: 10px; }'], bug: 0, hint: 'Gradient angle missing unit' },
  { html: '<span>S</span>', css: ['span { color: #zzzzzz; }', 'span { font-size: 1rem; }'], bug: 0, hint: 'Invalid hex digits' },
  { html: '<div>X</div>', css: ['div { margin: 10px 20px 30px; 40px; }', 'div { color: red; }'], bug: 0, hint: 'Stray semicolon in shorthand' },
  { html: '<button>B</button>', css: ['button { transition: 200ms color all; }', 'button { color: red; }'], bug: 0, hint: 'Bad transition order' },
  { html: '<div class="c">.</div>', css: ['.c { animation: name 2s; }', '.c { animation-iteration-count: forevers; }'], bug: 1, hint: 'Wrong iteration value' },
  { html: '<p>Hi</p>', css: ['p { color: oklch(120% 0.1 290); }', 'p { font-size: 16px; }'], bug: 0, hint: 'Lightness > 100%' },
  { html: '<div>D</div>', css: ['div { transform: rotate(); }', 'div { background: red; }'], bug: 0, hint: 'rotate() needs an angle' },
  { html: '<div class="b">B</div>', css: ['.b { width: 200px; }', '.b { height: 100px; }', '.b { backgroound: red; }'], bug: 2, hint: 'Property typo' },
  { html: '<a>L</a>', css: ['a { text-decoration: under-line; }', 'a { color: blue; }'], bug: 0, hint: 'Wrong keyword format' },
  { html: '<div>X</div>', css: ['div { display: flex flexbox; }', 'div { gap: 8px; }'], bug: 0, hint: 'Two values in display' },
  { html: '<p>P</p>', css: ['p { line-height: 1.5px; }', 'p { letter-spacing: 0.5em; }'], bug: 0, hint: 'line-height shouldn\'t use px for ratio' },
  { html: '<div>D</div>', css: ['div { z-index: top; }', 'div { position: absolute; }'], bug: 0, hint: 'z-index needs a number' },
  { html: '<button>B</button>', css: ['button { cursor: hover; }', 'button { background: blue; }'], bug: 0, hint: 'Wrong cursor keyword' },
  { html: '<div>D</div>', css: ['div { font-family: "MyFont, Arial; }', 'div { font-size: 14px; }'], bug: 0, hint: 'Unclosed quote' },
];

let levelIdx = 0; let fixed = 0;

root.innerHTML = `
  <div class="game-hud">
    <div class="game-hud__score">Bug <strong id="hud-bug">1</strong>/${LEVELS.length}</div>
    <div class="game-hud__highscore">Fixed <strong id="hud-fixed">0</strong></div>
  </div>
  <div class="db-stage">
    <div class="db-row">
      <div class="db-frame">
        <h4>Output (broken)</h4>
        <div class="db-preview" id="db-preview"></div>
      </div>
      <div class="db-frame">
        <h4>Click the bad line</h4>
        <pre class="db-css" id="db-css"></pre>
      </div>
    </div>
    <p class="db-hint" id="db-hint"></p>
    <button id="db-skip">Skip</button>
    <div id="db-feedback" class="db-feedback"></div>
  </div>
  <a href="../arcade.html" class="game-back">← Back to arcade</a>
`;

const styleTag = document.createElement('style');
styleTag.textContent = `
.db-stage { padding: 16px; display: grid; gap: 12px; }
.db-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.db-frame h4 { margin: 0 0 8px; font-size: 0.85rem; opacity: 0.7; }
.db-preview { padding: 16px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; min-height: 100px; display: grid; place-items: center; }
.db-css { padding: 16px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; font-family: var(--font-code, monospace); font-size: 0.85rem; line-height: 1.6; min-height: 100px; margin: 0; }
.db-css .db-line { display: block; padding: 2px 6px; cursor: pointer; border-radius: 4px; transition: background 150ms ease; }
.db-css .db-line:hover { background: oklch(1 0 0 / 0.05); }
.db-css .db-line.db-correct { background: oklch(0.65 0.22 150 / 0.3); }
.db-css .db-line.db-wrong { background: oklch(0.65 0.22 30 / 0.3); }
.db-hint { font-size: 0.85rem; opacity: 0.7; padding: 6px 10px; background: oklch(0.18 0.02 280); border-radius: 6px; }
#db-skip { padding: 8px 16px; border-radius: 6px; cursor: pointer; align-self: start; width: fit-content; }
.db-feedback { padding: 8px; min-height: 32px; }
.db-feedback.ok { color: oklch(0.7 0.2 150); }
.db-feedback.bad { color: oklch(0.7 0.22 30); }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

function loadLevel() {
  const lvl = LEVELS[levelIdx];
  document.getElementById('hud-bug').textContent = levelIdx + 1;
  document.getElementById('db-preview').innerHTML = lvl.html;
  // Apply the (broken) CSS — most won't render meaningfully, that's the point
  // Scope rules to #db-preview so they don't leak globally
  const styleEl = document.createElement('style');
  styleEl.textContent = lvl.css.map(rule => {
    // Only prefix if rule has a parseable selector (rules with errors may not parse cleanly)
    const m = rule.match(/^([^{]+)\{(.*)\}$/s);
    if (m) return `#db-preview ${m[1].trim()} { ${m[2].trim()} }`;
    return rule;
  }).join('\n');
  document.getElementById('db-preview').appendChild(styleEl);
  // Render CSS as clickable lines
  const cssEl = document.getElementById('db-css');
  cssEl.innerHTML = '';
  lvl.css.forEach((line, i) => {
    const span = document.createElement('span');
    span.className = 'db-line';
    span.textContent = line;
    span.dataset.idx = i;
    span.addEventListener('click', () => clickLine(span, i));
    cssEl.appendChild(span);
  });
  document.getElementById('db-hint').textContent = lvl.hint;
  document.getElementById('db-feedback').textContent = '';
}

function clickLine(span, i) {
  const lvl = LEVELS[levelIdx];
  if (i === lvl.bug) {
    span.classList.add('db-correct');
    fixed++;
    document.getElementById('hud-fixed').textContent = fixed;
    playSound('chime');
    setFeedback('ok', 'Bug squashed!');
    setTimeout(nextLevel, 700);
  } else {
    span.classList.add('db-wrong');
    playSound('error');
    setFeedback('bad', 'That line is fine — try another.');
  }
}

function setFeedback(kind, text) {
  const fb = document.getElementById('db-feedback');
  fb.className = `db-feedback ${kind}`;
  fb.textContent = text;
}

function nextLevel() {
  levelIdx++;
  if (levelIdx >= LEVELS.length) {
    setHighScore(GAME_ID, fixed * 100);
    recordPlay(GAME_ID, { allBugs: fixed === LEVELS.length, score: fixed });
    overlay.show(`<div><h2>All Bugs Squashed</h2><p>Fixed ${fixed}/${LEVELS.length}</p>${fixed === LEVELS.length ? '<p>🐛 Bug Squasher achievement!</p>' : ''}<div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
    document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; fixed = 0; document.getElementById('hud-fixed').textContent = '0'; loadLevel(); });
    return;
  }
  loadLevel();
}

document.getElementById('db-skip').addEventListener('click', () => { playSound('click'); nextLevel(); });

loadLevel();
