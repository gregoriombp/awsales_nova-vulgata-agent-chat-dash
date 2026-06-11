// Geist (variable) weight tokens for `fontVariationSettings`.
//
// Upstream (Fluid Functionalism) pairs Inter's `wght` with an `opsz`
// compensation to keep advance width constant while animating weight.
// Geist exposes a single `wght` axis (no `opsz`), so the tokens ride the
// weight axis alone — at UI sizes Geist's width drift between 400→700 is
// small enough that no optical-size compensation is needed.
export const fontWeights = {
  normal: "'wght' 400",
  medium: "'wght' 450",
  semibold: "'wght' 550",
  bold: "'wght' 700",
} as const;
