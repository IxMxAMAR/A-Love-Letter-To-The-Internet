/* =============================================================
   zone-layers.js — Cascade Layers zone interactivity
   Zone 8 · Layer ordering sandbox with live CSS injection
   A Love Letter to the Web
   ============================================================= */

import { initCopyButtons } from './utils.js';
import { initScrollReveal } from './utils.js';

/* ── Layer definitions ──────────────────────────────────────── */

/**
 * Each layer defines the CSS properties it sets on .layer-target,
 * and display metadata for the UI.
 */
const LAYER_DEFS = {
  reset: {
    name:    'reset',
    label:   '@layer reset',
    hue:     340,
    color:   'oklch(72% 0.18 340)',
    fontSize:'1rem',
    border:  '2px solid oklch(72% 0.18 340)',
    weight:  400,
    symbol:  '①',
  },
  base: {
    name:    'base',
    label:   '@layer base',
    hue:     200,
    color:   'oklch(75% 0.2 200)',
    fontSize:'1.1rem',
    border:  '2px solid oklch(75% 0.2 200)',
    weight:  500,
    symbol:  '②',
  },
  components: {
    name:    'components',
    label:   '@layer components',
    hue:     140,
    color:   'oklch(70% 0.22 140)',
    fontSize:'1.25rem',
    border:  '2px solid oklch(70% 0.22 140)',
    weight:  600,
    symbol:  '③',
  },
  utilities: {
    name:    'utilities',
    label:   '@layer utilities',
    hue:     310,
    color:   'oklch(72% 0.25 310)',
    fontSize:'1.5rem',
    border:  '2px solid oklch(72% 0.25 310)',
    weight:  700,
    symbol:  '④',
  },
};

/* ── State ──────────────────────────────────────────────────── */

/** Current layer order, from lowest to highest priority (rightmost wins). */
let layerOrder = ['reset', 'base', 'components', 'utilities'];

/* ── DOM refs ───────────────────────────────────────────────── */

const deck         = document.getElementById('layer-deck');
const demoStyle    = document.getElementById('layer-demo-style');
const generatedPre = document.getElementById('generated-code');
const winnerName   = document.getElementById('winner-name');
const winnerBadge  = document.getElementById('winner-badge');
const sandboxWinner= document.getElementById('sandbox-winner');

/* ── Helpers ────────────────────────────────────────────────── */

/**
 * Build the CSS text for the <style> block based on current layerOrder.
 */
function buildLayerCSS(order) {
  const declaration = `@layer ${order.join(', ')};`;

  const blocks = order.map((name) => {
    const def = LAYER_DEFS[name];
    return [
      `  @layer ${name} {`,
      `    .layer-target {`,
      `      color: ${def.color};`,
      `      font-size: ${def.fontSize};`,
      `      border: ${def.border};`,
      `      font-weight: ${def.weight};`,
      `    }`,
      `  }`,
    ].join('\n');
  });

  return [declaration, '', ...blocks].join('\n');
}

/**
 * Build the human-readable generated CSS shown in the code block.
 */
function buildDisplayCSS(order) {
  const declaration = `@layer ${order.join(', ')};`;
  const blocks = order.map((name) => {
    const def = LAYER_DEFS[name];
    return (
      `\n@layer ${name} {\n` +
      `  .layer-target {\n` +
      `    color: ${def.color};\n` +
      `    font-size: ${def.fontSize};\n` +
      `    border: ${def.border};\n` +
      `    font-weight: ${def.weight};\n` +
      `  }\n` +
      `}`
    );
  });
  return declaration + blocks.join('');
}

/** Apply layer order: update style block + winner UI + code display. */
function applyLayerOrder(order) {
  layerOrder = order;

  // Inject new CSS
  if (demoStyle) {
    demoStyle.textContent = buildLayerCSS(order);
  }

  // Update generated code display
  if (generatedPre) {
    const codeEl = generatedPre.querySelector('code') ?? generatedPre;
    codeEl.textContent = buildDisplayCSS(order);
  }

  // Identify winner (last in order = highest priority)
  const winnerId = order[order.length - 1];
  const winner   = LAYER_DEFS[winnerId];

  if (winner && winnerName) {
    winnerName.textContent = winner.label;
    winnerName.style.setProperty('color', winner.color);
  }

  if (winner && winnerBadge) {
    winnerBadge.style.setProperty('--badge-hue', String(winner.hue));
  }

  // Update card winner classes
  const cards = deck?.querySelectorAll('.layer-card');
  cards?.forEach((card) => {
    const name = card.dataset.layerName;
    const isWinner = name === winnerId;
    card.classList.toggle('layer-card--winner', isWinner);
    if (isWinner) {
      card.style.setProperty('--card-hue', String(winner.hue));
    } else {
      card.style.removeProperty('--card-hue');
    }
  });
}

/** Read the current DOM card order and return layer names list. */
function readDOMOrder() {
  const cards = deck?.querySelectorAll('.layer-card[data-layer-name]');
  if (!cards) return layerOrder;
  return Array.from(cards).map((c) => c.dataset.layerName);
}

/* ── Drag & Drop ────────────────────────────────────────────── */

let dragCard       = null;   // The card being dragged
let dragOverCard   = null;   // Card currently being hovered over
let dropBefore     = true;   // Whether to insert before or after dragOverCard
let pointerStartX  = 0;
let pointerStartY  = 0;
let dragThreshold  = 6;      // px before drag starts

/**
 * Clamp a value between min and max.
 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Find which card element the pointer is over (excluding the dragged card).
 * Returns [targetCard, insertBefore].
 */
function findDropTarget(clientX) {
  const cards = Array.from(deck.querySelectorAll('.layer-card:not(.layer-card--dragging)'));
  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right) {
      const mid = rect.left + rect.width / 2;
      return [card, clientX < mid];
    }
  }
  // Past the end
  if (cards.length > 0) {
    const lastRect = cards[cards.length - 1].getBoundingClientRect();
    if (clientX > lastRect.right) return [cards[cards.length - 1], false];
    const firstRect = cards[0].getBoundingClientRect();
    if (clientX < firstRect.left) return [cards[0], true];
  }
  return [null, true];
}

/** Insert dragCard relative to target. */
function insertCard(target, before) {
  if (!dragCard || target === dragCard) return;
  if (before) {
    deck.insertBefore(dragCard, target);
  } else {
    target.insertAdjacentElement('afterend', dragCard);
  }
}

/* ── Pointer event handlers ─────────────────────────────────── */

let isDragging = false;

function onPointerDown(e) {
  const card = e.target.closest('.layer-card');
  if (!card || !deck.contains(card)) return;
  if (e.button !== 0 && e.pointerType === 'mouse') return;

  dragCard = card;
  pointerStartX = e.clientX;
  pointerStartY = e.clientY;
  isDragging = false;

  // Capture so we get all subsequent events
  card.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!dragCard) return;

  const dx = e.clientX - pointerStartX;
  const dy = e.clientY - pointerStartY;

  if (!isDragging) {
    if (Math.sqrt(dx * dx + dy * dy) < dragThreshold) return;
    isDragging = true;
    dragCard.classList.add('layer-card--dragging');
    deck.classList.add('deck--dragging');
  }

  // Find drop position
  const [target, before] = findDropTarget(e.clientX);
  if (target && target !== dragCard) {
    dragOverCard = target;
    dropBefore = before;

    // Live insertion for visual feedback
    insertCard(target, before);
    // Immediately reflect in order state + CSS for live preview
    const newOrder = readDOMOrder();
    applyLayerOrder(newOrder);
  }
}

function onPointerUp(e) {
  if (!dragCard) return;

  if (isDragging) {
    dragCard.classList.remove('layer-card--dragging');
    deck.classList.remove('deck--dragging');
    isDragging = false;

    // Final order application
    const newOrder = readDOMOrder();
    applyLayerOrder(newOrder);
  }

  dragCard = null;
  dragOverCard = null;
}

function onPointerCancel(e) {
  if (dragCard) {
    dragCard.classList.remove('layer-card--dragging');
    deck?.classList.remove('deck--dragging');
    isDragging = false;
    dragCard = null;
  }
}

/* ── Keyboard reordering ────────────────────────────────────── */

function onCardKeydown(e) {
  const card = e.target.closest('.layer-card');
  if (!card) return;

  const cards = Array.from(deck.querySelectorAll('.layer-card'));
  const index = cards.indexOf(card);

  if (e.key === 'ArrowLeft' && index > 0) {
    e.preventDefault();
    deck.insertBefore(card, cards[index - 1]);
    card.focus();
    applyLayerOrder(readDOMOrder());
  } else if (e.key === 'ArrowRight' && index < cards.length - 1) {
    e.preventDefault();
    cards[index + 1].insertAdjacentElement('afterend', card);
    card.focus();
    applyLayerOrder(readDOMOrder());
  }
}

/* ── Native drag fallback (for devices without pointer API) ──── */

function setupNativeDragFallback() {
  // Only activate if pointer events are unavailable
  if ('PointerEvent' in window) return;

  let dragSrc = null;

  deck.addEventListener('dragstart', (e) => {
    dragSrc = e.target.closest('.layer-card');
    if (!dragSrc) return;
    e.dataTransfer.effectAllowed = 'move';
    dragSrc.classList.add('layer-card--dragging');
  });

  deck.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  deck.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.layer-card');
    if (!target || target === dragSrc) return;
    const rect = target.getBoundingClientRect();
    const before = e.clientX < rect.left + rect.width / 2;
    if (before) {
      deck.insertBefore(dragSrc, target);
    } else {
      target.insertAdjacentElement('afterend', dragSrc);
    }
    applyLayerOrder(readDOMOrder());
  });

  deck.addEventListener('dragend', () => {
    dragSrc?.classList.remove('layer-card--dragging');
    dragSrc = null;
    deck.classList.remove('deck--dragging');
  });
}

/* ── Initialization ─────────────────────────────────────────── */

function init() {
  if (!deck) return;

  // Attach pointer events
  deck.addEventListener('pointerdown',   onPointerDown);
  deck.addEventListener('pointermove',   onPointerMove);
  deck.addEventListener('pointerup',     onPointerUp);
  deck.addEventListener('pointercancel', onPointerCancel);

  // Keyboard
  deck.addEventListener('keydown', onCardKeydown);

  // Native drag fallback
  setupNativeDragFallback();

  // Set initial order from DOM
  const initialOrder = readDOMOrder();
  applyLayerOrder(initialOrder);

  // Scroll reveal for story sections
  initScrollReveal();

  // Copy buttons
  initCopyButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
