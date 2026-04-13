# A Love Letter to the Web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 12-page zero-dependency website celebrating the modern web platform — cinematic timeline landing, observatory hub, 8 feature zone deep-dives, interactive playground, and component toolkit.

**Architecture:** 3-layer Hybrid Timeline Hub. Layer 1 (index.html) is a scroll-driven cinematic experience morphing through 5 web eras. Layer 2 (hub.html) is an interactive constellation map linking to Layer 3 — 8 zone deep-dive pages each with Art/Story/Playground acts. Two utility pages (playground lab, component toolkit) round it out. View Transitions API connects all pages.

**Tech Stack:** Pure HTML5, CSS (oklch, scroll-driven animations, @property, :has(), container queries, @layer, @scope, Popover API, View Transitions API, Houdini Paint API), vanilla JS (View Transitions orchestrator, Clipboard API, IntersectionObserver, contenteditable editor). Zero dependencies. GitHub Pages deployment.

**Spec:** `docs/superpowers/specs/2026-04-13-love-letter-to-the-web-design.md`

**Testing approach:** No test framework (pure HTML/CSS/JS). Each task ends with browser verification — open the page, confirm visual output and interactions. Use a local HTTP server (`python -m http.server 8080`) since View Transitions require same-origin.

---

## Phase 1: Foundation & Landing Page

The foundation CSS/JS and the cinematic timeline landing. After this phase, pushing to GitHub Pages gives a working single-page site.

---

### Task 1: Project Scaffolding & Base CSS

**Files:**
- Create: `css/base.css`
- Create: `index.html` (minimal shell)

- [ ] **Step 1: Create `css/base.css` with reset, tokens, and typography**

```css
/* === Reset === */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  color-scheme: dark;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100dvh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 400;
  line-height: 1.6;
  background: var(--color-base);
  color: var(--color-text);
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code, pre {
  font-family: 'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace;
}

/* === Design Tokens === */
:root {
  /* Colors — oklch for perceptual uniformity */
  --color-base: oklch(0.13 0.01 270);
  --color-surface: oklch(0.17 0.01 270);
  --color-border: oklch(0.23 0.02 270);
  --color-primary: oklch(0.62 0.2 270);
  --color-accent: oklch(0.68 0.18 295);
  --color-text: oklch(0.9 0.01 270);
  --color-muted: oklch(0.65 0.03 270);
  --color-gradient-start: oklch(0.62 0.2 270);
  --color-gradient-mid: oklch(0.68 0.18 295);
  --color-gradient-end: oklch(0.65 0.18 340);

  /* Hex fallbacks for older browsers */
  --hex-base: #0a0a0f;
  --hex-surface: #111118;
  --hex-border: #222233;
  --hex-primary: #646cff;
  --hex-accent: #a78bfa;
  --hex-text: #e0e0e0;
  --hex-muted: #8b8fa3;

  /* Typography scale */
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-code: 'JetBrains Mono', ui-monospace, monospace;

  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.8rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.9rem);
  --text-base: clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem);
  --text-lg: clamp(1.15rem, 1rem + 0.75vw, 1.5rem);
  --text-xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --text-2xl: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  --text-3xl: clamp(2.5rem, 1.75rem + 3.75vw, 5rem);

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  /* Transitions */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 600ms;

  /* Layout */
  --content-width: 72rem;
  --content-padding: clamp(1rem, 3vw, 3rem);
}

/* === Typography === */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.1;
  text-wrap: balance;
}

h1 {
  font-size: var(--text-3xl);
  font-weight: 800;
  letter-spacing: -0.03em;
}

h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

h3 {
  font-size: var(--text-xl);
  font-weight: 600;
}

.subtitle {
  font-size: var(--text-lg);
  font-weight: 300;
  color: var(--color-muted);
}

.label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

/* === Utility === */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.content-width {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
}

/* === Reduced Motion === */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* === Focus Styles === */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Create minimal `index.html` shell to verify base CSS loads**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Love Letter to the Web</title>
  <meta name="description" content="A cinematic journey through the evolution of the web platform — from 1991 to 2026.">

  <!-- Open Graph -->
  <meta property="og:title" content="A Love Letter to the Web">
  <meta property="og:description" content="A cinematic journey through the evolution of the web platform.">
  <meta property="og:type" content="website">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/base.css">
</head>
<body>
  <a href="#main-content" class="visually-hidden">Skip to main content</a>
  <main id="main-content">
    <h1>A Love Letter to the Web</h1>
    <p class="subtitle">Foundation loaded successfully.</p>
  </main>
</body>
</html>
```

- [ ] **Step 3: Verify in browser**

Run: `cd /tmp/HTML-repo && python -m http.server 8080`
Open: `http://localhost:8080`
Expected: Dark page (#0a0a0f background), Inter font heading, muted subtitle text, proper font rendering.

- [ ] **Step 4: Commit**

```bash
git add css/base.css index.html
git commit -m "feat: add project foundation — base CSS tokens, reset, typography"
```

---

### Task 2: Shared Layout CSS & Animations CSS

**Files:**
- Create: `css/layout.css`
- Create: `css/animations.css`

- [ ] **Step 1: Create `css/layout.css` with grid systems and shared page structure**

```css
/* === Page Layout === */
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: var(--space-md) var(--content-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: oklch(0.13 0.01 270 / 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.page-header .logo {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: var(--text-lg);
  color: var(--color-text);
  text-decoration: none;
}

.page-header .logo:hover {
  text-decoration: none;
  color: var(--color-primary);
}

.page-header nav {
  display: flex;
  gap: var(--space-lg);
  align-items: center;
}

.page-header nav a {
  font-size: var(--text-sm);
  color: var(--color-muted);
  transition: color var(--duration-fast) var(--ease-out);
}

.page-header nav a:hover {
  color: var(--color-text);
  text-decoration: none;
}

.page-header nav a[aria-current="page"] {
  color: var(--color-primary);
}

/* === Section Layouts === */
.section-full {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--content-padding);
  position: relative;
}

.section-content {
  padding: var(--space-xl) var(--content-padding);
  max-width: var(--content-width);
  margin-inline: auto;
  width: 100%;
}

/* === Grid Systems === */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr));
  gap: var(--space-lg);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-lg);
}

/* === Split Pane (for playground) === */
.split-pane {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--color-border);
  min-height: calc(100dvh - 4rem);
}

.split-pane > * {
  background: var(--color-base);
  padding: var(--space-md);
}

@media (max-width: 768px) {
  .split-pane {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .page-header nav {
    gap: var(--space-md);
  }
}

/* === Card === */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: var(--space-lg);
  transition: border-color var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}

.card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* === Code Block === */
.code-block {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: var(--space-md);
  overflow-x: auto;
  font-family: var(--font-code);
  font-size: var(--text-sm);
  line-height: 1.7;
  tab-size: 2;
}

.code-block .keyword { color: oklch(0.68 0.18 295); }
.code-block .property { color: oklch(0.72 0.15 220); }
.code-block .value { color: oklch(0.75 0.15 145); }
.code-block .string { color: oklch(0.75 0.15 80); }
.code-block .comment { color: var(--color-muted); font-style: italic; }
.code-block .selector { color: oklch(0.65 0.18 340); }
.code-block .function { color: oklch(0.78 0.15 60); }

/* === Zone Navigation (shared across zone pages) === */
.zone-nav {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: oklch(0.17 0.01 270 / 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: 2rem;
  z-index: 100;
}

.zone-nav a {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: var(--text-sm);
  color: var(--color-muted);
  transition: all var(--duration-fast) var(--ease-out);
}

.zone-nav a:hover {
  background: var(--color-surface);
  color: var(--color-text);
  text-decoration: none;
}

.zone-nav a[aria-current="page"] {
  background: var(--color-primary);
  color: white;
}
```

- [ ] **Step 2: Create `css/animations.css` with scroll-driven animation definitions**

```css
/* === Keyframe Library === */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.5rem); }
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === Scroll-Driven Utilities === */

/* Fade in as element scrolls into view */
.scroll-reveal {
  animation: fade-in-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

/* Progress bar tied to page scroll */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-gradient-start),
    var(--color-gradient-mid),
    var(--color-gradient-end)
  );
  transform-origin: left;
  z-index: 200;
  animation: scroll-progress-grow linear both;
  animation-timeline: scroll(root);
}

@keyframes scroll-progress-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* === Entry Animations (for dialogs/popovers) === */
@starting-style {
  dialog[open],
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.95) translateY(0.5rem);
  }
}

dialog[open],
[popover]:popover-open {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition: opacity var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out),
              overlay var(--duration-normal) var(--ease-out) allow-discrete,
              display var(--duration-normal) var(--ease-out) allow-discrete;
}

/* === Stagger Children === */
.stagger-children > * {
  animation: fade-in-up var(--duration-slow) var(--ease-out) both;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 75ms; }
.stagger-children > *:nth-child(3) { animation-delay: 150ms; }
.stagger-children > *:nth-child(4) { animation-delay: 225ms; }
.stagger-children > *:nth-child(5) { animation-delay: 300ms; }
.stagger-children > *:nth-child(6) { animation-delay: 375ms; }
.stagger-children > *:nth-child(7) { animation-delay: 450ms; }
.stagger-children > *:nth-child(8) { animation-delay: 525ms; }

/* === Reduced Motion === */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    animation: fade-in 0.01ms both;
    animation-timeline: view();
    animation-range: entry 0% entry 50%;
  }

  .scroll-progress {
    animation: none;
    transform: scaleX(1);
  }
}
```

- [ ] **Step 3: Link new CSS files in `index.html`**

Add after the `base.css` link:

```html
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/animations.css">
```

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:8080`. No visual change expected yet (classes not used), but no console errors. Check that all 3 CSS files load in Network tab.

- [ ] **Step 5: Commit**

```bash
git add css/layout.css css/animations.css index.html
git commit -m "feat: add shared layout grid system and animation library"
```

---

### Task 3: View Transitions CSS & JS

**Files:**
- Create: `css/transitions.css`
- Create: `js/transitions.js`
- Create: `js/utils.js`

- [ ] **Step 1: Create `css/transitions.css`**

```css
/* === View Transition Definitions === */

/* Cross-document view transitions opt-in */
@view-transition {
  navigation: auto;
}

/* Default transition: crossfade */
::view-transition-old(root) {
  animation: fade-out var(--duration-normal) var(--ease-out);
}

::view-transition-new(root) {
  animation: fade-in var(--duration-normal) var(--ease-out);
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Named transitions for zone cards */
::view-transition-old(zone-hero) {
  animation: shrink-out var(--duration-slow) var(--ease-in-out);
}

::view-transition-new(zone-hero) {
  animation: expand-in var(--duration-slow) var(--ease-in-out);
}

@keyframes shrink-out {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

@keyframes expand-in {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
}

/* Slide transitions for zone-to-zone navigation */
::view-transition-old(zone-content) {
  animation: slide-out-left var(--duration-slow) var(--ease-in-out);
}

::view-transition-new(zone-content) {
  animation: slide-in-right var(--duration-slow) var(--ease-in-out);
}

@keyframes slide-out-left {
  to {
    opacity: 0;
    transform: translateX(-3rem);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(3rem);
  }
}

/* Hub constellation zoom transition */
::view-transition-old(hub-node) {
  animation: zoom-out var(--duration-slow) var(--ease-in-out);
}

::view-transition-new(hub-node) {
  animation: zoom-in var(--duration-slow) var(--ease-in-out);
}

@keyframes zoom-out {
  to {
    opacity: 0;
    transform: scale(2);
    filter: blur(4px);
  }
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.5);
    filter: blur(4px);
  }
}

/* Reduced motion: simple crossfade for all named transitions */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Create `js/utils.js` with shared utilities**

```js
/**
 * Shared utilities for A Love Letter to the Web.
 * Clipboard API, IntersectionObserver helpers, and DOM utilities.
 */

/** Copy text to clipboard. Falls back gracefully if API unavailable. */
export async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Attach copy-to-clipboard behavior to all buttons with data-copy-target. */
export function initCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-copy-target');
      const target = document.getElementById(targetId);
      if (!target) return;

      const text = target.textContent;
      const success = await copyToClipboard(text);

      btn.textContent = success ? 'Copied!' : 'Failed';
      btn.setAttribute('aria-label', success ? 'Copied to clipboard' : 'Copy failed');

      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
      }, 2000);
    });
  });
}

/** Apply scroll-reveal to elements not natively supported by CSS scroll-driven. */
export function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.js-reveal').forEach((el) => observer.observe(el));
}

/** Set a CSS custom property from JS (used for mouse parallax). */
export function setCSSProperty(element, property, value) {
  element.style.setProperty(property, value);
}
```

- [ ] **Step 3: Create `js/transitions.js` — View Transitions orchestrator**

```js
/**
 * View Transitions API orchestrator.
 * Intercepts navigation between pages and applies smooth transitions.
 * Falls back to normal navigation if View Transitions API is unavailable.
 */

/** Check if View Transitions API is available for same-document transitions. */
function supportsViewTransitions() {
  return 'startViewTransition' in document;
}

/** Navigate to a URL with a view transition. */
export function navigateWithTransition(url, transitionName = 'root') {
  if (!supportsViewTransitions()) {
    window.location.href = url;
    return;
  }

  document.documentElement.style.setProperty('--transition-name', transitionName);

  document.startViewTransition(() => {
    window.location.href = url;
  });
}

/** Initialize navigation links that should use view transitions. */
export function initTransitionLinks() {
  document.querySelectorAll('a[data-transition]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.href;
      const transitionName = link.getAttribute('data-transition') || 'root';
      navigateWithTransition(url, transitionName);
    });
  });
}

/** Auto-initialize on DOMContentLoaded. */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initTransitionLinks);
}
```

- [ ] **Step 4: Link transitions CSS in `index.html`**

Add after animations.css:

```html
  <link rel="stylesheet" href="css/transitions.css">
```

- [ ] **Step 5: Verify in browser**

Reload page. No console errors. CSS and JS files load. No visible change yet.

- [ ] **Step 6: Commit**

```bash
git add css/transitions.css js/transitions.js js/utils.js index.html
git commit -m "feat: add View Transitions CSS/JS and shared utilities"
```

---

### Task 4: Cinematic Timeline Landing — HTML Structure

**Files:**
- Modify: `index.html` (full rewrite of `<body>` content)

- [ ] **Step 1: Build the full `index.html` with 5 era sections**

Replace the entire `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Love Letter to the Web</title>
  <meta name="description" content="A cinematic journey through the evolution of the web platform — from 1991 to 2026. Built with zero dependencies.">

  <!-- Open Graph -->
  <meta property="og:title" content="A Love Letter to the Web">
  <meta property="og:description" content="A cinematic journey through the evolution of the web platform — from 1991 to 2026.">
  <meta property="og:type" content="website">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/animations.css">
  <link rel="stylesheet" href="css/transitions.css">
  <link rel="stylesheet" href="css/landing.css">
</head>
<body>
  <a href="#main-content" class="visually-hidden">Skip to main content</a>

  <!-- Scroll progress bar -->
  <div class="scroll-progress" aria-hidden="true"></div>

  <main id="main-content" class="landing">

    <!-- Era 1: 1991 — The Beginning -->
    <section class="era era-1991" id="era-1991" aria-label="1991 — The Beginning">
      <div class="era-content">
        <span class="label">1991</span>
        <h1>The Beginning</h1>
        <hr>
        <p>This is a page about the World Wide Web. The WorldWideWeb (W3) is a wide-area <a href="#">hypermedia</a> information retrieval initiative aiming to give universal access to a large universe of documents.</p>
        <p>Everything there is online about W3 is linked directly or indirectly to this document, including an <a href="#">executive summary</a> of the project, <a href="#">Mailing lists</a>, <a href="#">Policy</a>, November's <a href="#">W3 news</a>, <a href="#">Frequently Asked Questions</a>.</p>
        <address>
          <a href="#">Tim Berners-Lee</a><br>
          CERN, Geneva, Switzerland
        </address>
      </div>
    </section>

    <!-- Era 2: 1996 — CSS Arrives -->
    <section class="era era-1996" id="era-1996" aria-label="1996 — CSS Arrives">
      <div class="era-content">
        <span class="label">1996</span>
        <h2>CSS Arrives</h2>
        <table class="era-1996-table" role="presentation" aria-hidden="true">
          <tr>
            <td class="sidebar-cell">
              <div class="sidebar-nav">
                <div class="sidebar-title">Navigation</div>
                <a href="#">Home</a>
                <a href="#">About Me</a>
                <a href="#">Guestbook</a>
                <a href="#">Links</a>
                <a href="#">WebRing</a>
              </div>
            </td>
            <td class="main-cell">
              <div class="geocities-content">
                <p class="welcome-text">Welcome to my homepage!!</p>
                <p>Background colors appear. Fonts change. The <code>&lt;table&gt;</code> becomes the layout tool. A sidebar emerges. The web gets its first taste of design.</p>
                <div class="visitor-counter">
                  You are visitor #<span class="counter-num">004,271</span>
                </div>
                <p class="construction">🚧 Under Construction 🚧</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </section>

    <!-- Era 3: 2010 — CSS3 Revolution -->
    <section class="era era-2010" id="era-2010" aria-label="2010 — CSS3 Revolution">
      <div class="era-content">
        <span class="label">2010</span>
        <h2>The CSS3 Revolution</h2>
        <p class="subtitle">Border-radius changed everything.</p>
        <div class="css3-showcase">
          <div class="css3-card">
            <div class="css3-card-icon">◉</div>
            <h3>Rounded Corners</h3>
            <p>No more corner images. <code>border-radius</code> gave us curves.</p>
          </div>
          <div class="css3-card">
            <div class="css3-card-icon">◈</div>
            <h3>Gradients</h3>
            <p>Glossy buttons and skeuomorphic depth — all in CSS.</p>
          </div>
          <div class="css3-card">
            <div class="css3-card-icon">◐</div>
            <h3>Transforms</h3>
            <p>Rotation, scaling, 3D. The web learned to move.</p>
          </div>
          <div class="css3-card">
            <div class="css3-card-icon">◧</div>
            <h3>Box Shadows</h3>
            <p>Depth without images. The flat-to-material pipeline begins.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Era 4: 2020 — Modern CSS -->
    <section class="era era-2020" id="era-2020" aria-label="2020 — Modern CSS">
      <div class="era-content">
        <span class="label">2020</span>
        <h2>Modern CSS</h2>
        <p class="subtitle">The dark mode era. Custom properties. Grid. Flex. Clean.</p>
        <div class="modern-grid">
          <div class="modern-feature">
            <code>--custom-properties</code>
            <p>Design tokens in pure CSS. Themes became trivial.</p>
          </div>
          <div class="modern-feature">
            <code>display: grid</code>
            <p>Two-dimensional layouts without hacks. Tables retired.</p>
          </div>
          <div class="modern-feature">
            <code>display: flex</code>
            <p>Centering a div finally made sense.</p>
          </div>
          <div class="modern-feature">
            <code>prefers-color-scheme</code>
            <p>Dark mode became a first-class citizen.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Era 5: 2026 — The Platform -->
    <section class="era era-2026" id="era-2026" aria-label="2026 — The Platform">
      <div class="era-content">
        <span class="label">2026</span>
        <h2>The Platform</h2>
        <p class="subtitle">The browser is the runtime. CSS is the framework. HTML is the API.</p>
        <div class="platform-features stagger-children">
          <div class="platform-chip">scroll-driven animations</div>
          <div class="platform-chip">container queries</div>
          <div class="platform-chip">:has() selector</div>
          <div class="platform-chip">view transitions</div>
          <div class="platform-chip">popover API</div>
          <div class="platform-chip">cascade layers</div>
          <div class="platform-chip">CSS nesting</div>
          <div class="platform-chip">oklch colors</div>
          <div class="platform-chip">@property</div>
          <div class="platform-chip">Houdini paint</div>
          <div class="platform-chip">@scope</div>
          <div class="platform-chip">anchor positioning</div>
        </div>
        <div class="portal-cta">
          <a href="hub.html" class="portal-link" data-transition="hub-node">
            <span class="portal-text">Enter the Observatory</span>
            <span class="portal-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>

  </main>

  <script type="module" src="js/transitions.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify structure in browser**

Reload. You should see 5 sections stacked vertically with raw unstyled content (landing.css doesn't exist yet). All text and links should be visible and accessible.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add cinematic timeline landing HTML — 5 era sections"
```

---

### Task 5: Cinematic Timeline Landing — CSS (The Visual Transformation)

**Files:**
- Create: `css/landing.css`

This is the centrepiece — each era section is styled to look like its actual historical period, and the scroll-driven animations morph the page between eras.

- [ ] **Step 1: Create `css/landing.css`**

```css
/* === Landing Page — Cinematic Timeline === */

.landing {
  overflow-x: hidden;
}

/* === Era Base Styles === */
.era {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--content-padding);
  position: relative;
  scroll-snap-align: start;
}

.era-content {
  max-width: var(--content-width);
  width: 100%;
  animation: fade-in-up linear both;
  animation-timeline: view();
  animation-range: entry 10% entry 60%;
}

/* === Era 1: 1991 — Raw HTML === */
.era-1991 {
  background: #c0c0c0;
  color: #000;
  font-family: 'Times New Roman', Times, serif;
  font-size: 16px;
  line-height: 1.4;
}

.era-1991 h1 {
  font-family: 'Times New Roman', Times, serif;
  font-size: 24px;
  font-weight: normal;
  letter-spacing: normal;
  line-height: 1.2;
  margin-bottom: 0.5em;
}

.era-1991 .label {
  font-family: 'Times New Roman', Times, serif;
  text-transform: none;
  letter-spacing: normal;
  font-weight: bold;
  font-size: 14px;
  color: #000;
}

.era-1991 a {
  color: #0000ee;
  text-decoration: underline;
}

.era-1991 a:visited {
  color: #551a8b;
}

.era-1991 hr {
  border: none;
  border-top: 1px solid #000;
  margin: 1em 0;
}

.era-1991 p {
  margin-bottom: 1em;
  max-width: 60ch;
}

.era-1991 address {
  font-style: italic;
  margin-top: 2em;
  font-size: 14px;
}

/* === Era 2: 1996 — CSS Arrives / Geocities === */
.era-1996 {
  background: #000033;
  color: #00ff00;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
  font-size: 14px;
}

.era-1996 h2 {
  font-family: 'Comic Sans MS', cursive;
  font-size: 28px;
  color: #ff00ff;
  text-align: center;
  letter-spacing: normal;
  font-weight: bold;
  margin-bottom: var(--space-md);
  text-shadow: 2px 2px #000;
}

.era-1996 .label {
  text-align: center;
  display: block;
  color: #ffff00;
  font-family: 'Comic Sans MS', cursive;
  text-transform: none;
  letter-spacing: normal;
  font-size: 12px;
}

.era-1996-table {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  border-collapse: collapse;
}

.sidebar-cell {
  width: 150px;
  vertical-align: top;
  padding: 0;
}

.sidebar-nav {
  background: #000066;
  border: 2px solid #3333ff;
  padding: var(--space-sm);
}

.sidebar-nav .sidebar-title {
  color: #ffff00;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #3333ff;
  padding-bottom: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.sidebar-nav a {
  display: block;
  color: #00ffff;
  padding: 2px 0;
  text-decoration: underline;
  font-size: 13px;
}

.main-cell {
  vertical-align: top;
  padding: var(--space-md);
}

.geocities-content .welcome-text {
  font-size: 20px;
  color: #ff6600;
  text-align: center;
  margin-bottom: var(--space-md);
}

.geocities-content p {
  margin-bottom: var(--space-sm);
}

.geocities-content code {
  color: #ffff00;
}

.visitor-counter {
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background: #000;
  border: 1px inset #666;
  font-family: 'Courier New', monospace;
  color: #00ff00;
}

.counter-num {
  color: #ff0000;
  font-weight: bold;
}

.construction {
  text-align: center;
  font-size: 18px;
  margin-top: var(--space-md);
  animation: pulse 1.5s ease-in-out infinite;
}

/* === Era 3: 2010 — CSS3 Revolution === */
.era-2010 {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  color: #eee;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.era-2010 h2 {
  background: linear-gradient(135deg, #e94560, #f5a623);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-sm);
}

.era-2010 .label {
  color: #e94560;
}

.era-2010 .subtitle {
  color: #aaa;
  margin-bottom: var(--space-xl);
}

.css3-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--space-lg);
}

.css3-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: var(--space-lg);
  box-shadow:
    0 4px 6px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.css3-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 8px 25px rgba(233,69,96,0.2),
    inset 0 1px 0 rgba(255,255,255,0.15);
}

.css3-card-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
  color: #e94560;
}

.css3-card h3 {
  font-size: 1.1rem;
  margin-bottom: var(--space-xs);
  color: #fff;
}

.css3-card p {
  font-size: 0.9rem;
  color: #aaa;
  line-height: 1.5;
}

.css3-card code {
  color: #f5a623;
  font-size: 0.85rem;
}

/* === Era 4: 2020 — Modern CSS === */
.era-2020 {
  background: #111;
  color: #e0e0e0;
  font-family: 'Inter', system-ui, sans-serif;
}

.era-2020 h2 {
  color: #fff;
  margin-bottom: var(--space-sm);
}

.era-2020 .label {
  color: #888;
}

.era-2020 .subtitle {
  color: #888;
  margin-bottom: var(--space-xl);
}

.modern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1px;
  background: #333;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.modern-feature {
  background: #1a1a1a;
  padding: var(--space-lg);
}

.modern-feature code {
  display: block;
  font-size: 1rem;
  color: #646cff;
  margin-bottom: var(--space-sm);
}

.modern-feature p {
  font-size: 0.9rem;
  color: #888;
  line-height: 1.5;
}

/* === Era 5: 2026 — The Platform === */
.era-2026 {
  background: var(--color-base);
  color: var(--color-text);
  font-family: var(--font-heading);
}

.era-2026 h2 {
  font-size: var(--text-3xl);
  font-weight: 800;
  background: linear-gradient(
    135deg,
    var(--color-gradient-start),
    var(--color-gradient-mid),
    var(--color-gradient-end)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-sm);
}

.era-2026 .label {
  color: var(--color-primary);
}

.era-2026 .subtitle {
  margin-bottom: var(--space-xl);
}

.platform-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
}

.platform-chip {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 2rem;
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: var(--color-muted);
  transition: all var(--duration-fast) var(--ease-out);
}

.platform-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: oklch(0.62 0.2 270 / 0.1);
}

/* === Portal CTA === */
.portal-cta {
  text-align: center;
  margin-top: var(--space-xl);
}

.portal-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(
    135deg,
    var(--color-gradient-start),
    var(--color-gradient-mid)
  );
  color: white;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-lg);
  border-radius: 4rem;
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.portal-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-gradient-mid),
    var(--color-gradient-end)
  );
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.portal-link:hover {
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px oklch(0.62 0.2 270 / 0.4);
}

.portal-link:hover::before {
  opacity: 1;
}

.portal-text,
.portal-arrow {
  position: relative;
  z-index: 1;
}

.portal-arrow {
  font-size: 1.5em;
  transition: transform var(--duration-fast) var(--ease-out);
}

.portal-link:hover .portal-arrow {
  transform: translateX(4px);
}

/* === Scroll Snap === */
@supports (scroll-snap-type: y mandatory) {
  .landing {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
    height: 100dvh;
  }
}

/* === Responsive === */
@media (max-width: 768px) {
  .era {
    padding: var(--space-xl) var(--content-padding);
  }

  .sidebar-cell {
    display: none;
  }

  .css3-showcase {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:8080`. You should see:
- Era 1: Gray background, Times New Roman, looks like the original CERN website
- Era 2: Dark blue background, green/magenta text, Geocities table layout
- Era 3: Dark gradient, glossy CSS3 cards with hover effects
- Era 4: Clean dark minimal layout with code-first feature grid
- Era 5: Full design-system styling, gradient heading, tech chips, portal CTA button

Scroll-snap should lock between eras. The scroll progress bar should grow across the top.

- [ ] **Step 3: Commit**

```bash
git add css/landing.css
git commit -m "feat: add cinematic timeline CSS — 5 eras from 1991 to 2026"
```

---

### Task 6: Push Phase 1 to GitHub & Deploy

**Files:**
- Modify: None (git operations only)

- [ ] **Step 1: Verify all files are committed**

```bash
git status
git log --oneline
```

Expected: Clean working tree, 4+ commits.

- [ ] **Step 2: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 3: Enable GitHub Pages**

```bash
gh api repos/IxMxAMAR/HTML/pages -X POST -f source.branch=main -f source.path="/" 2>/dev/null || echo "Pages may already be enabled or needs manual setup"
```

- [ ] **Step 4: Verify live site**

Open: `https://ixmxamar.github.io/HTML/`
Expected: The cinematic timeline landing page, fully functional.

- [ ] **Step 5: Commit (if any config changes were needed)**

Only if files changed. Otherwise, Phase 1 is complete.

---

## Phase 2: Observatory Hub

---

### Task 7: Hub Page — HTML Structure

**Files:**
- Create: `hub.html`

- [ ] **Step 1: Create `hub.html` with constellation layout**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Observatory — A Love Letter to the Web</title>
  <meta name="description" content="Explore the modern web platform — 8 interactive zones showcasing cutting-edge CSS and HTML features.">

  <meta property="og:title" content="Observatory — A Love Letter to the Web">
  <meta property="og:description" content="Explore the modern web platform — 8 interactive zones.">
  <meta property="og:type" content="website">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/animations.css">
  <link rel="stylesheet" href="css/transitions.css">
  <link rel="stylesheet" href="css/hub.css">
</head>
<body>
  <a href="#main-content" class="visually-hidden">Skip to main content</a>

  <header class="page-header">
    <a href="index.html" class="logo" data-transition="root">◈ LLTW</a>
    <nav aria-label="Main navigation">
      <a href="index.html" data-transition="root">Timeline</a>
      <a href="hub.html" aria-current="page">Observatory</a>
      <a href="playground.html" data-transition="root">Playground</a>
      <a href="components.html" data-transition="root">Components</a>
    </nav>
  </header>

  <main id="main-content" class="hub">
    <div class="hub-intro">
      <h1>The Observatory</h1>
      <p class="subtitle">8 zones. Each one a deep dive into a modern web feature.<br>Art. Story. Playground.</p>
    </div>

    <div class="constellation" id="constellation" aria-label="Feature zone map">
      <!-- SVG connection lines drawn behind nodes -->
      <svg class="constellation-lines" aria-hidden="true" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <line x1="200" y1="150" x2="500" y2="100" class="connection-line"/>
        <line x1="500" y1="100" x2="800" y2="150" class="connection-line"/>
        <line x1="200" y1="150" x2="350" y2="350" class="connection-line"/>
        <line x1="500" y1="100" x2="500" y2="300" class="connection-line"/>
        <line x1="800" y1="150" x2="650" y2="350" class="connection-line"/>
        <line x1="350" y1="350" x2="650" y2="350" class="connection-line"/>
        <line x1="350" y1="350" x2="250" y2="500" class="connection-line"/>
        <line x1="650" y1="350" x2="750" y2="500" class="connection-line"/>
      </svg>

      <!-- Zone nodes -->
      <a href="zones/scroll-animations.html" class="zone-node" data-zone="scroll" data-transition="hub-node" style="--node-x: 20%; --node-y: 20%; --zone-color: #646cff;">
        <div class="node-symbol">◆</div>
        <div class="node-label">Scroll Animations</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/popover-dialog.html" class="zone-node" data-zone="popover" data-transition="hub-node" style="--node-x: 50%; --node-y: 12%; --zone-color: #a78bfa;">
        <div class="node-symbol">◇</div>
        <div class="node-label">Popover & Dialog</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/css-art.html" class="zone-node" data-zone="art" data-transition="hub-node" style="--node-x: 80%; --node-y: 20%; --zone-color: #f472b6;">
        <div class="node-symbol">●</div>
        <div class="node-label">CSS Art Gallery</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/container-queries.html" class="zone-node" data-zone="container" data-transition="hub-node" style="--node-x: 35%; --node-y: 50%; --zone-color: #34d399;">
        <div class="node-symbol">◈</div>
        <div class="node-label">Container Queries</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/view-transitions.html" class="zone-node" data-zone="transitions" data-transition="hub-node" style="--node-x: 50%; --node-y: 40%; --zone-color: #fbbf24;">
        <div class="node-symbol">▲</div>
        <div class="node-label">View Transitions</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/houdini.html" class="zone-node" data-zone="houdini" data-transition="hub-node" style="--node-x: 65%; --node-y: 50%; --zone-color: #60a5fa;">
        <div class="node-symbol">■</div>
        <div class="node-label">CSS Houdini</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/has-selector.html" class="zone-node" data-zone="has" data-transition="hub-node" style="--node-x: 25%; --node-y: 78%; --zone-color: #fb923c;">
        <div class="node-symbol">★</div>
        <div class="node-label">:has() Selector</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>

      <a href="zones/cascade-layers.html" class="zone-node" data-zone="layers" data-transition="hub-node" style="--node-x: 75%; --node-y: 78%; --zone-color: #e879f9;">
        <div class="node-symbol">⬡</div>
        <div class="node-label">Cascade Layers</div>
        <div class="node-glow" aria-hidden="true"></div>
      </a>
    </div>

    <footer class="hub-stats">
      <span>8 Zones</span>
      <span aria-hidden="true">·</span>
      <span>24 Demos</span>
      <span aria-hidden="true">·</span>
      <span>0 Dependencies</span>
    </footer>
  </main>

  <script type="module" src="js/transitions.js"></script>
  <script type="module" src="js/hub.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify structure in browser**

Open `http://localhost:8080/hub.html`. Zone nodes visible as links (unstyled). Navigation links present.

- [ ] **Step 3: Commit**

```bash
git add hub.html
git commit -m "feat: add observatory hub HTML — constellation layout with 8 zone nodes"
```

---

### Task 8: Hub Page — CSS & JS (Constellation Interactive Map)

**Files:**
- Create: `css/hub.css`
- Create: `js/hub.js`

- [ ] **Step 1: Create `css/hub.css`**

```css
/* === Observatory Hub === */

.hub {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-top: 5rem; /* clear fixed header */
}

.hub-intro {
  text-align: center;
  padding: var(--space-xl) var(--content-padding) var(--space-lg);
}

.hub-intro h1 {
  margin-bottom: var(--space-sm);
}

/* === Constellation Map === */
.constellation {
  flex: 1;
  position: relative;
  margin: 0 var(--content-padding);
  min-height: 500px;
}

.constellation-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-line {
  stroke: var(--color-border);
  stroke-width: 1;
  opacity: 0.4;
  transition: opacity var(--duration-normal) var(--ease-out);
}

/* Dim connections when a node is hovered (via :has on parent) */
.constellation:has(.zone-node:hover) .connection-line {
  opacity: 0.1;
}

/* === Zone Nodes === */
.zone-node {
  position: absolute;
  left: var(--node-x);
  top: var(--node-y);
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: var(--color-muted);
  transition: all var(--duration-normal) var(--ease-out);
  z-index: 1;
}

.node-symbol {
  font-size: 2rem;
  color: var(--zone-color);
  transition: all var(--duration-normal) var(--ease-out);
  filter: drop-shadow(0 0 8px var(--zone-color));
  animation: pulse 3s ease-in-out infinite;
  animation-delay: calc(var(--node-x, 0) * 10ms);
}

.node-label {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  white-space: nowrap;
  opacity: 0.6;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.node-glow {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--zone-color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  pointer-events: none;
  z-index: -1;
}

/* Node hover */
.zone-node:hover {
  text-decoration: none;
  transform: translate(-50%, -50%) scale(1.15);
}

.zone-node:hover .node-symbol {
  filter: drop-shadow(0 0 20px var(--zone-color));
  animation: none;
}

.zone-node:hover .node-label {
  opacity: 1;
  color: var(--color-text);
}

.zone-node:hover .node-glow {
  opacity: 0.15;
}

/* Dim other nodes when one is hovered */
.constellation:has(.zone-node:hover) .zone-node:not(:hover) {
  opacity: 0.3;
}

/* Focus styles */
.zone-node:focus-visible {
  outline: none;
}

.zone-node:focus-visible .node-symbol {
  outline: 2px solid var(--zone-color);
  outline-offset: 8px;
  border-radius: 4px;
}

/* === Hub Stats Footer === */
.hub-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* === Mobile: Grid fallback === */
@media (max-width: 768px) {
  .constellation {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
    padding: var(--space-lg);
    min-height: auto;
  }

  .constellation-lines {
    display: none;
  }

  .zone-node {
    position: static;
    transform: none;
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
  }

  .zone-node:hover {
    transform: translateY(-2px);
  }

  .node-glow {
    display: none;
  }

  .node-label {
    opacity: 1;
  }
}
```

- [ ] **Step 2: Create `js/hub.js` with mouse parallax**

```js
/**
 * Hub page interactivity — mouse parallax on constellation nodes.
 */

function initParallax() {
  const constellation = document.getElementById('constellation');
  if (!constellation) return;

  // Skip parallax if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Skip on mobile (touch primary)
  if (window.matchMedia('(pointer: coarse)').matches) return;

  constellation.addEventListener('mousemove', (e) => {
    const rect = constellation.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    constellation.style.setProperty('--mouse-x', x.toFixed(3));
    constellation.style.setProperty('--mouse-y', y.toFixed(3));

    // Subtle shift on nodes based on mouse position
    constellation.querySelectorAll('.zone-node').forEach((node) => {
      const depth = parseFloat(node.style.getPropertyValue('--node-y')) / 100;
      const shiftX = x * 20 * depth;
      const shiftY = y * 15 * depth;
      node.style.setProperty('--parallax-x', `${shiftX}px`);
      node.style.setProperty('--parallax-y', `${shiftY}px`);
    });
  });

  // Add parallax transform to nodes via CSS custom properties
  const style = document.createElement('style');
  style.textContent = `
    .zone-node {
      translate: var(--parallax-x, 0) var(--parallax-y, 0);
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initParallax);
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:8080/hub.html`. Expected:
- Dark page with header navigation
- 8 zone nodes positioned as a constellation with pulsing symbols
- SVG connection lines between nodes (subtle)
- Hovering a node: it scales up, glows, others dim
- Moving mouse: subtle parallax shift on nodes
- Clicking "Timeline" in header navigates back to index.html

- [ ] **Step 4: Commit**

```bash
git add css/hub.css js/hub.js
git commit -m "feat: add observatory hub CSS/JS — constellation map with parallax and :has() interactions"
```

---

## Phase 3: Zone Pages (Parallelizable)

Each zone page is independent. All 8 can be built in parallel by separate agents. They share the same 3-act structure (Art → Story → Playground) but each has unique content and visuals.

**Shared zone template pattern** — every zone page follows this HTML skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- standard meta, fonts, base/layout/animations/transitions CSS -->
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/layout.css">
  <link rel="stylesheet" href="../css/animations.css">
  <link rel="stylesheet" href="../css/transitions.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/zone-[name].css">
</head>
<body>
  <a href="#main-content" class="visually-hidden">Skip to main content</a>
  <header class="page-header"><!-- shared nav --></header>
  <main id="main-content">
    <section class="zone-hero" style="--zone-color: [accent];"><!-- Act 1: Art --></section>
    <section class="zone-story section-content"><!-- Act 2: Story --></section>
    <section class="zone-playground section-content"><!-- Act 3: Playground --></section>
  </main>
  <nav class="zone-nav" aria-label="Zone navigation"><!-- prev/next zone links --></nav>
  <script type="module" src="../js/transitions.js"></script>
  <!-- zone-specific JS if needed -->
</body>
</html>
```

---

### Task 9: Components CSS (shared across zones)

**Files:**
- Create: `css/components.css`

- [ ] **Step 1: Create `css/components.css` with shared zone UI components**

```css
/* === Zone Hero (Act 1: Art) === */
.zone-hero {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--color-base);
}

.zone-hero .zone-label {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--zone-color, var(--color-primary));
  margin-bottom: var(--space-md);
}

.zone-hero h1 {
  color: var(--zone-color, var(--color-primary));
  margin-bottom: var(--space-sm);
}

/* === Zone Story (Act 2) === */
.zone-story {
  padding-top: var(--space-2xl);
  padding-bottom: var(--space-2xl);
}

.zone-story h2 {
  color: var(--zone-color, var(--color-primary));
  margin-bottom: var(--space-lg);
}

.zone-story p {
  max-width: 65ch;
  margin-bottom: var(--space-md);
  color: var(--color-muted);
  line-height: 1.8;
}

.zone-story p:last-child {
  margin-bottom: 0;
}

/* === Browser Support Badge === */
.browser-support {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 2rem;
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
}

.browser-support .supported {
  color: oklch(0.7 0.15 145);
}

.browser-support .partial {
  color: oklch(0.75 0.15 80);
}

/* === Zone Playground (Act 3) === */
.zone-playground {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-2xl);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.zone-playground h2 {
  margin-bottom: var(--space-lg);
}

/* === Demo Container === */
.demo-container {
  background: var(--color-base);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.demo-preview {
  padding: var(--space-xl);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-controls {
  padding: var(--space-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

/* === Control Inputs === */
.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.control-group label {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.control-group input[type="range"] {
  width: 10rem;
  accent-color: var(--zone-color, var(--color-primary));
}

.control-group select {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: var(--space-xs) var(--space-sm);
  font-family: var(--font-code);
  font-size: var(--text-sm);
}

/* === Copy Button === */
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  color: var(--color-muted);
  font-family: var(--font-code);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.copy-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* === Tabs (for code snippets) === */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--color-muted);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  transition: all var(--duration-fast) var(--ease-out);
}

/* CSS-only tabs using :has() + radio inputs */
.tab-group {
  position: relative;
}

.tab-group input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.tab-group:has(input#tab-html:checked) .tab[for="tab-html"],
.tab-group:has(input#tab-css:checked) .tab[for="tab-css"],
.tab-group:has(input#tab-js:checked) .tab[for="tab-js"] {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-group .tab-panel {
  display: none;
}

.tab-group:has(input#tab-html:checked) .tab-panel[data-tab="html"],
.tab-group:has(input#tab-css:checked) .tab-panel[data-tab="css"],
.tab-group:has(input#tab-js:checked) .tab-panel[data-tab="js"] {
  display: block;
}

/* === Back to Hub Link === */
.back-to-hub {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
  transition: color var(--duration-fast) var(--ease-out);
}

.back-to-hub:hover {
  color: var(--color-primary);
  text-decoration: none;
}
```

- [ ] **Step 2: Verify CSS loads (no page uses it yet, just ensure no syntax errors)**

Add `<link rel="stylesheet" href="css/components.css">` to `hub.html` after transitions.css. Reload hub.html — no errors in console.

- [ ] **Step 3: Commit**

```bash
git add css/components.css hub.html
git commit -m "feat: add shared component CSS — zone layout, demo containers, controls, tabs"
```

---

### Task 10: Zone — Scroll Animations (`zones/scroll-animations.html`)

**Files:**
- Create: `zones/scroll-animations.html`
- Create: `css/zone-scroll.css`
- Create: `js/zone-scroll.js`

- [ ] **Step 1: Create `zones/` directory**

```bash
mkdir -p zones
```

- [ ] **Step 2: Create `zones/scroll-animations.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scroll Animations — A Love Letter to the Web</title>
  <meta name="description" content="Explore CSS scroll-driven animations — parallax, scroll-linked progress, and view() timelines with zero JavaScript.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/layout.css">
  <link rel="stylesheet" href="../css/animations.css">
  <link rel="stylesheet" href="../css/transitions.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/zone-scroll.css">
</head>
<body>
  <a href="#main-content" class="visually-hidden">Skip to main content</a>

  <header class="page-header">
    <a href="../index.html" class="logo" data-transition="root">◈ LLTW</a>
    <nav aria-label="Main navigation">
      <a href="../index.html" data-transition="root">Timeline</a>
      <a href="../hub.html" data-transition="hub-node">Observatory</a>
      <a href="../playground.html" data-transition="root">Playground</a>
      <a href="../components.html" data-transition="root">Components</a>
    </nav>
  </header>

  <main id="main-content">
    <!-- Act 1: Art — Parallax Galaxy -->
    <section class="zone-hero" style="--zone-color: #646cff;" aria-label="Scroll animations art piece">
      <div class="galaxy">
        <div class="galaxy-layer stars-far" aria-hidden="true"></div>
        <div class="galaxy-layer stars-mid" aria-hidden="true"></div>
        <div class="galaxy-layer stars-near" aria-hidden="true"></div>
        <div class="galaxy-layer nebula" aria-hidden="true"></div>
        <div class="galaxy-planet planet-1" aria-hidden="true"></div>
        <div class="galaxy-planet planet-2" aria-hidden="true"></div>
      </div>
      <div class="zone-hero-text">
        <span class="zone-label">◆ Zone 1</span>
        <h1>Scroll Animations</h1>
        <p class="subtitle">The scroll is the timeline. No JavaScript required.</p>
      </div>
      <div class="scroll-hint" aria-hidden="true">↓ Scroll to explore</div>
    </section>

    <!-- Act 2: Story -->
    <section class="zone-story section-content">
      <a href="../hub.html" class="back-to-hub" data-transition="hub-node">← Back to Observatory</a>

      <h2>The Story</h2>

      <div class="browser-support">
        <span class="supported">Chrome 115+</span>
        <span class="supported">Edge 115+</span>
        <span class="supported">Firefox 110+</span>
        <span class="partial">Safari 17.4+ (partial)</span>
      </div>

      <p>For years, scroll-linked animations required JavaScript — IntersectionObserver, scroll event listeners, requestAnimationFrame loops. The new <code>animation-timeline</code> property changes everything.</p>

      <p>With <code>animation-timeline: scroll()</code>, any CSS animation can be driven by scroll position instead of time. The browser handles the math, the performance, and the optimization. Your animation keyframes stay exactly the same — only the timeline changes.</p>

      <div class="code-block" id="code-scroll-basic">
        <span class="comment">/* Link any animation to scroll position */</span><br>
        <span class="selector">.element</span> {<br>
        &nbsp;&nbsp;<span class="property">animation</span>: <span class="value">fade-in linear both</span>;<br>
        &nbsp;&nbsp;<span class="property">animation-timeline</span>: <span class="function">scroll()</span>;<br>
        }
      </div>
      <button class="copy-btn" data-copy-target="code-scroll-basic" aria-label="Copy code to clipboard">Copy</button>

      <p>The <code>view()</code> timeline is even more powerful — it fires based on when an element enters and exits the viewport, giving you entrance and exit animations without any observer setup.</p>

      <div class="code-block" id="code-scroll-view">
        <span class="comment">/* Animate based on element visibility */</span><br>
        <span class="selector">.card</span> {<br>
        &nbsp;&nbsp;<span class="property">animation</span>: <span class="value">slide-up linear both</span>;<br>
        &nbsp;&nbsp;<span class="property">animation-timeline</span>: <span class="function">view()</span>;<br>
        &nbsp;&nbsp;<span class="property">animation-range</span>: <span class="value">entry 0% entry 100%</span>;<br>
        }
      </div>
      <button class="copy-btn" data-copy-target="code-scroll-view" aria-label="Copy code to clipboard">Copy</button>
    </section>

    <!-- Act 3: Playground -->
    <section class="zone-playground section-content" aria-label="Scroll animations playground">
      <h2>Playground</h2>
      <p class="subtitle">Configure a scroll-driven animation and see it live.</p>

      <div class="demo-container">
        <div class="demo-preview" id="scroll-demo-preview">
          <div class="scroll-demo-box" id="scroll-demo-box">
            Scroll me
          </div>
        </div>
        <div class="demo-controls">
          <div class="control-group">
            <label for="timeline-type">Timeline</label>
            <select id="timeline-type">
              <option value="scroll">scroll()</option>
              <option value="view">view()</option>
            </select>
          </div>
          <div class="control-group">
            <label for="animation-select">Animation</label>
            <select id="animation-select">
              <option value="fade">Fade In</option>
              <option value="slide">Slide Up</option>
              <option value="scale">Scale Up</option>
              <option value="rotate">Rotate</option>
            </select>
          </div>
          <div class="control-group">
            <label for="range-start">Range Start</label>
            <input type="range" id="range-start" min="0" max="100" value="0">
          </div>
          <div class="control-group">
            <label for="range-end">Range End</label>
            <input type="range" id="range-end" min="0" max="100" value="100">
          </div>
        </div>
      </div>

      <div class="code-block" id="scroll-generated-code" style="margin-top: var(--space-lg);">
        <span class="comment">/* Generated CSS */</span><br>
        <span class="selector">.element</span> {<br>
        &nbsp;&nbsp;<span class="property">animation</span>: <span class="value">fade-in linear both</span>;<br>
        &nbsp;&nbsp;<span class="property">animation-timeline</span>: <span class="function">scroll()</span>;<br>
        &nbsp;&nbsp;<span class="property">animation-range</span>: <span class="value">entry 0% entry 100%</span>;<br>
        }
      </div>
      <button class="copy-btn" data-copy-target="scroll-generated-code" aria-label="Copy generated code">Copy</button>
    </section>
  </main>

  <nav class="zone-nav" aria-label="Zone navigation">
    <a href="../hub.html" title="Observatory" data-transition="hub-node">◈</a>
    <a href="scroll-animations.html" aria-current="page" title="Scroll Animations" style="background: #646cff; color: white;">◆</a>
    <a href="popover-dialog.html" title="Popover & Dialog" data-transition="zone-content">◇</a>
    <a href="css-art.html" title="CSS Art" data-transition="zone-content">●</a>
    <a href="container-queries.html" title="Container Queries" data-transition="zone-content">◈</a>
    <a href="view-transitions.html" title="View Transitions" data-transition="zone-content">▲</a>
    <a href="houdini.html" title="Houdini" data-transition="zone-content">■</a>
    <a href="has-selector.html" title=":has() Selector" data-transition="zone-content">★</a>
    <a href="cascade-layers.html" title="Cascade Layers" data-transition="zone-content">⬡</a>
  </nav>

  <script type="module" src="../js/transitions.js"></script>
  <script type="module" src="../js/utils.js"></script>
  <script type="module" src="../js/zone-scroll.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `css/zone-scroll.css`**

```css
/* === Scroll Animations Zone === */

/* Parallax Galaxy (Act 1) */
.galaxy {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.galaxy-layer {
  position: absolute;
  inset: 0;
  animation: galaxy-drift linear both;
  animation-timeline: scroll();
}

.stars-far {
  background: radial-gradient(1px 1px at 10% 20%, white 50%, transparent 100%),
              radial-gradient(1px 1px at 30% 60%, white 50%, transparent 100%),
              radial-gradient(1px 1px at 50% 10%, white 50%, transparent 100%),
              radial-gradient(1px 1px at 70% 80%, white 50%, transparent 100%),
              radial-gradient(1px 1px at 90% 40%, white 50%, transparent 100%),
              radial-gradient(1.5px 1.5px at 15% 75%, white 40%, transparent 100%),
              radial-gradient(1px 1px at 85% 15%, white 50%, transparent 100%),
              radial-gradient(1.5px 1.5px at 45% 90%, white 40%, transparent 100%);
  animation-range: entry 0% exit 100%;
}

@keyframes galaxy-drift {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-50px) scale(1.05); }
}

.stars-mid {
  background: radial-gradient(1.5px 1.5px at 20% 30%, oklch(0.8 0.1 270) 50%, transparent 100%),
              radial-gradient(2px 2px at 55% 45%, oklch(0.8 0.1 295) 50%, transparent 100%),
              radial-gradient(1.5px 1.5px at 75% 70%, oklch(0.85 0.08 200) 50%, transparent 100%),
              radial-gradient(2px 2px at 40% 85%, oklch(0.8 0.12 330) 50%, transparent 100%),
              radial-gradient(1.5px 1.5px at 60% 15%, oklch(0.8 0.1 270) 50%, transparent 100%);
  animation: galaxy-drift-mid linear both;
  animation-timeline: scroll();
  animation-range: entry 0% exit 100%;
}

@keyframes galaxy-drift-mid {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-100px) scale(1.1); }
}

.stars-near {
  background: radial-gradient(2.5px 2.5px at 25% 55%, white 50%, transparent 100%),
              radial-gradient(3px 3px at 65% 25%, oklch(0.9 0.08 270) 50%, transparent 100%),
              radial-gradient(2px 2px at 80% 65%, oklch(0.85 0.1 200) 50%, transparent 100%);
  animation: galaxy-drift-near linear both;
  animation-timeline: scroll();
  animation-range: entry 0% exit 100%;
}

@keyframes galaxy-drift-near {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-150px) scale(1.15); }
}

.nebula {
  background: radial-gradient(ellipse 40% 30% at 35% 45%, oklch(0.3 0.15 270 / 0.4), transparent),
              radial-gradient(ellipse 30% 40% at 70% 60%, oklch(0.25 0.12 295 / 0.3), transparent);
  animation: nebula-shift linear both;
  animation-timeline: scroll();
  animation-range: entry 0% exit 100%;
}

@keyframes nebula-shift {
  from { opacity: 0.3; transform: scale(1); }
  to { opacity: 0.6; transform: scale(1.2); }
}

.galaxy-planet {
  position: absolute;
  border-radius: 50%;
  animation: planet-float linear both;
  animation-timeline: scroll();
}

.planet-1 {
  width: 60px;
  height: 60px;
  top: 30%;
  left: 20%;
  background: radial-gradient(circle at 35% 35%, oklch(0.6 0.15 270), oklch(0.3 0.1 270));
  box-shadow: 0 0 30px oklch(0.5 0.15 270 / 0.5);
  animation-range: entry 0% exit 100%;
}

.planet-2 {
  width: 40px;
  height: 40px;
  top: 55%;
  right: 25%;
  background: radial-gradient(circle at 35% 35%, oklch(0.65 0.18 340), oklch(0.35 0.12 340));
  box-shadow: 0 0 20px oklch(0.5 0.15 340 / 0.4);
  animation-range: entry 0% exit 100%;
}

@keyframes planet-float {
  from { transform: translateY(0) rotate(0deg); }
  to { transform: translateY(-80px) rotate(15deg); }
}

.zone-hero-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.scroll-hint {
  position: absolute;
  bottom: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--color-muted);
  animation: float 2s ease-in-out infinite;
}

/* Playground demo */
.scroll-demo-box {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #646cff, #a78bfa);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: white;
  transition: all var(--duration-normal) var(--ease-out);
}
```

- [ ] **Step 4: Create `js/zone-scroll.js`**

```js
/**
 * Scroll Animations zone — playground interactivity.
 * Updates the demo box animation and generated code based on controls.
 */
import { initCopyButtons } from './utils.js';

const animations = {
  fade: { name: 'fade-in', css: 'fade-in' },
  slide: { name: 'slide-up', css: 'slide-up' },
  scale: { name: 'scale-up', css: 'scale-up' },
  rotate: { name: 'rotate-in', css: 'rotate-in' },
};

function updateDemo() {
  const timeline = document.getElementById('timeline-type')?.value || 'scroll';
  const anim = document.getElementById('animation-select')?.value || 'fade';
  const rangeStart = document.getElementById('range-start')?.value || '0';
  const rangeEnd = document.getElementById('range-end')?.value || '100';
  const box = document.getElementById('scroll-demo-box');
  const codeEl = document.getElementById('scroll-generated-code');

  if (!box || !codeEl) return;

  const animName = animations[anim]?.css || 'fade-in';
  const rangeType = timeline === 'view' ? 'entry' : 'cover';

  // Update generated code display
  codeEl.innerHTML =
    `<span class="comment">/* Generated CSS */</span><br>` +
    `<span class="selector">.element</span> {<br>` +
    `&nbsp;&nbsp;<span class="property">animation</span>: <span class="value">${animName} linear both</span>;<br>` +
    `&nbsp;&nbsp;<span class="property">animation-timeline</span>: <span class="function">${timeline}()</span>;<br>` +
    `&nbsp;&nbsp;<span class="property">animation-range</span>: <span class="value">${rangeType} ${rangeStart}% ${rangeType} ${rangeEnd}%</span>;<br>` +
    `}`;

  // Apply animation to demo box via inline styles
  box.style.animation = `${animName} linear both`;
  box.style.animationTimeline = `${timeline}()`;
  box.style.animationRange = `${rangeType} ${rangeStart}% ${rangeType} ${rangeEnd}%`;
}

function init() {
  // Bind controls
  ['timeline-type', 'animation-select', 'range-start', 'range-end'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateDemo);
  });

  // Add animation keyframes for playground
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(2rem); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scale-up {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes rotate-in {
      from { opacity: 0; transform: rotate(-180deg) scale(0.5); }
      to { opacity: 1; transform: rotate(0deg) scale(1); }
    }
  `;
  document.head.appendChild(style);

  initCopyButtons();
  updateDemo();
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:8080/zones/scroll-animations.html`. Expected:
- Act 1: Dark galaxy with stars at different parallax depths, planets, nebula — all moving on scroll
- Act 2: Story text with code blocks and copy buttons
- Act 3: Playground with controls that update the demo box and generated code
- Bottom zone-nav with symbols linking to other zones

- [ ] **Step 6: Commit**

```bash
git add zones/scroll-animations.html css/zone-scroll.css js/zone-scroll.js
git commit -m "feat: add Scroll Animations zone — parallax galaxy, story, and timeline playground"
```

---

### Task 11-17: Remaining Zone Pages

Tasks 11-17 follow the exact same pattern as Task 10. Each zone creates 3 files:
- `zones/[name].html` — HTML with 3 acts
- `css/zone-[name].css` — Zone-specific styles
- `js/zone-[name].js` — Zone-specific interactivity (if needed)

**These tasks are fully parallelizable.** Each zone is independent and only depends on the shared CSS files from Tasks 1-3 and 9.

Below are the specs for each. The implementing agent should follow the same HTML skeleton from the shared zone template (see Phase 3 intro), adapting the content per zone.

---

### Task 11: Zone — Popover & Dialog (`zones/popover-dialog.html`)

**Files:**
- Create: `zones/popover-dialog.html`
- Create: `css/zone-popover.css`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: A cascading tower of popovers. Use nested `<div popover>` elements that visually stack and cascade with `@starting-style` entry animations. Each popover is offset and slightly rotated to create a tower effect.
  - Act 2 Story: Explain Popover API (`popover` attribute, `popovertarget`, `popovertargetaction`), `<dialog>` element, `closedby` attribute, `@starting-style` for entry/exit animations. Include code blocks with copy buttons.
  - Act 3 Playground: "Build-a-popover" — radio inputs to select: popover type (auto/manual), trigger action (show/hide/toggle), entry animation (fade/slide/scale), `closedby` behavior (any/closerequest/none). A live preview popover updates based on selections. Generated CSS shown below.

- [ ] **Step 2: Create CSS** — Popover tower styling, stacked card aesthetic with zone accent `#a78bfa`. `@starting-style` animations on all popovers. Dialog backdrop styling.

- [ ] **Step 3: Verify** — Open page, click triggers to show popovers, test playground controls, verify zone-nav works.

- [ ] **Step 4: Commit**

```bash
git add zones/popover-dialog.html css/zone-popover.css
git commit -m "feat: add Popover & Dialog zone — cascading tower, story, and popover builder"
```

---

### Task 12: Zone — CSS Art Gallery (`zones/css-art.html`)

**Files:**
- Create: `zones/css-art.html`
- Create: `css/zone-art.css`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: 6 pure CSS illustrations displayed in a gallery grid. Examples: a sunset landscape (gradients + clip-path), a geometric fox (triangles via borders), a coffee cup (border-radius + shadows), an eye (radial-gradient + @property animation for iris), a mountain scene (overlapping triangles), and a vinyl record (conic-gradient + rotation animation).
  - Act 2 Story: Techniques breakdown — how each illustration is built. Cover: `background` stacking, `clip-path`, `box-shadow` art, `border` triangles, `conic-gradient`, `@property` for animatable custom properties.
  - Act 3 Playground: Step-by-step CSS art guide. Start with a blank div, progressively add properties via checkbox toggles: background → gradient → clip-path → box-shadow → animation. Each toggle adds a CSS property and updates the live preview.

- [ ] **Step 2: Create CSS** — All 6 CSS art pieces (single-div where possible), gallery grid, zone accent `#f472b6`.

- [ ] **Step 3: Verify** — Open page, see all 6 art pieces render, playground toggles work.

- [ ] **Step 4: Commit**

```bash
git add zones/css-art.html css/zone-art.css
git commit -m "feat: add CSS Art Gallery zone — 6 pure CSS illustrations and drawing playground"
```

---

### Task 13: Zone — Container Queries (`zones/container-queries.html`)

**Files:**
- Create: `zones/container-queries.html`
- Create: `css/zone-container.css`
- Create: `js/zone-container.js`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: A single "product card" component that reshapes dramatically at different widths — tiny icon at ~100px, compact card at ~250px, horizontal row at ~500px, full hero at ~800px. All via `@container` queries, no JS.
  - Act 2 Story: Explain `@container`, `container-type`, `container-name`, container query units (cqi, cqb, cqw, cqh), nesting containers. Code blocks with copy.
  - Act 3 Playground: A resizable container (JS `pointerdown`/`pointermove` for drag handles) containing a demo component. Dragging the handle resizes the container, triggering container query breakpoints in real-time. Current container width displayed. Generated `@container` CSS shown below.

- [ ] **Step 2: Create CSS** — The morphing product card at all 4 breakpoints, resize handle styles, zone accent `#34d399`.

- [ ] **Step 3: Create JS** — Drag-to-resize logic for the playground container handles.

- [ ] **Step 4: Verify** — Card reshapes on viewport resize (Act 1), resize handles work in playground (Act 3).

- [ ] **Step 5: Commit**

```bash
git add zones/container-queries.html css/zone-container.css js/zone-container.js
git commit -m "feat: add Container Queries zone — morphing card, story, and resize playground"
```

---

### Task 14: Zone — View Transitions (`zones/view-transitions.html`)

**Files:**
- Create: `zones/view-transitions.html`
- Create: `css/zone-transitions.css`
- Create: `js/zone-transitions.js`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: A 2x3 card grid. Clicking any card triggers a same-document view transition that expands the card to full-screen detail view. Clicking "close" shrinks it back. Each card has a `view-transition-name`.
  - Act 2 Story: Explain View Transitions API — `document.startViewTransition()`, `view-transition-name`, `::view-transition-old/new`, cross-document transitions (`@view-transition { navigation: auto }`), customizing animations.
  - Act 3 Playground: Transition configurator — select easing (ease, ease-in-out, cubic-bezier presets), duration (100ms-1000ms slider), transition type (crossfade, slide, zoom, morph). Live preview: two states that transition between on button click using configured settings. Generated CSS shown.

- [ ] **Step 2: Create CSS** — Card grid, expanded card overlay, view-transition-name assignments, zone accent `#fbbf24`.

- [ ] **Step 3: Create JS** — Card expand/collapse with `startViewTransition()`, playground configurator logic.

- [ ] **Step 4: Verify** — Card click expands smoothly, playground button triggers configured transition.

- [ ] **Step 5: Commit**

```bash
git add zones/view-transitions.html css/zone-transitions.css js/zone-transitions.js
git commit -m "feat: add View Transitions zone — morphing cards, story, and transition configurator"
```

---

### Task 15: Zone — CSS Houdini (`zones/houdini.html`)

**Files:**
- Create: `zones/houdini.html`
- Create: `css/zone-houdini.css`
- Create: `js/zone-houdini.js`
- Create: `js/worklets/pattern-worklet.js`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: A large canvas element painted by a CSS Houdini paint worklet — generative geometric patterns (circles, lines, grids) that animate via `@property` registered custom properties.
  - Act 2 Story: Explain CSS Houdini — Paint API (`CSS.paintWorklet.addModule()`), `@property` registration, Properties & Values API, Layout API status. Note browser support (Chromium only for Paint API).
  - Act 3 Playground: Sliders that control `@property` custom properties (--pattern-density, --pattern-color, --pattern-size) which the paint worklet reads. Live update as sliders move. Generated `@property` + `background: paint()` CSS shown.

- [ ] **Step 2: Create CSS** — Art piece layout, `@property` declarations, `background: paint(pattern)` usage, zone accent `#60a5fa`. Include fallback for browsers without Paint API.

- [ ] **Step 3: Create JS** — Paint worklet registration, playground slider bindings, worklet file.

- [ ] **Step 4: Create `js/worklets/pattern-worklet.js`** — A paint worklet class that reads input properties and draws geometric patterns on the canvas.

- [ ] **Step 5: Verify** — In Chrome: paint worklet renders, sliders update pattern. In Firefox/Safari: fallback gradient shown.

- [ ] **Step 6: Commit**

```bash
git add zones/houdini.html css/zone-houdini.css js/zone-houdini.js js/worklets/pattern-worklet.js
git commit -m "feat: add CSS Houdini zone — paint worklet patterns and property playground"
```

---

### Task 16: Zone — :has() Selector (`zones/has-selector.html`)

**Files:**
- Create: `zones/has-selector.html`
- Create: `css/zone-has.css`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: An interactive form that styles itself based on its own state — entirely with CSS `:has()`. Labels recolor when inputs have values (`:has(input:not(:placeholder-shown))`), fieldsets highlight when they contain a focused input (`:has(input:focus)`), the submit button enables when all required fields are filled, and the form background celebrates (gradient shift) when everything is complete.
  - Act 2 Story: Explain `:has()` — parent selection, sibling-based logic, state-driven styling, combining with `:not()`, `:checked`, `:focus`. Real-world use cases: form validation, accordion behavior, conditional layouts.
  - Act 3 Playground: A `:has()` query builder — dropdown for target element, dropdown for condition (`:has()` inner selector), checkbox for `:not()` wrapper. Live preview shows which elements match. Generated CSS shown.

- [ ] **Step 2: Create CSS** — Self-styling form (all `:has()` driven, zero JS), query builder styles, zone accent `#fb923c`.

- [ ] **Step 3: Verify** — Fill in form fields, watch styles change automatically. Playground selectors highlight matches.

- [ ] **Step 4: Commit**

```bash
git add zones/has-selector.html css/zone-has.css
git commit -m "feat: add :has() Selector zone — self-styling form and query builder"
```

---

### Task 17: Zone — Cascade Layers (`zones/cascade-layers.html`)

**Files:**
- Create: `zones/cascade-layers.html`
- Create: `css/zone-layers.css`
- Create: `js/zone-layers.js`

- [ ] **Step 1: Create HTML** — Structure:
  - Act 1 Art: Overlapping translucent colored glass panes, each labeled with a layer name (`@layer reset`, `@layer base`, `@layer components`, `@layer utilities`). The panes visually stack in order, and the topmost is brightest — representing cascade layer priority.
  - Act 2 Story: Explain `@layer` — declaration order, `@layer` statement ordering, `!important` reversal in layers, unlayered styles vs layered, nesting layers. Code blocks with copy.
  - Act 3 Playground: Layer ordering sandbox — draggable layer cards (JS drag-and-drop). Reordering changes the `@layer` declaration order and immediately updates a styled example showing which layer's styles "win." Generated `@layer` CSS shown.

- [ ] **Step 2: Create CSS** — Glass pane art, layer labels, zone accent `#e879f9`.

- [ ] **Step 3: Create JS** — Drag-and-drop reordering of layer cards, live style recalculation.

- [ ] **Step 4: Verify** — Glass panes render correctly, dragging layers changes the winning styles.

- [ ] **Step 5: Commit**

```bash
git add zones/cascade-layers.html css/zone-layers.css js/zone-layers.js
git commit -m "feat: add Cascade Layers zone — glass pane art and layer ordering sandbox"
```

---

## Phase 4: Utility Pages

---

### Task 18: Playground Lab (`playground.html`)

**Files:**
- Create: `playground.html`
- Create: `css/playground.css`
- Create: `js/playground.js`

- [ ] **Step 1: Create `playground.html`** — Split-pane layout. Left pane: `contenteditable` code editor with monospace styling. Right pane: live preview `<iframe>` (srcdoc) or scoped `<div>`. Top bar with preset buttons ("Scroll Animations", "Container Queries", etc.), share button, and clear button.

- [ ] **Step 2: Create `css/playground.css`** — Editor styling (dark surface, monospace, line numbers via CSS counters), preview pane, preset button pills, responsive stacking.

- [ ] **Step 3: Create `js/playground.js`** — MutationObserver on contenteditable to detect changes, inject user CSS into preview iframe/scoped div via `@scope`, URL hash encoding/decoding for sharing, preset loading, keyword highlighting via JS text node wrapping.

- [ ] **Step 4: Verify** — Type CSS in editor, see it apply in preview. Click presets, verify they load. Copy URL hash, paste in new tab, verify state restores.

- [ ] **Step 5: Commit**

```bash
git add playground.html css/playground.css js/playground.js
git commit -m "feat: add Playground Lab — live CSS editor with presets, sharing, and scoped preview"
```

---

### Task 19: Component Toolkit (`components.html`)

**Files:**
- Create: `components.html`
- Create: `css/toolkit.css`

- [ ] **Step 1: Create `components.html`** — Category filter (radio inputs: All, Navigation, Feedback, Forms, Layout) at top. Component cards below, each with: live demo, HTML tab, CSS tab (using the `:has()` + radio tab pattern from components.css), and copy button. Components to include:
  - **Popover Menu:** `<button popovertarget>` + `<div popover>` with menu items
  - **Toast Notification:** Popover with auto-dismiss timer, `@starting-style` entrance
  - **Modal Dialog:** `<dialog>` with backdrop, `closedby="any"`, entry animation
  - **Responsive Card:** `@container` query card that reshapes
  - **Animated Accordion:** `<details>` + `<summary>` with `@starting-style` open animation
  - **Toggle Switch:** Checkbox styled as iOS-like toggle via `:has(input:checked)`
  - **Tab Bar:** Radio inputs + `:has()` for active tab, panels shown/hidden via CSS
  - **Tooltip:** Anchor positioning (CSS `anchor()`) or fallback `popover` positioning

- [ ] **Step 2: Create `css/toolkit.css`** — Category filter styling (`:has()` driven), component card grid, all 8 component implementations, tab code viewers per component.

- [ ] **Step 3: Verify** — All 8 components render and function. Category filter shows/hides correctly. Copy buttons work. Tabs switch between HTML and CSS views.

- [ ] **Step 4: Commit**

```bash
git add components.html css/toolkit.css
git commit -m "feat: add Component Toolkit — 8 production-ready modern HTML/CSS components"
```

---

## Phase 5: Polish & Deploy

---

### Task 20: README & Final Push

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# A Love Letter to the Web

A cinematic, interactive journey through the evolution of the web platform — from 1991 to 2026.

**[View Live Site →](https://ixmxamar.github.io/HTML/)**

## What Is This?

A zero-dependency website celebrating every major HTML and CSS feature that makes the modern web possible. Part art gallery, part interactive playground, part developer reference.

## Features

- **Cinematic Timeline** — Scroll through 5 eras of the web, each styled with the tech of its time
- **Observatory Hub** — Interactive constellation map linking to 8 feature deep-dives
- **8 Zone Deep-Dives** — Scroll Animations, Popover API, CSS Art, Container Queries, View Transitions, CSS Houdini, :has() Selector, Cascade Layers
- **Playground Lab** — Live CSS editor with presets and URL sharing
- **Component Toolkit** — 8 copy-paste production components using modern APIs

## Tech

Zero dependencies. No npm. No build step. No frameworks.

- HTML5, CSS (oklch, scroll-driven animations, @property, :has(), container queries, @layer, View Transitions, Houdini Paint API)
- Vanilla JavaScript (View Transitions orchestrator, Clipboard API, contenteditable editor)
- Deployed via GitHub Pages

## Run Locally

```bash
# Any static server works
python -m http.server 8080
# Open http://localhost:8080
```

## Browser Support

Best experience in Chrome/Edge 115+. Most features work in Firefox 110+ and Safari 17.4+. CSS Houdini Paint API is Chromium-only.

## License

MIT
```

- [ ] **Step 2: Push all changes**

```bash
git add README.md
git commit -m "docs: add README with project overview and live site link"
git push origin main
```

- [ ] **Step 3: Verify live site**

Open `https://ixmxamar.github.io/HTML/` and navigate through:
1. Landing page — all 5 eras scroll correctly
2. Hub — constellation map renders, nodes link to zones
3. At least one zone page — Art, Story, Playground all work
4. Playground — editor and preview functional
5. Components — filter and demos work

- [ ] **Step 4: Celebrate** — The repo is no longer empty. 🎉

---

## Parallelization Guide

| Tasks | Dependencies | Can Parallelize? |
|-------|-------------|-----------------|
| 1-3 | None | Sequential (each builds on prior) |
| 4-5 | Tasks 1-3 | Sequential (landing page) |
| 6 | Task 5 | After landing complete |
| 7-8 | Tasks 1-3 | After foundation, parallel with 4-5 |
| 9 | Tasks 1-3 | After foundation |
| 10-17 | Task 9 | **All 8 zones in parallel** |
| 18-19 | Task 9 | **Parallel with zones, parallel with each other** |
| 20 | All above | After everything |

**Maximum parallelism:** After Tasks 1-9 (foundation + landing + hub + shared components), Tasks 10-19 can all run simultaneously — that's **10 parallel agents**.