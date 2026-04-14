/* =============================================================
   zone-scroll.js — Scroll Animations Zone interactive demo
   A Love Letter to the Web
   ============================================================= */

import { initCopyButtons, initScrollReveal } from './utils.js';

/* ── Keyframe definitions injected once into <head> ─────────── */
const KEYFRAME_CSS = `
@keyframes zone-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes zone-slide-up {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes zone-scale-up {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes zone-rotate-in {
  from {
    opacity: 0;
    transform: rotate(-45deg) scale(0.6);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}
`.trim();

/* ── Animation name map ─────────────────────────────────────── */
const ANIMATION_NAMES = {
  fade:   'zone-fade',
  slide:  'zone-slide-up',
  scale:  'zone-scale-up',
  rotate: 'zone-rotate-in',
};

/* ── Syntax-highlight a CSS string ─────────────────────────── */
/**
 * Minimal tokeniser: wraps known patterns with <span> tags that
 * match the `.code-block` colour variables in layout.css.
 *
 * @param {string} css
 * @returns {string} HTML string with syntax-highlight spans
 */
function highlight(css) {
  return css
    /* at-rules */
    .replace(/(@[\w-]+)/g, '<span class="keyword">$1</span>')
    /* property names (key: …) */
    .replace(/\b(animation(?:-[\w-]+)?|animation-timeline|animation-range)\b(?=\s*:)/g,
             '<span class="property">$1</span>')
    /* function calls like scroll(), view() */
    .replace(/\b(scroll|view|translateY|scale|rotate)\s*\(/g,
             '<span class="function">$1</span>(')
    /* quoted strings or unquoted values after : */
    .replace(/:\s*([^;{}@\n]+);/g, (match, val) => {
      const safe = val.trim();
      return `: <span class="value">${safe}</span>;`;
    })
    /* selectors (lines that end in { ) */
    .replace(/^(\.[\w-]+)\s*\{/gm, '<span class="selector">$1</span> {')
    /* comments */
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
}

/* ── Build CSS text from current control state ──────────────── */
/**
 * @param {string} timeline  - 'scroll' | 'view'
 * @param {string} animation - 'fade' | 'slide' | 'scale' | 'rotate'
 * @param {number} start     - 0..100
 * @param {number} end       - 0..100
 * @returns {string} raw CSS text
 */
function buildCSS(timeline, animation, start, end) {
  const animName = ANIMATION_NAMES[animation] ?? 'zone-fade';

  const timelineValue = timeline === 'view'
    ? 'view()'
    : 'scroll()';

  const rangeValue = timeline === 'view'
    ? `entry ${start}% entry ${end}%`
    : `${start}% ${end}%`;

  return [
    `.scroll-demo-box {`,
    `  animation: ${animName} linear both;`,
    `  animation-timeline: ${timelineValue};`,
    `  animation-range: ${rangeValue};`,
    `}`,
  ].join('\n');
}

/* ── Apply generated styles to the demo box ────────────────── */
/**
 * Injects (or replaces) a dynamic <style> tag and updates the
 * demo box's inline animation when using a scroll() timeline.
 *
 * @param {string} timeline
 * @param {string} animation
 * @param {number} start
 * @param {number} end
 */
function applyDemoStyles(timeline, animation, start, end) {
  const box = document.getElementById('scroll-demo-box');
  if (!box) return;

  const scroller = document.getElementById('demo-scroller');

  // Remove any previously injected demo style tag
  const old = document.getElementById('zone-scroll-demo-style');
  if (old) old.remove();

  const animName = ANIMATION_NAMES[animation] ?? 'zone-fade';

  // For scroll() timeline we use the demo-scroller as the named scroller
  // For view() we animate based on the box entering the scroller's viewport
  let styleContent;

  if (timeline === 'scroll') {
    // Attach scroll() timeline to the demo-scroller element
    styleContent = `
#demo-scroller {
  scroll-timeline-name: --demo-scroller;
}
#scroll-demo-box {
  animation: ${animName} linear both;
  animation-timeline: --demo-scroller;
  animation-range: ${start}% ${end}%;
}
`.trim();
  } else {
    // view() — element visibility inside the scroller
    styleContent = `
#scroll-demo-box {
  animation: ${animName} linear both;
  animation-timeline: view(block);
  animation-range: entry ${start}% entry ${end}%;
}
`.trim();
  }

  const tag = document.createElement('style');
  tag.id = 'zone-scroll-demo-style';
  tag.textContent = styleContent;
  document.head.appendChild(tag);
}

/* ── Update both code display and live demo ─────────────────── */
function updateDemo() {
  const timelineEl  = document.getElementById('timeline-type');
  const animEl      = document.getElementById('animation-select');
  const startEl     = document.getElementById('range-start');
  const endEl       = document.getElementById('range-end');
  const codeEl      = document.getElementById('scroll-generated-code');
  const startValEl  = document.getElementById('range-start-val');
  const endValEl    = document.getElementById('range-end-val');

  if (!timelineEl || !animEl || !startEl || !endEl || !codeEl) return;

  const timeline  = timelineEl.value;
  const animation = animEl.value;
  const start     = parseInt(startEl.value, 10);
  const end       = parseInt(endEl.value, 10);

  // Update range display labels
  if (startValEl) startValEl.textContent = start;
  if (endValEl)   endValEl.textContent   = end;

  // Update ARIA attributes on sliders
  startEl.setAttribute('aria-valuenow', start);
  endEl.setAttribute('aria-valuenow', end);

  // Generate CSS text for display
  const cssText = buildCSS(timeline, animation, start, end);

  // Syntax-highlight and inject into code block
  codeEl.innerHTML = highlight(cssText);

  // Apply live demo styles
  applyDemoStyles(timeline, animation, start, end);
}

/* ── Inject keyframe definitions once ──────────────────────── */
function injectKeyframes() {
  if (document.getElementById('zone-scroll-keyframes')) return;
  const tag = document.createElement('style');
  tag.id = 'zone-scroll-keyframes';
  tag.textContent = KEYFRAME_CSS;
  document.head.appendChild(tag);
}

/* ── Wire up controls ───────────────────────────────────────── */
function initControls() {
  const ids = ['timeline-type', 'animation-select', 'range-start', 'range-end'];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input',  updateDemo);
    el.addEventListener('change', updateDemo);
  });
}

/* ── Entry point ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectKeyframes();
  initControls();
  initCopyButtons();
  initScrollReveal();

  // Render initial state
  updateDemo();
});
