#!/usr/bin/env python3
"""Turn each composed Gemini hair into a proper paper-doll wig:

  hair_X_back.png — the full hair mass, rendered BEHIND the base
  hair_X.png      — front cap only: crown + bangs, fading out below the
                    chin, with a feathered face window punched out so the
                    face always shows (the same trick the APC pack hairs use)

Run AFTER `slice.py compose`. Face geometry comes from the shared body
anchor (head center 600, head top 140, head width ~130 on canvas).
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
HAIR = ROOT / "game" / "assets" / "hair"

# face window (canvas coords) — EYES to chin: bangs may cover the forehead,
# exactly like the APC pack wigs. Narrower than the head.
FACE_CX, FACE_CY, FACE_RX, FACE_RY, FEATHER = 600, 232, 50, 48, 9
# front cap keeps rows above FADE_TOP fully, fades to nothing by FADE_BOTTOM
FADE_TOP, FADE_BOTTOM = 285, 345

GEMINI = ["fringe", "shag", "split", "spiral", "shortwave", "epic",
          "longwave", "bob", "spring", "summer", "autumn", "winter"]

yy, xx = np.mgrid[0:1800, 0:1200]
d = np.sqrt(((xx - FACE_CX) / FACE_RX) ** 2 + ((yy - FACE_CY) / FACE_RY) ** 2)
# 1 inside the window core, feathered to 0 at the rim
window = np.clip((1 + FEATHER / FACE_RY - d) / (FEATHER / FACE_RY), 0, 1)
rowfade = np.clip((FADE_BOTTOM - yy) / (FADE_BOTTOM - FADE_TOP), 0, 1)

def split(name):
    p = HAIR / f"hair_{name}.png"
    back_p = HAIR / f"hair_{name}_back.png"
    src = back_p if back_p.exists() else p      # idempotent: reuse full mass
    im = np.array(Image.open(src).convert("RGBA"))
    Image.fromarray(im).save(back_p)            # back = full hair
    front = im.copy()
    a = front[:, :, 3].astype(float)
    a *= (1 - window)                           # punch the face window
    a *= rowfade                                # fade the cap into the back mass
    front[:, :, 3] = a.astype(np.uint8)
    Image.fromarray(front).save(p)
    print(f"hair_{name}: back + front cap")

if __name__ == "__main__":
    names = sys.argv[1:] or GEMINI
    for n in names:
        split(n)
