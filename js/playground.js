/* =============================================================
   playground.js — Live CSS sandbox: editor, preview, presets, share
   A Love Letter to the Web
   ============================================================= */

'use strict';

// ── Preset Snippets ────────────────────────────────────────────
const PRESETS = {
  'scroll-animations': `/* Scroll-Driven Animations (CSS-native, no JS) */

/* The progress bar shrinks in from the left as you scroll */
.progress {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, oklch(60% 0.2 265), oklch(70% 0.18 295));
  transform-origin: left;
  transform: scaleX(0);
  animation: grow linear;
  animation-timeline: scroll(root);
}

@keyframes grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* Cards fade + rise as they enter the viewport */
.card {
  opacity: 0;
  transform: translateY(2rem);
  animation: card-reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 50%;
}

@keyframes card-reveal {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`,

  'container-queries': `/* Container Queries — layout adapts to *container* size */

.card-container {
  container-type: inline-size;
  container-name: card;
  border: 1px solid oklch(25% 0.03 265);
  border-radius: 12px;
  overflow: hidden;
  resize: horizontal; /* drag me! */
  max-width: 100%;
}

.card-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1.25rem;
  background: oklch(12% 0.015 265);
}

/* When the container is wide enough, switch to side-by-side */
@container card (min-width: 420px) {
  .card-inner {
    grid-template-columns: auto 1fr;
    align-items: center;
  }

  .card-avatar {
    grid-row: 1 / 3;
  }
}

.card-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, oklch(60% 0.2 265), oklch(70% 0.18 295));
}

.card-title {
  font-weight: 700;
  color: oklch(90% 0.01 265);
  margin: 0;
}

.card-body {
  font-size: 0.875rem;
  color: oklch(60% 0.03 265);
  margin: 0;
}`,

  'has-selector': `/* :has() — CSS parent selector */

/* Form field highlights when its input is filled */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1rem;
  border: 1px solid oklch(25% 0.03 265);
  border-radius: 10px;
  background: oklch(12% 0.015 265);
  transition: border-color 250ms ease, background 250ms ease;
}

/* Field with a filled input gets a glow */
.field:has(input:not(:placeholder-shown)) {
  border-color: oklch(60% 0.18 265 / 0.6);
  background: oklch(60% 0.18 265 / 0.06);
}

/* Label turns accent when input is focused */
.field:has(input:focus) label {
  color: oklch(65% 0.18 265);
}

/* Invalid input highlights the whole field red */
.field:has(input:invalid:not(:placeholder-shown)) {
  border-color: oklch(65% 0.22 25 / 0.6);
  background: oklch(65% 0.22 25 / 0.06);
}

label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: oklch(55% 0.03 265);
  transition: color 200ms ease;
}

input {
  background: transparent;
  border: none;
  border-bottom: 1px solid oklch(30% 0.03 265);
  padding: 0.375rem 0;
  color: oklch(88% 0.01 265);
  outline: none;
  font-size: 1rem;
  transition: border-color 200ms ease;
}

input:focus {
  border-color: oklch(60% 0.18 265);
}`,

  'gradients': `/* Modern CSS Gradients — conic, radial, oklch */

.gradient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.swatch {
  height: 140px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

/* Conic gradient — hard stops */
.swatch-1 {
  background: conic-gradient(
    from 0deg,
    oklch(65% 0.22 265),
    oklch(70% 0.2 295),
    oklch(68% 0.22 325),
    oklch(65% 0.22 265)
  );
}

/* Mesh gradient simulation */
.swatch-2 {
  background:
    radial-gradient(ellipse at 20% 20%, oklch(68% 0.22 200 / 0.9) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, oklch(65% 0.22 280 / 0.9) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, oklch(70% 0.2 350 / 0.7) 0%, transparent 55%),
    oklch(12% 0.015 265);
}

/* Linear with oklch perceptual stops */
.swatch-3 {
  background: linear-gradient(
    135deg,
    oklch(65% 0.28 25),
    oklch(68% 0.24 60),
    oklch(72% 0.2 100)
  );
}

/* Conic with @property animation */
.swatch-4 {
  background: conic-gradient(
    from 45deg at 30% 40%,
    oklch(72% 0.2 140),
    oklch(68% 0.22 200),
    oklch(60% 0.24 265),
    oklch(72% 0.2 140)
  );
}

/* Hard-stop stripes */
.swatch-5 {
  background: repeating-linear-gradient(
    -45deg,
    oklch(15% 0.02 265),
    oklch(15% 0.02 265) 10px,
    oklch(60% 0.18 265 / 0.15) 10px,
    oklch(60% 0.18 265 / 0.15) 20px
  );
}

/* Radial spotlight */
.swatch-6 {
  background:
    radial-gradient(
      circle at center,
      oklch(72% 0.24 60) 0%,
      oklch(60% 0.2 25) 40%,
      oklch(20% 0.04 265) 100%
    );
}`,

  'grid': `/* CSS Grid — subgrid, auto-fill, named areas */

/* Holy Grail layout with named areas */
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 140px 1fr 120px;
  grid-template-rows: auto 1fr auto;
  gap: 0.75rem;
  min-height: 280px;
  font-size: 0.75rem;
  font-family: monospace;
}

.hg-header { grid-area: header; }
.hg-nav    { grid-area: nav;    }
.hg-main   { grid-area: main;   }
.hg-aside  { grid-area: aside;  }
.hg-footer { grid-area: footer; }

.holy-grail > * {
  background: oklch(60% 0.18 265 / 0.12);
  border: 1px solid oklch(60% 0.18 265 / 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: oklch(68% 0.18 265);
  font-weight: 600;
}

/* Auto-fill responsive grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 100px), 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.auto-grid-cell {
  aspect-ratio: 1;
  background: linear-gradient(135deg, oklch(60% 0.18 265 / 0.2), oklch(70% 0.15 295 / 0.2));
  border: 1px solid oklch(60% 0.18 265 / 0.2);
  border-radius: 8px;
}`,
};

// ── Preview HTML shell ─────────────────────────────────────────
function buildPreviewDoc(css) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
/* Preview reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { color-scheme: dark; }
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: oklch(10% 0.012 265);
  color: oklch(88% 0.01 265);
  padding: 1.5rem;
  min-height: 100vh;
  line-height: 1.6;
  font-size: 15px;
}
/* Default demo markup styles (can be overridden by user CSS) */
.preview-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
<style id="user-styles">
${css}
</style>
</head>
<body>
<div class="preview-demo">
  <!-- Scroll Animations demo -->
  <div class="progress" style="display:none"></div>

  <!-- Cards for scroll animation / :has / container queries -->
  <div class="card-container">
    <div class="card-inner">
      <div class="card-avatar"></div>
      <p class="card-title">Container Query Card</p>
      <p class="card-body">Resize the pane to see layout changes.</p>
    </div>
  </div>

  <div class="card">Card with scroll reveal</div>

  <!-- Form demo for :has() -->
  <div class="field">
    <label for="demo-input">Your Name</label>
    <input id="demo-input" type="text" placeholder="Type something…">
  </div>

  <div class="field">
    <label for="demo-email">Email</label>
    <input id="demo-email" type="email" placeholder="you@example.com">
  </div>

  <!-- Gradient demo -->
  <div class="gradient-grid">
    <div class="swatch swatch-1"></div>
    <div class="swatch swatch-2"></div>
    <div class="swatch swatch-3"></div>
    <div class="swatch swatch-4"></div>
    <div class="swatch swatch-5"></div>
    <div class="swatch swatch-6"></div>
  </div>

  <!-- Grid demo -->
  <div class="holy-grail">
    <header class="hg-header">header</header>
    <nav class="hg-nav">nav</nav>
    <main class="hg-main">main</main>
    <aside class="hg-aside">aside</aside>
    <footer class="hg-footer">footer</footer>
  </div>

  <div class="auto-grid">
    ${Array.from({ length: 12 }, (_, i) => `<div class="auto-grid-cell"></div>`).join('\n    ')}
  </div>
</div>
</body>
</html>`;
}

// ── DOM References ─────────────────────────────────────────────
const editor       = document.getElementById('editor');
const previewFrame = document.getElementById('preview-frame');
const lineNumbers  = document.getElementById('line-numbers');
const statusText   = document.getElementById('status-text');
const labStatus    = document.querySelector('.lab-status');
const btnShare     = document.getElementById('btn-share');
const btnClear     = document.getElementById('btn-clear');
const btnRefresh   = document.getElementById('btn-refresh');
const toast        = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const presetBtns   = document.querySelectorAll('.preset-pill');

// ── State ──────────────────────────────────────────────────────
let activePreset   = null;
let updateTimer    = null;
let toastTimer     = null;

// ── Preview Rendering ──────────────────────────────────────────
function renderPreview(css) {
  const doc = buildPreviewDoc(css);
  previewFrame.srcdoc = doc;
}

// ── Debounced live update ──────────────────────────────────────
function scheduleUpdate() {
  setStatus('updating');
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    const css = editor.textContent;
    renderPreview(css);
    setStatus('ready');
  }, 300);
}

// ── Status indicator ──────────────────────────────────────────
function setStatus(state) {
  if (state === 'updating') {
    labStatus.classList.add('updating');
    statusText.textContent = 'Updating…';
  } else {
    labStatus.classList.remove('updating');
    statusText.textContent = 'Ready';
  }
}

// ── Line Numbers ───────────────────────────────────────────────
function updateLineNumbers() {
  const text    = editor.textContent;
  const lines   = text.split('\n');
  const count   = Math.max(lines.length, 1);
  const current = lineNumbers.children.length;

  if (current < count) {
    for (let i = current; i < count; i++) {
      const span = document.createElement('span');
      span.textContent = i + 1;
      lineNumbers.appendChild(span);
    }
  } else if (current > count) {
    while (lineNumbers.children.length > count) {
      lineNumbers.removeChild(lineNumbers.lastChild);
    }
  }
}

// ── Set Editor Content ─────────────────────────────────────────
function setEditorContent(text) {
  editor.textContent = text;
  updateLineNumbers();
  scheduleUpdate();
}

// ── Load Preset ────────────────────────────────────────────────
function loadPreset(key) {
  const css = PRESETS[key];
  if (!css) return;

  // Update active state
  presetBtns.forEach((btn) => {
    const isActive = btn.dataset.preset === key;
    btn.setAttribute('aria-pressed', String(isActive));
    btn.classList.toggle('active', isActive);
  });
  activePreset = key;

  setEditorContent(css);
}

// ── Deactivate all presets ─────────────────────────────────────
function clearActivePreset() {
  presetBtns.forEach((btn) => {
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('active');
  });
  activePreset = null;
}

// ── Toast ──────────────────────────────────────────────────────
function showToast(message, icon = '✓') {
  clearTimeout(toastTimer);
  const iconEl = toast.querySelector('.toast__icon');
  iconEl.textContent = icon;
  toastMessage.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ── Share ──────────────────────────────────────────────────────
function shareContent() {
  const css = editor.textContent.trim();
  if (!css) {
    showToast('Nothing to share — write some CSS first!', '!');
    return;
  }

  try {
    const encoded = btoa(unescape(encodeURIComponent(css)));
    const url     = `${location.pathname}#${encoded}`;

    // Update URL hash without reloading
    history.replaceState(null, '', url);

    // Copy full URL to clipboard if available
    const fullUrl = `${location.origin}${url}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('Link copied to clipboard!', '✓');
      }).catch(() => {
        showToast('URL hash updated — copy from address bar', '✓');
      });
    } else {
      showToast('URL hash updated — copy from address bar', '✓');
    }
  } catch {
    showToast('Could not encode content', '!');
  }
}

// ── Load from URL hash ─────────────────────────────────────────
function loadFromHash() {
  const hash = location.hash.slice(1); // strip '#'
  if (!hash) return false;

  try {
    const decoded = decodeURIComponent(escape(atob(hash)));
    setEditorContent(decoded);
    return true;
  } catch {
    // Hash wasn't valid base64 — ignore
    return false;
  }
}

// ── Clear ──────────────────────────────────────────────────────
function clearEditor() {
  editor.textContent = '';
  lineNumbers.innerHTML = '';
  previewFrame.srcdoc = buildPreviewDoc('');
  clearActivePreset();
  history.replaceState(null, '', location.pathname);
  setStatus('ready');
  editor.focus();
}

// ── Handle Tab key in editor ───────────────────────────────────
function handleEditorKeydown(event) {
  if (event.key === 'Tab') {
    event.preventDefault();
    document.execCommand('insertText', false, '  ');
  }
}

// ── Handle paste — strip HTML formatting ──────────────────────
function handleEditorPaste(event) {
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain') ?? '';
  document.execCommand('insertText', false, text);
}

// ── Init ───────────────────────────────────────────────────────
function init() {
  // Try to load from URL hash first
  const loadedFromHash = loadFromHash();

  // If no hash, load a nice default
  if (!loadedFromHash) {
    loadPreset('scroll-animations');
  } else {
    updateLineNumbers();
    scheduleUpdate();
  }

  // Editor events
  editor.addEventListener('input', () => {
    updateLineNumbers();
    clearActivePreset();
    scheduleUpdate();
  });

  editor.addEventListener('keydown', handleEditorKeydown);
  editor.addEventListener('paste', handleEditorPaste);

  // Sync scroll between editor and line numbers
  editor.parentElement.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editor.parentElement.scrollTop;
  });

  // Preset buttons
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      if (key) loadPreset(key);
    });
  });

  // Action buttons
  btnShare.addEventListener('click', shareContent);
  btnClear.addEventListener('click', clearEditor);
  btnRefresh.addEventListener('click', () => {
    renderPreview(editor.textContent);
    showToast('Preview refreshed', '↺');
  });

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => {
    loadFromHash();
  });
}

// ── Boot ───────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
