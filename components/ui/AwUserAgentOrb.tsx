"use client";

import { useMemo } from "react";
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
  /**
   * "webgl" (default) — shader Synthesis, 1 contexto WebGL por instância
   * (limite ~16/página no Chrome). "css" — mesh animado por transform
   * (compositor-only, custo ~zero): use em listas, grids e qualquer tela com
   * muitos orbs. Ambos derivam as cores do MESMO seed. O modo css continua
   * SEMPRE animado — a decisão de produto de 2026-06-10 proíbe orb congelado;
   * a única exceção é prefers-reduced-motion (acessibilidade), que pausa o
   * movimento e mantém o mesh.
   */
  renderer?: "webgl" | "css";
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
 * (~16 on Chrome) — in dense lists/grids show a reduced sample of orbs
 * (plus a counter) instead of one orb per row.
 */
export function AwUserAgentOrb({
  seed = "agent",
  state = "idle",
  size = 64,
  renderer = "webgl",
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

  if (renderer === "css") {
    return <CssOrb seed={seed} state={state} size={size} className={className} />;
  }

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
      // Black circle behind the shader — any transient gap during the
      // thinking morph/rotation reads as the orb's own dark core.
      style={{ width: size, height: size, background: USER_AGENT_BASE.bg }}
      aria-hidden="true"
    >
      {/* Zoom: the shader plane is oversized inside the circular mask so the
          painted sphere never shows a cut edge — especially while the
          thinking state morphs and rotates the silhouette. */}
      <div className="absolute" style={{ inset: "-18%" }}>
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
      </div>
      {/* Inner glow rim — borderRadius:inherit so it tracks the thinking morph. */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: INNER_GLOW, borderRadius: "inherit" }}
      />
    </div>
  );
}

/* ── Renderer CSS (renderer="css") ────────────────────────────────────────────
 * O mesh em radial-gradients do MESMO seed (agentMeshBackground), animado só
 * por transform em duas camadas contra-rotativas — compositor-only, custo
 * ~zero, sem contexto WebGL. Não é a "variante estática" removida em
 * 2026-06-10: continua sempre animado; reduced-motion é a única exceção. */

const CSS_ORB_SPIN_S: Record<UserAgentState, number> = {
  idle: 18,
  thinking: 7,
  responding: 11,
  paused: 0, // pausado de fato (animation-play-state)
  error: 22,
};

function CssOrb({
  seed,
  state,
  size,
  className,
}: {
  seed: string | number;
  state: UserAgentState;
  size: number;
  className?: string;
}) {
  const mesh = useMemo(() => agentMeshBackground(seed), [seed]);
  const spin = CSS_ORB_SPIN_S[state];
  const playState = state === "paused" ? "paused" : "running";

  return (
    <div
      className={cn(
        "aw-css-orb relative shrink-0 overflow-hidden rounded-full",
        state === "thinking" && "aw-agent-think",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: USER_AGENT_BASE.bg,
        opacity: state === "paused" ? 0.85 : undefined,
        filter: state === "paused" ? "saturate(0.35)" : undefined,
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes aw-css-orb-spin { to { transform: rotate(360deg); } }
        @keyframes aw-css-orb-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes aw-css-orb-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aw-css-orb * { animation: none !important; }
        }
      `}</style>
      {/* Camada 1: o mesh do seed, girando devagar dentro da máscara circular. */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "-22%",
          background: mesh,
          animation:
            spin > 0 ? `aw-css-orb-spin ${spin}s linear infinite` : undefined,
          animationPlayState: playState,
        }}
      />
      {/* Camada 2: brilho líquido contra-rotativo (conic suave + blur). */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "-12%",
          background:
            "conic-gradient(from 40deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.55) 52deg, rgba(255,255,255,0) 132deg, rgba(255,255,255,0.18) 236deg, rgba(255,255,255,0) 320deg)",
          filter: "blur(6px)",
          mixBlendMode: "soft-light",
          animation:
            spin > 0
              ? `aw-css-orb-spin-rev ${spin * 1.6}s linear infinite`
              : undefined,
          animationPlayState: playState,
        }}
      />
      {/* Núcleo claro fixo — o highlight que o shader pinta com color1. */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "14%",
          background:
            "radial-gradient(58% 58% at 38% 32%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 62%)",
          animation:
            state === "responding"
              ? "aw-css-orb-breathe 2.6s var(--ease-out) infinite"
              : undefined,
        }}
      />
      {/* Tinta de erro — vermelho contido por cima do mesh. */}
      {state === "error" && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "color-mix(in srgb, var(--accent-danger) 26%, transparent)",
          }}
        />
      )}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: INNER_GLOW, borderRadius: "inherit" }}
      />
    </div>
  );
}
