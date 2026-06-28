"use client"

import { create } from "zustand"
import { RemoteBridgeReview } from "@/components/bombardier-review/storage/remoteBridge"
import { ServerlessReview } from "@/components/bombardier-review/storage/serverless"
import type { ReviewStorage } from "@/components/bombardier-review/storage/types"
import { makeId } from "@/components/bombardier-review/storage/utils"
import { buildReviewCommentContext } from "@/lib/bombardier-review/elementContext"
import { snapshotRevealTrail } from "@/lib/bombardier-review/revealTrail"
import type {
  ReviewActor,
  ReviewAnchor,
  ReviewComment,
  ReviewDrawAnchor,
  ReviewDrawPath,
  ReviewElementAnchor,
  ReviewIdentity,
  ReviewMode,
  ReviewPoint,
  ReviewReply,
} from "@/components/bombardier-review/types"
import {
  DEFAULT_STROKE_WIDTH,
  SCHEMA_VERSION,
} from "@/components/bombardier-review/constants"

export type StorageBackend = "local" | "bridge"

function pickStorage(): { storage: ReviewStorage; backend: StorageBackend } {
  // Legado opt-in: se a env de um bridge Express externo (porta 9878) estiver
  // setada, usa ele. Caso contrário, padrão = bridge serverless embutido.
  const bridgeUrl = process.env.NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL
  const bridgeToken = process.env.NEXT_PUBLIC_BOMBARDIER_REVIEW_TOKEN
  if (bridgeUrl && bridgeToken) {
    return {
      storage: new RemoteBridgeReview({
        baseUrl: bridgeUrl,
        token: bridgeToken,
      }),
      backend: "bridge",
    }
  }
  // Padrão: rotas same-origin /api/review-bridge/* sobre os mesmos JSON.
  return { storage: new ServerlessReview(), backend: "bridge" }
}

const initial = pickStorage()

function identityToActor(identity: ReviewIdentity | null): ReviewActor | null {
  if (!identity) return null
  return { kind: "user", id: identity.id, name: identity.name }
}

// Contas de revisão salvas (multi-conta). A identidade ATUAL continua no backend
// de storage; a LISTA de contas conhecidas mora só no localStorage do navegador
// — é conveniência local pra trocar/adicionar revisor pela bolota, sem API nova.
const ACCOUNTS_STORAGE_KEY = "bombardier-review:accounts"

function loadAccounts(): ReviewIdentity[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (a) =>
        a &&
        typeof a.id === "string" &&
        typeof a.name === "string" &&
        typeof a.colorToken === "string"
    ) as ReviewIdentity[]
  } catch {
    return []
  }
}

function persistAccounts(list: ReviewIdentity[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* storage cheio/indisponível — silencioso, é só conveniência */
  }
}

type ReviewState = {
  storage: ReviewStorage
  backend: StorageBackend

  active: boolean
  mode: ReviewMode
  sheetOpen: boolean
  exportOpen: boolean
  identity: ReviewIdentity | null
  identityModalOpen: boolean
  identityHydrated: boolean
  /** Contas de revisão salvas neste navegador (a atual é `identity`). */
  accounts: ReviewIdentity[]
  /** "edit" reaproveita a identidade atual; "new" força criar outra conta. */
  identityDraftMode: "edit" | "new"

  drawingPath: ReviewPoint[] | null
  pendingAnchor: ReviewAnchor | null

  comments: ReviewComment[]
  archivedComments: ReviewComment[]
  archiveCursor?: number
  archiveLoaded: boolean
  selectedCommentId: string | null
  /** Comment whose anchored thread popover is open. Mutually exclusive with the sheet. */
  threadCommentId: string | null

  toggleActive: () => void
  setActive: (active: boolean) => void
  setMode: (mode: ReviewMode) => void
  cycleMode: () => void
  toggleSheet: () => void
  setSheetOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  /** Open the Figma-style thread popover anchored to a comment's pin. */
  openThread: (id: string) => void
  closeThread: () => void

  hydrateIdentity: () => Promise<void>
  setIdentity: (name: string, colorToken: string) => Promise<void>
  closeIdentityModal: () => void
  /** Abre o modal de identidade em modo edição (padrão) ou criação. */
  openIdentityModal: (mode?: "edit" | "new") => void
  /** Atalho: abre o modal já em modo "nova conta". */
  addAccount: () => void
  /** Troca a identidade atual por uma das contas salvas (por id). */
  switchIdentity: (id: string) => Promise<void>

  startDraw: (point: ReviewPoint, colorToken: string) => void
  appendDrawPoint: (point: ReviewPoint) => void
  endDraw: (el?: ReviewDrawAnchor) => void
  placePin: (point: ReviewPoint, el?: ReviewElementAnchor) => void
  cancelPending: () => void
  saveComment: (text: string, images?: string[]) => Promise<void>

  selectComment: (id: string | null) => void

  /** User marks something as resolved without going through in_review — moves straight to archive. */
  archiveDirect: (id: string) => Promise<void>
  /** Agent path. Called via API from outside; surfaced here for completeness/testing. */
  markInReview: (id: string, actor: ReviewActor) => Promise<void>
  approveComment: (id: string) => Promise<void>
  rejectComment: (id: string) => Promise<void>
  reopenFromArchive: (id: string) => Promise<void>
  addReply: (id: string, text: string, images?: string[]) => Promise<ReviewReply | null>
  /** Edita texto/imagens de um comentário existente, preservando o resto. */
  editComment: (id: string, text: string, images?: string[]) => Promise<void>
  /** Cria uma "ideia futura" avulsa (sem pino) — vai pra aba de backlog. */
  addBacklogIdea: (text: string, images?: string[]) => Promise<void>
  /** Move um comentário existente pro backlog (vira "ideia futura"). */
  moveToBacklog: (id: string) => Promise<void>
  /** Tira do backlog, voltando pra "aberto". */
  restoreFromBacklog: (id: string) => Promise<void>
  deleteComment: (id: string) => Promise<void>
  refreshFromStorage: () => Promise<void>
  loadArchivePage: (reset?: boolean) => Promise<void>
}

function centroidOf(points: ReviewPoint[]): ReviewPoint {
  if (points.length === 0) return { x: 50, y: 50 }
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  )
  return { x: sum.x / points.length, y: sum.y / points.length }
}

// Arredonda pra px inteiro: precisão de float crua num traço à mão é sub-pixel
// (invisível) mas infla o anchor no JSON.
function quantizePoint(p: ReviewPoint): ReviewPoint {
  return { x: Math.round(p.x), y: Math.round(p.y) }
}
// Frações de reflow (0..1): 4 casas = sub-pixel em qualquer viewport.
const round4 = (n: number) => Math.round(n * 1e4) / 1e4
function quantizeDrawAnchor(el: ReviewDrawAnchor): ReviewDrawAnchor {
  return { ...el, points: el.points.map((p) => ({ fx: round4(p.fx), fy: round4(p.fy) })) }
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  storage: initial.storage,
  backend: initial.backend,

  active: false,
  mode: "cursor",
  sheetOpen: false,
  exportOpen: false,
  identity: null,
  identityModalOpen: false,
  identityHydrated: false,
  accounts: [],
  identityDraftMode: "edit",

  drawingPath: null,
  pendingAnchor: null,

  comments: [],
  archivedComments: [],
  archiveCursor: undefined,
  archiveLoaded: false,
  selectedCommentId: null,
  threadCommentId: null,

  toggleActive: () => {
    const next = !get().active
    set({ active: next })
    if (next) {
      const { identity } = get()
      if (!identity) set({ identityModalOpen: true })
      void get().refreshFromStorage()
    } else {
      set({
        mode: "cursor",
        drawingPath: null,
        pendingAnchor: null,
        sheetOpen: false,
        exportOpen: false,
        selectedCommentId: null,
        threadCommentId: null,
      })
    }
  },

  setActive: (active) => set({ active }),

  setMode: (mode) =>
    set({
      mode,
      drawingPath: null,
      pendingAnchor: null,
    }),

  cycleMode: () => {
    const order: ReviewMode[] = ["cursor", "draw", "pin", "magic"]
    const idx = order.indexOf(get().mode)
    set({
      mode: order[(idx + 1) % order.length],
      drawingPath: null,
      pendingAnchor: null,
    })
  },

  // The sheet and the anchored thread popover are mutually exclusive — opening
  // one dismisses the other so a comment never shows in two places at once.
  toggleSheet: () =>
    set((s) => ({ sheetOpen: !s.sheetOpen, threadCommentId: null })),
  setSheetOpen: (open) =>
    set(open ? { sheetOpen: true, threadCommentId: null } : { sheetOpen: false }),
  setExportOpen: (open) => set({ exportOpen: open }),
  openThread: (id) =>
    set({ threadCommentId: id, selectedCommentId: id, sheetOpen: false }),
  closeThread: () => set({ threadCommentId: null }),

  hydrateIdentity: async () => {
    try {
      const identity = await get().storage.getIdentity()
      let accounts = loadAccounts()
      // Instalações anteriores ao multi-conta só tinham a identidade atual:
      // garante que ela apareça na lista de contas salvas.
      if (identity && !accounts.some((a) => a.id === identity.id)) {
        accounts = [...accounts, identity]
        persistAccounts(accounts)
      }
      set({ identity, accounts, identityHydrated: true })
    } catch (e) {
      console.warn("[review] failed to hydrate identity:", e)
      set({ identityHydrated: true })
    }
  },

  setIdentity: async (name, colorToken) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const { identity: existing, identityDraftMode, accounts } = get()
    // Modo "new" cria outra conta mesmo já havendo uma atual; senão edita a
    // atual mantendo o id (preserva a autoria dos comentários já feitos).
    const isNew = identityDraftMode === "new" || !existing
    const identity: ReviewIdentity = isNew
      ? {
          id: makeId("rev"),
          name: trimmed,
          colorToken,
          createdAt: Date.now(),
        }
      : { ...existing, name: trimmed, colorToken }
    await get().storage.setIdentity(identity)
    const nextAccounts = isNew
      ? [...accounts, identity]
      : accounts.map((a) => (a.id === identity.id ? identity : a))
    if (!nextAccounts.some((a) => a.id === identity.id)) nextAccounts.push(identity)
    persistAccounts(nextAccounts)
    set({
      identity,
      accounts: nextAccounts,
      identityModalOpen: false,
      identityDraftMode: "edit",
    })
  },

  closeIdentityModal: () => {
    if (!get().identity) {
      set({ identityModalOpen: false, active: false, identityDraftMode: "edit" })
      return
    }
    set({ identityModalOpen: false, identityDraftMode: "edit" })
  },

  openIdentityModal: (mode = "edit") =>
    set({ identityModalOpen: true, identityDraftMode: mode }),

  addAccount: () => set({ identityModalOpen: true, identityDraftMode: "new" }),

  switchIdentity: async (id) => {
    const account = get().accounts.find((a) => a.id === id)
    if (!account || account.id === get().identity?.id) return
    await get().storage.setIdentity(account)
    set({ identity: account })
  },

  startDraw: (point, colorToken) => {
    set({
      drawingPath: [point],
      pendingAnchor: null,
    })
    void colorToken
  },

  appendDrawPoint: (point) => {
    const path = get().drawingPath
    if (!path) return
    const last = path[path.length - 1]
    if (last && Math.abs(last.x - point.x) < 0.05 && Math.abs(last.y - point.y) < 0.05) {
      return
    }
    set({ drawingPath: [...path, point] })
  },

  endDraw: (el) => {
    const path = get().drawingPath
    const identity = get().identity
    if (!path || path.length < 2 || !identity) {
      set({ drawingPath: null })
      return
    }
    // Quantiza os pontos antes de persistir: um traço à mão tem ~350 pontos e a
    // precisão de float crua não muda nada visualmente (sub-pixel), mas dobra/
    // triplica o peso do anchor no JSON. px -> inteiro, frações -> 4 casas.
    const drawPath: ReviewDrawPath = {
      points: path.map(quantizePoint),
      strokeColorToken: identity.colorToken,
      strokeWidth: DEFAULT_STROKE_WIDTH,
    }
    const anchor: ReviewAnchor = {
      kind: "draw",
      path: drawPath,
      centroid: quantizePoint(centroidOf(path)),
      ...(el ? { el: quantizeDrawAnchor(el) } : {}),
    }
    set({ drawingPath: null, pendingAnchor: anchor })
  },

  placePin: (point, el) => {
    if (!get().identity) return
    set({
      pendingAnchor: { kind: "pin", position: point, ...(el ? { el } : {}) },
      drawingPath: null,
    })
  },

  cancelPending: () =>
    set({ drawingPath: null, pendingAnchor: null, mode: "cursor" }),

  saveComment: async (text, images) => {
    const trimmed = text.trim()
    const { pendingAnchor, identity, storage } = get()
    if ((!trimmed && (!images || images.length === 0)) || !pendingAnchor || !identity) return
    if (typeof window === "undefined") return
    const now = Date.now()
    const params = new URLSearchParams(window.location.search)
    params.delete("reviewCommentId")
    const cleanSearch = params.toString()
    // Trilha de revelação: se o pino foi solto dentro de um modal/drawer/aba,
    // grava os cliques que abriram esse estado pra reabri-lo no foco depois.
    const revealPath = snapshotRevealTrail(window.location.pathname)
    const comment: ReviewComment = {
      id: makeId("cmt"),
      schemaVersion: SCHEMA_VERSION as 3,
      authorId: identity.id,
      authorName: identity.name,
      authorColorToken: identity.colorToken,
      createdAt: now,
      updatedAt: now,
      url: cleanSearch
        ? `${window.location.pathname}?${cleanSearch}`
        : window.location.pathname,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      documentHeight: document.documentElement.scrollHeight,
      anchor: pendingAnchor,
      context: buildReviewCommentContext(pendingAnchor),
      text: trimmed,
      ...(images && images.length > 0 ? { images } : {}),
      ...(revealPath.length > 0 ? { revealPath } : {}),
      status: "open",
    }
    await storage.saveComment(comment)
    set({ pendingAnchor: null, mode: "cursor" })
    await get().refreshFromStorage()
  },

  selectComment: (id) => set({ selectedCommentId: id }),

  archiveDirect: async (id) => {
    const { storage, identity } = get()
    const actor = identityToActor(identity) ?? { kind: "user", id: "anonymous", name: "Anônimo" }
    if (storage.transitionComment) {
      await storage.transitionComment(id, "resolve_direct", actor)
    } else {
      // legacy fallback: mark resolved via saveComment
      const existing = await storage.getComment(id)
      if (!existing) return
      await storage.saveComment({
        ...existing,
        status: "resolved",
        updatedAt: Date.now(),
      })
    }
    if (get().selectedCommentId === id) set({ selectedCommentId: null })
    if (get().threadCommentId === id) set({ threadCommentId: null })
    await get().refreshFromStorage()
  },

  markInReview: async (id, actor) => {
    const { storage } = get()
    if (storage.transitionComment) {
      await storage.transitionComment(id, "in_review", actor)
    }
    await get().refreshFromStorage()
  },

  approveComment: async (id) => {
    const { storage, identity } = get()
    const actor = identityToActor(identity) ?? { kind: "user", id: "anonymous", name: "Anônimo" }
    if (storage.transitionComment) {
      await storage.transitionComment(id, "approve", actor)
    }
    if (get().selectedCommentId === id) set({ selectedCommentId: null })
    if (get().threadCommentId === id) set({ threadCommentId: null })
    await get().refreshFromStorage()
  },

  rejectComment: async (id) => {
    const { storage } = get()
    if (storage.transitionComment) {
      await storage.transitionComment(id, "reject")
    }
    await get().refreshFromStorage()
  },

  reopenFromArchive: async (id) => {
    const { storage } = get()
    if (storage.transitionComment) {
      await storage.transitionComment(id, "reopen_from_archive")
    }
    await get().refreshFromStorage()
    await get().loadArchivePage(true)
  },

  addReply: async (id, text, images) => {
    const trimmed = text.trim()
    if (!trimmed && (!images || images.length === 0)) return null
    const { storage, identity } = get()
    if (!storage.addReply || !identity) return null
    const reply = await storage.addReply(id, {
      authorKind: "user",
      authorId: identity.id,
      authorName: identity.name,
      authorColorToken: identity.colorToken,
      text: trimmed,
      ...(images && images.length > 0 ? { images } : {}),
    })
    await get().refreshFromStorage()
    return reply
  },

  editComment: async (id, text, images) => {
    const trimmed = text.trim()
    const { storage } = get()
    const existing =
      get().comments.find((c) => c.id === id) ??
      get().archivedComments.find((c) => c.id === id) ??
      (await storage.getComment(id))
    if (!existing) return
    // images === undefined → mantém as atuais; array (mesmo vazio) → substitui.
    const nextImages = images === undefined ? existing.images : images
    const updated: ReviewComment = {
      ...existing,
      text: trimmed,
      updatedAt: Date.now(),
    }
    if (nextImages && nextImages.length > 0) updated.images = nextImages
    else delete updated.images
    await storage.saveComment(updated)
    await get().refreshFromStorage()
  },

  addBacklogIdea: async (text, images) => {
    const trimmed = text.trim()
    const { storage, identity } = get()
    if ((!trimmed && (!images || images.length === 0)) || !identity) return
    if (typeof window === "undefined") return
    const now = Date.now()
    const comment: ReviewComment = {
      id: makeId("cmt"),
      schemaVersion: SCHEMA_VERSION as 3,
      authorId: identity.id,
      authorName: identity.name,
      authorColorToken: identity.colorToken,
      createdAt: now,
      updatedAt: now,
      url: window.location.pathname,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollY: 0,
      documentHeight: 0,
      // Âncora-sentinela: passa na validação mas NÃO vira pino — o canvas pula
      // origin "backlog". Ideia futura é avulsa, não fixada num elemento.
      anchor: { kind: "pin", position: { x: 0, y: 0 } },
      text: trimmed,
      ...(images && images.length > 0 ? { images } : {}),
      status: "backlog",
      origin: "backlog",
    }
    await storage.saveComment(comment)
    await get().refreshFromStorage()
  },

  moveToBacklog: async (id) => {
    const { storage } = get()
    const existing =
      get().comments.find((c) => c.id === id) ?? (await storage.getComment(id))
    if (!existing) return
    await storage.saveComment({ ...existing, status: "backlog", updatedAt: Date.now() })
    if (get().selectedCommentId === id) set({ selectedCommentId: null })
    if (get().threadCommentId === id) set({ threadCommentId: null })
    await get().refreshFromStorage()
  },

  restoreFromBacklog: async (id) => {
    const { storage } = get()
    const existing =
      get().comments.find((c) => c.id === id) ?? (await storage.getComment(id))
    if (!existing) return
    await storage.saveComment({ ...existing, status: "open", updatedAt: Date.now() })
    await get().refreshFromStorage()
  },

  deleteComment: async (id) => {
    await get().storage.deleteComment(id)
    if (get().selectedCommentId === id) set({ selectedCommentId: null })
    if (get().threadCommentId === id) set({ threadCommentId: null })
    await get().refreshFromStorage()
  },

  refreshFromStorage: async () => {
    try {
      const comments = await get().storage.listComments()
      set({ comments })
    } catch (e) {
      console.warn("[review] failed to load comments:", e)
    }
  },

  loadArchivePage: async (reset = true) => {
    const { storage, archiveCursor, archivedComments } = get()
    if (!storage.listArchive) {
      set({ archivedComments: [], archiveCursor: undefined, archiveLoaded: true })
      return
    }
    const filter = reset
      ? { limit: 50 }
      : { limit: 50, ...(archiveCursor ? { before: archiveCursor } : {}) }
    const page = await storage.listArchive(filter)
    const merged = reset ? page.comments : [...archivedComments, ...page.comments]
    set({
      archivedComments: merged,
      archiveCursor: page.nextCursor,
      archiveLoaded: true,
    })
  },
}))
