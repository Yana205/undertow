#!/usr/bin/env python3
"""Slice character sheets into game layers.

Modes:
  cut      — crop each box from its sheet, remove bg (rembg if available,
             else luminance key), trim to bbox, save to assets_raw/<id>.png
  compose  — place each raw cutout onto the 1200x1800 master canvas using
             layout.json ({id: {scale, x, y}} with x,y = top-left of the
             scaled image on the canvas), save to game/assets/<dest>.
             Also writes 200px-wide webp thumbs for wearables.

Run from repo root:  .venv/bin/python tools/slice.py cut|compose [ids...]
"""
import json, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets_raw"
CANVAS = (1200, 1800)

def load(p):
    with open(p) as f:
        return json.load(f)

def cut(only=None):
    try:
        from rembg import remove, new_session
        session = new_session("isnet-anime")
        def strip(im):
            return remove(im, session=session)
    except Exception as e:
        print(f"[warn] rembg unavailable ({e}); luminance key fallback")
        def strip(im):
            im = im.convert("RGBA")
            px = im.load()
            w, h = im.size
            for y in range(h):
                for x in range(w):
                    r, g, b, a = px[x, y]
                    lum = max(r, g, b)
                    if lum < 26:
                        px[x, y] = (r, g, b, 0)
                    elif lum < 48:
                        px[x, y] = (r, g, b, int((lum - 26) / 22 * 255))
            return im
    import numpy as np

    def keep_main_component(im):
        """Zero alpha of pixels not connected to the figure (seeded from the
        most opaque region near the image center). Kills neighbor-crop debris."""
        a = np.array(im)[:, :, 3] > 24
        h, w = a.shape
        ys, xs = np.nonzero(a)
        if len(ys) == 0:
            return im
        cx = w // 2
        mid = (np.abs(xs - cx) < w // 6)
        seed_y, seed_x = (ys[mid][len(ys[mid]) // 2], xs[mid][len(xs[mid]) // 2]) if mid.any() else (ys[0], xs[0])
        mask = np.zeros_like(a)
        mask[seed_y, seed_x] = True
        while True:
            grown = mask.copy()
            grown[1:, :] |= mask[:-1, :]
            grown[:-1, :] |= mask[1:, :]
            grown[:, 1:] |= mask[:, :-1]
            grown[:, :-1] |= mask[:, 1:]
            grown &= a
            if (grown == mask).all():
                break
            mask = grown
        out = np.array(im)
        out[:, :, 3] = np.where(mask, out[:, :, 3], 0)
        return Image.fromarray(out)

    boxes = load(ROOT / "tools" / "boxes.json")
    RAW.mkdir(exist_ok=True)
    for sheet in boxes["sheets"]:
        src = Image.open(sheet["path"]).convert("RGBA")
        for c in sheet["cuts"]:
            if only and c["id"] not in only:
                continue
            crop = src.crop((c["x"], c["y"], c["x"] + c["w"], c["y"] + c["h"]))
            out = strip(crop)
            if c.get("floor"):  # zero pixels darker than the sheet background
                px = out.load()
                fl = c["floor"]
                for yy in range(out.height):
                    for xx in range(out.width):
                        r, g, b, a = px[xx, yy]
                        if a and max(r, g, b) < fl:
                            px[xx, yy] = (r, g, b, 0)
            if c.get("clean", True):
                out = keep_main_component(out)
            for ex0, ey0, ex1, ey1 in c.get("erase", []):
                blank = Image.new("RGBA", (ex1 - ex0, ey1 - ey0), (0, 0, 0, 0))
                out.paste(blank, (ex0, ey0))
            if c.get("trim", True):
                bbox = out.getbbox()
                if bbox:
                    out = out.crop(bbox)
            out.save(RAW / f"{c['id']}.png")
            print(f"cut {c['id']}: {out.size[0]}x{out.size[1]}")

def compose(only=None):
    layout = load(ROOT / "tools" / "layout.json")
    for aid, spec in layout.items():
        if only and aid not in only:
            continue
        raw = Image.open(RAW / f"{aid}.png").convert("RGBA")
        s = spec.get("scale", 1.0)
        im = raw.resize((max(1, round(raw.width * s)), max(1, round(raw.height * s))), Image.LANCZOS)
        canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        canvas.paste(im, (round(spec["x"]), round(spec["y"])), im)
        dest = ROOT / spec["dest"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(dest)
        if spec.get("thumb"):
            t = raw.copy()
            t.thumbnail((200, 200), Image.LANCZOS)
            tp = ROOT / spec["thumb"]
            tp.parent.mkdir(parents=True, exist_ok=True)
            t.save(tp, "WEBP")
        print(f"compose {aid} -> {spec['dest']}")

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "cut"
    only = set(sys.argv[2:]) or None
    {"cut": cut, "compose": compose}[mode](only)
