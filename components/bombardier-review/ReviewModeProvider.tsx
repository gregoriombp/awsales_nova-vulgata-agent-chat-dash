"use client"

import * as React from "react"
import { useToast } from "@/components/ui/AwToast"
import { useGlobalHotkey } from "@/lib/hooks/useGlobalHotkey"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { ReviewCanvas } from "./ReviewCanvas"
import { ReviewCommentPopover } from "./ReviewCommentPopover"
import { ReviewCommentSheet } from "./ReviewCommentSheet"
import { ReviewExportModal } from "./ReviewExportModal"
import { ReviewIdentityModal } from "./ReviewIdentityModal"
import { ReviewToolbar } from "./ReviewToolbar"
import { STORAGE_KEYS } from "./constants"
import { safeParseComments } from "./storage/utils"
import type { ReviewExportPayload } from "./types"

export function ReviewModeProvider() {
  const hydrateIdentity = useReviewStore((s) => s.hydrateIdentity)
  const refreshFromStorage = useReviewStore((s) => s.refreshFromStorage)
  const storage = useReviewStore((s) => s.storage)
  const backend = useReviewStore((s) => s.backend)

  const active = useReviewStore((s) => s.active)
  const toggleActive = useReviewStore((s) => s.toggleActive)
  const cycleMode = useReviewStore((s) => s.cycleMode)
  const setMode = useReviewStore((s) => s.setMode)
  const cancelPending = useReviewStore((s) => s.cancelPending)
  const setSheetOpen = useReviewStore((s) => s.setSheetOpen)
  const sheetOpen = useReviewStore((s) => s.sheetOpen)

  const { push } = useToast()
  const migrationPromptedRef = React.useRef(false)

  React.useEffect(() => {
    void hydrateIdentity()
    void refreshFromStorage()
    const unsubscribe = storage.subscribe?.(() => {
      void refreshFromStorage()
    })
    return unsubscribe
  }, [hydrateIdentity, refreshFromStorage, storage])

  React.useEffect(() => {
    if (backend !== "bridge") return
    if (migrationPromptedRef.current) return
    if (typeof window === "undefined") return

    const localComments = safeParseComments(
      window.localStorage.getItem(STORAGE_KEYS.comments)
    )
    if (localComments.length === 0) return

    migrationPromptedRef.current = true
    push({
      title: `${localComments.length} comentário${
        localComments.length === 1 ? "" : "s"
      } no localStorage`,
      description:
        "Quer subir pro review-bridge agora? Os locais ficam preservados até você apagar manualmente.",
      variant: "info",
      duration: 0,
      action: {
        label: "Importar",
        onClick: () => {
          const payload: ReviewExportPayload = {
            schemaVersion: 2,
            exportedAt: Date.now(),
            exportedBy: useReviewStore.getState().identity ?? {
              id: "local",
              name: "Local",
              colorToken: "var(--fg-tertiary)",
              createdAt: 0,
            },
            comments: localComments,
          }
          void storage
            .importMerge(payload)
            .then((result) => {
              push({
                title: "Importado",
                description: `${result.added} novos · ${result.skipped} já existiam.`,
                variant: "success",
              })
              void refreshFromStorage()
            })
            .catch((e) => {
              push({
                title: "Falha ao importar",
                description: e instanceof Error ? e.message : String(e),
                variant: "error",
              })
            })
        },
      },
    })
  }, [backend, push, refreshFromStorage, storage])

  useGlobalHotkey({ key: "y", meta: true, shift: true }, () => toggleActive())

  useGlobalHotkey({ key: "k", meta: true, shift: true }, () => {
    if (!useReviewStore.getState().active) return
    cycleMode()
  })

  React.useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      const state = useReviewStore.getState()
      if (state.pendingAnchor) {
        cancelPending()
        return
      }
      if (state.mode !== "cursor") {
        setMode("cursor")
        return
      }
      if (sheetOpen) {
        setSheetOpen(false)
        return
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, cancelPending, setMode, setSheetOpen, sheetOpen])

  return (
    <>
      <ReviewCanvas />
      <ReviewCommentPopover />
      <ReviewToolbar />
      <ReviewCommentSheet />
      <ReviewIdentityModal />
      <ReviewExportModal />
    </>
  )
}
