# TVC custom sections — conventions

The Village Company uses **purpose-built sections** (e.g. `tvc-slideshow`) instead of heavily modifying stock Dawn sections when designs diverge. This doc is the single reference for **file naming**, **schema structure**, and **presets** so the theme editor and repo stay consistent.

---

## File and code naming

| Item | Convention | Example |
|------|------------|---------|
| Section Liquid file | `kebab-case`, short `tvc-` prefix | `tvc-slideshow.liquid` |
| Section CSS (if dedicated) | One pattern repo-wide | `section-tvc-slideshow.css` or `tvc-slideshow.css` |
| Section JS (if any) | Same stem as the section | `tvc-slideshow.js` |
| Root wrapper class | BEM-style, same prefix as file | `.tvc-slideshow`, `.tvc-slideshow--full-bleed` |
| Snippets only for this section | Optional `tvc-` prefix | `tvc-slideshow-slide.liquid` |

- **Filenames**: use letters, numbers, hyphens only—no spaces, no `|` in paths.
- **Display labels** in the theme editor may use nicer strings (e.g. “TVC \| Slideshow”) via the schema `name`—that does not need to match the filename.
- **Section id** (filename without `.liquid`) is stored in JSON templates—**keep it stable** once pages reference it; renaming is a migration.

---

## Schema structure (`{% schema %}`)

1. **`name`** — Merchant-facing; include a recognizable prefix so the section list is scannable.  
   Example: `"TVC Slideshow"` or `"TVC — Slideshow"`.

2. **`tag`** — Use semantic HTML appropriate to the block (e.g. `section` for a hero region).

3. **`class`** — Often includes the root BEM class plus shared theme classes, e.g. `"section tvc-slideshow"`.

4. **`settings`** — Group with `type: "header"` so the editor isn’t one long list. Suggested order:  
   **Content → Layout → Typography → Colors → Advanced** (custom Liquid / metafields last).

5. **`blocks`** — For repeating slides/tiles/cards: clear `name` per block type; use `max_blocks` when the design caps count.

6. **`presets`** — At least one preset; **`preset.name`** should match what merchants expect when adding the section (e.g. same as section `name`, or “TVC Slideshow (default)”).

7. **`enabled_on` / `disabled_on`** — Use when a section must only appear on certain templates (e.g. landing pages only).

---

## Presets and templates

- **Schema presets** define what merchants see under “Add section” and the default blocks/settings.
- **JSON templates** (`templates/*.json`) reference sections by **`type`** (the section id). After a section is used in production, treat **renames** as a breaking change unless you update every template and migration.

---

## CSS and assets

- Load stylesheet from the section file when possible:  
  `{{ 'section-tvc-slideshow.css' | asset_url | stylesheet_tag }}`  
  (or one shared TVC bundle if you consolidate later).
- Scope design tokens on the root:  
  `.tvc-slideshow { --tvc-slide-radius: 12px; }`  
  so overrides stay predictable.

---

## Translations

- If the rest of the theme uses `t:` keys for section strings, add keys under a namespace such as `sections.tvc_slideshow.*`.
- If the team ships English-only for now, plain strings in schema are acceptable—stay consistent with the rest of the theme.

---

## Principles

1. **One section ≈ one design-system component**—avoid multipurpose “god” sections.
2. **Stable section id**; iterate via new settings, not renames.
3. **Prefix TVC-owned files and classes** so search and review stay easy.
4. Optionally maintain a short internal list: which TVC sections replace which Dawn patterns, so duplicate sections aren’t added to the same template by mistake.
