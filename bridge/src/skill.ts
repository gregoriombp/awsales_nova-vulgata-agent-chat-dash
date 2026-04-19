import fs from "node:fs"
import path from "node:path"

const SKILL_PATH = path.resolve(
  process.cwd(),
  "..",
  ".claude",
  "skills",
  "bombardier-generate.md"
)

let cached: { content: string; mtime: number } | null = null

function loadSkillRaw(): string {
  const stat = fs.statSync(SKILL_PATH)
  if (cached && cached.mtime === stat.mtimeMs) return cached.content
  const raw = fs.readFileSync(SKILL_PATH, "utf8")
  cached = { content: raw, mtime: stat.mtimeMs }
  return raw
}

function stripFrontmatter(md: string): string {
  if (!md.startsWith("---")) return md
  const end = md.indexOf("\n---", 3)
  if (end === -1) return md
  const after = md.slice(end + 4)
  return after.replace(/^\n+/, "")
}

export type SkillContext = {
  palette: unknown
  tokens: unknown
  awOutsidePalette: unknown
  currentTree: unknown
}

export function buildSystemPrompt(ctx: SkillContext): string {
  const body = stripFrontmatter(loadSkillRaw())
  return body
    .replace("<PALETTE_JSON>", JSON.stringify(ctx.palette, null, 2))
    .replace("<TOKENS_JSON>", JSON.stringify(ctx.tokens, null, 2))
    .replace(
      "<AW_OUTSIDE_PALETTE>",
      JSON.stringify(ctx.awOutsidePalette, null, 2)
    )
    .replace("<CURRENT_TREE>", JSON.stringify(ctx.currentTree ?? [], null, 2))
}

export function skillAvailable(): boolean {
  try {
    fs.accessSync(SKILL_PATH, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

export function skillPath(): string {
  return SKILL_PATH
}
