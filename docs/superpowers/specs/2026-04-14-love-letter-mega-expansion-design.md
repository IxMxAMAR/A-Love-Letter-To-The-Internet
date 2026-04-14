# Love Letter to the Web — Mega Expansion Design Spec

**Date:** 2026-04-14
**Project:** c:\ComfyUI\RD\HTML
**Approach:** Layered Cake — unified spec, executed in sequential layers with checkpoints
**Priority:** Bugs → Features → Games
**Constraints:** Libraries allowed when they make things 10x better, otherwise vanilla HTML/CSS/JS

---

## Architecture Overview

The expansion adds ~130+ new features across 4 layers, 7 new pages, 3 site-wide systems, and 15 arcade games. All additions follow the existing patterns:

- **Progressive enhancement** — core content works without JS
- **Modular gimmicks** — each wrapped in try-catch, non-blocking
- **Design tokens** — oklch colors, CSS custom properties
- **Zero-framework default** — libraries only where justified (physics, canvas export)
- **Accessibility-first** — keyboard nav, ARIA, reduced motion respect

### New File Structure

```
HTML/
├── arcade/                    # NEW — game pages
│   ├── snake.html
│   ├── breakout.html
│   ├── pong.html
│   ├── asteroids.html
│   ├── flappy.html
│   ├── selector-duel.html
│   ├── layout-architect.html
│   ├── animation-timeline.html
│   ├── cascade-puzzle.html
│   ├── has-detective.html
│   ├── roulette.html
│   ├── type-racer.html
│   ├── zen-garden.html
│   ├── debug.html
│   └── boss-rush.html
├── arcade.html                # NEW — arcade hub
├── lab.html                   # NEW — advanced CSS playground
├── achievements.html          # NEW — trophy room
├── glossary.html              # NEW — searchable CSS dictionary
├── changelog.html             # NEW — site evolution meta page
├── css/
│   ├── arcade.css             # NEW — arcade hub styles
│   ├── arcade-shared.css      # NEW — shared game UI (pause, HUD, scores)
│   ├── lab.css                # NEW — lab page styles
│   ├── achievements.css       # NEW — achievements page styles
│   ├── glossary.css           # NEW — glossary styles
│   ├── changelog.css          # NEW — changelog styles
│   └── ... (existing files)
├── js/
│   ├── achievements.js        # NEW — achievement engine
│   ├── audio.js               # NEW — centralized audio engine
│   ├── state.js               # NEW — unified state manager
│   ├── arcade/                # NEW — game logic per game
│   │   ├── snake.js
│   │   ├── breakout.js
│   │   ├── pong.js
│   │   ├── asteroids.js
│   │   ├── flappy.js
│   │   ├── selector-duel.js
│   │   ├── layout-architect.js
│   │   ├── animation-timeline.js
│   │   ├── cascade-puzzle.js
│   │   ├── has-detective.js
│   │   ├── roulette.js
│   │   ├── type-racer.js
│   │   ├── zen-garden.js
│   │   ├── debug.js
│   │   └── boss-rush.js
│   └── ... (existing files)
└── ... (existing files)
```

### Dependency Decisions

| Need | Solution | Why |
|------|----------|-----|
| Physics (gravity mode, game collisions) | matter.js (~30KB) | Hand-rolling 2D physics is wasteful; matter.js is tiny and battle-tested |
| Canvas export (Lab PNG export) | html2canvas (~40KB) | No reasonable vanilla alternative for DOM-to-image |
| Game loop | Custom requestAnimationFrame loop | Simple enough to hand-roll, no library needed |
| Audio synthesis | Web Audio API (native) | Already used for chiptune, just expand it |
| Everything else | Vanilla JS | Framework overhead not justified |

---

## Layer 0: Full Audit & Bug Fixes

### Audit Scope

Systematically test every page (15), every gimmick (~80), every interaction across the entire site. Log all issues, fix everything.

#### Per-Page Checklist

**All Pages:**
- [ ] No console errors on load
- [ ] No console errors during interaction
- [ ] Theme toggle works and persists
- [ ] Keyboard shortcuts fire correctly (?, t, h, p, c, 1-8)
- [ ] Custom context menu appears and all options work
- [ ] Navigation links resolve correctly
- [ ] Responsive layout at 375px, 768px, 1024px, 1440px
- [ ] `prefers-reduced-motion` disables animations
- [ ] Tab order is logical
- [ ] Skip-to-content link works
- [ ] ARIA attributes present on interactive elements
- [ ] Scroll-driven animations trigger at correct scroll positions

**index.html (Landing):**
- [ ] Typewriter effect fires on first visit
- [ ] Visitor counter increments and formats correctly
- [ ] Guestbook dialog opens, displays entries, accepts submission
- [ ] Hampster dance fires on triple-click "Under Construction"
- [ ] Hypermedia font cycle on hover
- [ ] CSS3 card flip on click (both sides render)
- [ ] Card 3D tilt follows mouse
- [ ] Dark mode card toggles theme
- [ ] Flex centering popover on triple-click
- [ ] Chiptune button starts/stops audio
- [ ] Era sections have correct visual styling

**hub.html (Observatory):**
- [ ] All 8 zone nodes visible and clickable
- [ ] Constellation SVG lines render
- [ ] Hover glow animations work
- [ ] Links navigate to correct zones

**playground.html:**
- [ ] Editor accepts input and renders in preview
- [ ] All presets load correctly
- [ ] URL hash sharing works (encode + decode)
- [ ] Share button copies URL
- [ ] Clear button resets editor
- [ ] Line numbers update with content
- [ ] Night owl toast (test by spoofing time)
- [ ] `!important` warning toast (max 3)
- [ ] `display: none` fade effect
- [ ] `color: red` sarcastic toast
- [ ] `rotate(180deg)` spin effect
- [ ] Writer's block timer (10s empty)
- [ ] Tab → spaces conversion

**components.html:**
- [ ] All 8 component types render correctly
- [ ] Popovers open/close
- [ ] Modals open/close (click + Esc)
- [ ] Toasts appear and auto-dismiss
- [ ] Accordions expand/collapse
- [ ] Tabs switch content
- [ ] Toggles switch state
- [ ] Tooltips appear on hover
- [ ] Dark mode toggle syncs with site theme
- [ ] Filter tabs work (if present)
- [ ] Copy code buttons work

**zones/* (All 8 zones):**
- [ ] Zone-colored scroll progress bar renders
- [ ] Chapter numerals (I, II, III) appear at sections
- [ ] Back/Hub/Next navigation works
- [ ] Zone counter shows correct "Zone X of 8"
- [ ] Zone-specific demos function:
  - scroll-animations: scroll triggers fire
  - popover-dialog: popovers + dialogs open/close
  - css-art: all 5 toggles work, CSS readout updates, clip-path+radius conflict handled
  - container-queries: resize demos respond
  - view-transitions: transitions play
  - houdini: paint worklets render (or graceful fallback)
  - has-selector: form validation demos respond
  - cascade-layers: layer demos show correct cascade resolution

**Special Pages:**
- [ ] 404.html renders with correct styling
- [ ] lol.html spinning gradient text works
- [ ] secret.html scrolling credits play

**Global Systems:**
- [ ] Idle detection triggers at 60s
- [ ] Scroll velocity CSS variable updates
- [ ] `secrets()` console command outputs per-page list
- [ ] Seasonal effects: verify date detection logic (December snow, April fools, New Year)
- [ ] Speedrun mode: `?speedrun=true` shows timer, tracks pages, completes at 12
- [ ] Dynamic SVG favicon changes per page
- [ ] Tab title changes on visibility hidden, restores on visible
- [ ] Reduced motion badge shows for motion-preference users

### Known Potential Issues

1. **Typewriter clip-path** — No fallback for browsers without clip-path animation support. Fix: add feature detection, fall back to opacity reveal.
2. **Houdini paint worklets** — Fail silently on unsupported browsers. Fix: add `CSS.paintWorklet` check, show fallback gradient + "Your browser doesn't support Houdini" note.
3. **CSS Art toggle conflict** — Both clip-path AND border-radius checked hides both. Fix: instead of hiding, apply a blended result or show a tooltip explaining the conflict.
4. **Mobile context menu** — Right-click menu doesn't work on touch. Fix: implement long-press detection (Layer 1 addresses this).
5. **Tab title rapid switching** — May not restore correctly. Fix: debounce visibility change handler.
6. **Speedrun page count** — Hardcoded to 12 pages. Fix: make dynamic based on actual page list (especially since we're adding pages).

### Deliverable

Bug report document with categorized issues (Critical / Major / Minor / Enhancement). All Critical and Major fixed. Minor fixed where straightforward. Enhancement items feed into Layer 1.

---

## Layer 1: Core Enhancements — Animations, Polish & New Gimmicks

### 1.1 Animation Upgrades

**Page Load Choreography**
Every page gets an orchestrated entrance sequence instead of generic fade-in:
- Header slides down from above (translateY + opacity, 300ms)
- Hero content scales in from 0.95 (200ms delay)
- Secondary elements cascade with 75ms stagger
- Accent elements (lines, dots, glows) fade in last (500ms delay)
- Use `@starting-style` where possible for display-triggered animations

**Scroll-Driven Parallax**
Landing page era sections get depth parallax:
- Background elements move at 0.3x scroll speed
- Foreground accents move at 1.2x
- Uses `animation-timeline: scroll()` with `animation-range` for per-section control
- Parallax disabled when `prefers-reduced-motion: reduce`

**Micro-Interactions**
Apply to all interactive elements site-wide:
- **Buttons:** Ripple effect on click (CSS radial-gradient + animation), subtle scale on hover (1.02)
- **Links:** Animated underline (scaleX from 0 to 1 on hover, left-to-right)
- **Cards:** Lift effect (translateY -4px + shadow expansion on hover)
- **Toggles:** Spring-physics feel (overshoot + settle via cubic-bezier)
- **Inputs:** Border glow on focus (box-shadow transition)

**Text Effects**
- **Gradient shimmer** on h1 headings — animated `background-position` on `background-clip: text`
- **Letter-by-letter reveal** on zone titles — `@keyframes` with `clip-path: inset()` per character using stagger delays
- **Glitch effect** on 404 page — `clip-path` slicing + color channel offset + random `transform: skew()`
- **Scramble effect** — Random characters resolve into real text (for achievement unlocks)

**Background Ambient Animations**
Per-page subtle background effects:
- Landing: floating gradient orbs (CSS radial-gradient with translate animation)
- Hub: star twinkle (opacity pulse on scattered dots)
- Playground: subtle grid pulse (background-size animation on repeating-linear-gradient)
- Zones: zone-colored aurora (conic-gradient rotation, very slow)
- All: respect reduced-motion

**View Transition Upgrades**
Upgrade page navigation to use View Transitions API:
- Shared element transitions for navigation header (morph between pages)
- Zone-to-zone transitions use zone accent color as the wipe color
- Hub → Zone transitions: zone node expands to fill viewport
- Fallback: standard navigation for unsupported browsers

**Cursor Trail**
Optional sparkle/glow trail following cursor:
- Canvas overlay for performance (not DOM elements)
- Particle system: 10-15 particles with fade + gravity
- Toggle via keyboard shortcut (Shift+C) or settings
- Disabled by default, preference stored in state manager
- Disabled on mobile and reduced-motion

**Loading States**
- Skeleton screen placeholders for zone content
- CSS-only loading spinner using conic-gradient animation
- Transition from skeleton → content uses `@starting-style`

### 1.2 New Gimmicks (~25)

**Konami Code**
- Listen for: ↑↑↓↓←→←→BA
- Effect: Page inverts colors (CSS `filter: invert(1) hue-rotate(180deg)`), confetti rain (canvas), chiptune plays
- Duration: 10 seconds, then gracefully reverts
- Achievement: "The Code" unlocked

**Pixel Rain**
- Matrix-style falling characters in monospace green
- Canvas overlay, characters are CSS property names (`margin`, `padding`, `display`, etc.)
- Triggered by typing "matrix" anywhere on the page
- Achievement: "Red Pill" unlocked

**Sound Effects System**
- Micro-sounds for: button clicks (soft pop), toggle switches (click), card flips (whoosh), navigation (subtle swoosh), achievement unlock (chime)
- All generated via Web Audio API oscillators (no audio files)
- Master mute toggle in corner (speaker icon)
- Preference persisted in state manager
- Default: OFF (opt-in, not opt-out)

**Achievement System** (see Layer 2 for full spec)
- Toast notifications on unlock: slide in from right, icon + title + description, auto-dismiss 4s
- Sound: achievement chime
- Console log: "Achievement unlocked: [name]"

**ASCII Art Source Comments**
- Every HTML file gets ASCII art in comments:
  - File header with decorative border
  - Section dividers with relevant art (e.g., a keyboard for the keyboard shortcuts section)
  - Hidden messages: "If you're reading this, you're my kind of person"
  - Credits in source of every page

**Magnetic Elements**
- Navigation links and CTA buttons have magnetic pull
- When cursor within 80px, element translates toward cursor (max 8px offset)
- Uses mousemove + CSS transform
- Disabled on touch devices

**Typewriter Console Upgrade**
- `secrets()` output styled with green-on-black typewriter effect
- Each line appears with 50ms delay
- Sound: typewriter key clicks (Web Audio)
- New command: `help()` lists all console commands

**Page Fingerprint**
- On each visit, generate a unique CSS art piece
- Seed: timestamp + random
- Algorithm: random border-radius, gradient angles, box-shadow offsets, hue rotation
- Displayed as a small badge in footer: "Your visit fingerprint"
- Click to expand full-size

**Gravity Mode**
- Trigger: press G or shake device (DeviceMotion API)
- All `.gravity-target` elements get matter.js physics bodies
- Elements fall, bounce off viewport edges
- Press G again or wait 5s to restore
- Achievement: "Newton's Revenge"

**Rainbow Scroll**
- As user scrolls, `--hue` CSS variable rotates 0→360
- Applied as subtle background hue: `oklch(0.15 0.01 var(--hue))`
- Only visible in dark mode (too subtle in light)
- Uses scroll event throttled to rAF

**Copy-Paste Surprise**
- Listen for `copy` event on document
- Append to clipboard: `\n\n/* Copied from A Love Letter to the Web — https://... */`
- Only on text content, not code blocks (code blocks should copy clean)

**Print Stylesheet Easter Egg**
- `@media print` styles:
  - All backgrounds become white
  - Hidden `.print-only` message appears: "You printed the internet. You absolute legend. 🖨️"
  - QR code to the site URL (CSS-generated or inline SVG)
  - Page breaks between sections

**Double-Click Word Definitions**
- Double-clicking recognized CSS terms shows a tooltip
- Dictionary of ~50 terms (flex, grid, cascade, specificity, etc.)
- Tooltip: term, one-line definition, link to glossary page
- Uses `dblclick` event + `window.getSelection()`

**Ambient Music Zones**
- Each zone gets a unique ambient audio atmosphere
- Generated via Web Audio API: zone-specific oscillator combinations
  - Scroll animations: rising/falling tones
  - CSS art: creative chimes
  - Houdini: electronic/synthetic
  - etc.
- Toggle button in zone header
- Default: OFF
- Fades in/out on zone entry/exit

**Visitor Milestone Celebrations**
- Visit counter (already exists) triggers special events:
  - 10th visit: "Welcome back, regular!" toast + subtle confetti
  - 50th visit: "Power user detected" + page border glow
  - 100th visit: "Centurion" achievement + special animation
  - 1000th visit: "Legendary" + unique page fingerprint in gold

**Drag-to-Reorder Components**
- Components page cards become draggable
- Native HTML Drag and Drop API
- Drop zones highlight on dragover
- Order persists in localStorage
- Reset button to restore default order

**Screenshot Mode**
- Press Shift+S to toggle
- Hides: navigation, scroll progress bar, footer, floating UI
- Adds subtle vignette border
- Shows "Screenshot mode — press Shift+S to exit" toast
- `document.documentElement.classList.toggle('screenshot-mode')`

**Focus Mode**
- Press F to toggle
- Everything outside current viewport section dims to 20% opacity
- Current section gets subtle border glow
- Scroll snaps to sections in focus mode
- ESC also exits
- Achievement: "In the Zone"

**Collaborative Cursor Ghosts**
- Pre-recorded mouse movement paths (3-4 paths per page)
- Replay as translucent cursor icons with randomized start delays
- Each ghost has a random username label ("visitor_42", "css_lover", etc.)
- Subtle, non-intrusive — 30% opacity, no interaction
- Toggle: off by default, enabled via settings or console command

**Custom Text Selection**
- `::selection` and `::-moz-selection` per zone
- Colors match zone accent: e.g., scroll-animations zone = blue selection, css-art = pink
- Global pages: site accent color (oklch purple)

**Scroll Snap on Landing**
- Landing page era sections get `scroll-snap-type: y mandatory`
- Each era section: `scroll-snap-align: start`
- Smooth snapping to era boundaries
- Disabled on mobile (can feel restrictive on small screens)

**Dark Mode Circular Reveal**
- Theme toggle triggers `clip-path: circle()` animation
- Circle expands from toggle button position to cover viewport
- New theme revealed underneath
- Uses View Transitions API with `::view-transition-old/new` pseudo-elements
- Fallback: instant swap for unsupported browsers

**Touch Gestures (Mobile)**
- Swipe left/right between zones (zone navigation)
- Pinch-to-zoom on CSS art playground previews
- Pull-down-to-refresh style easter egg: pulling down on landing page shows "reloading the web since 1991"
- Uses touch events, not a library

**Breadcrumb Trail**
- Visual indicator in hub showing visited pages this session
- Hub constellation: visited zone nodes get a checkmark overlay + brighter glow
- Mini breadcrumb bar on all pages showing: Home → Hub → [Current]
- Session-based (sessionStorage), not persistent

**Time Spent Footer**
- Small, unobtrusive footer text: "You've been exploring for 4m 32s"
- Updates every second via `setInterval`
- Stored in sessionStorage (resets on close)
- At milestones: "5 minutes in — you're hooked!" style messages
- Achievement at 30 min: "Deep Diver"

### 1.3 Polish

**Consistent Hover States**
- Audit every `<a>`, `<button>`, `[role="button"]`, interactive element
- Standard hover pattern: subtle scale (1.02) + color shift + cursor pointer
- Standard focus pattern: visible outline (2px solid accent, 2px offset) for keyboard users
- Standard active pattern: scale(0.98) for tactile press feeling

**Mobile Long-Press Menu**
- Replaces desktop right-click context menu on touch devices
- `touchstart` + 500ms timeout triggers menu
- Same options as desktop context menu
- Positioned at touch point
- Dismissed on touch outside

**Smooth Scroll**
- `html { scroll-behavior: smooth }` globally
- Anchor links get proper `scroll-margin-top` to account for sticky header
- "Back to top" button appears after scrolling past first viewport

**Playground UX Improvements**
- CSS property auto-suggest: typing triggers a dropdown of matching properties
- Syntax error highlighting: basic regex-based detection for common errors (missing semicolons, unclosed brackets)
- Line count in status bar
- Character count
- "Reset to preset" button per preset

**Component Page Search**
- Filter input at top of components page
- Real-time filtering as user types
- Matches component name and description
- No results state: "No components match — try a different term"
- Keyboard: `/` focuses the filter input

---

## Layer 2: Major Features — New Pages & Systems

### 2.1 New Pages

#### The Arcade (`/arcade.html`)

**Purpose:** Hub page for all 15 games, styled as a retro arcade.

**Layout:**
- Full-screen dark background with CRT scanline overlay (CSS repeating-linear-gradient)
- "INSERT COIN" entrance animation (text flicker + scale-in)
- Game cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: game title, category badge (Retro/Puzzle/Wild), high score, play button
- Neon glow on card hover (box-shadow with saturated colors)
- Category filter tabs at top: All / Retro / Puzzles / Wild

**Navigation:**
- Added to main nav as 5th item: Home | Hub | Playground | Components | **Arcade**
- Keyboard shortcut: `a`

**High Score Display:**
- Leaderboard sidebar (desktop) or expandable panel (mobile)
- Shows top 5 scores per game from localStorage
- "Reset Scores" button with confirmation

#### The Lab (`/lab.html`)

**Purpose:** Advanced CSS playground — the shape builder on steroids.

**Layout:**
- Split pane: controls on left (40%), live preview on right (60%)
- Control panel sections (collapsible):
  - **Shape:** width, height, border-radius (8-value), clip-path (presets + custom)
  - **Color:** background type (solid/gradient/conic), color pickers, gradient angle
  - **Effects:** box-shadow (multi-layer), outline, filter (blur, brightness, contrast, hue-rotate, saturate)
  - **Transform:** rotate, scale, skew, translate, perspective
  - **Animation:** select keyframe preset or custom, duration, easing, iteration
  - **Blend:** mix-blend-mode, opacity, backdrop-filter
- Input types: sliders for numeric, color pickers for colors, dropdowns for enums, toggles for on/off

**Features:**
- **Randomize button** — Generates random values for all properties, applies with transition
- **Presets gallery** — 20 pre-built impressive CSS art pieces loadable as starting points
- **Save creation** — Name it, store in localStorage gallery
- **Gallery view** — Grid of saved creations, click to load
- **Fork** — Load a preset/saved item and modify it (saves as new)
- **Export as PNG** — html2canvas renders preview div to downloadable PNG
- **Share URL** — Base64 encode all property values into URL hash
- **Challenge mode** — Shows target shape, user tries to match it with controls
  - 10 challenges, difficulty progressive
  - Pixel-diff scoring (lower = better match)
  - Timer optional

#### Achievements Page (`/achievements.html`)

**Purpose:** Trophy room showing all discovered easter eggs and completed challenges.

**Layout:**
- Header with total completion percentage (animated ring chart, CSS conic-gradient)
- Category sections:
  - **Explorer** — Page visits, zone completions, time spent
  - **Hacker** — Easter eggs found, console commands used, source viewed
  - **Artist** — CSS art created, lab exports, playground uses
  - **Speedrunner** — Best times, all-pages run, 100% run
  - **Gamer** — Games played, high scores, puzzles solved
- Each achievement: icon, title, description, date unlocked
- Locked achievements: grayed out with hint text ("Try triple-clicking something unusual...")
- Shareable achievement card: canvas-rendered image with username input, stats, badges

**Achievement List (50 total):**

| Category | Achievement | Trigger |
|----------|-------------|---------|
| Explorer | First Steps | Visit any page |
| Explorer | Tourist | Visit all 5 main pages |
| Explorer | Cartographer | Visit all 8 zones |
| Explorer | Completionist | Visit all pages including arcade |
| Explorer | Night Owl | Visit between 2-5 AM |
| Explorer | Deep Diver | Spend 30+ minutes on site |
| Explorer | Regular | 10th visit |
| Explorer | Power User | 50th visit |
| Explorer | Centurion | 100th visit |
| Hacker | Source Reader | Use View Source (detected via context menu) |
| Hacker | Console Cowboy | Use secrets() command |
| Hacker | The Code | Enter Konami Code |
| Hacker | Red Pill | Trigger Matrix pixel rain |
| Hacker | Keyboard Warrior | Use 10+ different keyboard shortcuts |
| Hacker | Theme Switcher | Toggle theme 5 times |
| Hacker | Secret Finder | Visit lol.html or secret.html |
| Hacker | Inspector | Use browser DevTools (detected via resize/debugger) |
| Artist | First Stroke | Create anything in the Lab |
| Artist | Collector | Save 5 Lab creations |
| Artist | Remixer | Fork a preset in the Lab |
| Artist | Shape Shifter | Use all 5 toggles in CSS Art zone |
| Artist | Playground Regular | Use 5 different playground presets |
| Artist | Exporter | Export a Lab creation as PNG |
| Speedrunner | Quick Visit | Complete speedrun under 5 minutes |
| Speedrunner | Speed Demon | Complete speedrun under 2 minutes |
| Speedrunner | Lightning | Complete speedrun under 1 minute |
| Speedrunner | 100% | Visit every page in speedrun mode |
| Gamer | Arcade Visitor | Play any arcade game |
| Gamer | Arcade Regular | Play 5 different games |
| Gamer | Arcade Master | Play all 15 games |
| Gamer | High Scorer | Set a high score in any game |
| Gamer | Snake Charmer | Score 50+ in CSS Snake |
| Gamer | Cascade Breaker | Complete all Breakout levels |
| Gamer | Selector Sensei | Complete all 30 Selector Duel levels |
| Gamer | Layout Master | 3-star all Layout Architect levels |
| Gamer | Bug Squasher | Fix all 25 bugs in Debugging Game |
| Gamer | Boss Slayer | Defeat all 5 bosses in Boss Rush |
| Gamer | Speed Typer | 60+ WPM in Type Racer |
| Gamer | Daily Player | Complete 3 daily challenges |
| Special | Hampster Fan | Trigger hampster dance |
| Special | Newton's Revenge | Use gravity mode |
| Special | In the Zone | Use focus mode for 5+ minutes |
| Special | DJ | Play chiptune for 2+ minutes |
| Special | Print Legend | Print a page |
| Special | Gesture Master | Use all touch gestures on mobile |
| Special | Seasonal | Experience a seasonal effect |
| Special | Guestbook Signer | Submit a guestbook entry |
| Special | Screenshot Pro | Use screenshot mode |
| Special | Patience | Trigger idle mode |
| Special | The End | View the credits page to completion |

#### Glossary Page (`/glossary.html`)

**Purpose:** Searchable dictionary of CSS properties and concepts demonstrated on the site.

**Layout:**
- Search input at top with real-time filtering
- Alphabetical sections with sticky letter headers
- Each entry: term, category badge, one-line definition, "See it in action" link to relevant zone/page
- ~80 terms covering all CSS concepts demonstrated across the site
- "Random term" button that scrolls to and highlights a random entry
- Keyboard: `/` focuses search, arrow keys navigate entries

**Categories:** Layout, Color, Animation, Selector, Typography, Shape, Effect, API

#### Changelog Page (`/changelog.html`)

**Purpose:** Meta page showing the site's own evolution, styled like a git log.

**Layout:**
- Vertical timeline (similar to landing page but for the site itself)
- Each entry: version, date, changes list, visual diff
- "Time Travel" feature: clicking an era applies a CSS class that visually regresses the page
  - v0.1: basic HTML, Times New Roman, blue links
  - v0.5: first CSS, table layouts
  - v1.0: modern design, current state
  - v2.0: the mega expansion (current)
- Animated transitions between eras
- Fun commit messages ("Fixed centering. Again.", "Added 47 gimmicks. Went too far? Never.")

### 2.2 Site-Wide Systems

#### Achievement Engine (`js/achievements.js`)

**Architecture:**
```
AchievementEngine
├── .definitions[]     — Static list of all 50 achievements
├── .unlocked[]        — User's unlocked achievements (from state manager)
├── .check(event)      — Evaluate if event triggers any achievement
├── .unlock(id)        — Mark achievement as unlocked, fire toast + sound
├── .getProgress()     — Return completion stats per category
├── .subscribe(fn)     — Event listener for unlock events
└── .export()          — Generate shareable achievement card data
```

**Event System:**
- Listens on a custom event bus for: `page:visit`, `gimmick:trigger`, `game:complete`, `game:score`, `console:command`, `theme:toggle`, `lab:create`, `lab:export`, `speedrun:complete`
- Each achievement definition has a `check(state, event)` function
- Batch evaluation: single event can trigger multiple achievements

**Integration Points:**
- Global.js fires `page:visit` on load
- Each gimmick fires `gimmick:trigger` with gimmick name
- Game engines fire `game:complete` and `game:score`
- State manager fires change events

#### Audio Engine (`js/audio.js`)

**Architecture:**
```
AudioEngine
├── .context           — Single AudioContext (created on first user interaction)
├── .master            — GainNode for master volume
├── .channels{}        — Named gain nodes: music, sfx, ambience
├── .play(name, opts)  — Play a named sound
├── .loop(name, opts)  — Start a looping sound
├── .stop(name)        — Stop a playing sound
├── .setVolume(ch, v)  — Set channel volume (0-1)
├── .mute()            — Toggle master mute
├── .sounds{}          — Registry of sound generators
└── .prefs             — Persisted preferences from state manager
```

**Sound Library (all Web Audio API generated, no files):**
- `click` — Short sine wave blip (50ms, 800Hz → 600Hz)
- `toggle` — Two-tone click (40ms, 1000Hz + 1200Hz)
- `whoosh` — Noise burst with bandpass filter sweep (200ms)
- `chime` — Achievement unlock (C-E-G arpeggio, 400ms)
- `error` — Low buzz (100ms, 200Hz sawtooth)
- `pop` — Bubble pop (30ms, 1400Hz sine with fast decay)
- `type` — Typewriter key (20ms noise burst)
- `laser` — Game laser (100ms, 2000Hz → 200Hz sweep)
- `explosion` — Game explosion (300ms noise with decay)
- `powerup` — Ascending arpeggio (C-E-G-C, 300ms)
- Zone ambience: per-zone oscillator combinations (continuous, low-volume)
- Chiptune: expand existing chiptune.js to use audio engine

**Defaults:** All audio OFF. User must opt-in via mute toggle or settings.

#### State Manager (`js/state.js`)

**Architecture:**
```
StateManager
├── .data{}            — In-memory state mirror
├── .get(key)          — Read value
├── .set(key, value)   — Write value (auto-persists)
├── .subscribe(key,fn) — Listen for changes to a key
├── .emit(event, data) — Fire event on the bus
├── .on(event, fn)     — Listen for events
├── .migrate()         — Run schema migrations on load
├── .export()          — Export full state as JSON
├── .reset()           — Clear all state (with confirmation)
└── .version           — Schema version number
```

**State Schema (v1):**
```json
{
  "version": 1,
  "theme": "dark",
  "audio": { "master": 0.5, "music": 0.5, "sfx": 0.7, "ambience": 0.3, "muted": true },
  "visits": { "count": 0, "pages": {}, "firstVisit": null, "lastVisit": null },
  "achievements": { "unlocked": {} },
  "speedrun": { "best": {}, "current": null },
  "games": { "highScores": {} },
  "lab": { "creations": [], "lastOpen": null },
  "preferences": { "cursorTrail": false, "ghosts": false, "focusMode": false, "scrollSnap": true },
  "session": { "startTime": null, "pagesThisSession": [] }
}
```

**Migration:** On load, check `state.version`. If lower than current, run migration functions sequentially. This ensures saved data survives across site updates.

### 2.3 Enhanced Navigation

**Updated Nav Structure:**
- Main nav: Home | Hub | Playground | Components | **Arcade** | **Lab**
- Keyboard shortcuts updated: `a` = Arcade, `l` = Lab, `g` = Glossary
- Achievements accessible via trophy icon in nav corner (not a main nav item — discoverable)

**Speedrun v2:**
- Categories: Any% (main pages only), All Zones (hub + 8 zones), 100% (every page including arcade)
- Category select at speedrun start
- Split times per page shown in timer
- Ghost comparison against personal best
- Leaderboard per category

**Journey Mode:**
- New URL param: `?journey=true`
- Guided tour overlay: highlights page sections one at a time
- Narration toasts explain what the user is seeing
- "Next" button advances the tour
- Covers: landing page highlights → hub explanation → one zone demo → playground tutorial → components overview
- Skippable at any point
- Achievement: "Guided Tour" on completion

### 2.4 Build a Shape v2 (CSS Art Zone Upgrade)

**Expanded Controls (15+ properties):**

| Category | Properties |
|----------|-----------|
| Color | background (solid/linear-gradient/radial-gradient/conic-gradient), color pickers, angle slider |
| Shape | width, height, border-radius (8-value blob editor), clip-path (polygon presets + custom) |
| Depth | box-shadow (multi-layer, color + offset + blur + spread), outline, outline-offset |
| Transform | rotate, scale, skewX, skewY, translateX, translateY, perspective |
| Filter | blur, brightness, contrast, saturate, hue-rotate, drop-shadow, invert, sepia |
| Blend | mix-blend-mode dropdown, opacity slider, backdrop-filter |
| Animation | preset keyframes dropdown, duration, easing, iteration count, direction |
| Mask | mask-image (gradient presets), mask-size, mask-position |

**Input Types:**
- Sliders with numeric readout for continuous values
- Color pickers for color values
- Dropdown selects for enum values (blend modes, easing functions)
- Toggle switches for on/off properties
- Multi-layer editors for box-shadow (add/remove layers)

**New Features:**
- **Randomize** — Random values with smooth transition to new state
- **Save to Gallery** — Name + save to localStorage, viewable in Lab
- **Challenge Mode** — 10 target shapes, match them by finding the right property values
  - Visual diff overlay showing match percentage
  - Star rating: 1 star (>70% match), 2 stars (>85%), 3 stars (>95%)
  - Progressive difficulty: early challenges use 2-3 properties, later ones use 8+
- **Copy CSS** — Button copies all active CSS to clipboard
- **Undo/Redo** — History stack for property changes

---

## Layer 3: Games & Interactive Challenges

### 3.1 Retro Arcade Games

#### CSS Snake (`arcade/snake.html`)

**Concept:** Classic Snake where eating food applies CSS properties to the snake's appearance.

**Implementation:**
- Grid-based game board (20x20 cells, CSS Grid)
- Snake segments are `<div>` elements
- Food items are CSS property icons with labels
- Each food eaten adds that CSS property to all snake segments:
  - `border-radius: 50%` — segments become circles
  - `background: linear-gradient(...)` — gradient snake
  - `box-shadow: 0 0 10px` — glowing snake
  - `transform: rotate(45deg)` — diamond segments
  - `filter: blur(1px)` — blurry snake (harder to see!)
  - `opacity: 0.5` — transparent snake (very hard!)
- Score: points per food eaten, combo multiplier for speed
- Controls: Arrow keys + WASD, swipe on mobile
- Speed increases every 5 food items
- Game over: wall collision or self-collision
- High score saved to state manager

#### Breakout: The Cascade (`arcade/breakout.html`)

**Concept:** Breakout where bricks are CSS declarations and breaking them styles the paddle.

**Implementation:**
- Canvas-based rendering for performance
- Paddle: styled div at bottom, responds to mouse/touch/arrow keys
- Ball: circle with box-shadow trail (last 5 positions at decreasing opacity)
- Bricks arranged in rows, each labeled with a CSS declaration
- Breaking a brick applies its CSS to the paddle:
  - `width: 200px` — wider paddle
  - `width: 50px` — narrower (penalty!)
  - `background: red` — color change
  - `border-radius: 50%` — rounded paddle (harder to aim)
  - `opacity: 0.3` — nearly invisible paddle
- 4 levels themed by CSS era:
  - Level 1 (CSS1): font-family, color, text-align — simple properties
  - Level 2 (CSS2): position, z-index, overflow — layout
  - Level 3 (CSS3): transform, transition, animation — modern
  - Level 4 (Modern): container queries, :has(), @layer — cutting edge
- Power-ups: multi-ball (`:is()` selector), shield (`@layer` bottom barrier), wide paddle (`aspect-ratio: 4/1`)

#### Pong: Specificity Wars (`arcade/pong.html`)

**Concept:** Pong with CSS specificity questions determining paddle size.

**Implementation:**
- Canvas-based, classic Pong layout
- Before each rally: specificity question appears
  - "Which has higher specificity: `.nav a` or `#header`?"
  - Multiple choice (A/B/Same)
- Correct answer: paddle grows by 20px (max 200px)
- Wrong answer: paddle shrinks by 20px (min 30px)
- AI opponent difficulty scales with player score
- 15 questions per game, then final score screen
- Question bank: 50 specificity comparisons, randomized

#### Asteroids: `!important` (`arcade/asteroids.html`)

**Concept:** Asteroids where you shoot `!important` declarations with proper selectors.

**Implementation:**
- Canvas-based with rotation + thrust mechanics
- Player ship: cursor arrow icon
- Asteroids: floating CSS declarations with `!important` (text rendered on shapes)
  - Small: `color: red !important`
  - Medium: `margin: 0 !important`
  - Large: `display: none !important`
- Shooting: fires "selector beams"
- Power-ups:
  - `:where()` shield — zero specificity bubble that absorbs one hit
  - `@layer` bomb — clears all asteroids on screen (limited use)
  - `all: unset` — resets player to default state (full health)
- Score: small asteroid = 30pts, medium = 20pts, large = 10pts (harder to dodge but easier to hit)
- Lives: 3, lost on collision
- Difficulty: more + faster asteroids over time

#### Flappy Div (`arcade/flappy.html`)

**Concept:** Flappy Bird where the bird is a styled div and pipes teach CSS.

**Implementation:**
- Canvas or DOM-based (DOM for CSS styling effect)
- Bird: a `<div>` with dynamic CSS that changes each pipe passed
- Pipes: CSS column pairs with gap
- Each pipe pass flashes a CSS fact/tip for 1 second
- Bird CSS changes every 5 pipes (visual progression)
- Difficulty: gap narrows, speed increases
- Score: pipes passed
- Controls: Space/click/tap to flap

### 3.2 CSS Puzzle Games

#### Selector Duel (`arcade/selector-duel.html`)

**Concept:** Write the shortest CSS selector to match highlighted elements.

**Implementation:**
- DOM visualization panel showing an HTML structure with elements
- Target elements highlighted in accent color
- Input field for typing CSS selector
- "Test" button applies selector and shows what it matches
- Scoring: `100 - (characterCount * 2) - (specificity * 5) + timeBonus`
- 30 levels:
  - Levels 1-10: Simple (tag, class, id selectors)
  - Levels 11-20: Intermediate (combinators, pseudo-classes)
  - Levels 21-30: Expert (`:has()`, `:is()`, `:where()`, `:not()`, complex nesting)
- Time attack mode: all 30 levels, total time tracked
- Hint system: costs 20 points, highlights relevant combinator

#### Layout Architect (`arcade/layout-architect.html`)

**Concept:** Recreate target layouts using drag-and-drop CSS Grid/Flexbox controls.

**Implementation:**
- Split view: target layout (image) on left, your attempt on right
- Control panel below:
  - Display mode: Grid / Flexbox toggle
  - Grid: template-columns, template-rows, gap, place-items
  - Flex: direction, wrap, justify-content, align-items, gap
  - Per-item: grid-column, grid-row, flex-grow, flex-shrink, order
- Live update as controls change
- Pixel-diff comparison:
  - Render both layouts to canvas, compare pixel-by-pixel
  - Show diff overlay (red = mismatch)
  - Match percentage displayed
- Star ratings: 1★ (>70%), 2★ (>85%), 3★ (>95%)
- 20 levels:
  - Levels 1-5: Simple centering, basic flex rows/columns
  - Levels 6-10: Multi-row layouts, header/sidebar/content
  - Levels 11-15: Complex grids, overlapping areas
  - Levels 16-20: Full dashboard layouts, responsive challenges

#### Animation Timeline (`arcade/animation-timeline.html`)

**Concept:** Visual keyframe animation builder like a video editor timeline.

**Implementation:**
- Preview area: target element with current animation applied
- Timeline: horizontal scrubber with keyframe markers
- Add keyframe: click on timeline to add a point
- Per keyframe: property editor (transform, opacity, color, shadow, etc.)
- Easing curve editor between keyframes (visual bezier curve)
- Playback controls: play, pause, speed (0.25x, 0.5x, 1x, 2x)
- Challenge mode:
  - Reference animation plays on loop
  - Build matching animation on your timeline
  - Scoring by keyframe accuracy + timing
  - 10 challenges: bouncing ball → complex multi-property sequences
- Free mode: create anything, export as `@keyframes` CSS

#### Cascade Puzzle (`arcade/cascade-puzzle.html`)

**Concept:** Reorder CSS rules and adjust specificity to achieve target output.

**Implementation:**
- Target output shown as a rendered element with specific styles
- Given: a set of CSS rules (some conflicting)
- Actions: drag to reorder rules, add/remove `!important`, wrap in `@layer`, change selector specificity
- Live preview shows current cascade resolution
- "Check" button compares with target
- 15 levels:
  - Levels 1-5: Simple source order conflicts
  - Levels 6-10: Specificity conflicts requiring selector changes
  - Levels 11-15: `@layer` + `!important` + specificity combined
- Educational: each level explains WHY the cascade resolved that way after solving

#### The `:has()` Detective (`arcade/has-detective.html`)

**Concept:** Noir-themed detective game — find which element causes a style using `:has()`.

**Implementation:**
- DOM tree visualization (expandable/collapsible tree view)
- Case briefing: "Element X has an unexpected style. Find what's causing it."
- Player writes `:has()` selector to identify the responsible parent-child relationship
- Visual theme: noir detective aesthetic
  - Dark background with film grain overlay (CSS noise)
  - Magnifying glass cursor (`cursor: url(...)`)
  - Typewriter font for case descriptions
  - "Case #1" style headers
- 15 cases:
  - Cases 1-5: Direct parent `:has(> .child)`
  - Cases 6-10: Sibling relationships `:has(+ .sibling)`
  - Cases 11-15: Deep nesting `:has(.a .b .c)`
- Hint system: "Examine" an element to see its computed styles (costs points)

### 3.3 Wild Original Ideas

#### CSS Art Roulette (`arcade/roulette.html`)

**Concept:** Slot machine generates random CSS art challenges.

**Implementation:**
- Slot machine UI: 3 reels with spin animation (CSS transform + transition)
- Reel 1 — Shape: Circle, Pentagon, Star, Blob, Triangle, Hexagon
- Reel 2 — Color Scheme: Sunset, Ocean, Neon, Pastel, Monochrome, Rainbow
- Reel 3 — Effect: Glow, Shadow, Pulse, Spin, Glitch, Float
- After spin: 60-second timer starts
- Live CSS editor (reuse playground editor)
- Preview shows your attempt
- Gallery of creations (pre-seeded with 20 impressive examples)
- Daily challenge: fixed seed based on date, same for all visitors
- Scoring: self-rated (fun, not competitive) — no backend, all "community" examples are hardcoded JSON giving the feel of shared creations

#### Type Racer: CSS Edition (`arcade/type-racer.html`)

**Concept:** Speed-type CSS declarations accurately.

**Implementation:**
- Display area: shows CSS declaration to type
- Input area: user types, characters highlight green (correct) or red (wrong)
- Stats: WPM, accuracy %, current streak
- Ghost racer: translucent text advancing at your previous best speed
- Rounds by difficulty:
  - Easy: `color: red;`, `margin: 0;`
  - Medium: `transform: rotate(45deg);`
  - Hard: `background: linear-gradient(135deg, #f472b6, #a78bfa);`
  - Expert: `animation: bounce 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;`
- 30 declarations per round, randomized from bank of 100+
- Final score: WPM + accuracy bonus

#### Zen Garden Sandbox (`arcade/zen-garden.html`)

**Concept:** CSS Zen Garden-inspired — same HTML, you write CSS to transform it.

**Implementation:**
- Fixed HTML structure (a simple page with header, nav, main, aside, footer, headings, paragraphs, lists, images)
- Full CSS editor (reuse playground editor component)
- Live preview of your stylesheet applied to the HTML
- 5 seed HTML layouts of varying complexity
- Pre-loaded gallery: 10 impressive transformations (CSS-only) showing what's possible
- Save & name your creation
- "Inspiration" button: loads a random gallery entry as starting point
- Export: copy CSS or download HTML+CSS bundle

#### The Debugging Game (`arcade/debug.html`)

**Concept:** Find and fix CSS bugs under time pressure.

**Implementation:**
- Split view: "Expected" output vs "Actual" (buggy) output
- Code panel: CSS with one or more bugs
- Bug types (25 total):
  - Syntax: missing semicolons, typos in property names, unclosed brackets
  - Logic: wrong flex direction, incorrect grid areas, z-index stacking
  - Specificity: overridden styles, unexpected cascade resolution
  - Modern: incorrect `:has()` usage, wrong container query syntax, layer order
  - Subtle: `0` vs `0px` in calc(), percentage vs viewport units, shorthand overwriting longhand
- Hint system: "Highlight Line" costs 10 points, "Explain Bug" costs 25 points
- Timer: starts at 60s for easy, 45s for medium, 30s for hard bugs
- Score: base points - time penalty - hint costs

#### Boss Rush: The Interview (`arcade/boss-rush.html`)

**Concept:** CSS trivia boss battle — RPG-style combat where knowledge is power.

**Implementation:**
- RPG battle UI: player sprite on left, boss on right, HP bars, action menu
- 5 bosses (CSS concepts personified):
  - **Boss 1: Lord Flexbox** — Questions about flex properties. Attacks: items wrap wildly, content misaligns
  - **Boss 2: Grid Overlord** — Grid template/area questions. Attacks: grid lines shift, areas collapse
  - **Boss 3: Cascade King** — Specificity/cascade questions. Attacks: styles override each other chaotically
  - **Boss 4: The Animator** — Animation/transition questions. Attacks: screen elements animate erratically
  - **Boss 5: CSS-in-JS (Final Boss)** — Joke fight. Everything is `style={{}}`. "Refactor to CSS" to deal damage
- Combat mechanics:
  - Multiple choice questions (4 options)
  - Correct: deal damage to boss (HP bar drops)
  - Wrong: boss attacks (visual glitch on page, player HP drops)
  - Special moves (earned by streaks): "MDN Reference" (eliminates 2 wrong answers), "DevTools" (reveals answer for 2s)
- Victory: boss-specific celebration animation + achievement
- Defeat: "Continue?" screen with tip about what you got wrong
- 10 questions per boss, need 7+ correct to win

### 3.4 Arcade Infrastructure

**Shared Game UI (`css/arcade-shared.css` + `js/arcade/shared.js`)**
- Pause overlay: ESC triggers blur + "PAUSED" text + resume/quit buttons
- HUD: score display, timer (where applicable), lives/HP
- Game over screen: final score, high score comparison, "Play Again" / "Back to Arcade"
- Controls help: `?` overlay showing game-specific controls
- Responsive: all games playable at 375px+ width

**High Score System:**
- Per-game high scores stored in state manager
- Top 5 per game
- Score entry: initials (3 chars) like classic arcade
- Feeds achievement engine

**Daily Challenges:**
- One featured game/puzzle per day
- Seeded RNG: `Math.sin(dateHash) * 10000` for deterministic "random"
- Featured on arcade hub with special styling
- Daily challenge completion: achievement progress

**Sound Design:**
- Each game gets: background loop, action sounds (shoot, collect, break), victory jingle, defeat sound
- All via audio engine
- Volume independent per game

**Mobile Controls:**
- Snake/Asteroids: on-screen D-pad overlay
- Breakout/Pong: touch-drag for paddle
- Flappy: tap to flap
- Puzzles: touch-friendly input, large buttons
- All games: swipe up to pause

**Difficulty Scaling:**
- Each game supports Easy/Medium/Hard
- Affects: speed, complexity, timer duration, scoring multiplier
- Default: Medium
- Selector on game start screen

---

## Cross-Cutting Concerns

### Performance
- Games use `requestAnimationFrame` for rendering loops
- Canvas-based games for anything with many moving elements (Asteroids, Breakout)
- DOM-based games for CSS-showcasing games (Snake, Flappy Div)
- Lazy-load game assets: game JS only loaded when navigating to that game
- State manager batches localStorage writes (debounced 500ms)
- Audio context created lazily on first user interaction

### Accessibility
- All games keyboard-navigable
- Pause on focus loss (`document.hidden`)
- Screen reader announcements for score changes, game over, achievements
- High contrast mode support (respects `forced-colors`)
- Reduced motion: disable non-essential animations in games, keep functional ones

### Browser Support
- Target: Chrome 120+, Firefox 120+, Safari 17+
- Feature detection for: View Transitions, `:has()`, `@layer`, Container Queries, Houdini
- Graceful degradation: features that require unsupported APIs show a note, never break
- No IE11 support (intentional)

### Testing Strategy
- Manual testing per layer checkpoint
- Browser console must be error-free on all pages
- Each game: play through full game loop, verify scoring, verify high score persistence
- Each achievement: verify trigger condition works
- Speedrun: verify all new pages counted
- Mobile: test all touch controls on real device or emulator

---

## Summary

| Layer | Items | New Files | Checkpoint |
|-------|-------|-----------|------------|
| 0: Audit & Bugs | Full audit + all fixes | Bug report doc | Review bug report, verify fixes |
| 1: Enhancements | ~50 features (animations, gimmicks, polish) | Modifications to existing files | Review all new interactions |
| 2: Major Features | 5 new pages, 3 systems, nav upgrades, shape builder v2 | ~15 new files | Review new pages and systems |
| 3: Games | 15 games, arcade infrastructure | ~20 new files | Review each game |
| **Total** | **~130+ items** | **~35+ new files** | **4 checkpoints** |
