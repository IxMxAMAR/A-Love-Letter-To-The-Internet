/**
 * zone-houdini.js
 * CSS Houdini Zone — Paint API initialisation, slider controls,
 * generated CSS display, and copy button wiring.
 *
 * Imports initCopyButtons from ./utils.js.
 * Zone 6 · Accent: #60a5fa
 */

// ─── Utilities import ───────────────────────────────────────────
import { initCopyButtons } from './utils.js';

// ─── Feature Detection ──────────────────────────────────────────
const hasPaintAPI = 'paintWorklet' in CSS;

const supportBadge   = document.getElementById('supportBadge');
const supportText    = document.getElementById('supportText');
const canvasFallback = document.getElementById('canvasFallback');

if (supportBadge && supportText) {
  if (hasPaintAPI) {
    supportBadge.setAttribute('data-supported', 'true');
    supportText.textContent = 'Paint API supported — live worklet active';
  } else {
    supportBadge.setAttribute('data-supported', 'false');
    supportText.textContent = 'Paint API unavailable — showing CSS fallback';
    if (canvasFallback) canvasFallback.hidden = false;
  }
}

// ─── Register Paint Worklet ─────────────────────────────────────
if (hasPaintAPI) {
  try {
    await CSS.paintWorklet.addModule('../js/worklets/pattern-worklet.js');
  } catch (err) {
    console.warn('[Houdini] Could not register paint worklet:', err);
    if (supportBadge && supportText) {
      supportBadge.setAttribute('data-supported', 'false');
      supportText.textContent = 'Worklet failed to load — showing CSS fallback';
    }
    if (canvasFallback) canvasFallback.hidden = false;
  }
}

// ─── Playground Sliders ─────────────────────────────────────────
const playgroundCanvas = document.getElementById('playgroundCanvas');

/**
 * Control definitions — each binds a slider to a CSS custom property.
 * @type {Array<{sliderId: string, outputId: string, property: string, unit: string}>}
 */
const controls = [
  { sliderId: 'sliderDensity', outputId: 'valueDensity', property: '--pattern-density', unit: ''  },
  { sliderId: 'sliderHue',     outputId: 'valueHue',     property: '--pattern-color-h', unit: '°' },
  { sliderId: 'sliderSize',    outputId: 'valueSize',     property: '--pattern-size',    unit: 'px'},
];

/** Tracks live values for the generated CSS display. */
const currentValues = {};

/**
 * Rebuild and display the live-generated CSS snippet.
 */
function updateGeneratedCSS() {
  const codeEl = document.querySelector('#generatedCssOutput code');
  if (!codeEl) return;

  const density = currentValues['--pattern-density'] ?? 12;
  const hue     = currentValues['--pattern-color-h'] ?? 210;
  const size    = currentValues['--pattern-size']    ?? 40;

  codeEl.innerHTML =
    `<span class="token-selector">.my-element</span> {\n` +
    `  <span class="token-comment">/* Registered @property custom properties */</span>\n` +
    `  <span class="token-property">--pattern-density</span>: <span class="token-number">${density}</span>;\n` +
    `  <span class="token-property">--pattern-color-h</span>: <span class="token-number">${hue}</span>;\n` +
    `  <span class="token-property">--pattern-size</span>:    <span class="token-number">${size}</span>;\n` +
    `\n` +
    `  <span class="token-comment">/* Paint worklet as background */</span>\n` +
    `  <span class="token-property">background-image</span>: <span class="token-value">paint(patternPainter)</span>;\n` +
    `\n` +
    `  <span class="token-comment">/* Fallback for unsupported browsers */</span>\n` +
    `  <span class="token-property">background-color</span>: <span class="token-value">oklch(12% 0.015 265)</span>;\n` +
    `}`;
}

/**
 * Bind a single slider to its CSS custom property and output element.
 */
function wireControl({ sliderId, outputId, property, unit }) {
  const slider = document.getElementById(sliderId);
  const output = document.getElementById(outputId);
  if (!slider) return;

  currentValues[property] = Number(slider.value);

  function applyValue(val) {
    const numeric = Number(val);
    currentValues[property] = numeric;

    if (playgroundCanvas) {
      playgroundCanvas.style.setProperty(property, numeric);
    }

    if (output) {
      output.textContent = unit ? `${numeric}${unit}` : String(numeric);
    }

    updateGeneratedCSS();
  }

  applyValue(slider.value);
  slider.addEventListener('input', (e) => applyValue(e.target.value));
}

controls.forEach(wireControl);
updateGeneratedCSS();

// ─── Copy Buttons ───────────────────────────────────────────────
// initCopyButtons from utils.js handles all .copy-btn[data-target] elements
initCopyButtons();
