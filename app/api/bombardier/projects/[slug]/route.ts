import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/

function projectsRoot() {
  return path.join(process.cwd(), "bombardier", "projects")
}

function guardSlug(slug: string) {
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      {
        error: "invalid_slug",
        reason: "Lowercase alfanumérico com hifens, 1–64 chars.",
      },
      { status: 400 }
    )
  }
  return null
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params
  const guard = guardSlug(slug)
  if (guard) return guard

  const file = path.join(projectsRoot(), slug, "project.json")
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  try {
    const raw = fs.readFileSync(file, "utf8")
    const project = JSON.parse(raw)
    return NextResponse.json({ slug, project })
  } catch (err) {
    return NextResponse.json(
      {
        error: "parse_failure",
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params
  const guard = guardSlug(slug)
  if (guard) return guard

  const body = await req.json().catch(() => ({}))
  const project = body.project
  if (!project || typeof project !== "object") {
    return NextResponse.json({ error: "missing_project" }, { status: 400 })
  }
  if (!Array.isArray((project as { pages?: unknown[] }).pages)) {
    return NextResponse.json(
      { error: "invalid_project_shape", reason: "project.pages must be an array" },
      { status: 400 }
    )
  }

  const enriched = {
    ...(project as Record<string, unknown>),
    updatedAt: new Date().toISOString(),
  }

  const dir = path.join(projectsRoot(), slug)
  const file = path.join(dir, "project.json")
  try {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(enriched, null, 2), "utf8")
  } catch (err) {
    return NextResponse.json(
      {
        error: "fs_error",
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    slug,
    path: path.relative(process.cwd(), file),
  })
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params
  const guard = guardSlug(slug)
  if (guard) return guard

  const dir = path.join(projectsRoot(), slug)
  if (!fs.existsSync(dir)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch (err) {
    return NextResponse.json(
      {
        error: "fs_error",
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
  return NextResponse.json({ ok: true, removed: slug })
}
