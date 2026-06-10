# Collection infinite scroll

Loads additional collection pages when the shopper scrolls near the bottom of the product grid.

## How it works

- First page renders normally (touts, featured image, products).
- When `enable_infinite_scroll` is on, pagination links are replaced by a sentinel + `collection-infinite-scroll.js`.
- The script fetches the next page via Shopify’s **Section Rendering API** (`?section_id=…&page=…`), appends `#product-grid` children, and repeats until there is no `paginate.next`.
- Filter/sort changes still use `facets.js`, which replaces `#ProductGridContainer` and re-mounts the infinite-scroll element (page 1 only).

## Revert to pagination

**Option A (no code):** Theme editor → Collection page → **Product grid** → uncheck **Infinite scroll**.

**Option B (remove feature):**

1. Delete `assets/collection-infinite-scroll.js`
2. Delete `assets/component-collection-infinite-scroll.css`
3. Delete `snippets/collection-infinite-scroll.liquid`
4. In `sections/main-collection-product-grid.liquid`, remove the infinite-scroll assets, schema setting, and restore `{% render 'pagination', paginate: paginate, anchor: '' %}`

## Files

- `sections/main-collection-product-grid.liquid` — toggle + render
- `snippets/collection-infinite-scroll.liquid` — sentinel markup
- `assets/collection-infinite-scroll.js` — fetch + append
- `assets/component-collection-infinite-scroll.css` — loading/end styles

## Notes / limitations

- Uses one `products_per_page` for all pages (standard Shopify `paginate`).
- Cross-promo touts on page 2+ follow existing Liquid rules (`paginate.current_offset`).
- Collection featured image only renders on page 1 (`paginate.current_offset == 0`).
- SEO: paginated URLs (`?page=2`) still work if linked directly; crawlers that don’t scroll only see page 1 in the initial HTML.
