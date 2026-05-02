/**
 * lab.js — Lab page (Layer 2 / Task 5)
 * Advanced CSS shape builder with 25+ controls, 20 presets,
 * save/load gallery, randomize, reset, copy CSS, share URL,
 * export PNG (SVG foreignObject), and undo/redo (Ctrl+Z / Ctrl+Y).
 */

import { state } from './state.js';

const canvas = document.getElementById('lab-canvas');
const cssOut = document.getElementById('lab-css');

const DEFAULTS = {
  width: 300, height: 300, radius: 20, clip: 'none',
  bgType: 'linear', color1: '#a78bfa', color2: '#f472b6', angle: 135,
  shX: 0, shY: 20, shBlur: 40, shSpread: -10, shColor: '#a78bfa',
  blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100,
  rotate: 0, scale: 100, skewX: 0, skewY: 0,
  anim: 'none', blend: 'normal', opacity: 100,
};

let current = { ...DEFAULTS };
let history = [];
let hIdx = -1;

function buildCSS(s) {
  const bg = s.bgType === 'solid' ? s.color1
    : s.bgType === 'linear' ? `linear-gradient(${s.angle}deg, ${s.color1}, ${s.color2})`
    : s.bgType === 'radial' ? `radial-gradient(circle, ${s.color1}, ${s.color2})`
    : `conic-gradient(from ${s.angle}deg, ${s.color1}, ${s.color2}, ${s.color1})`;
  return {
    width: s.width + 'px',
    height: s.height + 'px',
    borderRadius: s.radius + '%',
    clipPath: s.clip,
    background: bg,
    boxShadow: `${s.shX}px ${s.shY}px ${s.shBlur}px ${s.shSpread}px ${s.shColor}`,
    filter: `blur(${s.blur}px) brightness(${s.brightness}%) contrast(${s.contrast}%) hue-rotate(${s.hue}deg) saturate(${s.sat}%)`,
    transform: `rotate(${s.rotate}deg) scale(${s.scale / 100}) skew(${s.skewX}deg, ${s.skewY}deg)`,
    animation: s.anim,
    mixBlendMode: s.blend,
    opacity: s.opacity / 100,
  };
}

function applyState(s = current, pushHistory = true) {
  current = { ...s };
  const css = buildCSS(s);
  Object.assign(canvas.style, css);
  // update controls
  document.getElementById('ctl-width').value = s.width;
  document.getElementById('ctl-height').value = s.height;
  document.getElementById('ctl-radius').value = s.radius;
  document.getElementById('ctl-clip').value = s.clip;
  document.getElementById('ctl-bg-type').value = s.bgType;
  document.getElementById('ctl-color1').value = s.color1;
  document.getElementById('ctl-color2').value = s.color2;
  document.getElementById('ctl-angle').value = s.angle;
  document.getElementById('ctl-sh-x').value = s.shX;
  document.getElementById('ctl-sh-y').value = s.shY;
  document.getElementById('ctl-sh-blur').value = s.shBlur;
  document.getElementById('ctl-sh-spread').value = s.shSpread;
  document.getElementById('ctl-sh-color').value = s.shColor;
  document.getElementById('ctl-blur').value = s.blur;
  document.getElementById('ctl-brightness').value = s.brightness;
  document.getElementById('ctl-contrast').value = s.contrast;
  document.getElementById('ctl-hue').value = s.hue;
  document.getElementById('ctl-sat').value = s.sat;
  document.getElementById('ctl-rotate').value = s.rotate;
  document.getElementById('ctl-scale').value = s.scale;
  document.getElementById('ctl-skew-x').value = s.skewX;
  document.getElementById('ctl-skew-y').value = s.skewY;
  document.getElementById('ctl-anim').value = s.anim;
  document.getElementById('ctl-blend').value = s.blend;
  document.getElementById('ctl-opacity').value = s.opacity;
  // sync .ctl-val displays
  document.querySelectorAll('.ctl-val').forEach(v => {
    const id = v.dataset.for;
    const el = document.getElementById(id);
    if (el) v.textContent = el.value;
  });
  // generated css preview
  cssOut.textContent = Object.entries(css)
    .filter(([_, v]) => v && v !== 'none' && v !== 'normal' && v !== '0px' && v !== '100%')
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n');
  if (pushHistory) {
    history = history.slice(0, hIdx + 1);
    history.push({ ...s });
    hIdx = history.length - 1;
    if (history.length > 50) { history.shift(); hIdx--; }
  }
}

// bind every input
const ID_TO_KEY = {
  'ctl-width': 'width', 'ctl-height': 'height', 'ctl-radius': 'radius', 'ctl-clip': 'clip',
  'ctl-bg-type': 'bgType', 'ctl-color1': 'color1', 'ctl-color2': 'color2', 'ctl-angle': 'angle',
  'ctl-sh-x': 'shX', 'ctl-sh-y': 'shY', 'ctl-sh-blur': 'shBlur', 'ctl-sh-spread': 'shSpread', 'ctl-sh-color': 'shColor',
  'ctl-blur': 'blur', 'ctl-brightness': 'brightness', 'ctl-contrast': 'contrast', 'ctl-hue': 'hue', 'ctl-sat': 'sat',
  'ctl-rotate': 'rotate', 'ctl-scale': 'scale', 'ctl-skew-x': 'skewX', 'ctl-skew-y': 'skewY',
  'ctl-anim': 'anim', 'ctl-blend': 'blend', 'ctl-opacity': 'opacity',
};
Object.entries(ID_TO_KEY).forEach(([id, key]) => {
  const el = document.getElementById(id);
  el?.addEventListener('input', () => {
    const raw = el.type === 'range' || el.type === 'number' ? Number(el.value) : el.value;
    current[key] = raw;
    applyState(current);
  });
});

// 20 PRESETS
const PRESETS = [
  { name: 'Glass card',      state: { width: 300, height: 200, radius: 8,  clip: 'none', bgType: 'linear', color1: '#a78bfa', color2: '#60a5fa', angle: 135, shX: 0, shY: 8,  shBlur: 32, shSpread: -8, shColor: '#000000', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'none',                            blend: 'normal', opacity: 90 } },
  { name: 'Neon orb',        state: { width: 240, height: 240, radius: 50, clip: 'circle(50%)', bgType: 'radial', color1: '#f472b6', color2: '#a78bfa', angle: 0,   shX: 0, shY: 0,  shBlur: 80, shSpread: 0,  shColor: '#f472b6', blur: 0, brightness: 120, contrast: 110, hue: 0, sat: 130, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'pulse 2s ease-in-out infinite',   blend: 'normal', opacity: 100 } },
  { name: 'Holographic',     state: { width: 320, height: 200, radius: 24, clip: 'none', bgType: 'conic',  color1: '#34d399', color2: '#a78bfa', angle: 0,   shX: 0, shY: 12, shBlur: 40, shSpread: 0,  shColor: '#a78bfa', blur: 0, brightness: 110, contrast: 100, hue: 0, sat: 130, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'spin 8s linear infinite',         blend: 'normal', opacity: 100 } },
  { name: 'Soft star',       state: { width: 280, height: 280, radius: 0,  clip: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', bgType: 'linear', color1: '#fbbf24', color2: '#f472b6', angle: 135, shX: 0, shY: 0, shBlur: 40, shSpread: 0, shColor: '#fbbf24', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0, skewY: 0, anim: 'wobble 5s ease-in-out infinite', blend: 'normal', opacity: 100 } },
  { name: 'Aurora',          state: { width: 400, height: 200, radius: 24, clip: 'none', bgType: 'linear', color1: '#34d399', color2: '#a78bfa', angle: 90,  shX: 0, shY: 0,  shBlur: 60, shSpread: 0,  shColor: '#34d399', blur: 0, brightness: 110, contrast: 100, hue: 0, sat: 120, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'float 4s ease-in-out infinite',   blend: 'screen', opacity: 100 } },
  { name: 'Cyberpunk hex',   state: { width: 240, height: 240, radius: 0,  clip: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)', bgType: 'linear', color1: '#f472b6', color2: '#06b6d4', angle: 135, shX: 0, shY: 0, shBlur: 40, shSpread: 0, shColor: '#06b6d4', blur: 0, brightness: 110, contrast: 120, hue: 0, sat: 130, rotate: 0, scale: 100, skewX: 0, skewY: 0, anim: 'none', blend: 'normal', opacity: 100 } },
  { name: 'Soft pastel',     state: { width: 280, height: 200, radius: 35, clip: 'none', bgType: 'linear', color1: '#fcd34d', color2: '#fb7185', angle: 135, shX: 0, shY: 16, shBlur: 40, shSpread: -10, shColor: '#fb7185', blur: 0, brightness: 100, contrast: 90,  hue: 0, sat: 80,  rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'none',                            blend: 'normal', opacity: 100 } },
  { name: 'Glitch',          state: { width: 320, height: 200, radius: 8,  clip: 'none', bgType: 'linear', color1: '#ff00aa', color2: '#00aaff', angle: 90,  shX: 4, shY: 0,  shBlur: 0,  shSpread: 0,   shColor: '#00aaff', blur: 0, brightness: 120, contrast: 130, hue: 0, sat: 130, rotate: 0, scale: 100, skewX: -2, skewY: 1, anim: 'none',                            blend: 'screen', opacity: 100 } },
  { name: 'Soap bubble',     state: { width: 240, height: 240, radius: 50, clip: 'circle(50%)', bgType: 'conic',  color1: '#a78bfa', color2: '#34d399', angle: 0,   shX: 0, shY: 0, shBlur: 0,  shSpread: -2, shColor: '#ffffff', blur: 1, brightness: 110, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'spin 12s linear infinite',        blend: 'normal', opacity: 80 } },
  { name: 'Lava lamp',       state: { width: 300, height: 400, radius: 50, clip: 'none', bgType: 'radial', color1: '#fb923c', color2: '#7c2d12', angle: 0,   shX: 0, shY: 0,  shBlur: 60, shSpread: 0,  shColor: '#fb923c', blur: 8, brightness: 110, contrast: 120, hue: 0, sat: 130, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'float 4s ease-in-out infinite',   blend: 'normal', opacity: 100 } },
  { name: 'Triangular flag', state: { width: 300, height: 300, radius: 0,  clip: 'polygon(50% 0%, 0% 100%, 100% 100%)', bgType: 'linear', color1: '#ef4444', color2: '#f97316', angle: 135, shX: 0, shY: 8, shBlur: 24, shSpread: 0, shColor: '#000000', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0, skewY: 0, anim: 'none', blend: 'normal', opacity: 100 } },
  { name: 'Frosted glass',   state: { width: 300, height: 200, radius: 16, clip: 'none', bgType: 'linear', color1: '#ffffff', color2: '#e0e7ff', angle: 135, shX: 0, shY: 8,  shBlur: 32, shSpread: -8, shColor: '#000000', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 50,  rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'none',                            blend: 'normal', opacity: 30 } },
  { name: 'Sunset',          state: { width: 400, height: 300, radius: 0,  clip: 'circle(50% at 50% 100%)', bgType: 'radial', color1: '#fbbf24', color2: '#dc2626', angle: 0, shX: 0, shY: 0, shBlur: 60, shSpread: 0, shColor: '#dc2626', blur: 0, brightness: 110, contrast: 100, hue: 0, sat: 120, rotate: 0, scale: 100, skewX: 0, skewY: 0, anim: 'none', blend: 'normal', opacity: 100 } },
  { name: 'Neon sign',       state: { width: 380, height: 120, radius: 24, clip: 'none', bgType: 'solid',  color1: '#0f172a', color2: '#0f172a', angle: 0,   shX: 0, shY: 0,  shBlur: 24, shSpread: 2,  shColor: '#06b6d4', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'pulse 3s ease-in-out infinite',   blend: 'normal', opacity: 100 } },
  { name: 'Spinning gem',    state: { width: 200, height: 200, radius: 0,  clip: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)', bgType: 'conic', color1: '#06b6d4', color2: '#a78bfa', angle: 0, shX: 0, shY: 0, shBlur: 40, shSpread: 0, shColor: '#a78bfa', blur: 0, brightness: 120, contrast: 110, hue: 0, sat: 130, rotate: 0, scale: 100, skewX: 0, skewY: 0, anim: 'spin 4s linear infinite', blend: 'normal', opacity: 100 } },
  { name: 'Vapor wave',      state: { width: 400, height: 240, radius: 0,  clip: 'none', bgType: 'linear', color1: '#f472b6', color2: '#06b6d4', angle: 180, shX: 0, shY: 0,  shBlur: 0,  shSpread: 0,  shColor: '#000000', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'none',                            blend: 'normal', opacity: 100 } },
  { name: 'Wobbly blob',     state: { width: 240, height: 240, radius: 50, clip: 'none', bgType: 'radial', color1: '#a78bfa', color2: '#7c3aed', angle: 0,   shX: 0, shY: 8,  shBlur: 30, shSpread: 0,  shColor: '#7c3aed', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'wobble 3s ease-in-out infinite',  blend: 'normal', opacity: 100 } },
  { name: 'Toaster',         state: { width: 300, height: 200, radius: 50, clip: 'none', bgType: 'linear', color1: '#f97316', color2: '#dc2626', angle: 90,  shX: 0, shY: 12, shBlur: 24, shSpread: 0,  shColor: '#000000', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'none',                            blend: 'normal', opacity: 100 } },
  { name: 'Glassmorphism',   state: { width: 340, height: 220, radius: 16, clip: 'none', bgType: 'linear', color1: '#ffffff', color2: '#a78bfa', angle: 135, shX: 0, shY: 8,  shBlur: 32, shSpread: -8, shColor: '#a78bfa', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 60,  rotate: 0, scale: 100, skewX: 0,  skewY: 0, anim: 'none',                            blend: 'normal', opacity: 50 } },
  { name: 'Comic burst',     state: { width: 280, height: 280, radius: 0,  clip: 'polygon(50% 0%, 61% 18%, 78% 8%, 79% 28%, 98% 35%, 84% 47%, 95% 64%, 75% 65%, 80% 88%, 60% 76%, 50% 100%, 40% 76%, 20% 88%, 25% 65%, 5% 64%, 16% 47%, 2% 35%, 21% 28%, 22% 8%, 39% 18%)', bgType: 'linear', color1: '#fbbf24', color2: '#f97316', angle: 135, shX: 0, shY: 0, shBlur: 0, shSpread: 8, shColor: '#000000', blur: 0, brightness: 100, contrast: 100, hue: 0, sat: 100, rotate: 0, scale: 100, skewX: 0, skewY: 0, anim: 'wobble 4s ease-in-out infinite', blend: 'normal', opacity: 100 } },
];

// presets dialog
const presetsDlg = document.getElementById('presets-dialog');
const presetsGrid = document.getElementById('presets-grid');

function buildThumb(stateObj, name, onClick) {
  const wrap = document.createElement('div');
  wrap.className = 'lab-thumb';
  wrap.tabIndex = 0;

  const inner = document.createElement('div');
  Object.assign(inner.style, buildCSS(stateObj));
  // shrink-to-fit inside thumb cell
  inner.style.width = '70%';
  inner.style.height = '70%';
  inner.style.maxWidth = '120px';
  inner.style.maxHeight = '120px';
  inner.style.transformOrigin = 'center';

  const lbl = document.createElement('div');
  lbl.className = 'lab-thumb__name';
  lbl.textContent = name;

  wrap.appendChild(inner);
  wrap.appendChild(lbl);
  wrap.addEventListener('click', onClick);
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  });
  return wrap;
}

function renderPresets() {
  presetsGrid.innerHTML = '';
  PRESETS.forEach((p, i) => {
    const wrap = buildThumb(p.state, p.name, () => {
      applyState(p.state);
      try { state.emit('lab:fork', { presetIndex: i }); } catch {}
      presetsDlg.close();
    });
    presetsGrid.appendChild(wrap);
  });
}
document.getElementById('lab-presets').addEventListener('click', () => {
  renderPresets();
  presetsDlg.showModal();
});

// gallery dialog (saved creations)
const galleryDlg = document.getElementById('gallery-dialog');
const galleryGrid = document.getElementById('gallery-grid');

function renderGallery() {
  const items = state.get('lab.creations') || [];
  galleryGrid.innerHTML = '';
  if (!items.length) {
    galleryGrid.innerHTML = '<p style="grid-column:1/-1;color:oklch(0.7 0.04 280);text-align:center;padding:24px;">No saved creations yet. Click Save to add one.</p>';
    return;
  }
  items.forEach((it) => {
    const wrap = buildThumb(it.state, it.name, () => {
      applyState(it.state);
      galleryDlg.close();
    });
    galleryGrid.appendChild(wrap);
  });
}
document.getElementById('lab-gallery').addEventListener('click', () => {
  renderGallery();
  galleryDlg.showModal();
});

// save
const saveDlg = document.getElementById('save-dialog');
document.getElementById('lab-save').addEventListener('click', () => {
  document.getElementById('save-name').value = '';
  saveDlg.showModal();
});
document.getElementById('save-confirm').addEventListener('click', () => {
  const name = document.getElementById('save-name').value.trim() || 'Untitled';
  const items = state.get('lab.creations') || [];
  items.push({ id: Date.now(), name, state: { ...current } });
  state.set('lab.creations', items);
  try { state.emit('lab:create', { name }); } catch {}
  saveDlg.close();
});

// dialogs close
document.querySelectorAll('.lab-dialog [data-close]').forEach(b => {
  b.addEventListener('click', () => b.closest('dialog').close());
});

// randomize
document.getElementById('lab-randomize').addEventListener('click', () => {
  const r = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const hex = () => '#' + [0, 0, 0].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const types = ['solid', 'linear', 'radial', 'conic'];
  const blends = ['normal', 'multiply', 'screen', 'overlay', 'difference', 'exclusion'];
  const anims = ['none', 'spin 4s linear infinite', 'float 4s ease-in-out infinite', 'pulse 2s ease-in-out infinite', 'wobble 5s ease-in-out infinite'];
  applyState({
    width: r(150, 400), height: r(150, 400), radius: r(0, 50), clip: 'none',
    bgType: types[r(0, types.length - 1)], color1: hex(), color2: hex(), angle: r(0, 360),
    shX: r(-30, 30), shY: r(-10, 30), shBlur: r(0, 80), shSpread: r(-20, 20), shColor: hex(),
    blur: r(0, 6), brightness: r(80, 130), contrast: r(80, 140), hue: r(0, 360), sat: r(60, 180),
    rotate: r(-30, 30), scale: r(80, 120), skewX: r(-15, 15), skewY: r(-15, 15),
    anim: anims[r(0, anims.length - 1)], blend: blends[r(0, blends.length - 1)], opacity: r(60, 100),
  });
});

// reset
document.getElementById('lab-reset')?.addEventListener('click', () => applyState(DEFAULTS));

// copy CSS
document.getElementById('lab-copy-css').addEventListener('click', () => {
  navigator.clipboard?.writeText(cssOut.textContent).then(() => {
    const btn = document.getElementById('lab-copy-css');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy CSS'; }, 1500);
  }).catch(() => {});
});

// share URL — base64-encode current state and put in hash
document.getElementById('lab-share').addEventListener('click', () => {
  try {
    const encoded = btoa(JSON.stringify(current));
    const url = location.origin + location.pathname + '#share=' + encoded;
    navigator.clipboard?.writeText(url).then(() => {
      const btn = document.getElementById('lab-share');
      btn.textContent = 'URL copied!';
      setTimeout(() => { btn.textContent = 'Share URL'; }, 1500);
    }).catch(() => {});
  } catch {}
});

// export — render current shape as SVG (PNG attempt taints the canvas in Chromium
// because <foreignObject> rendering doesn't allow toDataURL; we serve SVG as the
// portable export format and try-then-fallback to PNG if the browser allows it).
document.getElementById('lab-export').addEventListener('click', () => {
  let triggered = false;
  try {
    const w = current.width + 80;
    const h = current.height + 80;
    const inlineCSS = Object.entries(buildCSS(current))
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(';');
    // Background fill matches body so the export looks like the editor.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <foreignObject x="40" y="40" width="${current.width}" height="${current.height}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="${inlineCSS}"></div>
      </foreignObject>
    </svg>`;

    // Attempt PNG via canvas; if the browser taints the canvas (Chromium does for
    // foreignObject HTML content), fall back to downloading the SVG directly.
    const downloadSvg = () => {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = 'lab-creation.svg';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (!triggered) { triggered = true; try { state.emit('lab:export', {}); } catch {} }
    };

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
        // toDataURL throws DOMException on tainted canvas — fall through to SVG.
        const data = c.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = 'lab-creation.png';
        a.href = data;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        if (!triggered) { triggered = true; try { state.emit('lab:export', {}); } catch {} }
      } catch (taintErr) {
        URL.revokeObjectURL(url);
        downloadSvg();
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); downloadSvg(); };
    img.src = url;
  } catch (e) {
    console.warn('Export failed', e);
  }
});

// undo/redo via Ctrl+Z / Ctrl+Y
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea,[contenteditable]')) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) {
    e.preventDefault();
    if (hIdx > 0) { hIdx--; applyState(history[hIdx], false); }
  } else if ((e.ctrlKey || e.metaKey) && (k === 'y' || (e.shiftKey && k === 'z'))) {
    e.preventDefault();
    if (hIdx < history.length - 1) { hIdx++; applyState(history[hIdx], false); }
  }
});

// load from share URL hash
function loadFromHash() {
  const m = location.hash.match(/#share=([^&]+)/);
  if (m) {
    try {
      const parsed = JSON.parse(atob(m[1]));
      applyState({ ...DEFAULTS, ...parsed }, false);
      return;
    } catch {}
  }
  applyState(DEFAULTS);
}
loadFromHash();
addEventListener('hashchange', loadFromHash);

// remember last open timestamp
try { state.set('lab.lastOpen', Date.now()); } catch {}
