"use client";

import { type HTMLAttributes, useMemo } from "react";
import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis";
import { agentCorePalette, agentMeshBackground } from "@/lib/agent-core-palette";
import {
  USER_AGENT_STATE_PRESETS,
  type UserAgentState,
} from "@/lib/user-agent-presets";
import { cn } from "@/lib/utils";

// Standard look of a user agent orb: animated, colored, circular. `bg` is never
// actually visible — the shader paints the whole plane opaque — but we keep it
// black for parity with the Cortex. These knobs (low distortion + high glow)
// are the tuned "living orb" look shared with the Cortex motor.
const USER_AGENT_BASE = {
  speed: 0.22,
  scale: 2.2,
  complexity: 8,
  distortion: 0.6,
  glowIntensity: 1.15,
  flowFrequency: 2,
  contrast: 1.15,
  bg: "#000000",
} as const;

// Very subtle inner glow that softens the hard canvas edge into a luminous rim
// (no border/stroke). Tune the alpha here to taste.
const INNER_GLOW = "inset 0 0 8px 1px rgba(255,255,255,0.20)";

export interface AwUserAgentOrbProps {
  /**
   * Stable identity for the palette. Same seed → same colors (SSR-safe).
   * Pass the agent's id/name. Defaults to a single shared seed.
   */
  seed?: string | number;
  /** What the agent is doing — nudges the animation (see USER_AGENT_STATE_PRESETS). */
  state?: UserAgentState;
  /** Diameter in px. */
  size?: number;
  className?: string;
  // ── Shader overrides ──────────────────────────────────────────────────────
  // Palette is seeded and the state preset tunes the motion; pass these only
  // for debug / branding. `color1` is NOT overridable — the rule fixes it white.
  // `hueSpeed` is intentionally preset-only (no prop) so callers can't rainbow
  // a non-thinking orb — only the `thinking` preset sets it.
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  complexity?: number;
  distortion?: number;
  glowIntensity?: number;
  flowFrequency?: number;
  contrast?: number;
}

/**
 * AwUserAgentOrb — the animated avatar of a user-created agent.
 *
 * A circle filled by the Synthesis WebGL shader. color1 is always white;
 * color2/color3 come from the seeded {@link agentCorePalette} (one hue per
 * agent). The `state` prop nudges the animation:
 *  - `thinking` also sweeps the whole orb through the hue wheel (rainbow) and
 *    morphs the shape (circle ↔ rounded square, gently rotating) via CSS;
 *  - `paused` goes grayscale and nearly freezes;
 *  - `error` goes mostly grayscale with a muted red.
 *
 * Each instance is its own WebGL context. Browsers cap active contexts
 * (~16 on Chrome), so don't render large grids of these on one page — use
 * {@link AwUserAgentOrbStatic} for dense lists, tables and pickers.
 */
export function AwUserAgentOrb({
  seed = "agent",
  state = "idle",
  size = 64,
  className,
  color2,
  color3,
  speed,
  scale,
  complexity,
  distortion,
  glowIntensity,
  flowFrequency,
  contrast,
}: AwUserAgentOrbProps) {
  const palette = useMemo(() => agentCorePalette(seed), [seed]);
  const preset = USER_AGENT_STATE_PRESETS[state];

  // Size-aware density, same as AwCopilotOrb: at small sizes the standard
  // complexity/scale crams too many swirls into a few pixels and reads as
  // noise, so we open the scale and drop warp iterations as the orb shrinks.
  // ≥96px keeps the full look. Resolution: explicit prop > state preset > base.
  const calm = Math.min(1, Math.max(0, (96 - size) / (96 - 22)));
  const autoScale = USER_AGENT_BASE.scale - calm * 1.0;
  const autoComplexity = USER_AGENT_BASE.complexity - calm * 4;
  const autoDistortion = USER_AGENT_BASE.distortion - calm * 0.4;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full",
        state === "thinking" && "aw-agent-think",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <AwCortexSynthesis
        speed={speed ?? preset.speed ?? USER_AGENT_BASE.speed}
        color1={palette.color1}
        color2={color2 ?? preset.color2 ?? palette.color2}
        color3={color3 ?? preset.color3 ?? palette.color3}
        scale={scale ?? preset.scale ?? autoScale}
        complexity={complexity ?? preset.complexity ?? autoComplexity}
        distortion={distortion ?? preset.distortion ?? autoDistortion}
        glowIntensity={glowIntensity ?? preset.glowIntensity ?? USER_AGENT_BASE.glowIntensity}
        flowFrequency={flowFrequency ?? preset.flowFrequency ?? USER_AGENT_BASE.flowFrequency}
        contrast={contrast ?? preset.contrast ?? USER_AGENT_BASE.contrast}
        hueSpeed={preset.hueSpeed ?? 0}
        backgroundColor={USER_AGENT_BASE.bg}
      />
      {/* Inner glow rim — borderRadius:inherit so it tracks the thinking morph. */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: INNER_GLOW, borderRadius: "inherit" }}
      />
    </div>
  );
}

export interface AwUserAgentOrbStaticProps
  extends HTMLAttributes<HTMLDivElement> {
  seed?: string | number;
  size?: number;
}

/**
 * AwUserAgentOrbStatic — the same circle silhouette and seeded palette as
 * {@link AwUserAgentOrb}, rendered with a CSS gradient *mesh* (no WebGL).
 *
 * Use it wherever the animated version is impractical: dense lists, tables,
 * pickers, or any view that would otherwise spawn dozens of canvases. The mesh
 * ({@link agentMeshBackground}) layers white highlights, the vivid hero, soft
 * mids, deep recesses and a touch of a neighbouring hue so it reads close to
 * the animated spectrum — not a flat two-color gradient.
 */
export function AwUserAgentOrbStatic({
  seed = "agent",
  size = 40,
  className,
  style,
  ...rest
}: AwUserAgentOrbStaticProps) {
  const background = useMemo(() => agentMeshBackground(seed), [seed]);

  return (
    <div
      className={cn("relative shrink-0 rounded-full", className)}
      style={{
        width: size,
        height: size,
        background,
        boxShadow: INNER_GLOW,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
}
