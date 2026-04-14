function initParallax() {
  try {
    const constellation = document.getElementById('constellation');
    if (!constellation) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    constellation.addEventListener('mousemove', (e) => {
      const rect = constellation.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      constellation.style.setProperty('--mouse-x', x.toFixed(3));
      constellation.style.setProperty('--mouse-y', y.toFixed(3));

      constellation.querySelectorAll('.zone-node').forEach((node) => {
        const depth = parseFloat(node.style.getPropertyValue('--node-y')) / 100;
        const shiftX = x * 20 * depth;
        const shiftY = y * 15 * depth;
        node.style.setProperty('--parallax-x', `${shiftX}px`);
        node.style.setProperty('--parallax-y', `${shiftY}px`);
      });
    });

    const style = document.createElement('style');
    style.textContent = `
      .zone-node {
        translate: var(--parallax-x, 0) var(--parallax-y, 0);
      }
    `;
    document.head.appendChild(style);
  } catch (e) {
    console.warn('[hub] parallax:', e);
  }
}

document.addEventListener('DOMContentLoaded', initParallax);
