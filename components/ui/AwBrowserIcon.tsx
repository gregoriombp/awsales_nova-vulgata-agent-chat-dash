import * as React from "react"

/**
 * AwBrowserIcon — inline SVG logos for the browsers surfaced in session lists
 * (active sessions, security, audit). Vendor color literals live here on
 * purpose: they are brand identity, not theme tokens — mirroring how
 * `AwBrandLogo` paints its multicolor marks (e.g. the Google "G").
 *
 * Pass the raw browser string from the data ("Chrome 124", "Safari", …);
 * `getBrowserKey` normalizes it case-insensitively by substring. Unknown
 * browsers fall back to a neutral globe so the row never renders empty.
 */

export type BrowserKey = "chrome" | "firefox" | "safari" | "edge" | "globe"

const MARKS: Record<BrowserKey, (size: number) => React.ReactNode> = {
  /* Google Chrome — 4-color pinwheel + blue core. */
  chrome: (size) => (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5h17.7A24 24 0 0 0 5.6 13.8L14 28.5A11.5 11.5 0 0 1 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M14 28.5 5.6 13.8A24 24 0 0 0 23.6 47.99L33 33.2A11.5 11.5 0 0 1 14 28.5z"
      />
      <path
        fill="#FBBC05"
        d="M33 33.2 23.6 48A24 24 0 0 0 41.7 9.5H24A11.5 11.5 0 0 1 33 33.2z"
      />
      <circle cx="24" cy="24" r="8.5" fill="#fff" />
      <circle cx="24" cy="24" r="6.7" fill="#4285F4" />
    </svg>
  ),
  /* Mozilla Firefox — warm flame on a magenta-to-orange field. */
  firefox: (size) => (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="aw-ff-g" cx="34%" cy="18%" r="80%">
          <stop offset="0%" stopColor="#FFEA00" />
          <stop offset="30%" stopColor="#FF8C00" />
          <stop offset="62%" stopColor="#FF3B30" />
          <stop offset="100%" stopColor="#B5007C" />
        </radialGradient>
      </defs>
      <path
        fill="url(#aw-ff-g)"
        d="M42 16.5a18 18 0 1 1-6.8-9.1c1.4 1.2 2 3.2 1.3 4.6-1.1-1.2-2.7-2-4.4-2 3.6 2.1 5.6 6 5.4 9.7-.3-3.8-3.4-6.8-7.1-7.4 4.2 3.5 5 9.7 1.9 14.2A10 10 0 0 1 14 24.6c-.5-3 .8-6.2 3.3-7.9-.6 1.6-.3 3.4.8 4.6.3-3.7 2.9-6.9 6.4-8-2.6 2.4-3.1 6.4-1.2 9.4a6 6 0 0 0 10.4-4.8c1.6 4.2.1 9.2-3.7 12A18 18 0 0 0 42 16.5z"
      />
    </svg>
  ),
  /* Apple Safari — compass needle on a blue dial. */
  safari: (size) => (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#1E97F3" />
      <circle
        cx="24"
        cy="24"
        r="18.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
      />
      <path fill="#fff" d="m24 24 11-11-7.5 14.5z" />
      <path fill="#FF3B30" d="m24 24-11 11 7.5-14.5z" />
    </svg>
  ),
  /* Microsoft Edge — teal-to-blue swirl. */
  edge: (size) => (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="aw-edge-g" x1="10%" y1="20%" x2="90%" y2="85%">
          <stop offset="0%" stopColor="#37C2B1" />
          <stop offset="45%" stopColor="#1B93EB" />
          <stop offset="100%" stopColor="#0C59A4" />
        </linearGradient>
      </defs>
      <path
        fill="url(#aw-edge-g)"
        d="M41.5 30c-1.8 6.3-7.6 11-14.5 11-5.4 0-10.1-2.9-12.7-7.2 1.8 1 3.9 1.6 6.1 1.6 5 0 9.4-2.9 11.5-7.2 1-2 3.2-3.2 5.4-3 1.8.2 3.4 1.2 4.2 2.8z"
      />
      <path
        fill="#2D8CCC"
        d="M9.2 33C7.2 30.4 6 27.1 6 23.5 6 13.8 14.1 6 24.1 6c7 0 13 4 15.7 9.9 1.2 2.5.4 5.5-1.9 7-2 1.4-4.7 1.1-6.5-.6-1.7-1.6-4-2.6-6.5-2.6-5 0-9.1 3.9-9.5 8.7-.2 2.3-.7 4.5-1.6 6.6z"
      />
    </svg>
  ),
  /* Generic globe fallback — neutral, follows current text color. */
  globe: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" />
      </g>
    </svg>
  ),
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
      {MARKS[key](size)}
    </span>
  )
}
