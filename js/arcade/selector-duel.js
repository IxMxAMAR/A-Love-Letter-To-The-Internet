import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'selector-duel';
const root = document.getElementById('game-root');

const LEVELS = [
  { dom: '<div class="card"></div><div class="card hot"></div><div class="card"></div>', target: '.hot', hint: 'Select the .hot card', accepts: ['.hot', 'div.hot', '.card.hot'] },
  { dom: '<button id="go">Go</button><button>Stop</button>', target: '#go', hint: 'Select the button with id="go"', accepts: ['#go', 'button#go', '[id="go"]'] },
  { dom: '<div><span></span><span class="x"></span><span></span></div>', target: '.x', hint: 'Select the middle span', accepts: ['.x', 'span.x', 'span:nth-child(2)'] },
  { dom: '<ul><li></li><li class="want"></li><li></li><li class="want"></li><li></li></ul>', target: '.want', hint: 'Select all .want items', accepts: ['.want', 'li.want', 'ul .want'] },
  { dom: '<a href="#"></a><a href="https://x.com"></a><a href="#" class="ext"></a>', target: '[href^="https"]', hint: 'Select links with https hrefs', accepts: ['[href^="https"]', 'a[href^="https"]'] },
  { dom: '<input type="text"><input type="email"><input type="password">', target: '[type="email"]', hint: 'Select the email input', accepts: ['[type="email"]', 'input[type="email"]'] },
  { dom: '<div><p>1</p><p>2</p><p>3</p></div>', target: 'p:first-child', hint: 'Select only the first p', accepts: ['p:first-child', 'p:nth-child(1)', 'div p:first-child'] },
  { dom: '<div><p></p><p></p><p></p><p></p></div>', target: 'p:last-child', hint: 'Select only the last p', accepts: ['p:last-child', 'div p:last-child'] },
  { dom: '<ul><li></li><li></li><li></li><li></li><li></li></ul>', target: 'li:nth-child(odd)', hint: 'Select odd li items', accepts: ['li:nth-child(odd)', 'li:nth-child(2n+1)'] },
  { dom: '<div class="card"><h2></h2><p></p></div><div class="card"><h2></h2></div>', target: '.card:has(p)', hint: 'Select cards that contain a p', accepts: ['.card:has(p)', 'div:has(p)'] },
  { dom: '<a href="#one"></a><a href="other.html"></a><a href="#two"></a>', target: '[href^="#"]', hint: 'Select hash anchors', accepts: ['[href^="#"]', 'a[href^="#"]'] },
  { dom: '<input type="checkbox"><input type="checkbox" checked><input type="checkbox">', target: ':checked', hint: 'Select the checked input', accepts: [':checked', 'input:checked', '[type="checkbox"]:checked'] },
  { dom: '<button disabled></button><button></button><button disabled></button>', target: ':disabled', hint: 'Select disabled buttons', accepts: [':disabled', 'button:disabled', 'button[disabled]'] },
  { dom: '<form><label></label><input><label></label><input></form>', target: 'label + input', hint: 'Select inputs immediately after labels', accepts: ['label + input', 'label+input'] },
  { dom: '<section><article></article><div></div><article></article></section>', target: 'section > article', hint: 'Select articles that are direct children of section', accepts: ['section > article', 'section>article'] },
  { dom: '<a href="x.pdf"></a><a href="x.html"></a><a href="y.pdf"></a>', target: '[href$=".pdf"]', hint: 'Select pdf links', accepts: ['[href$=".pdf"]', 'a[href$=".pdf"]'] },
  { dom: '<p class="text">A</p><p class="info xtra">B</p><p class="text xreg">C</p>', target: '[class*="x"]', hint: 'Select elements whose class contains "x"', accepts: ['[class*="x"]', 'p[class*="x"]'] },
  { dom: '<div><div><span></span></div></div>', target: 'div div span', hint: 'Select the deeply nested span', accepts: ['div div span', 'span'] },
  { dom: '<ul><li><a></a></li><li><a></a></li></ul>', target: 'li:not(:first-child) a', hint: 'Select link in all but first li', accepts: ['li:not(:first-child) a', 'li ~ li a'] },
  { dom: '<input required><input><input required>', target: '[required]', hint: 'Select required inputs', accepts: ['[required]', 'input[required]', 'input:required'] },
  { dom: '<div lang="en"></div><div lang="fr"></div><div lang="de"></div>', target: '[lang="fr"]', hint: 'Select French element', accepts: ['[lang="fr"]', '[lang|="fr"]'] },
  { dom: '<button class="btn primary"></button><button class="btn"></button>', target: '.btn.primary', hint: 'Select primary buttons', accepts: ['.btn.primary', 'button.btn.primary'] },
  { dom: '<div class="a b c"></div><div class="a"></div><div class="b c"></div>', target: '.a.b.c', hint: 'Select element with all three classes', accepts: ['.a.b.c', 'div.a.b.c'] },
  { dom: '<table><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>', target: 'tr:last-child td:first-child', hint: 'Bottom-left table cell', accepts: ['tr:last-child td:first-child', 'table tr:last-child td:first-child'] },
  { dom: '<details open><summary>S</summary><p>Hi</p></details>', target: 'details[open] p', hint: 'Select p inside open details', accepts: ['details[open] p', 'details p'] },
  { dom: '<div class="grid"><div></div><div></div><div></div><div></div></div>', target: '.grid > div:nth-child(2n)', hint: 'Even grid children', accepts: ['.grid > div:nth-child(2n)', '.grid > div:nth-child(even)'] },
  { dom: '<header></header><main></main><footer></footer>', target: 'main', hint: 'Select main element', accepts: ['main'] },
  { dom: '<dialog></dialog><dialog open></dialog>', target: 'dialog[open]', hint: 'Select open dialog', accepts: ['dialog[open]', 'dialog:not([open]) + dialog'] },
  { dom: '<img alt=""><img alt="cat"><img>', target: 'img[alt=""]', hint: 'Select image with empty alt attribute (decorative)', accepts: ['img[alt=""]'] },
  { dom: '<p>1</p><p>2</p><p>3</p>', target: 'p', hint: 'Select all paragraphs', accepts: ['p'] },
];

let levelIdx = 0;
let stats = { passed: 0, attempts: 0 };
state.set('selector-duel.totalLevels', LEVELS.length);

function buildUI() {
  root.innerHTML = `
    <div class="game-hud">
      <div class="game-hud__score">Level <strong id="hud-level">1</strong>/${LEVELS.length}</div>
      <div class="game-hud__highscore">Passed <strong id="hud-passed">0</strong></div>
    </div>
    <div class="duel-stage">
      <div class="duel-hint" id="duel-hint"></div>
      <div class="duel-preview" id="duel-preview"></div>
      <input id="duel-input" type="text" placeholder="Enter your selector…" autocomplete="off" spellcheck="false">
      <div class="duel-actions">
        <button id="duel-test" class="ripple">Test</button>
        <button id="duel-skip">Skip</button>
      </div>
      <div id="duel-feedback" class="duel-feedback"></div>
    </div>
  `;
}

buildUI();

const styleTag = document.createElement('style');
styleTag.textContent = `
.duel-stage { padding: 16px; display: grid; gap: 12px; }
.duel-hint { font-size: 1.05rem; color: oklch(0.85 0.18 290); padding: 8px 12px; background: oklch(0.18 0.02 280); border-radius: 8px; }
.duel-preview { padding: 16px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; min-height: 100px; }
.duel-preview * { transition: outline 200ms ease, transform 200ms ease; }
.duel-preview *.duel-target { outline: 3px dashed #fbbf24; outline-offset: 2px; }
.duel-preview *.duel-match { outline-color: oklch(0.65 0.22 290); }
.duel-preview button, .duel-preview a { padding: 6px 12px; margin: 2px; background: oklch(0.22 0.04 280); color: white; border-radius: 4px; display: inline-block; }
.duel-preview .card { padding: 12px; margin: 4px; background: oklch(0.18 0.05 280); border-radius: 8px; display: inline-block; min-width: 80px; min-height: 30px; }
.duel-preview .card.hot { background: oklch(0.5 0.2 30); }
.duel-preview ul { padding-left: 24px; }
.duel-preview input { padding: 6px; margin: 2px; }
.duel-preview details > summary { cursor: pointer; }
.duel-preview img { display: inline-block; width: 30px; height: 30px; background: oklch(0.3 0.1 200); margin: 2px; }
#duel-input { padding: 12px; font-family: var(--font-code, monospace); font-size: 1rem; background: oklch(0.18 0.02 280); color: white; border: 1px solid oklch(1 0 0 / 0.15); border-radius: 8px; }
#duel-input:focus-visible { outline: 2px solid oklch(0.75 0.2 290); }
.duel-actions { display: flex; gap: 8px; }
.duel-actions button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.duel-feedback { padding: 8px; min-height: 32px; }
.duel-feedback.ok { color: oklch(0.7 0.2 150); }
.duel-feedback.bad { color: oklch(0.7 0.22 30); }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

function loadLevel() {
  const lvl = LEVELS[levelIdx];
  document.getElementById('hud-level').textContent = levelIdx + 1;
  document.getElementById('duel-hint').textContent = lvl.hint;
  const prev = document.getElementById('duel-preview');
  prev.innerHTML = lvl.dom;
  try {
    const targets = lvl.target ? prev.querySelectorAll(lvl.target) : [];
    targets.forEach(t => t.classList.add('duel-target'));
  } catch {}
  document.getElementById('duel-input').value = '';
  document.getElementById('duel-feedback').textContent = '';
  document.getElementById('duel-feedback').className = 'duel-feedback';
}

function testSelector() {
  const lvl = LEVELS[levelIdx];
  const sel = document.getElementById('duel-input').value.trim();
  if (!sel) return;
  stats.attempts++;
  const prev = document.getElementById('duel-preview');
  prev.querySelectorAll('.duel-match').forEach(e => e.classList.remove('duel-match'));
  let match;
  try { match = prev.querySelectorAll(sel); } catch (e) {
    setFeedback('bad', `Invalid selector: ${e.message}`);
    return;
  }
  const targets = lvl.target ? prev.querySelectorAll(lvl.target) : [];
  match.forEach(m => m.classList.add('duel-match'));
  const sameSet = targets.length === match.length && Array.from(targets).every(t => Array.from(match).includes(t));
  if (sameSet || (lvl.allowAny && match.length > 0)) {
    stats.passed++;
    document.getElementById('hud-passed').textContent = stats.passed;
    playSound('chime');
    setFeedback('ok', `Match! Selector "${sel}" hit ${match.length} element${match.length === 1 ? '' : 's'}.`);
    setTimeout(nextLevel, 700);
  } else {
    playSound('error');
    setFeedback('bad', `Not quite. Selected ${match.length} element${match.length === 1 ? '' : 's'}; need to match exactly the dashed-yellow ones.`);
  }
}

function setFeedback(kind, text) {
  const fb = document.getElementById('duel-feedback');
  fb.className = `duel-feedback ${kind}`;
  fb.textContent = text;
}

function nextLevel() {
  levelIdx++;
  if (levelIdx >= LEVELS.length) {
    setHighScore(GAME_ID, stats.passed * 100);
    recordPlay(GAME_ID, { allLevels: stats.passed === LEVELS.length, score: stats.passed });
    overlay.show(`<div><h2>All ${LEVELS.length} Levels Done</h2><p>Passed: ${stats.passed}/${LEVELS.length}</p><div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
    document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; stats = { passed: 0, attempts: 0 }; document.getElementById('hud-passed').textContent = '0'; loadLevel(); });
    return;
  }
  loadLevel();
}

document.getElementById('duel-test').addEventListener('click', testSelector);
document.getElementById('duel-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') testSelector(); });
document.getElementById('duel-skip').addEventListener('click', () => { playSound('click'); nextLevel(); });

loadLevel();
