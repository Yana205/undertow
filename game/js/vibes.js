// Pure scoring logic for Undertow. No DOM. Tested in tests/vibes.test.mjs.

export const VIBES = ["tide", "masque", "memory"];

const TAIL_BIAS = {
  deep_current: "tide",
  pearlescent: "masque",
  oceanic: "memory",
};

// Reef is the wildcard tribe: its bias is rolled once per night (per run).
export function resolveBias(tailId, rand = Math.random) {
  const fixed = TAIL_BIAS[tailId];
  if (fixed) return fixed;
  return VIBES[Math.min(2, Math.floor(rand() * 3))];
}

// equippedVibes: vibe strings in equip order (nulls filtered by caller).
// The tail bias adds one silent vote. Dominant vibe wins. On a tie, the
// player's visible choices outrank the hidden bias: the most recently
// equipped item's vibe among the tied wins; the bias decides only when
// no equipped item is among the tied (e.g. a naked walk-ashore).
export function tally(equippedVibes, biasVibe) {
  const counts = { tide: 0, masque: 0, memory: 0 };
  for (const v of equippedVibes) counts[v]++;
  counts[biasVibe]++;
  const top = Math.max(...VIBES.map((v) => counts[v]));
  const tied = VIBES.filter((v) => counts[v] === top);
  let dominant = tied[0];
  if (tied.length > 1) {
    const lastEquipped = [...equippedVibes].reverse().find((v) => tied.includes(v));
    dominant = lastEquipped ?? (tied.includes(biasVibe) ? biasVibe : tied[0]);
  }
  return { counts, dominant };
}

// The locket gate: memory needs the hero item to become the secret ending.
export function resolveEnding(dominant, hasHero) {
  if (dominant === "tide") return "sea_rises";
  if (dominant === "masque") return "perfect_night";
  return hasHero ? "found" : "almost";
}
