import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { palette } from "@/lib/bombardier/palette"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const componentsDir = path.join(process.cwd(), "components", "ui")
  let awFiles: string[] = []
  try {
    awFiles = fs
      .readdirSync(componentsDir)
      .filter((f) => f.startsWith("Aw") && f.endsWith(".tsx"))
      .map((f) => f.replace(/\.tsx$/, ""))
      .sort()
  } catch {
    awFiles = []
  }

  const paletteTypes = new Set(palette.map((p) => p.type))
  const awInPalette = awFiles.filter((n) => paletteTypes.has(n))
  const awOutsidePalette = awFiles.filter((n) => !paletteTypes.has(n))

  return NextResponse.json(
    {
      version: 1,
      generatedAt: new Date().toISOString(),
      builder: {
        palette: palette.map((p) => ({
          type: p.type,
          label: p.label,
          group: p.group,
          isContainer: p.isContainer ?? false,
          defaults: p.defaultProps,
          props: p.propSchema,
        })),
      },
      designSystem: {
        componentsRoot: "components/ui",
        componentsInPalette: awInPalette,
        componentsOutsidePalette: awOutsidePalette,
        tokens: {
          bg: [
            "--bg-canvas",
            "--bg-surface",
            "--bg-raised",
            "--bg-muted",
            "--bg-inverse",
          ],
          fg: [
            "--fg-primary",
            "--fg-secondary",
            "--fg-tertiary",
            "--fg-muted",
            "--fg-on-inverse",
          ],
          border: [
            "--border-subtle",
            "--border-default",
            "--border-strong",
            "--border-inverse",
          ],
          accent: ["--accent-brand", "--accent-brand-hover"],
          radius: [
            "--radius-xs",
            "--radius-sm",
            "--radius-md",
            "--radius-lg",
            "--radius-xl",
            "--radius-2xl",
          ],
          scales: [
            "--aw-gray-{150..1200}",
            "--aw-blue-{100..1200}",
            "--aw-emerald-{100..1200}",
            "--aw-red-{100..1200}",
            "--aw-purple-{100..1000}",
            "--aw-teal-{100..900}",
            "--aw-amber-{100..1200}",
            "--aw-pink-{100..1200}",
            "--aw-lime-{100..1200}",
            "--aw-slate-{100..1200}",
          ],
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "http://localhost:9876",
      },
    }
  )
}
