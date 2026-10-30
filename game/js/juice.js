// Ambient life: bubbles below the waterline, fire sparks above,
// equip-settle animation hook, and the ending grade presets.

const WATERLINE = 0.35; // matches the stage gradient break

export function startAmbientLife(stageWrap) {
  stopAmbientLife();
  const mk = (cls, styles) => {
    const d = document.createElement("div");
    d.className = cls;
    Object.assign(d.style, styles);
    stageWrap.appendChild(d);
    return d;
  };
  for (let i = 0; i < 7; i++) {
    mk("bubble", {
      left: `${18 + Math.random() * 60}%`,
      width: `${4 + Math.random() * 9}px`,
      height: `${4 + Math.random() * 9}px`,
      animationDuration: `${7 + Math.random() * 7}s`,
      animationDelay: `${Math.random() * 8}s`,
    });
  }
  for (let i = 0; i < 5; i++) {
    mk("spark", {
      left: `${64 + Math.random() * 16}%`,
      top: `${WATERLINE * 100 - 6 - Math.random() * 6}%`,
      animationDuration: `${2.2 + Math.random() * 2.4}s`,
      animationDelay: `${Math.random() * 3}s`,
    });
  }
}

export function stopAmbientLife() {
  document.querySelectorAll(".bubble, .spark").forEach((n) => n.remove());
}

// Pop the layer an item just landed on.
export function settle(layerImg) {
  if (!layerImg) return;
  layerImg.classList.remove("pop");
  void layerImg.offsetWidth;
  layerImg.classList.add("pop");
}

// Per-ending stage grades, layered on top of the tail's own grade.
export const ENDING_GRADE = {
  sea_rises: "saturate(0.7) brightness(0.72) hue-rotate(-12deg)",
  perfect_night: "saturate(1.1) brightness(1.05) sepia(0.12)",
  almost: "saturate(0.55) brightness(0.85)",
  found: "saturate(1.15) brightness(1.1) sepia(0.2)",
};

// The watcher's final posture per ending.
export const ENDING_POSE = {
  sea_rises: "tide",
  perfect_night: "masque",
  almost: "memory",
  found: "memory",
};
