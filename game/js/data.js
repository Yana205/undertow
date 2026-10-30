// All game content. Array order inside SLOTS is the stage z-order.

export const SLOTS = ["bg", "hair_back", "base", "top", "neck", "hair_front", "head", "held", "fx"];

// UI wardrobe tabs (hair items render on the hair_front layer; a matching
// *_back.png, when it exists, is added on hair_back automatically).
export const WARDROBE_SLOTS = ["hair", "top", "neck", "head", "held"];
export const SLOT_LAYER = { hair: "hair_front", top: "top", neck: "neck", head: "head", held: "held" };

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

export const ITEMS = [
  // 12 finished hairs (free vibe carriers)
  hair("fringe", "tide"), hair("shag", "tide"), hair("split", "memory"), hair("spiral", "masque"),
  hair("shortwave", "masque"), hair("epic", "tide"), hair("longwave", "memory"), hair("bob", "masque"),
  hair("spring", "masque"), hair("summer", "memory"), hair("autumn", "tide"), hair("winter", "memory"),

  // Placeholder wearables until the Gemini batches land (Task 7 swaps srcs)
  { id: "top_kelp",   slot: "top",  vibe: "tide",   src: "assets/items/top_kelp.png",   thumb: "assets/thumbs/top_kelp.webp" },
  { id: "top_party",  slot: "top",  vibe: "masque", src: "assets/items/top_party.png",  thumb: "assets/thumbs/top_party.webp" },
  { id: "top_scarf",  slot: "top",  vibe: "memory", src: "assets/items/top_scarf.png",  thumb: "assets/thumbs/top_scarf.webp" },
  { id: "neck_fang",  slot: "neck", vibe: "tide",   src: "assets/items/neck_fang.png",  thumb: "assets/thumbs/neck_fang.webp" },
  { id: "neck_beads", slot: "neck", vibe: "masque", src: "assets/items/neck_beads.png", thumb: "assets/thumbs/neck_beads.webp" },
  { id: "locket",     slot: "neck", vibe: "memory", src: "assets/items/locket.png",     thumb: "assets/thumbs/locket.webp", hero: true },
  { id: "head_coral", slot: "head", vibe: "tide",   src: "assets/items/head_coral.png", thumb: "assets/thumbs/head_coral.webp" },
  { id: "head_mask",  slot: "head", vibe: "masque", src: "assets/items/head_mask.png",  thumb: "assets/thumbs/head_mask.webp" },
  { id: "head_ribbon",slot: "head", vibe: "memory", src: "assets/items/head_ribbon.png",thumb: "assets/thumbs/head_ribbon.webp" },
  { id: "held_lantern",  slot: "held", vibe: "tide",   src: "assets/items/held_lantern.png",  thumb: "assets/thumbs/held_lantern.webp" },
  { id: "held_maskstick",slot: "held", vibe: "masque", src: "assets/items/held_maskstick.png", thumb: "assets/thumbs/held_maskstick.webp" },
  { id: "held_shell",    slot: "held", vibe: "memory", src: "assets/items/held_shell.png",    thumb: "assets/thumbs/held_shell.webp" },
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
