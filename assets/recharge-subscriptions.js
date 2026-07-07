/**
 * ReCharge subscriptions — legacy widget helpers for Dawn product-form AJAX cart.
 * Ported from legacy ajax-cart.js + theme.product-detail.js.
 */
(function () {
  function isSubscriptionSelected(form) {
    if (!form) return false;

    const widget = form.querySelector('.rc-widget-injection-parent');
    if (widget) {
      const selected = widget.querySelector('.rc-radio.rc-option--active, .rc_widget__option__selector:checked');
      if (selected) {
        const radio = selected.closest('.rc-radio');
        if (radio) {
          const isOneTime =
            radio.classList.contains('rc-option--onetime') ||
            radio.querySelector('[data-subscription-id=""]') != null ||
            radio.querySelector('.rc_widget__option__plans') == null;
          if (!isOneTime) return true;
        }
      }
    }

    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      if (!value) continue;
      if (key === 'selling_plan') return true;
      if (key.includes('subscription_id')) return true;
      if (key.includes('shipping_interval')) return true;
      if (key.includes('_rc_subscription')) return true;
    }

    return false;
  }

  function shouldUseNativeSubmit(form) {
    return isSubscriptionSelected(form);
  }

  function getDisableVariantId(root) {
    const mount = root?.querySelector?.('.rc-widget-injection-parent');
    const value = mount?.dataset?.disableSubscriptionVariant;
    return value != null && String(value).trim() !== '' ? String(value).trim() : null;
  }

  function getCurrentVariantId(root) {
    const input = root?.querySelector?.('[name="id"]');
    if (input?.value) return String(input.value);
    const urlVariant = new URLSearchParams(window.location.search).get('variant');
    return urlVariant ? String(urlVariant) : null;
  }

  function applySubscriptionVisibility(root) {
    if (!root) return;

    const disableVariantId = getDisableVariantId(root);
    if (!disableVariantId) return;

    const currentVariantId = getCurrentVariantId(root);
    const widgets = root.querySelectorAll('.rc-widget-injection-parent, .rc-container-wrapper');

    if (currentVariantId === disableVariantId) {
      widgets.forEach((el) => {
        el.style.display = 'none';
      });
      const onetime = root.querySelector('.rc_widget__option__selector input[value="onetime"]');
      onetime?.click();
    } else {
      widgets.forEach((el) => {
        el.style.removeProperty('display');
      });
    }
  }

  function initProductForm(formRoot) {
    if (!formRoot) return;
    applySubscriptionVisibility(formRoot);

    const variantInput = formRoot.querySelector('[name="id"]');
    variantInput?.addEventListener('change', () => {
      window.setTimeout(() => applySubscriptionVisibility(formRoot), 200);
    });
  }

  function onVariantChange(event) {
    const sectionId = event?.data?.sectionId;
    if (!sectionId) return;

    const productInfo = document.querySelector(`product-info[data-section="${sectionId}"]`);
    const form = productInfo?.querySelector('product-form form');
    if (form) {
      window.setTimeout(() => applySubscriptionVisibility(form), 200);
    }
  }

  window.TVCRecharge = {
    isSubscriptionSelected,
    shouldUseNativeSubmit,
    applySubscriptionVisibility,
  };

  function init() {
    document.querySelectorAll('product-form form.add-to-cart-form').forEach((form) => {
      initProductForm(form);
    });

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.variantChange, onVariantChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
