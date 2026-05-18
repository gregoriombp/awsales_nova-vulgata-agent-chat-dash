"use client"

import { create } from "zustand"
import { LocalStorageReview } from "@/components/bombardier-review/storage/localStorage"
import { RemoteBridgeReview } from "@/components/bombardier-review/storage/remoteBridge"
import type { ReviewStorage } from "@/components/bombardier-review/storage/types"
import { makeId } from "@/components/bombardier-review/storage/utils"
import type {
  ReviewAnchor,
  ReviewComment,
  ReviewDrawPath,
  ReviewIdentity,
  ReviewMode,
  ReviewPoint,
} from "@/components/bombardier-review/types"
import { DEFAULT_STROKE_WIDTH, SCHEMA_VERSION } from "@/components/bombardier-review/constants"

export type StorageBackend = "local" | "bridge"

function pickStorage(): { storage: ReviewStorage; backend: StorageBackend } {
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
  return { storage: new LocalStorageReview(), backend: "local" }
}

const initial = pickStorage()

type ReviewState = {
  storage: ReviewStorage
  backend: StorageBackend

  active: boolean
  mode: ReviewMode
  sheetOpen: boolean
  exportOpen: boolean
  /** When false, resolved comments are hidden from the canvas and sheet. */
  showResolved: boolean

  identity: ReviewIdentity | null
  identityModalOpen: boolean
  identityHydrated: boolean

  drawingPath: ReviewPoint[] | null
  pendingAnchor: ReviewAnchor | null

  comments: ReviewComment[]
  selectedCommentId: string | null

  toggleActive: () => void
  setActive: (active: boolean) => void
  setMode: (mode: ReviewMode) => void
  cycleMode: () => void
  toggleSheet: () => void
  setSheetOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  toggleShowResolved: () => void

  hydrateIdentity: () => Promise<void>
  setIdentity: (name: string, colorToken: string) => Promise<void>
  closeIdentityModal: () => void

  startDraw: (point: ReviewPoint, colorToken: string) => void
  appendDrawPoint: (point: ReviewPoint) => void
  endDraw: () => void
  placePin: (point: ReviewPoint) => void
  cancelPending: () => void
  saveComment: (text: string) => Promise<void>

  selectComment: (id: string | null) => void
  resolveComment: (id: string) => Promise<void>
  reopenComment: (id: string) => Promise<void>
  deleteComment: (id: string) => Promise<void>
  refreshFromStorage: () => Promise<void>
}

function centroidOf(points: ReviewPoint[]): ReviewPoint {
  if (points.length === 0) return { x: 50, y: 50 }
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  )
  return { x: sum.x / points.length, y: sum.y / points.length }
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  storage: initial.storage,
  backend: initial.backend,

  active: false,
  mode: "cursor",
  sheetOpen: false,
  exportOpen: false,
  showResolved: false,

  identity: null,
  identityModalOpen: false,
  identityHydrated: false,

  drawingPath: null,
  pendingAnchor: null,

  comments: [],
  selectedCommentId: null,

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
    const order: ReviewMode[] = ["cursor", "draw", "pin"]
    const idx = order.indexOf(get().mode)
    set({
      mode: order[(idx + 1) % order.length],
      drawingPath: null,
      pendingAnchor: null,
    })
  },

  toggleSheet: () => set((s) => ({ sheetOpen: !s.sheetOpen })),
  setSheetOpen: (open) => set({ sheetOpen: open }),
  setExportOpen: (open) => set({ exportOpen: open }),
  toggleShowResolved: () => set((s) => ({ showResolved: !s.showResolved })),

  hydrateIdentity: async () => {
    const identity = await get().storage.getIdentity()
    set({ identity, identityHydrated: true })
  },

  setIdentity: async (name, colorToken) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const existing = get().identity
    const identity: ReviewIdentity = existing
      ? { ...existing, name: trimmed, colorToken }
      : {
          id: makeId("rev"),
          name: trimmed,
          colorToken,
          createdAt: Date.now(),
        }
    await get().storage.setIdentity(identity)
    set({ identity, identityModalOpen: false })
  },

  closeIdentityModal: () => {
    if (!get().identity) {
      set({ identityModalOpen: false, active: false })
      return
    }
    set({ identityModalOpen: false })
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

  endDraw: () => {
    const path = get().drawingPath
    const identity = get().identity
    if (!path || path.length < 2 || !identity) {
      set({ drawingPath: null })
      return
    }
    const drawPath: ReviewDrawPath = {
      points: path,
      strokeColorToken: identity.colorToken,
      strokeWidth: DEFAULT_STROKE_WIDTH,
    }
    const anchor: ReviewAnchor = {
      kind: "draw",
      path: drawPath,
      centroid: centroidOf(path),
    }
    set({ drawingPath: null, pendingAnchor: anchor })
  },

  placePin: (point) => {
    if (!get().identity) return
    set({
      pendingAnchor: { kind: "pin", position: point },
      drawingPath: null,
    })
  },

  cancelPending: () =>
    set({ drawingPath: null, pendingAnchor: null, mode: "cursor" }),

  saveComment: async (text) => {
    const trimmed = text.trim()
    const { pendingAnchor, identity, storage } = get()
    if (!trimmed || !pendingAnchor || !identity) return
    if (typeof window === "undefined") return
    const now = Date.now()
    const comment: ReviewComment = {
      id: makeId("cmt"),
      schemaVersion: SCHEMA_VERSION,
      authorId: identity.id,
      authorName: identity.name,
      authorColorToken: identity.colorToken,
      createdAt: now,
      updatedAt: now,
      url: window.location.pathname + window.location.search,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      documentHeight: document.documentElement.scrollHeight,
      anchor: pendingAnchor,
      text: trimmed,
      status: "open",
    }
    await storage.saveComment(comment)
    set({ pendingAnchor: null, mode: "cursor" })
    await get().refreshFromStorage()
  },

  selectComment: (id) => set({ selectedCommentId: id }),

  resolveComment: async (id) => {
    const { storage, identity } = get()
    const existing = await storage.getComment(id)
    if (!existing) return
    await storage.saveComment({
      ...existing,
      status: "resolved",
      resolvedBy: identity?.name,
      resolvedAt: Date.now(),
      updatedAt: Date.now(),
    })
    await get().refreshFromStorage()
  },

  reopenComment: async (id) => {
    const { storage } = get()
    const existing = await storage.getComment(id)
    if (!existing) return
    await storage.saveComment({
      ...existing,
      status: "open",
      resolvedBy: undefined,
      resolvedAt: undefined,
      updatedAt: Date.now(),
    })
    await get().refreshFromStorage()
  },

  deleteComment: async (id) => {
    await get().storage.deleteComment(id)
    if (get().selectedCommentId === id) set({ selectedCommentId: null })
    await get().refreshFromStorage()
  },

  refreshFromStorage: async () => {
    const comments = await get().storage.listComments()
    set({ comments })
  },
}))
