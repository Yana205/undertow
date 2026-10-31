// Layer engine: a fixed stack of <img> layers driven by data.js.
// No anchor math — every asset is a full-canvas 1200x1800 PNG.

import { SLOTS, SLOT_LAYER, ITEMS } from "./data.js?v=11";

const layers = {};      // layer name -> <img>
const equipped = {};    // wardrobe slot -> item
let equipOrder = [];    // items in the order they were equipped
let equipCb = null;

export function initStage(el) {
  el.replaceChildren();
  // bg and fx live on the stage; everything body-related lives inside the
  // #doll wrapper, which carries the one idle animation — hair, clothes and
  // body move as a single object and can never slide against each other.
  const doll = document.createElement("div");
  doll.id = "doll";
  SLOTS.forEach((name, i) => {
    const img = document.createElement("img");
    img.className = `layer layer-${name}`;
    img.alt = "";
    img.draggable = false;
    img.hidden = true;
    img.style.zIndex = String(i + 1); // explicit paint order; never rely on DOM-order stacking
    (name === "bg" || name === "fx" ? el : doll).appendChild(img);
    layers[name] = img;
  });
  el.appendChild(doll);
}

function setLayer(name, src) {
  const img = layers[name];
  if (!src) {
    img.hidden = true;
    img.removeAttribute("src");
    return;
  }
  img.onerror = () => { console.warn(`missing layer image: ${src}`); img.hidden = true; };
  img.src = src;
  img.hidden = false;
}

export function setBase(tail) {
  setLayer("base", tail.src);
}

export function setBackground(src) {
  setLayer("bg", src);
}

export function equip(item) {
  const prev = equipped[item.slot];
  if (prev) equipOrder = equipOrder.filter((i) => i !== prev);
  equipped[item.slot] = item;
  equipOrder.push(item);
  setLayer(SLOT_LAYER[item.slot], item.src);
  if (item.slot === "hair") {
    const back = item.src.replace(".png", "_back.png");
    if (item.hasBack) setLayer("hair_back", back);
    else setLayer("hair_back", null);
  }
  equipCb?.(item, item.slot);
}

export function unequip(slot) {
  const prev = equipped[slot];
  if (!prev) return;
  delete equipped[slot];
  equipOrder = equipOrder.filter((i) => i !== prev);
  setLayer(SLOT_LAYER[slot], null);
  if (slot === "hair") setLayer("hair_back", null);
  equipCb?.(null, slot);
}

export function resetEquips() {
  for (const slot of Object.keys(equipped)) {
    delete equipped[slot];
    setLayer(SLOT_LAYER[slot], null);
  }
  setLayer("hair_back", null);
  equipOrder = [];
}

export function getEquipped(slot) {
  return equipped[slot] ?? null;
}

// Vibe strings in equip order, cosmetic (null-vibe) items filtered — feeds tally().
export function equippedVibes() {
  return equipOrder.map((i) => i.vibe).filter(Boolean);
}

// Any equipped hero item (the locket) — feeds resolveEnding().
export function hasHero() {
  return equipOrder.some((i) => i.hero);
}

export function onEquip(cb) {
  equipCb = cb;
}

export function preload(urls) {
  return Promise.all(
    urls.map((u) => {
      const img = new Image();
      img.src = u;
      return img.decode().catch(() => console.warn(`preload failed: ${u}`));
    })
  );
}

export function preloadAll() {
  return preload(ITEMS.flatMap((i) => [i.src, i.thumb]));
}
