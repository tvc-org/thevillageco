/**
 * Homepage jump nav: smooth scroll to TVC section anchors (/#our-story, etc.).
 */
(function () {
  if (!document.body.classList.contains('template-index')) return;

  const initialHashId = window.location.hash.replace(/^#/, '');
  const initialHashTarget = initialHashId ? document.getElementById(initialHashId) : null;

  if (initialHashTarget) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrollBehavior() {
    return reducedMotion.matches ? 'auto' : 'smooth';
  }

  function isScrollingUp(target) {
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    return targetTop < window.scrollY - 1;
  }

  /** Overlap at viewport top: 0 when scrolling down (header hides); live header bottom when scrolling up. */
  function getHeaderOverlap() {
    const headerSection = document.querySelector('.section-header');
    if (!headerSection) return 0;

    if (!headerSection.classList.contains('shopify-section-header-hidden')) {
      return Math.max(0, headerSection.getBoundingClientRect().bottom);
    }

    const headerBottom = document.querySelector('.header-bottom');
    if (headerBottom && window.matchMedia('(min-width: 1025px)').matches) {
      return headerBottom.offsetHeight;
    }

    const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    const headerHeight = parseFloat(raw);
    return Number.isFinite(headerHeight) && headerHeight > 0 ? headerHeight : 0;
  }

  function getScrollOffset(target) {
    return isScrollingUp(target) ? getHeaderOverlap() : 0;
  }

  function alignScrollUpTarget(target) {
    if (!isScrollingUp(target)) return;

    const headerSection = document.querySelector('.section-header');
    if (!headerSection || headerSection.classList.contains('shopify-section-header-hidden')) return;

    const overlap = headerSection.getBoundingClientRect().bottom;
    const gap = target.getBoundingClientRect().top - overlap;
    if (Math.abs(gap) < 2) return;

    window.scrollBy({ top: gap, behavior: 'auto' });
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

    const scrollingUp = isScrollingUp(target);
    const offset = getScrollOffset(target);
    target.style.removeProperty('scroll-margin-top');

    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    const behaviorValue = behavior || scrollBehavior();
    window.scrollTo({ top: Math.max(0, top), behavior: behaviorValue });

    if (scrollingUp && behaviorValue === 'smooth') {
      const finalize = () => alignScrollUpTarget(target);
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', finalize, { once: true });
      } else {
        window.setTimeout(finalize, 450);
      }
    } else if (scrollingUp) {
      requestAnimationFrame(() => alignScrollUpTarget(target));
    }

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
    if (!id || !document.getElementById(id)) return;

    requestAnimationFrame(() => {
      jumpTo(id, { updateHistory: false });
    });
  }

  if (document.readyState === 'complete') {
    scrollToInitialHash();
  } else {
    window.addEventListener('load', scrollToInitialHash, { once: true });
  }

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.replace(/^#/, '');
    if (id) jumpTo(id, { updateHistory: false });
  });
})();
