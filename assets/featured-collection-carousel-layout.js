/**
 * Featured Collection — desktop carousel: vertical center of prev/next controls
 * on the first slide’s .card__media (image area), not the full card.
 * Sets --fc-carousel-arrow-center (px) on <slider-component>; see custom.css (≥990px).
 */
(function () {
  const LAYOUT_FLAG = 'data-fc-carousel-layout-observed';

  function updateCenters() {
    document.querySelectorAll('.slider-buttons.featured-collection--desktop-carousel').forEach((btnWrap) => {
      const slider = btnWrap.closest('slider-component');
      const ul = btnWrap.previousElementSibling;
      if (!slider || !ul || !ul.classList.contains('slider--desktop')) return;

      if (!window.matchMedia('(min-width: 990px)').matches) {
        slider.style.removeProperty('--fc-carousel-arrow-center');
        return;
      }

      const media = ul.querySelector('.slider__slide:first-child .card__media');
      if (!media) {
        slider.style.removeProperty('--fc-carousel-arrow-center');
        return;
      }

      const sr = slider.getBoundingClientRect();
      const mr = media.getBoundingClientRect();
      const centerY = mr.top + mr.height / 2 - sr.top;
      slider.style.setProperty('--fc-carousel-arrow-center', `${Math.round(centerY * 10) / 10}px`);
    });
  }

  let ticking = false;
  function scheduleUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateCenters();
    });
  }

  function observeSlider(btnWrap) {
    const slider = btnWrap.closest('slider-component');
    const ul = btnWrap.previousElementSibling;
    if (!slider || !ul || slider.hasAttribute(LAYOUT_FLAG)) return;
    slider.setAttribute(LAYOUT_FLAG, '');

    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(slider);
    const media = ul.querySelector('.slider__slide:first-child .card__media');
    if (media) ro.observe(media);

    btnWrap.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', scheduleUpdate, { once: true });
    });
  }

  function init() {
    document.querySelectorAll('.slider-buttons.featured-collection--desktop-carousel').forEach(observeSlider);
    scheduleUpdate();
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('shopify:section:load', init);
  window.addEventListener('resize', scheduleUpdate);

  if (document.readyState !== 'loading') init();
})();
