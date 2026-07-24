#!/usr/bin/env python3
"""
Generate utility preset snippets from live theme export settings_data.json.

Default source: theme export in Downloads (override with UTILITY_PRESET_SOURCE env var).
Falls back to qa-theme/config/settings_data.json if export is missing.
"""

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNIPPETS = ROOT / "snippets"
TEMPLATES = ROOT / "templates"

DEFAULT_LIVE_EXPORT = Path.home() / (
    "Downloads/theme_export__thevillagecompany-com-homepage-redesign-2024-megamenu__04JUN2026-0350pm"
)
QA_DATA = ROOT.parent / "qa-theme" / "config" / "settings_data.json"

SECTION_KEYS = {
    "faq": "utility-section-1",
    "privacy": "utility-section-3",
    "terms": "utility-section-4",
}


def resolve_source_path() -> Path:
    env = os.environ.get("UTILITY_PRESET_SOURCE")
    if env:
        path = Path(env)
        if path.is_dir():
            path = path / "config" / "settings_data.json"
        return path
    live = DEFAULT_LIVE_EXPORT / "config" / "settings_data.json"
    if live.is_file():
        return live
    return QA_DATA


def render_content_section_call(settings: dict, index: int) -> str:
    title = settings.get("section_title", "")
    subtitle = settings.get("section_subtitle", "")
    accordion = "true" if settings.get("section_accordion") else "false"
    details = settings.get("section_details", "")
    capture_name = f"preset_details_{index}"

    lines = [
        f"{{% capture {capture_name} %}}",
        details,
        "{% endcapture %}",
        "{% render 'utility-content-section',",
        f"  preset_section_title: {json.dumps(title)},",
        f"  preset_section_subtitle: {json.dumps(subtitle)},",
        f"  preset_section_accordion: {accordion},",
        f"  preset_section_details: {capture_name}",
        "%}",
        "",
    ]
    return "\n".join(lines)


def write_preset(name: str, sections: list[dict], source_label: str) -> None:
    parts = [
        f"{{% comment %}}",
        f"  Auto preset: {name} (page handle).",
        f"  Source: {source_label}",
        f"  Regenerate: python3 scripts/generate-utility-presets.py",
        f"{{% endcomment %}}",
        "",
    ]
    for index, settings in enumerate(sections):
        parts.append(render_content_section_call(settings, index))
    path = SNIPPETS / f"utility-preset-{name}.liquid"
    path.write_text("\n".join(parts), encoding="utf-8")
    print(f"Wrote {path} ({len(sections)} sections)")


def write_contact_preset(subcopy: str, source_label: str) -> None:
    header = (
        "{% comment %}\n"
        "  Auto preset: contact (page handle).\n"
        f"  Source: {source_label}\n"
        "  Regenerate: python3 scripts/generate-utility-presets.py\n"
        "{% endcomment %}\n"
        '<h2 class="utility-section-title">Send us a message!</h2>\n'
        "{% capture utility_contact_subcopy %}\n"
    )
    footer = (
        "{% endcapture %}\n"
        '<div class="utility-subcopy rte">{{ utility_contact_subcopy }}</div>\n'
        '<div class="contact-wrapper">\n'
        '  <div class="contact-form">\n'
        "    {% render 'utility-contact-form' %}\n"
        "  </div>\n"
        "</div>\n"
    )
    content = header + subcopy + "\n" + footer
    path = SNIPPETS / "utility-preset-contact.liquid"
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path}")


def load_section_blocks(sections: dict, key: str) -> list[dict]:
    sec = sections[key]
    return [
        sec["blocks"][bid]["settings"]
        for bid in sec.get("block_order", [])
        if sec["blocks"][bid].get("type") == "section_block"
    ]


def main() -> None:
    source = resolve_source_path()
    if not source.is_file():
        print(f"Source not found: {source}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(source.read_text())
    sections = data["current"]["sections"]
    source_label = source.parent.parent.name if "theme_export" in str(source) else source.name

    print(f"Using: {source}")

    for name, key in SECTION_KEYS.items():
        if key not in sections:
            print(f"Skip {name}: missing {key}", file=sys.stderr)
            continue
        write_preset(name, load_section_blocks(sections, key), source_label)

    subcopy = ""
    if "contact-subcopy" in sections:
        subcopy = sections["contact-subcopy"].get("settings", {}).get("subcopy", "")
    if not subcopy:
        print("Warning: no contact-subcopy in source", file=sys.stderr)
    write_contact_preset(subcopy, source_label)

    # Keep page.contact.json subcopy aligned for blocks-based contact template
    contact_json = TEMPLATES / "page.contact.json"
    if contact_json.is_file() and subcopy:
        contact_data = json.loads(contact_json.read_text())
        utility = contact_data["sections"].get("utility", contact_data["sections"].get("main"))
        if utility and "blocks" in utility:
            for block in utility["blocks"].values():
                if block.get("type") == "subcopy":
                    block["settings"]["text"] = subcopy
                    break
            contact_json.write_text(json.dumps(contact_data, indent=2, ensure_ascii=False) + "\n")
            print(f"Updated {contact_json} subcopy")

    # Keep theme-editor templates seeded from the generated preset snippets
    seed = ROOT / "scripts" / "seed-utility-templates-from-presets.py"
    if seed.is_file():
        import subprocess

        print("Seeding page.utility-*.json from presets…")
        subprocess.check_call([sys.executable, str(seed)], cwd=ROOT)


if __name__ == "__main__":
    main()
