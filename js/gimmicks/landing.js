/**
 * landing.js — Gimmicks for "A Love Letter to the Web"
 * Tasks: typewriter, visitor counter, guestbook, easter eggs, card flip, tilt, dark mode, centering popover
 */

// ─── 1. Typewriter Effect (1991 era, first visit only) ────────────────────────
function initTypewriter() {
  if (sessionStorage.getItem('typewriter-done')) return;

  const era = document.querySelector('.era-1991 .era-content');
  if (!era) return;

  // Collect all text nodes inside paragraphs and address
  const targets = era.querySelectorAll('p, address');
  const originalHTML = [];
  targets.forEach(el => {
    originalHTML.push(el.innerHTML);
    el.innerHTML = '';
    el.style.visibility = 'hidden';
  });

  let idx = 0;
  function typeNext() {
    if (idx >= targets.length) {
      sessionStorage.setItem('typewriter-done', '1');
      return;
    }
    const el = targets[idx];
    el.style.visibility = 'visible';
    const html = originalHTML[idx];
    let charIdx = 0;
    // Strip tags for character-by-character reveal, then swap to full HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent;
    const total = plainText.length;

    const interval = setInterval(() => {
      charIdx++;
      // Reveal portion by clipping text — simple approach: show progressively
      const fraction = charIdx / total;
      // Use a clip-path trick: just set the innerHTML progressively isn't safe with HTML
      // So we use a character reveal approach on a wrapper
      el.style.clipPath = `inset(0 ${Math.round((1 - fraction) * 100)}% 0 0)`;
      if (charIdx >= total) {
        clearInterval(interval);
        el.innerHTML = html;
        el.style.clipPath = '';
        idx++;
        setTimeout(typeNext, 300);
      }
    }, 18);
  }

  // Wait for era to be in view
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      setTimeout(typeNext, 400);
    }
  }, { threshold: 0.3 });
  observer.observe(era);
}

// ─── 2. Visitor Counter (localStorage) ────────────────────────────────────────
function initVisitorCounter() {
  const BASE = 4271;
  let count = parseInt(localStorage.getItem('visitor-count') || String(BASE), 10);

  // Only increment once per session
  if (!sessionStorage.getItem('counted')) {
    count++;
    localStorage.setItem('visitor-count', String(count));
    sessionStorage.setItem('counted', '1');
  }

  const formatted = String(count).padStart(7, '0').replace(/(\d{3})(\d{3})(\d+)/, (_, a, b, c) => `${a},${b}`);

  // Update all counter display elements
  document.querySelectorAll('.counter-num, .visitor-count').forEach(el => {
    el.textContent = formatted;
  });
}

// ─── 3. Guestbook Dialog ──────────────────────────────────────────────────────
function initGuestbook() {
  const dialog = document.getElementById('guestbook-dialog');
  const openBtn = document.getElementById('guestbook-link');
  const closeBtn = dialog?.querySelector('.gb-close');
  const form = document.getElementById('gb-form');
  const thanks = document.getElementById('gb-thanks');

  if (!dialog || !openBtn) return;

  openBtn.addEventListener('click', e => {
    e.preventDefault();
    dialog.showModal();
  });

  closeBtn?.addEventListener('click', () => dialog.close());

  // Close on backdrop click
  dialog.addEventListener('click', e => {
    const rect = dialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom) {
      dialog.close();
    }
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    form.hidden = true;
    thanks.hidden = false;
    // Reset after 4s
    setTimeout(() => {
      form.hidden = false;
      thanks.hidden = true;
      form.reset();
    }, 4000);
  });
}

// ─── 4. Hampster Dance Easter Egg ─────────────────────────────────────────────
function initHampsterDance() {
  const construction = document.querySelector('.construction');
  if (!construction) return;

  let clickCount = 0;
  let clickTimer = null;

  construction.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 600);

    if (clickCount >= 3) {
      clickCount = 0;
      // Bounce all text elements for 5s
      document.querySelectorAll('p, h1, h2, h3, address, .construction').forEach(el => {
        el.classList.add('hampster-bounce');
      });
      setTimeout(() => {
        document.querySelectorAll('.hampster-bounce').forEach(el => {
          el.classList.remove('hampster-bounce');
        });
      }, 5000);
    }
  });
}

// ─── 5. Hypermedia Era Preview (font cycles on hover) ─────────────────────────
function initHypermediaHover() {
  const link = document.getElementById('link-hypermedia');
  if (!link) return;

  const fonts = [
    '"Times New Roman", serif',
    '"Arial", sans-serif',
    '"Comic Sans MS", "Comic Sans", cursive',
    '"Georgia", serif',
    '"Impact", fantasy',
    '"Courier New", monospace',
    'Inter, sans-serif',
  ];
  let fontIdx = 0;
  let interval = null;

  link.addEventListener('mouseenter', () => {
    interval = setInterval(() => {
      fontIdx = (fontIdx + 1) % fonts.length;
      link.style.fontFamily = fonts[fontIdx];
    }, 180);
  });

  link.addEventListener('mouseleave', () => {
    clearInterval(interval);
    link.style.fontFamily = '';
  });
}

// ─── 6. 2010 Card Flip (click → rotateY 180° to show CSS property) ────────────
const CSS3_BACKS = [
  'border-radius: 12px;',
  'linear-gradient(…)',
  'transform: rotateY(180deg);',
  'box-shadow: 0 4px 24px rgba(0,0,0,.4);',
];

function initCardFlip() {
  const cards = document.querySelectorAll('.css3-card');
  cards.forEach((card, i) => {
    // Wrap card content in a flipper structure
    const inner = document.createElement('div');
    inner.className = 'card-flip-inner';

    const front = document.createElement('div');
    front.className = 'card-flip-front';
    front.innerHTML = card.innerHTML;

    const back = document.createElement('div');
    back.className = 'card-flip-back';
    back.innerHTML = `<code>${CSS3_BACKS[i] || 'CSS3 ✦'}</code>`;

    inner.append(front, back);
    card.innerHTML = '';
    card.appendChild(inner);
    card.classList.add('card-flip-root');

    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

// ─── 7. 2010 3D Tilt on Hover ─────────────────────────────────────────────────
function initCardTilt() {
  const cards = document.querySelectorAll('.css3-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${(-y * 14).toFixed(1)}deg) rotateY(${(x * 14).toFixed(1)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── 8. 2020 Dark Mode Card Click → Toggle Theme ─────────────────────────────
function initDarkModeCard() {
  const darkCard = document.querySelector('.modern-feature:last-child');
  if (!darkCard) return;

  darkCard.style.cursor = 'pointer';
  darkCard.title = 'Click to toggle dark mode';

  darkCard.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ─── 9. 2020 Flex Card Triple-Click → Centering Timeline Popover ──────────────
function initFlexPopover() {
  const flexCard = document.querySelector('.modern-feature:nth-child(3)');
  if (!flexCard) return;

  let clickCount = 0;
  let clickTimer = null;

  // Create popover
  const popover = document.createElement('div');
  popover.id = 'centering-popover';
  popover.setAttribute('popover', 'auto');
  popover.innerHTML = `
    <h3>Centering: A Timeline</h3>
    <ul>
      <li>1996 — <code>text-align: center</code> + <code>margin: 0 auto</code></li>
      <li>2001 — Absolute positioning hacks</li>
      <li>2009 — <code>display: table-cell</code></li>
      <li>2012 — Flexbox arrives: <code>align-items: center</code></li>
      <li>2017 — CSS Grid: <code>place-items: center</code></li>
      <li>2023 — <code>align-content: center</code> on a block</li>
    </ul>
    <p class="popover-close-hint">Click outside to close</p>
  `;
  document.body.appendChild(popover);

  flexCard.style.cursor = 'pointer';
  flexCard.title = 'Triple-click for centering history';

  flexCard.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 500);

    if (clickCount >= 3) {
      clickCount = 0;
      popover.showPopover();
    }
  });
}

// ─── Bootstrap all gimmicks ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  initVisitorCounter();
  initGuestbook();
  initHampsterDance();
  initHypermediaHover();
  initCardFlip();
  initCardTilt();
  initDarkModeCard();
  initFlexPopover();
});
