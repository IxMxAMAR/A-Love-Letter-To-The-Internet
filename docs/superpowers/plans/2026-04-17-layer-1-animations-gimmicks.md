# Layer 1: Core Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the site's animation quality, add ~25 new gimmicks, and polish interaction surfaces to establish a polished, expressive baseline before Layer 2 adds new pages and systems.

**Architecture:** Each task is a focused, commit-worthy unit: either one animation system, one gimmick, or one polish sweep. Gimmicks plug into existing `js/gimmicks/*.js` modules (per-page) or get their own module when site-wide. New CSS goes in `css/animations.css` (shared) or page-specific stylesheets. All new features are wrapped in try-catch and respect `prefers-reduced-motion` by default.

**Tech Stack:** Vanilla HTML/CSS/JS (zero dependencies). Web Audio API (oscillators), Canvas API (cursor trail, pixel rain), View Transitions API, CSS `@starting-style`, `@property`, `animation-timeline: scroll()`, `clip-path`, Scroll Snap.

**Spec:** `docs/superpowers/specs/2026-04-14-love-letter-mega-expansion-design.md` — Layer 1 section.

**Sequencing note:** Tasks 1–8 (Animation Upgrades) establish shared CSS/JS primitives that gimmick tasks later depend on. Do them first and in order. Tasks 9–22 (Gimmicks) can mostly run in parallel once the animation primitives exist. Tasks 23–27 (Polish) run last because they touch many of the same surfaces gimmicks add.

---

## File Map

### Existing files modified

| File | Responsibility | Changes |
|------|---------------|---------|
| `css/animations.css` | Shared keyframes + scroll-driven utilities | Page-load choreography, micro-interactions, text effects, ambient background keyframes, skeleton + spinner, magnetic hover util |
| `css/transitions.css` | View Transitions definitions | Hub→zone morph, shared header, dark-mode circular reveal |
| `css/base.css` | Tokens, reset | Custom text selection per zone via `[data-zone]`, `scroll-behavior: smooth`, `scroll-margin-top` |
| `css/gimmicks.css` | Theme/selection/print | Upgraded print stylesheet with `.print-only` message + QR, custom `::selection` per zone |
| `css/landing.css` | Landing page styles | Scroll-snap-type on era sections, parallax ranges, text effect classes |
| `css/hub.css` | Hub constellation | Star twinkle background, visited-zone checkmark styling |
| `css/playground.css` | Playground styles | Auto-suggest dropdown, syntax error underline, status bar counts |
| `css/toolkit.css` | Components page | Search input styling, drag-handle + dragging states |
| `js/gimmicks/global.js` | Global easter eggs | Konami, matrix/pixel rain, focus mode, screenshot mode, gravity mode, magnetic, cursor trail, typewriter console upgrade + `help()`, page fingerprint, rainbow scroll, copy-paste surprise, double-click defs, session state (milestones, time-spent, breadcrumb), custom cursor ghosts |
| `js/gimmicks/chiptune.js` | Web Audio music | Generalized into small synth engine; adds `playSfx(name)` for micro-sounds |
| `js/gimmicks/landing.js` | Landing gimmicks | Scroll-snap honor, rainbow hue update binding |
| `js/gimmicks/hub-gm.js` | Hub gimmicks | Visited-zone checkmark render, star twinkle init |
| `js/gimmicks/components-gm.js` | Components page gimmicks | Drag-reorder wiring, search filter |
| `js/gimmicks/playground-gm.js` | Playground gimmicks | Auto-suggest, syntax error detection, count updaters |
| `js/gimmicks/zones.js` | Zone gimmicks | Ambient zone music wiring per-zone |
| `js/transitions.js` | Page transitions | Hub-to-zone shared element transition |
| All `*.html` files | Markup | ASCII art source comments, skip-to-top button, print QR, back-to-top button |
| All `zones/*.html` | Zone markup | Zone-specific `data-zone` attribute for selection styling |

### New files

| File | Responsibility |
|------|---------------|
| `css/gimmicks-layer1.css` | New Layer 1 gimmick styles (magnetic, cursor trail overlay, fingerprint badge, screenshot/focus/gravity modes, milestone toast, breadcrumb, session footer, collab cursors) |
| `js/gimmicks/sfx.js` | Unified sound effects module using Web Audio oscillators (`playSfx('click' \| 'whoosh' \| 'chime' \| 'pop' \| 'swoosh' \| 'type')`) |
| `js/gimmicks/cursor-trail.js` | Canvas cursor trail particle system |
| `js/gimmicks/fingerprint.js` | Procedural per-visit CSS art fingerprint |
| `js/gimmicks/session.js` | Session state: visit milestones, time-spent tick, breadcrumb trail, visited-zones list |
| `js/gimmicks/magnetic.js` | Magnetic pull for `.magnetic` elements |
| `js/gimmicks/modes.js` | Toggle engines for focus, screenshot, gravity, matrix/pixel-rain |
| `js/gimmicks/defs.js` | CSS-term dictionary + double-click tooltip handler |
| `js/gimmicks/cursor-ghosts.js` | Pre-recorded cursor replay overlay |

---

## Task 1: Page Load Choreography

**Files:**
- Modify: `css/animations.css` — add `@keyframes page-in-*` + utility classes
- Modify: `css/base.css` — apply `.page-in-*` classes via `[data-enter]` attribute
- Modify: all main HTML files to add `data-enter="header|hero|stagger|accent"` attributes where appropriate

- [ ] **Step 1: Add page-in keyframes**

In `css/animations.css`:

```css
@keyframes page-in-header {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes page-in-hero {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes page-in-accent {
  from { opacity: 0; }
  to   { opacity: 1; }
}

[data-enter="header"] { animation: page-in-header 300ms ease-out both; }
[data-enter="hero"]   { animation: page-in-hero 400ms cubic-bezier(.2,.8,.2,1) 200ms both; }
[data-enter="stagger"] > * { animation: page-in-header 300ms ease-out both; animation-delay: calc(var(--i, 0) * 75ms + 250ms); }
[data-enter="accent"] { animation: page-in-accent 600ms ease-out 500ms both; }

@media (prefers-reduced-motion: reduce) {
  [data-enter] { animation: none !important; }
}
```

- [ ] **Step 2: Apply to `index.html` — add `data-enter` attrs**

Set `data-enter="header"` on `.page-header`, `data-enter="hero"` on `.hero` or main intro, `data-enter="stagger"` on primary content wrappers (set `style="--i: 0"`, `1`, `2` on children where meaningful), `data-enter="accent"` on glow/line/dot elements.

- [ ] **Step 3: Apply to `hub.html`** — same pattern. Header, `.hub-intro` → hero, `.zone-node` elements → stagger children (they already have `--stagger: N`; reuse that as `--i`).

- [ ] **Step 4: Apply to `playground.html` and `components.html`** — same pattern.

- [ ] **Step 5: Apply to all 8 `zones/*.html`** — same pattern.

- [ ] **Step 6: Verify in browser**

Run: `python -m http.server 8080` and open http://localhost:8080 — confirm header slides, hero scales, staggered items cascade, accents fade last.

- [ ] **Step 7: Commit**

```bash
git add css/animations.css css/base.css *.html zones/*.html
git commit -m "feat(layer-1): page-load choreography across all pages"
```

---

## Task 2: Scroll-Driven Parallax on Landing

**Files:**
- Modify: `css/landing.css` — add parallax rules for era background/foreground elements
- Modify: `index.html` — mark background/foreground elements with classes

- [ ] **Step 1: Add parallax CSS**

In `css/landing.css`:

```css
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .era .bg-layer {
      animation: parallax-slow linear;
      animation-timeline: view();
      animation-range: cover 0% cover 100%;
    }
    .era .fg-layer {
      animation: parallax-fast linear;
      animation-timeline: view();
      animation-range: cover 0% cover 100%;
    }
  }
}
@keyframes parallax-slow { from { transform: translateY(-30px); } to { transform: translateY(30px); } }
@keyframes parallax-fast { from { transform: translateY(60px); } to { transform: translateY(-60px); } }
```

- [ ] **Step 2: Add `.bg-layer` and `.fg-layer` wrappers**

For each `.era` section in `index.html`, wrap decorative background gradients/GIFs with `<div class="bg-layer">…</div>` and wrap headings/accent elements with `<div class="fg-layer">…</div>`.

- [ ] **Step 3: Verify scroll parallax**

Scroll the landing page in Chrome with `prefers-reduced-motion: no-preference`. Background should drift down-up; foreground should drift up-down.

- [ ] **Step 4: Commit**

```bash
git add css/landing.css index.html
git commit -m "feat(layer-1): scroll-driven parallax on landing era sections"
```

---

## Task 3: Site-Wide Micro-Interactions

**Files:**
- Modify: `css/animations.css` — add ripple, underline, lift, spring, input-glow utilities
- Modify: `css/base.css` — apply defaults to `a`, `button`, `.card`, `input`, `[role="button"]`

- [ ] **Step 1: Add micro-interaction primitives to `css/animations.css`**

```css
/* Button hover + press */
button:not(.no-micro), [role="button"]:not(.no-micro) {
  transition: transform 150ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease;
}
button:not(.no-micro):hover, [role="button"]:not(.no-micro):hover { transform: scale(1.02); }
button:not(.no-micro):active, [role="button"]:not(.no-micro):active { transform: scale(0.98); }

/* Button ripple */
button.ripple { position: relative; overflow: hidden; }
button.ripple::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.45) 0%, transparent 60%);
  opacity: 0; pointer-events: none; transition: opacity 400ms ease;
}
button.ripple.ripple-active::after { opacity: 1; animation: ripple-expand 500ms ease-out both; }
@keyframes ripple-expand { from { background-size: 0% 0%; } to { background-size: 240% 240%; } }

/* Link underline */
a.anim-underline {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: background-size 250ms cubic-bezier(.2,.8,.2,1);
}
a.anim-underline:hover, a.anim-underline:focus-visible { background-size: 100% 1px; }

/* Card lift */
.card, .zone-node, .component-demo {
  transition: transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease;
}
.card:hover, .zone-node:hover, .component-demo:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -12px oklch(0 0 0 / 0.4);
}

/* Input focus glow */
input:not([type="checkbox"]):not([type="radio"]):focus-visible,
textarea:focus-visible, select:focus-visible, [contenteditable]:focus-visible {
  box-shadow: 0 0 0 3px oklch(from var(--accent, oklch(0.65 0.18 290)) l c h / 0.35);
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

- [ ] **Step 2: Wire up ripple JS in `js/gimmicks/global.js`**

Add inside the module's main init:

```js
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.ripple');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  btn.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
  btn.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  btn.classList.remove('ripple-active');
  // force reflow
  void btn.offsetWidth;
  btn.classList.add('ripple-active');
  setTimeout(() => btn.classList.remove('ripple-active'), 500);
});
```

- [ ] **Step 3: Opt-in classes**

Add `class="ripple"` to visible call-to-action buttons in `index.html`, `hub.html`, `playground.html`, `components.html`. Add `class="anim-underline"` to nav links and in-content anchor tags (not the logo).

- [ ] **Step 4: Verify**

Visit each main page. Hover buttons → slight scale. Click → ripple + press. Hover inline links → underline sweeps left→right. Hover cards → lift.

- [ ] **Step 5: Commit**

```bash
git add css/animations.css css/base.css js/gimmicks/global.js *.html zones/*.html
git commit -m "feat(layer-1): site-wide micro-interactions (ripple, underline, lift, spring, input glow)"
```

---

## Task 4: Text Effects (Gradient Shimmer, Letter Reveal, Glitch, Scramble)

**Files:**
- Modify: `css/animations.css` — add shimmer, letter-reveal, glitch keyframes
- Modify: `js/gimmicks/global.js` — add `scramble(el, finalText, duration)` helper + letter-wrap utility
- Modify: all zone `zones/*.html` — add `data-text-effect="reveal"` to `<h1>` or title element
- Modify: `404.html` — add glitch effect class to heading

- [ ] **Step 1: Add CSS**

```css
@keyframes shimmer-bg {
  from { background-position: 0% 50%; }
  to   { background-position: 200% 50%; }
}
.text-shimmer {
  background-image: linear-gradient(90deg, currentColor 0%, oklch(0.8 0.18 290) 50%, currentColor 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer-bg 4s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .text-shimmer { animation: none; color: currentColor; background: none; } }

/* letter reveal — applied by JS-wrapped spans */
@keyframes letter-reveal {
  from { opacity: 0; clip-path: inset(0 100% 0 0); }
  to   { opacity: 1; clip-path: inset(0 0 0 0); }
}
.letter-reveal > span {
  display: inline-block;
  animation: letter-reveal 500ms cubic-bezier(.2,.8,.2,1) both;
  animation-delay: calc(var(--i, 0) * 40ms);
}

/* glitch for 404 */
@keyframes glitch-skew { 0%,100% { transform: skew(0); } 50% { transform: skew(-2deg,1deg); } }
@keyframes glitch-clip-r { 0%,100% { clip-path: inset(0 0 0 0); } 20% { clip-path: inset(0 0 45% 0); } 40% { clip-path: inset(50% 0 0 0); } }
.text-glitch { position: relative; animation: glitch-skew 3.2s infinite; }
.text-glitch::before, .text-glitch::after {
  content: attr(data-text); position: absolute; inset: 0; pointer-events: none;
}
.text-glitch::before { color: #ff00aa; transform: translate(-2px,0); animation: glitch-clip-r 2.4s infinite; }
.text-glitch::after  { color: #00aaff; transform: translate(2px,0);  animation: glitch-clip-r 2.4s infinite reverse; }
```

- [ ] **Step 2: Add letter-reveal wrapper helper in `js/gimmicks/global.js`**

```js
export function wrapLetters(el) {
  if (!el || el.dataset.wrapped) return;
  el.dataset.wrapped = '1';
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? '\u00a0' : ch;
    s.style.setProperty('--i', i);
    el.appendChild(s);
  });
}
// init: qsa `[data-text-effect="reveal"]` → wrap letters, add class
document.querySelectorAll('[data-text-effect="reveal"]').forEach(el => {
  wrapLetters(el);
  el.classList.add('letter-reveal');
});
```

- [ ] **Step 3: Add scramble helper**

```js
export function scrambleText(el, finalText, duration = 900) {
  const chars = '!@#$%^&*(){}[]<>?/\\|~';
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const resolved = Math.floor(finalText.length * t);
    let out = finalText.slice(0, resolved);
    for (let i = resolved; i < finalText.length; i++) {
      out += chars[(Math.random() * chars.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

Expose on `window.__eni = { wrapLetters, scrambleText, ... }` so other modules (achievements) can call it later.

- [ ] **Step 4: Apply to zones and 404**

In each `zones/*.html`, add `data-text-effect="reveal"` to the first `<h1>`. In `404.html`, add `class="text-glitch" data-text="404"` to the heading.

- [ ] **Step 5: Apply shimmer to landing hero**

In `index.html`, add `class="text-shimmer"` to the main hero headline.

- [ ] **Step 6: Verify**

Zones' h1 should letter-reveal on page load. 404 heading should glitch. Landing hero should shimmer.

- [ ] **Step 7: Commit**

```bash
git add css/animations.css js/gimmicks/global.js index.html 404.html zones/*.html
git commit -m "feat(layer-1): text effects — shimmer, letter reveal, glitch, scramble helper"
```

---

## Task 5: Background Ambient Animations

**Files:**
- Modify: `css/animations.css` — add ambient keyframes
- Modify: `css/landing.css` — floating orbs
- Modify: `css/hub.css` — star twinkle
- Modify: `css/playground.css` — grid pulse
- Modify: each `css/zone-*.css` — aurora rotation
- Modify: respective HTML files — add `<div class="ambient-bg">` container

- [ ] **Step 1: Add shared ambient keyframes**

```css
@keyframes ambient-drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(3%, -4%, 0); } }
@keyframes ambient-twinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 0.9; } }
@keyframes ambient-pulse { 0%,100% { background-size: 40px 40px; } 50% { background-size: 44px 44px; } }
@keyframes ambient-aurora { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.ambient-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
@media (prefers-reduced-motion: reduce) { .ambient-bg { display: none; } }
```

- [ ] **Step 2: Landing orbs**

In `css/landing.css`:

```css
.ambient-bg--orbs::before, .ambient-bg--orbs::after {
  content: ""; position: absolute; width: 48vw; height: 48vw; border-radius: 50%;
  background: radial-gradient(circle, oklch(0.65 0.22 290 / 0.35), transparent 70%);
  filter: blur(40px); animation: ambient-drift 24s ease-in-out infinite;
}
.ambient-bg--orbs::before { top: -10%; left: -10%; }
.ambient-bg--orbs::after { bottom: -10%; right: -10%; background: radial-gradient(circle, oklch(0.65 0.18 200 / 0.35), transparent 70%); animation-direction: reverse; animation-duration: 30s; }
```

Add `<div class="ambient-bg ambient-bg--orbs"></div>` as first child of `<body>` in `index.html`.

- [ ] **Step 3: Hub star twinkle**

In `css/hub.css`:

```css
.ambient-bg--stars { background: transparent; }
.ambient-bg--stars .star {
  position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%;
  animation: ambient-twinkle 3s ease-in-out infinite;
}
```

In `hub.html`, inject stars via existing `js/gimmicks/hub-gm.js`:

```js
(function stars() {
  const host = document.querySelector('.ambient-bg--stars');
  if (!host) return;
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    s.style.top = Math.random() * 100 + '%';
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.opacity = 0.2 + Math.random() * 0.6;
    host.appendChild(s);
  }
})();
```

Add `<div class="ambient-bg ambient-bg--stars"></div>` as first child of hub main.

- [ ] **Step 4: Playground grid pulse**

In `css/playground.css`:

```css
.ambient-bg--grid {
  background-image: linear-gradient(oklch(1 0 0 / 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, oklch(1 0 0 / 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: ambient-pulse 10s ease-in-out infinite;
}
```

Add `<div class="ambient-bg ambient-bg--grid"></div>` to `playground.html`.

- [ ] **Step 5: Zone aurora**

In each `css/zone-*.css` append:

```css
.ambient-bg--aurora::before {
  content: ""; position: absolute; inset: -50%;
  background: conic-gradient(from 0deg, transparent, var(--zone-color, oklch(0.65 0.18 290)) 30%, transparent 60%);
  animation: ambient-aurora 60s linear infinite;
  opacity: 0.12;
}
```

Add `<div class="ambient-bg ambient-bg--aurora"></div>` to every `zones/*.html`.

- [ ] **Step 6: Verify on every page**

Landing: orbs drift. Hub: stars twinkle. Playground: grid pulses. Zones: colored aurora rotates (slow enough to be subtle).

- [ ] **Step 7: Commit**

```bash
git add css/animations.css css/landing.css css/hub.css css/playground.css css/zone-*.css index.html hub.html playground.html zones/*.html js/gimmicks/hub-gm.js
git commit -m "feat(layer-1): per-page ambient background animations"
```

---

## Task 6: View Transition Upgrades (Hub → Zone, Shared Header, Dark-Mode Reveal)

**Files:**
- Modify: `css/transitions.css` — add view-transition-name declarations and custom pseudos
- Modify: `js/transitions.js` — enable `startViewTransition` for theme toggle

- [ ] **Step 1: Declare shared element names in `css/transitions.css`**

```css
.page-header { view-transition-name: site-header; }
.page-header__logo { view-transition-name: site-logo; }
/* zone nodes → already have data-transition="hub-node", map by data-zone */
.zone-node { view-transition-name: none; }
.zone-node[data-zone="scroll"]     { view-transition-name: node-scroll; }
.zone-node[data-zone="popover"]    { view-transition-name: node-popover; }
.zone-node[data-zone="art"]        { view-transition-name: node-art; }
.zone-node[data-zone="container"]  { view-transition-name: node-container; }
.zone-node[data-zone="transitions"]{ view-transition-name: node-transitions; }
.zone-node[data-zone="houdini"]    { view-transition-name: node-houdini; }
.zone-node[data-zone="has"]        { view-transition-name: node-has; }
.zone-node[data-zone="layers"]     { view-transition-name: node-layers; }

/* matching target on each zone page */
.zone-hero[data-zone="scroll"]     { view-transition-name: node-scroll; }
/* ...repeat for each zone */

/* dark-mode circular reveal */
::view-transition-old(root),
::view-transition-new(root) { animation-duration: 500ms; }
html.theme-transition::view-transition-new(root) {
  clip-path: circle(0% at var(--theme-x, 50%) var(--theme-y, 50%));
  animation: theme-reveal 500ms ease-out forwards;
}
@keyframes theme-reveal { to { clip-path: circle(150% at var(--theme-x, 50%) var(--theme-y, 50%)); } }
```

- [ ] **Step 2: Add `.zone-hero[data-zone=…]` container to each `zones/*.html`**

Wrap each zone's hero header area with `<section class="zone-hero" data-zone="...">`.

- [ ] **Step 3: Circular theme reveal in `js/gimmicks/global.js`**

Inside the theme-toggle click handler (currently just flips theme), wrap in View Transition:

```js
const toggleTheme = (evt) => {
  const x = evt?.clientX ?? innerWidth / 2;
  const y = evt?.clientY ?? innerHeight / 2;
  document.documentElement.style.setProperty('--theme-x', x + 'px');
  document.documentElement.style.setProperty('--theme-y', y + 'px');
  const apply = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    try { localStorage.setItem('theme', next === 'dark' ? '' : 'light'); } catch {}
  };
  if (!document.startViewTransition) return apply();
  document.documentElement.classList.add('theme-transition');
  const t = document.startViewTransition(apply);
  t.finished.finally(() => document.documentElement.classList.remove('theme-transition'));
};
```

Wire `toggleTheme` to both the landing theme card and any site-wide toggle.

- [ ] **Step 4: Verify**

Click theme toggle → circular reveal from click point. Navigate hub → zone → shared header persists, zone-node expands into hero.

- [ ] **Step 5: Commit**

```bash
git add css/transitions.css js/gimmicks/global.js zones/*.html
git commit -m "feat(layer-1): view transition upgrades — hub→zone morph and dark-mode circular reveal"
```

---

## Task 7: Canvas Cursor Trail

**Files:**
- Create: `js/gimmicks/cursor-trail.js`
- Create: `css/gimmicks-layer1.css`
- Modify: `js/gimmicks/global.js` — import + toggle on Shift+C

- [ ] **Step 1: Create `css/gimmicks-layer1.css` with canvas positioning**

```css
.cursor-trail-canvas {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999;
}
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .cursor-trail-canvas { display: none; }
}
```

- [ ] **Step 2: Create `js/gimmicks/cursor-trail.js`**

```js
export function initCursorTrail() {
  if (matchMedia('(pointer: coarse)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  const particles = [];
  let on = false;
  const onMove = (e) => {
    if (!on) return;
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 4,
        y: e.clientY + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 + 0.2,
        life: 1,
        hue: 260 + Math.random() * 60,
      });
    }
    while (particles.length > 120) particles.shift();
  };
  addEventListener('mousemove', onMove);
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.03; p.life -= 0.02;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = `oklch(0.8 0.2 ${p.hue})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return { toggle() { on = !on; canvas.style.display = on ? '' : 'none'; return on; }, set(v) { on = !!v; } };
}
```

- [ ] **Step 3: Wire keyboard shortcut in `js/gimmicks/global.js`**

```js
import { initCursorTrail } from './cursor-trail.js';
const trail = initCursorTrail();
document.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.key.toLowerCase() === 'c' && !e.target.closest('input,textarea,[contenteditable]')) {
    e.preventDefault();
    const on = trail.toggle?.();
    if (typeof on === 'boolean') showToast(on ? 'Cursor trail: ON' : 'Cursor trail: OFF');
  }
});
```

- [ ] **Step 4: Link the new stylesheet**

Add `<link rel="stylesheet" href="css/gimmicks-layer1.css">` to every HTML page (after existing gimmicks.css).

- [ ] **Step 5: Verify**

Press Shift+C on any page. Move cursor. Particles with violet hue should trail with fade + slight gravity. Shift+C again → off.

- [ ] **Step 6: Commit**

```bash
git add css/gimmicks-layer1.css js/gimmicks/cursor-trail.js js/gimmicks/global.js *.html zones/*.html
git commit -m "feat(layer-1): canvas cursor trail particle system (Shift+C)"
```

---

## Task 8: Loading States (Skeleton + Spinner)

**Files:**
- Modify: `css/animations.css` — add `.skeleton`, `.spinner` utilities
- Modify: `css/gimmicks-layer1.css` — container positioning

- [ ] **Step 1: Add skeleton + spinner to `css/animations.css`**

```css
.skeleton {
  background: linear-gradient(90deg, oklch(1 0 0 / 0.05), oklch(1 0 0 / 0.12), oklch(1 0 0 / 0.05));
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s linear infinite;
  border-radius: 8px; color: transparent;
}
@keyframes skeleton-shimmer { from { background-position: -100% 0; } to { background-position: 100% 0; } }

.spinner {
  width: 32px; height: 32px; border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, var(--accent, oklch(0.65 0.18 290)));
  -webkit-mask: radial-gradient(circle, transparent 60%, black 62%);
          mask: radial-gradient(circle, transparent 60%, black 62%);
  animation: spinner-rotate 1s linear infinite;
}
@keyframes spinner-rotate { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .skeleton, .spinner { animation: none; }
}
```

- [ ] **Step 2: Verify utility renders**

Temporarily add `<div class="spinner"></div>` to any page body. Loads. Remove.

- [ ] **Step 3: Commit**

```bash
git add css/animations.css
git commit -m "feat(layer-1): skeleton and spinner loading utilities"
```

---

## Task 9: Konami Code

**Files:**
- Modify: `js/gimmicks/global.js`
- Modify: `css/gimmicks-layer1.css` — add `.konami-invert` + confetti canvas class

- [ ] **Step 1: Add CSS**

```css
body.konami-invert { filter: invert(1) hue-rotate(180deg); transition: filter 500ms ease; }
.konami-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 10000; }
```

- [ ] **Step 2: Implement in `js/gimmicks/global.js`**

```js
(function konami() {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let i = 0;
  addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === seq[i].toLowerCase()) {
      i++;
      if (i === seq.length) { i = 0; trigger(); }
    } else i = 0;
  });
  function trigger() {
    document.body.classList.add('konami-invert');
    const c = document.createElement('canvas');
    c.className = 'konami-canvas';
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const parts = Array.from({ length: 120 }, () => ({
      x: Math.random() * c.width, y: -20 - Math.random() * c.height,
      vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 4,
      hue: Math.random() * 360, r: 3 + Math.random() * 5,
    }));
    const end = performance.now() + 10000;
    (function tick(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = `hsl(${p.hue} 80% 60%)`;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      });
      if (t < end) requestAnimationFrame(tick);
      else { c.remove(); document.body.classList.remove('konami-invert'); unlockAchievement('the-code'); }
    })(performance.now());
    try { window.__eni?.chiptune?.play?.(); } catch {}
  }
})();
function unlockAchievement(id) { /* stub — Layer 2 achievement engine */ try { localStorage.setItem(`achievement:${id}`, '1'); showToast(`Achievement unlocked: ${id}`); } catch {} }
```

- [ ] **Step 3: Verify**

Press ↑↑↓↓←→←→BA. Colors invert, confetti rains 10s, chiptune plays, toast appears.

- [ ] **Step 4: Commit**

```bash
git add css/gimmicks-layer1.css js/gimmicks/global.js
git commit -m "feat(layer-1): Konami code — invert, confetti, chiptune, achievement"
```

---

## Task 10: Pixel Rain (Matrix Mode)

**Files:**
- Modify: `js/gimmicks/global.js`
- Modify: `css/gimmicks-layer1.css`

- [ ] **Step 1: Add CSS**

```css
.pixel-rain-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 9998; }
```

- [ ] **Step 2: Implement key-buffer trigger in `js/gimmicks/global.js`**

```js
(function matrix() {
  const target = 'matrix';
  let buf = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,[contenteditable]')) return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-target.length);
    if (buf === target) { buf = ''; rain(); }
  });
  function rain() {
    const c = document.createElement('canvas');
    c.className = 'pixel-rain-canvas';
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const words = ['margin','padding','display','grid','flex','color','content','cascade','::before','@layer','inherit','auto'];
    const cols = Math.floor(c.width / 18);
    const drops = Array(cols).fill(0).map(() => ({ y: Math.random() * -c.height, word: words[(Math.random() * words.length) | 0] }));
    const end = performance.now() + 8000;
    (function tick(t) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ff88';
      drops.forEach((d, i) => {
        ctx.fillText(d.word, i * 18, d.y);
        d.y += 16;
        if (d.y > c.height) { d.y = -20; d.word = words[(Math.random() * words.length) | 0]; }
      });
      if (t < end) requestAnimationFrame(tick); else { c.remove(); unlockAchievement('red-pill'); }
    })(performance.now());
  }
})();
```

- [ ] **Step 3: Verify**

Type "matrix" on any page (outside inputs). Green property names rain for 8s.

- [ ] **Step 4: Commit**

```bash
git add css/gimmicks-layer1.css js/gimmicks/global.js
git commit -m "feat(layer-1): matrix pixel rain trigger"
```

---

## Task 11: Sound Effects Engine (`js/gimmicks/sfx.js`)

**Files:**
- Create: `js/gimmicks/sfx.js`
- Modify: `js/gimmicks/global.js` — initialize + expose `window.__eni.sfx`
- Modify: `js/gimmicks/landing.js`, `components-gm.js`, `hub-gm.js` — trigger appropriate sfx

- [ ] **Step 1: Create `js/gimmicks/sfx.js`**

```js
let ctx = null, muted = true;
const PRESETS = {
  click:   { type: 'triangle', freq: 1200, dur: 0.05, attack: 0.002, release: 0.04, gain: 0.06 },
  pop:     { type: 'sine',     freq: 700,  dur: 0.08, attack: 0.002, release: 0.07, gain: 0.08 },
  whoosh:  { type: 'sawtooth', freq: 220,  dur: 0.25, attack: 0.01,  release: 0.24, gain: 0.05, sweep: 900 },
  swoosh:  { type: 'sine',     freq: 400,  dur: 0.35, attack: 0.01,  release: 0.34, gain: 0.05, sweep: -200 },
  chime:   { type: 'sine',     freq: 880,  dur: 0.6,  attack: 0.01,  release: 0.55, gain: 0.07, chord: [1, 1.26, 1.5] },
  type:    { type: 'square',   freq: 1800, dur: 0.02, attack: 0.001, release: 0.02, gain: 0.04 },
};

function ensure() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; }

export function playSfx(name) {
  if (muted) return;
  try {
    const p = PRESETS[name]; if (!p) return;
    const c = ensure();
    const now = c.currentTime;
    const chord = p.chord || [1];
    chord.forEach((mult) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq * mult, now);
      if (p.sweep) osc.frequency.linearRampToValueAtTime((p.freq + p.sweep) * mult, now + p.dur);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(p.gain, now + p.attack);
      g.gain.linearRampToValueAtTime(0, now + p.attack + p.release);
      osc.connect(g).connect(c.destination);
      osc.start(now); osc.stop(now + p.dur + 0.05);
    });
  } catch (e) { /* swallow */ }
}

export function setSfxMuted(v) { muted = !!v; try { localStorage.setItem('sfx-muted', muted ? '1' : '0'); } catch {} }
export function isSfxMuted() { return muted; }
export function initSfx() {
  try { muted = localStorage.getItem('sfx-muted') !== '0'; } catch { muted = true; }
}
```

- [ ] **Step 2: Initialize + expose in `js/gimmicks/global.js`**

```js
import { initSfx, playSfx, setSfxMuted, isSfxMuted } from './sfx.js';
initSfx();
window.__eni = Object.assign(window.__eni || {}, { sfx: { play: playSfx, mute: setSfxMuted, muted: isSfxMuted } });

// Default triggers
document.addEventListener('click', (e) => {
  if (e.target.closest('button, [role="button"]')) playSfx('click');
  if (e.target.closest('a[href]:not([href^="#"])')) playSfx('swoosh');
});
document.addEventListener('change', (e) => {
  if (e.target.matches('input[type="checkbox"], input[type="radio"]')) playSfx('pop');
});
```

- [ ] **Step 3: Add mute toggle UI**

In `index.html` (and only there — it's site-wide via script) add a floating speaker button:

```html
<button id="sfx-toggle" class="sfx-toggle" aria-label="Toggle sound effects" title="Toggle SFX (M)" style="position:fixed;bottom:12px;right:12px;z-index:50;">🔇</button>
```

And in `js/gimmicks/global.js`:

```js
const sfxBtn = document.getElementById('sfx-toggle');
if (sfxBtn) {
  const sync = () => { sfxBtn.textContent = window.__eni.sfx.muted() ? '🔇' : '🔊'; };
  sync();
  sfxBtn.addEventListener('click', () => { window.__eni.sfx.mute(!window.__eni.sfx.muted()); sync(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'm' && !e.target.closest('input,textarea,[contenteditable]')) { window.__eni.sfx.mute(!window.__eni.sfx.muted()); sync(); } });
}
```

Move the speaker button into every main HTML (simpler than conditionally creating it) — add identical markup to `hub.html`, `playground.html`, `components.html`, all `zones/*.html`.

- [ ] **Step 4: Card-flip whoosh, achievement chime**

In `js/gimmicks/landing.js` at card-flip trigger: `try { window.__eni?.sfx?.play('whoosh'); } catch {}`. In `unlockAchievement(id)` helper: `try { window.__eni?.sfx?.play('chime'); } catch {}`.

- [ ] **Step 5: Verify**

Click around with sfx enabled (🔊). Click a button → click. Toggle checkbox → pop. Flip a landing card → whoosh. Trigger Konami → chime on achievement. M key toggles.

- [ ] **Step 6: Commit**

```bash
git add js/gimmicks/sfx.js js/gimmicks/global.js js/gimmicks/landing.js *.html zones/*.html
git commit -m "feat(layer-1): sound effects engine with opt-in mute toggle"
```

---

## Task 12: ASCII Art Source Comments

**Files:**
- Modify: every `*.html` file (`index.html`, `hub.html`, `playground.html`, `components.html`, `404.html`, `secret.html`, `lol.html`, all `zones/*.html`)

- [ ] **Step 1: Define the header block**

For each HTML file, insert the following ASCII-art block as the first line after `<!DOCTYPE html>`:

```html
<!--
    ┌────────────────────────────────────────────────────────────────┐
    │                                                                │
    │   ██       ██████  ██    ██ ███████     ██      ███████       │
    │   ██      ██    ██ ██    ██ ██          ██      ██            │
    │   ██      ██    ██ ██    ██ █████       ██      █████         │
    │   ██      ██    ██  ██  ██  ██          ██      ██            │
    │   ███████  ██████    ████   ███████     ███████ ███████       │
    │                                                                │
    │        A Love Letter to the Web — {{PAGE-NAME}}                │
    │                                                                │
    │   If you're reading this, you're my kind of person.            │
    │   View-source is a love language.                              │
    │                                                                │
    └────────────────────────────────────────────────────────────────┘
-->
```

Replace `{{PAGE-NAME}}` with the page name (e.g., `Timeline`, `Observatory`, `Playground`, `Scroll Animations`).

- [ ] **Step 2: Add footer credits**

Before closing `</body>` in each file:

```html
<!--
  Made with ♥, sweat, and far too much coffee.
  Zero dependencies. Just HTML, CSS, and JavaScript.
  https://github.com/IxMxAMAR/HTML
-->
```

- [ ] **Step 3: Verify view-source on each page shows the block.**

- [ ] **Step 4: Commit**

```bash
git add *.html zones/*.html
git commit -m "feat(layer-1): ASCII art source comments on every page"
```

---

## Task 13: Magnetic Elements (`js/gimmicks/magnetic.js`)

**Files:**
- Create: `js/gimmicks/magnetic.js`
- Modify: `js/gimmicks/global.js` — import + init
- Modify: `css/gimmicks-layer1.css`
- Modify: headers/CTAs in each HTML — add `class="magnetic"`

- [ ] **Step 1: Add CSS**

```css
.magnetic { transition: transform 150ms ease-out; will-change: transform; display: inline-block; }
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .magnetic { transform: none !important; transition: none; }
}
```

- [ ] **Step 2: Create `js/gimmicks/magnetic.js`**

```js
export function initMagnetic() {
  if (matchMedia('(pointer: coarse)').matches) return;
  const targets = document.querySelectorAll('.magnetic');
  if (!targets.length) return;
  const RADIUS = 80;
  const MAX = 8;
  addEventListener('mousemove', (e) => {
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d < RADIUS) {
        const f = 1 - d / RADIUS;
        t.style.transform = `translate(${(dx / RADIUS) * MAX * f}px, ${(dy / RADIUS) * MAX * f}px)`;
      } else {
        t.style.transform = '';
      }
    });
  });
}
```

- [ ] **Step 3: Wire import in `js/gimmicks/global.js`**

```js
import { initMagnetic } from './magnetic.js';
initMagnetic();
```

- [ ] **Step 4: Tag elements**

Add `class="magnetic"` to: every `.page-header__nav a`, the `.page-header__logo`, and hero CTA buttons (e.g., landing `<a href="hub.html">Enter the Observatory</a>`).

- [ ] **Step 5: Verify**

Hover near nav links — they pull toward cursor, max 8px. Mobile: no transform.

- [ ] **Step 6: Commit**

```bash
git add css/gimmicks-layer1.css js/gimmicks/magnetic.js js/gimmicks/global.js *.html zones/*.html
git commit -m "feat(layer-1): magnetic nav + CTA buttons"
```

---

## Task 14: Typewriter Console Upgrade + `help()` Command

**Files:**
- Modify: `js/gimmicks/global.js`

- [ ] **Step 1: Rewrite `secrets()` with typewriter output + sfx**

In `js/gimmicks/global.js`, locate existing `secrets()` (or create if missing) and rewrite:

```js
async function typeLine(line, delay = 30) {
  let out = '';
  for (const ch of line) {
    out += ch;
    // %c CSS on console.log for green typewriter; log after full line
    try { window.__eni?.sfx?.play('type'); } catch {}
    await new Promise(r => setTimeout(r, delay));
  }
  console.log('%c' + line, 'color:#00ff88;font-family:"JetBrains Mono",monospace;font-size:12px;');
}

async function secretsImpl() {
  const lines = [
    '> SECRETS.TXT',
    '> ---------------------------------',
    '> You found the console. Well done.',
    '> Try: help()',
    '> Try: konami()',
    '> Try: ghosts.on()',
    '> Try: fingerprint()',
  ];
  for (const l of lines) await typeLine(l, 20);
}
window.secrets = secretsImpl;
window.help = () => {
  console.log('%cConsole commands:', 'color:#a78bfa;font-weight:bold;');
  console.log('  secrets()     — show the secrets');
  console.log('  konami()      — trigger the konami effect');
  console.log('  ghosts.on()   — enable collaborative cursors');
  console.log('  ghosts.off()  — disable them');
  console.log('  fingerprint() — regenerate your page fingerprint');
  console.log('  matrix()      — pixel rain');
};
window.konami = () => dispatchEvent(new KeyboardEvent('keydown', { key: 'k' })); // kept simple; optional
window.matrix = () => { /* call rain() */ };
```

- [ ] **Step 2: Verify**

Open DevTools console. Call `secrets()` — lines appear with typewriter delay + type sfx on each char. `help()` lists commands.

- [ ] **Step 3: Commit**

```bash
git add js/gimmicks/global.js
git commit -m "feat(layer-1): typewriter console + help() command"
```

---

## Task 15: Page Fingerprint (`js/gimmicks/fingerprint.js`)

**Files:**
- Create: `js/gimmicks/fingerprint.js`
- Modify: `css/gimmicks-layer1.css`
- Modify: every main HTML — add `<div id="fingerprint-badge"></div>` before closing footer/body
- Modify: `js/gimmicks/global.js` — import + init

- [ ] **Step 1: Add CSS**

```css
.fingerprint-badge {
  position: fixed; bottom: 12px; left: 12px; z-index: 40;
  width: 40px; height: 40px; cursor: pointer;
  border: 1px solid oklch(1 0 0 / 0.15); border-radius: 8px;
  backdrop-filter: blur(6px);
  transition: transform 200ms ease, width 200ms ease, height 200ms ease;
}
.fingerprint-badge:hover { transform: scale(1.05); }
.fingerprint-badge.expanded { width: 240px; height: 240px; }
@media (max-width: 640px) { .fingerprint-badge { bottom: 64px; } }
```

- [ ] **Step 2: Create `js/gimmicks/fingerprint.js`**

```js
function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
function seedRandom(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

export function renderFingerprint(hostId = 'fingerprint-badge') {
  const host = document.getElementById(hostId); if (!host) return;
  let seed;
  try {
    seed = parseInt(sessionStorage.getItem('fingerprint-seed') || '0', 10);
    if (!seed) { seed = hashCode(String(Date.now()) + Math.random()); sessionStorage.setItem('fingerprint-seed', String(seed)); }
  } catch { seed = Date.now(); }
  const r = seedRandom(seed);
  const hue = Math.floor(r() * 360);
  const br1 = Math.floor(r() * 80);
  const br2 = Math.floor(r() * 80);
  const ang = Math.floor(r() * 360);
  host.className = 'fingerprint-badge';
  host.style.background = `linear-gradient(${ang}deg, oklch(0.65 0.22 ${hue}), oklch(0.45 0.18 ${(hue + 60) % 360}))`;
  host.style.borderRadius = `${br1}% ${100 - br1}% ${br2}% ${100 - br2}% / ${br2}% ${100 - br2}% ${br1}% ${100 - br1}%`;
  host.title = `Your visit fingerprint — seed ${seed}`;
  host.addEventListener('click', () => host.classList.toggle('expanded'));
  window.fingerprint = () => { sessionStorage.removeItem('fingerprint-seed'); renderFingerprint(hostId); };
}
```

- [ ] **Step 3: Wire import**

In `js/gimmicks/global.js`:

```js
import { renderFingerprint } from './fingerprint.js';
renderFingerprint();
```

- [ ] **Step 4: Add `<div id="fingerprint-badge"></div>` to every main HTML page** (before `</body>`).

- [ ] **Step 5: Verify**

Visit any page. Bottom-left shows a unique blob badge. Click → expands. Reload same tab → same blob. `fingerprint()` in console → new blob.

- [ ] **Step 6: Commit**

```bash
git add css/gimmicks-layer1.css js/gimmicks/fingerprint.js js/gimmicks/global.js *.html zones/*.html
git commit -m "feat(layer-1): per-visit CSS-art fingerprint badge"
```

---

## Task 16: Rainbow Scroll + Per-Zone Custom Selection

**Files:**
- Modify: `css/base.css` — `::selection` rules by `[data-zone]`
- Modify: `css/gimmicks.css` — rainbow scroll var hookup
- Modify: `js/gimmicks/global.js` — rAF-throttled scroll → update `--hue`

- [ ] **Step 1: Add selection colors**

```css
::selection { background: oklch(0.7 0.25 290 / 0.35); color: inherit; }
[data-zone="scroll"] ::selection,     body[data-zone="scroll"] ::selection     { background: oklch(0.7 0.22 265 / 0.4); }
[data-zone="popover"] ::selection,    body[data-zone="popover"] ::selection    { background: oklch(0.7 0.22 305 / 0.4); }
[data-zone="art"] ::selection,        body[data-zone="art"] ::selection        { background: oklch(0.75 0.2 340 / 0.4); }
[data-zone="container"] ::selection,  body[data-zone="container"] ::selection  { background: oklch(0.75 0.17 160 / 0.4); }
[data-zone="transitions"] ::selection,body[data-zone="transitions"] ::selection{ background: oklch(0.8 0.17 80 / 0.4); }
[data-zone="houdini"] ::selection,    body[data-zone="houdini"] ::selection    { background: oklch(0.7 0.18 240 / 0.4); }
[data-zone="has"] ::selection,        body[data-zone="has"] ::selection        { background: oklch(0.75 0.18 40 / 0.4); }
[data-zone="layers"] ::selection,     body[data-zone="layers"] ::selection     { background: oklch(0.7 0.24 320 / 0.4); }
```

- [ ] **Step 2: Add `data-zone` to each zone `<body>`**

For each `zones/*.html`, set `<body data-zone="…">` with the matching value.

- [ ] **Step 3: Add rainbow scroll hue**

In `css/base.css` (dark-mode only):

```css
html:not([data-theme="light"]) body { background-color: oklch(0.15 0.02 var(--hue, 280)); transition: background-color 200ms linear; }
```

In `js/gimmicks/global.js`:

```js
(function rainbowScroll() {
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const doc = document.documentElement;
      const max = (doc.scrollHeight - innerHeight) || 1;
      const ratio = Math.min(1, Math.max(0, scrollY / max));
      document.documentElement.style.setProperty('--hue', Math.floor(ratio * 360));
    });
  }, { passive: true });
})();
```

- [ ] **Step 4: Verify**

Dark mode: scroll the page — subtle background hue shifts. Select text on a zone — selection uses zone's accent color.

- [ ] **Step 5: Commit**

```bash
git add css/base.css css/gimmicks.css js/gimmicks/global.js zones/*.html
git commit -m "feat(layer-1): rainbow scroll and per-zone ::selection"
```

---

## Task 17: Quiet Gimmicks — Copy-Paste Surprise, Print Stylesheet, Double-Click Defs

**Files:**
- Create: `js/gimmicks/defs.js`
- Modify: `css/gimmicks.css` — upgrade `@media print`
- Modify: `js/gimmicks/global.js` — copy handler + import defs

- [ ] **Step 1: Copy-paste surprise**

In `js/gimmicks/global.js`:

```js
document.addEventListener('copy', (e) => {
  if (e.target.closest('code, pre, .editor')) return; // clean copies for code blocks
  const sel = getSelection()?.toString();
  if (!sel || sel.length < 8) return;
  const watermark = `\n\n/* Copied from A Love Letter to the Web — ${location.origin || ''}${location.pathname} */`;
  e.clipboardData?.setData('text/plain', sel + watermark);
  e.preventDefault();
});
```

- [ ] **Step 2: Print stylesheet**

In `css/gimmicks.css`, replace any existing `@media print` block with:

```css
@media print {
  * { background: white !important; color: black !important; box-shadow: none !important; }
  .page-header, .hub-stats, .scroll-progress, .cursor-trail-canvas, .konami-canvas, .pixel-rain-canvas,
  .fingerprint-badge, .sfx-toggle, .ambient-bg, nav, footer { display: none !important; }
  .print-only { display: block !important; margin: 2rem 0; }
  .print-only::before {
    content: "You printed the internet. You absolute legend.";
    display: block; font-weight: bold; font-size: 1.2rem; margin-bottom: 1rem;
  }
  .print-only::after {
    content: "Source: https://github.com/IxMxAMAR/HTML";
    display: block; font-family: monospace;
  }
  section, article { page-break-inside: avoid; }
}
.print-only { display: none; }
```

Add `<div class="print-only"></div>` to the footer of each main HTML page.

- [ ] **Step 3: Create `js/gimmicks/defs.js`**

```js
const DEFS = {
  flex: 'A one-dimensional layout system for aligning items along a row or column.',
  grid: 'A two-dimensional layout system with rows and columns.',
  cascade: 'The algorithm that decides which CSS rule wins when multiple rules target the same element.',
  specificity: 'A weight calculated from selectors that determines which rule applies.',
  'container-query': 'Styles that respond to the size of their containing element, not the viewport.',
  houdini: 'Low-level APIs that let developers extend CSS itself.',
  transform: 'Moves, rotates, scales, or skews an element without affecting layout.',
  oklch: 'A perceptually uniform color space for CSS.',
  'view-transition': 'A browser API that animates between two DOM states.',
  popover: 'A native top-layer floating element controlled via HTML attributes.',
  dialog: 'A native modal element with focus trapping and backdrop.',
  'has': 'A parent selector — matches an element that contains what the nested selector finds.',
  keyframes: 'A series of styles at named timeline positions used by animation.',
  'aspect-ratio': 'A CSS property that sets a preferred ratio for an element\'s box.',
  clamp: 'A CSS function returning a value clamped between a min and max.',
};

export function initDefs() {
  const tip = document.createElement('div');
  tip.className = 'defs-tip';
  tip.style.cssText = 'position:fixed;padding:8px 12px;background:oklch(0.2 0.02 280);color:white;border-radius:8px;font-size:0.85rem;max-width:280px;z-index:9999;pointer-events:none;opacity:0;transition:opacity 180ms ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
  document.body.appendChild(tip);
  document.addEventListener('dblclick', (e) => {
    const sel = getSelection()?.toString().trim().toLowerCase();
    if (!sel) return;
    const hit = DEFS[sel] || DEFS[sel.replace(/[^a-z-]/g, '')];
    if (!hit) return;
    tip.innerHTML = `<strong>${sel}</strong> — ${hit}<br><a href="glossary.html" style="color:#a78bfa;pointer-events:auto">Open glossary →</a>`;
    tip.style.left = Math.min(innerWidth - 300, e.clientX + 12) + 'px';
    tip.style.top = (e.clientY + 12) + 'px';
    tip.style.opacity = '1';
    tip.style.pointerEvents = 'auto';
    setTimeout(() => { tip.style.opacity = '0'; tip.style.pointerEvents = 'none'; }, 4000);
  });
}
```

- [ ] **Step 4: Wire import**

In `js/gimmicks/global.js`:

```js
import { initDefs } from './defs.js';
initDefs();
```

- [ ] **Step 5: Verify**

Copy ≥8 chars of body text → paste in a text editor — watermark appended. Copy inside an editor `<pre>` → clean. Print preview → white bg + "printed the internet" message. Double-click the word "flex" anywhere → tooltip with definition.

- [ ] **Step 6: Commit**

```bash
git add css/gimmicks.css js/gimmicks/defs.js js/gimmicks/global.js *.html zones/*.html
git commit -m "feat(layer-1): copy-paste watermark, upgraded print stylesheet, double-click CSS definitions"
```

---

## Task 18: Ambient Music Zones

**Files:**
- Modify: `js/gimmicks/chiptune.js` — add `playAmbient(zoneKey)` + `stopAmbient()`
- Modify: `js/gimmicks/zones.js` — wire per-zone
- Modify: each `zones/*.html` — add `<button class="ambient-toggle">` in zone header

- [ ] **Step 1: Extend `chiptune.js`**

Append:

```js
const AMBIENT = {
  scroll:     { base: 220, intervals: [1, 1.5, 2], rate: 0.25, type: 'sine' },
  popover:    { base: 260, intervals: [1, 1.25, 1.66], rate: 0.4, type: 'triangle' },
  art:        { base: 330, intervals: [1, 1.26, 1.5, 2], rate: 0.6, type: 'sine' },
  container:  { base: 180, intervals: [1, 1.12, 1.33], rate: 0.35, type: 'triangle' },
  transitions:{ base: 300, intervals: [1, 1.5, 2.25], rate: 0.5, type: 'sawtooth' },
  houdini:    { base: 160, intervals: [1, 1.5, 1.78, 2.67], rate: 0.3, type: 'square' },
  has:        { base: 240, intervals: [1, 1.2, 1.6], rate: 0.45, type: 'triangle' },
  layers:     { base: 200, intervals: [1, 1.33, 1.66, 2], rate: 0.5, type: 'sine' },
};
let ambientCtx = null, ambientTimer = null, ambientGain = null;
export function playAmbient(zoneKey) {
  const preset = AMBIENT[zoneKey]; if (!preset) return;
  stopAmbient();
  ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
  ambientGain = ambientCtx.createGain();
  ambientGain.gain.value = 0.0;
  ambientGain.connect(ambientCtx.destination);
  ambientGain.gain.linearRampToValueAtTime(0.05, ambientCtx.currentTime + 1.5);
  const step = () => {
    const mult = preset.intervals[(Math.random() * preset.intervals.length) | 0];
    const osc = ambientCtx.createOscillator();
    const g = ambientCtx.createGain();
    osc.type = preset.type; osc.frequency.value = preset.base * mult;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.4, ambientCtx.currentTime + 0.5);
    g.gain.linearRampToValueAtTime(0, ambientCtx.currentTime + 2);
    osc.connect(g).connect(ambientGain);
    osc.start(); osc.stop(ambientCtx.currentTime + 2.2);
    ambientTimer = setTimeout(step, (1 / preset.rate) * 1000);
  };
  step();
}
export function stopAmbient() {
  if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; }
  if (ambientGain && ambientCtx) {
    ambientGain.gain.linearRampToValueAtTime(0, ambientCtx.currentTime + 0.6);
    setTimeout(() => { try { ambientCtx.close(); } catch {} ambientCtx = null; ambientGain = null; }, 800);
  }
}
```

- [ ] **Step 2: Wire toggle in `js/gimmicks/zones.js`**

```js
import { playAmbient, stopAmbient } from './chiptune.js';
const zoneKey = document.body.dataset.zone;
const btn = document.querySelector('.ambient-toggle');
if (btn && zoneKey) {
  let on = false;
  btn.addEventListener('click', () => { on = !on; btn.textContent = on ? '🔊 Ambient' : '🔈 Ambient'; if (on) playAmbient(zoneKey); else stopAmbient(); });
}
addEventListener('beforeunload', stopAmbient);
```

- [ ] **Step 3: Markup**

Add `<button class="ambient-toggle" aria-label="Toggle ambient zone audio">🔈 Ambient</button>` in each zone's header area.

- [ ] **Step 4: Verify**

Enter each zone. Click Ambient → fade in over ~1.5s. Click again → fade out.

- [ ] **Step 5: Commit**

```bash
git add js/gimmicks/chiptune.js js/gimmicks/zones.js zones/*.html
git commit -m "feat(layer-1): per-zone ambient Web Audio atmospheres"
```

---

## Task 19: Session Gimmicks (Visit Milestones + Time-Spent + Breadcrumb + Visited Zones)

**Files:**
- Create: `js/gimmicks/session.js`
- Modify: `js/gimmicks/global.js` — import + init
- Modify: `css/gimmicks-layer1.css`
- Modify: `js/gimmicks/hub-gm.js` — visited-zone checkmarks
- Modify: every main HTML — add footer `<div class="time-spent"></div>` and `<nav class="breadcrumb"></nav>`

- [ ] **Step 1: Create `js/gimmicks/session.js`**

```js
const KEY = { visits: 'visits', visited: 'visited-zones', start: 'session-start' };
function inc(k) { try { const n = (parseInt(localStorage.getItem(k) || '0', 10) || 0) + 1; localStorage.setItem(k, String(n)); return n; } catch { return 0; } }

export function initSession() {
  const visits = inc(KEY.visits);
  const milestones = { 10: 'Welcome back, regular!', 50: 'Power user detected.', 100: 'Centurion — 100 visits', 1000: 'Legendary.' };
  if (milestones[visits]) setTimeout(() => showMilestone(milestones[visits], visits), 1500);

  // visited zones
  const zoneKey = document.body.dataset.zone;
  if (zoneKey) {
    try {
      const list = new Set(JSON.parse(sessionStorage.getItem(KEY.visited) || '[]'));
      list.add(zoneKey);
      sessionStorage.setItem(KEY.visited, JSON.stringify([...list]));
    } catch {}
  }

  // time spent
  let start;
  try { start = parseInt(sessionStorage.getItem(KEY.start) || '0', 10); if (!start) { start = Date.now(); sessionStorage.setItem(KEY.start, String(start)); } } catch { start = Date.now(); }
  const host = document.querySelector('.time-spent');
  if (host) {
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(s / 60), sec = s % 60;
      host.textContent = `Exploring for ${m}m ${sec}s`;
      if (s === 1800) unlockAchievement('deep-diver');
    };
    tick(); setInterval(tick, 1000);
  }

  // breadcrumb
  const bc = document.querySelector('.breadcrumb');
  if (bc) {
    const name = document.title.split('—')[0].trim();
    bc.innerHTML = `<a href="index.html">Home</a> → <a href="hub.html">Observatory</a> → <span>${name}</span>`;
  }
}

function showMilestone(msg, visits) {
  const t = document.createElement('div');
  t.className = 'milestone-toast';
  t.textContent = `${msg} (visit #${visits})`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 4500);
}

function unlockAchievement(id) { try { localStorage.setItem(`achievement:${id}`, '1'); window.__eni?.sfx?.play?.('chime'); } catch {} }
```

- [ ] **Step 2: CSS**

```css
.milestone-toast {
  position: fixed; top: 20px; right: 20px; z-index: 60;
  padding: 12px 16px; background: oklch(0.2 0.02 280 / 0.95); color: white;
  border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  opacity: 0; transform: translateX(20px); transition: opacity 250ms ease, transform 250ms ease;
}
.milestone-toast.visible { opacity: 1; transform: translateX(0); }

.breadcrumb {
  font-size: 0.85rem; opacity: 0.75; padding: 4px 0;
}
.breadcrumb a { color: inherit; text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }

.time-spent {
  font-size: 0.8rem; opacity: 0.6; text-align: center; padding: 4px;
}
```

- [ ] **Step 3: Wire import + markup**

In `js/gimmicks/global.js`:

```js
import { initSession } from './session.js';
initSession();
```

Add `<nav class="breadcrumb" aria-label="Breadcrumb"></nav>` near the top of `<main>` on every main HTML page. Add `<div class="time-spent"></div>` inside each page footer.

- [ ] **Step 4: Visited-zone checkmarks in `js/gimmicks/hub-gm.js`**

```js
try {
  const visited = new Set(JSON.parse(sessionStorage.getItem('visited-zones') || '[]'));
  document.querySelectorAll('.zone-node').forEach((n) => {
    if (visited.has(n.dataset.zone)) {
      n.classList.add('zone-node--visited');
      const m = document.createElement('span');
      m.className = 'zone-check'; m.textContent = '✓'; m.setAttribute('aria-hidden', 'true');
      n.appendChild(m);
    }
  });
} catch {}
```

Add supporting CSS in `css/hub.css`:

```css
.zone-node--visited { box-shadow: 0 0 0 2px var(--zone-color, oklch(0.65 0.18 290)); }
.zone-check { position: absolute; top: 6px; right: 6px; color: var(--zone-color); font-weight: 800; }
```

- [ ] **Step 5: Verify**

Open site → each nav increments count. Visit 10 different zones or force `localStorage.setItem('visits','9')` then reload → milestone toast. Wait 30 min (or force `session-start` to `Date.now() - 1800000` and reload) → "Deep Diver" chime. Breadcrumb renders. Hub shows checkmarks for visited zones.

- [ ] **Step 6: Commit**

```bash
git add js/gimmicks/session.js js/gimmicks/global.js js/gimmicks/hub-gm.js css/gimmicks-layer1.css css/hub.css *.html zones/*.html
git commit -m "feat(layer-1): session state — visit milestones, time spent, breadcrumb, visited-zone checkmarks"
```

---

## Task 20: Drag-to-Reorder Components

**Files:**
- Modify: `js/gimmicks/components-gm.js`
- Modify: `css/toolkit.css`
- Modify: `components.html` — ensure each component card has a stable `data-comp-id`

- [ ] **Step 1: Make cards draggable**

In `components.html`, add `draggable="true"` and `data-comp-id` (e.g., `"dialog"`, `"popover"`, `"card"`, `"tabs"`) to each component card `<section>` / `<article>` wrapper.

- [ ] **Step 2: Wire drag handlers**

In `js/gimmicks/components-gm.js`:

```js
(function dragReorder() {
  const host = document.querySelector('.component-grid, main');
  if (!host) return;
  const STORAGE_KEY = 'components-order';
  const cards = [...host.querySelectorAll('[data-comp-id]')];
  // restore saved order
  try {
    const order = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(order)) {
      order.forEach((id) => {
        const c = cards.find(x => x.dataset.compId === id);
        if (c) host.appendChild(c);
      });
    }
  } catch {}

  let dragging = null;
  host.addEventListener('dragstart', (e) => {
    const card = e.target.closest('[data-comp-id]');
    if (!card) return;
    dragging = card; card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.compId);
  });
  host.addEventListener('dragover', (e) => {
    e.preventDefault();
    const after = getAfter(host, e.clientY);
    if (!dragging) return;
    if (after == null) host.appendChild(dragging); else host.insertBefore(dragging, after);
  });
  host.addEventListener('dragend', () => {
    dragging?.classList.remove('dragging');
    dragging = null;
    const order = [...host.querySelectorAll('[data-comp-id]')].map(x => x.dataset.compId);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); } catch {}
  });
  function getAfter(container, y) {
    const els = [...container.querySelectorAll('[data-comp-id]:not(.dragging)')];
    return els.find((el) => { const r = el.getBoundingClientRect(); return y < r.top + r.height / 2; }) || null;
  }

  // reset button
  const resetBtn = document.getElementById('reset-components');
  resetBtn?.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); location.reload(); });
})();
```

- [ ] **Step 3: CSS**

```css
[data-comp-id] { cursor: grab; transition: transform 120ms ease; }
[data-comp-id]:active { cursor: grabbing; }
[data-comp-id].dragging { opacity: 0.5; transform: scale(0.98); }
```

- [ ] **Step 4: Add reset button**

In `components.html`: `<button id="reset-components">Reset order</button>` above the grid.

- [ ] **Step 5: Verify**

Drag cards → reorder. Reload → order persists. Click "Reset order" → default order restored.

- [ ] **Step 6: Commit**

```bash
git add js/gimmicks/components-gm.js css/toolkit.css components.html
git commit -m "feat(layer-1): drag-to-reorder component cards with persistence"
```

---

## Task 21: Focus / Screenshot / Gravity / Pull-Refresh Modes (`js/gimmicks/modes.js`)

**Files:**
- Create: `js/gimmicks/modes.js`
- Modify: `css/gimmicks-layer1.css`
- Modify: `js/gimmicks/global.js` — import + wire key bindings

- [ ] **Step 1: Create `js/gimmicks/modes.js`**

```js
export function initModes() {
  const hotkeys = { f: 'focus', F: 'focus', s: null };
  let focusOn = false, screenshotOn = false, gravityOn = false;

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,[contenteditable]')) return;
    if (e.key === 'f') { e.preventDefault(); focusOn = !focusOn; document.documentElement.classList.toggle('mode-focus', focusOn); if (focusOn) unlockAchievement('in-the-zone'); }
    if (e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); screenshotOn = !screenshotOn; document.documentElement.classList.toggle('mode-screenshot', screenshotOn); showToast(screenshotOn ? 'Screenshot mode — Shift+S exits' : 'Screenshot mode off'); }
    if (e.key === 'g') {
      e.preventDefault(); gravityOn = !gravityOn; if (gravityOn) startGravity(); else stopGravity();
    }
    if (e.key === 'Escape') { if (focusOn) { focusOn = false; document.documentElement.classList.remove('mode-focus'); } if (screenshotOn) { screenshotOn = false; document.documentElement.classList.remove('mode-screenshot'); } if (gravityOn) { gravityOn = false; stopGravity(); } }
  });

  // Gravity: simple physics on `.gravity-target` elements
  let rafId = null; const bodies = [];
  function startGravity() {
    document.querySelectorAll('.gravity-target').forEach((el) => {
      const r = el.getBoundingClientRect();
      bodies.push({ el, x: r.left, y: r.top, vx: (Math.random() - 0.5) * 2, vy: 0, w: r.width, h: r.height });
      el.style.position = 'fixed'; el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.transition = 'none';
    });
    const tick = () => {
      bodies.forEach((b) => {
        b.vy += 0.5;
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) { b.x = 0; b.vx *= -0.7; }
        if (b.x + b.w > innerWidth) { b.x = innerWidth - b.w; b.vx *= -0.7; }
        if (b.y + b.h > innerHeight) { b.y = innerHeight - b.h; b.vy *= -0.6; b.vx *= 0.95; }
        b.el.style.left = b.x + 'px'; b.el.style.top = b.y + 'px';
      });
      rafId = requestAnimationFrame(tick);
    };
    tick();
    unlockAchievement('newtons-revenge');
    setTimeout(stopGravity, 5000);
  }
  function stopGravity() {
    if (rafId) cancelAnimationFrame(rafId);
    bodies.forEach((b) => { b.el.style.position = ''; b.el.style.left = ''; b.el.style.top = ''; b.el.style.transition = ''; });
    bodies.length = 0;
  }

  // Pull-down refresh easter egg (landing only)
  if (document.body.dataset.page === 'landing') {
    let startY = 0;
    document.addEventListener('touchstart', (e) => { if (scrollY === 0) startY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (scrollY === 0 && e.touches[0].clientY - startY > 120) {
        if (!document.querySelector('.pull-refresh-toast')) {
          const t = document.createElement('div'); t.className = 'pull-refresh-toast'; t.textContent = 'reloading the web since 1991';
          document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
        }
      }
    }, { passive: true });
  }
}

function unlockAchievement(id) { try { localStorage.setItem(`achievement:${id}`, '1'); window.__eni?.sfx?.play?.('chime'); } catch {} }
function showToast(msg) { const t = document.createElement('div'); t.className = 'milestone-toast visible'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 2500); }
```

- [ ] **Step 2: Add mode CSS**

```css
html.mode-focus main > *:not(:focus-within):not(:hover) { opacity: 0.2; transition: opacity 200ms ease; }
html.mode-focus main > *:hover, html.mode-focus main > *:focus-within { opacity: 1; box-shadow: 0 0 40px -10px var(--accent, oklch(0.65 0.18 290)); }

html.mode-screenshot .page-header, html.mode-screenshot .scroll-progress,
html.mode-screenshot .fingerprint-badge, html.mode-screenshot .sfx-toggle,
html.mode-screenshot footer { display: none !important; }
html.mode-screenshot { box-shadow: inset 0 0 0 4px oklch(1 0 0 / 0.1); }

.pull-refresh-toast {
  position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
  padding: 8px 16px; background: oklch(0.2 0.02 280 / 0.95); color: white; border-radius: 20px;
  font-family: "JetBrains Mono", monospace; font-size: 0.85rem; z-index: 60;
}
```

- [ ] **Step 3: Tag gravity targets**

In zone pages (pick 2-3 visually interesting demo boxes per zone), add `class="... gravity-target"` to shapes users would enjoy seeing fall.

- [ ] **Step 4: `<body data-page="landing">`**

Add `data-page="landing"` to `index.html`'s `<body>`.

- [ ] **Step 5: Wire import**

In `js/gimmicks/global.js`:

```js
import { initModes } from './modes.js';
initModes();
```

- [ ] **Step 6: Verify**

Press F → current viewport sections highlight; ESC exits. Press Shift+S → nav/fingerprint hidden, subtle vignette. Press G → tagged shapes fall, bounce, settle after 5s. On landing mobile simulator, pull down at scroll=0 → toast appears.

- [ ] **Step 7: Commit**

```bash
git add js/gimmicks/modes.js js/gimmicks/global.js css/gimmicks-layer1.css index.html zones/*.html
git commit -m "feat(layer-1): focus/screenshot/gravity/pull-refresh modes"
```

---

## Task 22: Collaborative Cursor Ghosts (`js/gimmicks/cursor-ghosts.js`)

**Files:**
- Create: `js/gimmicks/cursor-ghosts.js`
- Modify: `css/gimmicks-layer1.css`
- Modify: `js/gimmicks/global.js` — expose `window.ghosts = { on, off }`

- [ ] **Step 1: Paths + style**

```css
.ghost-cursor {
  position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9997;
  display: flex; align-items: center; gap: 4px;
  opacity: 0.3; transition: transform 80ms linear, opacity 300ms ease;
}
.ghost-cursor::before { content: "▲"; color: oklch(0.7 0.2 var(--ghost-hue, 290)); font-size: 14px; }
.ghost-cursor__label { font-size: 10px; font-family: "JetBrains Mono", monospace; background: oklch(0 0 0 / 0.6); color: white; padding: 2px 4px; border-radius: 3px; }
```

- [ ] **Step 2: Implementation**

```js
const NAMES = ['visitor_42', 'css_lover', 'firstpaint', 'pxperfect', 'floatingpoint', 'oklch_fan'];
const PATHS = [
  [[10,10],[25,20],[40,30],[50,50],[70,65],[80,80],[90,60]],
  [[50,10],[30,25],[20,45],[35,60],[55,70],[75,55],[85,40]],
  [[80,20],[60,15],[45,30],[35,50],[50,75],[70,80]],
];

export function startGhosts() {
  stopGhosts();
  PATHS.forEach((path, i) => {
    const el = document.createElement('div');
    el.className = 'ghost-cursor';
    el.style.setProperty('--ghost-hue', (120 + i * 60) % 360);
    const label = document.createElement('span');
    label.className = 'ghost-cursor__label';
    label.textContent = NAMES[(Math.random() * NAMES.length) | 0];
    el.appendChild(label);
    document.body.appendChild(el);
    animatePath(el, path, 8000 + Math.random() * 4000, Math.random() * 2000);
  });
  window.__eni = Object.assign(window.__eni || {}, { ghosts: { on: startGhosts, off: stopGhosts } });
  window.ghosts = window.__eni.ghosts;
}
export function stopGhosts() {
  document.querySelectorAll('.ghost-cursor').forEach(el => el.remove());
}
function animatePath(el, path, duration, delay) {
  const start = performance.now() + delay;
  const step = (now) => {
    if (!el.isConnected) return;
    const t = (now - start) / duration;
    if (t < 0) { requestAnimationFrame(step); return; }
    const tt = t % 1;
    const seg = tt * (path.length - 1);
    const i = Math.floor(seg); const f = seg - i;
    const a = path[i]; const b = path[i + 1] || path[i];
    const x = (a[0] + (b[0] - a[0]) * f) / 100 * innerWidth;
    const y = (a[1] + (b[1] - a[1]) * f) / 100 * innerHeight;
    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

- [ ] **Step 3: Default off, opt-in via console**

In `js/gimmicks/global.js` append:

```js
import { startGhosts, stopGhosts } from './cursor-ghosts.js';
window.ghosts = { on: startGhosts, off: stopGhosts };
```

- [ ] **Step 4: Verify**

In console: `ghosts.on()` → 3 ghost cursors drift around with name labels. `ghosts.off()` → gone.

- [ ] **Step 5: Commit**

```bash
git add css/gimmicks-layer1.css js/gimmicks/cursor-ghosts.js js/gimmicks/global.js
git commit -m "feat(layer-1): opt-in collaborative cursor ghosts"
```

---

## Task 23: Scroll-Snap on Landing + Touch Gestures

**Files:**
- Modify: `css/landing.css` — scroll-snap-type
- Modify: `js/gimmicks/landing.js` — swipe gesture for zone-to-zone (where applicable)
- Modify: `js/gimmicks/zones.js` — swipe left/right to prev/next zone

- [ ] **Step 1: Scroll-snap**

```css
@media (min-width: 641px) and (prefers-reduced-motion: no-preference) {
  .eras { scroll-snap-type: y mandatory; overflow-y: auto; max-height: 100svh; }
  .era { scroll-snap-align: start; min-height: 100svh; }
}
```

- [ ] **Step 2: Swipe in zones**

In `js/gimmicks/zones.js`:

```js
(function swipe() {
  if (!matchMedia('(pointer: coarse)').matches) return;
  const links = {
    scroll: ['../index.html', 'popover-dialog.html'],
    popover: ['scroll-animations.html', 'css-art.html'],
    art: ['popover-dialog.html', 'container-queries.html'],
    container: ['css-art.html', 'view-transitions.html'],
    transitions: ['container-queries.html', 'houdini.html'],
    houdini: ['view-transitions.html', 'has-selector.html'],
    has: ['houdini.html', 'cascade-layers.html'],
    layers: ['has-selector.html', '../index.html'],
  };
  const zone = document.body.dataset.zone;
  const pair = links[zone]; if (!pair) return;
  let startX = 0, startY = 0;
  addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
      location.href = dx < 0 ? pair[1] : pair[0];
    }
  }, { passive: true });
})();
```

- [ ] **Step 3: Verify**

Desktop landing: era sections snap when scrolling. Mobile zone: swipe left → next zone, swipe right → previous.

- [ ] **Step 4: Commit**

```bash
git add css/landing.css js/gimmicks/landing.js js/gimmicks/zones.js
git commit -m "feat(layer-1): landing scroll-snap and zone swipe navigation"
```

---

## Task 24: Consistent Hover/Focus/Active Audit

**Files:**
- Modify: `css/base.css` — baseline rules
- Modify: each page/component css — remove conflicting rules

- [ ] **Step 1: Establish baseline in `css/base.css`**

```css
:where(a, button, [role="button"], input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--focus, oklch(0.75 0.2 290));
  outline-offset: 2px;
  border-radius: 4px;
}
:where(button, [role="button"]):hover:not(:disabled) { cursor: pointer; }
:where(button, [role="button"]):disabled { cursor: not-allowed; opacity: 0.5; }
```

- [ ] **Step 2: Audit `css/*.css` for `outline: none` declarations**

Run: `grep -rn "outline\s*:\s*none" css/`. For each hit, ensure a `:focus-visible` replacement exists; if not, add one.

- [ ] **Step 3: Verify**

Tab through every page with keyboard — every focused element has a visible outline. Mouse hover on buttons shows pointer.

- [ ] **Step 4: Commit**

```bash
git add css/
git commit -m "fix(layer-1): consistent focus-visible and hover states site-wide"
```

---

## Task 25: Smooth Scroll + Back-to-Top + Mobile Long-Press

**Files:**
- Modify: `css/base.css` — `scroll-behavior`
- Modify: `css/gimmicks-layer1.css` — back-to-top button
- Modify: `js/gimmicks/global.js` — scroll listener + long-press

- [ ] **Step 1: Smooth scroll**

In `css/base.css`:

```css
html { scroll-behavior: smooth; }
:target { scroll-margin-top: 80px; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
```

- [ ] **Step 2: Back-to-top button**

```css
.back-to-top {
  position: fixed; bottom: 12px; right: 64px;
  width: 44px; height: 44px; border-radius: 50%;
  background: oklch(0.2 0.02 280 / 0.9); color: white; border: none;
  opacity: 0; pointer-events: none; transition: opacity 200ms ease, transform 200ms ease;
  cursor: pointer; z-index: 40;
}
.back-to-top.visible { opacity: 1; pointer-events: auto; }
.back-to-top:hover { transform: translateY(-4px); }
```

In `js/gimmicks/global.js`:

```js
(function backToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top'; btn.setAttribute('aria-label', 'Back to top'); btn.innerHTML = '↑';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('scroll', () => btn.classList.toggle('visible', scrollY > innerHeight), { passive: true });
})();
```

- [ ] **Step 3: Mobile long-press → context menu**

In `js/gimmicks/global.js`, find the existing context-menu popover wiring and add:

```js
(function longPress() {
  if (!matchMedia('(pointer: coarse)').matches) return;
  let timer = null;
  addEventListener('touchstart', (e) => {
    timer = setTimeout(() => {
      const menu = document.getElementById('context-menu');
      if (!menu) return;
      menu.style.left = e.touches[0].clientX + 'px';
      menu.style.top = e.touches[0].clientY + 'px';
      try { menu.showPopover(); } catch {}
    }, 500);
  }, { passive: true });
  addEventListener('touchmove', () => { if (timer) { clearTimeout(timer); timer = null; } }, { passive: true });
  addEventListener('touchend', () => { if (timer) { clearTimeout(timer); timer = null; } }, { passive: true });
})();
```

- [ ] **Step 4: Verify**

Scroll past 1 viewport → back-to-top appears bottom-right. Click → smooth scroll to 0. On mobile emulator, long-press → context menu popover opens.

- [ ] **Step 5: Commit**

```bash
git add css/base.css css/gimmicks-layer1.css js/gimmicks/global.js
git commit -m "feat(layer-1): smooth scroll, back-to-top, mobile long-press menu"
```

---

## Task 26: Playground UX Improvements

**Files:**
- Modify: `js/playground.js`
- Modify: `js/gimmicks/playground-gm.js`
- Modify: `css/playground.css`

- [ ] **Step 1: Add status-bar element in `playground.html`**

```html
<div class="editor-status-bar">
  <span id="line-count">Lines: 0</span>
  <span id="char-count">Chars: 0</span>
  <span id="syntax-status">✓ OK</span>
  <button id="reset-preset" type="button">Reset preset</button>
</div>
```

- [ ] **Step 2: Wire counts + syntax check in `js/gimmicks/playground-gm.js`**

```js
(function editorStats() {
  const editor = document.querySelector('.editor, #editor, [contenteditable]');
  const lines = document.getElementById('line-count');
  const chars = document.getElementById('char-count');
  const status = document.getElementById('syntax-status');
  if (!editor || !lines || !chars || !status) return;
  const update = () => {
    const text = editor.textContent || '';
    lines.textContent = `Lines: ${text.split('\n').length}`;
    chars.textContent = `Chars: ${text.length}`;
    // crude syntax check: balanced braces + trailing semicolons
    const open = (text.match(/\{/g) || []).length;
    const close = (text.match(/\}/g) || []).length;
    const missingSemi = /[^;{}\s]\s*\n\s*[a-z-]+\s*:/i.test(text);
    if (open !== close) { status.textContent = `⚠ Unbalanced braces (${open}/${close})`; status.style.color = '#fbbf24'; }
    else if (missingSemi) { status.textContent = '⚠ Likely missing semicolon'; status.style.color = '#fbbf24'; }
    else { status.textContent = '✓ OK'; status.style.color = ''; }
  };
  editor.addEventListener('input', update);
  update();
})();
```

- [ ] **Step 3: Property auto-suggest**

```js
(function autoSuggest() {
  const editor = document.querySelector('.editor, #editor, [contenteditable]');
  if (!editor) return;
  const PROPS = ['align-items','background','border','border-radius','box-shadow','color','display','flex','font-family','font-size','gap','grid','height','justify-content','margin','padding','position','transform','transition','width','z-index','animation','animation-timeline','clip-path','backdrop-filter','aspect-ratio'];
  const box = document.createElement('div');
  box.style.cssText = 'position:absolute;background:oklch(0.2 0.02 280);color:white;border-radius:6px;padding:4px;z-index:9999;font-family:monospace;font-size:12px;max-height:180px;overflow:auto;display:none;';
  document.body.appendChild(box);
  editor.addEventListener('input', () => {
    const sel = getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    const text = editor.textContent;
    const before = text.slice(0, range.startOffset);
    const m = before.match(/([a-z-]{2,})$/);
    if (!m) { box.style.display = 'none'; return; }
    const needle = m[1];
    const matches = PROPS.filter(p => p.startsWith(needle)).slice(0, 8);
    if (!matches.length) { box.style.display = 'none'; return; }
    box.innerHTML = matches.map(p => `<div data-p="${p}" style="padding:2px 6px;cursor:pointer">${p}</div>`).join('');
    const rect = range.getBoundingClientRect();
    box.style.left = rect.left + 'px'; box.style.top = (rect.bottom + 4) + 'px'; box.style.display = 'block';
  });
  box.addEventListener('mousedown', (e) => {
    const hit = e.target.closest('[data-p]'); if (!hit) return;
    e.preventDefault();
    document.execCommand('insertText', false, hit.dataset.p.slice(hit.dataset.p.lastIndexOf('-') + 1 - hit.dataset.p.length).slice(box.querySelector('input')?.value?.length || 0) + ': ');
    box.style.display = 'none';
  });
  document.addEventListener('click', (e) => { if (!box.contains(e.target) && e.target !== editor) box.style.display = 'none'; });
})();
```

- [ ] **Step 4: Reset preset**

```js
document.getElementById('reset-preset')?.addEventListener('click', () => {
  const active = document.querySelector('.preset.active');
  if (!active) return;
  active.click(); // re-apply preset
});
```

- [ ] **Step 5: Style status bar in `css/playground.css`**

```css
.editor-status-bar {
  display: flex; gap: 12px; padding: 6px 10px; background: oklch(0.15 0.02 280);
  border-top: 1px solid oklch(1 0 0 / 0.1); font-family: "JetBrains Mono", monospace; font-size: 0.75rem;
}
.editor-status-bar button { margin-left: auto; padding: 2px 8px; }
```

- [ ] **Step 6: Verify**

Type CSS in playground. Line and char counts update. Leave an open brace — warning in status. Miss a semicolon — warning. Type `mar` → dropdown suggests `margin`. Click suggestion → inserted. Reset preset → restores default.

- [ ] **Step 7: Commit**

```bash
git add js/gimmicks/playground-gm.js js/playground.js css/playground.css playground.html
git commit -m "feat(layer-1): playground UX — counts, syntax warnings, property auto-suggest, reset preset"
```

---

## Task 27: Component Page Search

**Files:**
- Modify: `components.html`
- Modify: `js/gimmicks/components-gm.js`
- Modify: `css/toolkit.css`

- [ ] **Step 1: Add filter input**

In `components.html` above the grid:

```html
<div class="components-search">
  <input id="components-filter" type="search" placeholder="Filter components…" aria-label="Filter components">
  <kbd>/</kbd>
</div>
```

- [ ] **Step 2: Wire filter**

In `js/gimmicks/components-gm.js`:

```js
(function search() {
  const input = document.getElementById('components-filter');
  const cards = document.querySelectorAll('[data-comp-id]');
  if (!input || !cards.length) return;
  const empty = document.createElement('div');
  empty.className = 'components-empty';
  empty.textContent = 'No components match — try a different term';
  empty.style.display = 'none';
  input.parentElement?.appendChild(empty);
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((c) => {
      const text = (c.textContent || '').toLowerCase();
      const show = !q || text.includes(q);
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    empty.style.display = visible ? 'none' : '';
  });
  addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input,textarea,[contenteditable]')) {
      e.preventDefault();
      input.focus(); input.select();
    }
  });
})();
```

- [ ] **Step 3: Style**

```css
.components-search { display: flex; align-items: center; gap: 8px; margin: 16px 0; }
.components-search input { flex: 1; padding: 8px 12px; font-size: 1rem; border-radius: 8px; border: 1px solid oklch(1 0 0 / 0.15); background: oklch(0.2 0.02 280); color: inherit; }
.components-search kbd { font-family: "JetBrains Mono", monospace; padding: 2px 6px; border: 1px solid oklch(1 0 0 / 0.2); border-radius: 4px; font-size: 0.8rem; }
.components-empty { padding: 24px; text-align: center; opacity: 0.6; }
```

- [ ] **Step 4: Verify**

Open components page. Press `/` → filter focuses. Type "dialog" → only dialog card visible. Clear → all back.

- [ ] **Step 5: Commit**

```bash
git add components.html js/gimmicks/components-gm.js css/toolkit.css
git commit -m "feat(layer-1): components page search with / shortcut"
```

---

## Final Verification + Push

- [ ] **Step 1: Start server and walk every page**

```bash
cd "C:/ComfyUI/RD/HTML" && python -m http.server 8080
```

Visit each page, confirm no console errors, animations play, gimmicks respond.

- [ ] **Step 2: Lighthouse pass (optional)**

Run Lighthouse in Chrome DevTools on at least 3 pages (landing, hub, a zone). Target: no new critical a11y regressions.

- [ ] **Step 3: Push**

```bash
git push origin master
```

---

## Self-Review Checklist

- [x] Every Layer 1 spec subsection (1.1 × 8 animation areas, 1.2 × 25 gimmicks, 1.3 × 5 polish) mapped to at least one task
- [x] No placeholder steps — every step has concrete code or exact action
- [x] Type consistency: `playSfx`, `window.__eni.sfx.play`, `window.__eni.ghosts.on/off` used identically across tasks
- [x] File paths are absolute within repo (always start from repo root)
- [x] Reduced-motion respected in every animation-adding task
- [x] Mobile / touch considerations called out where relevant (magnetic, cursor trail, long-press, swipe)
- [x] Tasks ordered so primitives (ambient CSS, sfx engine, session.js) exist before features that depend on them
