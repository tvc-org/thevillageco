/**
 * Remember the last browsed storefront URL and use it for "Continue shopping" links.
 * Falls back to the store homepage when no prior page is known (e.g. direct cart visit).
 */
(function () {
  const STORAGE_KEY = 'tvc:lastShoppingUrl';
  const EXCLUDED_PATH = /^\/(cart|checkout|account|challenge|password|apps|admin|policies)(\/|$|\?)/;

  function getContinueShoppingUrl() {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && isBrowsablePath(stored)) return stored;
    return window.Shopify?.routes?.root || '/';
  }

  function isBrowsablePath(path) {
    return Boolean(path) && !EXCLUDED_PATH.test(path);
  }

  function recordLastShoppingUrl() {
    const path = window.location.pathname + window.location.search;
    if (isBrowsablePath(path)) {
      sessionStorage.setItem(STORAGE_KEY, path);
    }
  }

  function applyContinueShoppingLinks(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-continue-shopping]').forEach((el) => {
      el.setAttribute('href', getContinueShoppingUrl());
    });
  }

  function init() {
    recordLastShoppingUrl();
    applyContinueShoppingLinks();

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.cartUpdate, () => {
        requestAnimationFrame(() => applyContinueShoppingLinks());
      });
    }

    document.addEventListener('shopify:section:load', (event) => {
      applyContinueShoppingLinks(event.target);
    });
  }

  window.addEventListener('pageshow', recordLastShoppingUrl);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
