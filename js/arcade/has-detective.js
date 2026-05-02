import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'has-detective';
const root = document.getElementById('game-root');

const LEVELS = [
  { dom: '<div class="card"><h2>One</h2></div><div class="card"><h2>Two</h2><img alt=""/></div><div class="card"><h2>Three</h2></div>', target: 'div:has(img)', q: 'Which card has an image?' },
  { dom: '<section><p>A</p></section><section><p>B</p><span class="x">X</span></section><section><p>C</p></section>', target: 'section:has(.x)', q: 'Which section has the .x element?' },
  { dom: '<ul><li>A</li><li>B<a>link</a></li><li>C</li></ul><ul><li>D</li><li>E</li></ul>', target: 'ul:has(a)', q: 'Which UL has a link?' },
  { dom: '<form><input></form><form><input><button>Go</button></form><form><input></form>', target: 'form:has(button)', q: 'Which form has a button?' },
  { dom: '<article><h3>1</h3></article><article><h3>2</h3><time>now</time></article>', target: 'article:has(time)', q: 'Which article has a time element?' },
  { dom: '<div><span>A</span></div><div></div><div><span>B</span></div>', target: 'div:has(span)', q: 'Which divs have a span? (Click any one)' },
  { dom: '<details><summary>S1</summary></details><details open><summary>S2</summary><p>Open</p></details>', target: 'details[open]', q: 'Which details is open?' },
  { dom: '<button>A</button><button disabled>B</button><button>C</button>', target: 'button[disabled]', q: 'Which button is disabled?' },
  { dom: '<p class="a b">1</p><p class="a">2</p><p class="b">3</p>', target: '.a.b', q: 'Which paragraph has BOTH .a and .b?' },
  { dom: '<input required placeholder="A"><input placeholder="B"><input required placeholder="C">', target: '[required]', q: 'Which inputs are required? (Click any)' },
  { dom: '<a href="#x">A</a><a href="page.html">B</a><a href="#y">C</a>', target: '[href^="#"]', q: 'Which links are anchor links? (#)' },
  { dom: '<div class="box"></div><div class="box hot"></div><div class="box cold"></div>', target: '.hot', q: 'Which box is .hot?' },
  { dom: '<ul><li>A</li><li>B</li><li>C</li></ul>', target: 'li:last-child', q: 'Which li is the last child?' },
  { dom: '<select><option>A</option><option selected>B</option><option>C</option></select>', target: 'option[selected]', q: 'Which option is selected?' },
  { dom: '<table><tr><td class="x">A</td><td>B</td></tr><tr><td>C</td><td class="x">D</td></tr></table>', target: 'td.x', q: 'Which TDs have .x? (Click any)' },
];

let levelIdx = 0, solved = 0, livesLeft = 3;

function buildUI() {
  root.innerHTML = `
    <div class="game-hud">
      <div class="game-hud__score">Level <strong id="hud-level">1</strong>/${LEVELS.length}</div>
      <div class="game-hud__lives">Guesses <strong id="hud-guesses">3</strong></div>
      <div class="game-hud__highscore">Solved <strong id="hud-solved">0</strong></div>
    </div>
    <div class="hd-stage">
      <p class="hd-q" id="hd-q"></p>
      <div class="hd-preview" id="hd-preview"></div>
      <button id="hd-skip">Skip level</button>
      <div id="hd-feedback" class="hd-feedback"></div>
    </div>
  `;
}
buildUI();

const styleTag = document.createElement('style');
styleTag.textContent = `
.hd-stage { padding: 16px; display: grid; gap: 12px; }
.hd-q { font-size: 1.05rem; color: oklch(0.85 0.18 290); padding: 12px; background: oklch(0.18 0.02 280); border-radius: 8px; margin: 0; }
.hd-preview { padding: 16px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; min-height: 100px; color: white; }
.hd-preview * { transition: outline 200ms ease; cursor: pointer; }
.hd-preview *:hover { outline: 2px solid oklch(0.7 0.2 290); outline-offset: 2px; }
.hd-preview .hd-correct { outline: 3px solid oklch(0.7 0.2 150); outline-offset: 3px; }
.hd-preview .hd-wrong { outline: 3px solid oklch(0.7 0.22 30); outline-offset: 3px; }
.hd-preview button, .hd-preview a, .hd-preview input { padding: 6px 12px; margin: 2px; }
.hd-preview button { background: oklch(0.22 0.04 280); color: white; border: 0; border-radius: 4px; }
.hd-preview a { background: oklch(0.22 0.04 280); color: white; border-radius: 4px; display: inline-block; text-decoration: none; }
.hd-preview .card, .hd-preview .box { padding: 12px; margin: 4px; background: oklch(0.18 0.05 280); border-radius: 8px; display: inline-block; min-width: 80px; min-height: 30px; }
.hd-preview .box.hot { background: oklch(0.5 0.2 30); }
.hd-preview ul { padding-left: 24px; display: inline-block; vertical-align: top; margin: 4px; }
.hd-preview section, .hd-preview article, .hd-preview form { padding: 8px; margin: 4px; background: oklch(0.18 0.02 280); border-radius: 6px; display: inline-block; vertical-align: top; }
.hd-preview details { background: oklch(0.18 0.02 280); padding: 8px; margin: 4px; border-radius: 4px; display: inline-block; }
.hd-preview img { display: inline-block; width: 30px; height: 30px; background: oklch(0.3 0.1 200); margin: 2px; border: none; }
.hd-preview table { border-collapse: collapse; margin: 4px; }
.hd-preview td { padding: 8px 12px; border: 1px solid oklch(1 0 0 / 0.15); }
.hd-preview select { padding: 6px; margin: 2px; }
#hd-skip { padding: 8px 16px; border-radius: 6px; cursor: pointer; align-self: start; }
.hd-feedback { padding: 8px; min-height: 32px; }
.hd-feedback.ok { color: oklch(0.7 0.2 150); }
.hd-feedback.bad { color: oklch(0.7 0.22 30); }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

function loadLevel() {
  livesLeft = 3;
  document.getElementById('hud-guesses').textContent = '3';
  const lvl = LEVELS[levelIdx];
  document.getElementById('hud-level').textContent = levelIdx + 1;
  document.getElementById('hd-q').textContent = lvl.q;
  const prev = document.getElementById('hd-preview');
  prev.innerHTML = lvl.dom;
  document.getElementById('hd-feedback').textContent = '';
  document.getElementById('hd-feedback').className = 'hd-feedback';
  prev.querySelectorAll('*').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); clickTarget(el); }, { once: true });
  });
}

function clickTarget(el) {
  const lvl = LEVELS[levelIdx];
  const prev = document.getElementById('hd-preview');
  const targets = [...prev.querySelectorAll(lvl.target)];
  // Walk up from clicked element to find a target ancestor (within preview)
  let match = el;
  while (match && match !== prev && !targets.includes(match)) match = match.parentElement;
  if (match && targets.includes(match)) {
    match.classList.add('hd-correct');
    solved++;
    document.getElementById('hud-solved').textContent = solved;
    playSound('chime');
    setFeedback('ok', 'Got it!');
    setTimeout(nextLevel, 700);
  } else {
    el.classList.add('hd-wrong');
    livesLeft--;
    document.getElementById('hud-guesses').textContent = livesLeft;
    playSound('error');
    if (livesLeft <= 0) return gameOver();
    setFeedback('bad', `Nope. ${livesLeft} guess${livesLeft === 1 ? '' : 'es'} left.`);
  }
}

function setFeedback(kind, text) {
  const fb = document.getElementById('hd-feedback');
  fb.className = `hd-feedback ${kind}`;
  fb.textContent = text;
}

function nextLevel() {
  levelIdx++;
  if (levelIdx >= LEVELS.length) return win();
  loadLevel();
}

function win() {
  setHighScore(GAME_ID, solved * 100);
  recordPlay(GAME_ID, { allLevels: solved === LEVELS.length, score: solved });
  overlay.show(`<div><h2>Case Closed!</h2><p>Solved ${solved} of ${LEVELS.length}.</p><div class="game-overlay__buttons"><button id="restart">Reopen file</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; solved = 0; livesLeft = 3; document.getElementById('hud-solved').textContent = '0'; loadLevel(); });
}

function gameOver() {
  setHighScore(GAME_ID, solved * 100);
  recordPlay(GAME_ID);
  overlay.show(`<div><h2>Case Cold</h2><p>Solved ${solved} of ${LEVELS.length}.</p><div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; solved = 0; livesLeft = 3; document.getElementById('hud-solved').textContent = '0'; loadLevel(); });
}

document.getElementById('hd-skip').addEventListener('click', () => { playSound('click'); nextLevel(); });

loadLevel();
