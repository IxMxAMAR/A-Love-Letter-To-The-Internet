/**
 * session.js — Session-state gimmicks (Layer 1 / Task 19)
 * Visit milestones, time-spent counter, visited-zone tracking, breadcrumb trail.
 */

const KEY = { visits: 'visits', visited: 'visited-zones', start: 'session-start' };

function inc(k) {
  try { const n = (parseInt(localStorage.getItem(k) || '0', 10) || 0) + 1; localStorage.setItem(k, String(n)); return n; } catch { return 0; }
}

export function initSession() {
  const visits = inc(KEY.visits);
  const milestones = { 10: 'Welcome back, regular!', 50: 'Power user detected.', 100: 'Centurion \u2014 100 visits', 1000: 'Legendary.' };
  if (milestones[visits]) setTimeout(() => showMilestone(milestones[visits], visits), 1500);

  const zoneKey = document.body.dataset.zone;
  if (zoneKey) {
    try {
      const list = new Set(JSON.parse(sessionStorage.getItem(KEY.visited) || '[]'));
      list.add(zoneKey);
      sessionStorage.setItem(KEY.visited, JSON.stringify([...list]));
    } catch {}
  }

  let start;
  try {
    start = parseInt(sessionStorage.getItem(KEY.start) || '0', 10);
    if (!start) { start = Date.now(); sessionStorage.setItem(KEY.start, String(start)); }
  } catch { start = Date.now(); }
  const host = document.querySelector('.time-spent');
  if (host) {
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(s / 60), sec = s % 60;
      host.textContent = `Exploring for ${m}m ${sec}s`;
      if (s === 1800) unlockAchievement('deep-diver');
    };
    tick();
    setInterval(tick, 1000);
  }

  const bc = document.querySelector('.breadcrumb');
  if (bc) {
    const name = document.title.split('\u2014')[0].trim();
    bc.innerHTML = `<a href="${bc.dataset.root || 'index.html'}">Home</a> \u2192 <a href="${bc.dataset.hub || 'hub.html'}">Observatory</a> \u2192 <span>${name}</span>`;
  }
}

function showMilestone(msg, visits) {
  const t = document.createElement('div');
  t.className = 'milestone-toast';
  t.setAttribute('role', 'status');
  t.textContent = `${msg} (visit #${visits})`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 4500);
}

function unlockAchievement(id) {
  try { localStorage.setItem(`achievement:${id}`, '1'); window.__eni?.sfx?.play?.('chime'); } catch {}
}
