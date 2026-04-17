/**
 * magnetic.js — Layer 1 / Task 13
 * Elements tagged `.magnetic` get pulled toward the cursor when within 80px.
 * Max pull = 8px. Disabled on touch pointers and prefers-reduced-motion.
 */

export function initMagnetic() {
  if (matchMedia('(pointer: coarse)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.magnetic');
  if (!targets.length) return;
  const RADIUS = 80;
  const MAX = 8;
  let rafPending = false;
  let lastX = 0, lastY = 0;
  addEventListener('mousemove', (e) => {
    lastX = e.clientX; lastY = e.clientY;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      targets.forEach((t) => {
        const r = t.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = lastX - cx, dy = lastY - cy;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS) {
          const f = 1 - d / RADIUS;
          t.style.transform = `translate(${(dx / RADIUS) * MAX * f}px, ${(dy / RADIUS) * MAX * f}px)`;
        } else {
          t.style.transform = '';
        }
      });
    });
  });
}
