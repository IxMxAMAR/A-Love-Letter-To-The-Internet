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
