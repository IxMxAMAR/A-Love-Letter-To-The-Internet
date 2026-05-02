import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'type-racer';
const root = document.getElementById('game-root');

const SNIPPETS = [
  'display: flex;',
  'background: linear-gradient(45deg, #a78bfa, #f472b6);',
  'transform: scale(1.05);',
  'border-radius: 12px;',
  'box-shadow: 0 4px 24px rgba(0,0,0,.4);',
  'animation: spin 2s linear infinite;',
  'grid-template-columns: repeat(3, 1fr);',
  'transition: transform 200ms ease;',
  'color: oklch(0.7 0.2 290);',
  'gap: 16px;',
  'flex-direction: column;',
  'justify-content: space-between;',
  'align-items: center;',
  'position: absolute;',
  'inset: 0;',
  'overflow: hidden;',
  'opacity: 0.5;',
  'filter: blur(4px);',
  'cursor: pointer;',
  'user-select: none;',
];

let startTime = null; let typed = 0; let words = 0; let errors = 0; let snippetIdx = 0;
let timerLeft = 60; let timerInt;

root.innerHTML = `
  <div class="game-hud">
    <div class="game-hud__score">Time <strong id="hud-time">60</strong>s</div>
    <div class="game-hud__highscore">WPM <strong id="hud-wpm">0</strong></div>
  </div>
  <div class="tr-stage">
    <div class="tr-target" id="tr-target"></div>
    <input id="tr-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Click here and start typing…">
    <div class="tr-stats">
      <span>Errors: <strong id="tr-errors">0</strong></span>
      <span>Snippet: <strong id="tr-snippet">1</strong>/${SNIPPETS.length}</span>
    </div>
  </div>
  <a href="../arcade.html" class="game-back">← Back to arcade</a>
`;

const styleTag = document.createElement('style');
styleTag.textContent = `
.tr-stage { padding: 16px; display: grid; gap: 12px; }
.tr-target { padding: 24px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; font-family: var(--font-code, monospace); font-size: 1.2rem; line-height: 1.6; min-height: 70px; letter-spacing: 0.5px; }
.tr-target span { color: oklch(0.6 0 0); }
.tr-target span.tr-ok { color: oklch(0.7 0.2 150); }
.tr-target span.tr-err { color: oklch(0.7 0.22 30); background: oklch(0.7 0.22 30 / 0.2); }
.tr-target span.tr-cur { background: oklch(0.65 0.22 290); color: white; padding: 0 2px; border-radius: 2px; }
#tr-input { padding: 12px; font-family: var(--font-code); font-size: 1rem; background: oklch(0.18 0.02 280); color: white; border: 1px solid oklch(1 0 0 / 0.15); border-radius: 8px; }
#tr-input:focus-visible { outline: 2px solid oklch(0.75 0.2 290); }
.tr-stats { display: flex; gap: 16px; font-size: 0.9rem; opacity: 0.8; }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

function loadSnippet() {
  const s = SNIPPETS[snippetIdx];
  const target = document.getElementById('tr-target');
  target.innerHTML = '';
  [...s].forEach((ch, i) => {
    const sp = document.createElement('span');
    sp.textContent = ch;
    sp.dataset.idx = i;
    target.appendChild(sp);
  });
  document.getElementById('tr-input').value = '';
  if (target.firstElementChild) target.firstElementChild.classList.add('tr-cur');
}

document.getElementById('tr-input').addEventListener('input', (e) => {
  if (!startTime) {
    startTime = performance.now();
    timerInt = setInterval(tickTimer, 1000);
  }
  const value = e.target.value;
  const target = document.getElementById('tr-target');
  const spans = [...target.children];
  const s = SNIPPETS[snippetIdx];
  if (value.length > s.length) { e.target.value = value.slice(0, s.length); return; }
  for (let i = 0; i < spans.length; i++) {
    spans[i].classList.remove('tr-ok', 'tr-err', 'tr-cur');
    if (i < value.length) {
      if (value[i] === s[i]) spans[i].classList.add('tr-ok');
      else { spans[i].classList.add('tr-err'); }
    } else if (i === value.length) {
      spans[i].classList.add('tr-cur');
    }
  }
  if (value === s) {
    typed += s.length;
    words += s.split(/\s+/).length;
    snippetIdx = (snippetIdx + 1) % SNIPPETS.length;
    document.getElementById('tr-snippet').textContent = (snippetIdx + 1);
    playSound('chime');
    loadSnippet();
  }
});

function tickTimer() {
  timerLeft--;
  document.getElementById('hud-time').textContent = timerLeft;
  const wpm = words / ((60 - timerLeft) / 60);
  if (Number.isFinite(wpm) && (60 - timerLeft) > 0) {
    document.getElementById('hud-wpm').textContent = Math.round(wpm);
  }
  if (timerLeft <= 0) endGame();
}

function endGame() {
  if (timerInt) clearInterval(timerInt);
  document.getElementById('tr-input').disabled = true;
  const finalWpm = Math.round(words);
  setHighScore(GAME_ID, finalWpm);
  recordPlay(GAME_ID);
  try { state.emit('game:score', { game: GAME_ID, wpm: finalWpm, score: finalWpm }); } catch {}
  overlay.show(`<div><h2>Time's Up</h2><p>${finalWpm} WPM</p><div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
  document.getElementById('restart')?.addEventListener('click', () => { location.reload(); });
}

loadSnippet();
document.getElementById('tr-input').focus();
