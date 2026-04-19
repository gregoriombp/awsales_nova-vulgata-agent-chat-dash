"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { paletteByType } from "./palette"
import {
  FRAME_PRESETS,
  MAX_ZOOM,
  MIN_ZOOM,
  type BuilderNode,
  type BuilderProject,
  type FramePreset,
  type PageFrame,
  type Viewport,
} from "./types"

function nid(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function createNode(type: string): BuilderNode {
  const item = paletteByType[type]
  if (!item) throw new Error(`Unknown palette type: ${type}`)
  return {
    id: nid("n"),
    type,
    props: { ...item.defaultProps },
    children: item.isContainer ? [] : undefined,
  }
}

function createFrame(
  preset: FramePreset,
  position: { x: number; y: number },
  name: string
): PageFrame {
  const { width, height } = FRAME_PRESETS[preset]
  const now = new Date().toISOString()
  return {
    id: nid("p"),
    name,
    rootNodes: [],
    position,
    size: { width, height },
    createdAt: now,
    updatedAt: now,
  }
}

function createEmptyProject(): BuilderProject {
  return {
    id: nid("prj"),
    name: "Projeto sem nome",
    pages: [createFrame("desktop", { x: 120, y: 120 }, "Home")],
    viewport: { x: 80, y: 60, zoom: 0.5 },
  }
}

function addChildTo(
  nodes: BuilderNode[],
  parentId: string,
  child: BuilderNode
): BuilderNode[] {
  return nodes.map((n) => {
    if (n.id === parentId && n.children !== undefined) {
      return { ...n, children: [...n.children, child] }
    }
    if (n.children) {
      return { ...n, children: addChildTo(n.children, parentId, child) }
    }
    return n
  })
}

function mapNode(
  nodes: BuilderNode[],
  id: string,
  updater: (n: BuilderNode) => BuilderNode
): BuilderNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n)
    if (n.children) return { ...n, children: mapNode(n.children, id, updater) }
    return n
  })
}

function removeFromTree(nodes: BuilderNode[], id: string): BuilderNode[] {
  const out: BuilderNode[] = []
  for (const n of nodes) {
    if (n.id === id) continue
    if (n.children) out.push({ ...n, children: removeFromTree(n.children, id) })
    else out.push(n)
  }
  return out
}

function mapFrame(
  pages: PageFrame[],
  id: string,
  updater: (f: PageFrame) => PageFrame
): PageFrame[] {
  return pages.map((f) => (f.id === id ? updater(f) : f))
}

export function findNode(
  nodes: BuilderNode[],
  id: string
): BuilderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const f = findNode(n.children, id)
      if (f) return f
    }
  }
  return null
}

export function findFrameOfNode(
  project: BuilderProject,
  nodeId: string
): PageFrame | null {
  for (const frame of project.pages) {
    if (findNode(frame.rootNodes, nodeId)) return frame
  }
  return null
}

function isDescendantOrSelf(node: BuilderNode, targetId: string): boolean {
  if (node.id === targetId) return true
  if (!node.children) return false
  for (const c of node.children) {
    if (isDescendantOrSelf(c, targetId)) return true
  }
  return false
}

function nextFramePosition(
  pages: PageFrame[],
  size: { width: number; height: number }
): { x: number; y: number } {
  if (pages.length === 0) return { x: 120, y: 120 }
  let maxRight = -Infinity
  let topY = Infinity
  for (const p of pages) {
    const right = p.position.x + p.size.width
    if (right > maxRight) maxRight = right
    if (p.position.y < topY) topY = p.position.y
  }
  return {
    x: maxRight + 96,
    y: topY === Infinity ? 120 : topY,
  }
}

export type BuilderState = {
  project: BuilderProject
  selectedFrameId: string | null
  selectedNodeId: string | null
  // node ops
  addNodeAt: (type: string, frameId: string, parentId: string | "root") => void
  updateProps: (nodeId: string, patch: Record<string, unknown>) => void
  removeNode: (nodeId: string) => void
  moveNode: (
    nodeId: string,
    targetFrameId: string,
    targetParentId: string | "root"
  ) => void
  // frame ops
  addFrame: (preset?: FramePreset) => void
  updateFrame: (
    frameId: string,
    patch: Partial<Pick<PageFrame, "name" | "position" | "size">>
  ) => void
  removeFrame: (frameId: string) => void
  duplicateFrame: (frameId: string) => void
  // selection
  selectFrame: (id: string | null) => void
  selectNode: (id: string | null) => void
  clearSelection: () => void
  // viewport
  setViewport: (v: Viewport) => void
  panBy: (dx: number, dy: number) => void
  zoomAt: (cursor: { x: number; y: number }, multiplier: number) => void
  resetViewport: () => void
  // reset
  reset: () => void
}

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      project: createEmptyProject(),
      selectedFrameId: null,
      selectedNodeId: null,
      addNodeAt: (type, frameId, parentId) =>
        set((state) => {
          const node = createNode(type)
          const updatedAt = new Date().toISOString()
          const pages = mapFrame(state.project.pages, frameId, (f) => ({
            ...f,
            rootNodes:
              parentId === "root"
                ? [...f.rootNodes, node]
                : addChildTo(f.rootNodes, parentId, node),
            updatedAt,
          }))
          return {
            project: { ...state.project, pages },
            selectedNodeId: node.id,
            selectedFrameId: frameId,
          }
        }),
      updateProps: (nodeId, patch) =>
        set((state) => {
          const frame = findFrameOfNode(state.project, nodeId)
          if (!frame) return {}
          const pages = mapFrame(state.project.pages, frame.id, (f) => ({
            ...f,
            rootNodes: mapNode(f.rootNodes, nodeId, (n) => ({
              ...n,
              props: { ...n.props, ...patch },
            })),
            updatedAt: new Date().toISOString(),
          }))
          return { project: { ...state.project, pages } }
        }),
      removeNode: (nodeId) =>
        set((state) => {
          const frame = findFrameOfNode(state.project, nodeId)
          if (!frame) return {}
          const pages = mapFrame(state.project.pages, frame.id, (f) => ({
            ...f,
            rootNodes: removeFromTree(f.rootNodes, nodeId),
            updatedAt: new Date().toISOString(),
          }))
          return {
            project: { ...state.project, pages },
            selectedNodeId:
              state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          }
        }),
      moveNode: (nodeId, targetFrameId, targetParentId) =>
        set((state) => {
          const srcFrame = findFrameOfNode(state.project, nodeId)
          if (!srcFrame) return {}
          const node = findNode(srcFrame.rootNodes, nodeId)
          if (!node) return {}
          if (
            targetParentId !== "root" &&
            isDescendantOrSelf(node, targetParentId)
          ) {
            return {}
          }
          const updatedAt = new Date().toISOString()
          let pages = mapFrame(state.project.pages, srcFrame.id, (f) => ({
            ...f,
            rootNodes: removeFromTree(f.rootNodes, nodeId),
            updatedAt,
          }))
          pages = mapFrame(pages, targetFrameId, (f) => ({
            ...f,
            rootNodes:
              targetParentId === "root"
                ? [...f.rootNodes, node]
                : addChildTo(f.rootNodes, targetParentId, node),
            updatedAt,
          }))
          return {
            project: { ...state.project, pages },
            selectedFrameId: targetFrameId,
            selectedNodeId: nodeId,
          }
        }),
      addFrame: (preset = "desktop") =>
        set((state) => {
          const dims = FRAME_PRESETS[preset]
          const position = nextFramePosition(state.project.pages, dims)
          const frame = createFrame(
            preset,
            position,
            `Página ${state.project.pages.length + 1}`
          )
          return {
            project: {
              ...state.project,
              pages: [...state.project.pages, frame],
            },
            selectedFrameId: frame.id,
            selectedNodeId: null,
          }
        }),
      updateFrame: (frameId, patch) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: mapFrame(state.project.pages, frameId, (f) => ({
              ...f,
              ...patch,
              updatedAt: new Date().toISOString(),
            })),
          },
        })),
      removeFrame: (frameId) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.filter((f) => f.id !== frameId),
          },
          selectedFrameId:
            state.selectedFrameId === frameId ? null : state.selectedFrameId,
          selectedNodeId:
            state.selectedFrameId === frameId ? null : state.selectedNodeId,
        })),
      duplicateFrame: (frameId) =>
        set((state) => {
          const src = state.project.pages.find((f) => f.id === frameId)
          if (!src) return {}
          const cloneNode = (n: BuilderNode): BuilderNode => ({
            ...n,
            id: nid("n"),
            props: { ...n.props },
            children: n.children ? n.children.map(cloneNode) : n.children,
          })
          const now = new Date().toISOString()
          const copy: PageFrame = {
            ...src,
            id: nid("p"),
            name: `${src.name} (cópia)`,
            position: { x: src.position.x + 48, y: src.position.y + 48 },
            rootNodes: src.rootNodes.map(cloneNode),
            createdAt: now,
            updatedAt: now,
          }
          return {
            project: {
              ...state.project,
              pages: [...state.project.pages, copy],
            },
            selectedFrameId: copy.id,
            selectedNodeId: null,
          }
        }),
      selectFrame: (id) =>
        set({ selectedFrameId: id, selectedNodeId: null }),
      selectNode: (id) => {
        if (id === null) {
          set({ selectedNodeId: null })
          return
        }
        const state = get()
        const frame = findFrameOfNode(state.project, id)
        set({ selectedNodeId: id, selectedFrameId: frame?.id ?? null })
      },
      clearSelection: () =>
        set({ selectedNodeId: null, selectedFrameId: null }),
      setViewport: (v) =>
        set((state) => ({
          project: { ...state.project, viewport: v },
        })),
      panBy: (dx, dy) =>
        set((state) => ({
          project: {
            ...state.project,
            viewport: {
              ...state.project.viewport,
              x: state.project.viewport.x + dx,
              y: state.project.viewport.y + dy,
            },
          },
        })),
      zoomAt: (cursor, multiplier) =>
        set((state) => {
          const v = state.project.viewport
          const clamped = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, v.zoom * multiplier)
          )
          if (clamped === v.zoom) return {}
          const worldX = (cursor.x - v.x) / v.zoom
          const worldY = (cursor.y - v.y) / v.zoom
          const newX = cursor.x - worldX * clamped
          const newY = cursor.y - worldY * clamped
          return {
            project: {
              ...state.project,
              viewport: { x: newX, y: newY, zoom: clamped },
            },
          }
        }),
      resetViewport: () =>
        set((state) => ({
          project: {
            ...state.project,
            viewport: { x: 80, y: 60, zoom: 0.5 },
          },
        })),
      reset: () =>
        set({
          project: createEmptyProject(),
          selectedFrameId: null,
          selectedNodeId: null,
        }),
    }),
    {
      name: "bombardier-page-builder-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ project: s.project }),
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2 || !persisted || typeof persisted !== "object") {
          return { project: createEmptyProject() } as Partial<BuilderState>
        }
        return persisted as Partial<BuilderState>
      },
    }
  )
)
