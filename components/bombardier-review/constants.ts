export const OVERLAY_DATA_ATTR = "data-bombardier-review"

export const STORAGE_KEYS = {
  identity: "bombardier-review:identity",
  comments: "bombardier-review:comments",
  schemaVersion: "bombardier-review:schema-version",
} as const

export const SCHEMA_VERSION = 2

export const STALE_DOCUMENT_HEIGHT_THRESHOLD = 0.2

export const DEFAULT_STROKE_WIDTH = 3

export const REVIEW_PALETTE: { token: string; label: string }[] = [
  { token: "var(--aw-blue-600)", label: "Azul" },
  { token: "var(--aw-emerald-600)", label: "Verde" },
  { token: "var(--aw-red-600)", label: "Vermelho" },
  { token: "var(--aw-purple-600)", label: "Roxo" },
  { token: "var(--aw-amber-500)", label: "Âmbar" },
  { token: "var(--aw-pink-600)", label: "Rosa" },
  { token: "var(--aw-teal-600)", label: "Teal" },
]
