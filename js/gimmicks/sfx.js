let ctx = null, muted = true;
const PRESETS = {
  click:  { type: 'triangle', freq: 1200, dur: 0.05, attack: 0.002, release: 0.04, gain: 0.06 },
  pop:    { type: 'sine',     freq: 700,  dur: 0.08, attack: 0.002, release: 0.07, gain: 0.08 },
  whoosh: { type: 'sawtooth', freq: 220,  dur: 0.25, attack: 0.01,  release: 0.24, gain: 0.05, sweep: 900 },
  swoosh: { type: 'sine',     freq: 400,  dur: 0.35, attack: 0.01,  release: 0.34, gain: 0.05, sweep: -200 },
  chime:  { type: 'sine',     freq: 880,  dur: 0.6,  attack: 0.01,  release: 0.55, gain: 0.07, chord: [1, 1.26, 1.5] },
  type:   { type: 'square',   freq: 1800, dur: 0.02, attack: 0.001, release: 0.02, gain: 0.04 },
};

function ensure() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function playSfx(name) {
  if (muted) return;
  try {
    const p = PRESETS[name]; if (!p) return;
    const c = ensure();
    const now = c.currentTime;
    const chord = p.chord || [1];
    chord.forEach((mult) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq * mult, now);
      if (p.sweep) osc.frequency.linearRampToValueAtTime((p.freq + p.sweep) * mult, now + p.dur);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(p.gain, now + p.attack);
      g.gain.linearRampToValueAtTime(0, now + p.attack + p.release);
      osc.connect(g).connect(c.destination);
      osc.start(now); osc.stop(now + p.dur + 0.05);
    });
  } catch {}
}

export function setSfxMuted(v) { muted = !!v; try { localStorage.setItem('sfx-muted', muted ? '1' : '0'); } catch {} }
export function isSfxMuted() { return muted; }
export function initSfx() {
  try { muted = localStorage.getItem('sfx-muted') !== '0'; } catch { muted = true; }
}
