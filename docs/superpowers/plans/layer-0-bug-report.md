# Layer 0 Bug Report

## Severity
- **Critical:** Feature completely broken, JS error blocking page
- **Major:** Feature partially broken, visible UX issue
- **Minor:** Cosmetic, edge case, or non-blocking issue

## Bugs Found

| # | Page | Severity | Description | Status |
|---|------|----------|-------------|--------|
| 1 | global.js:72 | Major | Tab title visibility change had no debounce — rapid tab switching caused title flicker/race | FIXED |
| 2 | global.js:152 | Major | `showPopover()` on already-open popover throws InvalidStateError — keyboard `?` shortcut unguarded | FIXED |
| 3 | global.js:203-215 | Major | Context menu `showPopover`/`hidePopover` calls unguarded — throws if popover already in target state | FIXED |
| 4 | global.js:147 | Minor | Keyboard shortcut guard missing `SELECT` tag — shortcuts fire while interacting with select elements | FIXED |
| 5 | global.js:158-171 | Minor | Navigation shortcuts (h, p, c) missing `e.preventDefault()` — potential browser default key interference | FIXED |
| 6 | global.js:222 | Minor | `navigator.clipboard.writeText()` returns a Promise that can reject — unhandled rejection on permission deny | FIXED |
| 7 | global.js:217 | Info | `view-source:` protocol blocked by most modern browsers — `window.open()` silently fails | KNOWN |
| 8 | global.js:101-108 | Info | Theme toggle logic is correct but reads inverted — `next='dark'` removes attribute, `next='light'` sets it | OK |
| 9 | global.js:273 | Info | Scroll velocity `dt` division-by-zero guarded with `|| 1` — no NaN risk | OK |
| 10 | global.js:327 | Info | `_month === 11` for December is correct (0-indexed getMonth) | OK |
| 11 | global.js:447 | Info | Speedrun import path `./speedrun.js` resolves correctly to `js/gimmicks/speedrun.js` | OK |
| 12 | landing.js:77 | Major | Visitor counter regex `(\d{3})(\d{3})(\d+)` captures 3 groups but replacement `${a},${b}` drops the last group — count 4272 displays as "000,427" instead of "0,004,272" | FIXED |
| 13 | landing.js:7-63 | Major | Typewriter clip-path animation has no fallback for browsers without `clip-path: inset()` support — content stays invisible | FIXED |
| 14 | landing.js:233-247 | Major | Dark mode card uses independent toggle logic (`setAttribute('data-theme','dark')`) conflicting with global.js which uses `removeAttribute` for dark — toggling from card breaks global theme state | FIXED |
| 15 | landing.js:291-316 | Major | All 9 gimmick inits called sequentially without try-catch — one failure prevents all subsequent gimmicks from initializing | FIXED |
| 16 | landing.js:224 | Minor | Card tilt sets inline `perspective(600px)` conflicting with CSS `perspective: 800px` on `.card-flip-root`; also applies tilt while card is flipped causing visual glitch | FIXED |
| 17 | landing.js:86-122 | Info | Guestbook dialog open/close, backdrop click dismiss, and form submit/reset all verified correct | OK |
| 18 | landing.js:125-150 | Info | Hampster dance triple-click handler and 5s bounce timeout verified correct | OK |
| 19 | landing.js:153-180 | Info | Hypermedia font cycle (7 fonts, mouseenter/mouseleave) verified correct | OK |
| 20 | landing.js:250-288 | Info | Flex centering popover triple-click and popover API usage verified correct | OK |
| 21 | hub.html | Major | SVG constellation line coordinates did not match actual node positions — all 8 lines misaligned | FIXED |
| 22 | hub.css | Major | `animation-delay: calc(var(--node-x) * 10ms)` invalid — percentage string can't multiply with ms unit — pulse stagger never worked | FIXED |
| 23 | hub.js | Minor | No try-catch wrapper, inconsistent with hub-gm.js graceful degradation pattern | FIXED |
| 24 | hub-gm.js | Major | Konami code explosion set transform clobbering CSS centering `translate(-50%, -50%)` — nodes jumped to wrong positions | FIXED |
| 25 | playground-gm.js | Critical | Duplicate Tab key handler — both playground.js and playground-gm.js handled Tab, inserting 4 spaces instead of 2 | FIXED |
| 26 | playground-gm.js | Critical | Gimmick triggers (`!important`, `display: none`, `color: red`, `rotate(180deg)`) used `text.includes()` without tracking previous state — every keystroke re-triggered effects | FIXED |
| 27 | playground.js | Info | Line number scroll sync is a no-op (harmless — siblings scroll together via parent) | OK |
| 28 | playground.js | Info | `document.execCommand` deprecated but no alternative exists for contenteditable undo history | OK |
| 29 | components.html | Critical | Copy buttons non-functional — `.copy-btn` elements lack `data-copy-target` attribute; `initCopyButtons()` found zero buttons | FIXED |
| 30 | toolkit.css | Critical | Tab panel switching broken — no CSS rules for panel visibility toggling; both panels displayed simultaneously | FIXED |
| 31 | toolkit.css | Major | Copy button not positioned — missing `position: absolute`; buttons rendered in normal flow | FIXED |
| 32 | toolkit.css | Major | Tab-group base layout missing — nav lacked `display: flex`, labels lacked cursor/transitions, radio inputs not hidden | FIXED |
| 33 | components.html | Major | Missing ARIA on popover — no `aria-expanded` or `aria-controls`, state not synced on open/close | FIXED |
| 34 | components.html | Minor | Missing ARIA on toast — no `role="status"` or `aria-live="polite"` for screen reader announcement | FIXED |
| 35 | components.html | Minor | Missing ARIA on dialog — no `aria-labelledby` linking dialog to its title heading | FIXED |
| 36 | toolkit.css | Major | Dark backgrounds hardcoded — component demos use oklch dark values that don't adapt to light theme | FIXED |
| 37 | components.html | Minor | Module timing issue — `DOMContentLoaded` inside `type="module"` may have already fired | FIXED |
| 38 | zones/scroll-animations | Major | `.scroll-progress-bar` class doesn't match zones.js selector `.scroll-progress` — progress bar invisible | FIXED |
| 39 | zones/popover-dialog | Major | Missing scroll-progress bar element entirely | FIXED |
| 40 | zones/css-art | Major | Missing scroll-progress bar element entirely | FIXED |
| 41 | zones/houdini | Major | Missing scroll-progress bar element entirely | FIXED |
| 42 | zones/css-art | Minor | "Zone 3 of 9" should be "Zone 3 of 8" | FIXED |
| 43 | zones/css-art | Major | "Next Zone" link goes to hub.html instead of container-queries.html | FIXED |
| 44 | zones/css-art | Minor | Playground readout shows clip-path when CSS actually applies `clip-path: none` (both toggles checked) | FIXED |
| 45 | zones/has-selector | Minor | Logo links to hub.html instead of index.html (inconsistent with other zones) | FIXED |
| 46 | zones/css-art, houdini | Major | Missing `--zone-color` CSS variable on body — zones.js can't apply colored progress bar | FIXED |
| 47 | zones/container, view-trans | Major | `--zone-color` set on child elements but not on body — zones.js reads from documentElement/body | FIXED |
| 48 | zones.js | Major | Only reads `--zone-color` from documentElement, misses pages that set it on body | FIXED |
| 49 | zone-layers.js | Minor | Native drag fallback drop handler references null `dragCard` instead of `dragSrc` | FIXED |
| 50 | zone-scroll.css | Minor | Class `.scroll-progress-bar` needed update to `.scroll-progress` | FIXED |
| 51 | secret.html | Critical | Credits centering broken — `transform: translateX(-50%)` overridden by animation's `translateY()` | FIXED |
| 52 | secret.html | Major | No navigation back to main site after credits end — user stranded | FIXED |
| 53 | 404.html | Minor | Space key on fact-box scrolls page (missing preventDefault) | FIXED |
| 54 | lol.html | Minor | Dead gradient/background-clip CSS on .spinner-wrapper serving no purpose | FIXED |
| 55 | lol.html | Minor | Back-link hardcoded color doesn't adapt to light theme | FIXED |
| 56 | speedrun.js | Critical | `JSON.parse()` on corrupted sessionStorage data crashes entire module — no try-catch | FIXED |
| 57 | speedrun.js | Major | `?speedrun=true` appended to ALL links including external (MDN, GitHub) — leaks param | FIXED |
| 58 | speedrun.js | Minor | Duplicate inline link-tagging logic in initial scan and MutationObserver | FIXED |
| 59 | speedrun.js | Minor | `formatTime()` doesn't handle negative ms (clock skew) | FIXED |
| 60 | speedrun.js | Minor | `getCurrentPageKey()` doesn't strip trailing slashes | FIXED |
| 61 | chiptune.js | Critical | `audioCtx.resume()` not awaited — playback silent on first click | FIXED |
| 62 | chiptune.js | Critical | No oscillator cleanup on stop — audio bleed from scheduled oscillators | FIXED |
| 63 | chiptune.js | Major | No error handling around Web Audio API calls | FIXED |
| 64 | landing.js | Major | Rapid-click race condition on chiptune — overlapping toggleMusic calls | FIXED |
| 65 | transitions.js | Major | No error handling — if startViewTransition throws, navigation fails silently | FIXED |
| 66 | transitions.js | Minor | No external link filtering — links with target="_blank" or external origins intercepted | FIXED |
| 67 | zone-scroll.css, landing.css | Critical | `animation-timeline: scroll()` without `@supports` — Firefox fires animation at 0s duration, elements jump to end state | FIXED |
| 68 | zones/popover-dialog | Major | `showPopover()`/`hidePopover()` called without API existence check — TypeError in older browsers | FIXED |
| 69 | zone-popover.css | Major | `position-area: center` Chromium-only, no fallback — popover unpredictably positioned in Firefox/Safari | FIXED |
| 70 | zone-container.css, zone-houdini.css | Major | `oklch(from ...)` relative color syntax unsupported in Firefox <128 — borders/backgrounds disappear | FIXED |
| 71 | zones/popover-dialog | Minor | Clipboard API calls without `.catch()` or existence check — unhandled rejection on non-HTTPS | FIXED |
| 72 | 404, lol, secret.html | Major | Missing skip-to-main-content links (present on all other pages) | FIXED |
| 73 | 404, lol, secret.html | Major | Missing `<main>` landmark element | FIXED |
| 74 | index.html | Minor | Guestbook dialog missing `aria-modal="true"` | FIXED |
| 75 | zones/popover-dialog | Minor | Demo dialog missing `aria-labelledby`, popover triggers missing `aria-haspopup`/`aria-expanded` | FIXED |
| 76 | components-gm.js | Minor | CSS-only tab groups missing `aria-selected` sync on tab change | FIXED |
| 77 | zones/has-selector | Minor | Incorrect `role="tablist"` on non-tab container (cards displayed simultaneously) | FIXED |
| 78 | zone-scroll.css | Minor | Range slider missing `:focus-visible` outline (had `outline: none` with no replacement) | FIXED |
| 79 | zone-houdini.css | Minor | Houdini slider missing `:focus-visible` outline | FIXED |
| 80 | playground.css | Minor | Code editor missing `:focus-visible` indicator | FIXED |
| 81 | zone-transitions.js | Minor | Card detail overlay missing focus trap and focus restore | FIXED |
| 82 | landing.js | Minor | CSS3 flip cards not keyboard-operable (no tabindex, role, or key handler) | FIXED |
| 83 | 404, lol, secret.html | Minor | Missing `prefers-reduced-motion` overrides for page-specific animations | FIXED |
| 84 | css/base.css | Minor | Input font-size not forced to 16px on mobile — iOS auto-zoom on focus | FIXED |
| 85 | landing.css | Minor | Guestbook input fields at 0.85rem (13.6px) — iOS auto-zoom trigger | FIXED |
| 86 | playground.css | Minor | Pane icon buttons at 24x24px — below 44px minimum touch target | FIXED |
| 87 | landing.css | Minor | Close, submit, and chiptune buttons below 44px minimum touch target | FIXED |
| 88 | gimmicks.css | Minor | Shortcut help close button and reduced-motion badge button below 44px touch target | FIXED |
| 89 | zone-container.css | Minor | Grid min column 240px exceeds 375px viewport with padding — horizontal overflow | FIXED |
| 90 | zone-houdini.css | Minor | 4-column support grid overflows on mobile — needs 2-column fallback | FIXED |
| 91 | zone-layers.css | Minor | Glass stack art overflows on 375px viewport | FIXED |
| 92 | landing.js | Minor | Card 3D tilt fires on touch devices where mousemove doesn't apply | FIXED |

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| Critical | 10 | 10 |
| Major | 30 | 30 |
| Minor | 37 | 37 |
| Info/OK | 15 | N/A |
| **Total bugs** | **77** | **77 fixed** |
