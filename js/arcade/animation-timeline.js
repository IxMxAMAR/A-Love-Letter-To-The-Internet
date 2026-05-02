import { setHighScore, recordPlay, createOverlay, playSound, state } from './shared.js';

const GAME_ID = 'animation-timeline';
const root = document.getElementById('game-root');

const LEVELS = [
  {
    name: 'Bounce up',
    target: [
      { time: 0,   transform: 'translateY(0)' },
      { time: 50,  transform: 'translateY(-40px)' },
      { time: 100, transform: 'translateY(0)' },
    ],
    duration: 1000,
    options: [
      { label: 'translateY(0)', value: 'translateY(0)' },
      { label: 'translateY(-20px)', value: 'translateY(-20px)' },
      { label: 'translateY(-40px)', value: 'translateY(-40px)' },
      { label: 'translateY(40px)', value: 'translateY(40px)' },
    ],
  },
  {
    name: 'Fade in then out',
    target: [
      { time: 0,   opacity: 0 },
      { time: 50,  opacity: 1 },
      { time: 100, opacity: 0 },
    ],
    duration: 1500,
    options: [
      { label: 'opacity: 0', value: '0', prop: 'opacity' },
      { label: 'opacity: 0.5', value: '0.5', prop: 'opacity' },
      { label: 'opacity: 1', value: '1', prop: 'opacity' },
    ],
  },
  {
    name: 'Spin',
    target: [
      { time: 0, transform: 'rotate(0deg)' },
      { time: 100, transform: 'rotate(360deg)' },
    ],
    duration: 1200,
    options: [
      { label: 'rotate(0deg)', value: 'rotate(0deg)' },
      { label: 'rotate(180deg)', value: 'rotate(180deg)' },
      { label: 'rotate(360deg)', value: 'rotate(360deg)' },
      { label: 'rotate(720deg)', value: 'rotate(720deg)' },
    ],
  },
  {
    name: 'Scale pulse',
    target: [
      { time: 0, transform: 'scale(1)' },
      { time: 50, transform: 'scale(1.4)' },
      { time: 100, transform: 'scale(1)' },
    ],
    duration: 1000,
    options: [
      { label: 'scale(1)', value: 'scale(1)' },
      { label: 'scale(1.2)', value: 'scale(1.2)' },
      { label: 'scale(1.4)', value: 'scale(1.4)' },
      { label: 'scale(0.5)', value: 'scale(0.5)' },
    ],
  },
  {
    name: 'Shake',
    target: [
      { time: 0,  transform: 'translateX(0)' },
      { time: 25, transform: 'translateX(-10px)' },
      { time: 50, transform: 'translateX(10px)' },
      { time: 75, transform: 'translateX(-10px)' },
      { time:100, transform: 'translateX(0)' },
    ],
    duration: 800,
    options: [
      { label: 'translateX(0)', value: 'translateX(0)' },
      { label: 'translateX(-10px)', value: 'translateX(-10px)' },
      { label: 'translateX(10px)', value: 'translateX(10px)' },
      { label: 'translateX(20px)', value: 'translateX(20px)' },
    ],
  },
  {
    name: 'Color cycle',
    target: [
      { time: 0,   bg: '#a78bfa' },
      { time: 50,  bg: '#f472b6' },
      { time: 100, bg: '#a78bfa' },
    ],
    duration: 1500,
    options: [
      { label: 'background: #a78bfa', value: '#a78bfa', prop: 'bg' },
      { label: 'background: #f472b6', value: '#f472b6', prop: 'bg' },
      { label: 'background: #34d399', value: '#34d399', prop: 'bg' },
      { label: 'background: #fbbf24', value: '#fbbf24', prop: 'bg' },
    ],
  },
];

let levelIdx = 0; let solved = 0;

function buildUI() {
  root.innerHTML = `
    <div class="game-hud">
      <div class="game-hud__score">Level <strong id="hud-level">1</strong>/${LEVELS.length}</div>
      <div class="game-hud__highscore">Solved <strong id="hud-solved">0</strong></div>
    </div>
    <div class="at-stage">
      <h3 id="at-name"></h3>
      <div class="at-row">
        <div class="at-frame">
          <h4>Target</h4>
          <div class="at-target-stage"><div class="at-target-box" id="at-target-box"></div></div>
        </div>
        <div class="at-frame">
          <h4>Yours</h4>
          <div class="at-current-stage"><div class="at-current-box" id="at-current-box"></div></div>
        </div>
      </div>
      <h4>Pick keyframes for the timeline:</h4>
      <div class="at-options" id="at-options"></div>
      <h4>Your timeline:</h4>
      <div class="at-timeline" id="at-timeline"></div>
      <div class="at-actions">
        <button id="at-play" class="ripple">Play yours</button>
        <button id="at-test">Test</button>
        <button id="at-clear">Clear</button>
        <button id="at-skip">Skip</button>
      </div>
      <div id="at-feedback" class="at-feedback"></div>
    </div>
  `;
}
buildUI();

const styleTag = document.createElement('style');
styleTag.textContent = `
.at-stage { padding: 16px; display: grid; gap: 12px; }
.at-stage h3 { margin: 0; color: oklch(0.85 0.18 290); }
.at-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.at-frame h4 { margin: 0 0 8px; font-size: 0.85rem; opacity: 0.7; }
.at-target-stage, .at-current-stage { padding: 16px; min-height: 140px; background: oklch(0.05 0.01 280); border: 1px solid oklch(1 0 0 / 0.1); border-radius: 8px; display: grid; place-items: center; overflow: hidden; }
.at-target-box, .at-current-box { width: 60px; height: 60px; background: #a78bfa; border-radius: 8px; }
.at-options { display: flex; flex-wrap: wrap; gap: 6px; }
.at-options button { padding: 6px 10px; background: oklch(0.22 0.04 280); color: white; border: 1px solid oklch(1 0 0 / 0.1); border-radius: 4px; font-family: var(--font-code, monospace); font-size: 0.8rem; cursor: pointer; }
.at-timeline { display: flex; gap: 6px; padding: 12px; background: oklch(0.05 0.01 280); border-radius: 8px; min-height: 50px; align-items: center; flex-wrap: wrap; }
.at-timeline .at-step { padding: 6px 10px; background: oklch(0.65 0.22 290); color: white; border-radius: 4px; font-family: var(--font-code, monospace); font-size: 0.8rem; cursor: pointer; }
.at-timeline .at-empty { color: oklch(1 0 0 / 0.3); font-size: 0.8rem; }
.at-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.at-actions button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.at-feedback { padding: 8px; min-height: 32px; }
.at-feedback.ok { color: oklch(0.7 0.2 150); }
.at-feedback.bad { color: oklch(0.7 0.22 30); }
`;
document.head.appendChild(styleTag);

const overlay = createOverlay(root);

let userSteps = [];

function loadLevel() {
  const lvl = LEVELS[levelIdx];
  document.getElementById('hud-level').textContent = levelIdx + 1;
  document.getElementById('at-name').textContent = lvl.name;
  // Render options
  const opts = document.getElementById('at-options');
  opts.innerHTML = '';
  lvl.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.textContent = o.label;
    b.dataset.idx = i;
    b.addEventListener('click', () => {
      userSteps.push(o);
      renderTimeline();
    });
    opts.appendChild(b);
  });
  userSteps = [];
  renderTimeline();
  document.getElementById('at-feedback').textContent = '';
  // Play target on a loop
  playKeyframes(document.getElementById('at-target-box'), lvl.target, lvl.duration);
  // Auto-replay target every (duration + 500)ms
  if (loadLevel._tInt) clearInterval(loadLevel._tInt);
  loadLevel._tInt = setInterval(() => playKeyframes(document.getElementById('at-target-box'), lvl.target, lvl.duration), lvl.duration + 500);
}

function renderTimeline() {
  const tl = document.getElementById('at-timeline');
  tl.innerHTML = '';
  if (userSteps.length === 0) {
    tl.innerHTML = '<span class="at-empty">Click options above to add keyframes</span>';
    return;
  }
  userSteps.forEach((s, i) => {
    const span = document.createElement('span');
    span.className = 'at-step';
    span.textContent = s.label;
    span.title = 'Click to remove';
    span.addEventListener('click', () => { userSteps.splice(i, 1); renderTimeline(); });
    tl.appendChild(span);
  });
}

function playKeyframes(el, frames, duration) {
  // Build a Web Animations API keyframes array
  const keyframes = frames.map(f => {
    const k = { offset: f.time / 100 };
    if (f.transform !== undefined) k.transform = f.transform;
    if (f.opacity !== undefined) k.opacity = f.opacity;
    if (f.bg !== undefined) k.background = f.bg;
    return k;
  });
  el.getAnimations().forEach(a => a.cancel());
  el.animate(keyframes, { duration, easing: 'ease-in-out', fill: 'forwards' });
}

function userFrames() {
  // Map userSteps to time-distributed keyframes
  if (userSteps.length === 0) return [];
  if (userSteps.length === 1) return [{ time: 0, ...userToProp(userSteps[0]) }, { time: 100, ...userToProp(userSteps[0]) }];
  return userSteps.map((s, i) => ({ time: (i / (userSteps.length - 1)) * 100, ...userToProp(s) }));
}

function userToProp(o) {
  if (o.prop === 'opacity') return { opacity: Number(o.value) };
  if (o.prop === 'bg') return { bg: o.value };
  return { transform: o.value };
}

function setFeedback(kind, text) {
  const fb = document.getElementById('at-feedback');
  fb.className = `at-feedback ${kind}`;
  fb.textContent = text;
}

function nextLevel() {
  levelIdx++;
  if (loadLevel._tInt) clearInterval(loadLevel._tInt);
  if (levelIdx >= LEVELS.length) {
    setHighScore(GAME_ID, solved * 100);
    recordPlay(GAME_ID);
    try { state.emit('game:complete', { game: GAME_ID, allLevels: solved === LEVELS.length, score: solved }); } catch {}
    overlay.show(`<div><h2>Animation Mastered!</h2><p>Solved: ${solved}/${LEVELS.length}</p><div class="game-overlay__buttons"><button id="restart">Try again</button><a href="../arcade.html"><button class="secondary">Back</button></a></div></div>`);
    document.getElementById('restart')?.addEventListener('click', () => { overlay.hide(); levelIdx = 0; solved = 0; document.getElementById('hud-solved').textContent = '0'; loadLevel(); });
    return;
  }
  loadLevel();
}

document.getElementById('at-play').addEventListener('click', () => {
  const lvl = LEVELS[levelIdx];
  playKeyframes(document.getElementById('at-current-box'), userFrames(), lvl.duration);
});
document.getElementById('at-clear').addEventListener('click', () => { userSteps = []; renderTimeline(); });
document.getElementById('at-test').addEventListener('click', () => {
  const lvl = LEVELS[levelIdx];
  const my = userFrames();
  // Compare: count of frames must equal target count, and each frame's properties must match within tolerance
  if (my.length !== lvl.target.length) {
    playSound('error');
    setFeedback('bad', `Need ${lvl.target.length} keyframes; you have ${my.length}.`);
    return;
  }
  let same = true;
  for (let i = 0; i < lvl.target.length; i++) {
    const a = lvl.target[i], b = my[i];
    if (a.transform !== undefined && a.transform !== b.transform) { same = false; break; }
    if (a.opacity !== undefined && a.opacity !== b.opacity) { same = false; break; }
    if (a.bg !== undefined && a.bg !== b.bg) { same = false; break; }
  }
  if (same) {
    solved++;
    document.getElementById('hud-solved').textContent = solved;
    playSound('chime');
    setFeedback('ok', 'Match! Next level…');
    setTimeout(nextLevel, 800);
  } else {
    playSound('error');
    setFeedback('bad', 'Close — but the keyframe values don\'t match the target.');
  }
});
document.getElementById('at-skip').addEventListener('click', () => { playSound('click'); nextLevel(); });

addEventListener('beforeunload', () => { if (loadLevel._tInt) clearInterval(loadLevel._tInt); });

loadLevel();
