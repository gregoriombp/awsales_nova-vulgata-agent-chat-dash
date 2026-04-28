"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { AwButton } from "@/components/ui/AwButton"
import { AwInput } from "@/components/ui/AwInput"
import { Icon } from "@/components/ui/Icon"
import {
  findFrameOfNode,
  findNodeContext,
  useBuilder,
} from "@/lib/bombardier/store"
import Canvas from "./_components/Canvas"
import FloatingCopilot from "./_components/FloatingCopilot"
import Inspector from "./_components/Inspector"
import Palette from "./_components/Palette"

type DropTarget =
  | { target: "frame-root"; frameId: string }
  | { target: "node"; nodeId: string }
type DragSource =
  | { source: "palette"; type: string }
  | { source: "node"; nodeId: string }

function formatRelative(ts: number | null): string {
  if (!ts) return ""
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 5) return "agora"
  if (s < 60) return `há ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m / 60)
  return `há ${h}h`
}

function ProjectNameField() {
  const name = useBuilder((s) => s.project.name)
  const setProjectName = useBuilder((s) => s.setProjectName)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(name)

  React.useEffect(() => {
    if (!editing) setDraft(name)
  }, [name, editing])

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] px-2 py-1 rounded-[var(--radius-sm)] max-w-[280px] truncate"
        title="Renomear projeto"
      >
        <span className="truncate">{name}</span>
        <Icon
          name="edit"
          size={12}
          className="text-[var(--fg-tertiary)] shrink-0"
        />
      </button>
    )
  }
  return (
    <AwInput
      dense
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const next = draft.trim()
        if (next && next !== name) setProjectName(next)
        setEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur()
        }
        if (e.key === "Escape") {
          setDraft(name)
          setEditing(false)
        }
      }}
      className="max-w-[280px]"
    />
  )
}

function SaveIndicator({
  justSaved,
  saveError,
}: {
  justSaved: boolean
  saveError: string | null
}) {
  const lastSavedAt = useBuilder((s) => s.lastSavedAt)
  const isSaving = useBuilder((s) => s.isSaving)
  const [, tick] = React.useReducer((x: number) => x + 1, 0)

  React.useEffect(() => {
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [])

  if (saveError) {
    return (
      <span className="text-[11px] text-[var(--aw-red-600)] inline-flex items-center gap-1">
        <Icon name="error" size={11} />
        Erro ao salvar
      </span>
    )
  }
  if (isSaving)
    return (
      <span className="text-[11px] text-[var(--fg-tertiary)] inline-flex items-center gap-1">
        <Icon name="sync" size={11} className="animate-spin" />
        Salvando…
      </span>
    )
  if (justSaved)
    return (
      <span className="text-[11px] text-[var(--aw-emerald-700)] inline-flex items-center gap-1 font-medium">
        <Icon name="check_circle" size={11} />
        Salvo
      </span>
    )
  if (lastSavedAt) {
    return (
      <span className="text-[11px] text-[var(--fg-tertiary)]">
        Salvo {formatRelative(lastSavedAt)}
      </span>
    )
  }
  return (
    <span className="text-[11px] text-[var(--aw-amber-700)]">Não salvo</span>
  )
}

function PageBuilderContent() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const router = useRouter()
  const searchParams = useSearchParams()

  const addNodeAt = useBuilder((s) => s.addNodeAt)
  const moveNode = useBuilder((s) => s.moveNode)
  const reset = useBuilder((s) => s.reset)
  const saveProject = useBuilder((s) => s.saveProject)
  const loadProject = useBuilder((s) => s.loadProject)
  const isSaving = useBuilder((s) => s.isSaving)

  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [justSaved, setJustSaved] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const onSave = async () => {
    setSaveError(null)
    const result = await saveProject()
    if (!result.ok) {
      setSaveError(result.error)
    } else {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    }
  }

  // Handle ?load=<slug> and ?new=1
  React.useEffect(() => {
    if (!mounted) return
    const loadSlug = searchParams.get("load")
    const isNew = searchParams.get("new")
    if (loadSlug) {
      loadProject(loadSlug).then((r) => {
        if (!r.ok) setLoadError(r.error ?? "Falha ao carregar")
        router.replace("/bombardier/page-builder")
      })
    } else if (isNew === "1") {
      reset()
      router.replace("/bombardier/page-builder")
    }
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Clipboard toast + keyboard shortcuts (copy/paste/duplicate)
  const [clipToast, setClipToast] = React.useState<string | null>(null)
  const clipToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const showClipToast = React.useCallback((msg: string) => {
    setClipToast(msg)
    if (clipToastTimer.current) clearTimeout(clipToastTimer.current)
    clipToastTimer.current = setTimeout(() => setClipToast(null), 1600)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    const isInputLike = (el: Element | null): boolean => {
      if (!el) return false
      const tag = el.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
      const html = el as HTMLElement
      if (html.isContentEditable) return true
      return false
    }

    const onKey = async (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (isInputLike(document.activeElement)) return

      const key = e.key.toLowerCase()
      const state = useBuilder.getState()
      const { selectedNodeId, selectedFrameId, project } = state

      if (key === "c") {
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) return
        if (!selectedNodeId) return
        const ctx = findNodeContext(project, selectedNodeId)
        if (!ctx) return
        e.preventDefault()
        const payload = JSON.stringify({
          kind: "bombardier.node",
          version: 1,
          node: ctx.node,
        })
        try {
          await navigator.clipboard.writeText(payload)
          showClipToast(`Copiado: ${ctx.node.type}`)
        } catch {
          showClipToast("Falha ao copiar")
        }
        return
      }

      if (key === "v") {
        const targetFrameId = selectedFrameId ?? project.pages[0]?.id ?? null
        if (!targetFrameId) {
          showClipToast("Crie uma página antes")
          return
        }
        let parentId: string | "root" = "root"
        if (selectedNodeId) {
          const ctx = findNodeContext(project, selectedNodeId)
          if (ctx && ctx.node.children !== undefined) {
            parentId = ctx.node.id
          }
        }
        e.preventDefault()
        let text = ""
        try {
          text = await navigator.clipboard.readText()
        } catch {
          showClipToast("Sem permissão de clipboard")
          return
        }
        if (!text.trim()) {
          showClipToast("Clipboard vazio")
          return
        }
        try {
          const parsed = JSON.parse(text)
          if (
            parsed &&
            typeof parsed === "object" &&
            parsed.kind === "bombardier.node" &&
            parsed.node &&
            typeof parsed.node === "object"
          ) {
            const count = state.applyGeneratedNodes(
              targetFrameId,
              [parsed.node],
              parentId
            )
            showClipToast(
              count > 0 ? `Colado: ${parsed.node.type}` : "Nada colado"
            )
            return
          }
        } catch {
          /* fall through to text */
        }
        // Plain text → cria nó de texto
        const content = text.length > 8000 ? text.slice(0, 8000) : text
        state.applyGeneratedNodes(
          targetFrameId,
          [
            {
              type: "text",
              props: {
                content,
                size: "md",
                tone: "primary",
                align: "left",
                weight: "normal",
              },
            },
          ],
          parentId
        )
        showClipToast("Texto colado")
        return
      }

      if (key === "d") {
        if (!selectedNodeId) return
        e.preventDefault()
        state.duplicateNode(selectedNodeId)
        showClipToast("Duplicado")
        return
      }
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [mounted, showClipToast])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const src = active.data.current as DragSource | undefined
    const tgt = over.data.current as DropTarget | undefined
    if (!src || !tgt) return

    if (src.source === "palette") {
      if (tgt.target === "frame-root") {
        addNodeAt(src.type, tgt.frameId, "root")
        return
      }
      if (tgt.target === "node") {
        const project = useBuilder.getState().project
        const frame = findFrameOfNode(project, tgt.nodeId)
        if (frame) addNodeAt(src.type, frame.id, tgt.nodeId)
        return
      }
    }

    if (src.source === "node") {
      if (src.nodeId === (tgt as { nodeId?: string }).nodeId) return
      if (tgt.target === "frame-root") {
        moveNode(src.nodeId, tgt.frameId, "root")
        return
      }
      if (tgt.target === "node") {
        const project = useBuilder.getState().project
        const frame = findFrameOfNode(project, tgt.nodeId)
        if (frame) moveNode(src.nodeId, frame.id, tgt.nodeId)
        return
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--fg-primary)]">
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] z-30">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/bombardier"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-secondary)] no-underline hover:text-[var(--fg-primary)]"
            >
              <Icon name="arrow_back" size={16} />
              Bombardier
            </Link>
            <span className="text-[var(--fg-tertiary)]">/</span>
            <Link
              href="/bombardier/projects"
              className="text-sm text-[var(--fg-secondary)] no-underline hover:text-[var(--fg-primary)]"
            >
              Projetos
            </Link>
            <span className="text-[var(--fg-tertiary)]">/</span>
            {mounted ? (
              <ProjectNameField />
            ) : (
              <span className="text-sm text-[var(--fg-tertiary)]">
                Carregando…
              </span>
            )}
            {mounted && (
              <SaveIndicator justSaved={justSaved} saveError={saveError} />
            )}
            {loadError && (
              <span className="text-[11px] text-[var(--aw-red-600)] ml-2">
                {loadError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/bombardier/projects">
              <AwButton variant="ghost" size="sm" iconLeft="folder_open">
                Projetos
              </AwButton>
            </Link>
            <AwButton
              variant="ghost"
              size="sm"
              iconLeft="restart_alt"
              onClick={() => {
                if (
                  window.confirm(
                    "Limpar o projeto? Todas as páginas e componentes atuais serão removidos."
                  )
                )
                  reset()
              }}
            >
              Limpar
            </AwButton>
            <AwButton
              variant="primary"
              size="sm"
              iconLeft="save"
              loading={isSaving}
              onClick={onSave}
            >
              Salvar
            </AwButton>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-[260px_1fr_320px] min-h-0">
          {/* LEFT — palette only */}
          <aside className="border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto">
            <Palette />
          </aside>

          {/* CENTER — infinite canvas with floating AI */}
          <main className="relative overflow-hidden">
            {mounted ? (
              <>
                <Canvas />
                <FloatingCopilot />
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--fg-tertiary)]">
                Carregando…
              </div>
            )}
          </main>

          {/* RIGHT — style inspector */}
          <aside className="border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto flex flex-col">
            {mounted && <Inspector />}
          </aside>
        </div>

        {clipToast && (
          <div
            role="status"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] px-4 py-2 rounded-full shadow-lg text-sm pointer-events-none flex items-center gap-2"
          >
            <Icon name="content_copy" size={14} />
            {clipToast}
          </div>
        )}
      </div>
    </DndContext>
  )
}

export default function PageBuilderRoute() {
  return (
    <React.Suspense fallback={null}>
      <PageBuilderContent />
    </React.Suspense>
  )
}
