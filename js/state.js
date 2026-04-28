/**
 * state.js — Unified site state manager (Layer 2 / Task 1)
 *
 * Single source of truth. Handles localStorage persistence + schema migration.
 * Other systems (audio, achievements, lab, speedrun, etc.) read/write through here.
 */

const STORAGE_KEY = 'site-state';
const CURRENT_VERSION = 1;

const DEFAULT_STATE = {
  version: CURRENT_VERSION,
  theme: 'dark',
  audio: { master: 0.5, music: 0.5, sfx: 0.7, ambience: 0.3, muted: true },
  visits: { count: 0, pages: {}, firstVisit: null, lastVisit: null },
  achievements: { unlocked: {} },
  speedrun: { best: {}, current: null },
  games: { highScores: {} },
  lab: { creations: [], lastOpen: null },
  preferences: { cursorTrail: false, ghosts: false, focusMode: false, scrollSnap: true },
  session: { startTime: null, pagesThisSession: [] },
};

const MIGRATIONS = {
  // 1: (s) => { ...migrate v0 to v1... }
};

class StateManager {
  constructor() {
    this.data = this._load();
    this._listeners = new Map();
    this._eventListeners = new Map();
  }
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return this._migrate(parsed);
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }
  _migrate(state) {
    let v = state.version || 0;
    while (v < CURRENT_VERSION) {
      v++;
      const fn = MIGRATIONS[v];
      if (fn) state = fn(state);
    }
    state.version = CURRENT_VERSION;
    return Object.assign(structuredClone(DEFAULT_STATE), state);
  }
  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch {}
  }
  get(key) {
    return key.split('.').reduce((o, k) => o?.[k], this.data);
  }
  set(key, value) {
    const keys = key.split('.');
    let o = this.data;
    for (let i = 0; i < keys.length - 1; i++) {
      o[keys[i]] = o[keys[i]] || {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
    this._save();
    (this._listeners.get(key) || []).forEach(fn => { try { fn(value); } catch {} });
  }
  subscribe(key, fn) {
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key).push(fn);
  }
  emit(event, data) {
    (this._eventListeners.get(event) || []).forEach(fn => { try { fn(data); } catch {} });
  }
  on(event, fn) {
    if (!this._eventListeners.has(event)) this._eventListeners.set(event, []);
    this._eventListeners.get(event).push(fn);
  }
  export() { return JSON.stringify(this.data, null, 2); }
  reset() {
    if (!confirm('Reset all site data? This cannot be undone.')) return;
    this.data = structuredClone(DEFAULT_STATE);
    this._save();
    location.reload();
  }
  get version() { return this.data.version; }
}

export const state = new StateManager();
window.__state = state;
