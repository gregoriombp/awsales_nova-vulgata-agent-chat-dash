/**
 * Static lookup tables for surface levels.
 *
 * Upstream (Fluid Functionalism) ships an 8-step `bg-surface-N` /
 * `shadow-surface-N` scale. This repo's foundation models elevation with the
 * semantic backgrounds (`--bg-surface`, `--bg-raised`) plus the standard
 * shadow scale — so the 8 levels collapse onto those existing tokens
 * (tokens are sacred: no new ones here).
 *
 * Tailwind v4's static scanner only generates utilities for literal strings,
 * so the class names below must stay literal — never template them.
 */

export const SURFACE_BG: Record<number, string> = {
  1: "bg-bg-surface",
  2: "bg-bg-raised",
  3: "bg-bg-raised",
  4: "bg-bg-raised",
  5: "bg-bg-raised",
  6: "bg-bg-raised",
  7: "bg-bg-raised",
  8: "bg-bg-raised",
};

export const SURFACE_SHADOW: Record<number, string> = {
  1: "shadow-xs",
  2: "shadow-sm",
  3: "shadow-md",
  4: "shadow-lg",
  5: "shadow-xl",
  6: "shadow-2xl",
  7: "shadow-2xl",
  8: "shadow-2xl",
};

export function surfaceClasses(bgLevel: number, shadowLevel: number = bgLevel): string {
  const bg = Math.max(1, Math.min(8, bgLevel));
  const shadow = Math.max(1, Math.min(8, shadowLevel));
  return `${SURFACE_BG[bg]} ${SURFACE_SHADOW[shadow]}`;
}
