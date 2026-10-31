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
      left: `${12 + Math.random() * 14}%`,
      top: `${WATERLINE * 100 - 6 - Math.random() * 6}%`,
      animationDuration: `${2.2 + Math.random() * 2.4}s`,
      animationDelay: `${Math.random() * 3}s`,
    });
  }
}

export function stopAmbientLife() {
  document.querySelectorAll(".bubble, .spark").forEach((n) => n.remove());
}

// Pop the layer an item just landed on, then hand the layer back to its
// idle animation once the pop finishes.
export function settle(layerImg) {
  if (!layerImg) return;
  layerImg.classList.remove("pop");
  void layerImg.offsetWidth;
  layerImg.classList.add("pop");
  layerImg.addEventListener(
    "animationend",
    (ev) => { if (ev.animationName === "equip-pop") layerImg.classList.remove("pop"); },
    { once: true }
  );
}

// Tops materialize: left and right halves drift in and meet at the center.
export function settleTop(layerImg) {
  if (!layerImg) return;
  const parent = layerImg.parentElement;
  layerImg.style.visibility = "hidden";
  const halves = ["L", "R"].map((side) => {
    const c = layerImg.cloneNode();
    c.style.visibility = "visible";
    c.style.clipPath = side === "L" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)";
    parent.appendChild(c);
    c.animate(
      [
        { transform: `translateX(${side === "L" ? -46 : 46}px)`, opacity: 0, filter: "brightness(1.7)" },
        { transform: "translateX(0)", opacity: 1, filter: "brightness(1)" },
      ],
      { duration: 540, easing: "cubic-bezier(0.25, 0.9, 0.3, 1)", fill: "forwards" }
    );
    return c;
  });
  setTimeout(() => {
    layerImg.style.visibility = "";
    halves.forEach((c) => c.remove());
  }, 620);
}

// Hair flows into being from the crown down, with a soft sway as it lands.
export function settleHair(layerImg) {
  if (!layerImg) return;
  layerImg.classList.remove("pop", "pop-hair");
  void layerImg.offsetWidth;
  layerImg.classList.add("pop-hair");
  layerImg.addEventListener(
    "animationend",
    (ev) => { if (ev.animationName === "equip-hair") layerImg.classList.remove("pop-hair"); },
    { once: true }
  );
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
