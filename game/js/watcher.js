// The man on the shore. He reacts to every item without knowing why.
// Three posture tiers (crossfaded sprites) + per-item micro-reactions (CSS tweens).

const TIER_BY_VIBE = { tide: "uneasy", masque: "at_ease", memory: "stirred" };
const SPRITES = {
  uneasy: "assets/watcher/uneasy.png",
  at_ease: "assets/watcher/at_ease.png",
  stirred: "assets/watcher/stirred.png",
};

let wrap = null;
let imgs = {};
let currentTier = "at_ease";
let reactTimer = 0;

export function initWatcher(el) {
  wrap = el;
  el.replaceChildren();
  for (const [tier, src] of Object.entries(SPRITES)) {
    const img = new Image();
    img.src = src;
    img.alt = "";
    img.draggable = false;
    img.className = "watcher-pose";
    img.style.opacity = tier === currentTier ? "1" : "0";
    img.onerror = () => { console.warn(`missing watcher sprite: ${src}`); img.style.opacity = "0"; };
    el.appendChild(img);
    imgs[tier] = img;
  }
}

export function setTier(dominantVibe) {
  const tier = TIER_BY_VIBE[dominantVibe] ?? "at_ease";
  if (tier === currentTier) return;
  currentTier = tier;
  for (const [t, img] of Object.entries(imgs)) {
    img.style.opacity = t === tier ? "1" : "0";
  }
}

export function react(vibe) {
  if (!wrap || !vibe) return;
  wrap.classList.remove("react-tide", "react-masque", "react-memory");
  // restart the animation even for repeated vibes
  void wrap.offsetWidth;
  wrap.classList.add(`react-${vibe}`);
  clearTimeout(reactTimer);
  reactTimer = setTimeout(
    () => wrap.classList.remove("react-tide", "react-masque", "react-memory"),
    700
  );
}

export function resetWatcher() {
  currentTier = "at_ease";
  for (const [t, img] of Object.entries(imgs)) {
    img.style.opacity = t === "at_ease" ? "1" : "0";
  }
  wrap?.classList.remove("react-tide", "react-masque", "react-memory");
}
