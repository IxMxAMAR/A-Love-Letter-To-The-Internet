/**
 * zones.js — Shared zone gimmicks for "A Love Letter to the Web"
 * Task 7: Zone-Colored Scroll Progress + Chapter Numbers
 */

// Feature 1: Zone-Colored Scroll Progress
try {
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    const zoneColor = (
      getComputedStyle(document.documentElement).getPropertyValue('--zone-color').trim() ||
      getComputedStyle(document.body).getPropertyValue('--zone-color').trim()
    );
    if (zoneColor) {
      scrollProgress.style.background = zoneColor;
    }
  }
} catch (e) {
  console.warn('[zones] scroll-progress color failed:', e);
}

// Feature 2: Chapter Numbers
try {
  const chapterMap = new Map([
    ['.zone-hero',        'I'],
    ['.zone-story',       'II'],
    ['.zone-playground',  'III'],
  ]);

  // Build the fixed display div
  const chapterDisplay = document.createElement('div');
  chapterDisplay.id = 'zone-chapter-display';
  Object.assign(chapterDisplay.style, {
    position:   'fixed',
    bottom:     '2rem',
    left:       '2rem',
    zIndex:     '9000',
    fontFamily: 'serif',
    fontSize:   'clamp(1.5rem, 4vw, 3rem)',
    fontStyle:  'italic',
    color:      'var(--zone-color, oklch(70% 0.2 260))',
    opacity:    '0',
    transition: 'opacity 0.4s ease',
    pointerEvents: 'none',
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
    userSelect: 'none',
  });
  document.body.appendChild(chapterDisplay);

  let fadeTimer = null;

  const showChapter = (numeral) => {
    if (fadeTimer) clearTimeout(fadeTimer);
    chapterDisplay.textContent = numeral;
    chapterDisplay.style.opacity = '1';
    fadeTimer = setTimeout(() => {
      chapterDisplay.style.opacity = '0';
    }, 2000);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numeral = chapterMap.get('.' + Array.from(entry.target.classList)
          .find(cls => chapterMap.has('.' + cls)));
        if (numeral) showChapter(numeral);
      }
    });
  }, { threshold: 0.3 });

  chapterMap.forEach((_, selector) => {
    const el = document.querySelector(selector);
    if (el) observer.observe(el);
  });
} catch (e) {
  console.warn('[zones] chapter numbers failed:', e);
}
