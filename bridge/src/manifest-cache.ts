type ManifestPaletteItem = {
  type: string
  label: string
  group: string
  isContainer: boolean
  defaults: Record<string, unknown>
  props: Record<string, unknown>
}

export type CachedManifest = {
  builder: { palette: ManifestPaletteItem[] }
  designSystem: {
    componentsInPalette: string[]
    componentsOutsidePalette: string[]
    tokens: unknown
  }
}

const NEXT_URL =
  process.env.BOMBARDIER_NEXT_URL ?? "http://localhost:3000"

let cached: CachedManifest | null = null
let cacheAt = 0
const TTL_MS = 30_000

export async function getManifest(): Promise<CachedManifest | null> {
  if (cached && Date.now() - cacheAt < TTL_MS) return cached
  try {
    const res = await fetch(`${NEXT_URL}/api/bombardier/components/manifest`, {
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) return cached
    const data = (await res.json()) as CachedManifest
    cached = data
    cacheAt = Date.now()
    return data
  } catch {
    return cached
  }
}

export function setManifest(m: CachedManifest) {
  cached = m
  cacheAt = Date.now()
}
