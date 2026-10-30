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
    cx, feet = 900, 600
    top = feet - 240
    # lantern glow
    lx, ly = cx - 62 + lean * 2, feet - 110 + lantern_dy
    for r, a in ((46, 36), (30, 70), (16, 160)):
        d.ellipse([lx - r, ly - r, lx + r, ly + r], fill=(255, 190, 90, a))
    # body (leaning silhouette)
    body = [(cx - 26 + lean, top + 58), (cx + 26 + lean, top + 58),
            (cx + 20, feet), (cx - 20, feet)]
    d.polygon(body, fill=(24, 22, 30, 255))
    # head
    hx = cx + lean + head_tilt
    d.ellipse([hx - 20, top, hx + 20, top + 44], fill=(24, 22, 30, 255))
    # lantern arm + lantern
    d.line([cx - 16 + lean, top + 90, lx, ly - 18], fill=(24, 22, 30, 255), width=10)
    d.rectangle([lx - 9, ly - 18, lx + 9, ly + 8], fill=(40, 34, 30, 255), outline=(255, 190, 90, 220), width=2)
    im.save(OUT / f"{name}.png")
    print(name)

figure("at_ease", lean=0, head_tilt=0)
figure("uneasy", lean=-16, head_tilt=-10)       # pulled toward the water
figure("stirred", lean=-6, head_tilt=-4, lantern_dy=-14)  # lantern lifts, he stills
