/**
 * modes.js — Layer 1 / Task 21
 * Focus / Screenshot / Gravity modes + landing pull-refresh easter egg
 */

export function initModes() {
  let focusOn = false, screenshotOn = false, gravityOn = false;

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,[contenteditable]')) return;
    if (e.key === 'f' || e.key === 'F') {
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        focusOn = !focusOn;
        document.documentElement.classList.toggle('mode-focus', focusOn);
        if (focusOn) unlockAchievement('in-the-zone');
        showToast(focusOn ? 'Focus mode \u2014 ESC exits' : 'Focus mode off');
      }
    }
    if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      screenshotOn = !screenshotOn;
      document.documentElement.classList.toggle('mode-screenshot', screenshotOn);
      showToast(screenshotOn ? 'Screenshot mode \u2014 Shift+S exits' : 'Screenshot mode off');
    }
    if (e.key === 'g' || e.key === 'G') {
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        gravityOn = !gravityOn;
        if (gravityOn) startGravity(); else stopGravity();
      }
    }
    if (e.key === 'Escape') {
      if (focusOn) { focusOn = false; document.documentElement.classList.remove('mode-focus'); }
      if (screenshotOn) { screenshotOn = false; document.documentElement.classList.remove('mode-screenshot'); }
      if (gravityOn) { gravityOn = false; stopGravity(); }
    }
  });

  let rafId = null;
  const bodies = [];
  function startGravity() {
    document.querySelectorAll('.gravity-target').forEach((el) => {
      const r = el.getBoundingClientRect();
      bodies.push({
        el,
        x: r.left, y: r.top,
        vx: (Math.random() - 0.5) * 2, vy: 0,
        w: r.width, h: r.height,
        prevStyle: { position: el.style.position, left: el.style.left, top: el.style.top, transition: el.style.transition }
      });
      el.style.position = 'fixed'; el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.transition = 'none';
    });
    if (!bodies.length) { showToast('No gravity targets on this page'); gravityOn = false; return; }
    const tick = () => {
      bodies.forEach((b) => {
        b.vy += 0.5;
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) { b.x = 0; b.vx *= -0.7; }
        if (b.x + b.w > innerWidth) { b.x = innerWidth - b.w; b.vx *= -0.7; }
        if (b.y + b.h > innerHeight) { b.y = innerHeight - b.h; b.vy *= -0.6; b.vx *= 0.95; }
        b.el.style.left = b.x + 'px'; b.el.style.top = b.y + 'px';
      });
      rafId = requestAnimationFrame(tick);
    };
    tick();
    unlockAchievement('newtons-revenge');
    setTimeout(() => { if (gravityOn) { stopGravity(); gravityOn = false; } }, 5000);
  }
  function stopGravity() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    bodies.forEach((b) => {
      b.el.style.position = b.prevStyle.position || '';
      b.el.style.left = b.prevStyle.left || '';
      b.el.style.top = b.prevStyle.top || '';
      b.el.style.transition = b.prevStyle.transition || '';
    });
    bodies.length = 0;
  }

  if (document.body.dataset.page === 'landing') {
    let startY = 0;
    document.addEventListener('touchstart', (e) => { if (scrollY === 0) startY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (scrollY === 0 && e.touches[0].clientY - startY > 120) {
        if (!document.querySelector('.pull-refresh-toast')) {
          const t = document.createElement('div');
          t.className = 'pull-refresh-toast';
          t.textContent = 'reloading the web since 1991';
          document.body.appendChild(t);
          setTimeout(() => t.remove(), 2500);
        }
      }
    }, { passive: true });
  }
}

function unlockAchievement(id) {
  try { localStorage.setItem(`achievement:${id}`, '1'); window.__eni?.sfx?.play?.('chime'); } catch {}
}

function showToast(msg) {
  try {
    const t = document.createElement('div');
    t.className = 'milestone-toast visible';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 2500);
  } catch {}
}
