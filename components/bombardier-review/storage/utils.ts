import { SCHEMA_VERSION } from "../constants"
import type { ReviewComment, ReviewExportPayload } from "../types"

export function makeId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

export function isReviewComment(value: unknown): value is ReviewComment {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === "string" &&
    v.schemaVersion === SCHEMA_VERSION &&
    typeof v.authorId === "string" &&
    typeof v.text === "string" &&
    typeof v.url === "string" &&
    typeof v.anchor === "object"
  )
}

export function safeParseComments(raw: string | null): ReviewComment[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isReviewComment)
  } catch {
    return []
  }
}

export function safeParseExport(
  raw: string
): ReviewExportPayload | { error: string } {
  try {
    const parsed = JSON.parse(raw)
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.schemaVersion !== SCHEMA_VERSION ||
      !Array.isArray(parsed.comments)
    ) {
      return { error: "Payload inválido (schema desconhecido)." }
    }
    return parsed as ReviewExportPayload
  } catch (e) {
    return { error: e instanceof Error ? e.message : "JSON inválido." }
  }
}
