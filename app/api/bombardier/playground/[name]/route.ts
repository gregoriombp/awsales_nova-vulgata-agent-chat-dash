import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"

const NAME_RE = /^[A-Z][A-Za-z0-9]{1,48}$/

function resolvePaths(name: string) {
  const root = process.cwd()
  const playgroundDir = path.join(root, "components", "playground")
  const uiDir = path.join(root, "components", "ui")
  return {
    root,
    playgroundDir,
    uiDir,
    srcFile: path.join(playgroundDir, `${name}.tsx`),
    dstFile: path.join(uiDir, `${name}.tsx`),
    metaFile: path.join(playgroundDir, `${name}.meta.json`),
  }
}

function guardName(name: string) {
  if (!NAME_RE.test(name)) {
    return NextResponse.json(
      {
        error: "invalid_name",
        reason: "PascalCase alfanumérico, 2-48 chars.",
      },
      { status: 400 }
    )
  }
  if (name.startsWith("Aw")) {
    return NextResponse.json(
      {
        error: "reserved_prefix",
        reason:
          "Componentes do Playground não podem começar com Aw (reservado para DS aprovado).",
      },
      { status: 400 }
    )
  }
  return null
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ name: string }> }
) {
  const { name } = await ctx.params
  const guard = guardName(name)
  if (guard) return guard

  const body = await req.json().catch(() => ({}))
  const action = body.action as string | undefined

  if (action !== "approve") {
    return NextResponse.json(
      { error: "unknown_action", valid: ["approve"] },
      { status: 400 }
    )
  }

  const p = resolvePaths(name)
  if (!fs.existsSync(p.srcFile)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  if (fs.existsSync(p.dstFile)) {
    return NextResponse.json(
      {
        error: "already_exists_in_ui",
        path: path.relative(p.root, p.dstFile),
      },
      { status: 409 }
    )
  }

  try {
    fs.mkdirSync(p.uiDir, { recursive: true })
    fs.renameSync(p.srcFile, p.dstFile)
    if (fs.existsSync(p.metaFile)) fs.unlinkSync(p.metaFile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: "fs_error", reason: msg },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    name,
    uiPath: path.relative(p.root, p.dstFile),
    nextSteps: [
      "Adicione uma categoria/página em app/bombardier/styleguide/components/ para documentar visualmente.",
      "Se quiser expor na paleta do Page Builder, adicione uma entrada em lib/bombardier/palette.ts.",
    ],
  })
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ name: string }> }
) {
  const { name } = await ctx.params
  const guard = guardName(name)
  if (guard) return guard

  const p = resolvePaths(name)
  if (!fs.existsSync(p.srcFile)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  try {
    fs.unlinkSync(p.srcFile)
    if (fs.existsSync(p.metaFile)) fs.unlinkSync(p.metaFile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: "fs_error", reason: msg },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, removed: name })
}
