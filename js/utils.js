/* =============================================================
   utils.js — Shared utility functions (ES module)
   A Love Letter to the Web
   ============================================================= */

/**
 * Copy text to the system clipboard.
 * @param {string} text — text to copy
 * @returns {Promise<boolean>} true on success, false on failure
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Attach click handlers to all [data-copy-target] elements.
 * On click, copies the textContent of the target element and
 * temporarily changes button text to "Copied!" for 2 seconds.
 */
export function initCopyButtons() {
  // Handle buttons with explicit data-copy-target
  const targetButtons = document.querySelectorAll('[data-copy-target]');

  targetButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const targetSelector = button.dataset.copyTarget;
      const target = document.querySelector(targetSelector);

      if (!target) return;

      const originalText = button.textContent;
      const success = await copyToClipboard(target.textContent);

      if (success) {
        button.textContent = 'Copied!';
        button.setAttribute('aria-label', 'Copied to clipboard');

        setTimeout(() => {
          button.textContent = originalText;
          button.removeAttribute('aria-label');
        }, 2000);
      }
    });
  });

  // Handle .copy-btn buttons without data-copy-target (e.g. component cards)
  // Falls back to copying the sibling <pre> or nearest <pre> in the same parent
  const fallbackButtons = document.querySelectorAll('.copy-btn:not([data-copy-target])');

  fallbackButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const parent = button.parentElement;
      const pre = parent && parent.querySelector('pre');

      if (!pre) return;

      const originalText = button.textContent;
      const success = await copyToClipboard(pre.textContent);

      if (success) {
        button.textContent = 'Copied!';
        button.setAttribute('aria-label', 'Copied to clipboard');

        setTimeout(() => {
          button.textContent = originalText;
          button.removeAttribute('aria-label');
        }, 2000);
      }
    });
  });
}

/**
 * Observe `.js-reveal` elements and add `.revealed` when they
 * enter the viewport (IntersectionObserver-based fallback for
 * scroll-driven animation).
 */
export function initScrollReveal() {
  const elements = document.querySelectorAll('.js-reveal');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * Wrapper around element.style.setProperty for clarity.
 * @param {HTMLElement} element
 * @param {string}      property — CSS custom property name (e.g. '--my-var')
 * @param {string}      value
 */
export function setCSSProperty(element, property, value) {
  element.style.setProperty(property, value);
}
