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
