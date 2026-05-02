import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'boss-rush';
const root = document.getElementById('game-root');

const BOSSES = [
  {
    name: 'Specificity',
    questions: [
      { q: 'Which selector has higher specificity?', options: ['.btn.primary', '#main button'], correct: 1 },
      { q: 'Which wins?', options: ['div span', 'span.x'], correct: 1 },
      { q: 'Which beats !important by source order?', options: ['Same selector, later', 'A more specific !important'], correct: 1 },
      { q: 'Which has highest specificity?', options: ['inline style', 'id selector'], correct: 0 },
      { q: 'Universal selector specificity?', options: ['1', '0'], correct: 1 },
    ],
  },
  {
    name: 'Cascade',
    questions: [
      { q: 'Same specificity. Last rule defines color: red, first defines color: blue. What renders?', options: ['red', 'blue'], correct: 0 },
      { q: '@layer base sets color: red, then unlayered sets color: blue. Result?', options: ['red', 'blue'], correct: 1 },
      { q: 'Author !important vs user !important. Which wins?', options: ['author', 'user'], correct: 1 },
      { q: 'Animation property mid-run vs declared style. Which renders?', options: ['Animation value', 'Declared'], correct: 0 },
      { q: 'Inherited color vs directly applied color: inherit. Which wins?', options: ['Inherit (uses parent)', 'Closer applied non-inherit'], correct: 1 },
    ],
  },
  {
    name: 'Box Model',
    questions: [
      { q: 'Element 100×100, content too tall, scrollbar appears. Fix?', options: ['overflow: hidden', 'min-height: auto'], correct: 0 },
      { q: 'Element wider than parent. What box-sizing is set?', options: ['content-box', 'border-box'], correct: 0 },
      { q: 'Margin collapsing between two siblings. How to prevent?', options: ['Add padding', 'Add a flex container'], correct: 1 },
      { q: 'Want padding to NOT add to width. Set box-sizing to?', options: ['content-box', 'border-box'], correct: 1 },
      { q: 'Element\'s outline appears too close. Property?', options: ['outline-offset', 'outline-padding'], correct: 0 },
    ],
  },
  {
    name: 'Easing',
    questions: [
      { q: 'Want fast start, slow end. Easing?', options: ['ease-in', 'ease-out'], correct: 1 },
      { q: 'Bounce overshoot effect. Easing?', options: ['cubic-bezier(.68,-.55,.27,1.55)', 'linear'], correct: 0 },
      { q: 'Constant speed. Easing?', options: ['linear', 'ease'], correct: 0 },
      { q: 'Slow start, fast end. Easing?', options: ['ease-out', 'ease-in'], correct: 1 },
      { q: 'Steps for typing animation. Function?', options: ['steps(N, end)', 'cubic-bezier(0,0,1,1)'], correct: 0 },
    ],
  },
  {
    name: 'Final',
    questions: [
      { q: 'Native modal with backdrop?', options: ['<dialog>', '<aside>'], correct: 0 },
      { q: 'Style based on parent containing a child?', options: [':has()', ':parent()'], correct: 0 },
      { q: 'Container-relative styling?', options: ['@container', '@media'], correct: 0 },
      { q: 'Animate between DOM states across navigations?', options: ['View Transitions API', 'Web Animations'], correct: 0 },
      { q: 'Subtract a percentage from a length?', options: ['calc()', 'minmax()'], correct: 0 },
    ],
  },
];

let bossIdx = 0; let qIdx = 0; let hp = 3; let totalRight = 0;

root.innerHTML = `
  <div class="game-hud">
    <div class="game-hud__score">Boss <strong id="hud-boss">1</strong>/${BOSSES.length}</div>
    <div class="game-hud__lives">HP <strong id="hud-hp">3</strong></div>
    <div class="game-hud__highscore">Right <strong id="hud-right">0</strong></div>
  </div>
  <div class="br-stage">
    <h2 id="br-name"></h2>
    <p id="br-question" class="br-q"></p>
    <div class="br-options" id="br-options"></div>
    <div id="br-feedback" class="br-feedback"></div>
  </div>
  <a href="../arcade.html" class="game-back">← Back to arcade</a>
`;

const styleTag = document.createElement('style');
styleTag.textContent = `
.br-stage { padding: 16px; display: grid; gap: 16px; text-align: center; }
.br-stage h2 { margin: 0; color: oklch(0.7 0.22 30); font-size: 1.6rem; }
.br-q { font-size: 1.1rem; padding: 16px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; min-height: 60px; }
.br-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.br-options button { padding: 16px; font-size: 1rem; cursor: pointer; background: oklch(0.22 0.04 280); color: white; border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; transition: transform 150ms ease, background 200ms ease; }
.br-options button:hover { transform: scale(1.02); background: oklch(0.3 0.06 280); }
.br-options button.right { background: oklch(0.5 0.2 150); }
.br-options button.wrong { background: oklch(0.5 0.22 30); }
.br-feedback { min-height: 32px; }
.br-feedback.ok { color: oklch(0.7 0.2 150); }
.br-feedback.bad { color: oklch(0.7 0.22 30); }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

function loadQ() {
  const boss = BOSSES[bossIdx];
  const q = boss.questions[qIdx];
  document.getElementById('hud-boss').textContent = bossIdx + 1;
  document.getElementById('hud-hp').textContent = hp;
  document.getElementById('br-name').textContent = `Boss ${bossIdx + 1}: ${boss.name}`;
  document.getElementById('br-question').textContent = q.q;
  const opts = document.getElementById('br-options');
  opts.innerHTML = '';
  q.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.textContent = o;
    b.addEventListener('click', () => answer(b, i, q.correct), { once: true });
    opts.appendChild(b);
  });
  document.getElementById('br-feedback').textContent = '';
}

function answer(btn, picked, correct) {
  if (picked === correct) {
    btn.classList.add('right');
    totalRight++;
    document.getElementById('hud-right').textContent = totalRight;
    playSound('chime');
    setFeedback('ok', 'Hit!');
    setTimeout(nextQ, 700);
  } else {
    btn.classList.add('wrong');
    hp--;
    document.getElementById('hud-hp').textContent = hp;
    playSound('error');
    if (hp <= 0) return defeat();
    setFeedback('bad', `Miss! ${hp} HP left.`);
    // Re-enable other options
    [...document.getElementById('br-options').children].forEach(b => { if (b !== btn && !b.classList.contains('wrong')) { /* already active */ } });
  }
}

function setFeedback(kind, text) {
  const fb = document.getElementById('br-feedback');
  fb.className = `br-feedback ${kind}`;
  fb.textContent = text;
}

function nextQ() {
  qIdx++;
  if (qIdx >= BOSSES[bossIdx].questions.length) {
    qIdx = 0;
    bossIdx++;
    hp = 3;
    if (bossIdx >= BOSSES.length) return victory();
    overlay.show(`<div><h2>${BOSSES[bossIdx - 1].name} Defeated!</h2><p>${bossIdx} / ${BOSSES.length} bosses down.</p><div class="game-overlay__buttons"><button id="continue">Next Boss →</button></div></div>`);
    document.getElementById('continue')?.addEventListener('click', () => { overlay.hide(); loadQ(); });
    return;
  }
  loadQ();
}

function victory() {
  setHighScore(GAME_ID, totalRight * 100);
  recordPlay(GAME_ID);
  try { state.emit('game:complete', { game: GAME_ID, allBosses: true, score: totalRight }); } catch {}
  overlay.show(`<div><h2>🏆 All Bosses Defeated!</h2><p>Right answers: ${totalRight} / 25</p><div class="game-overlay__buttons"><button id="restart">Run again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { location.reload(); });
}

function defeat() {
  setHighScore(GAME_ID, totalRight * 100);
  recordPlay(GAME_ID);
  overlay.show(`<div><h2>Defeated by ${BOSSES[bossIdx].name}</h2><p>Right answers: ${totalRight}</p><p>Boss reached: ${bossIdx + 1} / ${BOSSES.length}</p><div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { location.reload(); });
}

loadQ();
