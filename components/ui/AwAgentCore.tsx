import Image from "next/image";
import { cn } from "@/lib/utils";

// Square rotated 45° (a rhombus) inscribed in a 1:1 box — vertices at the
// midpoint of each edge. Encoded as an SVG mask so the silhouette scales to any
// size. Shape encodes the category: Core = diamond, user agent = circle,
// Cortex = hex.
const AGENT_CORE_DIAMOND_MASK = (() => {
  const path = "M50 0 L100 50 L50 100 L0 50 Z";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${path}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

export const DIAMOND_MASK_STYLE = {
  maskImage: AGENT_CORE_DIAMOND_MASK,
  WebkitMaskImage: AGENT_CORE_DIAMOND_MASK,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskMode: "alpha",
} as const;

/** Path to a Core's orb art. `n` is the Core number (1–20). */
export const agentCoreSrc = (n: number) =>
  `/assets/agent_imgs/orbs/orb_model-a_${String(n).padStart(2, "0")}.png`;

export interface AwAgentCoreProps {
  /** PNG of the Core — the proprietary orb art in /assets/agent_imgs/orbs/. */
  src: string;
  alt?: string;
  /** Box side in px. The diamond fills 100% of it. */
  size?: number;
  className?: string;
}

/**
 * AwAgentCore — a proprietary Aswork Agent Core.
 *
 * A static colored orb (PNG) clipped into the diamond silhouette (a square
 * rotated 45°). Static by design: a Core is an agentic *framework* the user
 * picks when creating an agent — a badge, not a living agent. The animated,
 * colored fill belongs to the user's agent ({@link AwUserAgentOrb}, a circle).
 */
export function AwAgentCore({
  src,
  alt = "",
  size = 64,
  className,
}: AwAgentCoreProps) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size, ...DIAMOND_MASK_STYLE }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
