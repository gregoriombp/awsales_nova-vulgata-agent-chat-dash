import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function projectsRoot() {
  return path.join(process.cwd(), "bombardier", "projects")
}

export async function GET() {
  const root = projectsRoot()
  if (!fs.existsSync(root)) {
    return NextResponse.json({ projects: [] })
  }

  const slugs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  const items = slugs
    .map((slug) => {
      const file = path.join(root, slug, "project.json")
      if (!fs.existsSync(file)) return null
      try {
        const raw = fs.readFileSync(file, "utf8")
        const parsed = JSON.parse(raw) as {
          name?: string
          pages?: unknown[]
          updatedAt?: string
        }
        const stat = fs.statSync(file)
        return {
          slug,
          name: typeof parsed.name === "string" ? parsed.name : slug,
          pageCount: Array.isArray(parsed.pages) ? parsed.pages.length : 0,
          updatedAt:
            typeof parsed.updatedAt === "string"
              ? parsed.updatedAt
              : stat.mtime.toISOString(),
        }
      } catch {
        return null
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)

  return NextResponse.json({ projects: items })
}
