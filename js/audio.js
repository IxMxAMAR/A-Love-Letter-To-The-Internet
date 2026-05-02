/**
 * audio.js — Centralized audio engine (Layer 2 / Task 2)
 *
 * Web Audio API. AudioContext + master/music/sfx/ambience channels.
 * Sound library generated procedurally (no files). Volume + mute persisted via state.js.
 */

import { state } from './state.js';

const SOUNDS = {
  click:    { type: 'sine',     freq: 800,  dur: 0.05, sweep: -200, gain: 0.7 },
  toggle:   { type: 'triangle', freq: 1000, dur: 0.04, chord: [1, 1.2], gain: 0.6 },
  whoosh:   { type: 'sawtooth', freq: 220,  dur: 0.2,  sweep: 900, gain: 0.5 },
  chime:    { type: 'sine',     freq: 523,  dur: 0.4,  chord: [1, 1.26, 1.5], gain: 0.7 },
  error:    { type: 'sawtooth', freq: 200,  dur: 0.1,  gain: 0.5 },
  pop:      { type: 'sine',     freq: 1400, dur: 0.03, gain: 0.8 },
  type:     { type: 'square',   freq: 1800, dur: 0.02, gain: 0.4 },
  laser:    { type: 'sawtooth', freq: 2000, dur: 0.1,  sweep: -1800, gain: 0.5 },
  explosion:{ type: 'sawtooth', freq: 80,   dur: 0.3,  gain: 0.7, noise: true },
  powerup:  { type: 'sine',     freq: 523,  dur: 0.3,  chord: [1, 1.26, 1.5, 2], gain: 0.7 },
};

class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.channels = {};
    this._loops = new Map();
  }
  _ensure() {
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume();
      return this.context;
    }
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.context.createGain();
    this.master.connect(this.context.destination);
    ['music', 'sfx', 'ambience'].forEach((ch) => {
      const g = this.context.createGain();
      g.connect(this.master);
      this.channels[ch] = g;
    });
    this._applyVolumes();
    return this.context;
  }
  _applyVolumes() {
    const a = state.get('audio') || {};
    if (this.master) this.master.gain.value = a.muted ? 0 : (a.master ?? 0.5);
    if (this.channels.music)    this.channels.music.gain.value    = a.music    ?? 0.5;
    if (this.channels.sfx)      this.channels.sfx.gain.value      = a.sfx      ?? 0.7;
    if (this.channels.ambience) this.channels.ambience.gain.value = a.ambience ?? 0.3;
  }
  play(name, opts = {}) {
    const def = SOUNDS[name]; if (!def) return;
    if (state.get('audio.muted')) return;
    const channel = opts.channel || 'sfx';
    try {
      const ctx = this._ensure();
      const now = ctx.currentTime;
      const chord = def.chord || [1];
      chord.forEach((mult) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = def.type;
        osc.frequency.setValueAtTime(def.freq * mult, now);
        if (def.sweep) osc.frequency.linearRampToValueAtTime((def.freq + def.sweep) * mult, now + def.dur);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(def.gain * 0.4, now + 0.005);
        g.gain.linearRampToValueAtTime(0, now + def.dur);
        osc.connect(g).connect(this.channels[channel]);
        osc.start(now); osc.stop(now + def.dur + 0.05);
      });
    } catch {}
  }
  loop(name, opts = {}) {
    // TODO: Future hook for sustained audio (zone ambience, music beds).
    // Layer 3 currently delegates ambience to chiptune.js / sfx.js, so this
    // method is intentionally a no-op stub. When implementing, store the
    // returned handle in this._loops so stop(name) can cancel it.
    return null;
  }
  stop(name) {
    const handle = this._loops.get(name);
    if (handle?.stop) handle.stop();
    this._loops.delete(name);
  }
  setVolume(channel, v) {
    const a = state.get('audio') || {};
    a[channel] = v;
    state.set('audio', a);
    this._applyVolumes();
  }
  mute(v) {
    const a = state.get('audio') || {};
    a.muted = v == null ? !a.muted : !!v;
    state.set('audio', a);
    this._applyVolumes();
    return a.muted;
  }
  isMuted() { return state.get('audio.muted'); }
}

export const audio = new AudioEngine();
window.__audio = audio;
