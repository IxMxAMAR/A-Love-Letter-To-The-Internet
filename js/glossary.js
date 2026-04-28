/**
 * glossary.js — Glossary Page (Layer 2 / Task 7)
 *
 * Searchable CSS dictionary, 80 entries, sticky letter headers,
 * "/" focus shortcut, random-term jump with flash highlight.
 */

const TERMS = [
  // ── Layout ───────────────────────────────────────────────────
  { term: 'flex',                cat: 'Layout',     def: 'One-dimensional layout for aligning items along a row or column.',                                see: 'zones/container-queries.html' },
  { term: 'grid',                cat: 'Layout',     def: 'Two-dimensional layout system with rows and columns.',                                            see: 'zones/container-queries.html' },
  { term: 'gap',                 cat: 'Layout',     def: 'Space between rows and columns in flex/grid containers.',                                         see: 'zones/container-queries.html' },
  { term: 'aspect-ratio',        cat: 'Layout',     def: 'Sets a preferred ratio for an element’s box.',                                                    see: 'playground.html' },
  { term: 'container-query',     cat: 'Layout',     def: 'Styles that respond to a containing element’s size, not the viewport.',                           see: 'zones/container-queries.html' },
  { term: 'container-type',      cat: 'Layout',     def: 'Property that establishes a container query context.',                                            see: 'zones/container-queries.html' },
  { term: 'container-name',      cat: 'Layout',     def: 'Names a containment context so child @container queries can target it.',                          see: 'zones/container-queries.html' },
  { term: 'subgrid',             cat: 'Layout',     def: 'Allows nested grids to inherit row/column tracks from their parent.',                             see: 'zones/container-queries.html' },
  { term: 'inset',               cat: 'Layout',     def: 'Shorthand for top/right/bottom/left.',                                                            see: 'playground.html' },
  { term: 'place-items',         cat: 'Layout',     def: 'Shorthand for align-items + justify-items.',                                                      see: 'zones/container-queries.html' },
  { term: 'logical-properties',  cat: 'Layout',     def: 'Direction-aware properties like inline-start, block-end.',                                        see: 'zones/container-queries.html' },
  { term: 'minmax',              cat: 'Layout',     def: 'Grid track function that constrains a track between a min and max size.',                         see: 'zones/container-queries.html' },
  { term: 'fr',                  cat: 'Layout',     def: 'Flexible grid track unit — a fraction of available space.',                                       see: 'zones/container-queries.html' },
  { term: 'auto-fit',            cat: 'Layout',     def: 'repeat() keyword that collapses empty tracks for responsive grids.',                              see: 'zones/container-queries.html' },
  { term: 'scroll-snap-type',    cat: 'Layout',     def: 'Defines how strictly snap points are enforced on a scroll container.',                            see: 'zones/scroll-animations.html' },
  { term: 'scroll-margin-top',   cat: 'Layout',     def: 'Outset around an element when used as a scroll target — useful for fixed headers.',               see: 'zones/scroll-animations.html' },

  // ── Color ────────────────────────────────────────────────────
  { term: 'oklch',               cat: 'Color',      def: 'Perceptually uniform color space — lightness, chroma, hue.',                                      see: 'index.html' },
  { term: 'color-mix',           cat: 'Color',      def: 'Mixes two colors in a given color space.',                                                        see: 'playground.html' },
  { term: 'currentColor',        cat: 'Color',      def: 'Resolves to the element’s text color value.',                                                     see: 'components.html' },
  { term: 'rgb',                 cat: 'Color',      def: 'Red/Green/Blue triplet color.',                                                                   see: 'components.html' },
  { term: 'hsl',                 cat: 'Color',      def: 'Hue/Saturation/Lightness color model.',                                                           see: 'components.html' },
  { term: 'gradient',            cat: 'Color',      def: 'Smooth transition between colors (linear, radial, conic).',                                      see: 'index.html' },
  { term: 'conic-gradient',      cat: 'Color',      def: 'Sweeping gradient around a center point.',                                                        see: 'zones/css-art.html' },
  { term: 'accent-color',        cat: 'Color',      def: 'Themes form controls (checkboxes, radios, range) without rebuilding them.',                      see: 'components.html' },
  { term: 'light-dark',          cat: 'Color',      def: 'Returns one of two values based on the user’s color-scheme preference.',                          see: 'components.html' },
  { term: 'prefers-color-scheme',cat: 'Color',      def: 'Media query matching the user’s preferred light or dark color scheme.',                           see: 'components.html' },

  // ── Animation ────────────────────────────────────────────────
  { term: 'keyframes',           cat: 'Animation',  def: 'Named timeline of styles for use by animation.',                                                  see: 'zones/scroll-animations.html' },
  { term: 'transition',          cat: 'Animation',  def: 'Smoothly animates property changes between two states.',                                          see: 'components.html' },
  { term: 'animation-timeline',  cat: 'Animation',  def: 'Drives animations from scroll position or element visibility.',                                   see: 'zones/scroll-animations.html' },
  { term: 'view-timeline',       cat: 'Animation',  def: 'Animation timeline tied to an element’s scroll-port progress.',                                   see: 'zones/scroll-animations.html' },
  { term: 'scroll-timeline',     cat: 'Animation',  def: 'Animation timeline tied to a scroll container’s progress.',                                       see: 'zones/scroll-animations.html' },
  { term: 'starting-style',      cat: 'Animation',  def: 'Defines styles for an element to animate from when first rendered.',                              see: 'zones/popover-dialog.html' },
  { term: 'ease',                cat: 'Animation',  def: 'Easing function controlling rate of change.',                                                     see: 'zones/scroll-animations.html' },
  { term: 'cubic-bezier',        cat: 'Animation',  def: 'Custom easing defined by a cubic Bezier curve.',                                                  see: 'playground.html' },
  { term: 'will-change',         cat: 'Animation',  def: 'Hints to the browser that an element will change, enabling GPU compositing.',                     see: 'zones/scroll-animations.html' },
  { term: 'prefers-reduced-motion', cat: 'Animation', def: 'Media query honoring users who request reduced motion. Always respect it.',                     see: 'zones/scroll-animations.html' },

  // ── Selector ─────────────────────────────────────────────────
  { term: 'cascade',             cat: 'Selector',   def: 'Algorithm deciding which CSS rule wins.',                                                         see: 'zones/cascade-layers.html' },
  { term: 'specificity',         cat: 'Selector',   def: 'Selector weight that determines rule priority.',                                                  see: 'zones/cascade-layers.html' },
  { term: 'cascade-layers',      cat: 'Selector',   def: 'Named layers that explicitly order origin styles.',                                               see: 'zones/cascade-layers.html' },
  { term: 'has',                 cat: 'Selector',   def: 'Parent selector — matches an element containing what the nested selector finds.',                see: 'zones/has-selector.html' },
  { term: 'is',                  cat: 'Selector',   def: 'Matches any selector in its argument list.',                                                      see: 'zones/has-selector.html' },
  { term: 'where',               cat: 'Selector',   def: 'Like :is() but with zero specificity weight.',                                                    see: 'zones/cascade-layers.html' },
  { term: 'not',                 cat: 'Selector',   def: 'Matches elements that don’t match the inner selector.',                                          see: 'zones/has-selector.html' },
  { term: 'nth-child',           cat: 'Selector',   def: 'Matches elements based on position within siblings.',                                             see: 'zones/has-selector.html' },
  { term: 'pseudo-element',      cat: 'Selector',   def: 'Selectors like ::before, ::after, ::selection that style virtual parts.',                          see: 'components.html' },
  { term: 'attribute-selector',  cat: 'Selector',   def: 'Selectors like [data-x="y"] matching elements by attributes.',                                    see: 'components.html' },
  { term: 'inherit',             cat: 'Selector',   def: 'Keyword that copies a parent property’s value onto the child.',                                  see: 'components.html' },
  { term: 'initial',             cat: 'Selector',   def: 'Keyword that resets a property to its CSS-defined initial value.',                                see: 'components.html' },
  { term: 'revert',              cat: 'Selector',   def: 'Rolls a property back to the value from the previous cascade origin.',                            see: 'zones/cascade-layers.html' },

  // ── Typography ───────────────────────────────────────────────
  { term: 'font-feature-settings', cat: 'Typography', def: 'Enables OpenType features like ligatures, small caps.',                                         see: 'components.html' },
  { term: 'text-balance',        cat: 'Typography', def: 'Distributes text evenly across lines for better headings.',                                       see: 'components.html' },
  { term: 'text-wrap',           cat: 'Typography', def: 'Controls line-breaking strategy: balance, pretty, stable.',                                       see: 'components.html' },
  { term: 'letter-spacing',      cat: 'Typography', def: 'Tracking — extra space between characters.',                                                      see: 'components.html' },
  { term: 'line-height',         cat: 'Typography', def: 'Vertical space between lines.',                                                                   see: 'components.html' },
  { term: 'clamp',               cat: 'Typography', def: 'Returns a value clamped between a min and max.',                                                  see: 'index.html' },
  { term: 'ch',                  cat: 'Typography', def: 'Unit equal to width of "0" character — useful for text widths.',                                  see: 'components.html' },
  { term: 'fluid-type',          cat: 'Typography', def: 'Type that scales with viewport using clamp() and viewport units.',                                see: 'index.html' },
  { term: 'font-variation-settings', cat: 'Typography', def: 'Tunes axes of a variable font (weight, slant, optical-size).',                                see: 'components.html' },

  // ── Shape ────────────────────────────────────────────────────
  { term: 'border-radius',       cat: 'Shape',      def: 'Rounds the corners of an element’s outer border.',                                                see: 'index.html' },
  { term: 'clip-path',           cat: 'Shape',      def: 'Crops an element to a shape (polygon, circle, path).',                                            see: 'zones/css-art.html' },
  { term: 'mask',                cat: 'Shape',      def: 'Hides parts of an element via an image or gradient mask.',                                        see: 'zones/css-art.html' },
  { term: 'shape-outside',       cat: 'Shape',      def: 'Defines a non-rectangular area that float content wraps around.',                                 see: 'zones/css-art.html' },
  { term: 'clip',                cat: 'Shape',      def: 'Legacy property that clips an absolutely-positioned element. Superseded by clip-path.',           see: 'zones/css-art.html' },

  // ── Effect ───────────────────────────────────────────────────
  { term: 'filter',              cat: 'Effect',     def: 'Applies graphical effects: blur, brightness, drop-shadow, etc.',                                  see: 'zones/css-art.html' },
  { term: 'backdrop-filter',     cat: 'Effect',     def: 'Filter applied to area behind an element (e.g., glassmorphism).',                                 see: 'components.html' },
  { term: 'box-shadow',          cat: 'Effect',     def: 'Drop shadow around an element’s border box.',                                                     see: 'components.html' },
  { term: 'mix-blend-mode',      cat: 'Effect',     def: 'How an element’s content blends with its parent.',                                                see: 'zones/css-art.html' },
  { term: 'opacity',             cat: 'Effect',     def: 'Element transparency from 0 (invisible) to 1 (opaque).',                                          see: 'components.html' },
  { term: 'transform',           cat: 'Effect',     def: 'Moves, rotates, scales, or skews an element without affecting layout.',                            see: 'zones/css-art.html' },
  { term: 'transform-origin',    cat: 'Effect',     def: 'Anchor point around which transforms (rotate, scale) operate.',                                   see: 'zones/css-art.html' },
  { term: 'perspective',         cat: 'Effect',     def: '3D viewing distance for transformed children.',                                                   see: 'index.html' },
  { term: 'pointer-events',      cat: 'Effect',     def: 'Whether an element responds to pointer interactions. Set to none to make it transparent to clicks.', see: 'components.html' },
  { term: 'cursor',              cat: 'Effect',     def: 'Selects the mouse cursor over an element.',                                                       see: 'components.html' },
  { term: 'outline',             cat: 'Effect',     def: 'A non-layout-affecting border drawn outside the box. Use for focus rings.',                       see: 'components.html' },
  { term: 'outline-offset',      cat: 'Effect',     def: 'Distance between outline and border edge.',                                                       see: 'components.html' },

  // ── API ──────────────────────────────────────────────────────
  { term: 'view-transition',     cat: 'API',        def: 'Browser API that animates between two DOM states.',                                               see: 'zones/view-transitions.html' },
  { term: 'popover',             cat: 'API',        def: 'Native top-layer floating element controlled via HTML attributes.',                               see: 'zones/popover-dialog.html' },
  { term: 'dialog',              cat: 'API',        def: 'Native modal element with focus trapping and backdrop.',                                          see: 'zones/popover-dialog.html' },
  { term: 'houdini',             cat: 'API',        def: 'Low-level APIs that let developers extend CSS itself.',                                           see: 'zones/houdini.html' },
  { term: 'paint-worklet',       cat: 'API',        def: 'Houdini API for programmatic CSS background painting.',                                           see: 'zones/houdini.html' },
  { term: 'css-properties-and-values', cat: 'API',  def: '@property API for typed, animatable CSS custom properties.',                                      see: 'zones/houdini.html' },
  { term: 'forced-colors',       cat: 'API',        def: 'Media query that detects forced-colors mode (high-contrast).',                                    see: 'components.html' },
  { term: 'dynamic-viewport-units', cat: 'API',     def: 'svh/lvh/dvh units that adapt to mobile browser chrome appearing/disappearing.',                  see: 'index.html' },
  { term: 'scrollbar-color',     cat: 'API',        def: 'Themes scrollbar thumb and track without custom JS.',                                             see: 'components.html' },
];

const content = document.getElementById('glossary-content');
const input = document.getElementById('glossary-search');
const randomBtn = document.getElementById('random-term');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function slug(t) {
  return t.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

function render(filter = '') {
  const q = filter.trim().toLowerCase();
  const filtered = TERMS.filter(t =>
    !q ||
    t.term.toLowerCase().includes(q) ||
    t.def.toLowerCase().includes(q) ||
    t.cat.toLowerCase().includes(q)
  );

  filtered.sort((a, b) => a.term.localeCompare(b.term));

  if (!filtered.length) {
    content.innerHTML = '<p class="gloss-empty">No terms match.</p>';
    return;
  }

  const byLetter = {};
  filtered.forEach(t => {
    const L = t.term[0].toUpperCase();
    byLetter[L] = byLetter[L] || [];
    byLetter[L].push(t);
  });

  content.innerHTML = Object.entries(byLetter)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([L, list]) => `
      <section class="gloss-letter">
        <h2 class="gloss-letter__title">${L}</h2>
        ${list.map(t => `
          <article class="gloss-entry" id="gloss-${slug(t.term)}">
            <h3>${escapeHtml(t.term)}</h3>
            <span class="gloss-cat">${escapeHtml(t.cat)}</span>
            <p>${escapeHtml(t.def)}</p>
            <a href="${escapeHtml(t.see)}">See in action →</a>
          </article>
        `).join('')}
      </section>
    `).join('');
}

render();

input?.addEventListener('input', () => render(input.value));

addEventListener('keydown', (e) => {
  if (e.key === '/' && !e.target.closest('input,textarea,[contenteditable]')) {
    e.preventDefault();
    input?.focus();
    input?.select();
  }
});

randomBtn?.addEventListener('click', () => {
  const t = TERMS[Math.floor(Math.random() * TERMS.length)];
  // Reset filter so random target is always findable
  if (input && input.value) {
    input.value = '';
    render('');
  }
  const el = document.getElementById(`gloss-${slug(t.term)}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el?.classList.add('gloss-flash');
  setTimeout(() => el?.classList.remove('gloss-flash'), 1500);
});

// Expose count for sanity checks / future achievements
window.__glossary = { count: TERMS.length, terms: TERMS };
