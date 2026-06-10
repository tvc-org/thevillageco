/**
 * Where To Buy — IRI product locator (ported from qa-theme view-whereToBuy.js).
 */
(function () {
  const page = document.querySelector('.where-to-buy-page');
  if (!page) return;

  const form = page.querySelector('#wtb-selectors');
  const productSelect = page.querySelector('.product-selector');
  const resultsTable = page.querySelector('.results');
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !productSelect || !resultsTable || !submitButton) return;

  const messages = {
    beforeSearch: page.dataset.beforeSearch || 'Search for a product',
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

  function updateSubmitState() {
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

  function renderBeforeSearch() {
    resultsTable.innerHTML = '';
    const row = document.createElement('tr');
    const cell = document.createElement('th');
    cell.textContent = messages.beforeSearch;
    row.appendChild(cell);
    resultsTable.appendChild(row);
  }

  function renderStores(stores) {
    resultsTable.innerHTML = '';

    if (!stores.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('th');
      cell.textContent = messages.noStores;
      row.appendChild(cell);
      resultsTable.appendChild(row);
      return;
    }

    const headers = ['Store Name', 'Distance', 'Address', 'City', 'Zip Code', 'State', 'Phone'];
    const headerRow = document.createElement('tr');
    headers.forEach((label) => {
      const cell = document.createElement('th');
      cell.textContent = label;
      headerRow.appendChild(cell);
    });
    resultsTable.appendChild(headerRow);

    const fields = ['NAME', 'DISTANCE', 'ADDRESS', 'CITY', 'ZIP', 'STATE', 'PHONE'];
    stores.forEach((store) => {
      const row = document.createElement('tr');
      fields.forEach((field) => {
        const cell = document.createElement('td');
        cell.textContent = store[field] || '';
        row.appendChild(cell);
      });
      resultsTable.appendChild(row);
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

  renderBeforeSearch();
  updateSubmitState();
})();
