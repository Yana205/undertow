// Game flow: TITLE → TAIL_SELECT → DRESSING → ASHORE → ENDING.

import { ITEMS, TAILS, WARDROBE_SLOTS, VIBE_ICONS, ENDINGS } from "./data.js?v=6";
import * as engine from "./engine.js?v=6";
import * as watcher from "./watcher.js?v=6";
import { playChime, playAmbient, playStinger } from "./audio.js?v=6";
import { startAmbientLife, settle, ENDING_GRADE, ENDING_POSE } from "./juice.js?v=6";
import { SLOT_LAYER } from "./data.js?v=6";
import { resolveBias, tally, resolveEnding } from "./vibes.js?v=6";

const $ = (sel) => document.querySelector(sel);
const overlay = $("#overlay");

let state = "TITLE";
let biasVibe = "memory";
let currentTail = null;
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
      if (state !== "DRESSING") return;
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
  // The displayed lead comes from the player's own items only —
  // the tail's hidden vote must never leak into the UI.
  const own = engine.equippedVibes();
  const counts = { tide: 0, masque: 0, memory: 0 };
  for (const v of own) counts[v]++;
  const max = Math.max(counts.tide, counts.masque, counts.memory);
  const lead = max > 0 ? [...own].reverse().find((v) => counts[v] === max) : null;
  for (const vibe of ["tide", "masque", "memory"]) {
    const s = document.createElement("span");
    s.textContent = `${VIBE_ICONS[vibe]} ${counts[vibe]}`;
    if (lead === vibe) s.className = "lead";
    el.appendChild(s);
  }
  return t;
}

// ---- overlay screens ----
function showOverlay(...children) {
  overlay.replaceChildren(...children);
  overlay.classList.toggle("title", state === "TITLE");
  overlay.hidden = false;
}

function el(tag, props = {}, text = "") {
  const n = document.createElement(tag);
  Object.assign(n, props);
  if (text) n.textContent = text;
  return n;
}

function showTitle() {
  state = "TITLE";
  const h1 = el("h1", {}, "UNDERTOW");
  const p = el("p", {}, "Once a year, on Halloween night, the sea lets her walk ashore. " +
    "Tonight there is a bonfire on the beach — and he is there. Dress for the party. " +
    "What she wears writes what the night becomes.");
  const btn = el("button", { className: "primary" }, "Begin");
  btn.addEventListener("click", () => { playAmbient(); showTailSelect(); }, { once: true });
  showOverlay(h1, p, btn);
}

function showTailSelect() {
  state = "TAIL_SELECT";
  const h = el("h1", {}, "The Tide You Rise On");
  const p = el("p", {}, "Choose the sea that made her this year.");
  const row = el("div", { className: "tails" });
  for (const tail of TAILS) {
    const b = el("button", {}, tail.id.replace("_", " "));
    b.style.backgroundImage = `url(${tail.src})`;
    b.addEventListener("click", () => startDressing(tail));
    row.appendChild(b);
  }
  showOverlay(h, p, row);
}

function startDressing(tail) {
  state = "DRESSING";
  currentTail = tail;
  biasVibe = resolveBias(tail.id);
  engine.resetEquips();
  watcher.resetWatcher();
  engine.setBase(tail);
  $("#stage").style.filter = tail.palette.grade;
  overlay.hidden = true;
  $("#wardrobe").hidden = false;
  $("#ashore").hidden = false;
  currentSlot = "hair";
  buildTabs();
  buildThumbs();
  renderTally();
  startAmbientLife($("#stage-wrap"));
}

function walkAshore() {
  if (state !== "DRESSING") return;
  state = "ASHORE";
  const t = tally(engine.equippedVibes(), biasVibe);
  const key = resolveEnding(t.dominant, engine.hasHero());
  // the reveal: push in to the shore, grade the night, let him turn
  $("#wardrobe").hidden = true;
  $("#stage-wrap").classList.add("reveal");
  $("#stage").style.filter = `${currentTail.palette.grade} ${ENDING_GRADE[key]}`;
  watcher.setTier(ENDING_POSE[key]);
  setTimeout(() => showEnding(key, t.dominant), 1900);
}

function showEnding(key, dominant) {
  state = "ENDING";
  playStinger(key);
  const e = ENDINGS[key];
  const h = el("h1", {}, e.title);
  const parts = [h];
  for (const line of e.lines) parts.push(el("p", {}, line));
  if (key === "found") parts.push(el("p", {}, "✦ the secret ending ✦"));
  const again = el("button", { className: "primary" }, "Another Halloween");
  again.addEventListener("click", resetGame, { once: true });
  parts.push(again);
  showOverlay(...parts);
}

function resetGame() {
  engine.resetEquips();
  $("#wardrobe").hidden = true;
  $("#ashore").hidden = true;
  $("#stage").style.filter = "";
  $("#stage-wrap").classList.remove("reveal");
  renderTally();
  showTailSelect();
}

// ---- boot ----
engine.initStage($("#stage"));
engine.setBackground("assets/bg/shore.png");
watcher.initWatcher($("#watcher-wrap"));
engine.onEquip((item, slot) => {
  const t = renderTally();
  if (item) {
    settle(document.querySelector(`.layer-${SLOT_LAYER[slot]}`));
    if (item.vibe) {
      watcher.react(item.vibe);
      playChime(item.vibe);
    }
  }
  watcher.setTier(t.dominant);
});
$("#ashore").addEventListener("click", walkAshore);
document.addEventListener("keydown", (ev) => {
  if (state === "ENDING" && (ev.key === "r" || ev.key === "R")) resetGame();
});
showTitle();
engine.preloadAll();

// expose for manual browser testing
window.__state = {
  engine,
  get bias() { return biasVibe; },
  get state() { return state; },
  get tail() { return currentTail?.id; },
};
