/**
 * Agent Core palette rule.
 *
 * Every Agent Core is filled by the Synthesis shader with three colors:
 *
 *   • color1 — ALWAYS pure white. It is the bright highlight layer of the
 *     liquid flow; keeping it white is what gives the Cores their glossy,
 *     high-key look.
 *   • color2 / color3 — two colors of the SAME hue family. The variation is
 *     **hue-zone + saturation**, never a hard color jump:
 *       – the Core's hue is its identity, spread evenly across the wheel by
 *         index (golden angle) so the whole family stays visually distinct;
 *       – color2 and color3 drift only a few degrees in hue (one tight zone),
 *         so the Core reads as a single, recognizable color;
 *       – color3 is the vivid one (high saturation) — it's what the shader's
 *         flow + center glow show most, so it carries the Core's identity;
 *         color2 is the same hue at lower saturation. Both stay bright.
 *
 * Why this shape: an earlier version varied the *hue* between color2 and
 * color3 (complementary / triadic schemes). That injected blue into half the
 * family (the complement of warm hues lands in blue/cyan) and made the static
 * gradient and the animated shader disagree — each emphasised a different end
 * of a wide hue span. Keeping both colors in one hue zone fixes both: the
 * family is distinct *between* Cores, each Core is coherent *within* itself,
 * and the CSS gradient matches the WebGL flow.
 *
 * The generator is deterministic: the same `seed` always yields the same
 * palette (stable identity, no flicker, SSR-safe — no `Math.random()` in
 * render). For a numeric seed, or a string ending in digits (e.g. "core-03"),
 * the trailing number is the index used for the even hue spread.
 */

export interface AgentCorePalette {
  /** Always `#ffffff` — the highlight layer of the Synthesis flow. */
  color1: string;
  /** Same hue as color3, lower saturation. The companion tint. */
  color2: string;
  /** The vivid, high-saturation hero — dominates the flow + center glow. */
  color3: string;
  /** The Core's hue (degrees) — its identity, even-spread across the family. */
  hue: number;
  /** color2 saturation (%) — the lower of the two. */
  sat2: number;
  /** color3 saturation (%) — the higher of the two. */
  sat3: number;
}

// ── Rule constants (tweak these to retune the whole family) ──────────────────
// True golden angle. This exact value is what maximises the spread: any other
// angle (e.g. 124.5°) eventually lands on a small cycle — 124.5×3 ≈ 360, so
// every 3rd agent repeats a hue. 137.50776° never repeats, so the family stays
// distinct for as many agents as you add.
const GOLDEN_ANGLE = 137.50776405; // even, low-discrepancy hue spread by index
const HUE_DRIFT_MIN = 8; // color3 sits this many degrees off color2 …
const HUE_DRIFT_MAX = 30; // … up to here — a tight, single-hue zone
const SAT_SOFT_MIN = 10; // color2: lower saturation (companion)
const SAT_SOFT_MAX = 70;
const SAT_VIVID_MIN = 20; // color3: high saturation (hero)
const SAT_VIVID_MAX = 100;
const LIGHT_SOFT_MIN = 90; // both stay bright …
const LIGHT_SOFT_MAX = 100; // … color2 a touch lighter (it's less saturated)
const LIGHT_VIVID_MIN = 55;
const LIGHT_VIVID_MAX = 60;

// ── Deterministic RNG ────────────────────────────────────────────────────────
// FNV-1a hash → mulberry32. Tiny, dependency-free, stable across server/client.

function hashSeed(seed: string | number): number {
  const str = String(seed);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Index used for the even hue spread: numeric seed, trailing digits, or hash. */
function indexFromSeed(seed: string | number): number {
  if (typeof seed === "number" && Number.isFinite(seed)) return Math.floor(seed);
  const match = String(seed).match(/(\d+)\s*$/);
  if (match) return parseInt(match[1], 10);
  return hashSeed(seed);
}

// ── HSL → hex ────────────────────────────────────────────────────────────────
// We compose in HSL because the rule is expressed in hue/saturation/lightness.

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const c = lig - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

const lerp = (min: number, max: number, t: number) => min + (max - min) * t;
const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Raw HSL components a seed resolves to — shared by the palette and the mesh. */
interface AgentHsl {
  hue: number;
  drift: number;
  sat2: number;
  lig2: number;
  sat3: number;
  lig3: number;
}

// Draws in a fixed order so the palette and the mesh always agree for a seed.
// Subtle, deterministic per-agent variation — keeps the family organic without
// ever leaving the hue zone.
function deriveAgent(seed: string | number): AgentHsl {
  const hue = (((indexFromSeed(seed) * GOLDEN_ANGLE) % 360) + 360) % 360;
  const rnd = mulberry32(hashSeed(seed));
  return {
    hue,
    drift: lerp(HUE_DRIFT_MIN, HUE_DRIFT_MAX, rnd()),
    sat2: lerp(SAT_SOFT_MIN, SAT_SOFT_MAX, rnd()),
    lig2: lerp(LIGHT_SOFT_MIN, LIGHT_SOFT_MAX, rnd()),
    sat3: lerp(SAT_VIVID_MIN, SAT_VIVID_MAX, rnd()),
    lig3: lerp(LIGHT_VIVID_MIN, LIGHT_VIVID_MAX, rnd()),
  };
}

/**
 * Generate an Agent palette from a stable seed.
 *
 * @param seed Anything that identifies the agent (id string, index, etc.).
 *   The same seed always returns the same palette. A numeric seed or a string
 *   ending in digits (e.g. `"agent-03"`) uses that number as the family index
 *   for the even hue spread.
 */
export function agentCorePalette(seed: string | number): AgentCorePalette {
  const { hue, drift, sat2, lig2, sat3, lig3 } = deriveAgent(seed);
  return {
    color1: "#ffffff",
    color2: hslToHex(hue, sat2, lig2),
    color3: hslToHex(hue + drift, sat3, lig3),
    hue: Math.round(hue),
    sat2: Math.round(sat2),
    sat3: Math.round(sat3),
  };
}

/**
 * A multi-stop gradient *mesh* for the static orb — the flat white→color2→color3
 * linear gradient reads nothing like the animated version, which (through the
 * flow + glow + smoothstep) shows a much wider spread: white highlights, the
 * vivid hero, soft mids, deep recesses and a touch of a neighbouring hue. This
 * fakes that with layered radial gradients (front → back), all derived from the
 * same seed so it matches the agent's animated colors. Deterministic / SSR-safe.
 */
export function agentMeshBackground(seed: string | number): string {
  const { hue, drift, sat2, lig2, sat3, lig3 } = deriveAgent(seed);
  const h3 = hue + drift;
  const hsla = (h: number, s: number, l: number, a: number) =>
    `hsla(${Math.round((((h % 360) + 360) % 360))}, ${Math.round(clamp(s))}%, ${Math.round(clamp(l))}%, ${a})`;

  const vivid = hsla(h3, sat3, lig3, 1);
  const vividOut = hsla(h3, sat3, lig3, 0);
  const soft = hsla(hue, sat2, lig2, 1);
  const pale = hsla(hue, Math.max(sat2 * 0.5, 28), 93, 1);
  const paleOut = hsla(hue, Math.max(sat2 * 0.5, 28), 93, 0);
  const accent = hsla(hue - 32, Math.max(sat3 * 0.7, 45), 62, 1);
  const accentOut = hsla(hue - 32, Math.max(sat3 * 0.7, 45), 62, 0);
  const deep = hsla(h3, Math.min(sat3 + 12, 100), lig3 * 0.55, 1);
  const deepOut = hsla(h3, Math.min(sat3 + 12, 100), lig3 * 0.55, 0);

  return [
    "radial-gradient(60% 60% at 30% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 45%)",
    `radial-gradient(55% 55% at 72% 22%, ${pale} 0%, ${paleOut} 50%)`,
    `radial-gradient(65% 65% at 82% 66%, ${accent} 0%, ${accentOut} 55%)`,
    `radial-gradient(72% 72% at 26% 70%, ${vivid} 0%, ${vividOut} 58%)`,
    `radial-gradient(110% 110% at 58% 96%, ${deep} 0%, ${deepOut} 70%)`,
    `linear-gradient(145deg, ${soft} 0%, ${vivid} 55%, ${deep} 100%)`,
  ].join(", ");
}

/**
 * Convenience for runtime, client-only contexts that genuinely want a fresh
 * palette on each call (e.g. previewing a brand-new Core before it gets a
 * persistent id). Do NOT use this during SSR/render — it is non-deterministic
 * and will cause hydration mismatches. For anything rendered, pass a stable
 * `seed` to {@link agentCorePalette} instead.
 */
export function randomAgentCorePalette(): AgentCorePalette {
  return agentCorePalette(Math.floor(Math.random() * 1e9));
}
