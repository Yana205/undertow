#!/usr/bin/env python3
"""Procedural night-shore background: bonfire beach above, moonlit shallows below.
A stand-in with the right composition until the painted Gemini background lands."""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "game" / "assets" / "bg"
OUT.mkdir(parents=True, exist_ok=True)
random.seed(7)

W, H = 1200, 1800
WATER_Y = int(H * 0.35)

im = Image.new("RGB", (W, H))
d = ImageDraw.Draw(im)

# night sky
for y in range(WATER_Y):
    t = y / WATER_Y
    d.line([(0, y), (W, y)], fill=(int(10 + 14 * t), int(13 + 16 * t), int(26 + 18 * t)))
# stars
for _ in range(60):
    x, y = random.randint(0, W), random.randint(0, int(WATER_Y * 0.7))
    b = random.randint(90, 200)
    d.point((x, y), fill=(b, b, min(255, b + 30)))
# moon
mx, my, mr = 230, 150, 64
for r, a in ((mr * 2.4, 18), (mr * 1.6, 30), (mr, 255)):
    col = (226, 232, 240) if a == 255 else (60, 70, 95)
    d.ellipse([mx - r, my - r, mx + r, my + r], fill=col)

# beach strip
sand_top = int(WATER_Y * 0.52)
d.polygon([(0, sand_top + 60), (W, sand_top - 40), (W, WATER_Y), (0, WATER_Y)], fill=(44, 38, 44))
# bonfire glow (right side, where he stands)
fx, fy = 830, WATER_Y - 95
for r, col in ((190, (60, 36, 26)), (120, (105, 58, 30)), (64, (178, 102, 40)), (30, (255, 170, 70))):
    d.ellipse([fx - r, fy - r * 0.62, fx + r, fy + r * 0.62], fill=col)
d.polygon([(fx - 14, fy + 12), (fx - 4, fy - 34), (fx + 3, fy - 12), (fx + 10, fy - 40), (fx + 16, fy + 12)], fill=(255, 208, 110))
# party silhouettes
for px in (640, 700, 1000, 1060, 1120):
    ph = random.randint(55, 75)
    d.ellipse([px - 11, fy - ph - 16, px + 11, fy - ph + 10], fill=(16, 14, 20))
    d.polygon([(px - 13, fy - ph + 8), (px + 13, fy - ph + 8), (px + 9, fy + 14), (px - 9, fy + 14)], fill=(16, 14, 20))
# strung lights
for i in range(26):
    t = i / 25
    lx = 600 + t * 560
    ly = fy - 150 + math.sin(t * math.pi) * -34 + t * 8
    d.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=(255, 190, 100))

# water
for y in range(WATER_Y, H):
    t = (y - WATER_Y) / (H - WATER_Y)
    d.line([(0, y), (W, y)], fill=(int(8 + 10 * (1 - t)), int(24 - 12 * t), int(38 - 20 * t)))
# moon shaft on water
for i in range(140):
    y = WATER_Y + int((H - WATER_Y) * (i / 140) ** 1.3)
    w = 30 + i * 1.1 + random.randint(-14, 14)
    x = mx + random.randint(-18, 18)
    a = max(8, 46 - i // 4)
    seg = Image.new("RGBA", (W, 4), (0, 0, 0, 0))
    ImageDraw.Draw(seg).line([(x - w / 2, 2), (x + w / 2, 2)], fill=(140, 180, 210, a), width=3)
    im.paste(Image.alpha_composite(im.crop((0, y, W, y + 4)).convert("RGBA"), seg).convert("RGB"), (0, y))
# fire glow on water (right)
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).polygon([(fx - 40, WATER_Y), (fx + 40, WATER_Y), (fx + 110, H), (fx - 110, H)], fill=(200, 120, 50, 22))
im = Image.alpha_composite(im.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(24)))

im = im.filter(ImageFilter.GaussianBlur(1.2))
im.convert("RGB").save(OUT / "shore.png")
print("bg ok:", OUT / "shore.png")
