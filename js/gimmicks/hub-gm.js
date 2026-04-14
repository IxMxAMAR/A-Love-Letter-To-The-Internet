/**
 * Hub page gimmicks — hub-gm.js
 * Each feature wrapped in try/catch for graceful degradation.
 */

// ─────────────────────────────────────────────
// 1. SVG Line Draw
// ─────────────────────────────────────────────
try {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes line-draw {
      from { stroke-dashoffset: var(--line-length, 1000); }
      to   { stroke-dashoffset: 0; }
    }
    .connection-line {
      animation: line-draw 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      stroke-dasharray: var(--line-length, 1000);
      stroke-dashoffset: var(--line-length, 1000);
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.connection-line').forEach((line, i) => {
    const len = line.getTotalLength ? line.getTotalLength() : 300;
    line.style.setProperty('--line-length', len);
    line.style.animationDelay = `${i * 0.12}s`;
  });
} catch (e) { console.warn('[hub-gm] line-draw:', e); }

// ─────────────────────────────────────────────
// 2. Click Sparkles
// ─────────────────────────────────────────────
try {
  const sparkStyle = document.createElement('style');
  sparkStyle.textContent = `
    .hub-sparkle {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      transition: transform 0.6s cubic-bezier(0.2, 0, 0.8, 1),
                  opacity 0.6s ease-out;
    }
    .hub-sparkle.burst {
      opacity: 0;
      transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0);
    }
  `;
  document.head.appendChild(sparkStyle);

  const COLORS = ['#646cff','#a78bfa','#f472b6','#34d399','#fbbf24','#60a5fa'];

  document.querySelector('#constellation')?.addEventListener('click', (e) => {
    if (e.target.closest('.zone-node')) return;
    const { clientX: x, clientY: y } = e;
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('div');
      dot.className = 'hub-sparkle';
      const angle = (i / 6) * 2 * Math.PI;
      const dist = 40 + Math.random() * 30;
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
      dot.style.background = COLORS[i];
      dot.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      dot.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(dot);
      requestAnimationFrame(() => requestAnimationFrame(() => dot.classList.add('burst')));
      setTimeout(() => dot.remove(), 700);
    }
  });
} catch (e) { console.warn('[hub-gm] sparkles:', e); }

// ─────────────────────────────────────────────
// 3. Konami Code
// ─────────────────────────────────────────────
try {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIdx = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[kIdx]) {
      kIdx++;
      if (kIdx === KONAMI.length) {
        kIdx = 0;
        triggerKonami();
      }
    } else {
      kIdx = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  function triggerKonami() {
    const nodes = document.querySelectorAll('.zone-node');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    nodes.forEach((node) => {
      const r = node.getBoundingClientRect();
      const nx = r.left + r.width / 2;
      const ny = r.top  + r.height / 2;
      const dx = (nx - cx) * 1.8;
      const dy = (ny - cy) * 1.8;
      const base = isMobile ? '' : 'translate(-50%, -50%) ';
      node.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 1, 1), opacity 0.5s';
      node.style.transform  = `${base}translate(${dx}px, ${dy}px) scale(0.5)`;
      node.style.opacity    = '0.3';
    });

    // Reassemble after 1s with spring easing
    setTimeout(() => {
      nodes.forEach((node) => {
        node.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s';
        node.style.transform  = '';
        node.style.opacity    = '';
      });
    }, 1000);

    // Show rickroll message
    const msg = document.createElement('div');
    msg.textContent = 'Never gonna give you up \uD83C\uDFB5';
    Object.assign(msg.style, {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      fontSize: '2rem',
      fontWeight: '700',
      padding: '1rem 2rem',
      borderRadius: '1rem',
      zIndex: '10000',
      pointerEvents: 'none',
      transition: 'opacity 0.8s',
      opacity: '1',
    });
    document.body.appendChild(msg);
    setTimeout(() => { msg.style.opacity = '0'; }, 2200);
    setTimeout(() => msg.remove(), 3000);
  }
} catch (e) { console.warn('[hub-gm] konami:', e); }

// ─────────────────────────────────────────────
// 4. "0 Dependencies" Popover
// ─────────────────────────────────────────────
try {
  const popStyle = document.createElement('style');
  popStyle.textContent = `
    .hub-dep-popover {
      position: fixed;
      background: #1a1a2e;
      color: #e2e8f0;
      border: 1px solid #646cff44;
      border-radius: 0.75rem;
      padding: 0.75rem 1.1rem;
      font-size: 0.9rem;
      max-width: 280px;
      z-index: 9998;
      box-shadow: 0 4px 24px rgba(100,108,255,0.2);
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      transition: opacity 0.25s, transform 0.25s;
      pointer-events: none;
    }
    .hub-dep-popover.visible {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
  `;
  document.head.appendChild(popStyle);

  const depSpan = [...document.querySelectorAll('.hub-stats span')]
    .find(s => s.textContent.trim() === '0 Dependencies');

  if (depSpan) {
    depSpan.style.cursor = 'pointer';
    const popover = document.createElement('div');
    popover.className = 'hub-dep-popover';
    popover.textContent = 'Zero. None. Nada. Not even a normalize.css. We said what we said. \uD83D\uDC85';
    document.body.appendChild(popover);

    let visible = false;
    depSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = depSpan.getBoundingClientRect();
      popover.style.left = `${r.left}px`;
      popover.style.top  = `${r.top - popover.offsetHeight - 12}px`;
      visible = !visible;
      popover.classList.toggle('visible', visible);

      // Reposition after render
      requestAnimationFrame(() => {
        popover.style.top = `${r.top - popover.offsetHeight - 12}px`;
      });
    });

    document.addEventListener('click', () => {
      visible = false;
      popover.classList.remove('visible');
    });
  }
} catch (e) { console.warn('[hub-gm] dep-popover:', e); }

// ─────────────────────────────────────────────
// 5. Time-of-Day Greeting
// ─────────────────────────────────────────────
try {
  const hour = new Date().getHours();
  const greeting =
    hour < 6  ? 'Still up at this hour? Respect. \uD83C\uDF19' :
    hour < 12 ? 'Good morning, explorer. \u2600\uFE0F' :
    hour < 17 ? 'Good afternoon. The web awaits. \uD83C\uDF24\uFE0F' :
    hour < 21 ? 'Good evening. Perfect time to explore. \uD83C\uDF06' :
                'Late night browsing? Our kind of person. \uD83C\uDF0C';

  const subtitle = document.querySelector('.hub-intro .subtitle');
  if (subtitle) {
    const greetEl = document.createElement('span');
    greetEl.style.cssText = 'display:block; margin-top:0.5rem; opacity:0.7; font-size:0.9em;';
    greetEl.textContent = greeting;
    subtitle.appendChild(greetEl);
  }
} catch (e) { console.warn('[hub-gm] greeting:', e); }

// ─────────────────────────────────────────────
// 6. Animated Stat Counter — "8 Zones"
// ─────────────────────────────────────────────
try {
  const zonesSpan = [...document.querySelectorAll('.hub-stats span')]
    .find(s => s.textContent.trim() === '8 Zones');

  if (zonesSpan) {
    zonesSpan.style.cursor = 'pointer';
    let counting = false;
    zonesSpan.addEventListener('click', () => {
      if (counting) return;
      counting = true;
      let n = 0;
      zonesSpan.textContent = '0 Zones';
      const id = setInterval(() => {
        n++;
        zonesSpan.textContent = `${n} Zones`;
        if (n >= 8) {
          clearInterval(id);
          counting = false;
        }
      }, 80);
    });
  }
} catch (e) { console.warn('[hub-gm] stat-counter:', e); }
