/**
 * 1996 Era Chiptune — Web Audio API procedural music.
 * Generates a catchy 8-bit melody with square/triangle waves.
 * No audio files — pure oscillator synthesis.
 */

let audioCtx = null;
let isPlaying = false;
let timeoutIds = [];
let scheduledOscillators = [];

// Simple melody — notes as [frequency, duration in beats]
// A catchy, happy, nostalgic 8-bit loop
const TEMPO = 140; // BPM
const BEAT = 60 / TEMPO;

// C major pentatonic melody
const melody = [
  [523, 0.5], [587, 0.5], [659, 1], [587, 0.5], [523, 0.5],
  [440, 1], [523, 0.5], [587, 0.5], [523, 1], [0, 0.5],
  [659, 0.5], [698, 0.5], [784, 1], [698, 0.5], [659, 0.5],
  [587, 1], [523, 0.5], [440, 0.5], [523, 1], [0, 0.5],
  // Second phrase
  [784, 0.5], [698, 0.5], [659, 1], [523, 0.5], [587, 0.5],
  [659, 1], [587, 0.5], [523, 0.5], [440, 1], [0, 0.5],
  [523, 0.5], [523, 0.5], [659, 0.5], [659, 0.5], [784, 1],
  [659, 1], [523, 1.5], [0, 0.5],
];

// Bass line (lower octave, simple pattern)
const bass = [
  [262, 2], [220, 2], [262, 2], [196, 2],
  [262, 2], [220, 2], [196, 2], [262, 2],
];

function playNote(ctx, freq, startTime, duration, type = 'square', volume = 0.08) {
  if (freq === 0) return; // rest

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope: quick attack, sustain, quick release
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.setValueAtTime(volume, startTime + duration * BEAT - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration * BEAT);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration * BEAT);

    // Track oscillator for cleanup on stop
    scheduledOscillators.push(osc);
    osc.onended = () => {
      const idx = scheduledOscillators.indexOf(osc);
      if (idx !== -1) scheduledOscillators.splice(idx, 1);
    };
  } catch (err) {
    console.warn('[chiptune] playNote failed:', err);
  }
}

function playLoop() {
  if (!audioCtx || !isPlaying) return;

  const now = audioCtx.currentTime + 0.1;

  // Play melody
  let melodyTime = now;
  for (const [freq, dur] of melody) {
    playNote(audioCtx, freq, melodyTime, dur, 'square', 0.06);
    melodyTime += dur * BEAT;
  }

  // Play bass
  let bassTime = now;
  for (const [freq, dur] of bass) {
    playNote(audioCtx, freq, bassTime, dur, 'triangle', 0.1);
    bassTime += dur * BEAT;
  }

  // Schedule next loop
  const loopDuration = melody.reduce((sum, [, dur]) => sum + dur, 0) * BEAT;
  const id = setTimeout(playLoop, loopDuration * 1000 - 100);
  timeoutIds.push(id);
}

export async function startMusic() {
  if (isPlaying) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    isPlaying = true;
    playLoop();
  } catch (err) {
    console.warn('[chiptune] startMusic failed:', err);
  }
}

export function stopMusic() {
  isPlaying = false;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];

  // Stop all currently scheduled oscillators immediately
  for (const osc of scheduledOscillators) {
    try { osc.stop(); } catch { /* already stopped */ }
  }
  scheduledOscillators = [];
}

export async function toggleMusic() {
  if (isPlaying) {
    stopMusic();
    return false;
  } else {
    await startMusic();
    return true;
  }
}

// Per-zone ambient atmospheres (Layer 1 / Task 18)
const AMBIENT = {
  scroll:     { base: 220, intervals: [1, 1.5, 2], rate: 0.25, type: 'sine' },
  popover:    { base: 260, intervals: [1, 1.25, 1.66], rate: 0.4, type: 'triangle' },
  art:        { base: 330, intervals: [1, 1.26, 1.5, 2], rate: 0.6, type: 'sine' },
  container:  { base: 180, intervals: [1, 1.12, 1.33], rate: 0.35, type: 'triangle' },
  transitions:{ base: 300, intervals: [1, 1.5, 2.25], rate: 0.5, type: 'sawtooth' },
  houdini:    { base: 160, intervals: [1, 1.5, 1.78, 2.67], rate: 0.3, type: 'square' },
  has:        { base: 240, intervals: [1, 1.2, 1.6], rate: 0.45, type: 'triangle' },
  layers:     { base: 200, intervals: [1, 1.33, 1.66, 2], rate: 0.5, type: 'sine' },
};
let ambientCtx = null, ambientTimer = null, ambientGain = null;

export function playAmbient(zoneKey) {
  const preset = AMBIENT[zoneKey]; if (!preset) return;
  stopAmbient();
  try {
    ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
    ambientGain = ambientCtx.createGain();
    ambientGain.gain.value = 0.0;
    ambientGain.connect(ambientCtx.destination);
    ambientGain.gain.linearRampToValueAtTime(0.05, ambientCtx.currentTime + 1.5);
    const step = () => {
      if (!ambientCtx) return;
      const mult = preset.intervals[(Math.random() * preset.intervals.length) | 0];
      const osc = ambientCtx.createOscillator();
      const g = ambientCtx.createGain();
      osc.type = preset.type; osc.frequency.value = preset.base * mult;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.4, ambientCtx.currentTime + 0.5);
      g.gain.linearRampToValueAtTime(0, ambientCtx.currentTime + 2);
      osc.connect(g).connect(ambientGain);
      osc.start(); osc.stop(ambientCtx.currentTime + 2.2);
      ambientTimer = setTimeout(step, (1 / preset.rate) * 1000);
    };
    step();
  } catch {}
}

export function stopAmbient() {
  if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; }
  if (ambientGain && ambientCtx) {
    try {
      ambientGain.gain.linearRampToValueAtTime(0, ambientCtx.currentTime + 0.6);
    } catch {}
    setTimeout(() => {
      try { ambientCtx && ambientCtx.close(); } catch {}
      ambientCtx = null; ambientGain = null;
    }, 800);
  }
}
