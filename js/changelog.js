/**
 * changelog.js — Era switcher (Layer 2 / Task 8)
 *
 * Swaps body[data-era] to "time travel" the entire page through
 * v0.1 → v0.5 → v1.0 → v2.0 (default, no attribute).
 */

const buttons = document.querySelectorAll('.time-travel-controls button');

buttons.forEach(b => {
  b.addEventListener('click', () => {
    const era = b.dataset.era;

    buttons.forEach(x => {
      x.classList.remove('active');
      x.setAttribute('aria-checked', 'false');
    });
    b.classList.add('active');
    b.setAttribute('aria-checked', 'true');

    if (era === 'v2.0') {
      document.body.removeAttribute('data-era');
    } else {
      document.body.setAttribute('data-era', era);
    }
  });
});
