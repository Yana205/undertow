#!/usr/bin/env python3
"""Bake the three seamless tiles the Cartoon Water shader samples:
water tile, displacement noise, specular noise. FFT low-pass noise is
perfectly tileable. Committed as repo assets — nothing generated at runtime."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "game" / "assets" / "water"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
N = 256

def tileable_noise(cutoff, seed_shift=0):
    f = np.fft.fft2(rng.normal(size=(N, N)))
    fy = np.fft.fftfreq(N)[:, None]
    fx = np.fft.fftfreq(N)[None, :]
    mask = np.sqrt(fx * fx + fy * fy) < cutoff
    v = np.real(np.fft.ifft2(f * mask))
    v = (v - v.min()) / (v.max() - v.min())
    return v

# displacement: RGB low-frequency noise
disp = np.dstack([tileable_noise(0.03) for _ in range(3)])
Image.fromarray((disp * 255).astype(np.uint8)).save(OUT / "displacement.png")

# specular: tighter grayscale noise (the sparkle source)
spec = tileable_noise(0.09)
g = (spec * 255).astype(np.uint8)
Image.fromarray(np.dstack([g, g, g])).save(OUT / "specular.png")

# water tile: low-freq noise posterized into 4 night-sea blues (cartoon bands)
w = tileable_noise(0.02)
bands = np.digitize(w, [0.35, 0.55, 0.75])
palette = np.array([
    [10, 24, 38],   # deep
    [14, 34, 52],
    [20, 46, 68],
    [32, 64, 88],   # crest
], dtype=np.uint8)
tile = palette[bands]
Image.fromarray(tile).save(OUT / "water.png")
print("water textures baked:", [p.name for p in sorted(OUT.iterdir())])
