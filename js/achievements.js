/**
 * achievements.js — Achievement Engine (Layer 2 / Task 3)
 *
 * 50 achievement definitions across 6 categories: Explorer, Hacker, Artist,
 * Speedrunner, Gamer, Special. Listens on state.js event bus, fires
 * audio.play('chime') + toast on unlock, persists to state.achievements.unlocked.
 */

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
