/**
 * zones.js — Shared zone gimmicks for "A Love Letter to the Web"
 * Task 7: Zone-Colored Scroll Progress + Chapter Numbers
 * Task 18: Ambient zone audio toggle
 */

import { playAmbient, stopAmbient } from './chiptune.js';

try {
  const zoneKey = document.body.dataset.zone;
  const btn = document.querySelector('.ambient-toggle');
  if (btn && zoneKey) {
    let on = false;
    btn.addEventListener('click', () => {
      on = !on;
      btn.textContent = on ? '\ud83d\udd0a Ambient' : '\ud83d\udd08 Ambient';
      btn.setAttribute('aria-pressed', String(on));
      if (on) playAmbient(zoneKey); else stopAmbient();
    });
  }
  addEventListener('beforeunload', stopAmbient);
} catch {}

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

// Feature 3: Touch swipe navigation between zones (Layer 1 / Task 23)
try {
  if (matchMedia('(pointer: coarse)').matches) {
    const links = {
      scroll: ['../index.html', 'popover-dialog.html'],
      popover: ['scroll-animations.html', 'css-art.html'],
      art: ['popover-dialog.html', 'container-queries.html'],
      container: ['css-art.html', 'view-transitions.html'],
      transitions: ['container-queries.html', 'houdini.html'],
      houdini: ['view-transitions.html', 'has-selector.html'],
      has: ['houdini.html', 'cascade-layers.html'],
      layers: ['has-selector.html', '../index.html'],
    };
    const zone = document.body.dataset.zone;
    const pair = links[zone];
    if (pair) {
      let startX = 0, startY = 0;
      addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
      addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
          // Layer 2 / Task 3 — gesture-master achievement: track swipe gestures
          try {
            const used = window.__state?.get?.('preferences.usedGestures') || {};
            used.swipe = true;
            window.__state?.set?.('preferences.usedGestures', used);
            if (Object.keys(used).length >= 2) {
              window.__state?.emit?.('gimmick:trigger', { name: 'gestures' });
            }
          } catch {}
          location.href = dx < 0 ? pair[1] : pair[0];
        }
      }, { passive: true });
    }
  }
} catch {}
