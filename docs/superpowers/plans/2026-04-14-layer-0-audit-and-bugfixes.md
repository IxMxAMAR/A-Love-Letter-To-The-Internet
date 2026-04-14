# Layer 0: Full Audit & Bug Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Systematically audit every page, gimmick, and interaction across the entire site, log all bugs, and fix everything broken to establish a solid baseline for the mega expansion.

**Architecture:** Each task audits a specific page or system by opening it in a browser (via local server), testing every interactive element, logging issues, then fixing them. Fixes are committed per-page to keep changes atomic and reviewable.

**Tech Stack:** Vanilla HTML/CSS/JS (existing), Python http.server for local testing, browser DevTools for console error checking.

**Spec:** `docs/superpowers/specs/2026-04-14-love-letter-mega-expansion-design.md` — Layer 0 section.

---

## File Map

No new files created in Layer 0. All changes are modifications to existing files:

| File | Responsibility | Potential Changes |
|------|---------------|-------------------|
| `js/gimmicks/global.js` (450 lines) | Global easter eggs, keyboard shortcuts, context menu, idle detection, seasonal effects, speedrun loader | Tab title debounce, feature detection guards |
| `js/gimmicks/landing.js` (316 lines) | Landing page gimmicks: typewriter, counter, guestbook, hampster dance, card flip/tilt | Typewriter fallback, event listener fixes |
| `js/gimmicks/hub-gm.js` (255 lines) | Hub constellation gimmicks | Interaction fixes |
| `js/gimmicks/playground-gm.js` (162 lines) | Playground easter eggs: night owl, !important warning, display:none | Toast timing fixes |
| `js/gimmicks/components-gm.js` (114 lines) | Component page gimmicks | Event wiring fixes |
| `js/gimmicks/speedrun.js` (139 lines) | Speedrun timer, page tracking, link propagation | Page count future-proofing |
| `js/gimmicks/zones.js` (76 lines) | Zone scroll progress bar, chapter numerals | Scroll position fixes |
| `js/gimmicks/chiptune.js` (108 lines) | Web Audio chiptune player | AudioContext resume handling |
| `js/playground.js` (604 lines) | Live CSS editor, presets, URL sharing | Encoding/decoding edge cases |
| `js/hub.js` (34 lines) | Hub constellation interactions | SVG rendering fixes |
| `js/transitions.js` (67 lines) | Page transition system | Feature detection for View Transitions API |
| `js/utils.js` (87 lines) | Shared utilities | N/A (reference only) |
| `js/zone-art.js` (varies) | CSS art zone interactions | Toggle conflict UX |
| `js/zone-houdini.js` (varies) | Houdini paint worklet loader | Fallback for unsupported browsers |
| `js/worklets/pattern-worklet.js` (206 lines) | Paint worklet | N/A (reference only) |
| `css/zone-art.css` (varies) | CSS art zone styles | clip-path + border-radius conflict |
| All HTML files | Page structure | Minor attribute/accessibility fixes |

---

## Task 1: Start Local Server & Create Bug Report Template

**Files:**
- Create: `docs/superpowers/plans/layer-0-bug-report.md`

- [ ] **Step 1: Start a local dev server**

```bash
cd "C:/ComfyUI/RD/HTML" && python -m http.server 8080 &
```

Open `http://localhost:8080` in browser. Verify `index.html` loads with the timeline landing page.

- [ ] **Step 2: Create bug report template**

Create `docs/superpowers/plans/layer-0-bug-report.md`:

```markdown
# Layer 0 Bug Report

## Format
| # | Page | Severity | Description | Status |
|---|------|----------|-------------|--------|

## Severity
- **Critical:** Feature completely broken, JS error blocking page
- **Major:** Feature partially broken, visible UX issue
- **Minor:** Cosmetic, edge case, or non-blocking issue

## Bugs Found

| # | Page | Severity | Description | Status |
|---|------|----------|-------------|--------|
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/layer-0-bug-report.md
git commit -m "chore: add Layer 0 bug report template"
```

---

## Task 2: Audit Global Systems (global.js)

**Files:**
- Modify: `js/gimmicks/global.js`
- Reference: All HTML pages (for testing)

- [ ] **Step 1: Test console ASCII art**

Open `http://localhost:8080` in Chrome. Open DevTools Console (F12). Verify styled welcome message appears. Check for any console errors on page load. Log any errors to bug report.

- [ ] **Step 2: Test tab title visibility change**

Click away from the tab (switch to another tab). Verify title changes to "Come back! The CSS misses you..." Switch back. Verify original title restores. Rapidly switch tabs 5-6 times. Verify title doesn't get stuck on the wrong value.

If rapid switching causes stuck title, fix by adding a debounce in `js/gimmicks/global.js`. Find the `visibilitychange` listener (around line 69-77) and replace:

```javascript
// BEFORE:
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.title = 'Come back! The CSS misses you...';
  } else {
    document.title = originalTitle;
  }
});

// AFTER:
let titleTimeout;
document.addEventListener('visibilitychange', () => {
  clearTimeout(titleTimeout);
  titleTimeout = setTimeout(() => {
    document.title = document.hidden
      ? 'Come back! The CSS misses you...'
      : originalTitle;
  }, 150);
});
```

- [ ] **Step 3: Test dynamic favicon**

Check browser tab for SVG favicon with page symbol. Navigate to hub.html — verify favicon changes to hub symbol. Navigate to playground.html — verify different symbol. Navigate to a zone — verify zone-specific symbol.

- [ ] **Step 4: Test theme toggle**

Press `t`. Verify theme switches (dark ↔ light). Check `localStorage` for theme key. Refresh page. Verify theme persists. Press `t` again. Verify it switches back. Navigate to another page. Verify theme persists across navigation.

- [ ] **Step 5: Test all keyboard shortcuts**

Test each shortcut one by one:

| Key | Expected Action | Pass/Fail |
|-----|----------------|-----------|
| `?` | Shows keyboard shortcuts help popover | |
| `t` | Toggles theme | |
| `h` | Navigates to hub.html | |
| `p` | Navigates to playground.html | |
| `c` | Navigates to components.html | |
| `1` | Navigates to zones/scroll-animations.html | |
| `2` | Navigates to zones/popover-dialog.html | |
| `3` | Navigates to zones/css-art.html | |
| `4` | Navigates to zones/container-queries.html | |
| `5` | Navigates to zones/view-transitions.html | |
| `6` | Navigates to zones/houdini.html | |
| `7` | Navigates to zones/has-selector.html | |
| `8` | Navigates to zones/cascade-layers.html | |

From a zone page, press `h` — verify it navigates back to hub (using `pathTo()` with `../` prefix). Click into a text input (if any exist on page), then press a shortcut — verify it does NOT fire while focused on input.

- [ ] **Step 6: Test custom context menu**

Right-click on the main content area. Verify custom context menu appears with options: View Source, Inspect, Copy Link, Surprise Me, Toggle Theme. Click each option and verify:
- View Source: opens page source (or equivalent)
- Inspect: opens DevTools
- Copy Link: copies current URL to clipboard
- Surprise Me: navigates to a random zone
- Toggle Theme: toggles dark/light

Click elsewhere — verify menu dismisses. Right-click again — verify menu appears at new position.

- [ ] **Step 7: Test idle detection**

Wait 60 seconds without moving mouse, pressing keys, or scrolling. Verify `idle-mode` class is added to `<html>` (check in DevTools Elements panel). Move mouse — verify class is removed immediately.

- [ ] **Step 8: Test reduced motion badge**

In Chrome DevTools, open Rendering tab (Cmd+Shift+P → "Show Rendering"). Enable "Emulate CSS media feature prefers-reduced-motion: reduce". Refresh page. Verify reduced motion badge appears. Click dismiss. Refresh — verify dismissed state persists (localStorage). Clear localStorage entry. Refresh — verify badge appears again.

- [ ] **Step 9: Test scroll velocity tracking**

Open DevTools Elements panel. Watch `<html>` element for `--scroll-speed` CSS variable. Scroll slowly — verify value is low (< 1). Scroll fast — verify value increases. Stop scrolling — verify value settles back toward 0.

- [ ] **Step 10: Test secrets() console command**

In DevTools Console, type `secrets()` and press Enter. Verify it outputs a list of easter egg hints for the current page. Navigate to a zone page. Run `secrets()` again. Verify it shows zone-specific hints.

- [ ] **Step 11: Test seasonal effects logic**

Read the seasonal effects code in `global.js` (around lines 323-443). Verify the date detection logic:
- December (month === 11): snowfall
- April 1 (month === 3, day === 1): Comic Sans
- January 1 (month === 0, day === 1): burst particles

To test without waiting for those dates, temporarily modify the code OR use DevTools Console to override `new Date()`. Verify each effect renders correctly. Check sessionStorage dismissal works.

- [ ] **Step 12: Log all findings to bug report and commit any fixes**

Update `docs/superpowers/plans/layer-0-bug-report.md` with all findings from this task. If any fixes were made to `global.js`, commit:

```bash
git add js/gimmicks/global.js docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: global gimmicks audit — [describe specific fixes]"
```

---

## Task 3: Audit Landing Page (index.html + landing.js)

**Files:**
- Modify: `js/gimmicks/landing.js`
- Modify: `index.html` (if needed)
- Reference: `css/landing.css`

- [ ] **Step 1: Check for console errors on load**

Navigate to `http://localhost:8080/index.html`. Open DevTools Console. Check for any errors or warnings. Log to bug report.

- [ ] **Step 2: Test typewriter effect**

Clear localStorage (to simulate first visit). Refresh page. Verify the 1991 era section text reveals character-by-character using clip-path animation.

If the typewriter effect doesn't work (clip-path animation not supported), add a feature detection fallback in `js/gimmicks/landing.js`. Find the typewriter initialization code and wrap it:

```javascript
// Add feature detection before the typewriter animation
const supportsClipPathAnimation = CSS.supports('clip-path', 'inset(0 100% 0 0)');
if (supportsClipPathAnimation) {
  // existing typewriter code
} else {
  // Fallback: simple opacity fade-in
  typewriterEl.style.opacity = '0';
  typewriterEl.style.transition = 'opacity 1s ease-in';
  requestAnimationFrame(() => { typewriterEl.style.opacity = '1'; });
}
```

- [ ] **Step 3: Test visitor counter**

Check the visitor counter display. Verify format like "004,271". Refresh page. Verify counter increments. Check localStorage for counter key. Verify it's a number.

- [ ] **Step 4: Test guestbook dialog**

Find the guestbook trigger (if it's a button or link). Click it. Verify modal/dialog opens. Check for pre-filled retro entries. Submit an entry. Verify feedback message appears. Close dialog. Verify it dismisses cleanly without errors.

- [ ] **Step 5: Test hampster dance easter egg**

Find the "🚧 Under Construction 🚧" text in the 1996 era. Triple-click it. Verify all text bounces for ~5 seconds. Verify animation stops gracefully after duration.

- [ ] **Step 6: Test hypermedia font cycle**

Find the "hypermedia" link in the 1991 era. Hover over it. Verify font cycles through 7 different fonts. Mouse out. Verify font resets to default.

- [ ] **Step 7: Test CSS3 card flip**

Find CSS3 feature cards. Click one. Verify 3D flip animation (rotate 180° on Y axis). Verify back face shows CSS property info. Click again to flip back. Verify both sides render correctly.

- [ ] **Step 8: Test CSS3 card 3D tilt**

Hover over a CSS3 card. Move mouse around the card. Verify perspective + rotateX/Y follows mouse position. Mouse out. Verify card resets to flat position.

- [ ] **Step 9: Test dark mode toggle card**

Find the prefers-color-scheme card. Click it. Verify it toggles the site theme (same as pressing `t`).

- [ ] **Step 10: Test flex centering popover**

Find the flex centering card. Triple-click it. Verify popover appears with centering history timeline. Dismiss popover. Verify it closes cleanly.

- [ ] **Step 11: Test responsive layout**

Resize browser to 375px width (mobile). Verify landing page layout adapts:
- Era sections stack vertically
- Text is readable
- Cards reflow properly
- No horizontal overflow

Check 768px (tablet) and 1440px (desktop) as well.

- [ ] **Step 12: Log findings and commit fixes**

```bash
git add js/gimmicks/landing.js index.html docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: landing page audit — [describe specific fixes]"
```

---

## Task 4: Audit Hub Page (hub.html + hub.js + hub-gm.js)

**Files:**
- Modify: `js/hub.js`, `js/gimmicks/hub-gm.js`
- Modify: `hub.html` (if needed)
- Reference: `css/hub.css`

- [ ] **Step 1: Check for console errors on load**

Navigate to `http://localhost:8080/hub.html`. Check DevTools Console for errors.

- [ ] **Step 2: Test zone constellation nodes**

Verify all 8 zone nodes are visible. Verify each node has:
- Correct zone name label
- Accent color matching the zone
- Pulsing glow animation

Click each node. Verify it navigates to the correct zone page:
1. Scroll Animations → `zones/scroll-animations.html`
2. Popover & Dialog → `zones/popover-dialog.html`
3. CSS Art → `zones/css-art.html`
4. Container Queries → `zones/container-queries.html`
5. View Transitions → `zones/view-transitions.html`
6. Houdini → `zones/houdini.html`
7. :has() Selector → `zones/has-selector.html`
8. Cascade Layers → `zones/cascade-layers.html`

- [ ] **Step 3: Test constellation SVG lines**

Verify SVG lines connect related zone nodes. Verify lines have animated strokes (if applicable). Check that lines don't overflow or misalign on window resize.

- [ ] **Step 4: Test hover interactions**

Hover each node. Verify it scales up and brightens. Mouse out. Verify it returns to normal state.

- [ ] **Step 5: Test responsive layout**

Resize to 375px, 768px, 1440px. Verify constellation adapts. Nodes should remain clickable and labels readable at all sizes.

- [ ] **Step 6: Log findings and commit fixes**

```bash
git add js/hub.js js/gimmicks/hub-gm.js hub.html css/hub.css docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: hub page audit — [describe specific fixes]"
```

---

## Task 5: Audit Playground Page (playground.html + playground.js + playground-gm.js)

**Files:**
- Modify: `js/playground.js`, `js/gimmicks/playground-gm.js`
- Modify: `playground.html` (if needed)
- Reference: `css/playground.css`

- [ ] **Step 1: Check for console errors on load**

Navigate to `http://localhost:8080/playground.html`. Check DevTools Console.

- [ ] **Step 2: Test editor input and live preview**

Type CSS into the editor area:
```css
background: red;
width: 200px;
height: 200px;
```
Verify the preview div updates in real-time with a red 200x200 square.

- [ ] **Step 3: Test all presets**

Click each preset button. Verify:
- Editor content updates to the preset CSS
- Preview renders the preset correctly
- No console errors on any preset

- [ ] **Step 4: Test URL hash sharing**

Type some CSS. Click Share button. Verify URL updates with a hash. Copy the URL. Open it in a new tab. Verify the same CSS appears in the editor and preview renders correctly.

Test edge cases:
- Empty editor → share (should work, empty hash or no hash)
- Very long CSS (500+ chars) → share (should base64 encode without issues)
- CSS with special characters (`#`, `%`, `+`) → share and reload

- [ ] **Step 5: Test Clear button**

Type CSS. Click Clear. Verify editor is emptied and preview resets to blank.

- [ ] **Step 6: Test line numbers**

Type multi-line CSS. Verify line numbers appear and update as lines are added/removed.

- [ ] **Step 7: Test playground gimmicks**

For each gimmick, trigger the condition and verify the toast/effect:

| Trigger | Expected Effect |
|---------|----------------|
| Visit between 2-5 AM (or spoof) | "Night owl" coffee emoji toast |
| Type `!important` | "Great power, great responsibility" toast (max 3 times) |
| Type `display: none` | Preview fades out 1s, "just kidding" toast |
| Type `color: red` | Sarcastic toast about color choice |
| Type `rotate(180deg)` | Editor spins 180°, rotates back after 1.5s |
| Wait 10s with empty editor | "Writer's block" toast suggesting presets |
| Press Tab | Converts to 2 spaces, humorous toast |

- [ ] **Step 8: Test responsive layout**

Verify split pane layout works at 375px (should stack vertically), 768px, 1440px.

- [ ] **Step 9: Log findings and commit fixes**

```bash
git add js/playground.js js/gimmicks/playground-gm.js playground.html docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: playground page audit — [describe specific fixes]"
```

---

## Task 6: Audit Components Page (components.html + components-gm.js)

**Files:**
- Modify: `components.html`, `js/gimmicks/components-gm.js`
- Reference: `css/toolkit.css`, `css/components.css`

- [ ] **Step 1: Check for console errors on load**

Navigate to `http://localhost:8080/components.html`. Check DevTools Console.

- [ ] **Step 2: Test each component type**

Test all 8 component demos on the page:

| Component | Test Actions |
|-----------|-------------|
| Popovers | Click trigger → popover appears, click outside → dismisses, ESC → dismisses |
| Toasts | Trigger toast → appears, auto-dismisses after timeout, multiple toasts stack |
| Modals | Click trigger → modal opens with backdrop, ESC → closes, click backdrop → closes |
| Dialogs | Open → focus trapped inside, close → focus returns to trigger |
| Accordions | Click header → expands, click again → collapses, only one open at a time (if exclusive) |
| Toggles | Click → state changes, visual indicator updates |
| Tabs | Click tab → content switches, active tab highlighted, keyboard arrow navigation |
| Tooltips | Hover trigger → tooltip appears positioned correctly, mouse out → dismisses |

- [ ] **Step 3: Test code copy buttons**

If components have "Copy Code" buttons, click each. Verify code is copied to clipboard. Paste somewhere to confirm.

- [ ] **Step 4: Test filter tabs (if present)**

If there are filter/category tabs at the top, click each. Verify components filter correctly. Verify "All" shows everything.

- [ ] **Step 5: Test dark mode sync**

Toggle theme. Verify all components re-render correctly in both themes. Check for any components that look broken in one theme.

- [ ] **Step 6: Test component gimmicks**

- Trigger toast message rotation — verify 5 different messages cycle
- Press Escape on a modal — verify escape message displays
- Toggle dark mode via component — verify syncs with site theme

- [ ] **Step 7: Test responsive layout**

Verify component grid reflows at 375px, 768px, 1440px. All components should be functional and readable at mobile width.

- [ ] **Step 8: Log findings and commit fixes**

```bash
git add components.html js/gimmicks/components-gm.js docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: components page audit — [describe specific fixes]"
```

---

## Task 7: Audit All 8 Zone Pages

**Files:**
- Modify: `js/gimmicks/zones.js`, zone-specific JS files, zone CSS files
- Modify: Zone HTML files (if needed)

This task audits all 8 zone pages. Each zone should be tested for common zone features PLUS zone-specific demos.

- [ ] **Step 1: Test zone-shared features on ALL zone pages**

For each of the 8 zone pages, verify:

| Feature | Check |
|---------|-------|
| Zone-colored scroll progress bar | Scrolls → progress bar fills, color matches zone accent |
| Chapter numerals (I, II, III) | Scrolling past sections → numerals fade in/out |
| Back link | Navigates to root (index.html) |
| Hub link | Navigates to hub.html |
| Next Zone link | Navigates to next zone in sequence |
| Zone counter | Shows correct "Zone X of 8" |
| Console errors | None on load or during interaction |

- [ ] **Step 2: Audit zones/scroll-animations.html**

- Verify scroll-driven animation demos trigger at correct scroll positions
- Verify `animation-timeline: view()` examples animate on entry
- Verify `animation-range` examples show correct reveal windows
- Check for jank or incorrect timing

- [ ] **Step 3: Audit zones/popover-dialog.html**

- Test all popover demos: click to open, click outside to close, ESC to close
- Test dialog demos: modal and non-modal variants
- Verify `@starting-style` fade-in animations work
- Test nested popovers (if any)

- [ ] **Step 4: Audit zones/css-art.html (Build a Shape)**

Test all 5 toggles individually:

| Toggle | Expected Effect |
|--------|----------------|
| Background gradient | `linear-gradient(135deg, #f472b6, #a78bfa, #38bdf8)` applied |
| Clip-path shape | Pentagon polygon applied |
| Box-shadow depth | Multi-layer shadow applied |
| Border-radius curves | Organic blob shape applied |
| Animation pulse | Breathe animation starts |

Test combinations:
- All 5 on: all properties stack
- Toggle clip-path + border-radius together: check current behavior (spec says both hide — verify if this is confusing UX)

If clip-path + border-radius conflict is confusing, fix in `css/zone-art.css`. Instead of hiding both, apply border-radius to the clip-path:

```css
/* BEFORE: hides both when both checked */
.playground-controls:has(#toggle-clip:checked):has(#toggle-radius:checked) ~ .playground-stage .playground-div {
  clip-path: none;
  border-radius: initial;
}

/* AFTER: apply organic border-radius, disable hard clip-path, show tooltip */
.playground-controls:has(#toggle-clip:checked):has(#toggle-radius:checked) ~ .playground-stage .playground-div {
  clip-path: none;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}
```

And add a visible note in the CSS readout explaining: "/* border-radius wins — clip-path disabled when both active */"

Verify the CSS readout updates correctly for all toggle combinations.

- [ ] **Step 5: Audit zones/container-queries.html**

- Verify container query demos respond to container width changes
- Test resize handles (if using `resize: horizontal` on containers)
- Verify breakpoint labels update correctly

- [ ] **Step 6: Audit zones/view-transitions.html**

- Test view transition demos
- Verify `document.startViewTransition()` calls work
- Check for console errors on transition
- Verify fallback behavior on browsers without View Transitions API

- [ ] **Step 7: Audit zones/houdini.html**

Test paint worklet loading. If `CSS.paintWorklet` is undefined in the browser:

Check `js/zone-houdini.js` for feature detection. If missing, add:

```javascript
if (typeof CSS !== 'undefined' && CSS.paintWorklet) {
  CSS.paintWorklet.addModule('js/worklets/pattern-worklet.js');
} else {
  // Show fallback message
  const fallback = document.querySelector('.houdini-fallback');
  if (fallback) {
    fallback.style.display = 'block';
    fallback.textContent = 'CSS Houdini Paint API is not supported in this browser. Try Chrome or Edge.';
  }
}
```

If `CSS.paintWorklet` IS supported, verify:
- Paint worklet loads without error
- Custom paint renders on target elements
- Paint properties respond to CSS custom property changes

- [ ] **Step 8: Audit zones/has-selector.html**

- Test `:has()` selector demos
- Verify form validation styling responds to input state
- Test checkbox/radio interactions that trigger `:has()` changes
- Verify all demos work in Chrome and Firefox (both support `:has()` now)

- [ ] **Step 9: Audit zones/cascade-layers.html**

- Test `@layer` demos
- Verify cascade resolution order is visually correct
- Test any interactive demos that reorder layers

- [ ] **Step 10: Log all zone findings and commit fixes**

```bash
git add js/gimmicks/zones.js js/zone-*.js css/zone-*.css zones/*.html docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: zone pages audit — [describe specific fixes]"
```

---

## Task 8: Audit Special Pages (404, lol, secret)

**Files:**
- Modify: `404.html`, `lol.html`, `secret.html` (if needed)

- [ ] **Step 1: Test 404.html**

Navigate to `http://localhost:8080/nonexistent-page.html`. Note: Python http.server won't serve custom 404, but GitHub Pages will. Instead, navigate directly to `http://localhost:8080/404.html`.

Verify:
- Page renders with custom styling
- No console errors
- Navigation links work
- Theme toggle works
- Responsive layout at 375px, 768px, 1440px

- [ ] **Step 2: Test lol.html**

Navigate to `http://localhost:8080/lol.html`.

Verify:
- Spinning gradient text effect renders
- Animation is smooth (no jank)
- No console errors
- Page is accessible via keyboard

- [ ] **Step 3: Test secret.html**

Navigate to `http://localhost:8080/secret.html`.

Verify:
- Scrolling credits play
- Credits scroll smoothly to completion
- All text is readable
- No console errors
- Can scroll/interact during credits

- [ ] **Step 4: Log findings and commit fixes**

```bash
git add 404.html lol.html secret.html docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: special pages audit — [describe specific fixes]"
```

---

## Task 9: Audit Speedrun Mode

**Files:**
- Modify: `js/gimmicks/speedrun.js`

- [ ] **Step 1: Start speedrun mode**

Navigate to `http://localhost:8080/index.html?speedrun=true`.

Verify:
- Timer UI appears (fixed position, top-right)
- Timer starts counting up
- Format shows "▶ Speedrun" + time + "1 / 12 pages"

- [ ] **Step 2: Test page tracking**

Click through pages using navigation. After each page, verify:
- Counter increments (e.g., "2 / 12 pages", "3 / 12 pages")
- `?speedrun=true` is appended to all links
- Timer continues running across page loads

- [ ] **Step 3: Test completion**

Visit all 12 required pages:
1. index.html
2. hub.html
3. zones/scroll-animations.html
4. zones/popover-dialog.html
5. zones/css-art.html
6. zones/container-queries.html
7. zones/view-transitions.html
8. zones/houdini.html
9. zones/has-selector.html
10. zones/cascade-layers.html
11. playground.html
12. components.html

Verify on the 12th page:
- Trophy emoji appears
- Timer stops
- Border turns green
- "Speedrun complete!" text shows
- sessionStorage is cleared

- [ ] **Step 4: Test link propagation on dynamic elements**

Verify the MutationObserver in speedrun.js catches dynamically added links and appends `?speedrun=true`. This is important because some gimmicks add links after page load (e.g., guestbook dialog, context menu).

- [ ] **Step 5: Future-proof page count**

The current `SPEEDRUN_PAGES` array is hardcoded to 12 pages. Since we're adding pages in Layer 2 (arcade, lab, achievements, glossary, changelog), update the comment to note this will need updating:

In `js/gimmicks/speedrun.js`, add a comment above `SPEEDRUN_PAGES`:

```javascript
// NOTE: Update this list when adding new pages to the site.
// Layer 2 expansion will add: arcade.html, lab.html, achievements.html, glossary.html, changelog.html
// Speedrun categories (any%, all-zones, 100%) will be added in Layer 2.
const SPEEDRUN_PAGES = [
```

- [ ] **Step 6: Commit**

```bash
git add js/gimmicks/speedrun.js docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: speedrun mode audit — add future-proof comments"
```

---

## Task 10: Audit Chiptune Player

**Files:**
- Modify: `js/gimmicks/chiptune.js`

- [ ] **Step 1: Test chiptune player activation**

Find the chiptune trigger on the landing page (in the 1996 era section). Click it.

Verify:
- Audio starts playing (you hear 8-bit music)
- No console errors about AudioContext
- Player UI shows play/stop state

- [ ] **Step 2: Test AudioContext resume**

Browsers require user interaction before AudioContext can play. Verify:
- First click properly resumes the AudioContext
- If AudioContext is suspended, it resumes before playing
- No "AudioContext was not allowed to start" errors

If there's a resume issue, fix in `js/gimmicks/chiptune.js`. Find where AudioContext is used and ensure:

```javascript
async function startChiptune() {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  // ... rest of playback code
}
```

- [ ] **Step 3: Test stop/restart**

Click stop. Verify audio stops. Click play again. Verify audio restarts from beginning. Rapidly click play/stop multiple times. Verify no audio glitches or overlapping sounds.

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/chiptune.js docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: chiptune player audit — [describe specific fixes]"
```

---

## Task 11: Audit Page Transitions

**Files:**
- Modify: `js/transitions.js`

- [ ] **Step 1: Test page-to-page transitions**

Navigate between pages using navigation links. Verify:
- Transition animation plays (if View Transitions API is supported)
- No flash of unstyled content
- No broken state after transition
- Back button works correctly after transition

- [ ] **Step 2: Test View Transitions API feature detection**

Check `js/transitions.js` for feature detection. If it calls `document.startViewTransition()` without checking support, add:

```javascript
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // transition logic
  });
} else {
  // Fallback: standard navigation
  window.location.href = targetUrl;
}
```

- [ ] **Step 3: Test transitions across all page types**

Verify transitions work for:
- Landing → Hub
- Hub → Zone
- Zone → Zone (next zone link)
- Zone → Hub (back link)
- Any page → Playground
- Any page → Components

- [ ] **Step 4: Commit**

```bash
git add js/transitions.js docs/superpowers/plans/layer-0-bug-report.md
git commit -m "fix: page transitions audit — [describe specific fixes]"
```

---

## Task 12: Cross-Browser Spot Check

**Files:**
- Modify: Any files with browser-specific issues

- [ ] **Step 1: Test in Firefox**

Open `http://localhost:8080` in Firefox. Run through a quick check:
- Landing page loads, gimmicks work
- Hub constellation renders
- Playground editor works
- One zone (css-art) — toggles work
- Theme toggle works
- Keyboard shortcuts work
- Console is error-free

Log any Firefox-specific issues to bug report.

- [ ] **Step 2: Check :has() support**

Firefox has supported `:has()` since Firefox 121 (Dec 2023). Verify all `:has()` selectors in the CSS art zone and has-selector zone work in Firefox. If there are any edge cases, add fallback styles.

- [ ] **Step 3: Check View Transitions API**

Firefox does NOT support View Transitions API as of early 2026. Verify the fallback in `transitions.js` works — pages should navigate without transition effects, no errors.

- [ ] **Step 4: Check Houdini Paint API**

Firefox does NOT support CSS Paint API. Verify the Houdini zone shows a graceful fallback message instead of a blank area.

- [ ] **Step 5: Log findings and commit fixes**

```bash
git add -A
git commit -m "fix: cross-browser compatibility fixes — [describe specific fixes]"
```

---

## Task 13: Accessibility Audit

**Files:**
- Modify: HTML files as needed

- [ ] **Step 1: Keyboard-only navigation test**

Starting from index.html, navigate the ENTIRE site using only keyboard:
- Tab through all interactive elements
- Verify visible focus indicator on every focusable element
- Verify tab order is logical (left-to-right, top-to-bottom)
- Verify skip-to-content link works (first Tab press)
- Verify Escape closes popovers/dialogs
- Verify Enter/Space activates buttons and links

- [ ] **Step 2: Check ARIA attributes**

For each interactive custom element, verify:
- Buttons: `role="button"` (or `<button>` element), `aria-label` if icon-only
- Toggles: `aria-pressed` or `aria-checked` attribute updates with state
- Popovers: `aria-expanded` on trigger, `aria-controls` pointing to popover ID
- Dialogs: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`

Fix any missing attributes.

- [ ] **Step 3: Check prefers-reduced-motion**

Enable reduced motion in DevTools. Navigate through the entire site. Verify:
- No animations play (or only essential functional ones)
- Scroll-driven animations are disabled
- Page transitions are instant (no motion)
- Chiptune visualizations (if any) are static

- [ ] **Step 4: Commit accessibility fixes**

```bash
git add *.html
git commit -m "fix: accessibility audit — [describe specific fixes]"
```

---

## Task 14: Mobile Responsiveness Audit

**Files:**
- Modify: CSS files as needed, HTML files as needed

- [ ] **Step 1: Test all pages at 375px (iPhone SE)**

Using DevTools device emulation (375x667), visit every page. Check:
- No horizontal overflow (nothing extends past viewport)
- Text is readable (≥ 14px)
- Buttons/links are tappable (≥ 44x44px touch targets)
- Images/SVGs scale correctly
- Cards stack in single column

Log layout issues per page.

- [ ] **Step 2: Test all pages at 768px (iPad)**

Using DevTools device emulation (768x1024), check:
- Grid layouts switch to appropriate column count
- No awkward spacing or orphaned elements

- [ ] **Step 3: Test touch interactions**

In DevTools with touch emulation:
- Verify context menu does NOT fire on touch (right-click doesn't exist on mobile)
- Log this as a known issue for Layer 1 (long-press menu replacement)
- Verify card tilt effect is disabled on touch (no mousemove on mobile)
- Verify playground editor is usable with touch keyboard

- [ ] **Step 4: Commit responsive fixes**

```bash
git add css/*.css *.html zones/*.html
git commit -m "fix: mobile responsiveness audit — [describe specific fixes]"
```

---

## Task 15: Finalize Bug Report & Push

**Files:**
- Modify: `docs/superpowers/plans/layer-0-bug-report.md`

- [ ] **Step 1: Compile final bug report**

Review all logged bugs. Categorize each as:
- **Fixed** — resolved during this audit
- **Deferred to Layer 1** — enhancement, not a bug (e.g., mobile context menu)
- **Deferred to Layer 2** — requires new system (e.g., speedrun page count)
- **Won't Fix** — intentional behavior (document why)

Update the bug report with final status for each item.

- [ ] **Step 2: Final console error sweep**

Quickly visit every page one more time. Verify zero console errors on all 15 pages:
1. index.html
2. hub.html
3. playground.html
4. components.html
5. 404.html
6. lol.html
7. secret.html
8. zones/scroll-animations.html
9. zones/popover-dialog.html
10. zones/css-art.html
11. zones/container-queries.html
12. zones/view-transitions.html
13. zones/houdini.html
14. zones/has-selector.html
15. zones/cascade-layers.html

- [ ] **Step 3: Commit final bug report**

```bash
git add docs/superpowers/plans/layer-0-bug-report.md
git commit -m "docs: finalize Layer 0 audit bug report"
```

- [ ] **Step 4: Push all Layer 0 changes**

```bash
git push origin main
```

- [ ] **Step 5: Verify live site**

Visit `https://ixmxamar.github.io/A-Love-Letter-To-The-Internet/` and verify the pushed fixes are live (may take 1-2 minutes for GitHub Pages to rebuild).

---

## Summary

| Task | Scope | Est. Steps |
|------|-------|-----------|
| 1 | Setup & bug report template | 3 |
| 2 | Global systems (global.js) | 12 |
| 3 | Landing page | 12 |
| 4 | Hub page | 6 |
| 5 | Playground page | 9 |
| 6 | Components page | 8 |
| 7 | All 8 zone pages | 10 |
| 8 | Special pages (404, lol, secret) | 4 |
| 9 | Speedrun mode | 6 |
| 10 | Chiptune player | 4 |
| 11 | Page transitions | 4 |
| 12 | Cross-browser | 5 |
| 13 | Accessibility | 4 |
| 14 | Mobile responsiveness | 4 |
| 15 | Finalize & push | 5 |
| **Total** | | **96 steps** |

**After Layer 0 is complete:** Proceed to Layer 1 plan (Core Enhancements — Animations, Polish & New Gimmicks).
