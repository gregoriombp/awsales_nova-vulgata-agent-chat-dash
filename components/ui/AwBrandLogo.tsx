import * as React from "react"

/**
 * Registry of brand identities for third-party platforms surfaced in Aswork
 * (integrations, source pickers, settings). Each entry owns its tile bg —
 * the wrapper paints the brand color so the icon fills the frame, instead of
 * sitting as a tiny chip on a neutral surface. Vendor color literals live
 * here intentionally; they are identity, not theme tokens.
 */
type BrandMark = (props: { fg: string }) => React.ReactNode

type Brand = {
  /** CSS background — solid color, gradient, or any valid bg value. */
  bg: string
  /** Foreground color for the mark (defaults to white). */
  fg?: string
  /** Adds a subtle hairline; useful for light-bg marks (e.g. Google Calendar). */
  bordered?: boolean
  /** Inner SVG mark, drawn on a 24×24 viewBox without its own background. */
  mark?: BrandMark
  /** Path to a pre-built SVG tile in /public. Takes precedence over `mark`. */
  iconSrc?: string
}

const ICON_BASE = "/assets/integrations/integrations_icon_svg"

const BRANDS: Record<string, Brand> = {
  /* ------------------------------------------------------------------
   * Channels
   * ------------------------------------------------------------------ */
  whatsapp: {
    bg: "#25D366",
    iconSrc: `${ICON_BASE}/canal_Whatsapp.svg`,
  },
  instagram: {
    bg: "linear-gradient(135deg, #FEDA77 0%, #F58529 25%, #DD2A7B 55%, #8134AF 80%, #515BD4 100%)",
    iconSrc: `${ICON_BASE}/canal_Instagram.svg`,
  },
  messenger: {
    bg: "linear-gradient(135deg, #00C6FF 0%, #0078FF 50%, #C026D3 100%)",
    iconSrc: `${ICON_BASE}/canal_Messenger.svg`,
  },
  slack: {
    bg: "#FFFFFF",
    bordered: true,
    // Official 4-color Slack mark, drawn on its native 127×127 viewBox.
    mark: () => (
      <svg viewBox="0 0 127 127" width="60%" height="60%" aria-hidden="true">
        <path fill="#E01E5A" d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80z" />
        <path fill="#E01E5A" d="M33.8 80c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" />
        <path fill="#36C5F0" d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47z" />
        <path fill="#36C5F0" d="M47 33.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H14C6.7 60.2.8 54.3.8 47c0-7.3 5.9-13.2 13.2-13.2h33z" />
        <path fill="#2EB67D" d="M99.8 47c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.8V47z" />
        <path fill="#2EB67D" d="M93.2 47c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33z" />
        <path fill="#ECB22E" d="M80 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8H80z" />
        <path fill="#ECB22E" d="M80 93.2c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80z" />
      </svg>
    ),
  },
  /* ------------------------------------------------------------------
   * Payment methods (BR)
   * ------------------------------------------------------------------ */
  pix: {
    bg: "#32BCAD",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%" aria-hidden="true">
        <path
          fill={fg}
          d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"
        />
      </svg>
    ),
  },
  boleto: {
    bg: "#1F2937",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="64%" height="64%" aria-hidden="true">
        <g fill={fg}>
          <rect x="3.5" y="6" width="1.4" height="12" rx="0.2" />
          <rect x="5.8" y="6" width="0.7" height="12" rx="0.2" />
          <rect x="7.4" y="6" width="2.2" height="12" rx="0.2" />
          <rect x="10.6" y="6" width="0.8" height="12" rx="0.2" />
          <rect x="12.4" y="6" width="1.6" height="12" rx="0.2" />
          <rect x="14.9" y="6" width="0.7" height="12" rx="0.2" />
          <rect x="16.6" y="6" width="2" height="12" rx="0.2" />
          <rect x="19.5" y="6" width="1" height="12" rx="0.2" />
        </g>
      </svg>
    ),
  },
  card: {
    bg: "#0F1419",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%" aria-hidden="true">
        <rect
          x="3.5"
          y="6"
          width="17"
          height="12"
          rx="1.6"
          fill="none"
          stroke={fg}
          strokeWidth="1.8"
        />
        <rect x="3.5" y="9" width="17" height="2.2" fill={fg} />
        <rect x="6" y="14" width="4" height="1.6" rx="0.4" fill={fg} />
      </svg>
    ),
  },
  /* ------------------------------------------------------------------
   * Checkouts
   * ------------------------------------------------------------------ */
  hotmart: {
    bg: "#100300",
    iconSrc: `${ICON_BASE}/Hotmart.svg`,
  },
  stripe: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Stripe.svg`,
  },
  kiwify: {
    bg: "#000000",
    iconSrc: `${ICON_BASE}/Kwify.svg`,
  },
  eduzz: {
    bg: "#F4C043",
    iconSrc: `${ICON_BASE}/Eduzz.svg`,
  },
  hubla: {
    bg: "#131705",
    iconSrc: `${ICON_BASE}/Hubla.svg`,
  },
  ticto: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Ticto.svg`,
  },
  lastlink: {
    bg: "#1C272D",
    iconSrc: `${ICON_BASE}/Lastlink.svg`,
  },
  zouti: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Zouti.svg`,
  },
  blitzpay: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Blitzpay.svg`,
  },
  onprofit: {
    bg: "#21443F",
    iconSrc: `${ICON_BASE}/Onprofit.svg`,
  },
  greenn: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Greenn.svg`,
  },
  payt: {
    bg: "#1B1607",
    iconSrc: `${ICON_BASE}/Payt.svg`,
  },
  pagtrust: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Pagtrust.svg`,
  },
  braip: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Braip.svg`,
  },
  tmb: {
    bg: "#000000",
    iconSrc: `${ICON_BASE}/Tmb.svg`,
  },
  dmg: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/DMG.svg`,
  },
  /* ------------------------------------------------------------------
   * Forms
   * ------------------------------------------------------------------ */
  typeform: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Typeform.svg`,
  },
  /* ------------------------------------------------------------------
   * Meetings
   * ------------------------------------------------------------------ */
  calendly: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Calendly.svg`,
  },
  googlecal: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Google%20Calendar.svg`,
  },
  /* ------------------------------------------------------------------
   * AI providers
   * ------------------------------------------------------------------ */
  claude: {
    bg: "#D97757",
    iconSrc: `${ICON_BASE}/Claude.svg`,
  },
  chatgpt: {
    bg: "#FFFFFF",
    bordered: true,
    iconSrc: `${ICON_BASE}/Chatgpt.svg`,
  },
  deepseek: {
    bg: "#4D6BFE",
    iconSrc: `${ICON_BASE}/Deepseek.svg`,
  },
  /* ------------------------------------------------------------------
   * Documents / signatures
   * ------------------------------------------------------------------ */
  assiny: {
    bg: "#5B45FF",
    iconSrc: `${ICON_BASE}/Assiny.svg`,
  },
  /* ------------------------------------------------------------------
   * Brands kept as inline marks — no SVG tile available yet.
   * ------------------------------------------------------------------ */
  shopify: {
    bg: "#95BF47",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="60%" height="60%">
        <path
          fill={fg}
          d="M16.6 5.4c-.1-.1-.2-.1-.3-.1L15 5.2c-.2-.6-.9-1.4-1.9-1.4-.6 0-1.3.3-1.9.9-.6.2-1.1.4-1.5.5-.4-.5-.9-1.2-1.6-1.2-.5 0-.9.3-1.2.7l-.1.1c-.4.1-.8.3-.8.3s-.5.2-.6.6c-.1.4-1 8.7-1.9 17.4l11.6.1L17 5.5l-.4-.1zM12.7 5.6c-.5.1-1 .3-1.5.5l-.3.1c0-.4.1-.8.2-1.1.1-.4.4-.8.8-.8.4 0 .7.4.8 1.3zm-1.2-2c-.4 0-.7.3-.9.7-.2.4-.3.9-.4 1.4-.5.1-1 .3-1.4.4.3-1 .9-2.5 1.9-2.5.3 0 .5 0 .8 0z"
        />
      </svg>
    ),
  },
  memberkit: {
    bg: "#3F8AE0",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%">
        <path fill={fg} d="M12 3 4 18h16z" />
        <path fill={fg} fillOpacity="0.6" d="M12 8 7 18h10z" />
      </svg>
    ),
  },
  cademi: {
    bg: "#E83E8C",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="60%" height="60%">
        <path
          fill={fg}
          d="M12 4c0 4-3 4.5-3 4.5s3 .5 3 4.5c0-4 3-4.5 3-4.5s-3-.5-3-4.5z"
        />
        <path
          fill={fg}
          d="M6 14c0 2.5-2 3-2 3s2 .5 2 3c0-2.5 2-3 2-3s-2-.5-2-3z"
          opacity="0.7"
        />
      </svg>
    ),
  },
  googleforms: {
    bg: "#7248B9",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="58%" height="58%">
        <path fill={fg} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path fill="#7248B9" d="M9 11h6v1H9zm0 3h6v1H9zm0 3h4v1H9z" />
        <path fill={fg} fillOpacity="0.5" d="M14 3v5h5z" />
      </svg>
    ),
  },
  tally: {
    bg: "#0D0D0D",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%">
        <path
          stroke={fg}
          strokeWidth="2.2"
          strokeLinecap="round"
          d="M7 6v12M11 6v12M15 6v12M5.5 12.5l11-1.5"
        />
      </svg>
    ),
  },
  pipedrive: {
    bg: "#26292C",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="58%" height="58%">
        <path
          fill={fg}
          d="M9 4h4.5c2.7 0 4.5 1.7 4.5 4.5S16.2 13 13.5 13H11v7H9z"
        />
        <path fill="#26292C" d="M11 6.5v4.5h2.3c1.2 0 1.9-.8 1.9-2.2S14.5 6.5 13.3 6.5z" />
      </svg>
    ),
  },
  kommo: {
    bg: "#7B5CFF",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%">
        <path
          fill={fg}
          d="M5 18V7l3.5 4.5L12 7l3.5 4.5L19 7v11h-2.5v-5l-1.5 2-1.5-2v5h-3v-5l-1.5 2-1.5-2v5z"
        />
      </svg>
    ),
  },
  rdstation: {
    bg: "#19BAA0",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="64%" height="64%">
        <path
          fill="none"
          stroke={fg}
          strokeWidth="2.2"
          strokeLinecap="round"
          d="M3 13c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"
        />
        <path
          fill="none"
          stroke={fg}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.5"
          d="M3 18c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"
        />
      </svg>
    ),
  },
  hubspot: {
    bg: "#FF7A59",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%">
        <circle cx="17" cy="14.5" r="3.8" fill="none" stroke={fg} strokeWidth="2" />
        <circle cx="17" cy="14.5" r="1.2" fill={fg} />
        <path stroke={fg} strokeWidth="2" strokeLinecap="round" d="M14.3 11.7 8.5 6.5" />
        <circle cx="7" cy="5.5" r="2" fill={fg} />
        <path stroke={fg} strokeWidth="2" strokeLinecap="round" d="M17 10.5V5" />
      </svg>
    ),
  },
  magalu: {
    bg: "#1078FF",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="80%" height="80%">
        <text
          x="12"
          y="14.5"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="6.4"
          fontWeight="800"
          fill={fg}
        >
          magalu
        </text>
      </svg>
    ),
  },
}

export type AwBrandLogoSize = "sm" | "md" | "lg"

const SIZE_PX: Record<AwBrandLogoSize, { tile: number; bare: number }> = {
  sm: { tile: 32, bare: 22 },
  md: { tile: 40, bare: 28 },
  lg: { tile: 56, bare: 36 },
}

export type AwBrandLogoProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Brand identifier (registry key). Unknown ids fall back to a monogram. */
  brand: string
  /** Visual size. Tile + inner mark scale together. */
  size?: AwBrandLogoSize
  /** Compact variant — smaller chip without outer chrome, brand bg preserved. */
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
  const def: Brand | undefined = BRANDS[brand]
  const known = !!def
  const fg = def?.fg ?? "var(--fg-on-inverse)"
  const { tile, bare: bareSize } = SIZE_PX[size]
  const wrapperSize = bare ? bareSize : tile
  const radius = bare ? Math.round(wrapperSize * 0.26) : 10

  const inner = def?.iconSrc ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={def.iconSrc}
      alt=""
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover",
      }}
    />
  ) : def?.mark ? (
    def.mark({ fg })
  ) : (
    <span
      aria-hidden="true"
      style={{
        fontSize: Math.round(wrapperSize * 0.42),
        fontWeight: 700,
        color: "var(--fg-on-inverse)",
        fontFamily: "var(--font-sans)",
        letterSpacing: "-0.02em",
      }}
    >
      {brand.slice(0, 2).toUpperCase()}
    </span>
  )

  return (
    <div
      role="img"
      aria-label={brand}
      className={className}
      style={{
        width: wrapperSize,
        height: wrapperSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        background: known ? def!.bg : "var(--fg-primary)",
        boxShadow: def?.bordered
          ? "inset 0 0 0 1px var(--border-subtle)"
          : undefined,
        borderRadius: radius,
        color: fg,
        ...style,
      }}
      {...rest}
    >
      {inner}
    </div>
  )
}
