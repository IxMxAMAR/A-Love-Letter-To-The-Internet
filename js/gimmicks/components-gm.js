// components-gm.js — Gimmicks for the Components page

// 0. Popover aria-expanded sync
try {
  const popoverMenu = document.getElementById('popover-menu-demo');
  if (popoverMenu) {
    const trigger = document.querySelector('[popovertarget="popover-menu-demo"]');
    if (trigger) {
      popoverMenu.addEventListener('toggle', (e) => {
        trigger.setAttribute('aria-expanded', e.newState === 'open' ? 'true' : 'false');
      });
    }
  }
} catch (e) {
  console.warn('[components-gm] popover aria-expanded:', e);
}

// 1. Wire Dark Mode Toggle
try {
  const labels = document.querySelectorAll('label');
  let darkToggle = null;
  for (const label of labels) {
    if (label.textContent.includes('Dark mode')) {
      darkToggle = label.querySelector('input[type="checkbox"]');
      break;
    }
  }

  if (darkToggle) {
    // Set initial state from current data-theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    darkToggle.checked = currentTheme === 'dark';

    darkToggle.addEventListener('change', () => {
      const theme = darkToggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }
} catch (e) {
  console.warn('[components-gm] dark mode toggle:', e);
}

// 2. Toast Message Rotation
try {
  const toastMessages = [
    'This toast is native HTML. No library.',
    'Your bundle size: 0kb',
    'No npm install required',
    'Framework authors hate this one trick',
    'Built with popover. Closes itself. Life is good.',
  ];

  let toastIndex = 0;

  // Find the toast trigger button (has popovertarget containing "toast")
  let toastTrigger = null;
  const popovertargetBtns = document.querySelectorAll('[popovertarget]');
  for (const btn of popovertargetBtns) {
    if (btn.getAttribute('popovertarget').toLowerCase().includes('toast')) {
      toastTrigger = btn;
      break;
    }
  }

  // Find the toast element and its text node
  const toastEl = document.getElementById('toast-demo');
  const toastBody = toastEl ? toastEl.querySelector('.toast-body') : null;
  const toastSpan = toastBody ? toastBody.querySelector('span') : null;
  const toastStrong = toastBody ? toastBody.querySelector('strong') : null;

  if (toastTrigger && toastSpan) {
    toastTrigger.addEventListener('click', () => {
      const msg = toastMessages[toastIndex % toastMessages.length];
      toastIndex++;
      toastSpan.textContent = msg;
      if (toastStrong) toastStrong.textContent = '✦ Toast';
    });
  }
} catch (e) {
  console.warn('[components-gm] toast rotation:', e);
}

// 3. Tab group aria-selected sync
try {
  function syncTabSelection(tabGroup) {
    const radios = tabGroup.querySelectorAll('input[type="radio"]');
    const labels = tabGroup.querySelectorAll('[role="tab"]');
    const panels = tabGroup.querySelectorAll('[role="tabpanel"]');

    function update() {
      labels.forEach(label => {
        const forId = label.getAttribute('for');
        const radio = forId ? document.getElementById(forId) : null;
        const isSelected = radio ? radio.checked : false;
        label.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });
    }

    radios.forEach(radio => radio.addEventListener('change', update));
    update();
  }

  document.querySelectorAll('.tab-group, .tab-bar-demo').forEach(syncTabSelection);
} catch (e) {
  console.warn('[components-gm] tab aria-selected:', e);
}

// 4. Modal Dialog Escape Message
try {
  const escMsg = document.createElement('div');
  escMsg.style.cssText = [
    'position:fixed',
    'top:50%',
    'left:50%',
    'transform:translate(-50%,-50%)',
    'background:oklch(20% 0.02 270 / 0.92)',
    'color:#fff',
    'padding:1rem 1.5rem',
    'border-radius:0.75rem',
    'font-size:0.9rem',
    'pointer-events:none',
    'z-index:9999',
    'transition:opacity 0.4s ease',
    'opacity:0',
    'text-align:center',
    'max-width:22rem',
    'backdrop-filter:blur(8px)',
  ].join(';');
  escMsg.setAttribute('aria-live', 'polite');
  document.body.appendChild(escMsg);

  let escFadeTimer = null;

  const showEscMsg = (text) => {
    escMsg.textContent = text;
    escMsg.style.opacity = '1';
    if (escFadeTimer) clearTimeout(escFadeTimer);
    escFadeTimer = setTimeout(() => {
      escMsg.style.opacity = '0';
    }, 2500);
  };

  const dialogs = document.querySelectorAll('dialog');
  for (const dialog of dialogs) {
    dialog.addEventListener('close', () => {
      if (!dialog.returnValue) {
        showEscMsg("Esc works because closedby='any'. You're welcome.");
      }
    });
  }
} catch (e) {
  console.warn('[components-gm] escape message:', e);
}
