# Collection cross-promotion tout (metaobjects)

Per-collection promo cells in the product grid. Touts only render when assigned on that collection’s metafield.

## 1. Metaobject definition

**Admin:** Settings → Custom data → Metaobjects → Add definition

| Setting | Value |
|--------|--------|
| **Name** | Cross promotion tout |
| **Type** (handle) | `cross_promotion_tout` |

**Fields** (use these exact **keys**):

| Key | Field type | Notes |
|-----|------------|--------|
| `grid_position` | Integer | Position in the **full collection** (not per page): `0` = first cell on page 1 only; `1` = before 1st product; `5` = before 5th product; `products_count + 1` = after last product. |
| `image` | File | Images only. Used when `video` is empty. |
| `video` | File | Video only. **Overrides** `image` when set. |
| `title` | Multi-line text | Shown over media (line breaks preserved). |
| `link` | URL | Card link; Shopify stores `{ url, text }` — theme uses `url` for `href` and `text` for the CTA label (default `Shop now` if empty). |
| `text_color` | Single line text | `dark` (default) or `light`. Dark = dark title/CTA with light bottom scrim; light = white text with dark scrim. |

Create one metaobject **entry** per tout (e.g. “Mr Bubble cross promo”). Reuse the same entry on multiple collections if needed.

## 2. Collection metafield

**Admin:** Settings → Custom data → Collections → Add definition

| Setting | Value |
|--------|--------|
| **Name** | Cross promo touts |
| **Namespace and key** | `custom.cross_promo_touts` |
| **Type** | List of metaobjects |
| **Metaobject type** | Cross promotion tout (`cross_promotion_tout`) |

**Admin:** Collections → [collection] → Metafields → **Cross promo touts** → add one or more entries.

Collections with an empty list show no touts. Other collections are unaffected.

## 3. Theme reference

```liquid
collection.metafields.custom.cross_promo_touts.value
```

Each item: `tout.grid_position`, `tout.image`, `tout.video`, `tout.title`, `tout.link`, `tout.text_color` (`.value` where needed). Media always fills the cell (`object-fit: cover`).

**Grid position** uses the collection’s full product order (`paginate.current_offset` + index), so a tout at position `5` only appears once (before the 5th product), not again on page 2. Collection featured image in the grid is not counted.

## 4. Files

- `snippets/collection-grid-cross-promo-tout.liquid`
- `snippets/collection-grid-cross-promo-touts-at-position.liquid`
- `sections/main-collection-product-grid.liquid`
- `assets/component-collection-grid-cross-promo-tout.css`
