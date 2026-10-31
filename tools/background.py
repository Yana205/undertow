#!/usr/bin/env python3
"""Night-shore background: PIXEL-ART sky (big moon, stars, cloud banks —
after Yana's reference) above a bonfire beach strip and moonlit shallows.
If assets_incoming/moon_sky.png exists it replaces the generated sky."""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "game" / "assets" / "bg"
OUT.mkdir(parents=True, exist_ok=True)
random.seed(11)

W, H = 1200, 1800
WATER_Y = int(H * 0.35)
MX, MY = 944, 212          # moon center on canvas (the shaft follows it)

im = Image.new("RGB", (W, H))
d = ImageDraw.Draw(im)

# ---- pixel-art sky ----
custom = ROOT / "assets_incoming" / "moon_sky.png"
if custom.exists():
    sky = Image.open(custom).convert("RGB")
    sky = sky.resize((W, WATER_Y + 8), Image.NEAREST)
    im.paste(sky, (0, 0))
else:
    cell = 8
    SW, SH = W // cell, WATER_Y // cell + 2
    sky = Image.new("RGB", (SW, SH))
    ds = ImageDraw.Draw(sky)
    for y in range(SH):
        t = y / SH
        ds.line([(0, y), (SW, y)], fill=(int(6 + 9 * t), int(9 + 12 * t), int(28 + 26 * t)))
    for _ in range(85):  # chunky stars
        x, y = random.randint(0, SW - 1), random.randint(0, SH - 1)
        sky.putpixel((x, y), (200, 208, 235) if random.random() < 0.7 else (120, 132, 176))
    # cloud banks (rounded bumps with a pale top outline)
    def bank(x0, y0, n, rmin, rmax):
        info = []
        for i in range(n):
            r = random.randint(rmin, rmax)
            x = x0 + i * int(r * 1.1)
            y = y0 + random.randint(-2, 2)
            info.append((x, y, r))
        for x, y, r in info:
            ds.ellipse([x - r, y - r - 1, x + r, y + r - 1], fill=(58, 66, 104))
        for x, y, r in info:
            ds.ellipse([x - r + 1, y - r, x + r - 1, y + r + 3], fill=(22, 27, 54))
    bank(2, SH - 4, 9, 2, 5)
    bank(SW - 46, SH - 9, 8, 3, 7)
    # moon: ring, body, blotches
    mx, my, r = MX // cell, MY // cell, 16
    ds.ellipse([mx - r - 1, my - r - 1, mx + r + 1, my + r + 1], fill=(150, 158, 182))
    ds.ellipse([mx - r, my - r, mx + r, my + r], fill=(202, 211, 243))
    for _ in range(14):
        br = random.randint(2, 5)
        bx = mx + random.randint(-r + 3, r - 3)
        by = my + random.randint(-r + 3, r - 3)
        if (bx - mx) ** 2 + (by - my) ** 2 < (r - br) ** 2:
            ds.ellipse([bx - br, by - br, bx + br, by + br],
                       fill=(179, 191, 234) if random.random() < 0.7 else (222, 229, 251))
    sky = sky.resize((SW * cell, SH * cell), Image.NEAREST)
    im.paste(sky, (0, 0))

# ---- beach strip + party ----
sand_top = int(WATER_Y * 0.52)
d.polygon([(0, sand_top + 60), (W, sand_top - 40), (W, WATER_Y), (0, WATER_Y)], fill=(44, 38, 44))
fx, fy = 225, WATER_Y - 95
for r, col in ((190, (60, 36, 26)), (120, (105, 58, 30)), (64, (178, 102, 40)), (30, (255, 170, 70))):
    d.ellipse([fx - r, fy - r * 0.62, fx + r, fy + r * 0.62], fill=col)
d.polygon([(fx - 14, fy + 12), (fx - 4, fy - 34), (fx + 3, fy - 12), (fx + 10, fy - 40), (fx + 16, fy + 12)], fill=(255, 208, 110))
for px in (82, 140, 330, 392, 452):
    ph = random.randint(55, 75)
    d.ellipse([px - 11, fy - ph - 16, px + 11, fy - ph + 10], fill=(16, 14, 20))
    d.polygon([(px - 13, fy - ph + 8), (px + 13, fy - ph + 8), (px + 9, fy + 14), (px - 9, fy + 14)], fill=(16, 14, 20))
for i in range(26):
    t = i / 25
    lx = 60 + t * 470
    ly = fy - 150 + math.sin(t * math.pi) * -34 + t * 8
    d.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=(255, 190, 100))

# ---- water ----
for y in range(WATER_Y, H):
    t = (y - WATER_Y) / (H - WATER_Y)
    d.line([(0, y), (W, y)], fill=(int(8 + 10 * (1 - t)), int(24 - 12 * t), int(38 - 20 * t)))
for i in range(140):  # moon shaft
    y = WATER_Y + int((H - WATER_Y) * (i / 140) ** 1.3)
    w = 30 + i * 1.1 + random.randint(-14, 14)
    x = MX + random.randint(-18, 18)
    a = max(8, 46 - i // 4)
    seg = Image.new("RGBA", (W, 4), (0, 0, 0, 0))
    ImageDraw.Draw(seg).line([(x - w / 2, 2), (x + w / 2, 2)], fill=(140, 180, 210, a), width=3)
    im.paste(Image.alpha_composite(im.crop((0, y, W, y + 4)).convert("RGBA"), seg).convert("RGB"), (0, y))
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).polygon([(fx - 40, WATER_Y), (fx + 40, WATER_Y), (fx + 110, H), (fx - 110, H)], fill=(200, 120, 50, 22))
im = Image.alpha_composite(im.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(24)))
im.convert("RGB").save(OUT / "shore.png")
print("bg ok (custom sky)" if custom.exists() else "bg ok (pixel sky)")
