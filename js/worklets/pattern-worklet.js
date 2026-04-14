/**
 * pattern-worklet.js
 * CSS Houdini Paint Worklet — "patternPainter"
 *
 * Reads three @property custom properties and paints a generative
 * geometric pattern: a grid of radial-gradient circles connected
 * by thin connector lines and a diagonal accent overlay.
 *
 * Properties consumed:
 *   --pattern-density   <number>  1–50   — columns & rows in the grid
 *   --pattern-color-h   <number>  0–360  — base hue (HSL)
 *   --pattern-size      <number>  5–100  — max circle radius (px)
 */

class patternPainter {
  /**
   * Declare the custom properties this worklet reads.
   * The browser passes updated values whenever they change,
   * triggering a repaint automatically.
   */
  static get inputProperties() {
    return [
      '--pattern-density',
      '--pattern-color-h',
      '--pattern-size',
    ];
  }

  /**
   * Paint method — called by the browser on every repaint.
   *
   * @param {PaintRenderingContext2D}   ctx   Canvas-like 2D context
   * @param {PaintSize}                 size  { width, height } of the element
   * @param {StylePropertyMapReadOnly}  props Custom property values
   */
  paint(ctx, size, props) {
    const { width, height } = size;

    // ── Read custom properties ─────────────────────────────────
    const rawDensity = props.get('--pattern-density');
    const rawHue     = props.get('--pattern-color-h');
    const rawSize    = props.get('--pattern-size');

    const density = clamp(parseFloat(rawDensity?.toString() ?? '12'), 1, 50);
    const baseHue = parseFloat(rawHue?.toString() ?? '210') % 360;
    const maxSize = clamp(parseFloat(rawSize?.toString() ?? '40'), 5, 100);

    // ── Grid computation ───────────────────────────────────────
    const cols  = Math.round(density);
    const rows  = Math.round(density * (height / width));
    const cellW = width  / cols;
    const cellH = height / Math.max(rows, 1);

    // ── Background fill ────────────────────────────────────────
    ctx.fillStyle = `hsl(${baseHue}, 15%, 8%)`;
    ctx.fillRect(0, 0, width, height);

    // ── Collect grid centres (with deterministic jitter) ───────
    const centres = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seed   = (row * cols + col) * 0.618033; // golden ratio
        const jitterX = (pseudoRandom(seed)       - 0.5) * cellW * 0.35;
        const jitterY = (pseudoRandom(seed + 0.5) - 0.5) * cellH * 0.35;
        centres.push({
          cx: cellW * (col + 0.5) + jitterX,
          cy: cellH * (row + 0.5) + jitterY,
          row,
          col,
        });
      }
    }

    // ── Pass 1: Horizontal & vertical connector lines ──────────
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = `hsl(${baseHue}, 70%, 70%)`;
    ctx.lineWidth   = 0.75;

    for (let i = 0; i < centres.length; i++) {
      const { cx, cy, col, row } = centres[i];

      // Horizontal connector
      if (col < cols - 1) {
        const next = centres[i + 1];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(next.cx, next.cy);
        ctx.stroke();
      }

      // Vertical connector
      if (row < rows - 1) {
        const below = centres[i + cols];
        if (below) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(below.cx, below.cy);
          ctx.stroke();
        }
      }
    }

    ctx.restore();

    // ── Pass 2: Diagonal accent grid ───────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.055;
    ctx.strokeStyle = `hsl(${(baseHue + 60) % 360}, 80%, 80%)`;
    ctx.lineWidth   = 0.5;

    const diag = Math.max(width, height) * 2;
    const step  = cellW * 2;

    for (let x = -diag; x < width + diag; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    ctx.restore();

    // ── Pass 3: Circles (glow + sphere gradient + rim) ─────────
    for (let i = 0; i < centres.length; i++) {
      const { cx, cy } = centres[i];
      const seed = i * 0.618033;

      const radiusFactor = pseudoRandom(seed + 1.0) * 0.65 + 0.2; // 0.2–0.85
      const radius = radiusFactor * maxSize * 0.5;

      const hueMod = (baseHue + (i / centres.length) * 60) % 360;
      const sat    = 60 + pseudoRandom(seed + 2.0) * 30;   // 60–90%
      const light  = 45 + pseudoRandom(seed + 3.0) * 25;   // 45–70%
      const alpha  = 0.55 + pseudoRandom(seed + 4.0) * 0.35; // 0.55–0.9

      // Outer soft glow
      ctx.save();
      ctx.globalAlpha = alpha * 0.18;
      ctx.fillStyle   = `hsl(${hueMod}, ${sat}%, ${light + 15}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sphere with radial gradient
      ctx.save();
      ctx.globalAlpha = alpha;

      const grad = ctx.createRadialGradient(
        cx - radius * 0.25,
        cy - radius * 0.25,
        radius * 0.05,
        cx,
        cy,
        radius
      );
      grad.addColorStop(0,   `hsl(${hueMod}, ${sat}%, ${light + 20}%)`);
      grad.addColorStop(0.6, `hsl(${hueMod}, ${sat}%, ${light}%)`);
      grad.addColorStop(1,   `hsl(${hueMod}, ${sat}%, ${light - 15}%)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Rim highlight
      ctx.globalAlpha = alpha * 0.55;
      ctx.strokeStyle = `hsl(${hueMod}, ${sat}%, ${light + 30}%)`;
      ctx.lineWidth   = 0.75;
      ctx.stroke();

      ctx.restore();
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────

/**
 * Deterministic pseudo-random number in [0, 1).
 * Based on Mulberry32 — stable across repaints with same props.
 * @param {number} seed
 * @returns {number}
 */
function pseudoRandom(seed) {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
}

/**
 * Clamp val to [min, max].
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ── Register ───────────────────────────────────────────────────
registerPaint('patternPainter', patternPainter);
