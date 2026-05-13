"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { AwButton } from "@/components/ui/AwButton"
import {
  PlateCheckpointEditor,
  type CheckpointEditorValue,
  type PlateCheckpointEditorHandle,
} from "@/components/checkpoint-editor/PlateCheckpointEditor"
import { EditorToolbar } from "@/components/checkpoint-editor/EditorToolbar"
import { CheckpointSidebar } from "@/components/checkpoint-editor/CheckpointSidebar"

function AgentStudioCrumbIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M10 4.0625V18.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.25 7.1875L10 10L3.75 7.1875" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function EditCheckpointPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const agentId = params?.id ?? ""

  const editorRef = React.useRef<PlateCheckpointEditorHandle | null>(null)
  const valueRef = React.useRef<CheckpointEditorValue | null>(null)
  const [dirty, setDirty] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const agentLabel = React.useMemo(() => {
    if (!agentId) return "Agente"
    if (agentId.includes("recuperacao") || agentId.includes("recuperação")) {
      return "Agente de recuperação de leads aquecidos"
    }
    return decodeURIComponent(agentId).replace(/-/g, " ")
  }, [agentId])

  const breadcrumbs = [
    {
      label: "Agent studio",
      href: "/agent-studio",
      icon: <AgentStudioCrumbIcon />,
    },
    { label: agentLabel, href: `/agent-studio/${agentId}` },
    "Edição do checkpoint",
  ]

  const handleSave = React.useCallback(async () => {
    setSaving(true)
    try {
      // Persist via storage hook; downstream wiring can replace this.
      if (typeof window !== "undefined" && valueRef.current) {
        const key = `checkpoint:${agentId || "default"}`
        window.localStorage.setItem(key, JSON.stringify(valueRef.current))
      }
      await new Promise((r) => setTimeout(r, 350))
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }, [agentId])

  const handleCancel = React.useCallback(() => {
    router.push(agentId ? `/agent-studio/${agentId}` : "/agent-studio")
  }, [router, agentId])

  const handleInsertTrigger = React.useCallback((trigger: string) => {
    editorRef.current?.insertText(`${trigger} `)
  }, [])

  const handleInsertVariable = React.useCallback((name: string) => {
    editorRef.current?.insertText(`${name} `)
  }, [])

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0">
      <div className="flex min-h-full flex-col bg-bg-surface">
        {/* Header */}
        <header className="border-b border-border-subtle bg-white">
          <div className="mx-auto flex w-full max-w-[1280px] items-start justify-between gap-6 px-6 py-6">
            <div className="min-w-0">
              <h1 className="text-[26px] font-semibold tracking-[-0.3px] text-fg-primary">
                Editando checkpoint
              </h1>
              <p className="mt-1 text-sm text-fg-tertiary">
                Edite o checkpoint e salve as alterações para modificar o agente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AwButton variant="secondary" size="md" onClick={handleCancel}>
                Cancelar
              </AwButton>
              <AwButton
                variant="primary"
                size="md"
                onClick={handleSave}
                loading={saving}
                disabled={!dirty && !saving}
              >
                Salvar checkpoint
              </AwButton>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 gap-6 px-6 py-6">
          {/* Editor column */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <EditorToolbar
              editorRef={editorRef}
              onSave={handleSave}
              saving={saving}
            />
            <div className="rounded-2xl border border-border-subtle bg-white px-7 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <PlateCheckpointEditor
                ref={editorRef}
                onChange={(v) => {
                  valueRef.current = v
                  if (!dirty) setDirty(true)
                }}
                contentClassName="min-h-[1100px]"
              />
            </div>
          </div>

          {/* Sidebar */}
          <CheckpointSidebar
            onInsertTrigger={handleInsertTrigger}
            onInsertVariable={handleInsertVariable}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
