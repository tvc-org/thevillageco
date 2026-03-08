/**
 * Opens the search modal when header-top search input or button is clicked/focused.
 */
(function () {
  function init() {
    const ourInput = document.querySelector('[data-header-top-search-input]');
    const ourButton = document.querySelector('[data-header-top-search-trigger]');
    const modal = document.querySelector('[data-desktop-search-modal] details-modal');
    if (!ourInput || !modal) return;

    function openModal() {
      if (modal.isOpen()) return;
      const details = modal.querySelector('details');
      if (!details) return;
      modal.open({ target: details });
      const modalInput = modal.querySelector('input[type="search"]');
      if (modalInput) {
        modalInput.value = ourInput.value;
        modalInput.dispatchEvent(new Event('input', { bubbles: true }));
        modalInput.focus();
      }
    }

    let mousedownOnTrigger = false;

    function onMousedown(e) {
      mousedownOnTrigger = true;
      e.preventDefault();
      openModal();
    }

    ourInput.addEventListener('mousedown', onMousedown);
    ourInput.addEventListener('focus', openModal);

    if (ourButton) {
      ourButton.addEventListener('mousedown', onMousedown);
    }

    document.body.addEventListener('click', function (e) {
      if (mousedownOnTrigger) {
        e.stopPropagation();
        mousedownOnTrigger = false;
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
