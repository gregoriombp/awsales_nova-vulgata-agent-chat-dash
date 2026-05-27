"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { AwSheet } from "@/components/ui/AwSheet"

/* ─────────────────────────────────────────────────────────────────────
 * Bridge config — read from env at module load. Both are required.
 * If missing, the UI shows a setup hint instead of attempting fetches.
 * ──────────────────────────────────────────────────────────────────── */

const BRIDGE_URL =
  process.env.NEXT_PUBLIC_BOMBARDIER_FLOW_BRIDGE_URL?.replace(/\/+$/, "") ?? ""
const BRIDGE_TOKEN = process.env.NEXT_PUBLIC_BOMBARDIER_FLOW_TOKEN ?? ""
const BRIDGE_CONFIGURED = BRIDGE_URL.length > 0 && BRIDGE_TOKEN.length > 0

function bridgeHeaders(extra?: Record<string, string>): HeadersInit {
  return { "x-flow-token": BRIDGE_TOKEN, ...extra }
}

/* ─────────────────────────────────────────────────────────────────────
 * Shared types
 * ──────────────────────────────────────────────────────────────────── */

export type ScreenData = {
  step: string
  title: string
  href: string
  note?: string
}

export type DecisionData = {
  step: string
  title: string
  question: string
}

export type SuggestionStatus = "open" | "in_review" | "applied" | "discarded"

export type SuggestionActor = {
  kind: "agent" | "user"
  id: string
  name: string
}

export type Suggestion = {
  id: string
  schemaVersion: 1
  flow: string
  description: string
  createdAt: number
  updatedAt: number
  authorName?: string
  status: SuggestionStatus
  resolution?: { actor: SuggestionActor; at: number; summary: string }
  nodes: Node[]
  edges: Edge[]
}

const USER_ACTOR: SuggestionActor = { kind: "user", id: "user", name: "Usuário" }

/* ─────────────────────────────────────────────────────────────────────
 * Editor context — lets nodes know if we're in edit mode and how to
 * trigger the inline edit modal from inside their own UI.
 * ──────────────────────────────────────────────────────────────────── */

type EditorCtx = {
  mode: "view" | "edit"
  onEditNode: (id: string) => void
  onPreviewScreen: (data: ScreenData) => void
}

const FlowEditorContext = createContext<EditorCtx>({
  mode: "view",
  onEditNode: () => {},
  onPreviewScreen: () => {},
})

function EditPencil({ id }: { id: string }) {
  const { onEditNode } = useContext(FlowEditorContext)
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditNode(id) }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      title="Editar"
      className="absolute top-1.5 right-1.5 w-5 h-5 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--fg-tertiary)] hover:text-[var(--aw-blue-700)] hover:border-[var(--aw-blue-400)] transition"
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path
          d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Node renderers
 * ──────────────────────────────────────────────────────────────────── */

export function ScreenNode({ id, data }: NodeProps<Node<ScreenData>>) {
  const { mode } = useContext(FlowEditorContext)
  const cursor = mode === "view" ? "cursor-pointer" : ""
  return (
    <div className={`relative block w-[200px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-raised)] shadow-[var(--shadow-sm)] hover:border-[var(--aw-blue-400)] hover:shadow-[var(--shadow-md)] transition ${cursor}`}>
      <Handle type="target" position={Position.Top} className="!bg-[var(--aw-blue-500)] !border-0 !w-2 !h-2" />
      <div className="px-4 py-3 flex flex-col gap-1">
        <span className="aw-eyebrow text-[var(--aw-blue-700)]">{data.step}</span>
        <span className="text-sm font-medium text-[var(--fg-primary)] leading-tight">{data.title}</span>
        {data.note && <span className="caption text-[var(--fg-tertiary)]">{data.note}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--aw-blue-500)] !border-0 !w-2 !h-2" />
      {mode === "edit" && <EditPencil id={id} />}
    </div>
  )
}

export function DecisionNode({ id, data }: NodeProps<Node<DecisionData>>) {
  const { mode } = useContext(FlowEditorContext)
  const hCls = "!bg-[var(--aw-amber-500)] !border-0 !w-2 !h-2"
  return (
    <div className="relative w-[240px] rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--aw-amber-400)] bg-[var(--aw-amber-100)] px-4 py-3 flex flex-col gap-1">
      <Handle type="target" position={Position.Top} className={hCls} />
      <span className="aw-eyebrow text-[var(--aw-amber-800)]">decisão · {data.step}</span>
      <span className="text-sm font-medium text-[var(--aw-amber-900)] leading-tight">{data.title}</span>
      <span className="text-xs text-[var(--aw-amber-800)] leading-snug">{data.question}</span>
      <Handle id="left"   type="source" position={Position.Left}   className={hCls} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={hCls} />
      <Handle id="right"  type="source" position={Position.Right}  className={hCls} />
      {mode === "edit" && <EditPencil id={id} />}
    </div>
  )
}

export const nodeTypes = { screen: ScreenNode, decision: DecisionNode }

/* ─────────────────────────────────────────────────────────────────────
 * Edge styling — exported so flow pages can keep using the same look
 * even when they author edges directly.
 * ──────────────────────────────────────────────────────────────────── */

export const edgeBase: Partial<Edge> = {
  type: "smoothstep",
  animated: false,
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: { stroke: "var(--border-strong)", strokeWidth: 1.5 },
}

export const branchEdge: Partial<Edge> = {
  ...edgeBase,
  style: { stroke: "var(--aw-amber-500)", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "var(--aw-amber-500)" },
}

/* ─────────────────────────────────────────────────────────────────────
 * Suggestions hook — talks to the flow-bridge
 * ──────────────────────────────────────────────────────────────────── */

type BridgeError = "not-configured" | "network" | "auth" | "unknown"

function useFlowSuggestions(flow: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<BridgeError | null>(BRIDGE_CONFIGURED ? null : "not-configured")

  const refresh = useCallback(async () => {
    if (!BRIDGE_CONFIGURED) { setLoaded(true); return }
    try {
      const res = await fetch(`${BRIDGE_URL}/suggestions?flow=${encodeURIComponent(flow)}`, {
        headers: bridgeHeaders(),
        cache: "no-store",
      })
      if (res.status === 401) { setError("auth"); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { suggestions: Suggestion[] }
      setSuggestions(data.suggestions ?? [])
      setError(null)
    } catch (e) {
      console.error("flow-bridge refresh", e)
      setError("network")
    } finally {
      setLoaded(true)
    }
  }, [flow])

  useEffect(() => { void refresh() }, [refresh])

  const create = useCallback(
    async (description: string, nodes: Node[], edges: Edge[]): Promise<Suggestion | null> => {
      if (!BRIDGE_CONFIGURED) { setError("not-configured"); return null }
      try {
        const res = await fetch(`${BRIDGE_URL}/suggestions`, {
          method: "POST",
          headers: bridgeHeaders({ "content-type": "application/json" }),
          body: JSON.stringify({ flow, description, nodes, edges }),
        })
        if (res.status === 401) { setError("auth"); return null }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { suggestion: Suggestion }
        setSuggestions((prev) => [data.suggestion, ...prev])
        return data.suggestion
      } catch (e) {
        console.error("flow-bridge create", e)
        setError("network")
        return null
      }
    },
    [flow],
  )

  const transition = useCallback(
    async (
      id: string,
      kind: "apply" | "discard" | "reject",
      actor: SuggestionActor = USER_ACTOR,
    ): Promise<boolean> => {
      if (!BRIDGE_CONFIGURED) { setError("not-configured"); return false }
      try {
        const body =
          kind === "reject"
            ? { transition: "reject" }
            : { transition: kind, actor }
        const res = await fetch(`${BRIDGE_URL}/suggestions/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: bridgeHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(body),
        })
        if (res.status === 401) { setError("auth"); return false }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await refresh()
        return true
      } catch (e) {
        console.error("flow-bridge transition", e)
        setError("network")
        return false
      }
    },
    [refresh],
  )

  return { suggestions, loaded, error, refresh, create, transition }
}

/* ─────────────────────────────────────────────────────────────────────
 * Node edit modal
 * ──────────────────────────────────────────────────────────────────── */

type NodeDraft =
  | { kind: "screen"; step: string; title: string; href: string; note: string }
  | { kind: "decision"; step: string; title: string; question: string }

function toDraft(node: Node): NodeDraft {
  if (node.type === "decision") {
    const d = node.data as DecisionData
    return { kind: "decision", step: d.step ?? "", title: d.title ?? "", question: d.question ?? "" }
  }
  const d = node.data as ScreenData
  return { kind: "screen", step: d.step ?? "", title: d.title ?? "", href: d.href ?? "#", note: d.note ?? "" }
}

function NodeEditModal({
  target,
  onCancel,
  onSave,
}: {
  target: Node
  onCancel: () => void
  onSave: (next: Node) => void
}) {
  const [draft, setDraft] = useState<NodeDraft>(() => toDraft(target))

  function commit() {
    if (draft.kind === "screen") {
      onSave({
        ...target,
        type: "screen",
        data: { step: draft.step, title: draft.title, href: draft.href || "#", note: draft.note || undefined },
      })
    } else {
      onSave({
        ...target,
        type: "decision",
        data: { step: draft.step, title: draft.title, question: draft.question },
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="bg-[var(--bg-raised)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] w-full max-w-md mx-4 p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-[var(--fg-primary)] m-0">
            Editar {draft.kind === "screen" ? "tela" : "decisão"}
          </h2>
          <p className="text-sm text-[var(--fg-secondary)] mt-1 m-0">
            {draft.kind === "screen"
              ? "Título aparece no card. A descrição explica pra que essa tela serve. Link aponta pro protótipo."
              : "Título aparece no card. A pergunta deixa clara qual decisão o fluxo está tomando."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
            <label className="text-xs font-medium text-[var(--fg-secondary)] pt-2">Etapa</label>
            <input
              type="text" value={draft.step}
              placeholder="ex: 02, decisão A, →plataforma"
              onChange={(e) => setDraft({ ...draft, step: e.target.value })}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)]"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
            <label className="text-xs font-medium text-[var(--fg-secondary)] pt-2">Título</label>
            <input
              type="text" value={draft.title}
              placeholder={draft.kind === "screen" ? "ex: Login" : "ex: Credenciais válidas?"}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)]"
            />
          </div>

          {draft.kind === "screen" ? (
            <>
              <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                <label className="text-xs font-medium text-[var(--fg-secondary)] pt-2">Descrição</label>
                <textarea
                  value={draft.note} rows={3}
                  placeholder="Pra que essa tela serve, o que o usuário faz nela…"
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)] resize-none"
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                <label className="text-xs font-medium text-[var(--fg-secondary)] pt-2">Link</label>
                <input
                  type="text" value={draft.href}
                  placeholder="ex: /inicio ou /bombardier/styleguide/ux-flows/login-auth"
                  onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                  className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)]"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <label className="text-xs font-medium text-[var(--fg-secondary)] pt-2">Pergunta</label>
              <textarea
                value={draft.question} rows={3}
                placeholder="ex: O usuário já tem conta ativa?"
                onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)] resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition">
            Cancelar
          </button>
          <button onClick={commit} className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--aw-blue-600)] text-white text-sm font-medium hover:bg-[var(--aw-blue-700)] transition">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Status pill — compact label for a suggestion's lifecycle state
 * ──────────────────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: SuggestionStatus }) {
  const map: Record<SuggestionStatus, { label: string; bg: string; fg: string; border: string }> = {
    open: { label: "aberta", bg: "var(--aw-amber-100)", fg: "var(--aw-amber-900)", border: "var(--aw-amber-300)" },
    in_review: { label: "em revisão", bg: "var(--aw-blue-100)", fg: "var(--aw-blue-800)", border: "var(--aw-blue-200)" },
    applied: { label: "aplicada", bg: "var(--bg-muted)", fg: "var(--fg-secondary)", border: "var(--border-default)" },
    discarded: { label: "descartada", bg: "var(--bg-muted)", fg: "var(--fg-tertiary)", border: "var(--border-default)" },
  }
  const s = map[status]
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg, borderColor: s.border }}
    >
      {s.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * FlowDiagram — full editor wrapping ReactFlow
 * ──────────────────────────────────────────────────────────────────── */

let nodeIdCounter = 1
function nextNodeId() {
  return `n-${Date.now().toString(36)}-${(nodeIdCounter++).toString(36)}`
}

const NEW_SCREEN_DATA: ScreenData = {
  step: "novo",
  title: "Nova tela",
  href: "#",
  note: "Descreva pra que essa tela serve.",
}

const NEW_DECISION_DATA: DecisionData = {
  step: "?",
  title: "Nova decisão",
  question: "Qual condição o fluxo está avaliando aqui?",
}

/* ─────────────────────────────────────────────────────────────────────
 * History snapshot + auto-layout helpers
 * ──────────────────────────────────────────────────────────────────── */

type FlowSnapshot = { nodes: Node[]; edges: Edge[] }

function cloneSnapshot(s: FlowSnapshot): FlowSnapshot {
  return {
    nodes: s.nodes.map((n) => structuredClone(n)),
    edges: s.edges.map((e) => structuredClone(e)),
  }
}

// Simple top-to-bottom BFS layout. Roots (no incoming edges) sit at y=0;
// each child sits one level below its parent. Siblings spread horizontally.
function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  const children = new Map<string, string[]>()
  const incoming = new Map<string, number>()
  for (const n of nodes) {
    children.set(n.id, [])
    incoming.set(n.id, 0)
  }
  for (const e of edges) {
    children.get(e.source)?.push(e.target)
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1)
  }

  const level = new Map<string, number>()
  const roots = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0)
  const seeds = roots.length > 0 ? roots : [nodes[0]]
  const queue: { id: string; lvl: number }[] = seeds.map((n) => ({ id: n.id, lvl: 0 }))
  while (queue.length > 0) {
    const { id, lvl } = queue.shift()!
    const cur = level.get(id)
    if (cur !== undefined && cur >= lvl) continue
    level.set(id, lvl)
    for (const child of children.get(id) ?? []) {
      queue.push({ id: child, lvl: lvl + 1 })
    }
  }

  // Isolated nodes (no path from any root) → park them below the deepest level.
  const maxLvl = level.size > 0 ? Math.max(...Array.from(level.values())) : 0
  for (const n of nodes) {
    if (!level.has(n.id)) level.set(n.id, maxLvl + 2)
  }

  const byLevel = new Map<number, string[]>()
  for (const [id, lvl] of level) {
    if (!byLevel.has(lvl)) byLevel.set(lvl, [])
    byLevel.get(lvl)!.push(id)
  }

  const GAP_X = 280
  const GAP_Y = 180
  const CX = 400
  const positions = new Map<string, { x: number; y: number }>()
  for (const [lvl, ids] of byLevel) {
    const count = ids.length
    ids.forEach((id, i) => {
      positions.set(id, {
        x: CX + (i - (count - 1) / 2) * GAP_X,
        y: lvl * GAP_Y,
      })
    })
  }

  return nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position }))
}

// Strips ReactFlow-internal flags (selected, dragging, etc.) so the prompt
// JSON stays focused on the structural fields Claude needs.
function cleanForPrompt(nodes: Node[], edges: Edge[]) {
  const cleanNodes = nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
    data: n.data,
  }))
  const cleanEdges = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
    ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
    ...(e.label ? { label: e.label } : {}),
  }))
  return { nodes: cleanNodes, edges: cleanEdges }
}

export function FlowDiagram({
  flow,
  nodes: canonicalNodes,
  edges: canonicalEdges,
  height = 800,
}: {
  flow: string
  nodes: Node[]
  edges: Edge[]
  height?: number
}) {
  const [editNodes, setEditNodes, onEditNodesChange] = useNodesState(canonicalNodes)
  const [editEdges, setEditEdges, onEditEdgesChange] = useEdgesState(canonicalEdges)

  const [editMode, setEditMode] = useState(false)
  const [previewSugg, setPreviewSugg] = useState<Suggestion | null>(null)
  const [showSave, setShowSave] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [desc, setDesc] = useState("")
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewScreen, setPreviewScreen] = useState<ScreenData | null>(null)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [historyLength, setHistoryLength] = useState(0)

  const historyRef = useRef<FlowSnapshot[]>([])
  const skipPushRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { suggestions, error, create, transition } = useFlowSuggestions(flow)

  const onEditNode = useCallback((id: string) => setEditingNodeId(id), [])
  const onPreviewScreen = useCallback((data: ScreenData) => setPreviewScreen(data), [])
  const ctxValue = useMemo<EditorCtx>(
    () => ({ mode: editMode ? "edit" : "view", onEditNode, onPreviewScreen }),
    [editMode, onEditNode, onPreviewScreen],
  )

  const onNodeClick = useCallback(
    (event: ReactMouseEvent, node: Node) => {
      if (editMode || previewSugg) return
      if (node.type !== "screen") return
      const data = node.data as ScreenData
      const href = data.href || ""
      if ((event.metaKey || event.ctrlKey) && href && href !== "#" && !/^https?:/i.test(href)) {
        window.open(href, "_blank")
        return
      }
      setPreviewScreen(data)
    },
    [editMode, previewSugg],
  )

  const resetHistory = useCallback((snap: FlowSnapshot) => {
    historyRef.current = [cloneSnapshot(snap)]
    setHistoryIndex(0)
    setHistoryLength(1)
  }, [])

  const pushHistory = useCallback((snap: FlowSnapshot) => {
    setHistoryIndex((idx) => {
      const truncated = historyRef.current.slice(0, idx + 1)
      const next = [...truncated, cloneSnapshot(snap)].slice(-50)
      historyRef.current = next
      setHistoryLength(next.length)
      return next.length - 1
    })
  }, [])

  function enterEdit() {
    skipPushRef.current = true
    setEditNodes(canonicalNodes.map((n) => ({ ...n })))
    setEditEdges(canonicalEdges.map((e) => ({ ...e })))
    setPreviewSugg(null)
    setEditMode(true)
    resetHistory({ nodes: canonicalNodes, edges: canonicalEdges })
  }

  function cancelEdit() {
    setEditNodes(canonicalNodes.map((n) => ({ ...n })))
    setEditEdges(canonicalEdges.map((e) => ({ ...e })))
    setEditingNodeId(null)
    setEditMode(false)
    historyRef.current = []
    setHistoryIndex(-1)
    setHistoryLength(0)
  }

  function addNode(kind: "screen" | "decision") {
    const baseX = 200 + Math.random() * 200
    const baseY = 200 + Math.random() * 200
    const node: Node =
      kind === "screen"
        ? { id: nextNodeId(), type: "screen", position: { x: baseX, y: baseY }, data: { ...NEW_SCREEN_DATA } }
        : { id: nextNodeId(), type: "decision", position: { x: baseX, y: baseY }, data: { ...NEW_DECISION_DATA } }
    setEditNodes((nodes) => [...nodes, node])
    setEditingNodeId(node.id)
  }

  const onConnect = useCallback(
    (params: Connection) => {
      setEditEdges((edges) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "var(--aw-blue-500)" },
            style: { stroke: "var(--aw-blue-500)", strokeWidth: 1.5, strokeDasharray: "4 3" },
          },
          edges,
        ),
      )
    },
    [setEditEdges],
  )

  function saveEditedNode(next: Node) {
    setEditNodes((nodes) => nodes.map((n) => (n.id === next.id ? next : n)))
    setEditingNodeId(null)
  }

  async function confirmSave() {
    if (!desc.trim()) return
    setSaving(true)
    const created = await create(desc.trim(), editNodes, editEdges)
    setSaving(false)
    if (created) {
      setDesc("")
      setShowSave(false)
      setEditMode(false)
      setEditNodes(canonicalNodes.map((n) => ({ ...n })))
      setEditEdges(canonicalEdges.map((e) => ({ ...e })))
    }
  }

  function viewSugg(s: Suggestion) {
    setPreviewSugg(s)
    setEditMode(false)
    setShowReview(false)
  }

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = historyRef.current[historyIndex - 1]
    skipPushRef.current = true
    setEditNodes(prev.nodes.map((n) => structuredClone(n)))
    setEditEdges(prev.edges.map((e) => structuredClone(e)))
    setHistoryIndex(historyIndex - 1)
  }, [historyIndex, setEditNodes, setEditEdges])

  const redo = useCallback(() => {
    if (historyIndex >= historyLength - 1) return
    const next = historyRef.current[historyIndex + 1]
    skipPushRef.current = true
    setEditNodes(next.nodes.map((n) => structuredClone(n)))
    setEditEdges(next.edges.map((e) => structuredClone(e)))
    setHistoryIndex(historyIndex + 1)
  }, [historyIndex, historyLength, setEditNodes, setEditEdges])

  const applyAutoLayout = useCallback(() => {
    setEditNodes((prev) => autoLayout(prev, editEdges))
  }, [editEdges, setEditNodes])

  const duplicateSelected = useCallback(() => {
    const selected = editNodes.filter((n) => n.selected)
    if (selected.length === 0) return
    const dupes = selected.map((n) => ({
      ...structuredClone(n),
      id: nextNodeId(),
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      selected: true,
    }))
    setEditNodes((prev) => [
      ...prev.map((n) => ({ ...n, selected: false })),
      ...dupes,
    ])
  }, [editNodes, setEditNodes])

  const canUndo = editMode && historyIndex > 0
  const canRedo = editMode && historyIndex >= 0 && historyIndex < historyLength - 1

  // Debounced history push — captures the latest editNodes/editEdges 250ms
  // after the last change. skipPushRef short-circuits the push triggered by
  // an undo/redo (which itself called setEditNodes/setEditEdges).
  useEffect(() => {
    if (!editMode) return
    if (skipPushRef.current) {
      skipPushRef.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushHistory({ nodes: editNodes, edges: editEdges })
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [editNodes, editEdges, editMode, pushHistory])

  // Keyboard shortcuts — only active in edit mode and when not typing.
  useEffect(() => {
    if (!editMode) return
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return
      }
      const cmd = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      if (cmd && !e.shiftKey && key === "z") {
        e.preventDefault()
        undo()
      } else if (cmd && ((e.shiftKey && key === "z") || key === "y")) {
        e.preventDefault()
        redo()
      } else if (cmd && key === "d") {
        e.preventDefault()
        duplicateSelected()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [editMode, undo, redo, duplicateSelected])

  const editingNode = editingNodeId ? editNodes.find((n) => n.id === editingNodeId) ?? null : null

  const displayNodes = editMode ? editNodes : previewSugg ? previewSugg.nodes : canonicalNodes
  const displayEdges = editMode ? editEdges : previewSugg ? previewSugg.edges : canonicalEdges

  const errorMessage =
    error === "not-configured"
      ? "Flow bridge não configurado — rode /bombardier-flow-bridge no chat."
      : error === "auth"
        ? "Token do flow bridge inválido. Confira NEXT_PUBLIC_BOMBARDIER_FLOW_TOKEN."
        : error === "network"
          ? "Não foi possível falar com o flow bridge — confira se o servidor está no ar."
          : null

  return (
    <FlowEditorContext.Provider value={ctxValue}>
      <div className="relative">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {suggestions.length > 0 && !editMode && (
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--aw-amber-100)] border border-[var(--aw-amber-300)] text-xs font-medium text-[var(--aw-amber-800)] hover:bg-[var(--aw-amber-200)] transition"
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--aw-amber-500)] text-white text-[10px] font-bold">
                {suggestions.length}
              </span>
              {suggestions.length === 1 ? "sugestão" : "sugestões"}
            </button>
          )}
          {!editMode && !previewSugg && (
            <button
              onClick={enterEdit}
              disabled={!BRIDGE_CONFIGURED}
              title={!BRIDGE_CONFIGURED ? "Bridge não configurado" : undefined}
              className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-raised)] border border-[var(--border-default)] text-xs font-medium text-[var(--fg-secondary)] hover:border-[var(--aw-blue-400)] hover:text-[var(--aw-blue-700)] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Sugerir edição
            </button>
          )}
        </div>

        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden"
          style={{ backgroundColor: "var(--bg-muted)", height }}
        >
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            onNodesChange={editMode ? onEditNodesChange : undefined}
            onEdgesChange={editMode ? onEditEdgesChange : undefined}
            onConnect={editMode ? onConnect : undefined}
            onNodeClick={onNodeClick}
            nodesDraggable={editMode}
            nodesConnectable={editMode}
            elementsSelectable={editMode}
            deleteKeyCode={editMode ? ["Backspace", "Delete"] : null}
            multiSelectionKeyCode={editMode ? ["Meta", "Control"] : null}
            selectionKeyCode={editMode ? "Shift" : null}
            snapToGrid={editMode && snapEnabled}
            snapGrid={[20, 20]}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.3}
            maxZoom={1.5}
            style={{ background: "#fafafa" }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--border-default)" />
            <Controls showInteractive={false} />

            {editMode && (
              <>
                <Panel position="top-center">
                  <div className="flex items-center gap-3 bg-[var(--aw-amber-100)] border border-[var(--aw-amber-300)] rounded-[var(--radius-md)] px-4 py-2 text-sm shadow-[var(--shadow-md)]">
                    <span className="text-[var(--aw-amber-800)] font-medium">Modo sugestão</span>
                    <span className="text-[var(--aw-amber-500)]">·</span>
                    <button onClick={() => setShowSave(true)} className="text-[var(--aw-amber-900)] font-semibold hover:underline">Salvar</button>
                    <span className="text-[var(--aw-amber-500)]">·</span>
                    <button onClick={() => setShowPromptModal(true)} className="text-[var(--aw-amber-900)] font-semibold hover:underline">Copiar prompt</button>
                    <span className="text-[var(--aw-amber-500)]">·</span>
                    <button onClick={cancelEdit} className="text-[var(--aw-amber-700)] hover:text-[var(--aw-amber-900)]">Cancelar</button>
                  </div>
                </Panel>

                <Panel position="bottom-center">
                  <div className="flex items-center gap-2 bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]">
                    <span className="text-[var(--fg-tertiary)] mr-1">Adicionar:</span>
                    <button onClick={() => addNode("screen")} className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--aw-blue-100)] border border-[var(--aw-blue-200)] text-[var(--aw-blue-800)] font-medium hover:bg-[var(--aw-blue-200)] transition">
                      + Tela
                    </button>
                    <button onClick={() => addNode("decision")} className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--aw-amber-100)] border border-[var(--aw-amber-300)] text-[var(--aw-amber-900)] font-medium hover:bg-[var(--aw-amber-200)] transition">
                      + Decisão
                    </button>

                    <span className="w-px h-4 bg-[var(--border-default)] mx-1" />

                    <button
                      onClick={undo}
                      disabled={!canUndo}
                      title="Desfazer (⌘Z)"
                      aria-label="Desfazer"
                      className="px-2 py-1 rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--fg-secondary)] transition"
                    >
                      ↶
                    </button>
                    <button
                      onClick={redo}
                      disabled={!canRedo}
                      title="Refazer (⌘⇧Z)"
                      aria-label="Refazer"
                      className="px-2 py-1 rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--fg-secondary)] transition"
                    >
                      ↷
                    </button>

                    <span className="w-px h-4 bg-[var(--border-default)] mx-1" />

                    <button
                      onClick={() => setSnapEnabled((v) => !v)}
                      title={snapEnabled ? "Snap ligado — desligar" : "Snap desligado — ligar"}
                      className={
                        snapEnabled
                          ? "px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--aw-blue-100)] border border-[var(--aw-blue-200)] text-[var(--aw-blue-800)] font-medium transition"
                          : "px-2 py-1 rounded-[var(--radius-sm)] border border-transparent text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition"
                      }
                    >
                      Snap
                    </button>
                    <button
                      onClick={applyAutoLayout}
                      title="Reorganizar nós em colunas top-to-bottom"
                      className="px-2 py-1 rounded-[var(--radius-sm)] border border-transparent text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg-primary)] transition"
                    >
                      Auto-layout
                    </button>

                    <span className="text-[var(--fg-tertiary)] ml-1">· ⇧+arraste seleciona · ⌘D duplica · Delete remove</span>
                  </div>
                </Panel>
              </>
            )}

            {previewSugg && (
              <Panel position="top-center">
                <div className="flex items-center gap-3 bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2 text-sm shadow-[var(--shadow-md)]">
                  <span className="text-[var(--fg-tertiary)] text-xs uppercase tracking-wide font-medium">Sugestão</span>
                  <code className="text-[10px] font-mono px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">{previewSugg.id}</code>
                  <StatusPill status={previewSugg.status} />
                  <span className="text-[var(--fg-primary)] font-medium max-w-xs truncate">{previewSugg.description}</span>
                  <span className="text-[var(--fg-tertiary)]">·</span>
                  <button onClick={() => setPreviewSugg(null)} className="text-[var(--aw-blue-700)] font-medium hover:underline whitespace-nowrap">Voltar ao fluxo oficial</button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {errorMessage && (
          <p className="mt-2 text-xs text-[var(--aw-red-700)]">{errorMessage}</p>
        )}
      </div>

      {showSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !saving && setShowSave(false)}>
          <div className="bg-[var(--bg-raised)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] w-full max-w-md mx-4 p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-base font-semibold text-[var(--fg-primary)] m-0">Salvar sugestão</h2>
              <p className="text-sm text-[var(--fg-secondary)] mt-1 m-0">Descreva o que muda nesse fluxo. O Claude lê isso pra entender a intenção da edição.</p>
            </div>
            <textarea
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)] resize-none"
              placeholder="Ex: adicionei bloqueio de conta após 5 tentativas inválidas…"
              rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSave(false)} disabled={saving} className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition disabled:opacity-40">Cancelar</button>
              <button onClick={confirmSave} disabled={!desc.trim() || saving} className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--aw-blue-600)] text-white text-sm font-medium hover:bg-[var(--aw-blue-700)] disabled:opacity-40 disabled:cursor-not-allowed transition">
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReview(false)}>
          <div className="bg-[var(--bg-raised)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] w-full max-w-lg mx-4 p-6 flex flex-col gap-4 max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--fg-primary)] m-0">
                Sugestões
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--aw-amber-500)] text-white text-[10px] font-bold align-middle">{suggestions.length}</span>
              </h2>
              <button onClick={() => setShowReview(false)} className="text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-[var(--fg-secondary)] m-0 -mt-2">
              Sugestões vivem no flow-bridge (LAN). Mande o ID pro Claude no chat (<em>"avalia a sugestão X do flow {flow}"</em>) pra ele propor a aplicação. Aprovar arquiva, rejeitar volta pra aberta.
            </p>
            <ul className="flex flex-col gap-3 overflow-y-auto m-0 p-0 list-none">
              {suggestions.map((s) => (
                <li key={s.id} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col gap-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">{s.id}</code>
                    <StatusPill status={s.status} />
                    <span className="caption text-[var(--fg-tertiary)]">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="m-0 text-sm font-medium text-[var(--fg-primary)] leading-snug">{s.description}</p>
                  {s.resolution && (
                    <p className="m-0 caption text-[var(--fg-tertiary)] italic">{s.resolution.summary}</p>
                  )}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <button onClick={() => viewSugg(s)} className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--aw-blue-600)] text-white text-xs font-medium hover:bg-[var(--aw-blue-700)] transition">Visualizar</button>
                    <button
                      onClick={() => navigator.clipboard?.writeText(`avalia a sugestão ${s.id} do flow ${flow}`)}
                      className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition"
                    >
                      Copiar prompt
                    </button>
                    {s.status === "in_review" && (
                      <>
                        <button
                          onClick={() => void transition(s.id, "apply")}
                          className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--aw-emerald-700)] text-white text-xs font-medium hover:bg-[var(--aw-emerald-800)] transition"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => void transition(s.id, "reject")}
                          className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => void transition(s.id, "discard")}
                      className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition"
                    >
                      Descartar
                    </button>
                  </div>
                </li>
              ))}
              {suggestions.length === 0 && (
                <li className="text-sm text-[var(--fg-tertiary)] text-center py-6">Nenhuma sugestão ativa.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {editingNode && (
        <NodeEditModal
          target={editingNode}
          onCancel={() => setEditingNodeId(null)}
          onSave={saveEditedNode}
        />
      )}

      {showPromptModal && (
        <CopyPromptModal
          flow={flow}
          nodes={editMode ? editNodes : canonicalNodes}
          edges={editMode ? editEdges : canonicalEdges}
          onClose={() => setShowPromptModal(false)}
        />
      )}

      <ScreenPreviewDrawer
        screen={previewScreen}
        onClose={() => setPreviewScreen(null)}
      />
    </FlowEditorContext.Provider>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * CopyPromptModal — produces a copy-pasteable prompt with the flow's
 * NODES/EDGES embedded as JSON. Two modes: ask Claude to apply the
 * edit to this flow's page.tsx, or to scaffold the product routes
 * from the flow's screen nodes.
 * ──────────────────────────────────────────────────────────────────── */

function CopyPromptModal({
  flow,
  nodes,
  edges,
  onClose,
}: {
  flow: string
  nodes: Node[]
  edges: Edge[]
  onClose: () => void
}) {
  const [mode, setMode] = useState<"flow-update" | "product-routes">("flow-update")
  const [copied, setCopied] = useState(false)

  const prompt = useMemo(() => {
    const clean = cleanForPrompt(nodes, edges)
    if (mode === "flow-update") {
      return [
        `Por favor, atualize o flow \`${flow}\` no styleguide com a estrutura abaixo.`,
        ``,
        `Arquivo: \`app/bombardier/styleguide/ux-flows/${flow}/page.tsx\``,
        `- Substitua os arrays \`NODES\` e \`EDGES\` pelos JSONs abaixo`,
        `- Mantenha o resto da página (PageHero, Section, lista de screens, decisões de design)`,
        `- Para arestas, decida entre \`edgeBase\` (linha cinza) e \`branchEdge\` (linha âmbar) pelo contexto — saídas de nó \`decision\` viram \`branchEdge\``,
        `- Adicione uma entrada no topo do array \`updates\` descrevendo a mudança`,
        ``,
        `NODES:`,
        "```json",
        JSON.stringify(clean.nodes, null, 2),
        "```",
        ``,
        `EDGES:`,
        "```json",
        JSON.stringify(clean.edges, null, 2),
        "```",
      ].join("\n")
    }

    const screens = clean.nodes.filter((n) => n.type === "screen")
    const screenList = screens
      .map((s) => {
        const data = s.data as ScreenData
        return `- \`${data.href}\` — ${data.title}${data.note ? ` — ${data.note}` : ""}`
      })
      .join("\n")

    return [
      `Por favor, scaffold as rotas reais do produto baseadas no flow \`${flow}\`.`,
      ``,
      `Para cada nó "screen" com href começando com \`/\` (rota interna do produto):`,
      `- Crie \`app/<href>/page.tsx\` com layout do app e título da tela`,
      `- Reuse componentes existentes do styleguide; só crie componentes novos como último recurso`,
      `- Não crie páginas para nós "decision" — são só pontos lógicos`,
      ``,
      `Screens a criar:`,
      screenList || "(nenhuma screen com href interno encontrada)",
      ``,
      `Flow completo (JSON pra contexto):`,
      "```json",
      JSON.stringify({ flow, ...clean }, null, 2),
      "```",
    ].join("\n")
  }, [flow, nodes, edges, mode])

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked — silently ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-[var(--bg-raised)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] w-full max-w-xl mx-4 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-0 flex flex-col gap-1.5">
          <h2 className="text-base font-semibold text-[var(--fg-primary)] m-0">Copiar prompt pro Claude</h2>
          <p className="text-sm text-[var(--fg-secondary)] m-0 leading-relaxed">
            Cola no chat com o Claude. O JSON dos nós e arestas vai dentro do prompt.
          </p>
        </div>

        <div className="px-6 pt-4 flex flex-col gap-2">
          <span className="text-xs font-medium text-[var(--fg-secondary)] uppercase tracking-wide">O que o Claude deve fazer?</span>
          <div className="flex flex-col gap-1.5">
            <label
              className={
                mode === "flow-update"
                  ? "flex items-start gap-2.5 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--aw-blue-400)] bg-[var(--aw-blue-100)] transition"
                  : "flex items-start gap-2.5 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--border-default)] hover:bg-[var(--bg-muted)] transition"
              }
            >
              <input
                type="radio"
                checked={mode === "flow-update"}
                onChange={() => setMode("flow-update")}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-[var(--fg-primary)]">Atualizar este flow no styleguide</span>
                <span className="text-xs text-[var(--fg-secondary)] leading-snug">
                  Substitui <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--bg-muted)]">NODES</code> e <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--bg-muted)]">EDGES</code> no <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--bg-muted)]">page.tsx</code> deste flow e adiciona entrada em <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--bg-muted)]">updates</code>.
                </span>
              </span>
            </label>

            <label
              className={
                mode === "product-routes"
                  ? "flex items-start gap-2.5 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--aw-blue-400)] bg-[var(--aw-blue-100)] transition"
                  : "flex items-start gap-2.5 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--border-default)] hover:bg-[var(--bg-muted)] transition"
              }
            >
              <input
                type="radio"
                checked={mode === "product-routes"}
                onChange={() => setMode("product-routes")}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-[var(--fg-primary)]">Criar rotas do produto</span>
                <span className="text-xs text-[var(--fg-secondary)] leading-snug">
                  Scaffold <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--bg-muted)]">app/&lt;href&gt;/page.tsx</code> pra cada screen. Decisões não viram página.
                </span>
              </span>
            </label>
          </div>
        </div>

        <details className="px-6 pt-4">
          <summary className="cursor-pointer text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] select-none">
            Preview do prompt
          </summary>
          <pre className="mt-2 text-[10px] leading-relaxed bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[var(--fg-secondary)]">
            {prompt}
          </pre>
        </details>

        <div className="mt-4 p-4 px-6 flex justify-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] transition"
          >
            Fechar
          </button>
          <button
            onClick={copy}
            className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--aw-blue-600)] text-white text-sm font-medium hover:bg-[var(--aw-blue-700)] transition"
          >
            {copied ? "Copiado!" : "Copiar prompt"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * ScreenPreviewDrawer — opens the screen's href in an iframe inside an
 * AwSheet (wide). Clicking a screen card in the diagram opens this. For
 * empty hrefs ("#" or "") shows a "sem protótipo" message. External
 * URLs open in a new tab instead of the iframe.
 * ──────────────────────────────────────────────────────────────────── */

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

function ScreenPreviewDrawer({
  screen,
  onClose,
}: {
  screen: ScreenData | null
  onClose: () => void
}) {
  const open = !!screen
  const href = screen?.href ?? ""
  const hasPrototype = href.length > 0 && href !== "#"
  const external = hasPrototype && isExternal(href)

  return (
    <AwSheet
      open={open}
      onClose={onClose}
      size="wide"
      title={screen?.title ?? ""}
      meta={
        screen ? (
          <span className="flex items-baseline gap-2">
            <span className="aw-eyebrow text-[var(--aw-blue-700)]">{screen.step}</span>
            {hasPrototype && !external && (
              <a
                href={href}
                className="text-xs font-medium text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
              >
                Abrir em página inteira →
              </a>
            )}
          </span>
        ) : undefined
      }
    >
      {!hasPrototype ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-12">
          <p className="m-0 text-sm font-medium text-[var(--fg-primary)]">Sem protótipo ainda</p>
          <p className="m-0 text-sm text-[var(--fg-secondary)] max-w-sm leading-relaxed">
            Essa tela ainda não tem link pra um protótipo navegável. Adicione um href na
            sugestão de edição quando o protótipo existir.
          </p>
        </div>
      ) : external ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-12">
          <p className="m-0 text-sm font-medium text-[var(--fg-primary)]">Link externo</p>
          <p className="m-0 text-sm text-[var(--fg-secondary)] max-w-sm leading-relaxed">
            Esse passo aponta pra um endereço fora da plataforma. Abra em uma nova aba pra ver.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--aw-blue-600)] text-white text-xs font-medium hover:bg-[var(--aw-blue-700)] transition no-underline"
          >
            Abrir em nova aba ↗
          </a>
        </div>
      ) : (
        <div className="w-full h-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-canvas)]">
          <iframe
            key={href}
            src={href}
            title={screen?.title ?? "Pré-visualização"}
            className="block w-full h-full border-0"
          />
        </div>
      )}
    </AwSheet>
  )
}
