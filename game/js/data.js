// All game content. Array order inside SLOTS is the stage z-order.

export const SLOTS = ["bg", "hair_back", "base", "skirt", "top", "neck", "hair_front", "head", "held", "fx"];

// UI wardrobe tabs (hair items render on the hair_front layer; a matching
// *_back.png, when it exists, is added on hair_back automatically).
export const WARDROBE_SLOTS = ["hair", "top", "skirt", "neck", "head"];
export const SLOT_LAYER = { hair: "hair_front", top: "top", skirt: "skirt", neck: "neck", head: "head", held: "held" };

export const TAILS = [
  { id: "oceanic",      bias: "memory", src: "assets/bases/oceanic.png",
    palette: { grade: "hue-rotate(0deg) saturate(1)",            tint: "#355a70" } },
  { id: "pearlescent",  bias: "masque", src: "assets/bases/pearlescent.png",
    palette: { grade: "hue-rotate(-10deg) saturate(1.05) brightness(1.06)", tint: "#8f7fa8" } },
  { id: "deep_current", bias: "tide",   src: "assets/bases/deep_current.png",
    palette: { grade: "hue-rotate(8deg) saturate(1.15) brightness(0.92)",   tint: "#242940" } },
  { id: "reef",         bias: "wild",   src: "assets/bases/reef.png",
    palette: { grade: "sepia(0.18) saturate(1.1)",               tint: "#4a523a" } },
];

const hair = (id, vibe) => ({
  id: `hair_${id}`, slot: "hair", vibe,
  src: `assets/hair/hair_${id}.png`, thumb: `assets/thumbs/hair_${id}.webp`,
});

const apc = (id, slot, vibe, extra = {}) => ({
  id, slot, vibe, src: `assets/items/${id}.png`, thumb: `assets/thumbs/${id}.webp`, ...extra,
});

export const ITEMS = [
  // 12 Gemini hairs (hers from the sea)
  hair("fringe", "tide"), hair("shag", "tide"), hair("split", "memory"), hair("spiral", "masque"),
  hair("shortwave", "masque"), hair("epic", "tide"), hair("longwave", "memory"), hair("bob", "masque"),
  hair("spring", "masque"), hair("summer", "memory"), hair("autumn", "tide"), hair("winter", "memory"),
  // 4 APC hairs (from her human life)
  apc("hair_apc_black", "hair", "tide"),
  apc("hair_apc_brunette", "hair", "memory"),
  apc("hair_apc_blonde", "hair", "masque"),
  apc("hair_apc_pink", "hair", "masque"),

  // Her human wardrobe (the APC pack IS the closet she left behind)
  apc("top_shirt1", "top", "masque"),
  apc("top_sweater", "top", "memory"),   // his old sweater
  apc("top_shirt3", "top", "tide"),
  apc("dress_ruffle", "top", "masque"),  // a dress for a party
  apc("dress_dark", "top", "tide"),
  apc("skirt_plaid", "skirt", "memory"), // the skirt she wore back then
  apc("skirt_soft", "skirt", "masque"),
  apc("locket", "neck", "memory", { hero: true }), // the one thing the curse let her keep
  apc("head_bows", "head", "masque"),
];

export const VIBE_ICONS = { tide: "🌊", masque: "🎭", memory: "🕯" };

export const ENDINGS = {
  sea_rises: {
    title: "The Sea Rises",
    lines: ["The curse does what it was made to do: it hides her.",
            "From the black water she watches the bonfire gutter out — and a cold hand finds hers."],
  },
  perfect_night: {
    title: "One Perfect Night",
    lines: ["He dances till dawn with the one he has searched years for — and never knows.",
            "The tide calls her home. He keeps the seashell she dropped."],
  },
  almost: {
    title: "Almost",
    lines: ["All night he stares, a word on the tip of his tongue.",
            "Dawn breaks. The moment dies."],
  },
  found: {
    title: "Found",
    lines: ["A wave catches her — the locket swings into the firelight. The twin of his own.",
            "He looks from the locket to her face… and finds her."],
  },
};
