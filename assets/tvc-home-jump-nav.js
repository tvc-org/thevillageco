/**
 * Homepage jump nav: smooth scroll to TVC section anchors (/#our-story, etc.).
 */
(function () {
  if (!document.body.classList.contains('template-index')) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrollBehavior() {
    return reducedMotion.matches ? 'auto' : 'smooth';
  }

  const SCROLL_PADDING_UP = 16;

  function getHeaderHeight() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    const headerHeight = parseFloat(raw);
    return Number.isFinite(headerHeight) && headerHeight > 0 ? headerHeight : 120;
  }

  function isScrollingUp(target) {
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    return targetTop < window.scrollY - 1;
  }

  /** Header hides on scroll down; it stays visible and overlaps when scrolling up. */
  function getScrollOffset(target) {
    return isScrollingUp(target) ? getHeaderHeight() + SCROLL_PADDING_UP : 0;
  }

  function parseTargetId(href) {
    if (!href) return null;
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return null;
      if (url.pathname !== window.location.pathname) return null;
      const id = url.hash.replace(/^#/, '');
      return id || null;
    } catch {
      return null;
    }
  }

  function scrollToId(id, behavior) {
    const target = document.getElementById(id);
    if (!target) return false;

    const offset = getScrollOffset(target);
    if (offset > 0) {
      target.style.scrollMarginTop = `${offset}px`;
    } else {
      target.style.removeProperty('scroll-margin-top');
    }

    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: behavior || scrollBehavior() });
    return true;
  }

  function updateHash(id) {
    const next = `#${id}`;
    if (window.location.hash === next) return;
    history.pushState(null, '', `${window.location.pathname}${window.location.search}${next}`);
  }

  function closeHeaderDrawer() {
    const openDetails = document.querySelector('header-drawer details[open]');
    if (!openDetails) return;
    const summary = openDetails.querySelector(':scope > summary');
    if (summary) summary.click();
  }

  function jumpTo(id, options = {}) {
    const { updateHistory = true, behavior } = options;
    if (!scrollToId(id, behavior)) return false;
    if (updateHistory) updateHash(id);
    return true;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || event.defaultPrevented) return;

    const id = parseTargetId(link.getAttribute('href'));
    if (!id) return;

    if (!jumpTo(id)) return;

    event.preventDefault();
    closeHeaderDrawer();
  });

  function scrollToInitialHash() {
    const id = window.location.hash.replace(/^#/, '');
    if (!id) return;

    requestAnimationFrame(() => {
      jumpTo(id, { updateHistory: false, behavior: 'auto' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToInitialHash);
  } else {
    scrollToInitialHash();
  }

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.replace(/^#/, '');
    if (id) jumpTo(id, { updateHistory: false });
  });
})();
