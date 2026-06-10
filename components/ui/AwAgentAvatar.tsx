"use client";

import { AwAgentCore, DIAMOND_MASK_STYLE } from "@/components/ui/AwAgentCore";
import { AwUserAgentOrb } from "@/components/ui/AwUserAgentOrb";
import { type UserAgentState } from "@/lib/user-agent-presets";
import { cn } from "@/lib/utils";

export interface AwAgentAvatarProps {
  /** Seed for the agent's orb palette (its id/name). */
  agentSeed?: string | number;
  /** PNG of the Agent Core the agent uses — e.g. `agentCoreSrc(n)`. */
  coreSrc: string;
  coreAlt?: string;
  /** Agent state — animates the orb (ignored when `animated` is false). */
  state?: UserAgentState;
  /** Diameter of the agent circle in px. The core badge scales from it. */
  size?: number;
  className?: string;
}

/**
 * AwAgentAvatar — a user agent (animated circle) with its Agent Core (diamond)
 * pinned to the bottom-right, exactly like a profile photo + status dot. It's
 * the canonical way to show *which Core an agent runs on*: the living circle is
 * the agent, the diamond badge is the framework it was created against.
 *
 * Uses one live WebGL context (the orb); the core badge is a static PNG.
 * O agente do usuário só existe animado — em listas densas, reduza a amostra
 * visível em vez de congelar o orb.
 *
 * Note: `state` is forwarded to the orb, so `state="thinking"` runs the shape
 * morph. At small sizes a morph corner can peek beside the badge (the badge is
 * pinned, the orb rotates under it) — prefer idle/responding for small avatars,
 * or bump the size.
 */
export function AwAgentAvatar({
  agentSeed = "agent",
  coreSrc,
  coreAlt = "",
  state = "idle",
  size = 72,
  className,
}: AwAgentAvatarProps) {
  const coreSize = Math.round(size * 0.42);
  const gap = Math.max(2, Math.round(size * 0.035)); // bg rim around the badge
  const ring = coreSize + gap * 2;
  const offset = -Math.round(size * 0.04); // slight overhang, like a status dot

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <AwUserAgentOrb seed={agentSeed} state={state} size={size} />
      {/* Core badge. The bg-canvas diamond behind the core is the rim that
          separates it from the orb (like the ring around a status dot). */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          width: ring,
          height: ring,
          right: offset,
          bottom: offset,
          background: "var(--bg-canvas)",
          ...DIAMOND_MASK_STYLE,
        }}
      >
        <AwAgentCore src={coreSrc} alt={coreAlt} size={coreSize} />
      </div>
    </div>
  );
}
