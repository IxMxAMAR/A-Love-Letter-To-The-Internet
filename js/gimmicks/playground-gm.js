/**
 * playground-gm.js — Playground editor gimmicks
 * "A Love Letter to the Web"
 */

// ─── Toast helper ────────────────────────────────────────────────────────────

function showToast(msg, duration = 3000) {
  const existing = document.querySelector('.pg-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'pg-toast';
  toast.textContent = msg;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%) translateY(40px)',
    background: 'rgba(20, 20, 30, 0.92)',
    color: '#e8e8ff',
    padding: '12px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    border: '1px solid rgba(140,100,255,0.3)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  });

  document.body.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(40px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─── Find the editor element ──────────────────────────────────────────────────

const editor =
  document.querySelector('[contenteditable]') ||
  document.querySelector('.editor-content') ||
  document.querySelector('textarea');

if (!editor) {
  console.warn('[playground-gm] No editor element found.');
} else {
  // ─── State ──────────────────────────────────────────────────────────────

  let welcomeShown = false;
  let importantCount = 0;
  let emptyTimer = null;
  let tabToastShown = false;
  let prevText = '';

  // ─── Night owl check (runs once on load) ─────────────────────────────

  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) {
    setTimeout(() => showToast('Late night coding? Respect. ☕', 4000), 800);
  }

  // ─── Find preview pane ────────────────────────────────────────────────

  const previewPane =
    document.querySelector('.preview-pane') ||
    document.querySelector('.preview') ||
    document.querySelector('iframe');

  // ─── Input handler ────────────────────────────────────────────────────

  editor.addEventListener('input', () => {
    const text = editor.value !== undefined ? editor.value : editor.textContent;

    // First keystroke welcome
    if (!welcomeShown && text.trim().length > 0) {
      welcomeShown = true;
      showToast('Welcome, developer. ✨', 3000);
    }

    // !important warning (max 3 times) — only when newly added
    if (importantCount < 3 && text.includes('!important') && !prevText.includes('!important')) {
      importantCount++;
      showToast('⚠️ With great specificity comes great responsibility.', 3500);
    }

    // display: none — fade preview — only when newly added
    const hasDisplayNone = text.includes('display: none') || text.includes('display:none');
    const hadDisplayNone = prevText.includes('display: none') || prevText.includes('display:none');
    if (hasDisplayNone && !hadDisplayNone) {
      if (previewPane) {
        previewPane.style.transition = 'opacity 0.4s ease';
        previewPane.style.opacity = '0';
        setTimeout(() => {
          previewPane.style.opacity = '1';
          showToast('Just kidding. 😄', 2500);
        }, 1000);
      } else {
        showToast('Just kidding. 😄', 2500);
      }
    }

    // color: red — only when newly added
    const hasColorRed = text.includes('color: red') || text.includes('color:red');
    const hadColorRed = prevText.includes('color: red') || prevText.includes('color:red');
    if (hasColorRed && !hadColorRed) {
      showToast("We don't judge your color choices here.", 3000);
    }

    // rotate(180deg) — only when newly added
    if (text.includes('rotate(180deg)') && !prevText.includes('rotate(180deg)')) {
      editor.style.transition = 'transform 0.5s ease';
      editor.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        editor.style.transform = 'rotate(0deg)';
      }, 1500);
    }

    // Empty-for-10s debounce
    clearTimeout(emptyTimer);
    if (text.trim().length === 0) {
      emptyTimer = setTimeout(() => {
        showToast('Writer\'s block? Try a preset →', 4000);
      }, 10000);
    }

    prevText = text;
  });

  // ─── Tab key toast (insertion handled by playground.js) ──────────────

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !tabToastShown) {
      tabToastShown = true;
      // Delay slightly so the toast appears after the spaces are inserted
      setTimeout(() => showToast('We chose spaces. Fight us.', 3000), 50);
    }
  });
}

/* ─── Editor stats + syntax warnings (Layer 1 / Task 26) ─── */
(function editorStats() {
  try {
    const editor = document.querySelector('.editor, #editor, [contenteditable]');
    const lines = document.getElementById('line-count');
    const chars = document.getElementById('char-count');
    const status = document.getElementById('syntax-status');
    if (!editor || !lines || !chars || !status) return;
    const update = () => {
      const text = editor.textContent || '';
      lines.textContent = `Lines: ${text.split('\n').length}`;
      chars.textContent = `Chars: ${text.length}`;
      const open = (text.match(/\{/g) || []).length;
      const close = (text.match(/\}/g) || []).length;
      const missingSemi = /[^;{}\s]\s*\n\s*[a-z-]+\s*:/i.test(text);
      if (open !== close) { status.textContent = `⚠ Unbalanced braces (${open}/${close})`; status.style.color = '#fbbf24'; }
      else if (missingSemi) { status.textContent = '⚠ Likely missing semicolon'; status.style.color = '#fbbf24'; }
      else { status.textContent = '✓ OK'; status.style.color = ''; }
    };
    editor.addEventListener('input', update);
    update();
  } catch {}
})();

/* ─── CSS property auto-suggest (Layer 1 / Task 26) ─── */
(function autoSuggest() {
  try {
    const editor = document.querySelector('.editor, #editor, [contenteditable]');
    if (!editor) return;
    const PROPS = ['align-items','background','border','border-radius','box-shadow','color','display','flex','font-family','font-size','gap','grid','height','justify-content','margin','padding','position','transform','transition','width','z-index','animation','animation-timeline','clip-path','backdrop-filter','aspect-ratio','container-type','container-name','inset','opacity','filter','overflow','cursor','outline','letter-spacing','line-height','text-align','text-transform'];
    const box = document.createElement('div');
    box.className = 'autosuggest-box';
    box.style.cssText = 'position:absolute;background:oklch(0.2 0.02 280);color:white;border-radius:6px;padding:4px;z-index:9999;font-family:monospace;font-size:12px;max-height:180px;overflow:auto;display:none;border:1px solid oklch(1 0 0 / 0.15);min-width:160px;';
    document.body.appendChild(box);
    editor.addEventListener('input', () => {
      const sel = getSelection();
      if (!sel?.rangeCount) return;
      const range = sel.getRangeAt(0);
      const text = editor.textContent;
      const before = text.slice(0, range.startOffset);
      const m = before.match(/([a-z-]{2,})$/);
      if (!m) { box.style.display = 'none'; return; }
      const needle = m[1];
      const matches = PROPS.filter(p => p.startsWith(needle)).slice(0, 8);
      if (!matches.length) { box.style.display = 'none'; return; }
      box.innerHTML = matches.map(p => `<div data-p="${p}" data-needle="${needle}" style="padding:2px 6px;cursor:pointer">${p}</div>`).join('');
      const rect = range.getBoundingClientRect();
      box.style.left = rect.left + 'px';
      box.style.top = (rect.bottom + window.scrollY + 4) + 'px';
      box.style.display = 'block';
    });
    box.addEventListener('mousedown', (e) => {
      const hit = e.target.closest('[data-p]');
      if (!hit) return;
      e.preventDefault();
      const toInsert = hit.dataset.p.slice(hit.dataset.needle.length) + ': ';
      try { document.execCommand('insertText', false, toInsert); } catch {}
      box.style.display = 'none';
    });
    document.addEventListener('click', (e) => { if (!box.contains(e.target) && e.target !== editor) box.style.display = 'none'; });
  } catch {}
})();

/* ─── Reset preset (Layer 1 / Task 26) ─── */
(function resetPreset() {
  try {
    const btn = document.getElementById('reset-preset');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const active = document.querySelector('.preset.active, [data-preset].active, button.preset[aria-pressed="true"]');
      if (active) active.click(); else btn.blur();
    });
  } catch {}
})();
