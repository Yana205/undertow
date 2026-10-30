import test from "node:test";
import assert from "node:assert/strict";
import { resolveBias, tally, resolveEnding } from "../game/js/vibes.js";

test("naked walk-ashore: bias alone decides", () => {
  assert.equal(tally([], "memory").dominant, "memory");
});

test("plain majority wins", () => {
  assert.equal(tally(["tide", "tide", "masque"], "memory").dominant, "tide");
});

test("bias breaks a tie it belongs to", () => {
  assert.equal(tally(["tide", "masque"], "masque").dominant, "masque");
});

test("bias not among tied: last-equipped wins", () => {
  assert.equal(tally(["tide", "masque"], "memory").dominant, "masque");
});

test("last-equipped tie-break respects equip order", () => {
  assert.equal(tally(["masque", "tide"], "memory").dominant, "tide");
});

test("bias counts as +1 vote", () => {
  assert.deepEqual(tally(["tide"], "tide").counts, { tide: 2, masque: 0, memory: 0 });
});

test("fixed tail biases", () => {
  assert.equal(resolveBias("deep_current"), "tide");
  assert.equal(resolveBias("pearlescent"), "masque");
  assert.equal(resolveBias("oceanic"), "memory");
});

test("reef is a wildcard, deterministic under injected rand", () => {
  assert.equal(resolveBias("reef", () => 0.1), "tide");
  assert.equal(resolveBias("reef", () => 0.5), "masque");
  assert.equal(resolveBias("reef", () => 0.9), "memory");
});

test("ending resolution", () => {
  assert.equal(resolveEnding("tide", false), "sea_rises");
  assert.equal(resolveEnding("masque", true), "perfect_night");
  assert.equal(resolveEnding("memory", false), "almost");
  assert.equal(resolveEnding("memory", true), "found");
});
