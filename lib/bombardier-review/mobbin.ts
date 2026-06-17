"use client"

import { fileToHighResDataUrl } from "@/lib/bombardier-review/imageScale"
import type {
  MobbinSearch,
  MobbinScreenResult,
  ReviewElementContext,
} from "@/components/bombardier-review/types"

// Cliente do Review Mode pro Mobbin. O app NÃO fala com o Mobbin direto — o MCP
// vive no ambiente do agente. Então: enfileira o pedido no review-bridge (mesmo
// canal dos comentários), espera o agente devolver, e converte a imagem
// escolhida no mesmo data URL base64 que o seletor de arquivos já produz.
const BRIDGE_URL = (
  process.env.NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL ?? ""
).replace(/\/$/, "")
const BRIDGE_TOKEN = process.env.NEXT_PUBLIC_BOMBARDIER_REVIEW_TOKEN ?? ""

const POLL_INTERVAL_MS = 1500

/** A busca no Mobbin só funciona com o review-bridge ligado (npm run dev). */
export function mobbinBridgeReady(): boolean {
  return Boolean(BRIDGE_URL && BRIDGE_TOKEN)
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Review-Token": BRIDGE_TOKEN,
  }
}

export interface RequestMobbinSearchInput {
  query: string
  element?: ReviewElementContext | null
  page?: string
}

export async function requestMobbinSearch(
  input: RequestMobbinSearchInput
): Promise<MobbinSearch> {
  const res = await fetch(`${BRIDGE_URL}/mobbin/searches`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      query: input.query,
      platform: "web",
      page: input.page ?? "",
      element: input.element ?? undefined,
    }),
  })
  if (!res.ok) throw new Error(`mobbin_request_failed_${res.status}`)
  const data = (await res.json()) as { search: MobbinSearch }
  return data.search
}

export async function getMobbinSearch(
  id: string
): Promise<MobbinSearch | null> {
  const res = await fetch(
    `${BRIDGE_URL}/mobbin/searches/${encodeURIComponent(id)}`,
    { headers: headers() }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`mobbin_get_failed_${res.status}`)
  const data = (await res.json()) as { search: MobbinSearch }
  return data.search
}

/**
 * Aguarda o agente resolver a busca. Ouve o SSE do bridge (`mobbin.resolved`) e
 * faz polling de reforço — cobre o caso de o evento se perder ou de o agente ter
 * resolvido antes de a gente assinar. `onResolved` recebe a busca já `done` ou
 * `error` (o painel decide o que mostrar). Retorna um cleanup.
 */
export function waitForMobbinResults(
  id: string,
  onResolved: (search: MobbinSearch) => void
): () => void {
  let settled = false
  let source: EventSource | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const cleanup = () => {
    if (source) {
      source.close()
      source = null
    }
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const finish = (search: MobbinSearch) => {
    if (settled) return
    settled = true
    cleanup()
    onResolved(search)
  }

  if (typeof window !== "undefined") {
    try {
      const url = `${BRIDGE_URL}/events?token=${encodeURIComponent(
        BRIDGE_TOKEN
      )}`
      source = new EventSource(url)
      source.addEventListener("mobbin.resolved", (e) => {
        try {
          const payload = JSON.parse((e as MessageEvent).data) as {
            search?: MobbinSearch
          }
          if (payload.search?.id === id) finish(payload.search)
        } catch {
          // ignora evento malformado — o polling cobre
        }
      })
      source.onerror = () => {
        // EventSource reconecta sozinho; o polling cobre as lacunas.
      }
    } catch {
      source = null
    }
  }

  pollTimer = setInterval(() => {
    if (settled) return
    void getMobbinSearch(id)
      .then((search) => {
        if (search && search.status !== "pending") finish(search)
      })
      .catch(() => {
        // transitório — segue tentando
      })
  }, POLL_INTERVAL_MS)

  return cleanup
}

/**
 * Busca a imagem do Mobbin pelo proxy same-origin (driblando CORS / canvas
 * taint) e converte no mesmo data URL base64 do seletor de arquivos — pronto pra
 * cair no `images[]` do comentário.
 */
export async function attachMobbinImage(imageUrl: string): Promise<string> {
  const res = await fetch(
    `/api/review/mobbin-image?url=${encodeURIComponent(imageUrl)}`
  )
  if (!res.ok) throw new Error(`mobbin_image_failed_${res.status}`)
  const blob = await res.blob()
  const type = blob.type || "image/jpeg"
  const ext = type.includes("png")
    ? "png"
    : type.includes("webp")
      ? "webp"
      : "jpg"
  const file = new File([blob], `mobbin-${Date.now()}.${ext}`, { type })
  return fileToHighResDataUrl(file)
}

export type { MobbinSearch, MobbinScreenResult }
