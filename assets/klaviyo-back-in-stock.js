/**
 * Dawn glue for Klaviyo Back in Stock.
 * Only reveal the notify slot once Klaviyo has finished init (modal exists).
 * Never show a pre-rendered trigger — that causes showModal errors on early click.
 */
(function () {
  const RETRY_DELAYS_MS = [0, 500, 1000, 2000, 3000];

  function getContainer() {
    return document.querySelector('.product-form__notify-me');
  }

  function isSoldOut() {
    const btn = document.querySelector('product-info .product-form__submit');
    if (!btn) return false;
    if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return true;
    const text = btn.querySelector('.product-form__submit-text')?.textContent?.trim().toLowerCase() || '';
    return text.includes('sold out') || text.includes('unavailable');
  }

  function isKlaviyoReady() {
    return (
      !!document.querySelector('#klaviyo-bis-iframe') &&
      !!getContainer()?.querySelector('.klaviyo-bis-trigger')
    );
  }

  function syncVariant() {
    const field = document.querySelector('form[data-type="add-to-cart-form"] [name="id"]');
    const selected = document.querySelector('product-info [data-selected-variant]');
    if (!field || !selected) return;
    try {
      const variant = JSON.parse(selected.textContent);
      if (variant?.id) {
        field.value = String(variant.id);
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (error) {
      /* ignore */
    }
  }

  function update() {
    const container = getContainer();
    if (!container || container.dataset.disableNotify === 'true') return;

    if (isSoldOut() && isKlaviyoReady()) {
      container.classList.add('is-visible');
    } else {
      container.classList.remove('is-visible');
    }
  }

  function schedule() {
    RETRY_DELAYS_MS.forEach((delay) => {
      setTimeout(() => {
        syncVariant();
        update();
      }, delay);
    });
  }

  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', schedule);

  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.variantChange, schedule);
  }
})();
