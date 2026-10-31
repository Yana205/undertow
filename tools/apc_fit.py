#!/usr/bin/env python3
"""Fit APC pack garments to the mermaid bases.

The whole pack shares one pixel scale with Body_1, so every item uses the
same global factor K. Bases are first re-aligned so all four bodies share
head-center x=CX and head-top y=HEAD_TOP on the 1200x1800 canvas; garments
are then placed once, by anatomy anchor, and fit all four.

  align   — measure each base raw, rewrite its layout x/y, recompose bases
  anatomy — print canvas-space anatomy rows (neck/shoulder/waist...)
  items   — compose every item in apc_items.json to game/assets/items/
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
APC = Path("/Users/yanai/Downloads/APC_assets")
RAW = ROOT / "assets_raw"
CANVAS = (1200, 1800)
K = 0.373          # APC px -> canvas px (head-width + shoulder-width match)
BASE_S = 0.9       # mermaid raw -> canvas (existing)
CX = 600           # body center x on canvas
HEAD_TOP = 140     # head top y on canvas

def mask_of(im):
    a = np.array(im.convert("RGBA"))
    if a[:, :, 3].min() == 255:   # flat image: key near-white
        return ~((a[:, :, 0] > 245) & (a[:, :, 1] > 245) & (a[:, :, 2] > 245))
    return a[:, :, 3] > 24

def head_metrics(mask):
    rows = np.nonzero(mask.any(axis=1))[0]
    top = rows[0]
    H = rows[-1] - top
    band = mask[top:top + int(H * 0.08)]
    widths = []
    for y in range(band.shape[0]):
        xs = np.nonzero(band[y])[0]
        if len(xs):
            widths.append((xs[-1] - xs[0], (xs[0] + xs[-1]) / 2, top + y))
    w, cx, _ = max(widths)
    return {"head_top": int(top), "head_w": int(w), "head_cx": float(cx), "H": int(H)}

def align():
    layout = json.load(open(ROOT / "tools" / "layout.json"))
    for bid in ["base_oceanic", "base_pearlescent", "base_deep_current", "base_reef"]:
        m = head_metrics(mask_of(Image.open(RAW / f"{bid}.png")))
        layout[bid]["x"] = round(CX - BASE_S * m["head_cx"])
        layout[bid]["y"] = round(HEAD_TOP - BASE_S * m["head_top"])
        print(bid, m, "->", layout[bid]["x"], layout[bid]["y"])
    json.dump(layout, open(ROOT / "tools" / "layout.json", "w"), indent=2)

def anatomy():
    mask = mask_of(Image.open(RAW / "base_oceanic.png"))
    rows = np.nonzero(mask.any(axis=1))[0]
    top, H = rows[0], rows[-1] - rows[0]
    m = head_metrics(mask)
    y0 = HEAD_TOP - BASE_S * m["head_top"]
    def canvas_y(raw_y): return round(y0 + BASE_S * raw_y)
    prof = []
    for y in range(top, top + int(H * 0.45), 4):
        xs = np.nonzero(mask[y])[0]
        prof.append((y, xs[-1] - xs[0] if len(xs) else 0))
    head_w = m["head_w"]
    neck = next(y for y, w in prof if y > top + head_w and w < head_w * 0.8)
    shoulder = next(y for y, w in prof if y > neck and w > head_w * 1.8)
    widths_after = [(y, w) for y, w in prof if y > shoulder + 40]
    waist = min(widths_after, key=lambda t: t[1])[0]
    out = {"neck": canvas_y(neck), "shoulder": canvas_y(shoulder), "waist": canvas_y(waist),
           "head_top": HEAD_TOP, "cx": CX}
    print(json.dumps(out))
    return out

def items():
    try:
        from rembg import remove, new_session
        session = new_session("isnet-anime")
    except Exception:
        session = None
    spec = json.load(open(ROOT / "tools" / "apc_items.json"))
    if (ROOT / "tools" / "incoming_items.json").exists():
        spec = spec + json.load(open(ROOT / "tools" / "incoming_items.json"))
    anat = anatomy()
    outdir = ROOT / "game" / "assets" / "items"
    thumbs = ROOT / "game" / "assets" / "thumbs"
    outdir.mkdir(parents=True, exist_ok=True)
    thumbs.mkdir(parents=True, exist_ok=True)
    for it in spec:
        p = ROOT / it["file"]
        src = Image.open(p if p.exists() else APC / it["file"]).convert("RGBA")
        a = np.array(src)
        if a[:, :, 3].min() == 255:          # no transparency: cut it
            if session:
                from rembg import remove
                src = remove(src, session=session)
            else:
                m = mask_of(src)
                a[:, :, 3] = np.where(m, 255, 0)
                src = Image.fromarray(a)
        bbox = src.getbbox()
        src = src.crop(bbox)
        if it.get("fitwidth"):
            # scale any standalone garment to a target canvas width —
            # generated tops fit regardless of their export resolution
            s = it["fitwidth"] / src.width
        else:
            s = it.get("scale", 1.0) * K
        im = src.resize((max(1, round(src.width * s)), max(1, round(src.height * s))), Image.LANCZOS)
        ax = anat["cx"] + it.get("dx", 0) - im.width // 2
        ay = anat[it["anchor"]] + it.get("dy", 0)
        canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        canvas.paste(im, (round(ax), round(ay)), im)
        canvas.save(outdir / f"{it['id']}.png")
        t = src.copy()
        t.thumbnail((200, 200), Image.LANCZOS)
        t.save(thumbs / f"{it['id']}.webp", "WEBP")
        print(f"{it['id']}: {im.size} at ({round(ax)},{round(ay)}) anchor={it['anchor']}")

if __name__ == "__main__":
    {"align": align, "anatomy": anatomy, "items": items}[sys.argv[1]]()
