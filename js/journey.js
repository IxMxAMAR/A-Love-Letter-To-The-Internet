/**
 * journey.js — Guided tour overlay (Layer 2 / Task 11)
 * Activated by ?journey=true URL parameter.
 *
 * Walks the visitor through the most important interactive bits of any
 * page, then emits gimmick:trigger { name: 'journey' } on completion so
 * the achievement engine can react.
 */

import { state } from './state.js';

const STEPS = [
  { selector: '.page-header, .zone-header',     text: 'This is the navigation. Visit Hub for the zones, Playground to experiment, Lab for advanced shape building.' },
  { selector: '.hero, .era-1991, h1',           text: "You're on the landing page — five eras of the web platform." },
  { selector: '#fingerprint-badge, .fingerprint-badge', text: 'A unique fingerprint generated for your visit. Click it to expand.' },
  { selector: '.sfx-toggle, #sfx-toggle',       text: 'Sound effects toggle. Off by default — opt in for the full effect.' },
  { selector: '.back-to-top',                   text: 'Back to top button appears when you scroll down.' },
];

function startJourney() {
  if (!new URLSearchParams(location.search).get('journey')) return;
  let idx = 0;
  const overlay = document.createElement('div');
  overlay.className = 'journey-overlay';
  overlay.innerHTML = '<div class="journey-tip">'
    + '<p id="journey-text"></p>'
    + '<div class="journey-actions">'
    + '<button id="journey-skip" type="button">Skip</button>'
    + '<button id="journey-next" type="button">Next &rarr;</button>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
  const tip = overlay.querySelector('.journey-tip');
  const txt = overlay.querySelector('#journey-text');
  const next = overlay.querySelector('#journey-next');
  const skip = overlay.querySelector('#journey-skip');

  const showStep = () => {
    const step = STEPS[idx];
    if (!step) { complete(); return; }
    const target = document.querySelector(step.selector);
    if (!target) { idx++; return showStep(); }
    try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
    const r = target.getBoundingClientRect();
    tip.style.top  = Math.min(innerHeight - 200, Math.max(20, r.bottom + 12)) + 'px';
    tip.style.left = Math.max(20, Math.min(innerWidth - 340, r.left)) + 'px';
    txt.textContent = step.text;
    next.textContent = idx === STEPS.length - 1 ? 'Finish' : 'Next →';
  };

  const complete = () => {
    overlay.remove();
    try { state.emit('gimmick:trigger', { name: 'journey' }); } catch {}
  };

  next.addEventListener('click', () => { idx++; showStep(); });
  skip.addEventListener('click', complete);
  showStep();
}

startJourney();
