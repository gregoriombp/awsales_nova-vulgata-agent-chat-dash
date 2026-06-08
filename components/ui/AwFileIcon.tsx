import * as React from "react"

/**
 * File-type tile in the OpenAI/ChatGPT attachment style — a rounded square painted
 * with a representative brand color and a white glyph inside that names the type
 * (PDF, image, spreadsheet, JSON, etc.). Mirrors the `AwBrandLogo` anatomy on
 * purpose: same sizes, same radius, same `bare` toggle, so the two can live
 * side-by-side in lists (attachments, knowledge base entries, source pickers).
 *
 * Type identity is intentionally NOT a theme token — it's brand-of-format
 * (red = PDF, green = spreadsheet, blue = doc). Colors flow through Aswork
 * palette tokens (`--aw-red-600`, etc.) so they stay in sync with the system.
 */

type FileMark = (props: { fg: string }) => React.ReactNode

type FileTypeDef = {
  /** Tile background — solid color via Aswork palette token. */
  bg: string
  /** Glyph foreground (defaults to white). */
  fg?: string
  /** Inline SVG glyph drawn on a 24×24 viewBox without its own background. */
  mark: FileMark
  /** Short label rendered as caption when `withLabel` is true. */
  label: string
}

/* ----------------------------------------------------------------------------
 * Shared glyph helpers
 * --------------------------------------------------------------------------*/

/** Generic "document with folded corner" silhouette used as the base for many
 *  format glyphs. Caller fills the body with format-specific marks. */
function DocBase({
  fg,
  children,
  cornerFold = true,
}: {
  fg: string
  children?: React.ReactNode
  cornerFold?: boolean
}) {
  return (
    <svg viewBox="0 0 24 24" width="55%" height="55%" aria-hidden="true">
      <path
        d="M6.5 3.5h7.4L18.5 8v11.2a1.3 1.3 0 0 1-1.3 1.3H6.5a1.3 1.3 0 0 1-1.3-1.3V4.8a1.3 1.3 0 0 1 1.3-1.3z"
        fill={fg}
      />
      {cornerFold && (
        <path
          d="M13.9 3.5V7a1 1 0 0 0 1 1h3.6"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.3"
        />
      )}
      <g style={{ mixBlendMode: "multiply" }}>{children}</g>
    </svg>
  )
}

/* ----------------------------------------------------------------------------
 * File-type registry
 * --------------------------------------------------------------------------*/

const TYPES = {
  /* PDF — red, "PDF" wordmark inside doc */
  pdf: {
    bg: "var(--aw-red-600)",
    label: "PDF",
    mark: ({ fg }) => (
      <DocBase fg={fg}>
        <text
          x="11.85"
          y="16.3"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="5.4"
          fontWeight="800"
          fill="var(--aw-red-600)"
        >
          PDF
        </text>
      </DocBase>
    ),
  },
  /* Word / DOCX — blue, "DOC" wordmark */
  doc: {
    bg: "var(--aw-blue-600)",
    label: "DOC",
    mark: ({ fg }) => (
      <DocBase fg={fg}>
        <text
          x="11.85"
          y="16.3"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="5.2"
          fontWeight="800"
          fill="var(--aw-blue-600)"
        >
          DOC
        </text>
      </DocBase>
    ),
  },
  /* Spreadsheet / XLSX — emerald, grid silhouette */
  spreadsheet: {
    bg: "var(--aw-emerald-600)",
    label: "XLS",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="55%" height="55%" aria-hidden="true">
        <path
          d="M6.5 3.5h7.4L18.5 8v11.2a1.3 1.3 0 0 1-1.3 1.3H6.5a1.3 1.3 0 0 1-1.3-1.3V4.8a1.3 1.3 0 0 1 1.3-1.3z"
          fill={fg}
        />
        <path
          d="M7.6 11.8h8.8M7.6 14.5h8.8M7.6 17.2h8.8M11 11.8v5.7M14 11.8v5.7"
          stroke="var(--aw-emerald-700)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  /* CSV — emerald (slightly darker), explicit "CSV" wordmark */
  csv: {
    bg: "var(--aw-emerald-700)",
    label: "CSV",
    mark: ({ fg }) => (
      <DocBase fg={fg}>
        <text
          x="11.85"
          y="16.3"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="5.2"
          fontWeight="800"
          fill="var(--aw-emerald-700)"
        >
          CSV
        </text>
      </DocBase>
    ),
  },
  /* JSON / code-data — slate/gray (matches the dark gray attachment from
     ChatGPT screenshots), curly braces + dot */
  json: {
    bg: "var(--aw-gray-1000)",
    label: "JSON",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true">
        <path
          d="M9.2 5.6c-2 0-2.7 1-2.7 2.6V11c0 .8-.5 1.2-1.4 1.2v1.5c.9 0 1.4.4 1.4 1.2v2.8c0 1.6.7 2.6 2.7 2.6h.9v-1.6h-.6c-1 0-1.2-.4-1.2-1.3v-2.6c0-1-.5-1.7-1.3-2 .8-.3 1.3-1 1.3-2V8.5c0-.9.2-1.3 1.2-1.3h.6V5.6h-.9z"
          fill={fg}
        />
        <path
          d="M14.8 5.6c2 0 2.7 1 2.7 2.6V11c0 .8.5 1.2 1.4 1.2v1.5c-.9 0-1.4.4-1.4 1.2v2.8c0 1.6-.7 2.6-2.7 2.6h-.9v-1.6h.6c1 0 1.2-.4 1.2-1.3v-2.6c0-1 .5-1.7 1.3-2-.8-.3-1.3-1-1.3-2V8.5c0-.9-.2-1.3-1.2-1.3h-.6V5.6h.9z"
          fill={fg}
        />
        <circle cx="12" cy="12.5" r="0.9" fill={fg} />
      </svg>
    ),
  },
  /* Plain text — neutral gray with horizontal lines */
  txt: {
    bg: "var(--aw-gray-800)",
    label: "TXT",
    mark: ({ fg }) => (
      <DocBase fg={fg}>
        <path
          d="M8 11h7M8 13h7M8 15h5"
          stroke="var(--aw-gray-800)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </DocBase>
    ),
  },
  /* Image / PNG — purple/violet, mountains + sun thumbnail */
  image: {
    bg: "var(--aw-purple-600)",
    label: "IMG",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="58%" height="58%" aria-hidden="true">
        <rect
          x="4.5"
          y="5.5"
          width="15"
          height="13"
          rx="1.4"
          fill={fg}
        />
        <circle cx="9" cy="9.5" r="1.4" fill="var(--aw-purple-600)" />
        <path
          d="M5.4 17.2l4-4.5 3 3 3-2 3.2 3.5v.5a1.3 1.3 0 0 1-1.3 1.3H5.7l-.3-1.8z"
          fill="var(--aw-purple-600)"
        />
      </svg>
    ),
  },
  /* Video — pink, play triangle on a film tile */
  video: {
    bg: "var(--aw-pink-600)",
    label: "MP4",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="58%" height="58%" aria-hidden="true">
        <rect
          x="4.5"
          y="5.5"
          width="15"
          height="13"
          rx="1.4"
          fill={fg}
        />
        <path
          d="M10.5 9.5v5l4.2-2.5z"
          fill="var(--aw-pink-600)"
        />
      </svg>
    ),
  },
  /* Audio — purple, sound waveform */
  audio: {
    bg: "var(--aw-purple-700)",
    label: "AUD",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true">
        <path
          d="M7 11v2M10 9v6M13 7.5v9M16 10v4M19 11.2v1.6"
          stroke={fg}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  /* Zip / archive — amber, folder with zipper */
  zip: {
    bg: "var(--aw-amber-500)",
    label: "ZIP",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="58%" height="58%" aria-hidden="true">
        <path
          d="M5 7.2c0-.9.6-1.5 1.4-1.5h3.4l1.5 1.5h6.3c.8 0 1.4.6 1.4 1.5V18a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 18z"
          fill={fg}
        />
        <path
          d="M13 8.5v8"
          stroke="var(--aw-amber-500)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="1.4 1.2"
        />
      </svg>
    ),
  },
  /* Code — slate, angle brackets */
  code: {
    bg: "var(--aw-slate-700)",
    label: "CODE",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="62%" height="62%" aria-hidden="true">
        <path
          d="M9.5 8 5.5 12l4 4M14.5 8l4 4-4 4M13.2 6.5l-2.4 11"
          stroke={fg}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  /* Presentation / PPTX — orange, slide with bars */
  presentation: {
    bg: "var(--aw-amber-600)",
    label: "PPT",
    mark: ({ fg }) => (
      <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true">
        <rect
          x="4.5"
          y="5.5"
          width="15"
          height="11"
          rx="1.4"
          fill={fg}
        />
        <path
          d="M8 13v-2M11 13V9M14 13v-3M17 13v-4"
          stroke="var(--aw-amber-600)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9 19h6"
          stroke={fg}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  /* Generic / unknown — neutral gray with paper clip */
  generic: {
    bg: "var(--aw-gray-700)",
    label: "FILE",
    mark: ({ fg }) => <DocBase fg={fg} />,
  },
} satisfies Record<string, FileTypeDef>

export type AwFileIconType = keyof typeof TYPES

/* ----------------------------------------------------------------------------
 * Extension → type mapping (lets callers pass a filename or extension)
 * --------------------------------------------------------------------------*/

const EXT_MAP: Record<string, AwFileIconType> = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  rtf: "doc",
  odt: "doc",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ods: "spreadsheet",
  numbers: "spreadsheet",
  csv: "csv",
  tsv: "csv",
  json: "json",
  yaml: "json",
  yml: "json",
  xml: "json",
  txt: "txt",
  md: "txt",
  log: "txt",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  heic: "image",
  bmp: "image",
  mp4: "video",
  mov: "video",
  webm: "video",
  avi: "video",
  mkv: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  m4a: "audio",
  zip: "zip",
  rar: "zip",
  "7z": "zip",
  tar: "zip",
  gz: "zip",
  js: "code",
  ts: "code",
  tsx: "code",
  jsx: "code",
  py: "code",
  rb: "code",
  go: "code",
  rs: "code",
  java: "code",
  c: "code",
  cpp: "code",
  cs: "code",
  swift: "code",
  kt: "code",
  php: "code",
  sh: "code",
  html: "code",
  css: "code",
  scss: "code",
  ppt: "presentation",
  pptx: "presentation",
  key: "presentation",
}

/** Resolve a filename or extension to a registered file type. Falls back to
 *  `generic` for anything unmapped. */
export function awFileIconTypeFromExt(
  input: string | undefined | null
): AwFileIconType {
  if (!input) return "generic"
  const lower = input.toLowerCase()
  const ext = lower.includes(".")
    ? lower.split(".").pop()!.trim()
    : lower.trim()
  return EXT_MAP[ext] ?? "generic"
}

/* ----------------------------------------------------------------------------
 * Sizes
 * --------------------------------------------------------------------------*/

export type AwFileIconSize = "sm" | "md" | "lg"

const SIZE_PX: Record<AwFileIconSize, { tile: number; bare: number }> = {
  sm: { tile: 32, bare: 22 },
  md: { tile: 40, bare: 28 },
  lg: { tile: 56, bare: 36 },
}

/* ----------------------------------------------------------------------------
 * Component
 * --------------------------------------------------------------------------*/

export type AwFileIconProps = React.HTMLAttributes<HTMLDivElement> & {
  /** File-type identifier (registry key). Use `awFileIconTypeFromExt` to
   *  derive from a filename. Unknown ids fall back to `generic`. */
  type?: AwFileIconType
  /** Filename or extension — convenience prop. Wins over `type` when provided. */
  ext?: string
  /** Visual size. Tile + inner mark scale together. */
  size?: AwFileIconSize
  /** Compact variant — smaller chip without outer chrome. */
  bare?: boolean
  /** Render a tiny uppercase label under the tile (matches the ChatGPT
   *  attachment chip layout). */
  withLabel?: boolean
  /** Accessible label. Defaults to the resolved type label (e.g. "PDF"). */
  alt?: string
}

export const AW_FILE_ICON_REGISTRY = Object.freeze(
  Object.keys(TYPES).sort()
) as readonly AwFileIconType[]

export function AwFileIcon({
  type = "generic",
  ext,
  size = "md",
  bare,
  withLabel,
  alt,
  className,
  style,
  ...rest
}: AwFileIconProps) {
  const resolved: AwFileIconType = ext ? awFileIconTypeFromExt(ext) : type
  const def: FileTypeDef = TYPES[resolved] ?? TYPES.generic
  const fg = def.fg ?? "var(--fg-on-inverse)"
  const { tile, bare: bareSize } = SIZE_PX[size]
  const wrapperSize = bare ? bareSize : tile
  const radius = bare ? Math.round(wrapperSize * 0.26) : 10

  const tileEl = (
    <div
      role="img"
      aria-label={alt ?? def.label}
      style={{
        width: wrapperSize,
        height: wrapperSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        background: def.bg,
        borderRadius: radius,
        color: fg,
      }}
    >
      {def.mark({ fg })}
    </div>
  )

  if (!withLabel) {
    return (
      <div
        className={className}
        style={{ display: "inline-flex", ...style }}
        {...rest}
      >
        {tileEl}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
      {...rest}
    >
      {tileEl}
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.06em",
          fontWeight: 600,
          color: "var(--fg-tertiary)",
          fontFamily: "var(--font-sans)",
          textTransform: "uppercase",
        }}
      >
        {def.label}
      </span>
    </div>
  )
}
