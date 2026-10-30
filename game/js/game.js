// Game flow. Task 3 scope: boot straight into DRESSING with a default tail.
// Task 4 adds TITLE → TAIL_SELECT → ASHORE → ENDING around it.

import { ITEMS, TAILS, WARDROBE_SLOTS, VIBE_ICONS } from "./data.js";
import * as engine from "./engine.js";
import { resolveBias, tally } from "./vibes.js";

const $ = (sel) => document.querySelector(sel);

let biasVibe = "memory";
let currentSlot = "hair";

// ---- wardrobe UI ----
function buildTabs() {
  const nav = $("#slot-tabs");
  nav.replaceChildren();
  for (const slot of WARDROBE_SLOTS) {
    const b = document.createElement("button");
    b.textContent = slot;
    b.dataset.slot = slot;
    b.setAttribute("aria-selected", String(slot === currentSlot));
    b.addEventListener("click", () => { currentSlot = slot; buildTabs(); buildThumbs(); });
    nav.appendChild(b);
  }
}

function buildThumbs() {
  const grid = $("#thumbs");
  grid.replaceChildren();
  for (const item of ITEMS.filter((i) => i.slot === currentSlot)) {
    const d = document.createElement("div");
    d.className = "thumb";
    d.dataset.item = item.id;
    if (item.hero) d.classList.add("hero");
    if (engine.getEquipped(item.slot) === item) d.classList.add("equipped");
    const img = new Image();
    img.src = item.thumb;
    img.alt = item.id;
    img.onerror = () => { img.remove(); d.append(item.id); };
    const v = document.createElement("span");
    v.className = "vibe";
    v.textContent = VIBE_ICONS[item.vibe] ?? "";
    d.append(img, v);
    d.addEventListener("click", () => {
      if (engine.getEquipped(item.slot) === item) engine.unequip(item.slot);
      else engine.equip(item);
      buildThumbs();
    });
    grid.appendChild(d);
  }
}

function renderTally() {
  const t = tally(engine.equippedVibes(), biasVibe);
  const el = $("#tally");
  el.replaceChildren();
  for (const vibe of ["tide", "masque", "memory"]) {
    const s = document.createElement("span");
    // Shown counts are the player's own items only — the tail's vote stays hidden.
    const own = engine.equippedVibes().filter((v) => v === vibe).length;
    s.textContent = `${VIBE_ICONS[vibe]} ${own}`;
    if (t.dominant === vibe) s.className = "lead";
    el.appendChild(s);
  }
  return t;
}

// ---- boot (Task 3: straight into dressing) ----
function startDressing(tail) {
  biasVibe = resolveBias(tail.id);
  engine.setBase(tail);
  $("#wardrobe").hidden = false;
  $("#ashore").hidden = false;
  buildTabs();
  buildThumbs();
  renderTally();
}

engine.initStage($("#stage"));
engine.onEquip(() => renderTally());
engine.preloadAll().then(() => {
  $("#overlay").hidden = true;
  startDressing(TAILS[2]); // deep_current while flow is unbuilt
});

// expose for manual browser testing
window.__state = { engine, get bias() { return biasVibe; } };
