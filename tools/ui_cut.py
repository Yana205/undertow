#!/usr/bin/env python3
"""Cut UI sprites (vibe icons, button plate) from the UI package sheets."""
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "game" / "assets" / "ui"
OUT.mkdir(parents=True, exist_ok=True)
session = new_session("isnet-general-use")

CUTS = {
    "assets_incoming/ui_icons.jpg": [
        ("vibe_tide",    (110, 40, 1075, 1030), 320),
        ("vibe_masque",  (1130, 40, 2000, 780), 320),
        ("vibe_memory",  (1230, 840, 2000, 1490), 320),
    ],
    "assets_incoming/ui_buttons.jpg": [
        ("btn_blank",    (1230, 760, 2000, 1030), 760),
        ("btn_wardrobe", (1520, 1230, 1790, 1480), 200),
    ],
}

for sheet, cuts in CUTS.items():
    src = Image.open(ROOT / sheet).convert("RGBA")
    for name, box, maxw in cuts:
        crop = src.crop(box)
        cut = remove(crop, session=session)
        bbox = cut.getbbox()
        if bbox:
            cut = cut.crop(bbox)
        if cut.width > maxw:
            cut = cut.resize((maxw, round(cut.height * maxw / cut.width)), Image.LANCZOS)
        cut.save(OUT / f"{name}.png")
        print(name, cut.size)
