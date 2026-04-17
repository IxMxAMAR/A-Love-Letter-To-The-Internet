export function initCursorTrail() {
  if (matchMedia('(pointer: coarse)').matches) return { toggle() {}, set() {} };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { toggle() {}, set() {} };
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  const particles = [];
  let on = false;
  canvas.style.display = 'none';
  const onMove = (e) => {
    if (!on) return;
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 4,
        y: e.clientY + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 + 0.2,
        life: 1,
        hue: 260 + Math.random() * 60,
      });
    }
    while (particles.length > 120) particles.shift();
  };
  addEventListener('mousemove', onMove);
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.03; p.life -= 0.02;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = `oklch(0.8 0.2 ${p.hue})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return {
    toggle() { on = !on; canvas.style.display = on ? '' : 'none'; return on; },
    set(v) { on = !!v; canvas.style.display = on ? '' : 'none'; }
  };
}
