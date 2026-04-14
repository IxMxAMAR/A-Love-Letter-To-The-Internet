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
