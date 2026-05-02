/**
 * zone-art-v2.js — Build a Shape v2 (Layer 2 / Task 10)
 *
 * Inline shape builder scoped to the CSS Art zone. Same control pattern
 * as the Lab but more compact, plus Challenge Mode with 10 target shapes
 * and property-distance scoring (1/2/3 stars).
 *
 * Emits gimmick:trigger { name: 'shape-shifter' } when 5+ controls touched.
 */

import { state } from './state.js';

const canvas = document.getElementById('bas-canvas');
const cssOut = document.getElementById('bas-css-output');

// Bail gracefully if zone shell is missing the v2 markup
if (!canvas || !cssOut) {
  // nothing to wire up
} else {

const DEFAULTS = {
  width: 240, height: 240, radius: 20,
  bgType: 'linear', color1: '#a78bfa', color2: '#f472b6', angle: 135,
  blur: 0, brightness: 100, hue: 0, sat: 100,
  rotate: 0, scale: 100, anim: 'none',
};

let current = { ...DEFAULTS };
let history = [];
let hIdx = -1;
const touchedControls = new Set();
let shapeShifterEmitted = false;

const ID_TO_KEY = {
  'bas-width': 'width', 'bas-height': 'height', 'bas-radius': 'radius',
  'bas-bg-type': 'bgType', 'bas-color1': 'color1', 'bas-color2': 'color2', 'bas-angle': 'angle',
  'bas-blur': 'blur', 'bas-brightness': 'brightness', 'bas-hue': 'hue', 'bas-sat': 'sat',
  'bas-rotate': 'rotate', 'bas-scale': 'scale', 'bas-anim': 'anim',
};

function buildCSS(s) {
  const bg = s.bgType === 'solid' ? s.color1
    : s.bgType === 'linear' ? `linear-gradient(${s.angle}deg, ${s.color1}, ${s.color2})`
    : s.bgType === 'radial' ? `radial-gradient(circle, ${s.color1}, ${s.color2})`
    : `conic-gradient(from ${s.angle}deg, ${s.color1}, ${s.color2}, ${s.color1})`;
  return {
    width: s.width + 'px',
    height: s.height + 'px',
    borderRadius: s.radius + '%',
    background: bg,
    filter: `blur(${s.blur}px) brightness(${s.brightness}%) hue-rotate(${s.hue}deg) saturate(${s.sat}%)`,
    transform: `rotate(${s.rotate}deg) scale(${s.scale / 100})`,
    animation: s.anim === 'none' ? '' : s.anim,
  };
}

function paintCanvas(target, s) {
  const css = buildCSS(s);
  // reset inline animation/transform if "none" so we don't carry stale state
  Object.assign(target.style, {
    width: css.width, height: css.height, borderRadius: css.borderRadius,
    background: css.background, filter: css.filter, transform: css.transform,
    animation: css.animation,
  });
}

function syncControls(s) {
  Object.entries(ID_TO_KEY).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el && el.value !== String(s[key])) el.value = s[key];
  });
  document.querySelectorAll('.bas-controls .ctl-val').forEach(v => {
    const id = v.dataset.for;
    const el = document.getElementById(id);
    if (el) v.textContent = el.value;
  });
}

function renderCSSPreview(s) {
  const css = buildCSS(s);
  cssOut.textContent = Object.entries(css)
    .filter(([_, v]) => v && v !== 'none' && v !== '0px' && v !== '')
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n');
}

function applyState(s = current, pushHistory = true) {
  current = { ...s };
  paintCanvas(canvas, s);
  syncControls(s);
  renderCSSPreview(s);
  if (pushHistory) {
    history = history.slice(0, hIdx + 1);
    history.push({ ...s });
    hIdx = history.length - 1;
    if (history.length > 50) { history.shift(); hIdx--; }
  }
  // Update challenge match score live if in challenge mode
  if (challengeActive) updateMatchScore();
}

// Bind every control input
Object.entries(ID_TO_KEY).forEach(([id, key]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const raw = (el.type === 'range') ? Number(el.value) : el.value;
    current[key] = raw;
    touchedControls.add(id);
    if (touchedControls.size >= 5 && !shapeShifterEmitted) {
      shapeShifterEmitted = true;
      try { state.emit('gimmick:trigger', { name: 'shape-shifter' }); } catch {}
    }
    applyState(current);
  });
});

// Randomize
const randomizeBtn = document.getElementById('bas-randomize');
randomizeBtn?.addEventListener('click', () => {
  const r = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const hex = () => '#' + [0, 0, 0].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const types = ['solid', 'linear', 'radial', 'conic'];
  const anims = ['none', 'spin 4s linear infinite', 'float 4s ease-in-out infinite', 'pulse 2s ease-in-out infinite'];
  applyState({
    width: r(100, 400), height: r(100, 400), radius: r(0, 50),
    bgType: types[r(0, types.length - 1)], color1: hex(), color2: hex(), angle: r(0, 360),
    blur: r(0, 6), brightness: r(80, 130), hue: r(0, 360), sat: r(60, 180),
    rotate: r(-30, 30), scale: r(80, 120), anim: anims[r(0, anims.length - 1)],
  });
});

// Copy CSS
const copyBtn = document.getElementById('bas-copy');
copyBtn?.addEventListener('click', () => {
  navigator.clipboard?.writeText(cssOut.textContent).then(() => {
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = original; }, 1500);
  }).catch(() => {});
});

// Undo / Redo
const undoBtn = document.getElementById('bas-undo');
const redoBtn = document.getElementById('bas-redo');
undoBtn?.addEventListener('click', () => {
  if (hIdx > 0) { hIdx--; applyState(history[hIdx], false); }
});
redoBtn?.addEventListener('click', () => {
  if (hIdx < history.length - 1) { hIdx++; applyState(history[hIdx], false); }
});

// ── Challenge Mode ──────────────────────────────────────────
const CHALLENGES = [
  { name: 'Circle',                state: { width:200, height:200, radius:50, bgType:'solid',  color1:'#a78bfa', color2:'#a78bfa', angle:0,   blur:0, brightness:100, hue:0,   sat:100, rotate:0,  scale:100, anim:'none' } },
  { name: 'Yellow square',         state: { width:200, height:200, radius:8,  bgType:'solid',  color1:'#fbbf24', color2:'#fbbf24', angle:0,   blur:0, brightness:100, hue:0,   sat:100, rotate:0,  scale:100, anim:'none' } },
  { name: 'Red diamond',           state: { width:200, height:200, radius:0,  bgType:'solid',  color1:'#ef4444', color2:'#ef4444', angle:0,   blur:0, brightness:100, hue:0,   sat:100, rotate:45, scale:100, anim:'none' } },
  { name: 'Pink-purple gradient',  state: { width:240, height:200, radius:30, bgType:'linear', color1:'#f472b6', color2:'#a78bfa', angle:135, blur:0, brightness:100, hue:0,   sat:100, rotate:0,  scale:100, anim:'none' } },
  { name: 'Cyan glow',             state: { width:200, height:200, radius:50, bgType:'radial', color1:'#06b6d4', color2:'#0e7490', angle:0,   blur:0, brightness:120, hue:0,   sat:130, rotate:0,  scale:100, anim:'none' } },
  { name: 'Sunset',                state: { width:280, height:200, radius:0,  bgType:'linear', color1:'#fbbf24', color2:'#dc2626', angle:90,  blur:0, brightness:110, hue:0,   sat:120, rotate:0,  scale:100, anim:'none' } },
  { name: 'Tilted blur',           state: { width:200, height:200, radius:24, bgType:'linear', color1:'#34d399', color2:'#06b6d4', angle:45,  blur:4, brightness:100, hue:0,   sat:100, rotate:15, scale:100, anim:'none' } },
  { name: 'Big purple orb',        state: { width:300, height:300, radius:50, bgType:'radial', color1:'#a78bfa', color2:'#7c3aed', angle:0,   blur:0, brightness:110, hue:0,   sat:130, rotate:0,  scale:100, anim:'none' } },
  { name: 'Conic rainbow',         state: { width:240, height:240, radius:50, bgType:'conic',  color1:'#f472b6', color2:'#34d399', angle:0,   blur:0, brightness:110, hue:0,   sat:130, rotate:0,  scale:100, anim:'none' } },
  { name: 'Hue-shifted',           state: { width:240, height:200, radius:16, bgType:'linear', color1:'#a78bfa', color2:'#f472b6', angle:90,  blur:0, brightness:100, hue:180, sat:100, rotate:0,  scale:100, anim:'none' } },
];

const hud = document.getElementById('bas-challenge-hud');
const targetEl = document.getElementById('bas-target');
const matchPctEl = document.getElementById('bas-match-pct');
const starsEl = document.getElementById('bas-stars');
const challengeBtn = document.getElementById('bas-challenge');
const nextBtn = document.getElementById('bas-next-challenge');
const exitBtn = document.getElementById('bas-exit-challenge');

let challengeActive = false;
let challengeIdx = 0;

function scoreMatch(curr, target) {
  const numericKeys = ['width', 'height', 'radius', 'angle', 'blur', 'brightness', 'hue', 'sat', 'rotate', 'scale'];
  const enumKeys = ['bgType', 'anim'];
  const colorKeys = ['color1', 'color2'];
  const numericMax = { width: 500, height: 500, radius: 50, angle: 360, blur: 20, brightness: 200, hue: 360, sat: 200, rotate: 360, scale: 200 };
  let score = 0;
  const total = numericKeys.length + enumKeys.length + colorKeys.length;
  numericKeys.forEach(k => {
    const max = numericMax[k] || 100;
    const diff = Math.abs((curr[k] || 0) - (target[k] || 0)) / max;
    score += Math.max(0, 1 - diff);
  });
  enumKeys.forEach(k => { if (curr[k] === target[k]) score += 1; });
  colorKeys.forEach(k => {
    if ((curr[k] || '').toLowerCase() === (target[k] || '').toLowerCase()) score += 1;
    else score += 0.3;
  });
  return Math.round((score / total) * 100);
}

function starsForPct(pct) {
  if (pct >= 95) return '★★★';
  if (pct >= 85) return '★★☆';
  if (pct >= 70) return '★☆☆';
  return '☆☆☆';
}

function updateMatchScore() {
  if (!challengeActive) return;
  const target = CHALLENGES[challengeIdx];
  if (!target) return;
  const pct = scoreMatch(current, target.state);
  if (matchPctEl) matchPctEl.textContent = pct;
  if (starsEl) starsEl.textContent = starsForPct(pct);
}

function startChallenge(idx = 0) {
  challengeActive = true;
  challengeIdx = idx % CHALLENGES.length;
  if (hud) hud.hidden = false;
  const target = CHALLENGES[challengeIdx];
  // paint a small thumbnail of the target — clamp to the HUD slot
  if (targetEl) {
    paintCanvas(targetEl, target.state);
    targetEl.style.width = '60px';
    targetEl.style.height = '60px';
    targetEl.title = target.name;
  }
  // give the user a fresh canvas so they can sculpt toward target
  applyState(DEFAULTS);
  updateMatchScore();
}

function exitChallenge() {
  challengeActive = false;
  if (hud) hud.hidden = true;
}

challengeBtn?.addEventListener('click', () => startChallenge(0));
nextBtn?.addEventListener('click', () => startChallenge((challengeIdx + 1) % CHALLENGES.length));
exitBtn?.addEventListener('click', exitChallenge);

// initial render
applyState(DEFAULTS);

}
