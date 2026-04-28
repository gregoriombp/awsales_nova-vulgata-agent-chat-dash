import * as React from "react"

/**
 * Registry of brand SVGs for third-party platforms surfaced in AwSales
 * (integrations, source pickers, settings). Keep brand color literals
 * here — they are vendor identity, not theme tokens.
 */
type BrandRender = (size: number) => React.ReactNode

const BRANDS: Record<string, BrandRender> = {
  whatsapp: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#25D366" d="M20.5 3.5C18.3 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.7 1.4h.1c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.4zM12 22c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.5 15.7 2 13.9 2 12 2 6.5 6.5 2 12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10z" />
      <path fill="#25D366" d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.7-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4z" />
    </svg>
  ),
  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#bc3081" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="#fff" />
    </svg>
  ),
  messenger: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#0084FF" d="M12 1C5.9 1 1 5.6 1 11.3c0 3.2 1.5 6 3.9 7.9V23l3.6-2c1.1.3 2.3.5 3.5.5 6.1 0 11-4.6 11-10.3S18.1 1 12 1z" />
      <path fill="#fff" d="m5 14.5 3.4-5.4c.5-.7 1.5-.9 2.2-.4l2.6 1.9c.3.2.7.2 1 0l3.6-2.7c.6-.5 1.4.3.9.9l-3.4 5.4c-.5.7-1.5.9-2.2.4l-2.6-1.9c-.3-.2-.7-.2-1 0l-3.6 2.7c-.6.5-1.4-.3-.9-.9z" />
    </svg>
  ),
  hotmart: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#EF4E23" d="M12 1c-1.5 4-4 6-6 8-2 1.5-3 4-3 6.5C3 20.5 7 23 12 23s9-2.5 9-7.5c0-3-1.5-5.5-4-7-1 1.5-2 2.5-3 2.5-1.5 0-2-1.5-2-3 0-2 .5-4 0-7z" />
    </svg>
  ),
  stripe: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#635BFF" />
      <path fill="#fff" d="M14.6 14.6c-.5-.3-.7-.5-.7-.8 0-.4.4-.6.9-.6.7 0 1.4.3 1.4.3l.4-1.6s-.6-.3-1.7-.3c-1.6 0-2.7.9-2.7 2.2 0 .8.6 1.3 1.3 1.7.5.3.7.5.7.8 0 .4-.3.7-.8.7-.7 0-1.6-.4-1.6-.4l-.4 1.6s.7.4 1.8.4c1.7 0 2.8-.8 2.8-2.2 0-.9-.6-1.4-1.4-1.8z" />
      <text x="9" y="11" fontFamily="Inter" fontSize="6" fontWeight="700" fill="#fff">S</text>
    </svg>
  ),
  shopify: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#95BF47" d="M19 6c-.2-.2-.4-.2-.6-.2L17 5.7c-.2-.7-1-1.6-2-1.6-.7 0-1.5.3-2.1 1l-.4.5c-.7.2-1.3.4-1.7.6-.4-.6-1-1.4-1.7-1.4-.6 0-1 .3-1.5.8L5 17.5l11.6 2L19 6z" />
      <path fill="#5E8E3E" d="M14.6 14.6c-.5-.3-.7-.5-.7-.8 0-.4.4-.6.9-.6.7 0 1.4.3 1.4.3l.4-1.6s-.6-.3-1.7-.3c-1.6 0-2.7.9-2.7 2.2 0 .8.6 1.3 1.3 1.7.5.3.7.5.7.8 0 .4-.3.7-.8.7-.7 0-1.6-.4-1.6-.4l-.4 1.6s.7.4 1.8.4c1.7 0 2.8-.8 2.8-2.2 0-.9-.6-1.4-1.4-1.8z" />
    </svg>
  ),
  kiwify: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#04C26A" d="M16 4c-4 0-7 4-8 8 0 0 4-3 8-3 0 0-1 4-1 7 0 0 4-3 5-7 1-3-1-5-4-5z" />
    </svg>
  ),
  eduzz: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#FFB800" />
      <path fill="#fff" d="M9 8h6v2h-6V8zm-1 4h7v2H8v-2zm0 4h6v2H8v-2z" />
    </svg>
  ),
  hubla: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#1A1A1A" />
      <path fill="#C5F754" d="M8 7h2v10H8zm6 0h2v10h-2zm-6 4h8v2H8z" />
    </svg>
  ),
  ticto: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#0D0D0D" />
      <text x="12" y="17" textAnchor="middle" fontFamily="Inter" fontSize="14" fontWeight="700" fill="#fff">T</text>
    </svg>
  ),
  lastlink: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <circle cx="6" cy="12" r="3" fill="none" stroke="#04C26A" strokeWidth="2" />
      <circle cx="18" cy="6" r="2" fill="#04C26A" />
      <circle cx="18" cy="18" r="2" fill="#04C26A" />
      <path stroke="#04C26A" strokeWidth="2" d="m9 12 7-5m-7 5 7 5" />
    </svg>
  ),
  memberkit: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#3F8AE0" d="M12 3 4 17h16z" />
      <path fill="#22D" d="M12 8 7 17h10z" />
    </svg>
  ),
  cademi: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#E83E8C" />
      <path fill="#fff" d="M11 7c0 4-3 4-3 4s3 0 3 4c0 0 0-4 3-4 0 0-3 0-3-4z" />
    </svg>
  ),
  googleforms: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#7248B9" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path fill="#fff" d="M8 11h8v1H8zm0 3h8v1H8zm0 3h5v1H8z" />
      <path fill="#5C2DA8" d="M14 2v6h6z" />
    </svg>
  ),
  typeform: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="6" fill="#0D0D0D" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">T</text>
    </svg>
  ),
  tally: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#0D0D0D" />
      <path stroke="#fff" strokeWidth="2" d="M8 7v10M11 7v10M14 7v10M7 12h11" />
    </svg>
  ),
  calendly: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="#006BFF" strokeWidth="3" />
    </svg>
  ),
  googlecal: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="15" rx="2" fill="#fff" stroke="#1A73E8" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Inter" fontSize="9" fontWeight="700" fill="#1A73E8">31</text>
    </svg>
  ),
  pipedrive: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#26292C" />
      <path fill="#fff" d="M9 6h4c2.5 0 4 1.5 4 4s-1.5 4-4 4h-2v4H9z" />
      <path fill="#26292C" d="M11 8v4h2c1 0 1.5-.5 1.5-2s-.5-2-1.5-2z" />
    </svg>
  ),
  kommo: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#7B5CFF" />
      <path fill="#fff" d="M7 16V8l5 4 5-4v8h-2v-4l-3 2-3-2v4z" />
    </svg>
  ),
  rdstation: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#19BAA0" />
      <path fill="#fff" d="M2 12c2-2 5-2 7 0s5 2 7 0 5-2 7 0c-2 2-5 2-7 0s-5-2-7 0-5 2-7 0z" />
    </svg>
  ),
  hubspot: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF7A59" />
      <circle cx="17" cy="14" r="4" fill="none" stroke="#fff" strokeWidth="2" />
      <path stroke="#fff" strokeWidth="2" d="M14 11 8 6" />
      <circle cx="7" cy="6" r="2" fill="#fff" />
      <path stroke="#fff" strokeWidth="2" d="M17 10V4" />
    </svg>
  ),
  magalu: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#1078FF" />
      <text x="12" y="15" textAnchor="middle" fontFamily="Inter" fontSize="7" fontWeight="700" fill="#fff">magalu</text>
    </svg>
  ),
}

export type AwBrandLogoSize = "sm" | "md" | "lg"

const SIZE_PX: Record<AwBrandLogoSize, { tile: number; logo: number }> = {
  sm: { tile: 32, logo: 20 },
  md: { tile: 40, logo: 24 },
  lg: { tile: 56, logo: 32 },
}

export type AwBrandLogoProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Brand identifier (registry key). Unknown ids fall back to a monogram. */
  brand: string
  /** Visual size. Tile + inner logo scale together. */
  size?: AwBrandLogoSize
  /** Render only the inner SVG (no rounded tile background). */
  bare?: boolean
}

export const AW_BRAND_LOGO_REGISTRY = Object.freeze(
  Object.keys(BRANDS).sort()
) as readonly string[]

export function AwBrandLogo({
  brand,
  size = "md",
  bare,
  className,
  style,
  ...rest
}: AwBrandLogoProps) {
  const { tile, logo } = SIZE_PX[size]
  const render: BrandRender | undefined = BRANDS[brand]
  const known = !!render
  const inner = render ? (
    render(logo)
  ) : (
    <span
      aria-hidden="true"
      style={{
        fontSize: Math.round(logo * 0.55),
        fontWeight: 600,
        color: "#fff",
        fontFamily: "var(--font-sans)",
      }}
    >
      {brand.slice(0, 2).toUpperCase()}
    </span>
  )

  if (bare) {
    return (
      <span
        aria-label={brand}
        role="img"
        className={className}
        style={{
          width: logo,
          height: logo,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        {inner}
      </span>
    )
  }

  return (
    <div
      role="img"
      aria-label={brand}
      className={className}
      style={{
        width: tile,
        height: tile,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        background: known ? "var(--bg-surface)" : "var(--fg-primary)",
        border: known ? "1px solid var(--border-subtle)" : "none",
        borderRadius: 10,
        ...style,
      }}
      {...rest}
    >
      {inner}
    </div>
  )
}
