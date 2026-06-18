import * as React from "react"

/**
 * AwBrowserIcon — official vendor browser logos for the browsers surfaced in
 * session lists (active sessions, security, audit). The marks are the official
 * Iconify `logos` SVGs, served from `/assets/integrations/iconify/<browser>.svg`
 * — the same curation lane as the `AwBrandLogo` registry, so they match the
 * vendors' real brand identity instead of a hand-drawn approximation.
 *
 * Pass the raw browser string from the data ("Chrome 124", "Safari", …);
 * `getBrowserKey` normalizes it case-insensitively by substring. Unknown
 * browsers fall back to a neutral globe so the row never renders empty.
 */

export type BrowserKey = "chrome" | "firefox" | "safari" | "edge" | "globe"

/** Official Iconify `logos/*` marks, curated into the integrations asset lane. */
const MARK_SRC: Partial<Record<BrowserKey, string>> = {
  chrome: "/assets/integrations/iconify/chrome.svg",
  firefox: "/assets/integrations/iconify/firefox.svg",
  safari: "/assets/integrations/iconify/safari.svg",
  edge: "/assets/integrations/iconify/edge.svg",
}

/** Generic globe fallback — neutral, follows current text color. */
function GlobeMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" />
      </g>
    </svg>
  )
}

/** Maps a raw browser string ("Chrome 124", "Safari") to a registry key. */
export function getBrowserKey(browser: string): BrowserKey {
  const b = browser.toLowerCase()
  if (b.includes("chrome")) return "chrome"
  if (b.includes("firefox")) return "firefox"
  if (b.includes("safari")) return "safari"
  if (b.includes("edge")) return "edge"
  return "globe"
}

/** Browser keys with a dedicated brand mark (excludes the generic fallback). */
export const AW_BROWSER_ICON_KEYS = Object.freeze([
  "chrome",
  "firefox",
  "safari",
  "edge",
]) as readonly BrowserKey[]

export type AwBrowserIconProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Raw browser string from the data. */
  browser: string
  /** Square size in px. Default 20. */
  size?: number
}

export function AwBrowserIcon({
  browser,
  size = 20,
  className,
  style,
  ...rest
}: AwBrowserIconProps) {
  const key = getBrowserKey(browser)
  const src = MARK_SRC[key]
  return (
    <span
      role="img"
      aria-label={browser}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {src ? (
        // Official multicolor brand mark — rendered as an <img>, like the
        // AwBrandLogo markSrc lane. eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size} height={size} draggable={false} />
      ) : (
        <GlobeMark size={size} />
      )}
    </span>
  )
}
