/**
 * cursor-ghosts.js — Layer 1 / Task 22
 * Opt-in collaborative cursor ghosts. Call via window.ghosts.on() / .off().
 */

const NAMES = ['visitor_42', 'css_lover', 'firstpaint', 'pxperfect', 'floatingpoint', 'oklch_fan'];
const PATHS = [
  [[10,10],[25,20],[40,30],[50,50],[70,65],[80,80],[90,60]],
  [[50,10],[30,25],[20,45],[35,60],[55,70],[75,55],[85,40]],
  [[80,20],[60,15],[45,30],[35,50],[50,75],[70,80]],
];

export function startGhosts() {
  stopGhosts();
  PATHS.forEach((path, i) => {
    const el = document.createElement('div');
    el.className = 'ghost-cursor';
    el.style.setProperty('--ghost-hue', (120 + i * 60) % 360);
    const label = document.createElement('span');
    label.className = 'ghost-cursor__label';
    label.textContent = NAMES[(Math.random() * NAMES.length) | 0];
    el.appendChild(label);
    document.body.appendChild(el);
    animatePath(el, path, 8000 + Math.random() * 4000, Math.random() * 2000);
  });
}

export function stopGhosts() {
  document.querySelectorAll('.ghost-cursor').forEach(el => el.remove());
}

function animatePath(el, path, duration, delay) {
  const start = performance.now() + delay;
  const step = (now) => {
    if (!el.isConnected) return;
    const t = (now - start) / duration;
    if (t < 0) { requestAnimationFrame(step); return; }
    const tt = t % 1;
    const seg = tt * (path.length - 1);
    const i = Math.floor(seg); const f = seg - i;
    const a = path[i]; const b = path[i + 1] || path[i];
    const x = (a[0] + (b[0] - a[0]) * f) / 100 * innerWidth;
    const y = (a[1] + (b[1] - a[1]) * f) / 100 * innerHeight;
    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
