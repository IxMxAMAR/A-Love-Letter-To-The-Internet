/* =============================================================
   transitions.js — View Transitions API wrapper (ES module)
   A Love Letter to the Web
   ============================================================= */

/**
 * Check if the browser supports the View Transitions API.
 * @returns {boolean}
 */
export function supportsViewTransitions() {
  return 'startViewTransition' in document;
}

/**
 * Navigate to a URL, optionally with a named view transition.
 * Falls back to a standard navigation if the API is unavailable.
 *
 * @param {string} url            — destination URL
 * @param {string} [transitionName] — optional named transition (sets
 *   `view-transition-name` on :root before the transition fires)
 */
export function navigateWithTransition(url, transitionName) {
  if (!supportsViewTransitions()) {
    window.location.href = url;
    return;
  }

  document.startViewTransition(() => {
    if (transitionName) {
      document.documentElement.style.setProperty(
        'view-transition-name',
        transitionName
      );
    }
    window.location.href = url;
  });
}

/**
 * Attach transition-aware click handlers to all
 * `a[data-transition]` anchors. The `data-transition` attribute
 * value is used as the named transition.
 */
export function initTransitionLinks() {
  const links = document.querySelectorAll('a[data-transition]');

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      const transitionName = link.dataset.transition;

      if (!href || href.startsWith('#')) return;

      event.preventDefault();
      navigateWithTransition(href, transitionName);
    });
  });
}

/* ── Auto-initialize ────────────────────────────────────────── */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTransitionLinks);
  } else {
    initTransitionLinks();
  }
}
