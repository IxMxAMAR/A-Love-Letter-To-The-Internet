/**
 * 1996 Era Chiptune — Web Audio API procedural music.
 * Generates a catchy 8-bit melody with square/triangle waves.
 * No audio files — pure oscillator synthesis.
 */

let audioCtx = null;
let isPlaying = false;
let timeoutIds = [];

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

export function startMusic() {
  if (isPlaying) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  isPlaying = true;
  playLoop();
}

export function stopMusic() {
  isPlaying = false;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
}

export function toggleMusic() {
  if (isPlaying) {
    stopMusic();
    return false;
  } else {
    startMusic();
    return true;
  }
}
