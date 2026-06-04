#!/usr/bin/env python3
"""Generate utility preset snippets from qa-theme settings_data.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QA_DATA = ROOT.parent / "qa-theme" / "config" / "settings_data.json"
SNIPPETS = ROOT / "snippets"
TEMPLATES = ROOT / "templates"

SECTION_KEYS = {
    "faq": "utility-section-1",
    "privacy": "utility-section-3",
    "terms": "utility-section-4",
}


def liquid_str(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def render_content_section_call(settings: dict, index: int) -> str:
    title = liquid_str(settings.get("section_title", ""))
    subtitle = liquid_str(settings.get("section_subtitle", ""))
    accordion = "true" if settings.get("section_accordion") else "false"
    details = settings.get("section_details", "")
    capture_name = f"preset_details_{index}"

    lines = [
        f"{{% capture {capture_name} %}}",
        details,
        "{% endcapture %}",
        "{% render 'utility-content-section',",
        f"  preset_section_title: '{title}',",
        f"  preset_section_subtitle: '{subtitle}',",
        f"  preset_section_accordion: {accordion},",
        f"  preset_section_details: {capture_name}",
        "%}",
        "",
    ]
    return "\n".join(lines)


def write_preset(name: str, sections: list[dict]) -> None:
    parts = [f"{{% comment %}}Auto preset: {name} (page handle).{{% endcomment %}}\n"]
    for index, settings in enumerate(sections):
        parts.append(render_content_section_call(settings, index))
    path = SNIPPETS / f"utility-preset-{name}.liquid"
    path.write_text("\n".join(parts), encoding="utf-8")
    print(f"Wrote {path}")


def write_contact_preset() -> None:
    contact_path = TEMPLATES / "page.contact.json"
    data = json.loads(contact_path.read_text())
    blocks = data["sections"]["utility"]["blocks"]
    subcopy = blocks["subcopy"]["settings"]["text"]

    content = f"""{{% comment %}}Auto preset: contact (page handle).{{% endcomment %}}
<h2 class="utility-section-title">Send us a message!</h2>
<div class="utility-subcopy rte">{subcopy}</div>
<div class="contact-wrapper">
  <div class="contact-form">
    {{% render 'utility-contact-form' %}}
  </div>
</div>
"""
    path = SNIPPETS / "utility-preset-contact.liquid"
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path}")


def main() -> None:
    data = json.loads(QA_DATA.read_text())
    sections = data["current"]["sections"]

    for name, key in SECTION_KEYS.items():
        sec = sections[key]
        block_settings = [
            sec["blocks"][bid]["settings"]
            for bid in sec.get("block_order", [])
            if sec["blocks"][bid].get("type") == "section_block"
        ]
        write_preset(name, block_settings)

    write_contact_preset()


if __name__ == "__main__":
    main()
