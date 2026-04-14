# Gimmicks & Easter Eggs — Design Spec

## Overview

108+ interactive gimmicks, easter eggs, and cultural references woven into every page of "A Love Letter to the Web." Split into two categories: **obvious delights** (visitors naturally discover them) and **hidden easter eggs** (rewards for the curious). Nothing is left out — every element that looks interactive IS interactive.

**Repository:** `C:\ComfyUI\RD\HTML`
**Scope:** Enhancements to existing pages + 3 new hidden pages
**Dependencies:** Zero. All gimmicks use vanilla JS, CSS animations, and browser APIs already in use.

---

## File Structure

```
js/gimmicks/
├── global.js         # Theme toggle, tab title, console art, favicon, idle, cursor, context menu, secrets()
├── landing.js        # Era-specific gimmicks (counter, guestbook, card flips, typewriter, etc.)
├── hub.js            # Konami code, sparkles, line draw, time-of-day, counters
├── zones.js          # Shared zone gimmicks (scroll progress color, chapter numbers, art hovers)
├── playground-gm.js  # Editor jokes, typing detection, preset animation
├── components-gm.js  # Dark mode toggle, toast messages, sassy components
├── speedrun.js       # Speed run timer (loaded only with ?speedrun=true)
css/gimmicks.css      # Light theme tokens, selection colors, print styles, cursors, seasonal
404.html              # Custom 404 page
secret.html           # Hidden credits page (source comment treasure hunt reward)
lol.html              # Secret URL page
```

Each `js/gimmicks/*.js` file is loaded as `type="module"` and is fully self-contained. No gimmick depends on another gimmick. Every gimmick degrades gracefully — if JS fails, the page still works.

---

## 1. Global Gimmicks (Every Page)

### 1.1 Dark/Light Theme Toggle

**Trigger:** The "Dark mode" toggle switch on `components.html` (the Toggle Switch component demo).
**Effect:** Adds/removes `data-theme="light"` on `<html>`. Swaps all oklch custom properties to light equivalents.
**Persistence:** `localStorage.setItem('theme', 'light'|'dark')`.
**Load behavior:** A blocking `<script>` in `<head>` of every page reads localStorage and applies `data-theme` before first paint — no flash.
**Transition:** `transition: background-color 300ms, color 300ms` on `body` and key elements.

Light theme token overrides:
```css
[data-theme="light"] {
  --color-base: oklch(0.97 0.005 270);
  --color-surface: oklch(0.94 0.005 270);
  --color-border: oklch(0.88 0.01 270);
  --color-text: oklch(0.15 0.01 270);
  --color-muted: oklch(0.45 0.02 270);
  --color-primary: oklch(0.5 0.22 270);
  --color-accent: oklch(0.55 0.2 295);
}
```

The 1991 era in light mode becomes even more authentic — white background, black text, blue links.

### 1.2 Tab Title Shenanigans

**Trigger:** `document.visibilitychange` event.
**Effect:** When tab loses focus, `document.title` changes to "Come back! The CSS misses you..." — restores original title on return.

### 1.3 Dynamic Favicon

**Trigger:** Page load.
**Effect:** Each page sets a favicon via a tiny inline SVG `<link>` using the zone's symbol character rendered as SVG text. Hub = ✦, Landing = ◈, each zone = its symbol.

### 1.4 Custom Selection Colors

```css
::selection {
  background: oklch(0.62 0.2 270 / 0.3);
  color: var(--color-text);
}
```
Each zone page overrides with its accent color. Landing page changes selection color per era section using `:has()` on the currently-in-view era.

### 1.5 Console Art

**Trigger:** Any page load.
**Effect:** Prints styled ASCII art to console:
```
   _    _    _______  _    _
  | |  | |  |__   __|| |  | |
  | |  | |     | |   | |  | |
  | |__| |     | |   | |__| |
  |______|     |_|   |______|

  A Love Letter to the Web

  Everything here is hand-written HTML, CSS, and vanilla JS.
  Zero dependencies. Zero build steps.
  Curious? Read the source. We're proud of it.

  Type secrets() for a list of easter eggs on this page.
```

Uses `console.log('%c...', 'font-family: monospace; color: #646cff;')` for styling.

### 1.6 `secrets()` Console Function

**Trigger:** Typing `secrets()` in DevTools console.
**Effect:** `console.table()` listing all easter eggs on the current page with columns: Name, Hint, Found (boolean tracked in localStorage).

### 1.7 Custom Right-Click Menu

**Trigger:** `contextmenu` event on `<main>`.
**Effect:** Shows a custom popover menu with options:
- "View Source (yes, it's readable)" → opens `view-source:` URL
- "Inspect Element (we're proud of our markup)" → closes menu (they'll use DevTools)
- "Copy Link" → copies current page URL
- "Surprise Me" → navigates to a random zone page
- "Toggle Theme" → flips dark/light

Styled to match the site. Falls back to native context menu on right-click of inputs/textareas.

### 1.8 Idle Animations

**Trigger:** No mouse/keyboard/scroll for 60 seconds.
**Effect:** Ambient mode kicks in — existing animations slow down 50%, a subtle breathing glow appears on the page background, stars (if present) drift slower. Any user interaction instantly snaps back to normal with a 200ms transition.

### 1.9 Evolving Cursor

**Trigger:** Page-specific, CSS-driven.
**Landing 1991:** `cursor: default` (system arrow)
**Landing 1996:** `cursor: url(data:...)` of a pixelated hand, or `cursor: crosshair`
**Landing 2010:** `cursor: pointer` on everything hoverable with a subtle glow via box-shadow on a following dot
**Landing 2020:** clean minimal dot cursor via a small JS-tracked circle
**Landing 2026:** animated gradient ring cursor (CSS `@property` animated hue)
**Hub:** default with sparkle on click
**Zones:** each zone's accent color as a dot cursor

### 1.10 Scroll Velocity Awareness

**Trigger:** Scroll events (throttled to rAF).
**Effect:** Sets `--scroll-speed` CSS custom property on `<html>` (0 = stopped, 1 = normal, 2+ = fast). Animations that read this property speed up/slow down. Stars drift faster when scrolling fast, slow to a crawl when stopped.

### 1.11 View Source Comments (Treasure Hunt)

**Trigger:** Viewing page source.
**Effect:** Each of the 12 main pages has a unique HTML comment near `</body>`:
```html
<!-- Letter 1/12: Y — "The web is for everyone." — Tim Berners-Lee -->
```
All 12 spell: Y-O-U-F-O-U-N-D-T-H-E-M — then a clue: "Visit /secret.html"

### 1.12 Keyboard Shortcut Help

**Trigger:** Pressing `?` on any page.
**Effect:** Opens a popover listing shortcuts:
- `?` — Show this help
- `t` — Toggle theme
- `h` — Go to hub
- `1-8` — Go to zone 1-8
- `p` — Go to playground
- `c` — Go to components
- `←/→` — Prev/next zone (on zone pages)
- "There are 12 hidden comments in the source. How many have you found?"

### 1.13 Print Stylesheet

```css
@media print {
  .page-header, .zone-nav, .scroll-progress { display: none; }
  body { background: white; color: black; }
  a { color: black; text-decoration: underline; }
  a::after { content: " (" attr(href) ")"; font-size: 0.8em; }
  @page { margin: 2cm; }
  body::after {
    content: "Printed from A Love Letter to the Web — a zero-dependency website. Visit: ixmxamar.github.io/HTML";
    display: block;
    text-align: center;
    margin-top: 2rem;
    font-size: 0.8rem;
    color: #666;
  }
}
```

### 1.14 Reduced Motion Personality

If `prefers-reduced-motion: reduce` is active, show a small fixed badge at bottom-right on first visit: "Reduced motion mode — animations paused. The spirit remains. ✨" Dismissable, saved to localStorage.

---

## 2. Landing Page Gimmicks

### 2.1 Real Links — 1991 Era

| Link Text | URL |
|-----------|-----|
| hypermedia | `https://www.w3.org/WhatIs.html` |
| executive summary | `http://info.cern.ch/hypertext/WWW/Summary.html` |
| Mailing lists | `https://www.w3.org/Archives/` |
| Policy | `https://www.w3.org/Consortium/Legal/` |
| W3 news | `http://info.cern.ch/hypertext/WWW/News/9211.html` |
| Frequently Asked Questions | `https://www.w3.org/FAQ.html` |
| Tim Berners-Lee | `https://www.w3.org/People/Berners-Lee/` |

### 2.2 Real Links — 1996 Era

| Link Text | URL / Action |
|-----------|-------------|
| Home | Scrolls to era 1 (`#era-1991`) |
| About Me | Links to GitHub profile (`https://github.com/IxMxAMAR`) |
| Guestbook | Opens guestbook `<dialog>` (section 2.4) |
| Links | Links to `hub.html` |
| WebRing | Links to `https://webri.ng/` (real webring revival) |

### 2.3 Typewriter Effect — 1991 Era

**Trigger:** First visit (tracked via `sessionStorage`).
**Effect:** The 1991 era text renders character-by-character at 30ms/char, simulating a terminal loading the first web page. Total time ~4 seconds. Clicking anywhere during animation skips to complete state. Subsequent visits show instant text.

### 2.4 Guestbook Dialog — 1996 Era

**Trigger:** Clicking "Guestbook" link.
**Effect:** Opens a `<dialog>` styled in full Geocities aesthetic:
- Dark blue background, green/yellow text, Comic Sans
- `spinning-earth.gif` in the header, `divider-rainbow.gif` between entries
- 4 hardcoded entries (each with a random retro GIF avatar — `dragon-purple.gif`, `wolf-purple.gif`, `star-gold.gif`, `angel.gif`):
  - "Cool site!! -xXDarkAngelXx, 1997"
  - "how do i download the internet? -dave, 1998"
  - "FIRST!!! -anonymous, 1999"
  - "Please sign my guestbook too! www.angelfire.com/~sparkle -☆Sparkle☆, 1997"
- `rose-sparkle.gif` as footer decoration
- A fake form with Name and Message fields
- Submit button shows `handshake.gif` + "Thanks for signing! Your entry will appear in 3-5 business days."
- Close button styled as a 90s gray [X] button
- `divider-music.gif` at the bottom

### 2.5 Live Visitor Counter — 1996 Era

**Trigger:** Page load.
**Effect:** Reads `localStorage.getItem('visitorCount')`, increments by 1, saves, displays with leading zeros (format: `###,###`). Starts at 4271 on first visit.

### 2.6 Under Construction Popover — 1996 Era

**Trigger:** Clicking "🚧 Under Construction 🚧" text.
**Effect:** Shows a popover with:
- A CSS-art animated construction worker (alternating between 2 poses via `steps(2)` animation)
- "This section has been under construction since 1996."
- Link: "Visit the original Geocities" → Wayback Machine archive

### 2.7 Marquee — 1996 Era

**Trigger:** Scrolling into the 1996 era.
**Effect:** A `<div>` with CSS `animation: marquee` scrolls text across the bottom of the section: "Welcome to my homepage! Best viewed in Netscape Navigator 3.0 at 800×600"

### 2.8 Twinkling Background Stars — 1996 Era

**Trigger:** Always active.
**Effect:** Tiny white dots in the `#000033` background flicker at random intervals using CSS animations with varied `animation-delay` and `animation-duration` on each dot.

### 2.9 Cursor Trail — 1996 Era

**Trigger:** Scrolling into the 1996 era.
**Effect:** A CSS-only sparkle trail follows the cursor for 3 seconds. Implemented with `@property` animated pseudo-elements on a mouse-tracking div. Fades out automatically.

### 2.10 Hampster Dance — 1996 Era

**Trigger:** Triple-clicking "🚧 Under Construction 🚧" text.
**Effect:** All text in the 1996 section starts bouncing in rows (CSS `animation: bounce` with staggered delays) for 5 seconds, referencing the Hampster Dance. Then settles back.

### 2.11 Email Link — 1996 Era

Add to the Geocities content area:
```html
<a href="mailto:webmaster@geocities.com" title="This inbox has been full since 1999">📧 Email the Webmaster</a>
```

### 2.12 CSS3 Card Flip — 2010 Era

**Trigger:** Clicking a CSS3 showcase card.
**Effect:** Card rotates 180° on Y axis (`transform: rotateY(180deg)`) to reveal the actual CSS property on the back. E.g., clicking "Rounded Corners" shows `border-radius: 12px;` on the back with a code font. Clicking again flips back.

### 2.13 3D Tilt on Hover — 2010 Era

**Trigger:** Mousemove over any CSS3 card.
**Effect:** Card tilts in 3D based on cursor position within the card (perspective + rotateX/Y). A glossy highlight pseudo-element follows the cursor.

### 2.14 Gradient Text Cycling — 2010 Era

**Trigger:** Hovering the "CSS3 Revolution" gradient heading.
**Effect:** Cycles through 3 classic Web 2.0 gradient palettes every 800ms: Stripe blue, Instagram sunset, Spotify green.

### 2.15 CSS Zen Garden Homage — 2010 Era

**Trigger:** Clicking a hidden "Zen" text in the corner of the 2010 section.
**Effect:** Cycles through 3 CSS Zen Garden-style themes on the 2010 section only (different colors, layouts, fonts) every 2 seconds, then resets. Demonstrates "same HTML, different CSS."

### 2.16 Grid Lines Visualization — 2020 Era

**Trigger:** Always visible.
**Effect:** Subtle repeating grid lines behind the modern-grid cards via `background-image: repeating-linear-gradient(...)`, making the CSS Grid visible.

### 2.17 Dark Mode Card Toggle — 2020 Era

**Trigger:** Clicking the `prefers-color-scheme` card.
**Effect:** Toggles the site-wide dark/light theme (same as component toggle). Card icon animates sun↔moon transition.

### 2.18 "Centering a div" Timeline — 2020 Era

**Trigger:** Triple-clicking the `display: flex` card.
**Effect:** Popover showing a timeline:
- 2005: "How do I center a div?" 
- 2010: "Still googling..."
- 2015: "Flexbox??"
- 2020: "`place-items: center`"
- 2026: "We don't talk about those years."

### 2.19 Magnetic Chips — 2026 Era

**Trigger:** Mouse proximity to platform chips.
**Effect:** Chips shift 1-3px toward the cursor when within 80px distance. Moving away releases them with a spring ease. Each chip links to its zone page.

### 2.20 Chip Glow — 2026 Era

**Trigger:** Hovering a platform chip.
**Effect:** Chip glows with its zone's accent color. E.g., "scroll-driven animations" glows `#646cff`, ":has() selector" glows `#fb923c`.

### 2.21 Portal Starfield — 2026 Era

**Trigger:** Hovering "Enter the Observatory" button.
**Effect:** A subtle animated starfield (radial-gradient keyframes) plays behind the button, like a hyperspace warp preview.

### 2.22 "hypermedia" Era Preview — 1991 Era

**Trigger:** Hovering the word "hypermedia."
**Effect:** The text styling morphs rapidly through all 5 eras: Times New Roman → Comic Sans → Helvetica+gradient → Inter+clean → gradient text. A 2-second preview of the whole timeline on one word.

### 2.23 HR Tooltip — 1991 Era

**Trigger:** Hovering the `<hr>` element.
**Effect:** CSS tooltip appears: "The original horizontal rule. Since 1993."

---

## 3. Hub Page Gimmicks

### 3.1 Constellation Line Draw

**Trigger:** Page load.
**Effect:** SVG connection lines animate in via `stroke-dasharray`/`stroke-dashoffset` animation over 1.5s. Lines appear to be "drawn" between nodes.

### 3.2 Click Sparkles

**Trigger:** Clicking empty space (not a node) in the constellation area.
**Effect:** A brief CSS sparkle/ripple animation at the click coordinates. 4-6 particles expand outward and fade. Pure CSS via dynamically positioned elements removed after animation.

### 3.3 Orbiting Particles

**Trigger:** Always active (CSS-only).
**Effect:** Each zone node has 1-2 tiny dots (pseudo-elements) orbiting it on a circular path via CSS `offset-path: circle()` or `transform: rotate()` animation at different speeds.

### 3.4 Konami Code + Rickroll

**Trigger:** Typing ↑↑↓↓←→←→BA on keyboard.
**Effect:** 
1. All constellation nodes explode outward (translateX/Y to edges of viewport)
2. Reassemble in a spiral animation over 2 seconds
3. Settle back to original positions
4. A tiny text fades in center for 3 seconds: "Never gonna give you up. Never gonna let you down."
5. Fades out.

### 3.5 "0 Dependencies" Popover

**Trigger:** Clicking the "0 Dependencies" stat text.
**Effect:** Popover: "Zero. None. Nada. Not even a normalize.css. We said what we said. 💅"

### 3.6 Animated Stat Counters

**Trigger:** Clicking "8 Zones" or "24 Demos" stats.
**Effect:** 
- "8 Zones": Number rapidly counts 0→8 with a slot-machine ease
- "24 Demos": Hovering shows a tooltip listing all 24 demo names across zones

### 3.7 Time-of-Day Greeting

**Trigger:** Page load, reads `new Date().getHours()`.
**Effect:**
- 6am-12pm: Subtitle adds "(Good morning, explorer.)"
- 12pm-6pm: "(Good afternoon.)"
- 6pm-10pm: "(Good evening.)" + constellation slightly brighter
- 10pm-6am: "(Late night coding? Respect.)" + more visible stars, warmer accent

### 3.8 Node Preview on Double-Click

**Trigger:** Double-clicking a zone node (instead of single-click navigate).
**Effect:** A thumbnail preview of the zone's Art hero fades in near the node for 2 seconds, then fades out. Single click still navigates.

---

## 4. Zone Page Gimmicks (Shared)

### 4.1 Zone-Colored Scroll Progress

**Trigger:** Each zone page load.
**Effect:** The scroll progress bar at top uses the zone's accent color gradient instead of the default. Set via `--zone-color` custom property already on each page.

### 4.2 Chapter Numbers

**Trigger:** Scrolling between Act 1/2/3.
**Effect:** A fixed subtle "I", "II", or "III" appears in the bottom-left corner, fading in/out at each section boundary. CSS-only via `animation-timeline: view()` on each section.

### 4.3 Scroll Progress Color Per Zone

Each zone page sets a CSS variable that overrides the scroll progress gradient:
```css
.scroll-progress { background: var(--zone-color); }
```

---

## 5. Zone-Specific Easter Eggs

### 5.1 CSS Art Gallery — "CSS IS AWESOME" Mug

A 7th hidden art piece below the gallery grid. Pure CSS recreation of the iconic "CSS IS AWESOME" mug with text overflowing the box. Hovering applies `overflow: hidden` — text fits. Tooltip: "The real fix was inside us all along."

### 5.2 CSS Art Gallery — Line Count Badges

**Trigger:** Hovering an art piece.
**Effect:** A small badge fades in showing "47 lines of CSS" or "Single div."

### 5.3 CSS Art Gallery — Fullscreen Exhibit

**Trigger:** Clicking an art piece.
**Effect:** Piece expands to fullscreen with a museum-style frame border (CSS `outline` + shadow). Click outside or press Esc to close.

### 5.4 CSS Art Gallery — Art Piece Hover Animations

Each piece comes alive on hover:
- Sunset: sun moves across sky
- Fox: blinks
- Coffee: more steam
- Eye: iris follows cursor direction
- Mountain: gentle snowfall
- Record: spins faster

### 5.5 CSS Art Gallery — Museum Placard

**Trigger:** Clicking an art piece's title.
**Effect:** Popover styled like a museum placard: "Medium: CSS only. Dimensions: 200×200px. Created: 2026. On loan from the browser."

### 5.6 Scroll Animations — Shooting Star

**Trigger:** Random interval, every 20-40 seconds.
**Effect:** A CSS-animated shooting star streaks across the galaxy scene. Linear gradient on a thin element, animated translateX + opacity.

### 5.7 Scroll Animations — Device Orientation

**Trigger:** DeviceOrientation API on mobile.
**Effect:** Tilting the phone shifts star layers in the galaxy. Falls back gracefully if API unavailable.

### 5.8 Popover & Dialog — Card Shuffle

**Trigger:** Clicking popovers in the cascading tower.
**Effect:** Clicked popover rises to the top of the stack (z-index animation), like shuffling a card deck.

### 5.9 Popover & Dialog — "Don't Click" Button

**Trigger:** The demo dialog has a "Don't click" button.
**Effect:** Opens ANOTHER dialog inside it: "I said don't click! Now close both of these." Second dialog has only a "Fine" button.

### 5.10 Container Queries — Personality Text

**Trigger:** Resizing the container in the playground.
**Effect:** The card's description text changes at each breakpoint:
- <150px: "I'm smol"
- ~250px: "Getting comfy"
- ~500px: "Now we're talking"
- >700px: "MAXIMUM POWER. I contain multitudes."

### 5.11 Container Queries — Breakpoint Snap

**Trigger:** Container width crosses a `@container` breakpoint.
**Effect:** Brief flash/pulse on the container border (0.3s box-shadow pulse) at the exact moment a breakpoint triggers.

### 5.12 View Transitions — Ghost Outline

**Trigger:** Expanding a card via view transition.
**Effect:** The original card position shows a faded dotted outline that dissolves after 1s.

### 5.13 View Transitions — Rubber Band Close

**Trigger:** Closing an expanded card with Escape.
**Effect:** Card bounces back with overshoot (cubic-bezier with >1.0 values), like a rubber band.

### 5.14 :has() Selector — "CSS is awesome" Secret

**Trigger:** Typing "CSS is awesome" in the message field.
**Effect:** JS detects the value on `input` event, adds a `data-awesome` attribute to the form. CSS rule `form[data-awesome]` triggers: rainbow gradient background, CSS confetti animation (`@property` animated gradients), submit button text changes to "You Get It ✨"

### 5.15 :has() Selector — Sassy Validation

**Trigger:** Invalid email in the email field.
**Effect:** Via CSS `:has(:invalid)`, a message appears: "That's not an email, that's just vibes."

### 5.16 :has() Selector — Submit Confetti

**Trigger:** Submitting the completed form.
**Effect:** CSS-only confetti fills the hero section for 2 seconds. Uses `@property` animated gradients on a full-screen pseudo-element.

### 5.17 CSS Houdini — (Paint API gimmicks only work in Chromium)

No additional easter eggs beyond what's planned — the zone itself IS the gimmick.

### 5.18 Cascade Layers — z-index: 99999

One glass pane is labeled `z-index: 99999` instead of a layer name. Hovering shows: "We've all been there."

### 5.19 Cascade Layers — "Wrong Order" Warning

**Trigger:** Dragging layers to put `utilities` at the bottom.
**Effect:** Gentle warning: "Bold choice. The cascade respects your decision but wants you to know it disagrees."

### 5.20 Cascade Layers — Motion Blur Trail

**Trigger:** Dragging a layer card.
**Effect:** The dragged card has a CSS motion blur trail (multiple box-shadows with decreasing opacity offset in the drag direction).

---

## 6. Playground Lab Gimmicks

### 6.1 Welcome Toast
**Trigger:** First character typed in editor.
**Effect:** Toast: "Welcome, developer. ✨"

### 6.2 `!important` Warning
**Trigger:** Typing `!important` anywhere.
**Effect:** Red banner slides in from top: "With great specificity comes great responsibility." Fades after 3 seconds.

### 6.3 `display: none` Joke
**Trigger:** Typing `display: none`.
**Effect:** Preview pane briefly fades to 0 opacity for 1 second, then comes back with a toast: "Just kidding."

### 6.4 `transform: rotate(180deg)` Gag
**Trigger:** Typing `transform: rotate(180deg)`.
**Effect:** The editor pane itself rotates 180° for 1.5 seconds, then rights itself.

### 6.5 `color: red` Judgment
**Trigger:** Typing `color: red`.
**Effect:** Toast: "We don't judge your color choices here."

### 6.6 Semicolon Hint
**Trigger:** CSS line without semicolon causes preview to break.
**Effect:** Subtle message below editor: "Missing something? ; perhaps?"

### 6.7 Tabs vs Spaces
**Trigger:** First Tab key press in editor.
**Effect:** One-time toast: "We chose spaces. Fight us." Tab inserts 2 spaces.

### 6.8 Writer's Block
**Trigger:** Editor empty for 10+ seconds.
**Effect:** Placeholder text slowly types itself: "Writer's block? Try a preset →"

### 6.9 Hacker Mode Preset Loading
**Trigger:** Loading any preset.
**Effect:** Code types character-by-character at high speed (~10ms/char) like a movie hacker scene instead of appearing instantly.

### 6.10 Night Owl Mode
**Trigger:** Visiting between 2am-5am.
**Effect:** Editor has slightly warmer color temperature. Status shows "Late night coding? Respect. ☕"

---

## 7. Components Page Gimmicks

### 7.1 Dark Mode Toggle (Global Theme)

The "Dark mode" toggle in the Toggle Switch demo controls the real site-wide theme. See Section 1.1.

### 7.2 Toast Message Rotation

**Trigger:** Clicking "Show Toast" button.
**Effect:** Rotates through messages:
1. "This toast is native HTML. No library."
2. "Your bundle size: 0kb"
3. "No npm install required"
4. "Framework authors hate this one trick"
5. "Built with popover. Closes itself. Life is good."

### 7.3 Modal Dialog Escape Message

**Trigger:** Closing the modal dialog with Escape key.
**Effect:** Brief message in the fading backdrop: "Esc works because closedby='any'. You're welcome."

### 7.4 Accordion Self-Reference

One accordion item question: "Are these really CSS only?"
Answer: "Yes. Every interaction on this page works with JavaScript disabled. Check for yourself."

### 7.5 Tab Speed Run

**Trigger:** Clicking tabs rapidly (5+ clicks in 2 seconds).
**Effect:** Toast: "Speedrunning CSS tabs, nice. 🏃"

### 7.6 Popover Menu "Delete Everything"

One popover menu item says "Delete everything" with red text. Clicking: popover closes, toast appears: "Just kidding. We'd never. This is a demo."

### 7.7 Responsive Card Personality

At narrowest container width, card description text changes to: "It's cozy in here."

### 7.8 Tooltip Ego

One tooltip reads: "I'm rendered in the top layer. Nothing can cover me. I am inevitable."

---

## 8. Hidden Pages

### 8.1 `404.html`

- CSS art: two chain links slowly drifting apart (CSS animation)
- Heading: "404 — Page Not Found"
- A "lost pixel" (small colored square) wanders the page randomly via CSS animation
- Text: "Even this pixel is hand-crafted CSS."
- Click anywhere → random 404 fact: "The first 404 was Room 404 at CERN — the office where the original web servers lived."
- Link: "← Back to the Observatory"
- Fun fact rotation (3 facts, cycles on click)

### 8.2 `secret.html` (Treasure Hunt Reward)

Accessed by discovering the 12 source comments spelling "YOUFOUNDTHEM".

- Movie-style scrolling credits (CSS `@keyframes` translateY):
  - "Directed by: The Browser"
  - "Written by: HTML, CSS, and a little JS"  
  - "Produced by: IxMxAMAR"
  - "Cinematography: oklch() color space"
  - "Sound Design: None (this is a website)"
  - "Special Thanks: Tim Berners-Lee, Håkon Wium Lie, Bert Bos"
  - "Stunt Coordinator: The Cascade"
  - "No frameworks were harmed in the making of this website."
  - "THE END"
  - "...or is it? (Press any key)"
- Pressing any key after credits finish → firework animation (CSS only)

### 8.3 `lol.html`

- Spinning `<div>` with CSS `animation: rotate` containing the text "You found the secret page!"
- Gradient background that cycles hues
- No links point here — you have to guess the URL
- Below the spinner: "How did you find this? Seriously, tell us." with a link to your GitHub issues

---

## 9. Seasonal & Contextual Easter Eggs

### 9.1 December Snowfall

**Trigger:** `new Date().getMonth() === 11`
**Effect:** CSS-animated snowflakes fall across every page. 20-30 `<div>` elements with randomized size, x-position, animation-duration, and animation-delay. Dismissable via a small "❄️ ×" button.

### 9.2 April Fools

**Trigger:** `new Date().getMonth() === 3 && new Date().getDate() === 1`
**Effect:** 
- All fonts switch to Comic Sans
- Logo changes to "✦ Web Letter (Professional Edition™)"  
- Console message: "April 1st detected. All fonts upgraded to Comic Sans Professional™."
- Subtle, not destructive — all functionality works normally

### 9.3 Weekend Mode

**Trigger:** `new Date().getDay() === 0 || new Date().getDay() === 6`
**Effect:** Console greeting changes to "Working on a weekend? Respect. Here, have some ASCII coffee: ☕"

### 9.4 New Year Fireworks

**Trigger:** January 1st
**Effect:** A one-time firework burst animation on page load. Dismisses after 3 seconds.

---

## 10. Speed Run Mode

### 10.1 Timer

**Trigger:** Adding `?speedrun=true` to any URL.
**Effect:** A fixed timer appears in the top-right corner. It tracks how fast you visit all 12 main pages (landing, hub, 8 zones, playground, components). Each page visit is tracked in `sessionStorage`. Visiting all 12 shows your total time and: "Speedrun complete! 🏆 Now try it in prefers-reduced-motion."

---

## 11. Reference Links Throughout

### 11.1 Zone Browser Support Badges

Every zone's browser support badge links to the relevant caniuse.com page:
- Scroll Animations → `https://caniuse.com/css-animation-timeline`
- Popover → `https://caniuse.com/mdn-api_htmlelement_popover`
- Container Queries → `https://caniuse.com/css-container-queries`
- View Transitions → `https://caniuse.com/view-transitions`
- :has() → `https://caniuse.com/css-has`
- @layer → `https://caniuse.com/css-cascade-layers`

### 11.2 MDN Links from Code Blocks

Each code block's primary property name links to its MDN page. E.g., `animation-timeline` in a code block links to `https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline`.

### 11.3 Component Names Link to Specs

On the Components page, each component name links to its MDN reference:
- Popover Menu → MDN Popover API
- Dialog → MDN `<dialog>`
- Details/Summary → MDN `<details>`

---

## 12. Space Jam & Web History Tributes

### 12.1 Space Jam Constellation

**Trigger:** Clicking 5 specific stars (constellation dots) in the 1996 era background in the correct sequence.
**Effect:** Section briefly morphs into Space Jam layout (tiled star background, clip-art planet CSS shapes) for 3 seconds, then fades back.

### 12.2 First Website Link

The "executive summary" link in 1991 era goes to the actual first website: `http://info.cern.ch/hypertext/WWW/TheProject.html`

### 12.3 Wayback Machine Link

The "Under Construction" popover includes: "Visit the original Geocities" → `https://web.archive.org/web/19961017235908/http://www.geocities.com/`

### 12.4 "It works on my machine"

If any zone's JS module fails to load (caught by a global error handler), the fallback message says: "Works on my machine ¯\\_(ツ)_/¯ — Try refreshing?"

---

## 13. Asset Inventory

### 13.1 Downloaded GIFs (`assets/gifs/`)

Authentic retro GIFs scraped from Cameron's World and classic GIF archives. Used in the 1996 era section and guestbook dialog.

**Decorative (1996 era scene dressing):**
| File | Content | Usage |
|------|---------|-------|
| `spinning-earth.gif` | Classic spinning globe | Guestbook dialog, 1996 sidebar |
| `star-gold.gif` | Animated gold star | 1996 era accents |
| `star-blue.gif` | Animated blue star | Space Jam easter egg |
| `star-green.gif` | Animated green star | 1996 era accents |
| `dragon-purple.gif` | Purple dragon | Guestbook entry avatar |
| `wolf-purple.gif` | Purple wolf | Guestbook entry avatar |
| `rose-sparkle.gif` | Sparkly purple rose with water reflection | Guestbook decoration |
| `angel.gif` | Blue angel figure | 1996 era decoration |
| `energy-orb.gif` | Purple energy orb | Under construction popover |
| `crescent-sparkle.gif` | Sparkly crescent moon | 1996 era night sky |
| `sun-glow.gif` | Glowing sun | 1996 era decoration |
| `moon.gif` | Moon surface | 1996 background |
| `globe-small.gif` | Small spinning globe | 1996 sidebar nav |
| `space-shuttle.gif` | Space shuttle | Space Jam easter egg |
| `ufo-small.gif` | Small UFO | 1996 era accent |
| `ufo-color.gif` | Colorful UFO | 1996 era accent |
| `handshake.gif` | Two businessmen shaking hands | Guestbook "thank you" |

**Animated Dividers (1996 era section separators):**
| File | Content |
|------|---------|
| `divider-purple.gif` | Purple light show line |
| `divider-rainbow.gif` | Rolling rainbow color bar |
| `divider-smiley.gif` | Smiley face line |
| `divider-music.gif` | Musical notes line |
| `divider-cat-mouse.gif` | Cat chasing mouse line |
| `divider-rope.gif` | Animated rope line |

### 13.2 CSS-Crafted Assets (built during implementation)

These are created in pure CSS to match the site's zero-dependency philosophy:
- **Under construction worker** — `steps(2)` animation alternating between 2 pose frames
- **Email envelope** — CSS shapes with animated flap
- **Fire divider** — `background: linear-gradient()` animated via `@property`
- **Rainbow divider** — CSS `conic-gradient` animated hue rotation
- **Confetti** — `@property` animated gradient particles
- **Snowflakes** — Randomized falling `::before`/`::after` pseudo-elements
- **Shooting star** — Linear gradient on thin element with translateX animation

---

## Implementation Notes

- **No bugs policy:** Every gimmick must degrade gracefully. If JS fails, if a feature isn't supported, if localStorage is full — the page still works. Every gimmick is wrapped in try/catch. Every animation has `prefers-reduced-motion` fallbacks. Every DOM query null-checks.
- **Performance:** Gimmicks are lazy-loaded per page. Global gimmicks are tiny (<5KB minified). No gimmick runs a persistent animation loop — all use CSS animations, IntersectionObserver, or event-driven JS.
- **Accessibility:** All popovers/dialogs are keyboard-navigable. All visual gimmicks have ARIA labels or are `aria-hidden`. The keyboard shortcut overlay lists everything. Screen readers get sensible fallbacks.
- **Testing:** Each gimmick is independently testable by its trigger. No gimmick depends on another gimmick. The `secrets()` console function serves as a built-in test harness.
