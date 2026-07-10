/**
 * Remember the last browsed storefront URL and use it for "Continue shopping" links.
 * Cart/checkout pages are never recorded — they must not overwrite the saved shopping URL.
 */
(function () {
  const STORAGE_KEY = 'tvc:lastShoppingUrl';
  const EXCLUDED_PATH = /^\/(cart|checkout|account|challenge|password|apps|admin|policies)(\/|$|\?)/;

  function isExcludedPage(pathname) {
    return EXCLUDED_PATH.test(pathname || window.location.pathname);
  }

  function isBrowsablePath(path) {
    return Boolean(path) && !EXCLUDED_PATH.test(path);
  }

  function getContinueShoppingUrl() {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && isBrowsablePath(stored)) return stored;
    return window.Shopify?.routes?.root || '/';
  }

  function recordLastShoppingUrl() {
    if (isExcludedPage()) return;

    const path = window.location.pathname + window.location.search;
    if (isBrowsablePath(path)) {
      sessionStorage.setItem(STORAGE_KEY, path);
    }
  }

  function hydrateFromReferrer() {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const ref = document.referrer;
    if (!ref) return;

    try {
      const refUrl = new URL(ref);
      if (refUrl.origin !== window.location.origin) return;
      const path = refUrl.pathname + refUrl.search;
      if (isBrowsablePath(path)) {
        sessionStorage.setItem(STORAGE_KEY, path);
      }
    } catch (error) {
      // Ignore malformed referrer values.
    }
  }

  function applyContinueShoppingLinks(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-continue-shopping]').forEach((el) => {
      el.setAttribute('href', getContinueShoppingUrl());
    });
  }

  window.applyContinueShoppingLinks = applyContinueShoppingLinks;

  function init() {
    if (isExcludedPage()) {
      hydrateFromReferrer();
    } else {
      recordLastShoppingUrl();
    }

    applyContinueShoppingLinks();

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.cartUpdate, () => {
        window.setTimeout(() => applyContinueShoppingLinks(), 0);
      });
    }

    document.addEventListener('shopify:section:load', (event) => {
      applyContinueShoppingLinks(event.target);
    });
  }

  window.addEventListener('pageshow', () => {
    if (!isExcludedPage()) {
      recordLastShoppingUrl();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
