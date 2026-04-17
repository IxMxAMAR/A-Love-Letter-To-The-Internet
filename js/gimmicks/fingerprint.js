function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
function seedRandom(seed) { let s = seed || 1; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

export function renderFingerprint(hostId = 'fingerprint-badge') {
  const host = document.getElementById(hostId);
  if (!host) return;
  let seed;
  try {
    seed = parseInt(sessionStorage.getItem('fingerprint-seed') || '0', 10);
    if (!seed) {
      seed = hashCode(String(Date.now()) + Math.random());
      sessionStorage.setItem('fingerprint-seed', String(seed));
    }
  } catch { seed = Date.now(); }
  const r = seedRandom(seed);
  const hue = Math.floor(r() * 360);
  const br1 = Math.floor(r() * 80);
  const br2 = Math.floor(r() * 80);
  const ang = Math.floor(r() * 360);
  host.className = 'fingerprint-badge';
  host.style.background = `linear-gradient(${ang}deg, oklch(0.65 0.22 ${hue}), oklch(0.45 0.18 ${(hue + 60) % 360}))`;
  host.style.borderRadius = `${br1}% ${100 - br1}% ${br2}% ${100 - br2}% / ${br2}% ${100 - br2}% ${br1}% ${100 - br1}%`;
  host.title = `Your visit fingerprint \u2014 seed ${seed}`;
  if (!host.dataset.wired) {
    host.dataset.wired = '1';
    host.addEventListener('click', () => host.classList.toggle('expanded'));
  }
  window.fingerprint = () => {
    try { sessionStorage.removeItem('fingerprint-seed'); } catch {}
    renderFingerprint(hostId);
  };
}
