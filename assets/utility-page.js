/**
 * Utility pages: mobile nav toggle + FAQ/legal accordions.
 */
(function () {
  const page = document.querySelector('.utility-page');
  if (!page) return;

  const links = page.querySelector('[data-utility-nav]');
  const toggle = page.querySelector('[data-utility-nav-toggle]');

  if (links && toggle) {
    toggle.addEventListener('click', () => {
      const opened = links.classList.toggle('opened');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  page.querySelectorAll('.tab-accordion-system .system-title').forEach((title) => {
    title.addEventListener('click', () => {
      const system = title.closest('.system');
      const container = title.closest('.tab-accordion-system');
      if (!system || !container) return;

      const isTabContainer = container.classList.contains('tab-container');

      if (isTabContainer) {
        container.querySelectorAll('.system').forEach((item) => item.classList.remove('active'));
        system.classList.add('active');
        return;
      }

      const isActive = system.classList.toggle('active');
      title.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  });
})();
