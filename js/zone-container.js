/* =============================================================
   zone-container.js — Container Queries Zone Interactivity
   A Love Letter to the Web · Zone 4
   ============================================================= */

import { initCopyButtons, initScrollReveal } from './utils.js';

/* ── Breakpoint definitions (must match zone-container.css) ─── */
const BREAKPOINTS = [
  {
    name: 'Nano',
    cls: 'cq-bp--nano',
    min: 0,
    max: 180,
    label: 'Nano — default layout (< 180px)',
    cssBlocks: [
      '/* No @container rule active — base styles apply */',
      '.product-card {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  padding: 0.75rem 0.5rem;',
      '}',
    ],
  },
  {
    name: 'Compact',
    cls: 'cq-bp--compact',
    min: 180,
    max: 380,
    label: 'Compact layout (180px – 380px)',
    cssBlocks: [
      '@container product-card (min-width: 180px) {',
      '  .product-card {',
      '    padding: 1.25rem 1rem;',
      '    gap: 0.75rem;',
      '  }',
      '  .pc-image  { width: 64px; height: 64px; }',
      '  .pc-tagline { display: block; text-align: center; }',
      '  .pc-cta    { display: inline-flex; }',
      '}',
    ],
  },
  {
    name: 'Row',
    cls: 'cq-bp--row',
    min: 380,
    max: 620,
    label: 'Horizontal row layout (380px – 620px)',
    cssBlocks: [
      '@container product-card (min-width: 180px) { /* ... */ }',
      '',
      '@container product-card (min-width: 380px) {',
      '  .product-card {',
      '    flex-direction: row;',
      '    align-items: center;',
      '    padding: 1.5rem;',
      '    gap: 1.5rem;',
      '  }',
      '  .pc-image  { width: 80px; height: 80px; flex-shrink: 0; }',
      '  .pc-body   { align-items: flex-start; flex: 1; }',
      '  .pc-tagline { text-align: left; }',
      '}',
    ],
  },
  {
    name: 'Hero',
    cls: 'cq-bp--hero',
    min: 620,
    max: Infinity,
    label: 'Full hero banner layout (≥ 620px)',
    cssBlocks: [
      '@container product-card (min-width: 180px) { /* ... */ }',
      '@container product-card (min-width: 380px) { /* ... */ }',
      '',
      '@container product-card (min-width: 620px) {',
      '  .product-card {',
      '    padding: 2.5rem;',
      '    gap: 2.5rem;',
      '    background: linear-gradient(135deg, ...);',
      '  }',
      '  .pc-image  { width: clamp(120px, 20cqi, 200px); }',
      '  .pc-name   { font-size: clamp(1.1rem, 3cqi, 1.75rem); }',
      '  .pc-tagline { max-width: 40ch; }',
      '  .pc-price-note { display: inline; }',
      '  .pc-actions { display: flex; }',
      '}',
    ],
  },
];

/* ── Breakpoint resolver ─────────────────────────────────────── */
function resolveBreakpoint(width) {
  for (let i = BREAKPOINTS.length - 1; i >= 0; i--) {
    if (width >= BREAKPOINTS[i].min) return BREAKPOINTS[i];
  }
  return BREAKPOINTS[0];
}

/* ── DOM helpers ─────────────────────────────────────────────── */
/**
 * @param {number} width
 * @param {object} bp
 */
function updateUI(width, bp) {
  // Width display
  const valueEl = document.getElementById('cq-width-value');
  const activeBpEl = document.getElementById('cq-active-bp');
  if (valueEl) valueEl.textContent = Math.round(width);
  if (activeBpEl) activeBpEl.textContent = bp.label;

  // Breakpoint bar indicators
  document.querySelectorAll('.cq-bp-item').forEach((item) => {
    item.classList.toggle('is-active', item.classList.contains(bp.cls));
  });

  // Generated CSS
  const codeEl = document.getElementById('cq-generated-code');
  const noteEl = document.getElementById('cq-generated-note');
  if (codeEl) {
    codeEl.textContent = bp.cssBlocks.join('\n');
  }
  if (noteEl) {
    noteEl.textContent = `Active breakpoint: ${bp.name}`;
  }
}

/* ── Drag-to-resize logic ────────────────────────────────────── */
function initResizePlayground() {
  const outer   = document.getElementById('cq-resizable-outer');
  const resizable = document.getElementById('cq-resizable');
  const handle  = document.getElementById('cq-resize-handle');

  if (!outer || !resizable || !handle) return;

  let isDragging = false;
  let startX     = 0;
  let startWidth = 0;

  /** Clamp resizable width between limits */
  function clampWidth(w) {
    const maxW = outer.getBoundingClientRect().width - 36; // leave room for handle
    return Math.max(90, Math.min(w, maxW));
  }

  /** Apply width and refresh UI */
  function applyWidth(w) {
    const clamped = clampWidth(w);
    resizable.style.width = clamped + 'px';
    const bp = resolveBreakpoint(clamped);
    updateUI(clamped, bp);
  }

  /* Initialise display immediately */
  const initialWidth = resizable.getBoundingClientRect().width || 280;
  updateUI(initialWidth, resolveBreakpoint(initialWidth));

  /* ── Pointer events ── */
  handle.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX     = e.clientX;
    startWidth = resizable.getBoundingClientRect().width;

    handle.setPointerCapture(e.pointerId);
    outer.classList.add('is-dragging');

    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const delta    = e.clientX - startX;
    applyWidth(startWidth + delta);
  });

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    outer.classList.remove('is-dragging');
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  handle.addEventListener('pointerup',     stopDrag);
  handle.addEventListener('pointercancel', stopDrag);

  /* ── Keyboard resize (arrow keys) ── */
  handle.addEventListener('keydown', (e) => {
    const STEP = e.shiftKey ? 50 : 10;
    let current = resizable.getBoundingClientRect().width;

    if (e.key === 'ArrowRight') {
      applyWidth(current + STEP);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      applyWidth(current - STEP);
      e.preventDefault();
    }
  });

  /* ── Recompute on window resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = resizable.getBoundingClientRect().width;
      updateUI(w, resolveBreakpoint(w));
    }, 100);
  });
}

/* ── Init ────────────────────────────────────────────────────── */
function init() {
  initCopyButtons();
  initScrollReveal();
  initResizePlayground();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
