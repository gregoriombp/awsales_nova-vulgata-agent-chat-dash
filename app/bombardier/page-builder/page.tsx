"use client"

import * as React from "react"
import Link from "next/link"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import { findFrameOfNode, useBuilder } from "@/lib/bombardier/store"
import AIChat from "./_components/AIChat"
import Canvas from "./_components/Canvas"
import Inspector from "./_components/Inspector"
import Palette from "./_components/Palette"

type DropTarget =
  | { target: "frame-root"; frameId: string }
  | { target: "node"; nodeId: string }
type DragSource =
  | { source: "palette"; type: string }
  | { source: "node"; nodeId: string }

export default function PageBuilderRoute() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const projectName = useBuilder((s) => s.project.name)
  const addNodeAt = useBuilder((s) => s.addNodeAt)
  const moveNode = useBuilder((s) => s.moveNode)
  const reset = useBuilder((s) => s.reset)

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
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/bombardier"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-secondary)] no-underline hover:text-[var(--fg-primary)]"
            >
              <Icon name="arrow_back" size={16} />
              Bombardier
            </Link>
            <span className="text-[var(--fg-tertiary)]">/</span>
            <span className="text-sm font-medium truncate">
              {mounted ? projectName : "Carregando…"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AwButton
              variant="ghost"
              size="sm"
              iconLeft="restart_alt"
              onClick={() => {
                if (
                  window.confirm(
                    "Limpar o projeto? Todas as páginas e componentes serão removidos."
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
              disabled
              title="Salvar em filesystem chega na Fase 2"
            >
              Salvar
            </AwButton>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-[300px_1fr_340px] min-h-0">
          {/* LEFT — component controls */}
          <aside className="border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto flex flex-col">
            <Palette />
            {mounted && <Inspector />}
          </aside>

          {/* CENTER — infinite canvas */}
          <main className="relative overflow-hidden">
            {mounted ? (
              <Canvas />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--fg-tertiary)]">
                Carregando…
              </div>
            )}
          </main>

          {/* RIGHT — AI chat */}
          <aside className="border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto">
            <AIChat />
          </aside>
        </div>
      </div>
    </DndContext>
  )
}
