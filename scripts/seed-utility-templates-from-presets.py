#!/usr/bin/env python3
"""
Seed page.utility-{terms,privacy,faq}.json from utility-preset-*.liquid snippets
so content is editable as theme section blocks.

Usage:
  python3 scripts/seed-utility-templates-from-presets.py
"""

from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNIPPETS = ROOT / "snippets"
TEMPLATES = ROOT / "templates"

PRESETS = ("terms", "privacy", "faq")

SECTION_RE = re.compile(
    r"\{%\s*capture\s+(preset_details_\d+)\s*%\}"
    r"(.*?)"
    r"\{%\s*endcapture\s*%\}\s*"
    r"\{%\s*render\s+'utility-content-section'\s*,\s*"
    r"preset_section_title:\s*(.*?)\s*,\s*"
    r"preset_section_subtitle:\s*(.*?)\s*,\s*"
    r"preset_section_accordion:\s*(true|false)\s*,\s*"
    r"preset_section_details:\s*\1\s*%\}",
    re.DOTALL,
)


def parse_liquid_string(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith('"') and raw.endswith('"'):
        return json.loads(raw)
    return raw


def parse_preset(name: str) -> list[dict]:
    path = SNIPPETS / f"utility-preset-{name}.liquid"
    text = path.read_text(encoding="utf-8")
    sections: list[dict] = []
    for match in SECTION_RE.finditer(text):
        details = match.group(2).strip("\n")
        sections.append(
            {
                "section_title": parse_liquid_string(match.group(3)),
                "section_subtitle": parse_liquid_string(match.group(4)),
                "section_accordion": match.group(5) == "true",
                "section_details": details,
            }
        )
    if not sections:
        raise SystemExit(f"No content sections parsed from {path}")
    return sections


def block_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def build_template(name: str, sections: list[dict]) -> dict:
    blocks: dict = {
        "heading": {
            "type": "page_heading",
            "settings": {"title": ""},
        }
    }
    order = ["heading"]
    for index, settings in enumerate(sections):
        bid = block_id(f"content_{name}_{index}")
        blocks[bid] = {"type": "content_section", "settings": settings}
        order.append(bid)

    return {
        "sections": {
            "utility": {
                "type": "utility-page",
                "blocks": blocks,
                "block_order": order,
                "settings": {
                    "banner_title": "Support & Information",
                    "nav_menu": "utility-menu",
                    "content_source": "blocks",
                },
            }
        },
        "order": ["utility"],
    }


AUTOGEN_BANNER = """/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 *
 * This file may be updated by the Shopify admin theme editor
 * or related systems. Please exercise caution as any changes
 * made to this file may be overwritten.
 * ------------------------------------------------------------
 */
"""


def write_template(name: str, data: dict) -> Path:
    path = TEMPLATES / f"page.utility-{name}.json"
    body = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    path.write_text(AUTOGEN_BANNER + body, encoding="utf-8")
    return path


def main() -> None:
    for name in PRESETS:
        sections = parse_preset(name)
        path = write_template(name, build_template(name, sections))
        print(f"Wrote {path} ({len(sections)} content_section block(s))")


if __name__ == "__main__":
    main()
