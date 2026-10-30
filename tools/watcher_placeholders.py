#!/usr/bin/env python3
"""Placeholder sprites for the man on the shore (replaced by real art in Task 7).
Full-canvas 1200x1800; he stands on the beach above the waterline (y~612)."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "game" / "assets" / "watcher"
OUT.mkdir(parents=True, exist_ok=True)

def figure(name, lean=0, head_tilt=0, lantern_dy=0):
    im = Image.new("RGBA", (1200, 1800), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # he stands at the bonfire's edge on the far beach (bg: fire at x≈830, ground y≈560)
    cx, feet = 745, 560
    top = feet - 150
    # lantern glow
    lx, ly = cx - 40 + lean, feet - 66 + lantern_dy
    for r, a in ((30, 36), (19, 70), (10, 160)):
        d.ellipse([lx - r, ly - r, lx + r, ly + r], fill=(255, 190, 90, a))
    # body (leaning silhouette)
    body = [(cx - 17 + lean, top + 38), (cx + 17 + lean, top + 38),
            (cx + 13, feet), (cx - 13, feet)]
    d.polygon(body, fill=(24, 22, 30, 255))
    # head
    hx = cx + lean + head_tilt
    d.ellipse([hx - 13, top, hx + 13, top + 29], fill=(24, 22, 30, 255))
    # lantern arm + lantern
    d.line([cx - 11 + lean, top + 60, lx, ly - 12], fill=(24, 22, 30, 255), width=7)
    d.rectangle([lx - 6, ly - 12, lx + 6, ly + 5], fill=(40, 34, 30, 255), outline=(255, 190, 90, 220), width=2)
    im.save(OUT / f"{name}.png")
    print(name)

figure("at_ease", lean=0, head_tilt=0)
figure("uneasy", lean=-16, head_tilt=-10)       # pulled toward the water
figure("stirred", lean=-6, head_tilt=-4, lantern_dy=-14)  # lantern lifts, he stills
