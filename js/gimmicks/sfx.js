/**
 * sfx.js — Thin shim that delegates to audio.js (Layer 2 / Task 2)
 *
 * Preserves the legacy import surface (playSfx/setSfxMuted/isSfxMuted/initSfx)
 * so older modules continue to work; all logic lives in js/audio.js now.
 */

import { audio } from '../audio.js';

export function playSfx(name) { audio.play(name); }
export function setSfxMuted(v) { audio.mute(v); }
export function isSfxMuted() { return audio.isMuted(); }
export function initSfx() { /* state.js handles persistence; nothing to init */ }
