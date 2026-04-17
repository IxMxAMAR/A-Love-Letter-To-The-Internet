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
  has: 'A parent selector — matches an element that contains what the nested selector finds.',
  keyframes: 'A series of styles at named timeline positions used by animation.',
  'aspect-ratio': 'A CSS property that sets a preferred ratio for an element\'s box.',
  clamp: 'A CSS function returning a value clamped between a min and max.',
};

export function initDefs() {
  const tip = document.createElement('div');
  tip.className = 'defs-tip';
  tip.setAttribute('role', 'tooltip');
  tip.style.cssText = 'position:fixed;padding:8px 12px;background:oklch(0.2 0.02 280);color:white;border-radius:8px;font-size:0.85rem;max-width:280px;z-index:9999;pointer-events:none;opacity:0;transition:opacity 180ms ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
  document.body.appendChild(tip);
  document.addEventListener('dblclick', (e) => {
    const sel = getSelection()?.toString().trim().toLowerCase();
    if (!sel) return;
    const hit = DEFS[sel] || DEFS[sel.replace(/[^a-z-]/g, '')];
    if (!hit) return;
    tip.innerHTML = `<strong>${sel}</strong> — ${hit}`;
    tip.style.left = Math.min(innerWidth - 300, e.clientX + 12) + 'px';
    tip.style.top = (e.clientY + 12) + 'px';
    tip.style.opacity = '1';
    tip.style.pointerEvents = 'auto';
    clearTimeout(tip._hideT);
    tip._hideT = setTimeout(() => { tip.style.opacity = '0'; tip.style.pointerEvents = 'none'; }, 4000);
  });
}
