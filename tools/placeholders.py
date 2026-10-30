#!/usr/bin/env python3
"""Generate flat placeholder wearables (replaced by real art in Task 7)."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "game" / "assets" / "items"
THUMBS = ROOT / "game" / "assets" / "thumbs"
OUT.mkdir(parents=True, exist_ok=True)
THUMBS.mkdir(parents=True, exist_ok=True)

C = {"tide": (90, 167, 201), "masque": (201, 143, 182), "memory": (217, 184, 106)}

def canvas():
    return Image.new("RGBA", (1200, 1800), (0, 0, 0, 0))

def save(im, name):
    im.save(OUT / f"{name}.png")
    t = im.crop(im.getbbox()).copy()
    t.thumbnail((200, 200))
    t.save(THUMBS / f"{name}.webp", "WEBP")
    print(name)

def top(name, color):
    im = canvas(); d = ImageDraw.Draw(im)
    d.rounded_rectangle([500, 390, 700, 500], radius=42, fill=(*color, 225), outline=(240, 240, 245, 255), width=4)
    save(im, name)

def neck(name, color, pendant=False):
    im = canvas(); d = ImageDraw.Draw(im)
    d.arc([535, 330, 665, 420], 20, 160, fill=(*color, 255), width=9)
    if pendant:
        d.ellipse([582, 408, 618, 452], fill=(*color, 255), outline=(255, 250, 230, 255), width=4)
    save(im, name)

def head(name, color):
    im = canvas(); d = ImageDraw.Draw(im)
    d.rounded_rectangle([535, 128, 665, 178], radius=22, fill=(*color, 225), outline=(240, 240, 245, 255), width=4)
    save(im, name)

def held(name, color):
    im = canvas(); d = ImageDraw.Draw(im)
    d.ellipse([742, 700, 822, 800], fill=(*color, 225), outline=(240, 240, 245, 255), width=4)
    d.line([782, 800, 782, 860], fill=(*color, 255), width=7)
    save(im, name)

top("top_kelp", C["tide"]); top("top_party", C["masque"]); top("top_scarf", C["memory"])
neck("neck_fang", C["tide"]); neck("neck_beads", C["masque"]); neck("locket", C["memory"], pendant=True)
head("head_coral", C["tide"]); head("head_mask", C["masque"]); head("head_ribbon", C["memory"])
held("held_lantern", C["tide"]); held("held_maskstick", C["masque"]); held("held_shell", C["memory"])
