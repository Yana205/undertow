#!/usr/bin/env python3
"""Hue variants of the APC pack hair (shape stays, color shifts).
Source: the composed hair_apc_pink.png (most saturated -> cleanest shifts)."""
import colorsys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ITEMS = ROOT / "game" / "assets" / "items"
THUMBS = ROOT / "game" / "assets" / "thumbs"

src = Image.open(ITEMS / "hair_apc_pink.png").convert("RGBA")
a = np.array(src).astype(float) / 255.0
rgb, alpha = a[:, :, :3], a[:, :, 3]

hsv = np.array(Image.fromarray((rgb * 255).astype(np.uint8)).convert("HSV")).astype(float)

# (name, hue 0-255, sat mult, val mult)
VARIANTS = [
    ("teal",     128, 0.95, 0.92),
    ("lavender", 190, 0.75, 1.00),
    ("silver",   165, 0.12, 1.05),
    ("crimson",  246, 1.25, 0.78),
]

for name, hue, smul, vmul in VARIANTS:
    h = hsv.copy()
    h[:, :, 0] = hue
    h[:, :, 1] = np.clip(h[:, :, 1] * smul, 0, 255)
    h[:, :, 2] = np.clip(h[:, :, 2] * vmul, 0, 255)
    out_rgb = Image.fromarray(h.astype(np.uint8), "HSV").convert("RGB")
    out = np.dstack([np.array(out_rgb), (alpha * 255).astype(np.uint8)])
    im = Image.fromarray(out, "RGBA")
    im.save(ITEMS / f"hair_apc_{name}.png")
    t = im.crop(im.getbbox()).copy()
    t.thumbnail((200, 200), Image.LANCZOS)
    t.save(THUMBS / f"hair_apc_{name}.webp", "WEBP")
    print(f"hair_apc_{name}")
