/**
 * global.js - Gimmicks & Easter Eggs
 * "A Love Letter to the Web"
 */

import { initCursorTrail } from './cursor-trail.js';

// Page identity
const PAGE_SYMBOLS = {
  'index.html':             '\u25c8',
  '':                       '\u25c8',
  'hub.html':               '\u2726',
  'playground.html':        '\u2b21',
  'components.html':        '\u2b22',
  'scroll-animations.html': '\u27f3',
  'popover-dialog.html':    '\u25c9',
  'css-art.html':           '\u273f',
  'container-queries.html': '\u2291',
  'view-transitions.html':  '\u21c4',
  'houdini.html':           '\u2b1f',
  'has-selector.html':      '\u25ce',
  'cascade-layers.html':    '\u229e',
};

const PAGE_ZONES = {
  'scroll-animations.html': { name: 'Scroll Animations',  path: 'zones/scroll-animations.html' },
  'popover-dialog.html':    { name: 'Popover & Dialog',   path: 'zones/popover-dialog.html' },
  'css-art.html':           { name: 'CSS Art',            path: 'zones/css-art.html' },
  'container-queries.html': { name: 'Container Queries',  path: 'zones/container-queries.html' },
  'view-transitions.html':  { name: 'View Transitions',   path: 'zones/view-transitions.html' },
  'houdini.html':           { name: 'Houdini',            path: 'zones/houdini.html' },
  'has-selector.html':      { name: ':has() Selector',    path: 'zones/has-selector.html' },
  'cascade-layers.html':    { name: 'Cascade Layers',     path: 'zones/cascade-layers.html' },
};

function getPageFile() {
  const parts = location.pathname.split('/');
  return parts[parts.length - 1] || '';
}

function getPageSymbol() {
  return PAGE_SYMBOLS[getPageFile()] || '\u25c8';
}

function isInZones() {
  return location.pathname.includes('/zones/');
}

function pathTo(p) {
  return isInZones() ? '../' + p : p;
}

// 1. Console ASCII art
try {
  console.log(
    '%c\u25c8 A Love Letter to the Web',
    'font-size:18px;font-weight:bold;color:#7c6af7;font-family:monospace;'
  );
  console.log(
    '%cBuilt with curiosity, oklch(), and a deep love for the platform.',
    'color:#aaa;font-style:italic;'
  );
  console.log(
    '%cType %csecrets()%c for easter egg hints.',
    'color:#888;',
    'color:#7c6af7;font-family:monospace;font-weight:bold;',
    'color:#888;'
  );
} catch (e) {}

// 2. Tab title on visibility change (debounced to prevent flicker)
try {
  const _originalTitle = document.title;
  let _titleTimeout;
  document.addEventListener('visibilitychange', () => {
    clearTimeout(_titleTimeout);
    _titleTimeout = setTimeout(() => {
      document.title = document.hidden
        ? 'Come back! The CSS misses you...'
        : _originalTitle;
    }, 150);
  });
} catch (e) {}

// 3. Dynamic favicon
try {
  const symbol = getPageSymbol();
  const svgStr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
    + '<rect width="32" height="32" rx="6" fill="oklch(12% 0.015 265)"/>'
    + '<text x="16" y="22" text-anchor="middle" font-size="18" fill="oklch(60% 0.18 265)">' + symbol + '</text>'
    + '</svg>';
  const faviconUrl = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
} catch (e) {}

// 4. toggleTheme() — circular reveal via View Transitions API (Layer 1 / Task 6)
function applyThemeFlip() {
  try {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      html.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }
  } catch (e) {}
}

export function toggleTheme(evt) {
  try {
    const html = document.documentElement;
    const x = (evt && evt.clientX) || innerWidth / 2;
    const y = (evt && evt.clientY) || innerHeight / 2;
    html.style.setProperty('--theme-x', x + 'px');
    html.style.setProperty('--theme-y', y + 'px');

    if (typeof document.startViewTransition !== 'function') {
      applyThemeFlip();
      return;
    }
    html.classList.add('theme-transition');
    const t = document.startViewTransition(applyThemeFlip);
    t.finished.finally(() => html.classList.remove('theme-transition'));
  } catch (e) {
    applyThemeFlip();
  }
}
window.__toggleTheme = toggleTheme;

// 5. Keyboard shortcuts
try {
  const helpPopover = document.createElement('div');
  helpPopover.id = 'shortcut-help';
  helpPopover.className = 'shortcut-help';
  helpPopover.setAttribute('popover', '');
  helpPopover.innerHTML = '<button class="close-btn" popovertarget="shortcut-help" popovertargetaction="hide" aria-label="Close">\u2715</button>'
    + '<h2>Keyboard Shortcuts</h2>'
    + '<ul class="shortcut-list">'
    + '<li><kbd>?</kbd><span class="shortcut-desc">Show this help</span></li>'
    + '<li><kbd>t</kbd><span class="shortcut-desc">Toggle light/dark theme</span></li>'
    + '<li><kbd>h</kbd><span class="shortcut-desc">Go to Hub</span></li>'
    + '<li><kbd>p</kbd><span class="shortcut-desc">Go to Playground</span></li>'
    + '<li><kbd>c</kbd><span class="shortcut-desc">Go to Components</span></li>'
    + '<li><kbd>1</kbd><span class="shortcut-desc">Scroll Animations zone</span></li>'
    + '<li><kbd>2</kbd><span class="shortcut-desc">Popover &amp; Dialog zone</span></li>'
    + '<li><kbd>3</kbd><span class="shortcut-desc">CSS Art zone</span></li>'
    + '<li><kbd>4</kbd><span class="shortcut-desc">Container Queries zone</span></li>'
    + '<li><kbd>5</kbd><span class="shortcut-desc">View Transitions zone</span></li>'
    + '<li><kbd>6</kbd><span class="shortcut-desc">Houdini zone</span></li>'
    + '<li><kbd>7</kbd><span class="shortcut-desc">:has() Selector zone</span></li>'
    + '<li><kbd>8</kbd><span class="shortcut-desc">Cascade Layers zone</span></li>'
    + '</ul>';
  document.body.appendChild(helpPopover);

  const ZONE_PATHS = [
    'zones/scroll-animations.html', 'zones/popover-dialog.html',
    'zones/css-art.html', 'zones/container-queries.html',
    'zones/view-transitions.html', 'zones/houdini.html',
    'zones/has-selector.html', 'zones/cascade-layers.html',
  ];

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case '?':
        try { if (helpPopover.showPopover) helpPopover.showPopover(); } catch (_) {}
        break;
      case 't':
        toggleTheme(null);
        break;
      case 'h':
        e.preventDefault();
        location.href = pathTo('hub.html');
        break;
      case 'p':
        e.preventDefault();
        location.href = pathTo('playground.html');
        break;
      case 'c':
        e.preventDefault();
        location.href = pathTo('components.html');
        break;
      default:
        if (e.key >= '1' && e.key <= '8') {
          location.href = pathTo(ZONE_PATHS[parseInt(e.key, 10) - 1]);
        }
    }
  });
} catch (e) {}

// 5b. Ripple effect for buttons tagged with .ripple (Layer 1 / Task 3)
try {
  document.addEventListener('click', (e) => {
    try {
      const btn = e.target.closest('button.ripple');
      if (!btn || btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      if (e.detail === 0) {
        btn.style.setProperty('--x', '50%');
        btn.style.setProperty('--y', '50%');
      } else {
        btn.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        btn.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      }
      btn.classList.remove('ripple-active');
      void btn.offsetWidth; // force reflow to restart animation
      btn.classList.add('ripple-active');
      clearTimeout(btn._rippleT);
      btn._rippleT = setTimeout(() => btn.classList.remove('ripple-active'), 500);
    } catch {}
  });
} catch (e) {}

// 6. Custom context menu
try {
  const ctxMenu = document.createElement('div');
  ctxMenu.id = 'custom-context-menu';
  ctxMenu.className = 'custom-context-menu';
  ctxMenu.setAttribute('popover', 'manual');
  ctxMenu.innerHTML = '<ul>'
    + '<li><button data-action="view-source"><span class="menu-icon">\ud83d\udcc4</span>View Source</button></li>'
    + '<li><button data-action="inspect"><span class="menu-icon">\ud83d\udd0d</span>Inspect Element</button></li>'
    + '<li><button data-action="copy-link"><span class="menu-icon">\ud83d\udd17</span>Copy Link</button></li>'
    + '<hr>'
    + '<li><button data-action="surprise"><span class="menu-icon">\ud83c\udfb2</span>Surprise Me</button></li>'
    + '<li><button data-action="toggle-theme"><span class="menu-icon">\ud83c\udfa8</span>Toggle Theme</button></li>'
    + '</ul>';
  document.body.appendChild(ctxMenu);

  const ZONE_LIST = [
    'zones/scroll-animations.html', 'zones/popover-dialog.html',
    'zones/css-art.html', 'zones/container-queries.html',
    'zones/view-transitions.html', 'zones/houdini.html',
    'zones/has-selector.html', 'zones/cascade-layers.html',
  ];

  const mainEl = document.querySelector('main');
  if (mainEl) {
    mainEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
      ctxMenu.style.top  = Math.min(e.clientY, window.innerHeight - 250) + 'px';
      try { if (ctxMenu.showPopover) ctxMenu.showPopover(); } catch (_) {}
    });
  }

  document.addEventListener('click', () => {
    try { if (ctxMenu.hidePopover) ctxMenu.hidePopover(); } catch (_) {}
  });

  ctxMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    try { if (ctxMenu.hidePopover) ctxMenu.hidePopover(); } catch (_) {}
    if (action === 'view-source') {
      window.open('view-source:' + location.href);
    } else if (action === 'inspect') {
      console.info('Tip: Press F12 or Cmd+Option+I to open DevTools.');
    } else if (action === 'copy-link') {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(() => {});
    } else if (action === 'surprise') {
      location.href = pathTo(ZONE_LIST[Math.floor(Math.random() * ZONE_LIST.length)]);
    } else if (action === 'toggle-theme') {
      toggleTheme(e);
    }
  });
} catch (e) {}

// 7. Idle detection
try {
  let idleTimer;
  const IDLE_MS = 60000;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    document.documentElement.classList.remove('idle-mode');
    idleTimer = setTimeout(() => document.documentElement.classList.add('idle-mode'), IDLE_MS);
  };
  ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev => {
    document.addEventListener(ev, resetIdle, { passive: true });
  });
  resetIdle();
} catch (e) {}

// 8. Reduced motion badge
try {
  const BADGE_KEY = 'reduced-motion-badge-dismissed';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !localStorage.getItem(BADGE_KEY)) {
    const badge = document.createElement('div');
    badge.className = 'reduced-motion-badge';
    badge.innerHTML = '<span>\u26a1 Reduced motion active</span>'
      + '<button aria-label="Dismiss" title="Dismiss">\u2715</button>';
    document.body.appendChild(badge);
    badge.querySelector('button').addEventListener('click', () => {
      badge.remove();
      localStorage.setItem(BADGE_KEY, '1');
    });
  }
} catch (e) {}

// 9. Scroll velocity
try {
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastScrollY);
      const dt = now - lastScrollTime || 1;
      const speed = Math.min(dy / dt, 5);
      document.documentElement.style.setProperty('--scroll-speed', speed.toFixed(3));
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    });
  }, { passive: true });
} catch (e) {}

// 10. secrets()
const PAGE_SECRETS = {
  'index.html': [
    { shortcut: '?',           description: 'Open keyboard shortcuts help' },
    { shortcut: 't',           description: 'Toggle light/dark theme' },
    { shortcut: 'Scroll',      description: '--scroll-speed CSS var updates in real time' },
    { shortcut: 'Right-click', description: 'Custom context menu on main element' },
    { shortcut: 'Idle 60s',    description: 'html element gets .idle-mode class' },
  ],
  'hub.html': [
    { shortcut: 'h',           description: 'Return to Hub from anywhere' },
    { shortcut: '1-8',         description: 'Jump to any zone directly' },
    { shortcut: 'Right-click', description: 'Surprise Me sends you to a random zone' },
  ],
  'playground.html': [
    { shortcut: 'p',           description: 'Jump to Playground from anywhere' },
    { shortcut: 't',           description: 'Theme toggle - see oklch custom props live' },
  ],
  'components.html': [
    { shortcut: 'c',           description: 'Jump to Components from anywhere' },
    { shortcut: '?',           description: 'All shortcuts work here too' },
  ],
};

const ZONE_SECRETS = [
  { shortcut: '1-8',         description: 'Navigate between zones instantly' },
  { shortcut: 't',           description: 'Toggle theme - light is authentic for old zones' },
  { shortcut: 'Right-click', description: 'View Source to see how each demo works' },
  { shortcut: 'Tab away',    description: 'Title changes when you switch tabs' },
];

Object.keys(PAGE_ZONES).forEach(k => { PAGE_SECRETS[k] = ZONE_SECRETS; });

window.secrets = function secrets() {
  const file = getPageFile();
  const data = PAGE_SECRETS[file] || PAGE_SECRETS['index.html'];
  console.log('%c\ud83d\udd2e Easter Egg Hints for this page:', 'color:#7c6af7;font-weight:bold;font-size:14px;');
  console.table(data);
  return '\u2726 Found ' + data.length + ' secrets on this page.';
};

// 11. Seasonal effects
try {
  const _now = new Date();
  const _month = _now.getMonth();  // 0=Jan, 11=Dec
  const _day   = _now.getDate();

  // --- December Snowfall (month === 11) ---
  if (_month === 11 && !sessionStorage.getItem('snow-dismissed')) {
    // Keyframes
    const _snowStyle = document.createElement('style');
    _snowStyle.textContent = '@keyframes snowfall{'
      + 'from{transform:translateY(-10px) rotate(0deg);opacity:1;}'
      + 'to{transform:translateY(110vh) rotate(360deg);opacity:0.6;}'
      + '}';
    document.head.appendChild(_snowStyle);

    // Dismiss button
    const _snowBtn = document.createElement('button');
    _snowBtn.id = 'snow-dismiss';
    _snowBtn.textContent = '\u2744\ufe0f \u00d7';
    _snowBtn.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'right:16px',
      'z-index:99998',
      'padding:6px 12px',
      'border-radius:20px',
      'border:1px solid rgba(255,255,255,0.3)',
      'background:rgba(0,0,0,0.5)',
      'color:#fff',
      'cursor:pointer',
      'font-size:12px',
      'backdrop-filter:blur(4px)',
    ].join(';');
    document.body.appendChild(_snowBtn);

    // Snowflakes
    const _flakes = [];
    for (let i = 0; i < 25; i++) {
      const f = document.createElement('div');
      const size = 4 + Math.random() * 8;
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const dur = 6 + Math.random() * 8;
      f.style.cssText = [
        'position:fixed',
        'top:-10px',
        'left:' + left + 'vw',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'border-radius:50%',
        'background:rgba(255,255,255,0.85)',
        'pointer-events:none',
        'z-index:99997',
        'animation:snowfall ' + dur + 's linear ' + delay + 's infinite',
      ].join(';');
      document.body.appendChild(f);
      _flakes.push(f);
    }

    _snowBtn.addEventListener('click', () => {
      _flakes.forEach(f => f.remove());
      _snowBtn.remove();
      sessionStorage.setItem('snow-dismissed', '1');
    });
  }

  // --- April Fools (month === 3, day === 1) ---
  if (_month === 3 && _day === 1) {
    document.documentElement.style.fontFamily = "'Comic Sans MS', cursive";
    const _logo = document.querySelector('.site-title, .logo, h1');
    if (_logo) _logo.textContent = '\u2726 Web Letter (Professional Edition\u2122)';
    console.log(
      '%c\ud83e\udd21 April Fools! Comic Sans activated. You\u2019re welcome.',
      'color:#f472b6;font-size:14px;font-family:"Comic Sans MS",cursive;'
    );
  }

  // --- New Year (month === 0, day === 1) ---
  if (_month === 0 && _day === 1 && !sessionStorage.getItem('ny-burst-done')) {
    sessionStorage.setItem('ny-burst-done', '1');

    const _nyStyle = document.createElement('style');
    _nyStyle.textContent = '@keyframes ny-burst{'
      + '0%{transform:scale(0) translate(0,0);opacity:1;}'
      + '80%{opacity:1;}'
      + '100%{transform:scale(1) translate(var(--nx),var(--ny));opacity:0;}'
      + '}';
    document.head.appendChild(_nyStyle);

    const _colors = ['#f472b6','#818cf8','#34d399','#fbbf24','#60a5fa','#f87171','#a78bfa'];
    const _bursts = [];
    for (let i = 0; i < 30; i++) {
      const b = document.createElement('div');
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      const nx = (Math.random() - 0.5) * 200 + 'px';
      const ny = (Math.random() - 0.5) * 200 + 'px';
      const size = 6 + Math.random() * 10;
      const color = _colors[Math.floor(Math.random() * _colors.length)];
      const delay = Math.random() * 1.5;
      b.style.cssText = [
        'position:fixed',
        'left:' + x + 'vw',
        'top:' + y + 'vh',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'border-radius:50%',
        'background:' + color,
        'pointer-events:none',
        'z-index:99996',
        '--nx:' + nx,
        '--ny:' + ny,
        'animation:ny-burst 2s ease-out ' + delay + 's forwards',
      ].join(';');
      document.body.appendChild(b);
      _bursts.push(b);
    }

    setTimeout(() => _bursts.forEach(b => b.remove()), 4000);
  }

  // --- Speed Run Loader ---
  if (new URLSearchParams(location.search).get('speedrun') === 'true') {
    import('./speedrun.js').catch(() => {});
  }

} catch (e) {}

// 12. Text effects (Layer 1 / Task 4) — wrapLetters, scrambleText, letter-reveal init
function wrapLetters(el) {
  if (!el || el.dataset.wrapped) return;
  el.dataset.wrapped = '1';
  let counter = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const text = child.textContent.replace(/\s+/g, ' ');
        if (!text.trim() && node === el) return;
        const frag = document.createDocumentFragment();
        [...text].forEach((ch) => {
          const s = document.createElement('span');
          s.textContent = ch === ' ' ? '\u00a0' : ch;
          s.style.setProperty('--i', counter++);
          frag.appendChild(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
}

function scrambleText(el, finalText, duration = 900) {
  const chars = '!@#$%^&*(){}[]<>?/\\|~';
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const resolved = Math.floor(finalText.length * t);
    let out = finalText.slice(0, resolved);
    for (let i = resolved; i < finalText.length; i++) {
      out += chars[(Math.random() * chars.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// init letter-reveal targets
try {
  document.querySelectorAll('[data-text-effect="reveal"]').forEach(el => {
    wrapLetters(el);
    el.classList.add('letter-reveal');
  });
} catch {}

// expose helpers
window.__eni = Object.assign(window.__eni || {}, { wrapLetters, scrambleText });

// 13. Cursor trail canvas (Layer 1 / Task 7) — Shift+C toggles on/off
function showToast(msg) {
  try {
    const existing = document.querySelector('.global-mini-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'global-mini-toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%) translateY(40px)',
      background: 'rgba(20, 20, 30, 0.92)',
      color: '#e8e8ff',
      padding: '10px 18px',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'monospace',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      border: '1px solid rgba(140,100,255,0.3)',
      zIndex: '99999',
      opacity: '0',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }));
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(40px)';
      setTimeout(() => toast.remove(), 300);
    }, 1600);
  } catch {}
}

let __trail;
try { __trail = initCursorTrail(); } catch {}

document.addEventListener('keydown', (e) => {
  if (!(e.shiftKey && e.key && e.key.toLowerCase() === 'c')) return;
  const t = e.target;
  if (t && t.closest && t.closest('input,textarea,[contenteditable]')) return;
  e.preventDefault();
  try {
    const on = __trail?.toggle?.();
    if (typeof on === 'boolean') showToast(on ? 'Cursor trail: ON' : 'Cursor trail: OFF');
  } catch {}
});

(function konami() {
  try {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let i = 0;
    addEventListener('keydown', (e) => {
      if (e.target.closest('input,textarea,[contenteditable]')) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const want = seq[i].toLowerCase();
      if (key === want) {
        i++;
        if (i === seq.length) { i = 0; trigger(); }
      } else {
        i = 0;
      }
    });
    function trigger() {
      document.body.classList.add('konami-invert');
      const c = document.createElement('canvas');
      c.className = 'konami-canvas';
      c.setAttribute('aria-hidden', 'true');
      c.width = innerWidth; c.height = innerHeight;
      document.body.appendChild(c);
      const ctx = c.getContext('2d');
      const parts = Array.from({ length: 120 }, () => ({
        x: Math.random() * c.width, y: -20 - Math.random() * c.height,
        vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 4,
        hue: Math.random() * 360, r: 3 + Math.random() * 5,
      }));
      const end = performance.now() + 10000;
      (function tick(t) {
        ctx.clearRect(0, 0, c.width, c.height);
        parts.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          ctx.fillStyle = `hsl(${p.hue} 80% 60%)`;
          ctx.fillRect(p.x, p.y, p.r, p.r);
        });
        if (t < end) requestAnimationFrame(tick);
        else {
          c.remove();
          document.body.classList.remove('konami-invert');
          try { localStorage.setItem('achievement:the-code', '1'); } catch {}
          try { if (typeof showToast === 'function') showToast('Achievement unlocked: The Code'); } catch {}
        }
      })(performance.now());
    }
  } catch {}
})();
