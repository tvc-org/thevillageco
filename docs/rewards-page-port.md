# Rewards page port (Option A — legacy carryover)

Ported from live theme backup for `/pages/rewards` ([Rewards TVC](https://thevillagecompany.com/pages/rewards)).

## What was added

| Asset | Purpose |
|-------|---------|
| `templates/page.rewards.liquid` | Routes page by `page.content` (`Section 1`–`4`) |
| `sections/rewards-faq-section-1.liquid` … `4` | FAQ accordion blocks |
| `sections/rewards-yotpo-cta.liquid` | Optional CTA below Yotpo hero |
| `assets/theme.rewards-styles.scss.css` | Yotpo widget + FAQ layout overrides |

Theme settings: `rewards_id_1` … `rewards_id_4` (TVC uses `94873`).

FAQ content for section 1 lives in `config/settings_data.json` under `sections.rewards-faq-section-1`.

## Shopify admin setup

1. Open **Pages → Rewards** (or create handle `rewards`).
2. Template: **rewards**.
3. Page content (rich text): **`Section 1`** for The Village Co. (`Section 2`–`4` for other brand variants if configured later).

## Future cleanup (recommended)

This is a straight port, not aligned with the new TVC section conventions (`tvc-*`, JSON templates).

1. **Replace `page.content` switch** with `page.rewards.json` and explicit sections (see Option B from planning notes).
2. **Consolidate FAQ** into `utility-content-section` accordion blocks or Dawn `collapsible-content` — drop four duplicate `rewards-faq-section-*` files.
3. **Trim `theme.rewards-styles.scss.css`** (~45KB) — keep only Yotpo overrides that still break after a visual QA pass; delete dead rules.
4. **Yotpo embed section** — single `tvc-yotpo-embed` section with instance ID setting instead of theme-level `rewards_id_*` + raw div in template.
5. **FAQ answer fields** — change schema from `text` to `richtext` / `html` so merchants can edit multi-line answers without `<br>` hacks.
6. **Remove `utility-page.js` dependency** on rewards if FAQ moves to `<details>` native accordion.
7. **Brand variants** — sections 2–4 are empty placeholders; either populate or delete until needed.

## Dependencies

- Yotpo loyalty loader: `9ctShCL202rpQSFyiozQpQ` in `layout/theme.liquid` (already present).
- FAQ accordion: `utility-page.js` + accordion rules in `section-utility-page.css` (extended to `.rewards-page`).
