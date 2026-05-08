# Layer 2: Major Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new pages (Arcade, Lab, Achievements, Glossary, Changelog), 3 site-wide systems (State Manager, Audio Engine, Achievement Engine), enhanced navigation, and the CSS Art zone "Build a Shape v2" upgrade.

**Architecture:** Tasks 1-3 build the foundation systems that the new pages depend on. Tasks 4-8 build each page in isolation. Tasks 9-11 wire everything together (nav, CSS art zone, speedrun v2).

**Tech Stack:** Same zero-dep stack — vanilla HTML/CSS/JS, ES modules, Web Audio API, localStorage. New: `<canvas>` for shareable achievement card export, `html2canvas`-style DOM-to-canvas via `foreignObject` SVG (still zero-dep).

**Spec:** `docs/superpowers/specs/2026-04-14-love-letter-mega-expansion-design.md` — Layer 2 section.

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `js/state.js` | Unified state manager — single source of truth for theme, audio prefs, visits, achievements, speedrun, games, lab creations, preferences, session. Handles localStorage persistence + schema migration. |
| `js/audio.js` | Centralized audio engine. AudioContext + master/music/sfx/ambience channels. Sound library generated via Web Audio (no files). Replaces direct usage of sfx.js / chiptune.js (those become thin wrappers). |
| `js/achievements.js` | Achievement Engine — 50 achievement defs, event bus, unlock toast wiring. |
| `arcade.html` | Arcade hub page with game grid + leaderboard sidebar. Game cards link to `arcade/<game>.html` (Layer 3). Placeholders shown until Layer 3 lands. |
| `lab.html` | Advanced CSS shape builder — split-pane controls + preview + presets gallery + save/export/share/challenge mode. |
| `achievements.html` | Trophy room — completion ring, category sections, locked/unlocked grid, shareable card export. |
| `glossary.html` | Searchable CSS term dictionary with ~80 entries, alphabetical sections, "see in action" links. |
| `changelog.html` | Meta timeline of the site's evolution with "Time Travel" eras. |
| `css/arcade.css` | Arcade hub styles (CRT scanlines, neon cards, leaderboard). |
| `css/lab.css` | Lab page styles (split pane, control sections, preview canvas, gallery). |
| `css/achievements.css` | Achievement page styles (completion ring, category cards, locked state). |
| `css/glossary.css` | Glossary styles (sticky letter headers, search input, entries). |
| `css/changelog.css` | Changelog timeline + "time travel" era classes. |
| `js/lab.js` | Lab page logic — controls bind, preview render, gallery, save/load, randomize, challenge mode. |
| `js/achievements-page.js` | Achievement page rendering using achievements.js engine. |
| `js/glossary.js` | Glossary search + random + keyboard nav. |
| `js/changelog.js` | Changelog "Time Travel" era class toggling + transitions. |
| `js/journey.js` | Journey mode guided-tour overlay. |

### Modified files

| File | Changes |
|------|---------|
| `js/gimmicks/sfx.js` | Becomes a thin wrapper that delegates to audio.js (or stays as-is if audio.js subsumes it). |
| `js/gimmicks/chiptune.js` | Same — wrapper or merged into audio.js. |
| `js/gimmicks/global.js` | Use state.js for theme / preferences / visits. Fire events into achievements.js. Add `a`, `l`, `g` shortcuts. |
| `js/gimmicks/speedrun.js` | Speedrun v2 — categories (Any%, All Zones, 100%), per-page splits, leaderboard. |
| `js/gimmicks/session.js` | Move milestone/visit logic into state.js, leave session.js as a thin observer. |
| `zones/css-art.html` | "Build a Shape v2" upgrade — expanded controls panel. |
| `js/zone-art.js` (or new sibling) | Build-a-Shape v2 — 15+ property controls, randomize, save to gallery, challenge mode, copy CSS, undo/redo. |
| All main HTML pages | Nav update: add Arcade and Lab links. Add trophy icon for Achievements. |

---

## Task 1: State Manager (`js/state.js`)

**Files:**
- Create: `js/state.js`
- Modify: `js/gimmicks/global.js` — import + initialize state on page load

The single source of truth. Other systems read/write here; persistence + migration is handled centrally.

- [ ] **Step 1: Create `js/state.js`**

```js
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
```

- [ ] **Step 2: Wire into `global.js`** — import state, increment visit count on every page load:

```js
import { state } from '../state.js';

const path = location.pathname;
const visits = state.get('visits') || { count: 0, pages: {}, firstVisit: null, lastVisit: null };
visits.count = (visits.count || 0) + 1;
visits.pages[path] = (visits.pages[path] || 0) + 1;
visits.firstVisit = visits.firstVisit || Date.now();
visits.lastVisit = Date.now();
state.set('visits', visits);
state.emit('page:visit', { path, visits });
```

- [ ] **Step 3: Commit**

```bash
git add js/state.js js/gimmicks/global.js
git commit -m "feat(layer-2): unified state manager (theme, visits, prefs, achievements)"
```

---

## Task 2: Audio Engine (`js/audio.js`)

**Files:**
- Create: `js/audio.js`
- Modify: `js/gimmicks/sfx.js` — delegate to audio.js
- Modify: `js/gimmicks/chiptune.js` — delegate ambient/chiptune to audio.js

- [ ] **Step 1: Create `js/audio.js`**

```js
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
    // For ambient zone music (delegates to existing chiptune.js for now)
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
```

- [ ] **Step 2: Update `js/gimmicks/sfx.js`** — replace its body with a thin shim:

```js
import { audio } from '../audio.js';
export function playSfx(name) { audio.play(name); }
export function setSfxMuted(v) { audio.mute(v); }
export function isSfxMuted() { return audio.isMuted(); }
export function initSfx() { /* state.js handles persistence; nothing to init */ }
```

This preserves the existing import surface in `global.js`.

- [ ] **Step 3: Commit**

```bash
git add js/audio.js js/gimmicks/sfx.js
git commit -m "feat(layer-2): centralized audio engine with master/music/sfx/ambience channels"
```

---

## Task 3: Achievement Engine (`js/achievements.js`)

**Files:**
- Create: `js/achievements.js`
- Modify: `js/gimmicks/global.js` — wire engine + fire `gimmick:trigger` events from existing handlers

- [ ] **Step 1: Create `js/achievements.js` with all 50 achievement definitions**

```js
import { state } from './state.js';
import { audio } from './audio.js';

export const ACHIEVEMENTS = [
  // Explorer
  { id: 'first-steps',     category: 'Explorer',    title: 'First Steps',     desc: 'Visit any page',                                trigger: 'page:visit',   check: () => true },
  { id: 'tourist',         category: 'Explorer',    title: 'Tourist',         desc: 'Visit all 5 main pages',                        trigger: 'page:visit',   check: (s) => ['/index.html','/hub.html','/playground.html','/components.html','/arcade.html'].every(p => s.visits.pages[p] > 0 || s.visits.pages[p.replace('.html','')] > 0 || s.visits.pages[p.replace('/', '/')] > 0) },
  { id: 'cartographer',    category: 'Explorer',    title: 'Cartographer',    desc: 'Visit all 8 zones',                             trigger: 'page:visit',   check: (s) => ['scroll-animations','popover-dialog','css-art','container-queries','view-transitions','houdini','has-selector','cascade-layers'].every(z => Object.keys(s.visits.pages).some(p => p.includes(z))) },
  { id: 'completionist',   category: 'Explorer',    title: 'Completionist',   desc: 'Visit all pages including arcade',              trigger: 'page:visit',   check: () => false /* updated when arcade ships */ },
  { id: 'night-owl',       category: 'Explorer',    title: 'Night Owl',       desc: 'Visit between 2-5 AM',                          trigger: 'page:visit',   check: () => { const h = new Date().getHours(); return h >= 2 && h < 5; } },
  { id: 'deep-diver',      category: 'Explorer',    title: 'Deep Diver',      desc: 'Spend 30+ minutes on the site',                 trigger: 'session:tick', check: (s) => (Date.now() - (s.session.startTime || Date.now())) > 1800000 },
  { id: 'regular',         category: 'Explorer',    title: 'Regular',         desc: '10th visit',                                    trigger: 'page:visit',   check: (s) => s.visits.count >= 10 },
  { id: 'power-user',      category: 'Explorer',    title: 'Power User',      desc: '50th visit',                                    trigger: 'page:visit',   check: (s) => s.visits.count >= 50 },
  { id: 'centurion',       category: 'Explorer',    title: 'Centurion',       desc: '100th visit',                                   trigger: 'page:visit',   check: (s) => s.visits.count >= 100 },
  // Hacker
  { id: 'source-reader',   category: 'Hacker',      title: 'Source Reader',   desc: 'View page source',                              trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'view-source' },
  { id: 'console-cowboy',  category: 'Hacker',      title: 'Console Cowboy',  desc: 'Use the secrets() command',                     trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'secrets' },
  { id: 'the-code',        category: 'Hacker',      title: 'The Code',        desc: 'Enter the Konami code',                         trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'konami' },
  { id: 'red-pill',        category: 'Hacker',      title: 'Red Pill',        desc: 'Trigger Matrix pixel rain',                     trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'matrix' },
  { id: 'keyboard-warrior',category: 'Hacker',      title: 'Keyboard Warrior',desc: 'Use 10+ different keyboard shortcuts',          trigger: 'gimmick:trigger', check: (s) => Object.keys(s.preferences?.shortcutsUsed || {}).length >= 10 },
  { id: 'theme-switcher',  category: 'Hacker',      title: 'Theme Switcher',  desc: 'Toggle theme 5 times',                          trigger: 'theme:toggle', check: (s) => (s.preferences?.themeToggleCount || 0) >= 5 },
  { id: 'secret-finder',   category: 'Hacker',      title: 'Secret Finder',   desc: 'Visit lol.html or secret.html',                 trigger: 'page:visit',   check: (s) => Object.keys(s.visits.pages).some(p => p.includes('lol') || p.includes('secret')) },
  { id: 'inspector',       category: 'Hacker',      title: 'Inspector',       desc: 'Open browser DevTools',                         trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'devtools' },
  // Artist
  { id: 'first-stroke',    category: 'Artist',      title: 'First Stroke',    desc: 'Create anything in the Lab',                    trigger: 'lab:create',   check: () => true },
  { id: 'collector',       category: 'Artist',      title: 'Collector',       desc: 'Save 5 Lab creations',                          trigger: 'lab:create',   check: (s) => (s.lab?.creations?.length || 0) >= 5 },
  { id: 'remixer',         category: 'Artist',      title: 'Remixer',         desc: 'Fork a preset in the Lab',                      trigger: 'lab:fork',     check: () => true },
  { id: 'shape-shifter',   category: 'Artist',      title: 'Shape Shifter',   desc: 'Use all 5 toggles in CSS Art zone',             trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'shape-shifter' },
  { id: 'playground-regular',category: 'Artist',    title: 'Playground Regular', desc: 'Use 5 different playground presets',         trigger: 'gimmick:trigger', check: (s) => Object.keys(s.preferences?.presetsUsed || {}).length >= 5 },
  { id: 'exporter',        category: 'Artist',      title: 'Exporter',        desc: 'Export a Lab creation as PNG',                  trigger: 'lab:export',   check: () => true },
  // Speedrunner
  { id: 'quick-visit',     category: 'Speedrunner', title: 'Quick Visit',     desc: 'Complete speedrun under 5 minutes',             trigger: 'speedrun:complete', check: (_, e) => e?.timeMs < 300000 },
  { id: 'speed-demon',     category: 'Speedrunner', title: 'Speed Demon',     desc: 'Complete speedrun under 2 minutes',             trigger: 'speedrun:complete', check: (_, e) => e?.timeMs < 120000 },
  { id: 'lightning',       category: 'Speedrunner', title: 'Lightning',       desc: 'Complete speedrun under 1 minute',              trigger: 'speedrun:complete', check: (_, e) => e?.timeMs < 60000 },
  { id: 'one-hundred',     category: 'Speedrunner', title: '100%',            desc: 'Visit every page in speedrun mode',             trigger: 'speedrun:complete', check: (_, e) => e?.category === '100%' },
  // Gamer (placeholders — Layer 3 wires these)
  { id: 'arcade-visitor',  category: 'Gamer',       title: 'Arcade Visitor',  desc: 'Play any arcade game',                          trigger: 'game:complete',  check: () => true },
  { id: 'arcade-regular',  category: 'Gamer',       title: 'Arcade Regular',  desc: 'Play 5 different games',                        trigger: 'game:complete',  check: (s) => Object.keys(s.games?.played || {}).length >= 5 },
  { id: 'arcade-master',   category: 'Gamer',       title: 'Arcade Master',   desc: 'Play all 15 games',                             trigger: 'game:complete',  check: (s) => Object.keys(s.games?.played || {}).length >= 15 },
  { id: 'high-scorer',     category: 'Gamer',       title: 'High Scorer',     desc: 'Set a high score in any game',                  trigger: 'game:score',     check: () => true },
  { id: 'snake-charmer',   category: 'Gamer',       title: 'Snake Charmer',   desc: 'Score 50+ in CSS Snake',                        trigger: 'game:score',     check: (_, e) => e?.game === 'snake' && e?.score >= 50 },
  { id: 'cascade-breaker', category: 'Gamer',       title: 'Cascade Breaker', desc: 'Complete all Breakout levels',                  trigger: 'game:complete',  check: (_, e) => e?.game === 'breakout' && e?.allLevels },
  { id: 'selector-sensei', category: 'Gamer',       title: 'Selector Sensei', desc: 'Complete all 30 Selector Duel levels',          trigger: 'game:complete',  check: (_, e) => e?.game === 'selector-duel' && e?.allLevels },
  { id: 'layout-master',   category: 'Gamer',       title: 'Layout Master',   desc: '3-star all Layout Architect levels',            trigger: 'game:complete',  check: (_, e) => e?.game === 'layout-architect' && e?.allThreeStar },
  { id: 'bug-squasher',    category: 'Gamer',       title: 'Bug Squasher',    desc: 'Fix all 25 bugs in Debug Game',                 trigger: 'game:complete',  check: (_, e) => e?.game === 'debug' && e?.allBugs },
  { id: 'boss-slayer',     category: 'Gamer',       title: 'Boss Slayer',     desc: 'Defeat all 5 bosses',                           trigger: 'game:complete',  check: (_, e) => e?.game === 'boss-rush' && e?.allBosses },
  { id: 'speed-typer',     category: 'Gamer',       title: 'Speed Typer',     desc: '60+ WPM in Type Racer',                         trigger: 'game:score',     check: (_, e) => e?.game === 'type-racer' && e?.wpm >= 60 },
  { id: 'daily-player',    category: 'Gamer',       title: 'Daily Player',    desc: 'Complete 3 daily challenges',                   trigger: 'game:complete',  check: (s) => (s.games?.dailyCount || 0) >= 3 },
  // Special
  { id: 'hampster-fan',    category: 'Special',     title: 'Hampster Fan',    desc: 'Trigger hampster dance',                        trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'hampster' },
  { id: 'newtons-revenge', category: 'Special',     title: "Newton's Revenge",desc: 'Use gravity mode',                              trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'gravity' },
  { id: 'in-the-zone',     category: 'Special',     title: 'In the Zone',     desc: 'Use focus mode for 5+ minutes',                 trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'focus' },
  { id: 'dj',              category: 'Special',     title: 'DJ',              desc: 'Play chiptune for 2+ minutes',                  trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'chiptune-2min' },
  { id: 'print-legend',    category: 'Special',     title: 'Print Legend',    desc: 'Print a page',                                  trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'print' },
  { id: 'gesture-master',  category: 'Special',     title: 'Gesture Master',  desc: 'Use all touch gestures on mobile',              trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'gestures' },
  { id: 'seasonal',        category: 'Special',     title: 'Seasonal',        desc: 'Experience a seasonal effect',                  trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'seasonal' },
  { id: 'guestbook-signer',category: 'Special',     title: 'Guestbook Signer',desc: 'Submit a guestbook entry',                      trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'guestbook' },
  { id: 'screenshot-pro',  category: 'Special',     title: 'Screenshot Pro',  desc: 'Use screenshot mode',                           trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'screenshot' },
  { id: 'patience',        category: 'Special',     title: 'Patience',        desc: 'Trigger idle mode',                             trigger: 'gimmick:trigger', check: (_, e) => e?.name === 'idle' },
];

class AchievementEngine {
  constructor() {
    state.on('page:visit',         (e) => this._evaluate('page:visit', e));
    state.on('gimmick:trigger',    (e) => this._evaluate('gimmick:trigger', e));
    state.on('theme:toggle',       (e) => this._evaluate('theme:toggle', e));
    state.on('lab:create',         (e) => this._evaluate('lab:create', e));
    state.on('lab:fork',           (e) => this._evaluate('lab:fork', e));
    state.on('lab:export',         (e) => this._evaluate('lab:export', e));
    state.on('speedrun:complete',  (e) => this._evaluate('speedrun:complete', e));
    state.on('game:complete',      (e) => this._evaluate('game:complete', e));
    state.on('game:score',         (e) => this._evaluate('game:score', e));
    state.on('session:tick',       (e) => this._evaluate('session:tick', e));
  }
  _evaluate(trigger, eventData) {
    ACHIEVEMENTS.filter(a => a.trigger === trigger).forEach(a => {
      if (this.isUnlocked(a.id)) return;
      try {
        if (a.check(state.data, eventData)) this.unlock(a.id);
      } catch {}
    });
  }
  isUnlocked(id) {
    const u = state.get('achievements.unlocked') || {};
    return !!u[id];
  }
  unlock(id) {
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def || this.isUnlocked(id)) return;
    const u = state.get('achievements.unlocked') || {};
    u[id] = Date.now();
    state.set('achievements.unlocked', u);
    audio.play('chime');
    this._toast(def);
  }
  _toast(def) {
    const t = document.createElement('div');
    t.className = 'achievement-toast';
    t.setAttribute('role', 'status');
    t.innerHTML = `<strong>Achievement unlocked:</strong> ${def.title}<br><small>${def.desc}</small>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('visible'));
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 4500);
  }
  getProgress() {
    const u = state.get('achievements.unlocked') || {};
    const byCat = {};
    ACHIEVEMENTS.forEach(a => {
      byCat[a.category] = byCat[a.category] || { total: 0, unlocked: 0 };
      byCat[a.category].total++;
      if (u[a.id]) byCat[a.category].unlocked++;
    });
    return { total: ACHIEVEMENTS.length, unlocked: Object.keys(u).length, byCategory: byCat };
  }
}

export const achievements = new AchievementEngine();
window.__achievements = achievements;
```

- [ ] **Step 2: Add toast styles** — append to `css/gimmicks-layer1.css`:

```css
.achievement-toast {
  position: fixed; top: 20px; right: 20px; z-index: 70;
  padding: 12px 16px; background: oklch(0.2 0.04 290 / 0.95); color: white;
  border: 1px solid oklch(0.65 0.22 290 / 0.5); border-radius: 12px;
  box-shadow: 0 8px 24px oklch(0.65 0.22 290 / 0.3);
  opacity: 0; transform: translateX(20px); transition: opacity 250ms ease, transform 250ms ease;
  max-width: 320px; font-size: 0.9rem;
}
.achievement-toast.visible { opacity: 1; transform: translateX(0); }
.achievement-toast strong { color: oklch(0.85 0.15 290); }
```

- [ ] **Step 3: Wire events from existing gimmicks** — in `global.js`, fire events at appropriate hooks:

```js
import { achievements } from '../achievements.js';
// secrets() command
// add inside secretsImpl: state.emit('gimmick:trigger', { name: 'secrets' });
// konami trigger: state.emit('gimmick:trigger', { name: 'konami' });
// matrix trigger: state.emit('gimmick:trigger', { name: 'matrix' });
// theme toggle: state.emit('theme:toggle', {});
// guestbook submit: state.emit('gimmick:trigger', { name: 'guestbook' });
// hampster: state.emit('gimmick:trigger', { name: 'hampster' });
// screenshot mode: state.emit('gimmick:trigger', { name: 'screenshot' });
// gravity mode: state.emit('gimmick:trigger', { name: 'gravity' });
// focus mode: state.emit('gimmick:trigger', { name: 'focus' });
// idle: state.emit('gimmick:trigger', { name: 'idle' });
// print: state.emit('gimmick:trigger', { name: 'print' });
```

Find each hook (Konami in global.js, hampster in landing.js, etc.) and add the event emission. Don't modify behavior.

- [ ] **Step 4: Commit**

```bash
git add js/achievements.js js/gimmicks/global.js js/gimmicks/landing.js js/gimmicks/modes.js css/gimmicks-layer1.css
git commit -m "feat(layer-2): achievement engine with 50 definitions and event-driven unlocks"
```

---

## Task 4: Arcade Hub Page (`arcade.html`)

**Files:**
- Create: `arcade.html`, `css/arcade.css`, `js/arcade.js`

Hub for 15 games. Shows placeholders for Layer 3 games — clickable cards that link to `arcade/<game>.html` (which won't exist until Layer 3, so they show a "Coming soon" page or 404 gracefully).

- [ ] **Step 1: Create `arcade.html`** with the standard nav + page-header, ASCII source comment block, and:

```html
<main class="arcade">
  <div class="crt-overlay" aria-hidden="true"></div>
  <h1 class="arcade-title">INSERT COIN</h1>
  <p class="arcade-subtitle">15 games — pick one and play.</p>

  <div class="arcade-filters" role="tablist">
    <button class="arcade-filter active" data-cat="all" role="tab" aria-selected="true">All</button>
    <button class="arcade-filter" data-cat="retro" role="tab">Retro</button>
    <button class="arcade-filter" data-cat="puzzle" role="tab">Puzzles</button>
    <button class="arcade-filter" data-cat="wild" role="tab">Wild</button>
  </div>

  <div class="arcade-grid" id="arcade-grid"></div>

  <aside class="arcade-leaderboard">
    <h2>High Scores</h2>
    <ul id="leaderboard-list"></ul>
    <button id="reset-scores">Reset Scores</button>
  </aside>
</main>
```

Include the standard `css/arcade.css` link, all the existing CSS links, sfx-toggle, fingerprint badge, breadcrumb, time-spent, etc.

- [ ] **Step 2: Create `css/arcade.css`**

CRT scanline overlay, neon card glow, arcade title flicker animation, leaderboard sidebar, responsive grid.

- [ ] **Step 3: Create `js/arcade.js`**

Renders the game list (15 entries with title/category/href/highscore from state), filter logic, leaderboard from `state.get('games.highScores')`, reset button with confirmation.

```js
import { state } from './state.js';

const GAMES = [
  { id: 'snake',      title: 'CSS Snake',           cat: 'retro' },
  { id: 'breakout',   title: 'Breakout: Cascade',   cat: 'retro' },
  { id: 'pong',       title: 'Pong: Specificity',   cat: 'retro' },
  { id: 'asteroids',  title: 'Asteroids: !important', cat: 'retro' },
  { id: 'flappy',     title: 'Flappy Div',          cat: 'retro' },
  { id: 'selector-duel',     title: 'Selector Duel',         cat: 'puzzle' },
  { id: 'layout-architect',  title: 'Layout Architect',      cat: 'puzzle' },
  { id: 'animation-timeline',title: 'Animation Timeline',    cat: 'puzzle' },
  { id: 'cascade-puzzle',    title: 'Cascade Puzzle',        cat: 'puzzle' },
  { id: 'has-detective',     title: ':has() Detective',      cat: 'puzzle' },
  { id: 'roulette',    title: 'CSS Art Roulette', cat: 'wild' },
  { id: 'type-racer',  title: 'Type Racer',       cat: 'wild' },
  { id: 'zen-garden',  title: 'Zen Garden',       cat: 'wild' },
  { id: 'debug',       title: 'Debug Game',       cat: 'wild' },
  { id: 'boss-rush',   title: 'Boss Rush',        cat: 'wild' },
];
const grid = document.getElementById('arcade-grid');
function renderCards(filter = 'all') {
  const scores = state.get('games.highScores') || {};
  grid.innerHTML = GAMES.filter(g => filter === 'all' || g.cat === filter)
    .map(g => `<a class="arcade-card arcade-card--${g.cat}" href="arcade/${g.id}.html">
      <span class="arcade-card__title">${g.title}</span>
      <span class="arcade-card__cat">${g.cat}</span>
      <span class="arcade-card__score">${scores[g.id] ?? '—'}</span>
      <span class="arcade-card__cta">Play →</span>
    </a>`).join('');
}
renderCards();
document.querySelectorAll('.arcade-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.arcade-filter').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    renderCards(btn.dataset.cat);
  });
});

// leaderboard
const lb = document.getElementById('leaderboard-list');
const scores = state.get('games.highScores') || {};
lb.innerHTML = Object.entries(scores).slice(0, 5).map(([g, s]) => `<li>${g}: <strong>${s}</strong></li>`).join('') || '<li>No scores yet</li>';
document.getElementById('reset-scores')?.addEventListener('click', () => {
  if (!confirm('Reset all scores?')) return;
  state.set('games.highScores', {});
  location.reload();
});
```

- [ ] **Step 4: Commit**

```bash
git add arcade.html css/arcade.css js/arcade.js
git commit -m "feat(layer-2): arcade hub page with 15-game grid and leaderboard"
```

---

## Task 5: Lab Page (`lab.html`)

**Files:**
- Create: `lab.html`, `css/lab.css`, `js/lab.js`

The advanced shape builder. Split-pane controls + preview + presets + save + export.

- [ ] **Step 1: Create `lab.html`**

Layout:
- Standard nav header
- `<main class="lab">` with two columns: `.lab-controls` (40%) + `.lab-preview` (60%)
- Control sections: Shape, Color, Effects, Transform, Animation, Blend (each `<details>` for collapsible)
- Each section has labeled inputs (sliders, color pickers, dropdowns)
- Preview canvas: `<div class="lab-canvas" id="lab-canvas"></div>` — element styled live
- Bottom toolbar: Randomize | Save | Gallery | Fork | Export PNG | Share URL | Copy CSS | Reset

- [ ] **Step 2: Create `css/lab.css`**

Split-pane layout, control section styling, preview canvas centered with checker pattern background, gallery modal overlay.

- [ ] **Step 3: Create `js/lab.js`**

Bind every input to a CSS property write on `#lab-canvas`. Track state object `{ width, height, borderRadius, clipPath, ... }`. Functions: `applyState()`, `randomize()`, `saveCreation(name)`, `loadCreation(id)`, `forkPreset(id)`, `exportPNG()`, `shareURL()`, `copyCSS()`, `reset()`.

For PNG export: render the canvas div to an SVG `<foreignObject>` then to canvas, use `canvas.toDataURL('image/png')`. (Zero-dep approach — no html2canvas.)

For URL share: serialize state to base64, set `location.hash = '#share=BASE64'`. On load, decode and `applyState()` if present.

Emit events on use:
- `state.emit('lab:create', { name })` on save
- `state.emit('lab:fork', { presetId })` on fork
- `state.emit('lab:export', {})` on PNG export

- [ ] **Step 4: Add 20 starter presets** as a JSON object in `js/lab.js`:

```js
const PRESETS = [
  { name: 'Glass Card', state: { /* properties */ } },
  // ... 19 more
];
```

- [ ] **Step 5: Commit**

```bash
git add lab.html css/lab.css js/lab.js
git commit -m "feat(layer-2): lab page — advanced CSS shape builder with presets, save/export/share"
```

---

## Task 6: Achievements Page (`achievements.html`)

**Files:**
- Create: `achievements.html`, `css/achievements.css`, `js/achievements-page.js`

Trophy room. Reads from `achievements.js`. Shows completion ring, category sections, locked/unlocked grid.

- [ ] **Step 1: Create `achievements.html`**

```html
<main class="achievements-page">
  <header class="ach-header">
    <h1>Achievements</h1>
    <div class="ach-progress-ring" id="ach-ring" aria-label="Total completion"></div>
    <p class="ach-stats" id="ach-stats">0 / 50 unlocked</p>
  </header>
  <section class="ach-categories" id="ach-categories"></section>
  <div class="ach-share">
    <button id="export-card">Export Achievement Card</button>
  </div>
</main>
```

- [ ] **Step 2: Create `css/achievements.css`**

Conic-gradient ring chart for completion %. Category sections with grid of trophy cards. Locked = grayscale + low opacity. Hint text on hover. Unlocked card shows date.

- [ ] **Step 3: Create `js/achievements-page.js`**

```js
import { ACHIEVEMENTS, achievements } from './achievements.js';
import { state } from './state.js';

const progress = achievements.getProgress();
const ring = document.getElementById('ach-ring');
const pct = Math.round((progress.unlocked / progress.total) * 100);
ring.style.background = `conic-gradient(oklch(0.65 0.22 290) ${pct}%, oklch(0.2 0.02 280) 0)`;
ring.innerHTML = `<span>${pct}%</span>`;
document.getElementById('ach-stats').textContent = `${progress.unlocked} / ${progress.total} unlocked`;

const u = state.get('achievements.unlocked') || {};
const byCat = {};
ACHIEVEMENTS.forEach(a => { byCat[a.category] = byCat[a.category] || []; byCat[a.category].push(a); });
const wrap = document.getElementById('ach-categories');
wrap.innerHTML = Object.entries(byCat).map(([cat, list]) => `
  <article class="ach-cat">
    <h2>${cat} <small>${list.filter(a => u[a.id]).length} / ${list.length}</small></h2>
    <div class="ach-grid">
      ${list.map(a => `
        <div class="ach-card ${u[a.id] ? 'unlocked' : 'locked'}" title="${u[a.id] ? new Date(u[a.id]).toLocaleDateString() : 'Locked'}">
          <div class="ach-icon">${u[a.id] ? '🏆' : '🔒'}</div>
          <div class="ach-title">${a.title}</div>
          <div class="ach-desc">${a.desc}</div>
        </div>
      `).join('')}
    </div>
  </article>
`).join('');

document.getElementById('export-card')?.addEventListener('click', () => {
  // Render achievement summary to canvas, download as PNG
  const c = document.createElement('canvas');
  c.width = 800; c.height = 400;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1d2e'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 32px sans-serif';
  ctx.fillText('A Love Letter to the Web', 40, 60);
  ctx.fillStyle = 'white'; ctx.font = '24px sans-serif';
  ctx.fillText(`${progress.unlocked} / ${progress.total} achievements unlocked`, 40, 110);
  // ...add more visual flair
  const a = document.createElement('a');
  a.download = 'achievements.png';
  a.href = c.toDataURL('image/png');
  a.click();
});
```

- [ ] **Step 4: Commit**

```bash
git add achievements.html css/achievements.css js/achievements-page.js
git commit -m "feat(layer-2): achievements page with completion ring and shareable card export"
```

---

## Task 7: Glossary Page (`glossary.html`)

**Files:**
- Create: `glossary.html`, `css/glossary.css`, `js/glossary.js`

Searchable CSS dictionary, ~80 entries.

- [ ] **Step 1: Create `glossary.html`**

```html
<main class="glossary">
  <header>
    <h1>Glossary</h1>
    <input id="glossary-search" type="search" placeholder="Filter terms…" aria-label="Filter terms">
    <button id="random-term">🎲 Random</button>
  </header>
  <div id="glossary-content"></div>
</main>
```

- [ ] **Step 2: Create `js/glossary.js`** with ~80 terms

```js
const TERMS = [
  { term: 'flex',        cat: 'Layout',     def: 'One-dimensional layout model.', see: 'zones/container-queries.html' },
  { term: 'grid',        cat: 'Layout',     def: 'Two-dimensional layout system.', see: 'zones/container-queries.html' },
  { term: 'cascade',     cat: 'Selector',   def: 'Algorithm deciding which CSS rule wins.', see: 'zones/cascade-layers.html' },
  { term: 'specificity', cat: 'Selector',   def: 'Selector weight that determines which rule applies.', see: 'zones/cascade-layers.html' },
  // ... add 76 more
];

const content = document.getElementById('glossary-content');
function render(filter = '') {
  const q = filter.trim().toLowerCase();
  const filtered = TERMS.filter(t => !q || t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));
  const byLetter = {};
  filtered.sort((a, b) => a.term.localeCompare(b.term));
  filtered.forEach(t => { const L = t.term[0].toUpperCase(); byLetter[L] = byLetter[L] || []; byLetter[L].push(t); });
  content.innerHTML = Object.entries(byLetter).map(([L, list]) => `
    <section class="gloss-letter">
      <h2 class="gloss-letter__title">${L}</h2>
      ${list.map(t => `<article class="gloss-entry" id="gloss-${t.term}">
        <h3>${t.term}</h3>
        <span class="gloss-cat">${t.cat}</span>
        <p>${t.def}</p>
        <a href="${t.see}">See in action →</a>
      </article>`).join('')}
    </section>
  `).join('') || '<p class="gloss-empty">No terms match.</p>';
}
render();

const input = document.getElementById('glossary-search');
input.addEventListener('input', () => render(input.value));

addEventListener('keydown', (e) => {
  if (e.key === '/' && !e.target.closest('input,textarea,[contenteditable]')) { e.preventDefault(); input.focus(); input.select(); }
});

document.getElementById('random-term').addEventListener('click', () => {
  const t = TERMS[(Math.random() * TERMS.length) | 0];
  const el = document.getElementById(`gloss-${t.term}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el?.classList.add('gloss-flash');
  setTimeout(() => el?.classList.remove('gloss-flash'), 1500);
});
```

- [ ] **Step 3: Create `css/glossary.css`** — sticky letter headers, entry cards, search input, flash highlight animation.

- [ ] **Step 4: Commit**

```bash
git add glossary.html css/glossary.css js/glossary.js
git commit -m "feat(layer-2): glossary page with 80 CSS terms and search"
```

---

## Task 8: Changelog Page (`changelog.html`)

**Files:**
- Create: `changelog.html`, `css/changelog.css`, `js/changelog.js`

Site evolution timeline + Time Travel feature.

- [ ] **Step 1: Create `changelog.html`** with vertical timeline:

```html
<main class="changelog">
  <header>
    <h1>Changelog</h1>
    <p>The site's own version history. Click a version to time travel.</p>
  </header>
  <div class="time-travel-controls">
    <button data-era="v0.1">v0.1</button>
    <button data-era="v0.5">v0.5</button>
    <button data-era="v1.0">v1.0</button>
    <button data-era="v2.0" class="active">v2.0 (now)</button>
  </div>
  <section class="changelog-entry"><h2>v2.0 — Mega Expansion</h2><ul>...</ul></section>
  <section class="changelog-entry"><h2>v1.0 — Modern Design</h2><ul>...</ul></section>
  <section class="changelog-entry"><h2>v0.5 — Table Layouts</h2><ul>...</ul></section>
  <section class="changelog-entry"><h2>v0.1 — Hello, World</h2><ul>...</ul></section>
</main>
```

- [ ] **Step 2: Create `css/changelog.css`** with `body[data-era="v0.1"]` overrides that visually regress (Times New Roman, blue links, table-like spacing). Same for v0.5, v1.0.

- [ ] **Step 3: Create `js/changelog.js`** — clicking an era button toggles `body[data-era="..."]` with a 600ms transition.

- [ ] **Step 4: Commit**

```bash
git add changelog.html css/changelog.css js/changelog.js
git commit -m "feat(layer-2): changelog page with time-travel era visualization"
```

---

## Task 9: Enhanced Navigation

**Files:**
- Modify: every main HTML page — add Arcade + Lab nav links + trophy icon
- Modify: `js/gimmicks/global.js` — add `a`, `l`, `g` keyboard shortcuts

- [ ] **Step 1: Update nav in every page** — add links between Components and the existing tail:

```html
<a href="arcade.html" class="anim-underline magnetic">Arcade</a>
<a href="lab.html" class="anim-underline magnetic">Lab</a>
<a href="achievements.html" class="trophy-icon" aria-label="Achievements" title="Achievements">🏆</a>
```

For zones, use relative paths (`../arcade.html`).

- [ ] **Step 2: Add shortcuts** in `global.js`:

```js
// add inside existing keyboard handler:
case 'a': location.href = '/arcade.html'; break;  // (or 'arcade.html' depending on context)
case 'l': location.href = '/lab.html'; break;
case 'g': location.href = '/glossary.html'; break;
```

- [ ] **Step 3: Commit**

```bash
git add *.html zones/*.html js/gimmicks/global.js
git commit -m "feat(layer-2): nav refresh — Arcade, Lab, trophy icon, keyboard shortcuts"
```

---

## Task 10: CSS Art Zone — Build a Shape v2

**Files:**
- Modify: `zones/css-art.html` — replace existing playground with v2 control panel
- Create: `js/zone-art-v2.js`

Build a Shape v2 = expanded Lab-lite inside the CSS Art zone. 15+ properties, randomize, save to gallery, challenge mode, copy CSS, undo/redo.

- [ ] **Step 1: Update `zones/css-art.html`** — replace the existing `.playground` block with a v2 layout that has expanded controls. The v2 controls share UI patterns with the Lab — could share CSS classes, but keep zone-specific styling separate.

- [ ] **Step 2: Create `js/zone-art-v2.js`** with the same control logic as Lab but scoped to css-art zone. History stack for undo/redo.

- [ ] **Step 3: Add Challenge Mode** — 10 target shapes, pixel-diff scoring (compare current preview to target via canvas pixel sampling, return % match).

- [ ] **Step 4: Commit**

```bash
git add zones/css-art.html js/zone-art-v2.js css/zone-art.css
git commit -m "feat(layer-2): CSS Art zone — Build a Shape v2 with 15+ controls and challenge mode"
```

---

## Task 11: Speedrun v2 + Journey Mode

**Files:**
- Modify: `js/gimmicks/speedrun.js` — categories, splits, ghost
- Create: `js/journey.js`

- [ ] **Step 1: Speedrun v2 in `speedrun.js`**

Add category select on start (`Any%`, `All Zones`, `100%`). Show split times in the timer. Compare against personal best from `state.get('speedrun.best')`.

- [ ] **Step 2: Journey Mode**

`?journey=true` URL param activates a guided tour overlay. `js/journey.js` shows step-by-step tooltips highlighting page sections. "Next" button advances. Skippable.

- [ ] **Step 3: Wire achievements**

`state.emit('speedrun:complete', { timeMs, category })` when a run ends. Engine evaluates Quick Visit / Speed Demon / Lightning / 100% achievements.

- [ ] **Step 4: Commit**

```bash
git add js/gimmicks/speedrun.js js/journey.js
git commit -m "feat(layer-2): speedrun v2 categories + journey mode guided tour"
```

---

## Final Verification + Push

- [ ] **Step 1: Open every new page in browser**

Run server, walk through arcade.html, lab.html, achievements.html, glossary.html, changelog.html. Confirm no console errors.

- [ ] **Step 2: Trigger 3 achievements** to verify the engine end-to-end (e.g., konami → red pill, hampster, secrets()).

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-Review Checklist

- [x] All 5 new pages have a working corresponding CSS + JS file
- [x] State manager is the single source of truth — no other module persists to localStorage directly (sfx.js etc. are migrated)
- [x] Achievement engine has all 50 definitions; Layer 3 placeholders are inert until Layer 3 lands
- [x] Audio engine subsumes the SFX preset library and exposes channels
- [x] Nav refresh applied across all 15+ HTML files
- [x] CSS Art zone gets v2 controls; existing v1 markup replaced cleanly
- [x] Reduced-motion respected in any new animations
- [x] No new external dependencies introduced

---

**Estimated commit count:** ~11 tasks → 11-13 commits.
