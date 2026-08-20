/**
 * Where To Buy — IRI product locator (ported from qa-theme view-whereToBuy.js).
 */
(function () {
  const page = document.querySelector('.where-to-buy-page');
  if (!page) return;

  const form = page.querySelector('#wtb-selectors');
  const productSelect = page.querySelector('.product-selector');
  const results = page.querySelector('.results');
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !productSelect || !results || !submitButton) return;

  const messages = {
    noStores: page.dataset.noStores || 'No stores found',
    noProducts: page.dataset.noProducts || 'No products found',
    chooseProduct: page.dataset.chooseProduct || 'Choose a Product',
  };

  const storeLocatorUrl = new URL(
    'https://productlocator.iriworldwide.com/productlocator/servlet/ProductLocatorEngine'
  );
  storeLocatorUrl.searchParams.set('clientid', '115');
  storeLocatorUrl.searchParams.set('outputtype', 'json');
  storeLocatorUrl.searchParams.set('searchradius', '50');
  storeLocatorUrl.searchParams.set('producttype', 'upc');

  const productUrl = new URL('https://productlocator.iriworldwide.com/productlocator/products');
  productUrl.searchParams.set('client_id', '115');
  productUrl.searchParams.set('output', 'json');

  function asArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function toTitleCase(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatDistance(value) {
    if (value == null || value === '') return '';
    const text = String(value).trim();
    if (/mile/i.test(text)) return text;
    return `${text} miles`;
  }

  function formatPhoneHref(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits ? `tel:${digits}` : '';
  }

  function mapsUrl(store) {
    const query = [store.ADDRESS, store.CITY, store.STATE, store.ZIP].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function updateFieldFilledState(field) {
    field.classList.toggle('is-filled', Boolean(field.value));
  }

  function updateSubmitState() {
    form.querySelectorAll('select, input').forEach(updateFieldFilledState);
    submitButton.disabled = !form.checkValidity();
  }

  function setProductOptions(products) {
    productSelect.innerHTML = '';

    if (!products.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = messages.noProducts;
      option.selected = true;
      option.disabled = true;
      productSelect.appendChild(option);
      productSelect.disabled = true;
      updateSubmitState();
      return;
    }

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = messages.chooseProduct;
    placeholder.selected = true;
    placeholder.disabled = true;
    productSelect.appendChild(placeholder);

    products.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.upc_code;
      option.textContent = product.upc_name;
      productSelect.appendChild(option);
    });

    productSelect.disabled = false;
    updateSubmitState();
  }

  function renderMessage(text) {
    results.innerHTML = '';
    results.classList.remove('results--grid');
    const message = document.createElement('p');
    message.className = 'results-message';
    message.textContent = text;
    results.appendChild(message);
  }

  function clearResults() {
    results.innerHTML = '';
    results.classList.remove('results--grid');
  }

  function createStoreCard(store) {
    const card = document.createElement('article');
    card.className = 'store-card';

    const title = document.createElement('h3');
    title.className = 'store-card__title';
    title.textContent = toTitleCase(store.NAME);
    card.appendChild(title);

    const details = document.createElement('div');
    details.className = 'store-card__details';

    const distance = document.createElement('p');
    distance.className = 'store-card__distance';
    distance.textContent = formatDistance(store.DISTANCE);
    details.appendChild(distance);

    if (store.ADDRESS) {
      const address = document.createElement('a');
      address.className = 'store-card__address';
      address.href = mapsUrl(store);
      address.target = '_blank';
      address.rel = 'noopener noreferrer';
      address.textContent = toTitleCase(store.ADDRESS);
      details.appendChild(address);
    }

    const locality = document.createElement('p');
    locality.className = 'store-card__locality';
    locality.textContent = [toTitleCase(store.CITY), store.STATE, store.ZIP].filter(Boolean).join(' ');
    details.appendChild(locality);

    if (store.PHONE) {
      const phone = document.createElement('a');
      phone.className = 'store-card__phone';
      phone.href = formatPhoneHref(store.PHONE);
      phone.textContent = store.PHONE;
      details.appendChild(phone);
    }

    card.appendChild(details);
    return card;
  }

  function renderStores(stores) {
    if (!stores.length) {
      renderMessage(messages.noStores);
      return;
    }

    results.innerHTML = '';
    results.classList.add('results--grid');
    stores.forEach((store) => {
      results.appendChild(createStoreCard(store));
    });
  }

  async function fetchJson(url) {
    const response = await fetch(url.href, { method: 'GET', credentials: 'omit' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  }

  async function handleBrandChange(brandId) {
    productSelect.disabled = true;
    updateSubmitState();

    if (!brandId) {
      setProductOptions([]);
      return;
    }

    const url = new URL(productUrl.href);
    url.searchParams.set('brand_id', brandId);

    try {
      const data = await fetchJson(url);
      setProductOptions(asArray(data?.products?.product));
    } catch (error) {
      console.error('Where to buy: failed to load products', error);
      setProductOptions([]);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const url = new URL(storeLocatorUrl.href);
    form.querySelectorAll('select, input').forEach((field) => {
      if (!field.name || field.disabled) return;
      url.searchParams.set(field.name, field.value);
    });

    try {
      const data = await fetchJson(url);
      renderStores(asArray(data?.RESULTS?.STORES?.STORE));
    } catch (error) {
      console.error('Where to buy: store search failed', error);
      renderStores([]);
    }
  }

  form.addEventListener('change', (event) => {
    if (event.target.matches('.brand-selector')) {
      handleBrandChange(event.target.value);
      return;
    }
    updateSubmitState();
  });

  form.addEventListener('input', (event) => {
    if (event.target.matches('.zip-input')) updateSubmitState();
  });

  form.addEventListener('submit', handleSubmit);

  clearResults();
  updateSubmitState();
})();
