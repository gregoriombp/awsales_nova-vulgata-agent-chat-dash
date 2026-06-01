/**
 * User agent orb states.
 *
 * Each state nudges the *animation* of the agent's orb so the user can read
 * what it's doing at a glance — like the Cortex states, but for the agent the
 * user created. Crucially, a state does NOT replace the agent's seeded color
 * identity: a green agent stays green while thinking, responding or paused. The
 * one exception is `error`, which overrides the palette to red — an agent in
 * error must be unmistakable, even at the cost of its hue (same call the Cortex
 * makes when it abandons B&W for red).
 *
 * Presets are PARTIAL: anything they don't set falls back to USER_AGENT_BASE +
 * the seeded palette in the component. `idle` is the resting / "normal" look.
 */

export type UserAgentState =
  | "idle"
  | "thinking"
  | "responding"
  | "paused"
  | "error";

export interface UserAgentStatePreset {
  speed?: number;
  scale?: number;
  complexity?: number;
  distortion?: number;
  glowIntensity?: number;
  flowFrequency?: number;
  contrast?: number;
  /** Hue rotation (rainbow sweep). Only `thinking` uses it. */
  hueSpeed?: number;
  /** `paused` (grayscale) and `error` (gray + muted red) override the palette. */
  color2?: string;
  color3?: string;
}

export const USER_AGENT_STATE_PRESETS: Record<
  UserAgentState,
  UserAgentStatePreset
> = {
  // Normal — calm breathing. The base look (keeps the agent's color).
  idle: {},
  // Processing — faster + more turbulent + brighter core, and the whole orb
  // slowly sweeps through the hue wheel (rainbow). The shape also morphs
  // (circle ↔ rounded square, gently rotating) via CSS — see AwUserAgentOrb.
  thinking: {
    speed: 0.55,
    complexity: 9,
    distortion: 1.1,
    glowIntensity: 1.45,
    flowFrequency: 3,
    hueSpeed: 0.08,
  },
  // Streaming output — lively but smooth, glow pulses up. Keeps the agent color.
  responding: {
    speed: 0.34,
    glowIntensity: 1.35,
    flowFrequency: 2.4,
  },
  // Suspended by the user — nearly frozen and dimmed, and goes grayscale.
  paused: {
    speed: 0.04,
    distortion: 0.35,
    glowIntensity: 0.55,
    color2: "#e0e0e0",
    color3: "#9a9a9a",
  },
  // Failed — slow and attention-seeking: mostly grayscale with a muted red
  // (not full alarm red), so it reads as "down" without screaming.
  error: {
    speed: 0.08,
    glowIntensity: 0.85,
    color2: "#cabfbf",
    color3: "#7c3636",
  },
};
