# Gimmicks & Easter Eggs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 108+ interactive gimmicks, easter eggs, and cultural references across every page of "A Love Letter to the Web."

**Architecture:** Per-page JS gimmick modules loaded as `type="module"`. A shared `global.js` handles cross-page features (theme, console, shortcuts). Each module is self-contained — no gimmick depends on another. All gimmicks wrap in try/catch and degrade gracefully. CSS additions go in `css/gimmicks.css` for global styles, and inline in existing zone CSS files for page-specific styles.

**Tech Stack:** Vanilla JS (ES modules), CSS custom properties, `@property`, `localStorage`, `sessionStorage`, Popover API, `<dialog>`, `IntersectionObserver`, `MutationObserver`. Zero dependencies.

**Spec:** `docs/superpowers/specs/2026-04-14-gimmicks-easter-eggs-design.md`

**Testing:** No test framework. Each gimmick verified by its trigger in the browser. The `secrets()` console function serves as a built-in test harness. Use `python -m http.server 8080` from project root.

---

## File Structure

```
js/gimmicks/
├── global.js           # Theme, console art, tab title, favicon, shortcuts, context menu, idle, secrets()
├── landing.js          # 1991-2026 era gimmicks, typewriter, guestbook, counter, cards
├── hub.js              # Konami code, sparkles, line draw, stats, time-of-day
├── zones.js            # Shared zone gimmicks (progress color, chapter numbers)
├── playground-gm.js    # Editor jokes and reactions
├── components-gm.js    # Toast rotation, dark mode wiring, sassy components
├── speedrun.js         # Speed run timer (loaded conditionally)
css/gimmicks.css        # Light theme, selection colors, print, cursors, seasonal, reduced-motion badge
404.html                # Custom not-found page
secret.html             # Treasure hunt reward (credits scroll)
lol.html                # Secret URL easter egg
```

**Existing files modified:**
- `index.html` — Add real links, guestbook dialog, marquee, GIF decorations, script tags
- `hub.html` — Add script tag
- `zones/*.html` — Add script tag, view source comments
- `playground.html` — Add script tag
- `components.html` — Wire dark mode toggle, add script tag
- Every HTML file — Add theme-init script in `<head>`, view source comment, gimmicks.css link

---

## Parallelization Guide

| Task Group | Tasks | Dependencies | Can Parallelize? |
|-----------|-------|-------------|-----------------|
| Group A: Global | 1-2 | None | Foundation — do first |
| Group B: Landing | 3-5 | Group A | **After A, parallel with C-H** |
| Group C: Hub | 6 | Group A | **Parallel with B, D-H** |
| Group D: Zones | 7 | Group A | **Parallel** |
| Group E: Playground | 8 | Group A | **Parallel** |
| Group F: Components | 9 | Group A | **Parallel** |
| Group G: Hidden Pages | 10 | Group A | **Parallel** |
| Group H: Seasonal | 11 | Group A | **Parallel** |

**Maximum parallelism:** After Tasks 1-2 (global foundation), Tasks 3-11 can all run simultaneously — **up to 9 parallel agents**.

---

## Group A: Global Foundation

### Task 1: Theme System + CSS Gimmicks

**Files:**
- Create: `css/gimmicks.css`
- Modify: `index.html` — add `<link>` and theme-init script
- Modify: `hub.html` — add `<link>` and theme-init script
- Modify: `playground.html` — add `<link>` and theme-init script
- Modify: `components.html` — add `<link>` and theme-init script
- Modify: all `zones/*.html` — add `<link>` and theme-init script

- [ ] **Step 1: Create `css/gimmicks.css` with light theme, selection, print, cursors**

```css
/* === Light Theme === */
[data-theme="light"] {
  --color-base: oklch(0.97 0.005 270);
  --color-surface: oklch(0.94 0.005 270);
  --color-border: oklch(0.88 0.01 270);
  --color-text: oklch(0.15 0.01 270);
  --color-muted: oklch(0.45 0.02 270);
  --color-primary: oklch(0.5 0.22 270);
  --color-accent: oklch(0.55 0.2 295);
  --color-gradient-start: oklch(0.5 0.22 270);
  --color-gradient-mid: oklch(0.55 0.2 295);
  --color-gradient-end: oklch(0.52 0.2 340);
}

[data-theme="light"] .page-header {
  background: oklch(0.97 0.005 270 / 0.8);
}

[data-theme="light"] .zone-nav {
  background: oklch(0.94 0.005 270 / 0.9);
}

/* Light theme makes 1991 era even more authentic */
[data-theme="light"] .era-1991 {
  background: #fff;
}

/* Theme transition */
body {
  transition: background-color 300ms ease, color 300ms ease;
}

/* === Custom Selection === */
::selection {
  background: oklch(0.62 0.2 270 / 0.3);
  color: var(--color-text);
}

/* Zone-specific selection colors */
[style*="--zone-color: #646cff"] ::selection { background: oklch(0.62 0.2 270 / 0.3); }
[style*="--zone-color: #a78bfa"] ::selection { background: oklch(0.68 0.18 295 / 0.3); }
[style*="--zone-color: #f472b6"] ::selection { background: oklch(0.65 0.18 340 / 0.3); }
[style*="--zone-color: #34d399"] ::selection { background: oklch(0.7 0.15 160 / 0.3); }
[style*="--zone-color: #fbbf24"] ::selection { background: oklch(0.8 0.15 85 / 0.3); }
[style*="--zone-color: #60a5fa"] ::selection { background: oklch(0.7 0.15 250 / 0.3); }
[style*="--zone-color: #fb923c"] ::selection { background: oklch(0.75 0.15 55 / 0.3); }
[style*="--zone-color: #e879f9"] ::selection { background: oklch(0.7 0.18 310 / 0.3); }

/* === Print Stylesheet === */
@media print {
  .page-header, .zone-nav, .scroll-progress, .hub-stats { display: none; }
  body { background: white !important; color: black !important; }
  a { color: black; text-decoration: underline; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #666; }
  @page { margin: 2cm; }
  body::after {
    content: "Printed from A Love Letter to the Web — ixmxamar.github.io/HTML";
    display: block; text-align: center; margin-top: 2rem;
    font-size: 0.8rem; color: #666;
  }
}

/* === Reduced Motion Badge === */
.reduced-motion-badge {
  position: fixed; bottom: 1rem; right: 1rem; z-index: 999;
  padding: 0.5rem 1rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 2rem; font-size: 0.75rem; color: var(--color-muted);
  font-family: var(--font-code);
  cursor: pointer; opacity: 0.8;
  transition: opacity 200ms;
}
.reduced-motion-badge:hover { opacity: 1; }

/* === Keyboard Help Popover === */
.shortcut-help[popover] {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 0.75rem; padding: 1.5rem; max-width: 24rem;
  color: var(--color-text); font-family: var(--font-body);
}
.shortcut-help h3 { margin-bottom: 1rem; }
.shortcut-help dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1rem; }
.shortcut-help dt {
  font-family: var(--font-code); font-size: 0.8rem;
  padding: 0.1rem 0.4rem; background: var(--color-base);
  border: 1px solid var(--color-border); border-radius: 0.25rem;
  text-align: center;
}
.shortcut-help dd { font-size: 0.85rem; color: var(--color-muted); }

/* === Context Menu === */
.custom-context-menu[popover] {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 0.5rem; padding: 0.25rem; min-width: 14rem;
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.4);
}
.custom-context-menu button {
  display: flex; align-items: center; gap: 0.75rem; width: 100%;
  padding: 0.5rem 0.75rem; background: none; border: none;
  color: var(--color-text); font-size: 0.85rem; cursor: pointer;
  border-radius: 0.375rem; text-align: left;
}
.custom-context-menu button:hover {
  background: var(--color-primary); color: white;
}
.custom-context-menu .separator {
  height: 1px; background: var(--color-border); margin: 0.25rem 0.5rem;
}
```

- [ ] **Step 2: Add theme-init script + gimmicks.css link to every HTML page**

Add this to the `<head>` of every HTML file (index.html, hub.html, playground.html, components.html, all 8 zones/*.html — 12 files total), BEFORE any other stylesheet:

```html
<script>
  // Theme init — runs before paint to prevent flash
  (function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})();
</script>
<link rel="stylesheet" href="css/gimmicks.css">
```

For zone pages, the path is `../css/gimmicks.css`.

Also add to every HTML file, just before `</body>`:
```html
<script type="module" src="js/gimmicks/global.js"></script>
```
For zone pages: `../js/gimmicks/global.js`.

- [ ] **Step 3: Verify** — Open any page, run `localStorage.setItem('theme','light')` in console, reload. Page should be light-themed. Run `localStorage.removeItem('theme')`, reload — dark again.

- [ ] **Step 4: Commit**

```bash
git add css/gimmicks.css
git commit -m "feat: add gimmicks CSS — light theme, selection colors, print styles, UI components"
```

---

### Task 2: Global JS — Console, Shortcuts, Tab Title, Favicon, Context Menu, Secrets

**Files:**
- Create: `js/gimmicks/global.js`

- [ ] **Step 1: Create `js/gimmicks/global.js`**

```js
/**
 * Global gimmicks — loaded on every page.
 * Theme toggle, console art, tab title, favicon, keyboard shortcuts,
 * custom context menu, idle detection, reduced motion badge, secrets().
 */

// ─── Console Art ────────────────────────────────────────────
try {
  const style = 'font-family:monospace;color:#646cff;font-size:12px;line-height:1.4';
  console.log('%c' + [
    '╔═══════════════════════════════════════╗',
    '║   A Love Letter to the Web            ║',
    '║   ────────────────────────────────     ║',
    '║   Hand-written HTML, CSS, vanilla JS   ║',
    '║   Zero dependencies. Zero build steps. ║',
    '║                                        ║',
    '║   Type secrets() for easter egg hints. ║',
    '╚═══════════════════════════════════════╝',
  ].join('\n'), style);
} catch {}

// ─── Tab Title Shenanigans ──────────────────────────────────
const originalTitle = document.title;
try {
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden
      ? 'Come back! The CSS misses you...'
      : originalTitle;
  });
} catch {}

// ─── Dynamic Favicon ────────────────────────────────────────
try {
  const symbols = {
    'index.html': '◈', 'hub.html': '✦', 'playground.html': '▶', 'components.html': '◧',
    'scroll-animations.html': '◆', 'popover-dialog.html': '◇', 'css-art.html': '●',
    'container-queries.html': '◈', 'view-transitions.html': '▲', 'houdini.html': '■',
    'has-selector.html': '★', 'cascade-layers.html': '⬡',
    'secret.html': '🔑', 'lol.html': '😂', '404.html': '❌',
  };
  const page = location.pathname.split('/').pop() || 'index.html';
  const symbol = symbols[page] || '◈';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="28">${symbol}</text></svg>`;
  const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
  link.rel = 'icon';
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  document.head.appendChild(link);
} catch {}

// ─── Theme Toggle Function ──────────────────────────────────
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  return next;
}
window.__toggleTheme = toggleTheme;

// ─── Keyboard Shortcuts ─────────────────────────────────────
try {
  // Create help popover
  const helpPopover = document.createElement('div');
  helpPopover.setAttribute('popover', 'auto');
  helpPopover.className = 'shortcut-help';
  helpPopover.innerHTML = `
    <h3>Keyboard Shortcuts</h3>
    <dl>
      <dt>?</dt><dd>Show this help</dd>
      <dt>t</dt><dd>Toggle light/dark theme</dd>
      <dt>h</dt><dd>Go to Observatory hub</dd>
      <dt>1-8</dt><dd>Go to zone 1-8</dd>
      <dt>p</dt><dd>Go to Playground</dd>
      <dt>c</dt><dd>Go to Components</dd>
      <dt>← →</dt><dd>Prev/next zone (on zone pages)</dd>
    </dl>
    <p style="margin-top:1rem;font-size:0.75rem;color:var(--color-muted)">
      There are 12 hidden comments in the source. How many have you found?
    </p>
  `;
  document.body.appendChild(helpPopover);

  const isZone = location.pathname.includes('/zones/');
  const prefix = isZone ? '../' : '';
  const zones = [
    'zones/scroll-animations.html', 'zones/popover-dialog.html', 'zones/css-art.html',
    'zones/container-queries.html', 'zones/view-transitions.html', 'zones/houdini.html',
    'zones/has-selector.html', 'zones/cascade-layers.html',
  ];

  document.addEventListener('keydown', (e) => {
    // Don't trigger in inputs/editors
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key) {
      case '?': helpPopover.togglePopover(); break;
      case 't': toggleTheme(); break;
      case 'h': location.href = prefix + 'hub.html'; break;
      case 'p': location.href = prefix + 'playground.html'; break;
      case 'c': location.href = prefix + 'components.html'; break;
      case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8':
        location.href = prefix + zones[parseInt(e.key) - 1]; break;
    }
  });
} catch {}

// ─── Custom Context Menu ────────────────────────────────────
try {
  const menu = document.createElement('div');
  menu.setAttribute('popover', 'auto');
  menu.className = 'custom-context-menu';
  menu.innerHTML = `
    <button data-action="source">🔍 View Source (it's readable)</button>
    <button data-action="inspect">🛠 Inspect Element (we're proud)</button>
    <div class="separator"></div>
    <button data-action="copy-link">🔗 Copy Link</button>
    <button data-action="surprise">🎲 Surprise Me</button>
    <button data-action="theme">🌓 Toggle Theme</button>
  `;
  document.body.appendChild(menu);

  const zones = [
    'zones/scroll-animations.html', 'zones/popover-dialog.html', 'zones/css-art.html',
    'zones/container-queries.html', 'zones/view-transitions.html', 'zones/houdini.html',
    'zones/has-selector.html', 'zones/cascade-layers.html',
  ];
  const isZone = location.pathname.includes('/zones/');
  const prefix = isZone ? '../' : '';

  document.querySelector('main')?.addEventListener('contextmenu', (e) => {
    if (e.target.matches('input, textarea, select, [contenteditable], a')) return;
    e.preventDefault();
    menu.style.position = 'fixed';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.style.margin = '0';
    menu.showPopover();
  });

  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    menu.hidePopover();
    switch (btn.dataset.action) {
      case 'source': window.open('view-source:' + location.href); break;
      case 'inspect': break; // they'll use DevTools
      case 'copy-link':
        navigator.clipboard?.writeText(location.href);
        break;
      case 'surprise':
        location.href = prefix + zones[Math.floor(Math.random() * zones.length)];
        break;
      case 'theme': toggleTheme(); break;
    }
  });
} catch {}

// ─── Idle Detection ─────────────────────────────────────────
try {
  let idleTimer;
  const IDLE_MS = 60000;

  function resetIdle() {
    document.documentElement.classList.remove('idle-mode');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      document.documentElement.classList.add('idle-mode');
    }, IDLE_MS);
  }

  ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
    document.addEventListener(evt, resetIdle, { passive: true })
  );
  resetIdle();
} catch {}

// ─── Reduced Motion Badge ───────────────────────────────────
try {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (!localStorage.getItem('reducedMotionDismissed')) {
      const badge = document.createElement('div');
      badge.className = 'reduced-motion-badge';
      badge.textContent = 'Reduced motion mode — animations paused. The spirit remains. ✨';
      badge.addEventListener('click', () => {
        badge.remove();
        localStorage.setItem('reducedMotionDismissed', '1');
      });
      document.body.appendChild(badge);
    }
  }
} catch {}

// ─── Scroll Velocity ────────────────────────────────────────
try {
  let lastScroll = 0;
  let lastTime = performance.now();
  let rafId;

  function updateScrollSpeed() {
    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
      const speed = Math.min(Math.abs(window.scrollY - lastScroll) / dt * 16, 3);
      document.documentElement.style.setProperty('--scroll-speed', speed.toFixed(2));
      lastScroll = window.scrollY;
      lastTime = now;
    }
    rafId = requestAnimationFrame(updateScrollSpeed);
  }

  window.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(updateScrollSpeed);
  }, { passive: true });

  // Stop the loop when idle
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
  });
} catch {}

// ─── secrets() Console Function ─────────────────────────────
window.secrets = function() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const allSecrets = {
    'index.html': [
      { name: 'Typewriter', hint: 'Visit for the first time (or clear sessionStorage)', found: !!sessionStorage.getItem('typewriterDone') },
      { name: 'Guestbook', hint: 'Click "Guestbook" in the 1996 sidebar', found: false },
      { name: 'Visitor Counter', hint: 'Check the 1996 section — it counts!', found: true },
      { name: 'Card Flip', hint: 'Click any card in the 2010 section', found: false },
      { name: 'Centering a Div', hint: 'Triple-click the flexbox card', found: false },
      { name: 'Hampster Dance', hint: 'Triple-click Under Construction', found: false },
      { name: 'Hypermedia Preview', hint: 'Hover the word "hypermedia" in 1991', found: false },
      { name: 'Source Comment', hint: 'View page source, search for "Letter"', found: false },
    ],
    'hub.html': [
      { name: 'Konami Code', hint: '↑↑↓↓←→←→BA', found: false },
      { name: '0 Dependencies', hint: 'Click the stat', found: false },
      { name: 'Time Greeting', hint: 'Check the subtitle', found: true },
      { name: 'Click Sparkles', hint: 'Click empty space', found: false },
    ],
  };
  const secrets = allSecrets[page] || [{ name: 'Explore!', hint: 'Every page has secrets.', found: false }];
  console.table(secrets);
  return `Found ${secrets.filter(s => s.found).length}/${secrets.length} on this page.`;
};

// ─── Export for other modules ───────────────────────────────
export { toggleTheme };
```

- [ ] **Step 2: Verify** — Open any page, check console for ASCII art. Press `?` for shortcut overlay. Press `t` to toggle theme. Right-click for custom menu. Switch tabs and check title change. Type `secrets()` in console.

- [ ] **Step 3: Commit**

```bash
git add js/gimmicks/global.js
git commit -m "feat: add global gimmicks — console art, shortcuts, theme, context menu, idle detection"
```

---

## Group B: Landing Page Gimmicks

### Task 3: Landing Page — Real Links + HTML Modifications

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update all `href="#"` links in index.html with real URLs**

In the 1991 era section, replace:
```html
<a href="#">hypermedia</a>
```
with:
```html
<a href="https://www.w3.org/WhatIs.html" target="_blank" rel="noopener">hypermedia</a>
```

Full replacement list for 1991 era:
- `hypermedia` → `https://www.w3.org/WhatIs.html`
- `executive summary` → `http://info.cern.ch/hypertext/WWW/Summary.html`
- `Mailing lists` → `https://www.w3.org/Archives/`
- `Policy` → `https://www.w3.org/Consortium/Legal/`
- `W3 news` → `http://info.cern.ch/hypertext/WWW/News/9211.html`
- `Frequently Asked Questions` → `https://www.w3.org/FAQ.html`
- `Tim Berners-Lee` → `https://www.w3.org/People/Berners-Lee/`

For the 1996 era sidebar:
- `Home` → `#era-1991`
- `About Me` → `https://github.com/IxMxAMAR`
- `Guestbook` → add `id="guestbook-link"` (JS will handle the dialog)
- `Links` → `hub.html`
- `WebRing` → `https://webri.ng/`

- [ ] **Step 2: Add guestbook dialog HTML to index.html** (before `</main>`)

```html
<!-- Guestbook Dialog -->
<dialog id="guestbook-dialog" class="guestbook">
  <div class="guestbook-header">
    <img src="assets/gifs/spinning-earth.gif" alt="" width="40" height="40" loading="lazy">
    <h2>📒 My Guestbook</h2>
    <button class="guestbook-close" aria-label="Close">[X]</button>
  </div>
  <img src="assets/gifs/divider-rainbow.gif" alt="" class="guestbook-divider" loading="lazy">
  <div class="guestbook-entries">
    <div class="gb-entry">
      <img src="assets/gifs/dragon-purple.gif" alt="" width="32" height="32" loading="lazy">
      <div><strong>xXDarkAngelXx</strong> <em>- 1997</em><br>Cool site!!</div>
    </div>
    <div class="gb-entry">
      <img src="assets/gifs/wolf-purple.gif" alt="" width="32" height="32" loading="lazy">
      <div><strong>dave</strong> <em>- 1998</em><br>how do i download the internet?</div>
    </div>
    <div class="gb-entry">
      <img src="assets/gifs/star-gold.gif" alt="" width="32" height="32" loading="lazy">
      <div><strong>anonymous</strong> <em>- 1999</em><br>FIRST!!!</div>
    </div>
    <div class="gb-entry">
      <img src="assets/gifs/angel.gif" alt="" width="32" height="32" loading="lazy">
      <div><strong>☆Sparkle☆</strong> <em>- 1997</em><br>Please sign my guestbook too! www.angelfire.com/~sparkle</div>
    </div>
  </div>
  <img src="assets/gifs/divider-music.gif" alt="" class="guestbook-divider" loading="lazy">
  <form class="guestbook-form" onsubmit="return false">
    <input type="text" placeholder="Your name" class="gb-input">
    <textarea placeholder="Your message" class="gb-textarea" rows="3"></textarea>
    <button type="submit" class="gb-submit">Sign Guestbook ✍️</button>
  </form>
  <div class="gb-thanks" hidden>
    <img src="assets/gifs/handshake.gif" alt="" width="50" loading="lazy">
    <p>Thanks for signing! Your entry will appear in 3-5 business days.</p>
  </div>
  <img src="assets/gifs/rose-sparkle.gif" alt="" class="guestbook-footer-img" loading="lazy" width="80">
</dialog>
```

- [ ] **Step 3: Add marquee div to 1996 era** (at the end of `.era-1996 .era-content`)

```html
<div class="marquee-96" aria-hidden="true">
  <span>Welcome to my homepage! Best viewed in Netscape Navigator 3.0 at 800×600 ✦ You are visitor #<span class="visitor-count">004,271</span> ✦ </span>
</div>
<a href="mailto:webmaster@geocities.com" title="This inbox has been full since 1999" class="email-96">📧 Email the Webmaster</a>
```

- [ ] **Step 4: Add `<hr>` tooltip to 1991 era** — wrap existing `<hr>` with a title attribute:

```html
<hr title="The original horizontal rule. Since 1993.">
```

- [ ] **Step 5: Make 2026 platform chips link to zones**

Replace each chip div with an anchor:
```html
<a href="zones/scroll-animations.html" class="platform-chip" data-transition="hub-node">scroll-driven animations</a>
<a href="zones/container-queries.html" class="platform-chip" data-transition="hub-node">container queries</a>
<a href="zones/has-selector.html" class="platform-chip" data-transition="hub-node">:has() selector</a>
<a href="zones/view-transitions.html" class="platform-chip" data-transition="hub-node">view transitions</a>
<a href="zones/popover-dialog.html" class="platform-chip" data-transition="hub-node">popover API</a>
<a href="zones/cascade-layers.html" class="platform-chip" data-transition="hub-node">cascade layers</a>
<a href="#era-2026" class="platform-chip">CSS nesting</a>
<a href="#era-2026" class="platform-chip">oklch colors</a>
<a href="zones/houdini.html" class="platform-chip" data-transition="hub-node">@property</a>
<a href="zones/houdini.html" class="platform-chip" data-transition="hub-node">Houdini paint</a>
<a href="zones/cascade-layers.html" class="platform-chip" data-transition="hub-node">@scope</a>
<a href="#era-2026" class="platform-chip">anchor positioning</a>
```

- [ ] **Step 6: Add view source treasure hunt comment** (before `</body>` in index.html):

```html
<!-- Letter 1/12: Y — "The web is for everyone." — Tim Berners-Lee -->
```

- [ ] **Step 7: Add landing gimmick script** (before `</body>`):

```html
<script type="module" src="js/gimmicks/landing.js"></script>
```

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: add real links, guestbook dialog, marquee, GIFs, treasure hunt comment"
```

---

### Task 4: Landing Page — Guestbook CSS + 1996 Era Enhancements

**Files:**
- Modify: `css/landing.css`

- [ ] **Step 1: Add guestbook dialog styles + marquee + 1996 enhancements to `css/landing.css`**

Append to the end of `css/landing.css`:

```css
/* === Guestbook Dialog === */
.guestbook {
  background: #000033;
  color: #00ff00;
  font-family: 'Comic Sans MS', cursive;
  border: 3px ridge #3333ff;
  padding: 0;
  max-width: 500px;
  width: 90vw;
}

.guestbook::backdrop {
  background: oklch(0 0 0 / 0.7);
}

.guestbook-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #000066;
  border-bottom: 2px solid #3333ff;
}

.guestbook-header h2 {
  flex: 1;
  font-size: 16px;
  color: #ffff00;
  font-family: 'Comic Sans MS', cursive;
  letter-spacing: normal;
}

.guestbook-close {
  background: #c0c0c0;
  border: 2px outset #fff;
  color: #000;
  font-family: monospace;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
}

.guestbook-close:active {
  border-style: inset;
}

.guestbook-divider {
  width: 100%;
  height: auto;
  display: block;
}

.guestbook-entries {
  padding: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.gb-entry {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #003366;
  font-size: 13px;
  align-items: flex-start;
}

.gb-entry img {
  flex-shrink: 0;
  image-rendering: pixelated;
}

.gb-entry strong {
  color: #00ffff;
}

.gb-entry em {
  color: #888;
  font-size: 11px;
}

.guestbook-form {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gb-input, .gb-textarea {
  background: #000;
  color: #00ff00;
  border: 1px inset #666;
  padding: 0.4rem;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.gb-submit {
  background: #000066;
  color: #ffff00;
  border: 2px outset #3333ff;
  padding: 0.5rem;
  cursor: pointer;
  font-family: 'Comic Sans MS', cursive;
  font-size: 14px;
}

.gb-submit:active {
  border-style: inset;
}

.gb-thanks {
  text-align: center;
  padding: 1rem;
  color: #ffff00;
}

.gb-thanks p {
  margin-top: 0.5rem;
  font-size: 13px;
}

.guestbook-footer-img {
  display: block;
  margin: 0 auto 0.5rem;
}

/* === Marquee 1996 === */
.marquee-96 {
  overflow: hidden;
  white-space: nowrap;
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  font-size: 12px;
  color: #ffff00;
}

.marquee-96 span {
  display: inline-block;
  padding-left: 100%;
  animation: marquee-scroll 20s linear infinite;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

.email-96 {
  display: block;
  text-align: center;
  margin-top: var(--space-md);
  color: #00ffff;
  font-size: 13px;
}

/* === CSS3 Card Flip (2010) === */
.css3-card {
  perspective: 800px;
  cursor: pointer;
}

.css3-card-inner {
  position: relative;
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
}

.css3-card.flipped .css3-card-inner {
  transform: rotateY(180deg);
}

.css3-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-code);
  font-size: 1rem;
  color: #f5a623;
  padding: 1rem;
}

.css3-card-front {
  backface-visibility: hidden;
}

/* === HR Tooltip 1991 === */
.era-1991 hr {
  cursor: help;
}

/* === Platform Chip Links 2026 === */
a.platform-chip {
  text-decoration: none;
  color: var(--color-muted);
}

a.platform-chip:hover {
  text-decoration: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/landing.css
git commit -m "feat: add guestbook, marquee, card flip, and 1996 enhancement styles"
```

---

### Task 5: Landing Page — JavaScript (Typewriter, Counter, Guestbook, Card Flip, Easter Eggs)

**Files:**
- Create: `js/gimmicks/landing.js`

- [ ] **Step 1: Create `js/gimmicks/landing.js`**

```js
/**
 * Landing page gimmicks — era-specific interactivity.
 * Typewriter (1991), visitor counter + guestbook + marquee (1996),
 * card flip + 3D tilt (2010), dark mode card (2020), magnetic chips (2026).
 */

// ─── 1991: Typewriter Effect ────────────────────────────────
try {
  const era1991 = document.getElementById('era-1991');
  if (era1991 && !sessionStorage.getItem('typewriterDone')) {
    const content = era1991.querySelector('.era-content');
    if (content) {
      const original = content.innerHTML;
      content.style.visibility = 'visible';
      const text = content.textContent;
      content.textContent = '';
      content.style.visibility = 'visible';
      let i = 0;
      const speed = 15; // ms per char
      const type = () => {
        if (i < text.length) {
          content.textContent += text[i];
          i++;
          setTimeout(type, speed);
        } else {
          content.innerHTML = original;
          sessionStorage.setItem('typewriterDone', '1');
        }
      };
      // Click to skip
      content.addEventListener('click', () => {
        i = text.length;
        content.innerHTML = original;
        sessionStorage.setItem('typewriterDone', '1');
      }, { once: true });
      type();
    }
  }
} catch {}

// ─── 1996: Visitor Counter ──────────────────────────────────
try {
  const counterEl = document.querySelector('.visitor-count, .counter-num');
  if (counterEl) {
    let count = parseInt(localStorage.getItem('visitorCount') || '4271', 10);
    count++;
    localStorage.setItem('visitorCount', String(count));
    const formatted = String(count).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1,$2');
    counterEl.textContent = formatted;
  }
} catch {}

// ─── 1996: Guestbook Dialog ─────────────────────────────────
try {
  const gbLink = document.getElementById('guestbook-link') ||
    document.querySelector('.sidebar-nav a[href="#"]:nth-child(4)');
  const dialog = document.getElementById('guestbook-dialog');

  if (gbLink && dialog) {
    gbLink.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
    });

    dialog.querySelector('.guestbook-close')?.addEventListener('click', () => {
      dialog.close();
    });

    const form = dialog.querySelector('.guestbook-form');
    const thanks = dialog.querySelector('.gb-thanks');
    form?.querySelector('.gb-submit')?.addEventListener('click', () => {
      form.hidden = true;
      if (thanks) thanks.hidden = false;
    });
  }
} catch {}

// ─── 1996: Hampster Dance Easter Egg ────────────────────────
try {
  const construction = document.querySelector('.construction');
  if (construction) {
    let clickCount = 0;
    let clickTimer;
    construction.style.cursor = 'pointer';

    construction.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 500);

      if (clickCount >= 3) {
        clickCount = 0;
        const era = document.querySelector('.era-1996');
        if (!era) return;
        era.classList.add('hampster-dance');
        setTimeout(() => era.classList.remove('hampster-dance'), 5000);
      }
    });
  }
} catch {}

// ─── 1991: Hypermedia Era Preview ───────────────────────────
try {
  const hyperlink = document.querySelector('.era-1991 a[href*="WhatIs"]');
  if (hyperlink) {
    const fonts = [
      "'Times New Roman', serif",
      "'Comic Sans MS', cursive",
      "'Helvetica Neue', sans-serif",
      "'Inter', sans-serif",
    ];
    const colors = ['#000', '#ff00ff', '#e94560', '#646cff'];
    let idx = 0;
    let interval;

    hyperlink.addEventListener('mouseenter', () => {
      idx = 0;
      interval = setInterval(() => {
        hyperlink.style.fontFamily = fonts[idx % fonts.length];
        hyperlink.style.color = colors[idx % colors.length];
        idx++;
        if (idx >= fonts.length * 2) {
          clearInterval(interval);
          hyperlink.style.fontFamily = '';
          hyperlink.style.color = '';
        }
      }, 300);
    });

    hyperlink.addEventListener('mouseleave', () => {
      clearInterval(interval);
      hyperlink.style.fontFamily = '';
      hyperlink.style.color = '';
    });
  }
} catch {}

// ─── 2010: Card Flip ────────────────────────────────────────
try {
  const cards2010 = document.querySelectorAll('.css3-card');
  const backText = [
    'border-radius: 12px;',
    'background: linear-gradient(...);',
    'transform: rotate(45deg);',
    'box-shadow: 0 4px 6px rgba(...);',
  ];

  cards2010.forEach((card, i) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    // Add back face if it doesn't exist
    if (!card.querySelector('.css3-card-back')) {
      const front = card.querySelector('.css3-card-front') || card;
      const inner = document.createElement('div');
      inner.className = 'css3-card-inner';

      // Wrap existing content as front
      const frontDiv = document.createElement('div');
      frontDiv.className = 'css3-card-front';
      while (card.firstChild) frontDiv.appendChild(card.firstChild);

      const backDiv = document.createElement('div');
      backDiv.className = 'css3-card-back';
      backDiv.textContent = backText[i] || 'CSS is awesome;';

      inner.appendChild(frontDiv);
      inner.appendChild(backDiv);
      card.appendChild(inner);
    }
  });
} catch {}

// ─── 2010: 3D Tilt on Hover ────────────────────────────────
try {
  document.querySelectorAll('.css3-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 15}deg) rotateY(${x * 15}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
} catch {}

// ─── 2020: Triple-click "Centering a div" Timeline ─────────
try {
  const flexCard = document.querySelectorAll('.modern-feature')[2]; // display: flex card
  if (flexCard) {
    let tripleTimer;
    let tripleCount = 0;

    flexCard.addEventListener('click', () => {
      tripleCount++;
      clearTimeout(tripleTimer);
      tripleTimer = setTimeout(() => { tripleCount = 0; }, 500);

      if (tripleCount >= 3) {
        tripleCount = 0;
        const popover = document.createElement('div');
        popover.setAttribute('popover', 'auto');
        popover.style.cssText = `
          background: var(--color-surface); color: var(--color-text);
          border: 1px solid var(--color-border); border-radius: 0.75rem;
          padding: 1.5rem; max-width: 20rem; font-size: 0.85rem;
          font-family: var(--font-code); line-height: 1.8;
        `;
        popover.innerHTML = `
          <strong>The Centering Timeline</strong><br><br>
          <span style="color:var(--color-muted)">2005</span> How do I center a div?<br>
          <span style="color:var(--color-muted)">2010</span> Still googling...<br>
          <span style="color:var(--color-muted)">2015</span> Flexbox??<br>
          <span style="color:var(--color-muted)">2020</span> <code>place-items: center</code><br>
          <span style="color:var(--color-muted)">2026</span> We don't talk about those years.
        `;
        document.body.appendChild(popover);
        popover.showPopover();
        popover.addEventListener('toggle', (e) => {
          if (e.newState === 'closed') popover.remove();
        });
      }
    });
  }
} catch {}

// ─── 2020: Dark Mode Card Toggle ────────────────────────────
try {
  const darkCard = document.querySelectorAll('.modern-feature')[3]; // prefers-color-scheme card
  if (darkCard) {
    darkCard.style.cursor = 'pointer';
    darkCard.addEventListener('click', () => {
      window.__toggleTheme?.();
    });
  }
} catch {}
```

- [ ] **Step 2: Add hampster dance CSS** — append to `css/landing.css`:

```css
/* === Hampster Dance Easter Egg === */
.hampster-dance * {
  animation: hampster-bounce 0.3s ease-in-out infinite alternate !important;
}

.hampster-dance *:nth-child(2n) {
  animation-delay: 0.05s !important;
}

.hampster-dance *:nth-child(3n) {
  animation-delay: 0.1s !important;
}

@keyframes hampster-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}
```

- [ ] **Step 3: Verify** — Open `http://localhost:8080`:
  - 1991 era: Text types character-by-character on first visit. Click "hypermedia" → opens W3C page.
  - 1996 era: Visitor counter increments. Click "Guestbook" → dialog opens with retro GIFs. Marquee scrolls at bottom.
  - 2010 era: Click a card → it flips. Hover → 3D tilt.
  - 2020 era: Click prefers-color-scheme card → theme toggles. Triple-click flex card → centering timeline.
  - 2026 era: Chips link to zone pages.

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/landing.js css/landing.css
git commit -m "feat: add landing page gimmicks — typewriter, guestbook, counter, card flip, easter eggs"
```

---

## Group C: Hub Page Gimmicks

### Task 6: Hub — Konami Code, Sparkles, Line Draw, Stats, Time-of-Day

**Files:**
- Create: `js/gimmicks/hub-gm.js`
- Modify: `hub.html` — add script tag

- [ ] **Step 1: Create `js/gimmicks/hub-gm.js`**

```js
/**
 * Hub page gimmicks — Konami code, click sparkles, SVG line draw,
 * stat counter animations, time-of-day greeting, 0-deps popover.
 */

// ─── SVG Line Draw Animation ────────────────────────────────
try {
  document.querySelectorAll('.connection-line').forEach((line, i) => {
    const length = Math.sqrt(
      Math.pow(line.x2.baseVal.value - line.x1.baseVal.value, 2) +
      Math.pow(line.y2.baseVal.value - line.y1.baseVal.value, 2)
    );
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    line.style.animation = `line-draw 1.5s ease-out ${i * 0.15}s forwards`;
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes line-draw {
      to { stroke-dashoffset: 0; }
    }
  `;
  document.head.appendChild(style);
} catch {}

// ─── Click Sparkles ─────────────────────────────────────────
try {
  const constellation = document.querySelector('.constellation');
  if (constellation) {
    constellation.addEventListener('click', (e) => {
      if (e.target.closest('.zone-node')) return; // don't sparkle on node clicks

      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('div');
        const angle = (Math.PI * 2 / 6) * i;
        const dist = 20 + Math.random() * 30;
        spark.style.cssText = `
          position: fixed; width: 4px; height: 4px; border-radius: 50%;
          background: var(--color-primary); pointer-events: none; z-index: 999;
          left: ${e.clientX}px; top: ${e.clientY}px;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
        `;
        document.body.appendChild(spark);
        requestAnimationFrame(() => {
          spark.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
          spark.style.opacity = '0';
        });
        setTimeout(() => spark.remove(), 700);
      }
    });
  }
} catch {}

// ─── Konami Code + Rickroll ─────────────────────────────────
try {
  const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        // Explode nodes outward
        const nodes = document.querySelectorAll('.zone-node');
        nodes.forEach((node, i) => {
          const angle = (Math.PI * 2 / nodes.length) * i;
          node.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          node.style.transform = `translate(${Math.cos(angle) * 300}px, ${Math.sin(angle) * 300}px) scale(0.5)`;
          node.style.opacity = '0.3';
        });
        // Reassemble after 1s
        setTimeout(() => {
          nodes.forEach(node => {
            node.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
            node.style.transform = '';
            node.style.opacity = '';
          });
        }, 1000);
        // Rickroll text after 2.5s
        setTimeout(() => {
          const msg = document.createElement('div');
          msg.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-family: var(--font-code); font-size: var(--text-sm);
            color: var(--color-muted); text-align: center; z-index: 999;
            opacity: 0; transition: opacity 0.5s;
          `;
          msg.textContent = 'Never gonna give you up. Never gonna let you down.';
          document.body.appendChild(msg);
          requestAnimationFrame(() => { msg.style.opacity = '1'; });
          setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 600);
          }, 3000);
        }, 2500);
      }
    } else {
      konamiIndex = e.key === konamiSequence[0] ? 1 : 0;
    }
  });
} catch {}

// ─── "0 Dependencies" Popover ───────────────────────────────
try {
  const stats = document.querySelectorAll('.hub-stats span');
  const depsStat = [...stats].find(s => s.textContent.includes('0 Dependencies'));
  if (depsStat) {
    depsStat.style.cursor = 'pointer';
    depsStat.addEventListener('click', () => {
      const pop = document.createElement('div');
      pop.setAttribute('popover', 'auto');
      pop.style.cssText = `
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: 0.75rem; padding: 1.25rem; max-width: 18rem;
        font-family: var(--font-code); font-size: 0.85rem;
        color: var(--color-text); text-align: center;
      `;
      pop.textContent = 'Zero. None. Nada. Not even a normalize.css. We said what we said. 💅';
      document.body.appendChild(pop);
      pop.showPopover();
      pop.addEventListener('toggle', (e) => {
        if (e.newState === 'closed') pop.remove();
      });
    });
  }
} catch {}

// ─── Time-of-Day Greeting ───────────────────────────────────
try {
  const subtitle = document.querySelector('.hub-intro .subtitle');
  if (subtitle) {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour >= 6 && hour < 12) greeting = '(Good morning, explorer.)';
    else if (hour >= 12 && hour < 18) greeting = '(Good afternoon.)';
    else if (hour >= 18 && hour < 22) greeting = '(Good evening.)';
    else greeting = '(Late night coding? Respect.)';

    const span = document.createElement('span');
    span.style.cssText = 'display:block;font-size:0.75em;margin-top:0.5rem;opacity:0.6;';
    span.textContent = greeting;
    subtitle.appendChild(span);
  }
} catch {}

// ─── Animated Stat Counters ─────────────────────────────────
try {
  const zonesStat = [...document.querySelectorAll('.hub-stats span')].find(s => s.textContent.includes('8 Zones'));
  if (zonesStat) {
    zonesStat.style.cursor = 'pointer';
    zonesStat.addEventListener('click', () => {
      let n = 0;
      const interval = setInterval(() => {
        n++;
        zonesStat.textContent = n + ' Zones';
        if (n >= 8) clearInterval(interval);
      }, 80);
    });
  }
} catch {}
```

- [ ] **Step 2: Add script tag to `hub.html`** (before `</body>`):

```html
<script type="module" src="js/gimmicks/hub-gm.js"></script>
<!-- Letter 2/12: O — "The web does not just connect machines, it connects people." — Tim Berners-Lee -->
```

- [ ] **Step 3: Verify** — Open hub.html:
  - SVG lines animate in on load
  - Click empty space → sparkles burst
  - Type ↑↑↓↓←→←→BA → nodes explode/reassemble + rickroll text
  - Click "0 Dependencies" → sassy popover
  - Time greeting appears in subtitle

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/hub-gm.js hub.html
git commit -m "feat: add hub gimmicks — konami code, sparkles, line draw, stats, greeting"
```

---

## Group D: Zone Page Gimmicks

### Task 7: Shared Zone Gimmicks + View Source Comments

**Files:**
- Create: `js/gimmicks/zones.js`
- Modify: all `zones/*.html` — add script tags and treasure hunt comments

- [ ] **Step 1: Create `js/gimmicks/zones.js`**

```js
/**
 * Shared zone page gimmicks — scroll progress recolor, chapter numbers.
 */

// ─── Zone-Colored Scroll Progress ───────────────────────────
try {
  const zoneColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--zone-color')?.trim();
  if (zoneColor) {
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
      progress.style.background = zoneColor;
    }
  }
} catch {}

// ─── Chapter Numbers (I, II, III) ───────────────────────────
try {
  const chapters = ['I', 'II', 'III'];
  const sections = [
    document.querySelector('.zone-hero'),
    document.querySelector('.zone-story'),
    document.querySelector('.zone-playground'),
  ].filter(Boolean);

  if (sections.length > 0) {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed; bottom: 2rem; left: 2rem; z-index: 90;
      font-family: var(--font-heading); font-size: 1.5rem; font-weight: 300;
      color: var(--color-muted); opacity: 0; transition: opacity 0.5s;
      pointer-events: none;
    `;
    document.body.appendChild(indicator);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target);
          if (idx >= 0) {
            indicator.textContent = chapters[idx];
            indicator.style.opacity = '0.4';
            clearTimeout(indicator._fadeTimer);
            indicator._fadeTimer = setTimeout(() => {
              indicator.style.opacity = '0';
            }, 2000);
          }
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => observer.observe(s));
  }
} catch {}
```

- [ ] **Step 2: Add script tags and treasure hunt comments to all 8 zone pages**

Add before `</body>` in each zone file:

**`zones/scroll-animations.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 3/12: U — "Innovation is serendipity, so you don't know what people will make." -->
```

**`zones/popover-dialog.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 4/12: F — "The Semantic Web is not a separate Web but an extension of the current one." -->
```

**`zones/css-art.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 5/12: O — "Anyone who has lost track of time when using a computer knows the propensity to dream." -->
```

**`zones/container-queries.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 6/12: U — "Data is a precious thing and will last longer than the systems themselves." -->
```

**`zones/view-transitions.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 7/12: N — "The power of the Web is in its universality." -->
```

**`zones/houdini.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 8/12: D — "We need diversity of thought in the world to face the new challenges." -->
```

**`zones/has-selector.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 9/12: T — "The web is more a social creation than a technical one." -->
```

**`zones/cascade-layers.html`:**
```html
<script type="module" src="../js/gimmicks/zones.js"></script>
<!-- Letter 10/12: H — "Imagine that everything you buy has a tiny chip that links to a URL." -->
```

- [ ] **Step 3: Also add comments to remaining non-zone pages:**

**`playground.html`:** (before `</body>`)
```html
<!-- Letter 11/12: E — "The original idea of the web was that it should be a collaborative space." -->
```

**`components.html`:** (before `</body>`)
```html
<!-- Letter 12/12: M — "The Web as I envisaged it, we have not seen it yet." — Visit /secret.html -->
```

- [ ] **Step 4: Verify** — Open any zone page:
  - Scroll progress bar matches zone color
  - Chapter number "I", "II", "III" fades in at each section
  - View source → find the hidden comment

- [ ] **Step 5: Commit**

```bash
git add js/gimmicks/zones.js zones/*.html playground.html components.html
git commit -m "feat: add zone gimmicks — scroll progress color, chapter numbers, treasure hunt comments"
```

---

## Group E: Playground Gimmicks

### Task 8: Playground — Editor Jokes and Reactions

**Files:**
- Create: `js/gimmicks/playground-gm.js`
- Modify: `playground.html` — add script tag

- [ ] **Step 1: Create `js/gimmicks/playground-gm.js`**

```js
/**
 * Playground gimmicks — editor reactions to specific CSS input.
 */

function showToast(msg, duration = 3000) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(1rem);
    background: var(--color-surface); border: 1px solid var(--color-border);
    border-radius: 2rem; padding: 0.5rem 1.25rem;
    font-family: var(--font-code); font-size: 0.8rem; color: var(--color-text);
    z-index: 999; opacity: 0; transition: all 0.3s ease;
    white-space: nowrap;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(1rem)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

const editor = document.querySelector('[contenteditable]') ||
               document.querySelector('.editor-content') ||
               document.querySelector('textarea');

if (editor) {
  let hasWelcomed = false;
  let importantCount = 0;
  let tabToasted = false;
  let idleTimer;

  editor.addEventListener('input', () => {
    const text = editor.textContent || editor.value || '';

    // Welcome toast on first keystroke
    if (!hasWelcomed) {
      hasWelcomed = true;
      showToast('Welcome, developer. ✨');
    }

    // !important warning
    if (text.includes('!important') && importantCount < 3) {
      importantCount++;
      showToast('⚠️ With great specificity comes great responsibility.');
    }

    // display: none joke
    if (text.includes('display: none') || text.includes('display:none')) {
      const preview = document.querySelector('.preview-pane, .preview, iframe');
      if (preview) {
        preview.style.transition = 'opacity 0.5s';
        preview.style.opacity = '0';
        setTimeout(() => {
          preview.style.opacity = '1';
          showToast('Just kidding. 😄');
        }, 1000);
      }
    }

    // color: red
    if (text.includes('color: red') || text.includes('color:red')) {
      showToast("We don't judge your color choices here.");
    }

    // transform: rotate(180deg) gag
    if (text.includes('rotate(180deg)')) {
      editor.style.transition = 'transform 0.5s ease';
      editor.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        editor.style.transform = '';
        setTimeout(() => { editor.style.transition = ''; }, 500);
      }, 1500);
    }

    // Reset idle timer
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if ((editor.textContent || editor.value || '').trim() === '') {
        showToast("Writer's block? Try a preset →", 5000);
      }
    }, 10000);
  });

  // Tab = 2 spaces
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
      if (!tabToasted) {
        tabToasted = true;
        showToast('We chose spaces. Fight us.');
      }
    }
  });

  // Night owl mode
  const hour = new Date().getHours();
  if (hour >= 2 && hour < 5) {
    showToast('Late night coding? Respect. ☕', 5000);
  }
}
```

- [ ] **Step 2: Add to `playground.html`** (before `</body>`):

```html
<script type="module" src="js/gimmicks/playground-gm.js"></script>
```

- [ ] **Step 3: Verify** — Open playground. Type anything → welcome toast. Type `!important` → warning. Type `color: red` → no-judgment message.

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/playground-gm.js playground.html
git commit -m "feat: add playground gimmicks — editor jokes, !important warning, rotate gag"
```

---

## Group F: Components Page Gimmicks

### Task 9: Components — Dark Mode Wiring, Toast Rotation, Sassy Components

**Files:**
- Create: `js/gimmicks/components-gm.js`
- Modify: `components.html` — add script tag

- [ ] **Step 1: Create `js/gimmicks/components-gm.js`**

```js
/**
 * Components page gimmicks — wire dark mode toggle to real theme,
 * toast message rotation, sassy component interactions.
 */

// ─── Wire Dark Mode Toggle to Real Theme ────────────────────
try {
  // Find the "Dark mode" toggle — it's the second toggle in the toggle-group
  const toggles = document.querySelectorAll('.toggle-label input[type="checkbox"], .toggle-group input[type="checkbox"]');
  const darkToggle = [...toggles].find((t, i) => {
    const label = t.closest('.toggle-label, label');
    return label?.textContent?.includes('Dark mode');
  });

  if (darkToggle) {
    // Set initial state based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    darkToggle.checked = currentTheme !== 'light';

    darkToggle.addEventListener('change', () => {
      const theme = darkToggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }
} catch {}

// ─── Toast Message Rotation ─────────────────────────────────
try {
  const toastMessages = [
    'This toast is native HTML. No library.',
    'Your bundle size: 0kb',
    'No npm install required',
    'Framework authors hate this one trick',
    'Built with popover. Closes itself. Life is good.',
  ];
  let toastIndex = 0;

  const toastBtn = document.querySelector('[popovertarget*="toast"], button[class*="toast"], .toast-trigger');
  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      // Find the toast popover
      const targetId = toastBtn.getAttribute('popovertarget');
      const toast = targetId ? document.getElementById(targetId) : null;
      if (toast) {
        const textEl = toast.querySelector('p, span, .toast-message');
        if (textEl) {
          textEl.textContent = toastMessages[toastIndex % toastMessages.length];
          toastIndex++;
        }
      }
    });
  }
} catch {}

// ─── Modal Dialog Escape Message ────────────────────────────
try {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dialog => {
    dialog.addEventListener('close', () => {
      // Check if closed via Escape (returnValue will be empty)
      if (!dialog.returnValue) {
        const msg = document.createElement('div');
        msg.style.cssText = `
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: 0.5rem; padding: 0.75rem 1.25rem;
          font-family: var(--font-code); font-size: 0.75rem; color: var(--color-muted);
          z-index: 999; opacity: 0; transition: opacity 0.3s;
        `;
        msg.textContent = "Esc works because closedby='any'. You're welcome.";
        document.body.appendChild(msg);
        requestAnimationFrame(() => { msg.style.opacity = '1'; });
        setTimeout(() => {
          msg.style.opacity = '0';
          setTimeout(() => msg.remove(), 300);
        }, 2500);
      }
    });
  });
} catch {}
```

- [ ] **Step 2: Add to `components.html`** (before `</body>`):

```html
<script type="module" src="js/gimmicks/components-gm.js"></script>
```

- [ ] **Step 3: Verify** — Open components page. Find dark mode toggle, flip it → whole page goes light. Click toast button repeatedly → messages rotate. Close modal with Escape → message appears.

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/components-gm.js components.html
git commit -m "feat: add components gimmicks — dark mode wiring, toast rotation, escape message"
```

---

## Group G: Hidden Pages

### Task 10: 404, Secret, and LOL Pages

**Files:**
- Create: `404.html`
- Create: `secret.html`
- Create: `lol.html`

- [ ] **Step 1: Create `404.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — A Love Letter to the Web</title>
  <script>(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})()</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/gimmicks.css">
  <style>
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100dvh; text-align: center; padding: 2rem; }
    .chain { display: flex; gap: 2rem; margin-bottom: 2rem; }
    .link-piece { width: 60px; height: 90px; border: 6px solid var(--color-primary); border-radius: 30px; position: relative; }
    .link-piece:first-child { animation: drift-left 3s ease-in-out infinite alternate; }
    .link-piece:last-child { animation: drift-right 3s ease-in-out infinite alternate; }
    @keyframes drift-left { to { transform: translateX(-20px) rotate(-5deg); } }
    @keyframes drift-right { to { transform: translateX(20px) rotate(5deg); } }
    h1 { font-size: var(--text-3xl); margin-bottom: var(--space-sm); }
    .subtitle { margin-bottom: var(--space-lg); }
    .lost-pixel { position: fixed; width: 8px; height: 8px; background: var(--color-primary); animation: wander 15s linear infinite; }
    @keyframes wander {
      0% { top: 20%; left: 10%; }
      25% { top: 70%; left: 80%; }
      50% { top: 30%; left: 60%; }
      75% { top: 80%; left: 20%; }
      100% { top: 20%; left: 10%; }
    }
    .pixel-label { position: fixed; bottom: 2rem; font-size: var(--text-xs); color: var(--color-muted); }
    .facts { cursor: pointer; color: var(--color-muted); font-size: var(--text-sm); max-width: 30rem; margin-top: var(--space-lg); }
    a.back { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--color-primary); font-family: var(--font-code); margin-top: var(--space-lg); }
  </style>
</head>
<body>
  <div class="chain" aria-hidden="true">
    <div class="link-piece"></div>
    <div class="link-piece"></div>
  </div>
  <h1>404</h1>
  <p class="subtitle">This link went to the great <code>/dev/null</code> in the sky.</p>
  <a href="hub.html" class="back">← Back to the Observatory</a>
  <div class="facts" id="facts">
    <p>Click for a 404 fact...</p>
  </div>
  <div class="lost-pixel" aria-hidden="true"></div>
  <div class="pixel-label">Even this pixel is hand-crafted CSS.</div>
  <script>
    const facts = [
      'The first 404 was Room 404 at CERN — the office where the original web servers lived.',
      'HTTP 404 was defined in 1992 as part of the HTTP/1.0 specification.',
      'Some sites return "200 OK" for missing pages. Those sites are wrong.',
    ];
    let fi = 0;
    document.getElementById('facts').addEventListener('click', () => {
      document.getElementById('facts').querySelector('p').textContent = facts[fi % facts.length];
      fi++;
    });
  </script>
  <script type="module" src="js/gimmicks/global.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `secret.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credits — A Love Letter to the Web</title>
  <script>(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})()</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/gimmicks.css">
  <style>
    body { overflow: hidden; background: var(--color-base); }
    .credits {
      position: fixed; bottom: -100vh; left: 50%; transform: translateX(-50%);
      text-align: center; white-space: nowrap;
      animation: scroll-credits 30s linear forwards;
      font-family: var(--font-heading);
    }
    .credits p { margin-bottom: 2rem; font-size: 1.2rem; color: var(--color-muted); }
    .credits .role { font-size: 0.9rem; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.1em; }
    .credits .name { font-size: 1.5rem; color: var(--color-text); margin-bottom: 2.5rem; }
    .credits .title { font-size: 2.5rem; font-weight: 800; color: var(--color-primary); margin-bottom: 4rem; }
    .credits .end { font-size: 3rem; font-weight: 800; margin-top: 4rem; }
    .credits .hint { font-size: 0.9rem; color: var(--color-muted); margin-top: 2rem; }
    @keyframes scroll-credits {
      from { transform: translateX(-50%) translateY(0); }
      to { transform: translateX(-50%) translateY(calc(-100% - 100vh)); }
    }
    .fireworks { display: none; position: fixed; inset: 0; pointer-events: none; z-index: 10; }
    .fireworks.active { display: block; }
    .firework {
      position: absolute; width: 6px; height: 6px; border-radius: 50%;
      animation: firework-burst 1s ease-out forwards;
    }
    @keyframes firework-burst {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(1) translate(var(--dx), var(--dy)); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="credits">
    <p class="title">A Love Letter to the Web</p>
    <p class="role">Directed by</p><p class="name">The Browser</p>
    <p class="role">Written by</p><p class="name">HTML, CSS, and a little JS</p>
    <p class="role">Produced by</p><p class="name">IxMxAMAR</p>
    <p class="role">Cinematography</p><p class="name">oklch() color space</p>
    <p class="role">Sound Design</p><p class="name">None (this is a website)</p>
    <p class="role">Special Thanks</p>
    <p class="name">Tim Berners-Lee</p>
    <p class="name">Håkon Wium Lie</p>
    <p class="name">Bert Bos</p>
    <p class="name">Every browser vendor who implemented the specs</p>
    <p class="role">Stunt Coordinator</p><p class="name">The Cascade</p>
    <p class="role">Catering</p><p class="name">localhost:8080</p>
    <p style="margin-top:3rem;color:var(--color-muted);font-size:0.85rem;">No frameworks were harmed in the making of this website.</p>
    <p class="end">THE END</p>
    <p class="hint">...or is it? (Press any key)</p>
  </div>
  <div class="fireworks" id="fireworks"></div>
  <script>
    document.addEventListener('keydown', () => {
      const fw = document.getElementById('fireworks');
      fw.classList.add('active');
      const colors = ['#646cff','#a78bfa','#f472b6','#34d399','#fbbf24','#60a5fa','#fb923c','#e879f9'];
      for (let i = 0; i < 40; i++) {
        const el = document.createElement('div');
        el.className = 'firework';
        el.style.left = (20 + Math.random() * 60) + '%';
        el.style.top = (20 + Math.random() * 60) + '%';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
        el.style.setProperty('--dy', (Math.random() - 0.5) * 200 + 'px');
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        el.style.width = el.style.height = (4 + Math.random() * 8) + 'px';
        fw.appendChild(el);
      }
      setTimeout(() => { fw.innerHTML = ''; fw.classList.remove('active'); }, 2000);
    }, { once: true });
  </script>
  <script type="module" src="js/gimmicks/global.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `lol.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>??? — A Love Letter to the Web</title>
  <script>(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})()</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/gimmicks.css">
  <style>
    body { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;overflow:hidden; }
    .spinner {
      font-size: 2rem; font-weight: 800; font-family: var(--font-heading);
      animation: spin 3s linear infinite;
      background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-mid), var(--color-gradient-end));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .note { margin-top: 2rem; font-size: var(--text-sm); color: var(--color-muted); text-align: center; }
    .note a { color: var(--color-primary); }
    body { background: var(--color-base); animation: hue-shift 10s linear infinite; }
    @keyframes hue-shift { to { filter: hue-rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner">You found the secret page!</div>
  <p class="note">How did you find this? Seriously.<br><a href="hub.html">← Back to sanity</a></p>
  <script type="module" src="js/gimmicks/global.js"></script>
</body>
</html>
```

- [ ] **Step 4: Verify** — Open `/404.html`, `/secret.html`, `/lol.html` directly. Chain links drift, credits scroll, spinner spins with hue shift.

- [ ] **Step 5: Commit**

```bash
git add 404.html secret.html lol.html
git commit -m "feat: add hidden pages — 404 with chain links, secret credits scroll, lol spinner"
```

---

## Group H: Seasonal & Speed Run

### Task 11: Seasonal Effects + Speed Run Timer

**Files:**
- Create: `js/gimmicks/speedrun.js`
- Modify: `js/gimmicks/global.js` — add seasonal checks

- [ ] **Step 1: Add seasonal checks to the end of `js/gimmicks/global.js`** (before the export):

```js
// ─── Seasonal Effects ───────────────────────────────────────
try {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  // December snowfall
  if (month === 11) {
    if (!sessionStorage.getItem('snowDismissed')) {
      const snowContainer = document.createElement('div');
      snowContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
      snowContainer.id = 'snow';
      for (let i = 0; i < 25; i++) {
        const flake = document.createElement('div');
        const size = 3 + Math.random() * 6;
        flake.style.cssText = `
          position:absolute; width:${size}px; height:${size}px; background:white;
          border-radius:50%; opacity:${0.3 + Math.random() * 0.5};
          left:${Math.random() * 100}%; top:-10px;
          animation: snowfall ${5 + Math.random() * 10}s linear ${Math.random() * 5}s infinite;
        `;
        snowContainer.appendChild(flake);
      }
      const dismiss = document.createElement('button');
      dismiss.textContent = '❄️ ×';
      dismiss.style.cssText = 'position:fixed;top:0.5rem;right:0.5rem;z-index:9999;background:var(--color-surface);border:1px solid var(--color-border);border-radius:1rem;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.75rem;color:var(--color-muted);pointer-events:auto;';
      dismiss.addEventListener('click', () => { snowContainer.remove(); dismiss.remove(); sessionStorage.setItem('snowDismissed', '1'); });
      document.body.appendChild(snowContainer);
      document.body.appendChild(dismiss);

      const snowStyle = document.createElement('style');
      snowStyle.textContent = '@keyframes snowfall { to { transform: translateY(110vh) translateX(20px); } }';
      document.head.appendChild(snowStyle);
    }
  }

  // April Fools
  if (month === 3 && day === 1) {
    document.documentElement.style.fontFamily = "'Comic Sans MS', cursive";
    const logo = document.querySelector('.page-header__logo, .logo');
    if (logo) logo.textContent = '✦ Web Letter (Professional Edition™)';
    console.log('%c🤡 April 1st detected. All fonts upgraded to Comic Sans Professional™.', 'font-size:14px;');
  }

  // New Year fireworks
  if (month === 0 && day === 1 && !sessionStorage.getItem('nyDone')) {
    sessionStorage.setItem('nyDone', '1');
    const fw = document.createElement('div');
    fw.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    const colors = ['#646cff','#a78bfa','#f472b6','#34d399','#fbbf24'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;width:6px;height:6px;border-radius:50%;background:${colors[i%colors.length]};left:${20+Math.random()*60}%;top:${20+Math.random()*60}%;opacity:0;animation:ny-burst 1.5s ease-out ${Math.random()*0.8}s forwards;`;
      fw.appendChild(p);
    }
    document.body.appendChild(fw);
    const s = document.createElement('style');
    s.textContent = '@keyframes ny-burst{0%{transform:scale(0);opacity:1}100%{transform:scale(1) translate('+(Math.random()*200-100)+'px,'+(Math.random()*200-100)+'px);opacity:0}}';
    document.head.appendChild(s);
    setTimeout(() => fw.remove(), 3000);
  }
} catch {}

// ─── Speed Run (loaded via URL param) ───────────────────────
try {
  if (new URLSearchParams(location.search).has('speedrun')) {
    import('./speedrun.js').catch(() => {});
  }
} catch {}
```

- [ ] **Step 2: Create `js/gimmicks/speedrun.js`**

```js
/**
 * Speed run timer — tracks visits to all 12 pages.
 * Activated by adding ?speedrun=true to any URL.
 */

const PAGES = [
  'index.html', 'hub.html',
  'scroll-animations.html', 'popover-dialog.html', 'css-art.html',
  'container-queries.html', 'view-transitions.html', 'houdini.html',
  'has-selector.html', 'cascade-layers.html',
  'playground.html', 'components.html',
];

// Start timer if not already running
if (!sessionStorage.getItem('speedrunStart')) {
  sessionStorage.setItem('speedrunStart', String(Date.now()));
  sessionStorage.setItem('speedrunVisited', '[]');
}

// Record this page
const current = location.pathname.split('/').pop() || 'index.html';
const visited = JSON.parse(sessionStorage.getItem('speedrunVisited') || '[]');
if (!visited.includes(current)) {
  visited.push(current);
  sessionStorage.setItem('speedrunVisited', JSON.stringify(visited));
}

// Create timer UI
const timer = document.createElement('div');
timer.style.cssText = `
  position: fixed; top: 0.5rem; right: 0.5rem; z-index: 9999;
  background: var(--color-surface); border: 1px solid var(--color-primary);
  border-radius: 0.5rem; padding: 0.4rem 0.8rem;
  font-family: var(--font-code); font-size: 0.75rem; color: var(--color-primary);
`;
document.body.appendChild(timer);

const startTime = parseInt(sessionStorage.getItem('speedrunStart'), 10);

function updateTimer() {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const v = JSON.parse(sessionStorage.getItem('speedrunVisited') || '[]');
  timer.textContent = `⏱ ${elapsed}s — ${v.length}/${PAGES.length} pages`;

  if (v.length >= PAGES.length) {
    timer.style.borderColor = '#34d399';
    timer.style.color = '#34d399';
    timer.innerHTML = `🏆 Speedrun complete! ${elapsed}s<br><span style="font-size:0.65rem;color:var(--color-muted)">Now try it in prefers-reduced-motion.</span>`;
    sessionStorage.removeItem('speedrunStart');
    sessionStorage.removeItem('speedrunVisited');
    return;
  }

  requestAnimationFrame(updateTimer);
}

updateTimer();

// Propagate speedrun param to all navigation links
document.querySelectorAll('a[href]').forEach(a => {
  if (a.href.includes(location.origin) && !a.href.includes('speedrun')) {
    const url = new URL(a.href);
    url.searchParams.set('speedrun', 'true');
    a.href = url.toString();
  }
});
```

- [ ] **Step 3: Verify** — Open `http://localhost:8080/?speedrun=true`. Timer appears. Navigate to other pages — timer persists, counter increments. Visit all 12 → completion message.

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/speedrun.js js/gimmicks/global.js
git commit -m "feat: add seasonal effects (snow, april fools) and speed run timer"
```

---

## Final Verification

After all groups are complete:

- [ ] Run the Playwright screenshot script to capture all 12 pages + 3 hidden pages
- [ ] Verify no console errors on any page
- [ ] Test theme toggle persistence across pages
- [ ] Test keyboard shortcuts on hub and zone pages
- [ ] Test guestbook dialog open/close
- [ ] Verify treasure hunt comments in source of all 12 pages
- [ ] Test `?speedrun=true` across 3+ pages
- [ ] Push to GitHub

```bash
git push origin main
```
