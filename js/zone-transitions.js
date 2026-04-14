/* =============================================================
   zone-transitions.js — View Transitions Zone (Zone 5)
   A Love Letter to the Web
   ============================================================= */

import { initCopyButtons, initScrollReveal } from './utils.js';

// ── Card data ────────────────────────────────────────────────
const CARD_DATA = {
  'card-1': {
    icon: '⇄',
    label: '01',
    title: 'Morphing',
    text: `Elements reshape and reflow across DOM states without jarring visual cuts.
The browser captures a screenshot of the old state, renders the new state,
and animates the geometry between them — position, size, shape — automatically.
You control the timing and easing with CSS keyframes.`,
    code: `// Trigger a morph between two layout states
document.startViewTransition(() => {
  card.classList.toggle('expanded');
});

// CSS: the shared element travels between states
.card { view-transition-name: card-hero; }
::view-transition-old(card-hero) { animation: shrink 400ms ease both; }
::view-transition-new(card-hero) { animation: expand 400ms ease both; }`,
  },
  'card-2': {
    icon: '◑',
    label: '02',
    title: 'Crossfade',
    text: `The default transition: old state dissolves as the new state appears.
No special CSS required — document.startViewTransition() gives you this for free.
The root pseudo-element captures the entire viewport and fades between snapshots.`,
    code: `// Zero configuration needed — crossfade is the default
document.startViewTransition(() => {
  updateDOM(); // any DOM mutation
});

// Override root timing if desired
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
  animation-timing-function: ease-in-out;
}`,
  },
  'card-3': {
    icon: '→',
    label: '03',
    title: 'Slide',
    text: `Directional movement creates spatial metaphors. Navigating "forward" slides left;
going "back" slides right. This mirrors native mobile app conventions and tells
users where they are in an information hierarchy — without a single word.`,
    code: `// Slide in from the right (forward navigation)
::view-transition-old(root) {
  animation: slide-out-left 400ms ease-in-out both;
}
::view-transition-new(root) {
  animation: slide-in-right 400ms ease-in-out both;
}
@keyframes slide-out-left {
  to { transform: translateX(-100%); }
}
@keyframes slide-in-right {
  from { transform: translateX(100%); }
}`,
  },
  'card-4': {
    icon: '⊕',
    label: '04',
    title: 'Zoom',
    text: `Scale transitions anchor the user's eye to a focal element — a thumbnail,
a button, a card — and expand it into the new view. The continuity of scale
communicates "this new screen came from that element" without any explicit label.`,
    code: `// Zoom from a specific element
const thumb = document.querySelector('.thumbnail');
thumb.style.viewTransitionName = 'hero-img';

document.startViewTransition(() => {
  navigateTo(detailPage);
});

// Destination: same name, natural size
.detail-hero { view-transition-name: hero-img; }`,
  },
  'card-5': {
    icon: '◈',
    label: '05',
    title: 'Shared Element',
    text: `The crown jewel of View Transitions. Assign the same view-transition-name to
a matching element on both the old and new view, and the browser interpolates
its position, size, and shape between the two — creating the illusion that one
element physically moves and transforms into another.`,
    code: `// Page A: list item
.product-card[data-id="42"] {
  view-transition-name: product-42;
}

// Page B: full detail view
.product-hero {
  view-transition-name: product-42;
}

// Both pages opt into cross-document transitions:
@view-transition { navigation: auto; }`,
  },
  'card-6': {
    icon: '⧉',
    label: '06',
    title: 'Cross-Document',
    text: `Full-page navigation transitions with zero JavaScript. Add @view-transition
to both pages' CSS and the browser handles the rest. This works for any
same-origin link click — even plain <a href="..."> tags. No router, no framework,
no interception code required. Just two lines of CSS.`,
    code: `/* Add to BOTH source and destination page CSS */
@view-transition {
  navigation: auto;
}

/* Optionally: customize the root animation */
::view-transition-old(root) {
  animation: fade-out 300ms ease both;
}
::view-transition-new(root) {
  animation: fade-in 300ms ease both;
}`,
  },
};

// ── Playground config presets ─────────────────────────────────
const TRANSITION_PRESETS = {
  crossfade: {
    out: 'vt-pg-fade-out',
    in: 'vt-pg-fade-in',
  },
  slide: {
    right:  { out: 'vt-pg-slide-out-left',  in: 'vt-pg-slide-in-right' },
    left:   { out: 'vt-pg-slide-out-right', in: 'vt-pg-slide-in-left'  },
    up:     { out: 'vt-pg-slide-out-down',  in: 'vt-pg-slide-in-up'    },
    down:   { out: 'vt-pg-slide-out-up',    in: 'vt-pg-slide-in-down'  },
  },
  zoom: {
    out: 'vt-pg-zoom-out',
    in: 'vt-pg-zoom-in',
  },
  flip: {
    out: 'vt-pg-flip-out',
    in: 'vt-pg-flip-in',
  },
  rotate: {
    out: 'vt-pg-rotate-out',
    in: 'vt-pg-rotate-in',
  },
};

// ── State ─────────────────────────────────────────────────────
let currentCardId = null;
let triggerElement = null;  // element that opened the card detail
let playgroundState = 'a'; // 'a' | 'b'
let transitionCount = 0;

// ── Helpers ───────────────────────────────────────────────────
function supportsViewTransitions() {
  return typeof document.startViewTransition === 'function';
}

function runTransition(callback) {
  if (supportsViewTransitions()) {
    return document.startViewTransition(callback);
  }
  callback();
  return null;
}

// ── Card expand / collapse ────────────────────────────────────
function openCard(cardId) {
  const data = CARD_DATA[cardId];
  if (!data) return;

  currentCardId = cardId;

  const overlay = document.getElementById('vt-detail-overlay');
  const icon    = document.getElementById('vt-detail-icon');
  const num     = document.getElementById('vt-detail-num');
  const title   = document.getElementById('vt-detail-title');
  const text    = document.getElementById('vt-detail-text');
  const code    = document.getElementById('vt-detail-code');

  // Populate content before transition so snapshot is correct
  icon.textContent  = data.icon;
  num.textContent   = data.label;
  title.textContent = data.title;
  text.textContent  = data.text;
  code.textContent  = data.code;

  runTransition(() => {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  });

  // Focus the close button for keyboard accessibility
  requestAnimationFrame(() => {
    const closeBtn = document.getElementById('vt-detail-close');
    if (closeBtn) closeBtn.focus();
  });
}

function closeCard() {
  const overlay = document.getElementById('vt-detail-overlay');

  runTransition(() => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    currentCardId = null;
  });

  // Return focus to the trigger element
  if (triggerElement) {
    triggerElement.focus();
    triggerElement = null;
  }
}

// ── Playground ────────────────────────────────────────────────
function getPlaygroundAnimNames() {
  const type      = document.getElementById('ctrl-type').value;
  const direction = document.getElementById('ctrl-direction').value;
  const preset    = TRANSITION_PRESETS[type];

  if (!preset) return { out: 'vt-pg-fade-out', in: 'vt-pg-fade-in' };

  // Slide has directional sub-presets
  if (type === 'slide') {
    return preset[direction] ?? preset.right;
  }

  return { out: preset.out, in: preset.in };
}

function applyPlaygroundTransition() {
  const duration = document.getElementById('ctrl-duration').value;
  const easing   = document.getElementById('ctrl-easing').value;
  const { out: animOut, in: animIn } = getPlaygroundAnimNames();

  // Inject CSS custom properties on :root so the pseudo-element selectors pick them up
  document.documentElement.style.setProperty('--vt-playground-duration', `${duration}ms`);
  document.documentElement.style.setProperty('--vt-playground-easing', easing);
  document.documentElement.style.setProperty('--vt-playground-out', animOut);
  document.documentElement.style.setProperty('--vt-playground-in', animIn);

  const stageState = document.getElementById('vt-stage-state');
  const countEl    = document.getElementById('vt-toggle-count');

  runTransition(() => {
    if (playgroundState === 'a') {
      stageState.className = 'vt-stage-state vt-stage-state--b';
      stageState.innerHTML = `
        <div class="vt-stage-state__symbol">■</div>
        <div class="vt-stage-state__label">State B</div>
        <div class="vt-stage-state__sub">Transition complete ✓</div>
      `;
      playgroundState = 'b';
    } else {
      stageState.className = 'vt-stage-state vt-stage-state--a';
      stageState.innerHTML = `
        <div class="vt-stage-state__symbol">▲</div>
        <div class="vt-stage-state__label">State A</div>
        <div class="vt-stage-state__sub">Toggle again to go back</div>
      `;
      playgroundState = 'a';
    }
  });

  transitionCount++;
  countEl.textContent = `${transitionCount} transition${transitionCount === 1 ? '' : 's'} fired`;
}

function updateGeneratedCSS() {
  const type      = document.getElementById('ctrl-type').value;
  const easing    = document.getElementById('ctrl-easing').value;
  const duration  = document.getElementById('ctrl-duration').value;
  const direction = document.getElementById('ctrl-direction').value;
  const { out: animOut, in: animIn } = getPlaygroundAnimNames();

  let dirComment = type === 'slide' ? `  /* direction: ${direction} */\n` : '';

  const css = `/* Generated by View Transitions Configurator */

/* Name the element you want to transition */
.my-element {
  view-transition-name: my-element;
  contain: layout;
}

/* Old state (leaving) */
::view-transition-old(my-element) {
  animation: ${animOut} ${duration}ms ${easing} both;
${dirComment}}

/* New state (entering) */
::view-transition-new(my-element) {
  animation: ${animIn} ${duration}ms ${easing} both;
${dirComment}}

/* Trigger the transition in JS */
document.startViewTransition(() => {
  element.classList.toggle('active');
});`;

  const codeEl = document.getElementById('vt-generated-code');
  if (codeEl) codeEl.textContent = css;
}

function toggleDirectionControl() {
  const type  = document.getElementById('ctrl-type').value;
  const group = document.getElementById('ctrl-direction-group');
  if (group) {
    group.style.display = type === 'slide' ? '' : 'none';
  }
}

// ── Init ──────────────────────────────────────────────────────
function init() {
  // Scroll reveal
  initScrollReveal();

  // Copy buttons (story code blocks)
  initCopyButtons();

  // ── Card click handlers
  const cards = document.querySelectorAll('.vt-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const cardId = card.dataset.cardId;
      if (cardId) {
        triggerElement = card;
        openCard(cardId);
      }
    });
  });

  // ── Close button
  const closeBtn = document.getElementById('vt-detail-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCard);
  }

  // ── Click overlay backdrop to close
  const overlay = document.getElementById('vt-detail-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCard();
    });
  }

  // ── Keyboard: Escape to close + focus trap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentCardId !== null) {
      closeCard();
      return;
    }

    // Focus trap when card detail overlay is open
    if (e.key === 'Tab' && currentCardId !== null && overlay) {
      const focusable = overlay.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  // ── Playground: Toggle button
  const toggleBtn = document.getElementById('vt-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      applyPlaygroundTransition();
      updateGeneratedCSS();
    });
  }

  // ── Playground: Control change listeners
  const ctrlIds = ['ctrl-type', 'ctrl-easing', 'ctrl-duration', 'ctrl-direction'];
  ctrlIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      if (id === 'ctrl-duration') {
        const output = document.getElementById('ctrl-duration-output');
        if (output) output.value = `${el.value}ms`;
      }
      if (id === 'ctrl-type') {
        toggleDirectionControl();
      }
      updateGeneratedCSS();
    });
    el.addEventListener('change', updateGeneratedCSS);
  });

  // ── Initial state
  toggleDirectionControl();
  updateGeneratedCSS();

  // ── Feature detection notice
  if (!supportsViewTransitions()) {
    const hint = document.querySelector('.vt-hero__hint');
    if (hint) {
      hint.textContent = '⚠ View Transitions not supported in this browser — upgrade to Chrome 111+, Edge 111+, or Safari 18+.';
      hint.style.color = 'oklch(75% 0.15 80)';
    }
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
