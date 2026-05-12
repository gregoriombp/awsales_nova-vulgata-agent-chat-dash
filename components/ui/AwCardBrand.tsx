import * as React from "react"

/**
 * Bandeira de cartão de crédito — chip retangular (proporção 1.5:1, formato de
 * cartão) com a logo oficial da brand inside. Acompanha um detector por BIN
 * (prefixo do número) para auto-resolver a bandeira live enquanto o usuário
 * digita. Vendor color literals (azul Visa, vermelho/amarelo MC, etc.) ficam no
 * registry — são identidade de marca, não tokens.
 *
 * Diferente do `AwBrandLogo` (tile quadrado pra integrations), aqui o chip é
 * RETANGULAR pra evocar o aspect-ratio físico de um cartão de crédito.
 */

export type AwCardBrandId =
  | "visa"
  | "mastercard"
  | "amex"
  | "elo"
  | "hipercard"
  | "diners"
  | "discover"
  | "unknown"

type BrandMark = (props: { fg: string }) => React.ReactNode

type BrandDef = {
  /** Tile background (oficial brand color or neutral). */
  bg: string
  /** Inline SVG logo. Drawn inside the rectangular tile. */
  mark: BrandMark
  /** Human-readable label for aria + tooltip. */
  label: string
  /** Adds a subtle hairline border (useful on white/light tiles). */
  bordered?: boolean
}

const BRANDS: Record<Exclude<AwCardBrandId, "unknown">, BrandDef> = {
  visa: {
    bg: "#FFFFFF",
    bordered: true,
    label: "Visa",
    mark: () => (
      <svg viewBox="0 0 24 12" width="78%" height="78%" aria-hidden="true">
        <path
          fill="#1A1F71"
          d="M9.112 4.262L5.97 11.758H3.92L2.374 5.775c-.094-.368-.175-.503-.461-.658C1.447 4.864.677 4.627 0 4.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
        />
      </svg>
    ),
  },
  mastercard: {
    bg: "#FFFFFF",
    bordered: true,
    label: "Mastercard",
    mark: () => (
      <svg viewBox="0 0 24 16" width="72%" height="72%" aria-hidden="true">
        <circle cx="9" cy="8" r="6" fill="#EB001B" />
        <circle cx="15" cy="8" r="6" fill="#F79E1B" />
        <path
          d="M12 3.2A6 6 0 0 1 14 8a6 6 0 0 1-2 4.8A6 6 0 0 1 10 8a6 6 0 0 1 2-4.8z"
          fill="#FF5F00"
        />
      </svg>
    ),
  },
  amex: {
    bg: "#006FCF",
    label: "American Express",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 12" width="74%" height="74%" aria-hidden="true">
        <text
          x="12"
          y="8.6"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="5.6"
          fontWeight="900"
          letterSpacing="0.04em"
          fill={fg}
        >
          AMEX
        </text>
      </svg>
    ),
  },
  elo: {
    bg: "#000000",
    label: "Elo",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 16" width="78%" height="78%" aria-hidden="true">
        <circle cx="12" cy="8" r="5.4" fill="#FFCB05" />
        <circle cx="12" cy="8" r="2.6" fill="#000" />
        <text
          x="12"
          y="9.6"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="3.2"
          fontWeight="800"
          fill={fg}
        >
          elo
        </text>
        <circle cx="16.3" cy="6.1" r="0.7" fill="#EF4123" />
        <circle cx="7.7" cy="9.9" r="0.7" fill="#00A4E0" />
      </svg>
    ),
  },
  hipercard: {
    bg: "#B3131B",
    label: "Hipercard",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 12" width="84%" height="84%" aria-hidden="true">
        <text
          x="12"
          y="8.6"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="4.8"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-0.02em"
          fill={fg}
        >
          Hiper
        </text>
      </svg>
    ),
  },
  diners: {
    bg: "#0079BE",
    label: "Diners Club",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 16" width="74%" height="74%" aria-hidden="true">
        <circle cx="10" cy="8" r="5.4" fill={fg} />
        <circle cx="14" cy="8" r="5.4" fill={fg} />
        <ellipse cx="12" cy="8" rx="2.2" ry="4.4" fill="#0079BE" />
      </svg>
    ),
  },
  discover: {
    bg: "#FFFFFF",
    bordered: true,
    label: "Discover",
    mark: () => (
      <svg viewBox="0 0 24 12" width="86%" height="86%" aria-hidden="true">
        <text
          x="11.2"
          y="8.6"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="4.6"
          fontWeight="800"
          letterSpacing="-0.01em"
          fill="#231F20"
        >
          DISCOVER
        </text>
        <circle cx="20.6" cy="7.4" r="2" fill="#FF6000" />
      </svg>
    ),
  },
}

/* ----------------------------------------------------------------------------
 * BIN detection
 * --------------------------------------------------------------------------*/

/** Detect card brand from PAN/BIN. Strips non-digits, then matches prefixes.
 *  Returns `"unknown"` for empty or unmatched inputs. */
export function detectCardBrand(input: string | null | undefined): AwCardBrandId {
  if (!input) return "unknown"
  const n = input.replace(/\D/g, "")
  if (!n) return "unknown"

  if (/^4/.test(n)) return "visa"

  if (/^3[47]/.test(n)) return "amex"

  if (
    /^5[1-5]/.test(n) ||
    /^2(2(2[1-9]|[3-9]\d)|[3-6]\d\d|7([01]\d|20))/.test(n)
  )
    return "mastercard"

  if (
    /^(384(1[02]|14|16)|60(4[239]|7\d|8\d|9\d))/.test(n) ||
    /^606282/.test(n)
  )
    return "hipercard"

  if (
    /^(40117[8-9]|431274|438935|451416|457393|45763[1-2]|504175|627780|636297|636368)/.test(
      n
    ) ||
    /^(506(6[9]|7[0-7])|509\d{3}|650(0(3[1-3]|3[5-9]|4\d|5[01])|4(0[5-9]|[1-3]\d)|4(8[5-9]|9\d)|5(4[1-9]|5\d|6\d|7\d|8\d|9[0-8]))|6516([5-7]\d)|6550([01]\d|2\d|3\d|4\d|5[0-8]))/.test(
      n
    )
  )
    return "elo"

  if (/^3(0[0-5]|095|6|8|9)/.test(n)) return "diners"

  if (/^6(011|5\d|4[4-9]|22(1[2-9]|[2-8]|9([0-1]\d|2[0-5])))/.test(n))
    return "discover"

  return "unknown"
}

/* ----------------------------------------------------------------------------
 * Sizes
 * --------------------------------------------------------------------------*/

export type AwCardBrandSize = "sm" | "md" | "lg"

const SIZE_PX: Record<AwCardBrandSize, { w: number; h: number; r: number }> = {
  sm: { w: 28, h: 18, r: 3 },
  md: { w: 36, h: 24, r: 4 },
  lg: { w: 48, h: 32, r: 5 },
}

/* ----------------------------------------------------------------------------
 * Component
 * --------------------------------------------------------------------------*/

export type AwCardBrandProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Brand id (registry key). Defaults to "unknown" — renders a neutral placeholder. */
  brand?: AwCardBrandId
  /** Convenience prop — passes a PAN/BIN and resolves the brand automatically.
   *  Wins over `brand` when provided. */
  pan?: string
  /** Visual size. Tile + inner logo scale together. */
  size?: AwCardBrandSize
}

export const AW_CARD_BRAND_REGISTRY = Object.freeze(
  Object.keys(BRANDS).sort()
) as readonly Exclude<AwCardBrandId, "unknown">[]

export function AwCardBrand({
  brand,
  pan,
  size = "md",
  className,
  style,
  ...rest
}: AwCardBrandProps) {
  const resolved: AwCardBrandId = pan ? detectCardBrand(pan) : brand ?? "unknown"
  const { w, h, r } = SIZE_PX[size]

  if (resolved === "unknown") {
    return (
      <div
        role="img"
        aria-label="Bandeira não identificada"
        className={className}
        style={{
          width: w,
          height: h,
          borderRadius: r,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "var(--bg-muted)",
          boxShadow: "inset 0 0 0 1px var(--border-subtle)",
          color: "var(--fg-tertiary)",
          ...style,
        }}
        {...rest}
      >
        <svg viewBox="0 0 24 16" width="58%" height="58%" aria-hidden="true">
          <rect
            x="2"
            y="3"
            width="20"
            height="10"
            rx="1.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="2 1.6"
          />
        </svg>
      </div>
    )
  }

  const def = BRANDS[resolved]
  const fg = "#fff"

  return (
    <div
      role="img"
      aria-label={def.label}
      className={className}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        background: def.bg,
        boxShadow: def.bordered
          ? "inset 0 0 0 1px var(--border-subtle)"
          : undefined,
        ...style,
      }}
      {...rest}
    >
      {def.mark({ fg })}
    </div>
  )
}
