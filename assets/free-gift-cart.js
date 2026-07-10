/**
 * Auto free-gift cart logic (custom promo — not handled by EasyGift).
 * Ported from legacy theme.liquid active script.
 *
 * Promo 1: qualifying Baby Bubble variants → free gift variant; gift qty matches qualifying qty.
 */
(function () {
  const IS_DEV = window.location.hostname.includes('-dev');

  const QUALIFYING_PRODUCT_VARIANT_IDS = IS_DEV
    ? [40962782003383, 40962782101687]
    : [41325366018246, 41325364969670];

  const FREE_PRODUCT_VARIANT_ID = IS_DEV ? 51854667088239 : 44486777274566;

  let isProcessing = false;
  let isInternalUpdate = false;
  let cartCheckTimer = null;

  function isCartPage() {
    return window.location.pathname === '/cart';
  }

  function setCartCheckoutEnabled(enabled) {
    document.querySelectorAll('#checkout, .cart__checkout-button, button[name="checkout"]').forEach((el) => {
      el.disabled = !enabled;
      el.classList.toggle('disabled', !enabled);
    });
  }

  async function getCart() {
    const response = await fetch('/cart.js');
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  }

  async function postCartAdd(variantId, quantity) {
    isInternalUpdate = true;
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: variantId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add free gift');
      return response.json();
    } finally {
      window.setTimeout(() => {
        isInternalUpdate = false;
      }, 300);
    }
  }

  async function postCartChange(line, quantity) {
    isInternalUpdate = true;
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity }),
      });
      if (!response.ok) throw new Error('Failed to update cart line');
      return response.json();
    } finally {
      window.setTimeout(() => {
        isInternalUpdate = false;
      }, 300);
    }
  }

  function getQualifyingQuantity(cart) {
    return cart.items.reduce((total, item) => {
      return QUALIFYING_PRODUCT_VARIANT_IDS.includes(item.variant_id) ? total + item.quantity : total;
    }, 0);
  }

  function getFreeGiftLine(cart) {
    const index = cart.items.findIndex((item) => item.variant_id === FREE_PRODUCT_VARIANT_ID);
    if (index === -1) return null;
    return { index, line: index + 1, item: cart.items[index] };
  }

  async function refreshCartIcon() {
    const target = document.getElementById('cart-icon-bubble');
    if (!target || !window.routes?.cart_url) return;

    try {
      const response = await fetch(`${window.routes.cart_url}?section_id=cart-icon-bubble`);
      if (!response.ok) return;
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const source = doc.getElementById('shopify-section-cart-icon-bubble') || doc.querySelector('.shopify-section');
      if (source) target.innerHTML = source.innerHTML;
    } catch (error) {
      console.error('[free-gift-cart] cart icon refresh failed', error);
    }
  }

  async function refreshCartPage() {
    const cartItems = document.querySelector('cart-items');
    if (!cartItems || !window.routes?.cart_url) return;

    try {
      const mainCartItems = document.getElementById('main-cart-items');
      const sectionId = mainCartItems?.dataset?.id;
      if (!sectionId) {
        window.location.reload();
        return;
      }

      const response = await fetch(`${window.routes.cart_url}?section_id=${sectionId}`);
      if (!response.ok) throw new Error('section fetch failed');
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const sourceCartItems = doc.querySelector('cart-items');
      if (!sourceCartItems) return;

      // Sync cart state without replacing continue-shopping links outside .js-contents.
      cartItems.className = sourceCartItems.className;

      const sourceContents = sourceCartItems.querySelector('.js-contents');
      const targetContents = cartItems.querySelector('.js-contents');
      if (sourceContents && targetContents) {
        targetContents.innerHTML = sourceContents.innerHTML;
      }

      if (typeof window.applyContinueShoppingLinks === 'function') {
        window.applyContinueShoppingLinks(cartItems);
      }
    } catch (error) {
      console.error('[free-gift-cart] cart page refresh failed, reloading', error);
      window.location.reload();
    }
  }

  async function refreshCartUI(options = {}) {
    await refreshCartIcon();
    if (options.reloadCartPage && isCartPage()) {
      await refreshCartPage();
    }

    if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      publish(PUB_SUB_EVENTS.cartUpdate, { source: 'free-gift-cart' });
    }
  }

  async function checkCartAndAddFreeProduct(cart) {
    const qualifyingQty = getQualifyingQuantity(cart);
    const freeGiftLine = getFreeGiftLine(cart);

    if (qualifyingQty > 0 && !freeGiftLine) {
      await postCartAdd(FREE_PRODUCT_VARIANT_ID, 1);
      return getCart();
    }

    return cart;
  }

  async function checkQualifyingProductQuantities(cart) {
    const qualifyingQty = getQualifyingQuantity(cart);
    const freeGiftLine = getFreeGiftLine(cart);

    if (!freeGiftLine) return cart;

    if (qualifyingQty === 0) {
      setCartCheckoutEnabled(false);
      try {
        const updatedCart = await postCartChange(freeGiftLine.line, 0);
        setCartCheckoutEnabled(true);
        return updatedCart;
      } catch (error) {
        console.error('[free-gift-cart] failed to remove free gift', error);
        setCartCheckoutEnabled(true);
        throw error;
      }
    }

    if (qualifyingQty > 0 && freeGiftLine.item.quantity !== qualifyingQty) {
      try {
        return await postCartChange(freeGiftLine.line, qualifyingQty);
      } catch (error) {
        console.error('[free-gift-cart] failed to sync free gift quantity', error);
        throw error;
      }
    }

    return cart;
  }

  async function maintainFreeGift() {
    if (isProcessing || isInternalUpdate) return;

    isProcessing = true;

    try {
      let cart = await getCart();
      const beforeSnapshot = JSON.stringify(cart.items);

      cart = await checkCartAndAddFreeProduct(cart);
      cart = await checkQualifyingProductQuantities(cart);

      const cartChanged = JSON.stringify(cart.items) !== beforeSnapshot;
      if (cartChanged) {
        await refreshCartUI({ reloadCartPage: isCartPage() });
      }
    } catch (error) {
      console.error('[free-gift-cart] maintenance failed', error);
    } finally {
      window.setTimeout(() => {
        isProcessing = false;
      }, 1000);
    }
  }

  function scheduleCartCheck(delay) {
    if (cartCheckTimer) window.clearTimeout(cartCheckTimer);
    cartCheckTimer = window.setTimeout(() => {
      maintainFreeGift();
    }, delay);
  }

  function patchFetch() {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = function patchedFetch(input, init) {
      const response = nativeFetch(input, init);
      const url = typeof input === 'string' ? input : input?.url;

      if (!isInternalUpdate && url && /\/cart\/(add|change|update|clear)\.js/.test(url)) {
        response.then(() => scheduleCartCheck(400));
      }

      return response;
    };
  }

  function init() {
    patchFetch();

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
        if (event?.source === 'free-gift-cart') return;
        scheduleCartCheck(400);
      });
    }

    window.addEventListener('load', () => scheduleCartCheck(250));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
